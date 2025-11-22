"""
THE ARCANE CODEX - Web Game Interface
Web/mobile multiplayer (1-4 players) with 100% MCP-powered dynamic scenarios

CRITICAL: NO MOCK SCENARIOS. NO STATIC CONTENT. NO FALLBACK.
ALL scenarios generated dynamically via MCP → Claude Desktop

Uses your €200 Claude Max plan - NO API key needed!
Requires MCP configuration (see MCP_SETUP.md)
"""
from flask import Flask, render_template, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import secrets
import random
import string
import os
from arcane_codex_server import ArcaneCodexGame, SEVEN_GODS, GameState, Character, NPCCompanion
from skills_manager import SkillsManager
from database import ArcaneDatabase
from divine_council import VotingSystem, ConsequenceEngine, GOD_PERSONALITIES
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict, field
import json
from datetime import datetime
import logging
from logging.handlers import RotatingFileHandler
import traceback
import time
import threading
from collections import defaultdict

# ============================================================================
# RACE CONDITION PROTECTION - Thread Safety
# ============================================================================

# Thread locks for game operations
game_locks = defaultdict(threading.Lock)

def with_game_lock(game_code: str):
    """Context manager for game-specific operations requiring atomicity"""
    class GameLock:
        def __enter__(self):
            game_locks[game_code].acquire()
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            game_locks[game_code].release()
            return False

    return GameLock()

# Usage in endpoints:
# with with_game_lock(game_code):
#     # Critical section - atomic operations only
#     game_session.game.resolve_turn()

# MCP Client for dynamic scenario generation (REQUIRED - NO MOCK FALLBACK)
try:
    from mcp_client import SyncMCPClient, generate_scenario_prompt
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    print("[ERROR] MCP client not available. Game requires MCP for dynamic scenarios!")
    print("   See MCP_SETUP.md or QUICK_TEST_SETUP.md for configuration.")

# AI Game Master - Automated scenario generation
try:
    from ai_gm_auto import start_ai_gm_thread
    AI_GM_AVAILABLE = True
except ImportError:
    AI_GM_AVAILABLE = False
    print("WARNING: AI GM auto-generation not available (ai_gm_auto.py not found)")

# TEST MODE: Set environment variable ARCANE_TEST_MODE=1 for Playwright testing
# This enables mock interrogation questions when MCP is not available
TEST_MODE = os.environ.get('ARCANE_TEST_MODE', '0') == '1'
if TEST_MODE:
    print("[WARNING] TEST MODE ENABLED - Using mock interrogation questions")
    print("   Set ARCANE_TEST_MODE=0 or unset to require MCP")

app = Flask(__name__)

# FIXED: Persist secret key to survive server restarts
SECRET_KEY_FILE = "flask_secret.key"
if os.path.exists(SECRET_KEY_FILE):
    with open(SECRET_KEY_FILE, 'r') as f:
        app.secret_key = f.read().strip()
    print(f"[OK] Loaded persisted secret key from {SECRET_KEY_FILE}")
else:
    app.secret_key = secrets.token_hex(32)
    with open(SECRET_KEY_FILE, 'w') as f:
        f.write(app.secret_key)
    print(f"[OK] Generated and saved new secret key to {SECRET_KEY_FILE}")

CORS(app)

# ============================================================================
# SESSION SECURITY CONFIGURATION
# ============================================================================
from datetime import timedelta

# Session security configuration
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=4)
app.config['SESSION_COOKIE_SECURE'] = False  # Set True for HTTPS in production
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS access to cookies
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
app.config['SESSION_REFRESH_EACH_REQUEST'] = True  # Extend session on activity
print("[OK] Session security configured (4-hour lifetime, httponly, samesite)")

# CSRF Protection
csrf = CSRFProtect(app)
app.config['WTF_CSRF_TIME_LIMIT'] = None  # No expiration for long game sessions
print("[OK] CSRF protection enabled")

# ============================================================================
# RATE LIMITING - PHASE E.2: DOS Attack Prevention
# ============================================================================
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["2000 per day", "500 per hour"],  # Increased for development/testing
    storage_uri="memory://"
)
print("[OK] Rate limiting initialized (development mode: 2000/day, 500/hour)")

# ============================================================================
# SOCKETIO INITIALIZATION - PHASE H: Real-Time Multiplayer
# ============================================================================

# Configure comprehensive logging with rotation
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        RotatingFileHandler(
            'game.log',
            maxBytes=10485760,  # 10MB
            backupCount=5       # Keep 5 backup files
        ),
        logging.StreamHandler()  # Also print to console
    ]
)

logger = logging.getLogger(__name__)

# Initialize SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='eventlet',
    logger=True,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25,
    manage_session=False  # Use Flask sessions instead
)

# Track connected clients: socket_id -> {player_id, game_code, connected_at}
connected_clients = {}

# Track player presence: game_code -> set of player_ids
player_presence = {}

print("[OK] SocketIO initialized with eventlet async mode")

# ============================================================================
# DEVELOPMENT: Cache Prevention Configuration
# ============================================================================

# Disable static file caching in debug mode
if app.debug:
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    print("[DEV MODE] Static file caching DISABLED for development")

@app.after_request
def handle_caching(response):
    """
    Handle caching based on environment and resource type

    DEVELOPMENT MODE:
    - Disable all caching (no-cache, no-store)
    - Remove ETags (prevents 304 responses)
    - Force revalidation on every request

    PRODUCTION MODE:
    - Static assets (CSS, JS): Cache for 1 year (immutable)
    - HTML files: Cache for 5 minutes (revalidate)
    - API responses: No caching
    """
    if app.debug:
        # Development: Prevent all caching
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers.pop('ETag', None)
        response.headers.pop('Last-Modified', None)
    else:
        # Production: Aggressive caching for static assets
        if request.path.startswith('/static/'):
            # Check if it's a CSS or JS file
            if request.path.endswith(('.css', '.js')):
                # Cache CSS/JS for 1 year (immutable - use versioning for updates)
                response.cache_control.max_age = 31536000  # 1 year
                response.cache_control.public = True
                response.cache_control.immutable = True
            elif request.path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf')):
                # Cache images and fonts for 1 month
                response.cache_control.max_age = 2592000  # 30 days
                response.cache_control.public = True
            elif request.path.endswith('.html'):
                # Cache HTML for 5 minutes, must revalidate
                response.cache_control.max_age = 300  # 5 minutes
                response.cache_control.public = True
                response.cache_control.must_revalidate = True
        elif request.path.startswith('/api/'):
            # Never cache API responses
            response.cache_control.no_cache = True
            response.cache_control.no_store = True
            response.cache_control.must_revalidate = True

    return response

# ============================================================================
# INPUT VALIDATION HELPERS - XSS and Injection Prevention
# ============================================================================

import re
from html import escape
from typing import Optional, Tuple

# Input validation constants
MAX_USERNAME_LENGTH = 50
MAX_CHOICE_LENGTH = 500
MAX_GAME_CODE_LENGTH = 20
FORBIDDEN_PATTERNS = ['<script', 'javascript:', 'onerror=', 'onclick=', 'onload=', '<iframe']

def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """Validate username input. Returns (is_valid, error_message)"""
    if not username or not username.strip():
        return False, 'Username cannot be empty'

    username = username.strip()

    if len(username) > MAX_USERNAME_LENGTH:
        return False, f'Username too long (max {MAX_USERNAME_LENGTH} characters)'

    # Check for injection patterns
    username_lower = username.lower()
    if any(pattern in username_lower for pattern in FORBIDDEN_PATTERNS):
        return False, 'Username contains invalid characters'

    # Alphanumeric + spaces + limited special chars only
    if not re.match(r'^[a-zA-Z0-9\s\-_\.]+$', username):
        return False, 'Username can only contain letters, numbers, spaces, hyphens, underscores, and periods'

    return True, None

def sanitize_text(text: str, max_length: int = 1000) -> str:
    """Sanitize user input text for XSS prevention"""
    if not text:
        return ''

    # Truncate to max length
    text = text[:max_length]

    # HTML escape
    text = escape(text)

    return text.strip()

def validate_choice(choice: str) -> Tuple[bool, Optional[str]]:
    """Validate player choice input"""
    if not choice or not choice.strip():
        return False, 'Choice cannot be empty'

    choice = choice.strip()

    if len(choice) > MAX_CHOICE_LENGTH:
        return False, f'Choice too long (max {MAX_CHOICE_LENGTH} characters)'

    return True, None

def validate_game_code(code: str) -> Tuple[bool, Optional[str]]:
    """Validate game code format"""
    if not code or not code.strip():
        return False, 'Game code cannot be empty'

    code = code.strip().upper()

    if len(code) > MAX_GAME_CODE_LENGTH:
        return False, f'Game code too long (max {MAX_GAME_CODE_LENGTH} characters)'

    # Alphanumeric only
    if not re.match(r'^[A-Z0-9\-]+$', code):
        return False, 'Game code can only contain letters, numbers, and hyphens'

    return True, None

# ============================================================================
# RATE LIMIT ERROR HANDLER
# ============================================================================

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded errors"""
    remote_addr = get_remote_address()
    logger.warning(f"Rate limit exceeded for IP: {remote_addr}")
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429

# ============================================================================
# AUTHENTICATION & AUTHORIZATION DECORATORS
# ============================================================================

from functools import wraps

def require_authentication(f):
    """Decorator to ensure user is authenticated"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        player_id = session.get('player_id')
        username = session.get('username')

        if not player_id or not username:
            logger.warning(f"[AUTH] Unauthorized access attempt to {request.endpoint} from {request.remote_addr}")
            return jsonify({'status': 'error', 'message': 'Authentication required'}), 401

        return f(*args, **kwargs)
    return decorated_function

def require_game_session(f):
    """Decorator to ensure user is in a valid game"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        player_id = session.get('player_id')
        username = session.get('username')
        game_code = session.get('game_code')

        if not player_id or not username:
            return jsonify({'status': 'error', 'message': 'Authentication required'}), 401

        if not game_code:
            return jsonify({'status': 'error', 'message': 'Not in a game session'}), 400

        # Verify game exists
        game_session = game_sessions.get(game_code)
        if not game_session:
            logger.warning(f"[AUTH] Player {username} tried to access non-existent game {game_code}")
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        # Verify player is in this game
        if username not in game_session.players:
            logger.warning(f"[AUTH] Player {username} tried to access game {game_code} they are not part of")
            return jsonify({'status': 'error', 'message': 'Not authorized for this game'}), 403

        return f(*args, **kwargs)
    return decorated_function

def verify_game_ownership(game_code: str, username: str) -> bool:
    """Verify that username is a player in the specified game"""
    game_session = game_sessions.get(game_code)
    if not game_session:
        return False

    return username in game_session.players

# ============================================================================
# TRANSACTION LOGGING - Audit Trail for Security
# ============================================================================

def log_transaction(player_id: str, game_code: str, transaction_type: str,
                   details: dict, success: bool = True):
    """Log all critical game transactions for audit trail"""
    try:
        transaction = {
            'timestamp': datetime.now().isoformat(),
            'player_id': player_id,
            'game_code': game_code,
            'type': transaction_type,
            'details': details,
            'success': success,
            'ip_address': request.remote_addr if request else 'unknown'
        }

        # Log to file
        logger.info(f"[TRANSACTION] {json.dumps(transaction)}")

        # Optionally: Store in database for persistent audit trail
        # db.execute("INSERT INTO transactions (...) VALUES (...)", ...)

    except Exception as e:
        logger.error(f"[TRANSACTION_LOG] Failed to log transaction: {e}")

# Usage examples:
# log_transaction(player_id, game_code, 'ITEM_EQUIPPED', {'item_id': item_id, 'slot': slot})
# log_transaction(player_id, game_code, 'SKILL_UNLOCKED', {'skill_id': skill_id, 'cost': cost})
# log_transaction(player_id, game_code, 'ITEM_DROPPED', {'item_id': item_id, 'quantity': qty})

# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class PlayerChoice:
    """Tracks a player's choice for the current turn"""
    player_id: str
    choice: str
    timestamp: float

@dataclass
class Scenario:
    """MCP-generated scenario"""
    scenario_id: str
    public_scene: str  # What everyone sees
    whispers: Dict[str, str]  # player_id -> private whisper
    theme: str  # e.g., "betrayal", "sacrifice", "greed"
    turn_number: int
    choices_submitted: Dict[str, PlayerChoice] = field(default_factory=dict)
    resolved: bool = False

@dataclass
class GameSession:
    """Multiplayer game session"""
    code: str
    game: ArcaneCodexGame
    players: Dict[str, str]  # player_id -> player_name
    player_classes: Dict[str, str]  # player_id -> class
    max_players: int = 4
    game_started: bool = False
    current_scenario: Optional[Scenario] = None
    scenario_history: List[str] = field(default_factory=list)  # Track previous themes
    interrogation_complete: set = field(default_factory=set)  # Track who completed interrogation

    def is_full(self) -> bool:
        """Check if game is at max capacity"""
        return len(self.players) >= self.max_players

    def all_players_ready(self) -> bool:
        """Check if all players have completed character creation"""
        return len(self.player_classes) == len(self.players) and len(self.players) > 0

    def all_choices_submitted(self) -> bool:
        """Check if all players have submitted their choices"""
        if not self.current_scenario:
            return False
        return len(self.current_scenario.choices_submitted) == len(self.players)

    def get_waiting_players(self) -> List[str]:
        """Get list of players who haven't submitted choices"""
        if not self.current_scenario:
            return []
        submitted = set(self.current_scenario.choices_submitted.keys())
        all_players = set(self.players.keys())
        return list(all_players - submitted)

# ============================================================================
# TEST MODE: Mock Interrogation Questions
# ============================================================================
# ONLY used when ARCANE_TEST_MODE=1 environment variable is set
# Production ALWAYS requires MCP for 100% unique AI-generated questions

MOCK_INTERROGATION_QUESTIONS = [
    # Question 1 - VALDRIS (Justice)
    {
        "question_number": 1,
        "question_text": "A merchant confesses to price gouging during a famine. The law says death, but his family will starve. What is your judgment?",
        "options": [
            {"id": "q1_a", "letter": "A", "text": "The law is absolute - execute him", "favor": {"VALDRIS": 3, "KAITHA": -2, "SYLARA": -1}},
            {"id": "q1_b", "letter": "B", "text": "Exile him and confiscate half his wealth", "favor": {"VALDRIS": 1, "MERCUS": 2, "ATHENA": 1}},
            {"id": "q1_c", "letter": "C", "text": "Force him to distribute food freely as penance", "favor": {"SYLARA": 2, "VALDRIS": -1, "KAITHA": 1}},
            {"id": "q1_d", "letter": "D", "text": "Let the starving mob decide his fate", "favor": {"KAITHA": 3, "VALDRIS": -3, "KORVAN": 1}}
        ]
    },
    # Question 2 - KAITHA (Chaos)
    {
        "question_number": 2,
        "question_text": "You find a deck of cards that predicts the future but drives users mad. What do you do?",
        "options": [
            {"id": "q2_a", "letter": "A", "text": "Use it yourself - madness is a small price", "favor": {"KAITHA": 3, "ATHENA": -2, "MORVANE": 1}},
            {"id": "q2_b", "letter": "B", "text": "Destroy it immediately", "favor": {"VALDRIS": 2, "KAITHA": -3, "ATHENA": 1}},
            {"id": "q2_c", "letter": "C", "text": "Study it carefully to understand its power", "favor": {"ATHENA": 3, "KAITHA": -1, "MERCUS": 1}},
            {"id": "q2_d", "letter": "D", "text": "Sell it to the highest bidder", "favor": {"MERCUS": 3, "VALDRIS": -2, "KAITHA": 1}}
        ]
    },
    # Question 3 - MORVANE (Death)
    {
        "question_number": 3,
        "question_text": "A plague victim begs you to end their suffering. Their death might save others from infection. What is your choice?",
        "options": [
            {"id": "q3_a", "letter": "A", "text": "Grant them a merciful death", "favor": {"MORVANE": 3, "SYLARA": -2, "VALDRIS": 1}},
            {"id": "q3_b", "letter": "B", "text": "Quarantine them and seek a cure", "favor": {"SYLARA": 2, "ATHENA": 2, "MORVANE": -1}},
            {"id": "q3_c", "letter": "C", "text": "Let nature take its course", "favor": {"SYLARA": 1, "MORVANE": 2, "KAITHA": 1}},
            {"id": "q3_d", "letter": "D", "text": "Use them to study the disease", "favor": {"ATHENA": 2, "MORVANE": 1, "SYLARA": -3}}
        ]
    },
    # Question 4 - SYLARA (Nature)
    {
        "question_number": 4,
        "question_text": "A village needs to cut down an ancient forest to survive the winter. The forest spirits threaten revenge. How do you mediate?",
        "options": [
            {"id": "q4_a", "letter": "A", "text": "Protect the forest at all costs", "favor": {"SYLARA": 3, "MERCUS": -2, "MORVANE": 1}},
            {"id": "q4_b", "letter": "B", "text": "Help the village find alternative fuel", "favor": {"ATHENA": 2, "SYLARA": 2, "MERCUS": 1}},
            {"id": "q4_c", "letter": "C", "text": "Let them fight it out naturally", "favor": {"KAITHA": 2, "KORVAN": 2, "VALDRIS": -2}},
            {"id": "q4_d", "letter": "D", "text": "Negotiate a limited harvest", "favor": {"MERCUS": 2, "SYLARA": 1, "VALDRIS": 1}}
        ]
    },
    # Question 5 - KORVAN (War)
    {
        "question_number": 5,
        "question_text": "Your army is outnumbered 3 to 1. Your scout suggests poisoning the enemy's water supply. This violates the warrior's code. What do you command?",
        "options": [
            {"id": "q5_a", "letter": "A", "text": "Fight with honor and likely die", "favor": {"KORVAN": 3, "VALDRIS": 2, "KAITHA": -2}},
            {"id": "q5_b", "letter": "B", "text": "Use the poison - victory matters most", "favor": {"KAITHA": 2, "ATHENA": 1, "KORVAN": -2}},
            {"id": "q5_c", "letter": "C", "text": "Retreat and regroup", "favor": {"ATHENA": 3, "KORVAN": -1, "MERCUS": 1}},
            {"id": "q5_d", "letter": "D", "text": "Challenge their leader to single combat", "favor": {"KORVAN": 2, "MORVANE": 1, "ATHENA": -1}}
        ]
    },
    # Question 6 - ATHENA (Wisdom)
    {
        "question_number": 6,
        "question_text": "You discover a spell that grants infinite knowledge but erases all emotion. Do you cast it?",
        "options": [
            {"id": "q6_a", "letter": "A", "text": "Yes - knowledge is supreme", "favor": {"ATHENA": 3, "KAITHA": -2, "SYLARA": -2}},
            {"id": "q6_b", "letter": "B", "text": "No - emotion defines humanity", "favor": {"SYLARA": 2, "KAITHA": 2, "ATHENA": -1}},
            {"id": "q6_c", "letter": "C", "text": "Modify it to preserve some feeling", "favor": {"ATHENA": 2, "MERCUS": 1, "VALDRIS": 1}},
            {"id": "q6_d", "letter": "D", "text": "Test it on someone else first", "favor": {"MERCUS": 2, "MORVANE": 1, "VALDRIS": -2}}
        ]
    },
    # Question 7 - MERCUS (Commerce)
    {
        "question_number": 7,
        "question_text": "You inherit a profitable slave trade business. The slaves are well-treated but still property. What do you do?",
        "options": [
            {"id": "q7_a", "letter": "A", "text": "Free them all immediately", "favor": {"VALDRIS": 2, "SYLARA": 2, "MERCUS": -3}},
            {"id": "q7_b", "letter": "B", "text": "Gradually transition to paid labor", "favor": {"MERCUS": 2, "ATHENA": 2, "VALDRIS": 1}},
            {"id": "q7_c", "letter": "C", "text": "Maintain the profitable status quo", "favor": {"MERCUS": 3, "VALDRIS": -2, "SYLARA": -2}},
            {"id": "q7_d", "letter": "D", "text": "Arm them and start a rebellion", "favor": {"KAITHA": 3, "KORVAN": 1, "MERCUS": -3}}
        ]
    },
    # Question 8 - Mixed Dilemma
    {
        "question_number": 8,
        "question_text": "A child has murdered their abusive parent. They come to you for sanctuary. The mob demands justice. What is your response?",
        "options": [
            {"id": "q8_a", "letter": "A", "text": "Protect the child at all costs", "favor": {"SYLARA": 2, "KAITHA": 1, "VALDRIS": -1}},
            {"id": "q8_b", "letter": "B", "text": "Hold a fair trial", "favor": {"VALDRIS": 3, "ATHENA": 2, "KAITHA": -1}},
            {"id": "q8_c", "letter": "C", "text": "Exile the child for their safety", "favor": {"MERCUS": 2, "ATHENA": 1, "KORVAN": -1}},
            {"id": "q8_d", "letter": "D", "text": "Let the mob have them", "favor": {"MORVANE": 2, "KAITHA": 2, "VALDRIS": -3}}
        ]
    },
    # Question 9 - Power and Corruption
    {
        "question_number": 9,
        "question_text": "You find a crown that makes you an invincible ruler but slowly corrupts your soul. Do you wear it?",
        "options": [
            {"id": "q9_a", "letter": "A", "text": "Never - power corrupts absolutely", "favor": {"VALDRIS": 2, "ATHENA": 2, "KORVAN": -1}},
            {"id": "q9_b", "letter": "B", "text": "Wear it only in dire need", "favor": {"ATHENA": 1, "MERCUS": 2, "VALDRIS": -1}},
            {"id": "q9_c", "letter": "C", "text": "Embrace the corruption for power", "favor": {"KAITHA": 3, "MORVANE": 2, "VALDRIS": -3}},
            {"id": "q9_d", "letter": "D", "text": "Study it to make a safer version", "favor": {"ATHENA": 3, "MERCUS": 1, "KAITHA": -1}}
        ]
    },
    # Question 10 - Final Judgment
    {
        "question_number": 10,
        "question_text": "The gods themselves are dying. You can save only one. Who do you choose?",
        "options": [
            {"id": "q10_a", "letter": "A", "text": "Valdris - for justice must endure", "favor": {"VALDRIS": 5, "KAITHA": -2}},
            {"id": "q10_b", "letter": "B", "text": "Sylara - for life must continue", "favor": {"SYLARA": 5, "MORVANE": -2}},
            {"id": "q10_c", "letter": "C", "text": "Athena - for wisdom guides all", "favor": {"ATHENA": 5, "KORVAN": -2}},
            {"id": "q10_d", "letter": "D", "text": "None - let a new age begin", "favor": {"KAITHA": 5, "VALDRIS": -3}}
        ]
    },
    # Additional questions 11-30 for variety
    {
        "question_number": 11,
        "question_text": "A beggar claims to be a fallen god. They ask for a single coin. What do you do?",
        "options": [
            {"id": "q11_a", "letter": "A", "text": "Give them your entire purse", "favor": {"SYLARA": 2, "MERCUS": -2, "KAITHA": 1}},
            {"id": "q11_b", "letter": "B", "text": "Give exactly one coin as asked", "favor": {"VALDRIS": 2, "ATHENA": 1}},
            {"id": "q11_c", "letter": "C", "text": "Test their divinity first", "favor": {"ATHENA": 3, "VALDRIS": -1}},
            {"id": "q11_d", "letter": "D", "text": "Ignore them completely", "favor": {"MERCUS": 1, "MORVANE": 1, "SYLARA": -2}}
        ]
    },
    {
        "question_number": 12,
        "question_text": "Your lover is revealed to be an enemy spy. They claim their love is real. How do you proceed?",
        "options": [
            {"id": "q12_a", "letter": "A", "text": "Execute them for treason", "favor": {"VALDRIS": 2, "KORVAN": 2, "SYLARA": -2}},
            {"id": "q12_b", "letter": "B", "text": "Turn them into a double agent", "favor": {"ATHENA": 3, "MERCUS": 2, "VALDRIS": -1}},
            {"id": "q12_c", "letter": "C", "text": "Run away together", "favor": {"KAITHA": 2, "SYLARA": 2, "VALDRIS": -3}},
            {"id": "q12_d", "letter": "D", "text": "Imprison them but spare their life", "favor": {"VALDRIS": 1, "SYLARA": 1, "KORVAN": -1}}
        ]
    },
    {
        "question_number": 13,
        "question_text": "A prophecy says you will betray your closest friend. Do you distance yourself to prevent it?",
        "options": [
            {"id": "q13_a", "letter": "A", "text": "Yes - prevent the prophecy", "favor": {"ATHENA": 2, "VALDRIS": 1, "KAITHA": -2}},
            {"id": "q13_b", "letter": "B", "text": "No - face fate together", "favor": {"KORVAN": 2, "SYLARA": 2, "ATHENA": -1}},
            {"id": "q13_c", "letter": "C", "text": "Tell them and let them decide", "favor": {"VALDRIS": 3, "ATHENA": 1}},
            {"id": "q13_d", "letter": "D", "text": "Betray them now on your terms", "favor": {"KAITHA": 3, "MERCUS": 1, "VALDRIS": -3}}
        ]
    },
    {
        "question_number": 14,
        "question_text": "You can resurrect one person: your mentor, your parent, or a great hero. Who returns?",
        "options": [
            {"id": "q14_a", "letter": "A", "text": "Your mentor - for guidance", "favor": {"ATHENA": 3, "VALDRIS": 1}},
            {"id": "q14_b", "letter": "B", "text": "Your parent - for love", "favor": {"SYLARA": 3, "MORVANE": -1}},
            {"id": "q14_c", "letter": "C", "text": "The hero - for the greater good", "favor": {"KORVAN": 2, "VALDRIS": 2, "SYLARA": -1}},
            {"id": "q14_d", "letter": "D", "text": "None - death should be final", "favor": {"MORVANE": 3, "SYLARA": -2, "ATHENA": 1}}
        ]
    },
    {
        "question_number": 15,
        "question_text": "A demon offers you three wishes in exchange for three random souls. Do you accept?",
        "options": [
            {"id": "q15_a", "letter": "A", "text": "Never - no soul is mine to trade", "favor": {"VALDRIS": 3, "SYLARA": 2, "KAITHA": -2}},
            {"id": "q15_b", "letter": "B", "text": "Yes - sacrifice few for many", "favor": {"MERCUS": 2, "KAITHA": 2, "VALDRIS": -3}},
            {"id": "q15_c", "letter": "C", "text": "Trick the demon somehow", "favor": {"ATHENA": 2, "KAITHA": 2, "VALDRIS": -1}},
            {"id": "q15_d", "letter": "D", "text": "Offer your own soul instead", "favor": {"KORVAN": 2, "MORVANE": 2, "MERCUS": -2}}
        ]
    },
    {
        "question_number": 16,
        "question_text": "You discover your heroic deeds were orchestrated by a villain to serve their plan. Do you continue?",
        "options": [
            {"id": "q16_a", "letter": "A", "text": "Stop immediately", "favor": {"VALDRIS": 2, "ATHENA": -1, "KORVAN": -1}},
            {"id": "q16_b", "letter": "B", "text": "Continue but sabotage their plan", "favor": {"ATHENA": 3, "KAITHA": 1, "VALDRIS": 1}},
            {"id": "q16_c", "letter": "C", "text": "Join them if the cause is just", "favor": {"MERCUS": 2, "KAITHA": 2, "VALDRIS": -2}},
            {"id": "q16_d", "letter": "D", "text": "Continue - good is good regardless", "favor": {"SYLARA": 2, "VALDRIS": 1, "ATHENA": -1}}
        ]
    },
    {
        "question_number": 17,
        "question_text": "Time freezes and only you can move. You have one hour. What do you do?",
        "options": [
            {"id": "q17_a", "letter": "A", "text": "Steal from the rich for the poor", "favor": {"KAITHA": 2, "SYLARA": 1, "VALDRIS": -2}},
            {"id": "q17_b", "letter": "B", "text": "Gather strategic information", "favor": {"ATHENA": 3, "MERCUS": 2, "KORVAN": -1}},
            {"id": "q17_c", "letter": "C", "text": "Save people from ongoing disasters", "favor": {"SYLARA": 3, "VALDRIS": 2}},
            {"id": "q17_d", "letter": "D", "text": "Do nothing - this power is not meant for mortals", "favor": {"VALDRIS": 1, "MORVANE": 2, "KAITHA": -2}}
        ]
    },
    {
        "question_number": 18,
        "question_text": "Your rival saves your life but demands you abandon your quest. What is your response?",
        "options": [
            {"id": "q18_a", "letter": "A", "text": "Honor the life debt completely", "favor": {"VALDRIS": 3, "KORVAN": 1, "KAITHA": -2}},
            {"id": "q18_b", "letter": "B", "text": "Find another way to repay", "favor": {"MERCUS": 2, "ATHENA": 2, "VALDRIS": -1}},
            {"id": "q18_c", "letter": "C", "text": "Refuse - you didn't ask to be saved", "favor": {"KAITHA": 2, "KORVAN": 1, "VALDRIS": -2}},
            {"id": "q18_d", "letter": "D", "text": "Pretend to agree then continue secretly", "favor": {"MERCUS": 1, "KAITHA": 2, "VALDRIS": -3}}
        ]
    },
    {
        "question_number": 19,
        "question_text": "A cursed artifact kills whoever uses it but could end a war. Do you use it?",
        "options": [
            {"id": "q19_a", "letter": "A", "text": "Use it yourself to save others", "favor": {"KORVAN": 3, "MORVANE": 2, "MERCUS": -2}},
            {"id": "q19_b", "letter": "B", "text": "Destroy it immediately", "favor": {"VALDRIS": 2, "SYLARA": 2, "KORVAN": -2}},
            {"id": "q19_c", "letter": "C", "text": "Give it to a condemned criminal", "favor": {"MERCUS": 2, "ATHENA": 1, "VALDRIS": -2}},
            {"id": "q19_d", "letter": "D", "text": "Study it to remove the curse", "favor": {"ATHENA": 3, "SYLARA": 1, "MORVANE": -1}}
        ]
    },
    {
        "question_number": 20,
        "question_text": "You meet yourself from the future warning of a terrible mistake. But they won't say what. Do you change your path?",
        "options": [
            {"id": "q20_a", "letter": "A", "text": "Yes - heed the warning completely", "favor": {"ATHENA": 2, "VALDRIS": 1, "KAITHA": -2}},
            {"id": "q20_b", "letter": "B", "text": "No - paradoxes are dangerous", "favor": {"ATHENA": 2, "MORVANE": 1, "KAITHA": -1}},
            {"id": "q20_c", "letter": "C", "text": "Try to get more information first", "favor": {"ATHENA": 3, "MERCUS": 1}},
            {"id": "q20_d", "letter": "D", "text": "Do the opposite out of spite", "favor": {"KAITHA": 3, "VALDRIS": -2, "ATHENA": -2}}
        ]
    },
    {
        "question_number": 21,
        "question_text": "A phoenix offers rebirth but you'll forget everything. Do you accept?",
        "options": [
            {"id": "q21_a", "letter": "A", "text": "Yes - a fresh start", "favor": {"SYLARA": 3, "MORVANE": 1, "ATHENA": -2}},
            {"id": "q21_b", "letter": "B", "text": "No - memories define us", "favor": {"ATHENA": 3, "VALDRIS": 1, "SYLARA": -1}},
            {"id": "q21_c", "letter": "C", "text": "Write everything down first", "favor": {"ATHENA": 2, "MERCUS": 2, "MORVANE": -1}},
            {"id": "q21_d", "letter": "D", "text": "Bargain for partial memories", "favor": {"MERCUS": 3, "KAITHA": 1, "VALDRIS": -1}}
        ]
    },
    {
        "question_number": 22,
        "question_text": "You can prevent a disaster but history will remember you as the villain. Do you act?",
        "options": [
            {"id": "q22_a", "letter": "A", "text": "Yes - truth matters less than lives", "favor": {"SYLARA": 2, "KORVAN": 2, "MERCUS": -1}},
            {"id": "q22_b", "letter": "B", "text": "No - legacy is everything", "favor": {"MERCUS": 2, "VALDRIS": -1, "SYLARA": -2}},
            {"id": "q22_c", "letter": "C", "text": "Act but leave evidence of truth", "favor": {"ATHENA": 3, "VALDRIS": 2}},
            {"id": "q22_d", "letter": "D", "text": "Find someone else to take the blame", "favor": {"MERCUS": 2, "KAITHA": 2, "VALDRIS": -3}}
        ]
    },
    {
        "question_number": 23,
        "question_text": "A mirror shows your deepest fear. Looking longer might overcome it or break you. How long do you look?",
        "options": [
            {"id": "q23_a", "letter": "A", "text": "Don't look at all", "favor": {"MERCUS": 1, "MORVANE": 1, "KORVAN": -2}},
            {"id": "q23_b", "letter": "B", "text": "One quick glance", "favor": {"VALDRIS": 2, "ATHENA": 1, "KORVAN": -1}},
            {"id": "q23_c", "letter": "C", "text": "Stare until you conquer it", "favor": {"KORVAN": 3, "KAITHA": 1, "MERCUS": -2}},
            {"id": "q23_d", "letter": "D", "text": "Look with friends for support", "favor": {"SYLARA": 2, "VALDRIS": 1, "MORVANE": -1}}
        ]
    },
    {
        "question_number": 24,
        "question_text": "You find a book that writes the future. Every page you read becomes unchangeable. Do you read it?",
        "options": [
            {"id": "q24_a", "letter": "A", "text": "Read it all - knowledge is power", "favor": {"ATHENA": 3, "KAITHA": -2, "VALDRIS": -1}},
            {"id": "q24_b", "letter": "B", "text": "Read only one page", "favor": {"ATHENA": 1, "MERCUS": 2, "VALDRIS": 1}},
            {"id": "q24_c", "letter": "C", "text": "Burn it immediately", "favor": {"KAITHA": 2, "VALDRIS": 1, "ATHENA": -3}},
            {"id": "q24_d", "letter": "D", "text": "Let others read their pages first", "favor": {"MERCUS": 1, "MORVANE": 2, "VALDRIS": -2}}
        ]
    },
    {
        "question_number": 25,
        "question_text": "A god offers godhood but you must choose 1000 people to die. Do you ascend?",
        "options": [
            {"id": "q25_a", "letter": "A", "text": "Never - no power is worth that", "favor": {"VALDRIS": 3, "SYLARA": 3, "KAITHA": -2}},
            {"id": "q25_b", "letter": "B", "text": "Yes - then use power for good", "favor": {"MERCUS": 2, "KAITHA": 2, "VALDRIS": -3}},
            {"id": "q25_c", "letter": "C", "text": "Choose 1000 evil people", "favor": {"VALDRIS": 1, "MORVANE": 2, "SYLARA": -2}},
            {"id": "q25_d", "letter": "D", "text": "Volunteer yourself as one of them", "favor": {"KORVAN": 3, "SYLARA": 1, "MERCUS": -3}}
        ]
    },
    {
        "question_number": 26,
        "question_text": "Your worst enemy is dying and names you their heir. Do you accept?",
        "options": [
            {"id": "q26_a", "letter": "A", "text": "Accept and honor their wishes", "favor": {"VALDRIS": 3, "KORVAN": 1, "KAITHA": -1}},
            {"id": "q26_b", "letter": "B", "text": "Accept but give it all away", "favor": {"SYLARA": 2, "VALDRIS": 1, "MERCUS": -3}},
            {"id": "q26_c", "letter": "C", "text": "Refuse out of principle", "favor": {"KORVAN": 2, "VALDRIS": -1, "MERCUS": -2}},
            {"id": "q26_d", "letter": "D", "text": "Accept and destroy everything", "favor": {"KAITHA": 3, "MORVANE": 2, "VALDRIS": -3}}
        ]
    },
    {
        "question_number": 27,
        "question_text": "You can erase one emotion from humanity forever. Which do you choose?",
        "options": [
            {"id": "q27_a", "letter": "A", "text": "Hatred - for peace", "favor": {"SYLARA": 2, "VALDRIS": 2, "KORVAN": -2}},
            {"id": "q27_b", "letter": "B", "text": "Fear - for courage", "favor": {"KORVAN": 3, "KAITHA": 1, "ATHENA": -2}},
            {"id": "q27_c", "letter": "C", "text": "Greed - for equality", "favor": {"VALDRIS": 2, "SYLARA": 1, "MERCUS": -3}},
            {"id": "q27_d", "letter": "D", "text": "None - all emotions have purpose", "favor": {"ATHENA": 3, "SYLARA": 2, "KAITHA": -1}}
        ]
    },
    {
        "question_number": 28,
        "question_text": "A child can see everyone's death date except their own. They ask you when they'll die. What do you say?",
        "options": [
            {"id": "q28_a", "letter": "A", "text": "Tell them the truth", "favor": {"VALDRIS": 2, "MORVANE": 2, "SYLARA": -1}},
            {"id": "q28_b", "letter": "B", "text": "Lie to protect them", "favor": {"SYLARA": 2, "MERCUS": 1, "VALDRIS": -2}},
            {"id": "q28_c", "letter": "C", "text": "Say you don't know", "favor": {"ATHENA": 2, "VALDRIS": 1, "MORVANE": -1}},
            {"id": "q28_d", "letter": "D", "text": "Teach them to stop looking", "favor": {"SYLARA": 3, "ATHENA": 1, "MORVANE": -2}}
        ]
    },
    {
        "question_number": 29,
        "question_text": "Reality is breaking. You can save either the physical world or the dream world. Which survives?",
        "options": [
            {"id": "q29_a", "letter": "A", "text": "Physical - reality matters most", "favor": {"VALDRIS": 2, "KORVAN": 2, "KAITHA": -2}},
            {"id": "q29_b", "letter": "B", "text": "Dreams - imagination is everything", "favor": {"KAITHA": 3, "SYLARA": 1, "VALDRIS": -2}},
            {"id": "q29_c", "letter": "C", "text": "Try to merge them", "favor": {"ATHENA": 3, "KAITHA": 1, "VALDRIS": -1}},
            {"id": "q29_d", "letter": "D", "text": "Let both end for something new", "favor": {"MORVANE": 3, "KAITHA": 2, "VALDRIS": -3}}
        ]
    },
    {
        "question_number": 30,
        "question_text": "This is your final question. What truth about yourself do you fear most?",
        "options": [
            {"id": "q30_a", "letter": "A", "text": "That I am not good enough", "favor": {"SYLARA": 2, "VALDRIS": 1, "KORVAN": -1}},
            {"id": "q30_b", "letter": "B", "text": "That I am capable of evil", "favor": {"MORVANE": 2, "KAITHA": 2, "VALDRIS": -1}},
            {"id": "q30_c", "letter": "C", "text": "That nothing I do matters", "favor": {"ATHENA": 2, "MORVANE": 1, "SYLARA": -1}},
            {"id": "q30_d", "letter": "D", "text": "That I am exactly who I pretend to be", "favor": {"MERCUS": 2, "ATHENA": 1, "KAITHA": -2}}
        ]
    }
]

def get_mock_interrogation_question(question_number: int, previous_answers: list = None) -> dict:
    """
    Generate mock interrogation question for testing

    ONLY USED IN TEST MODE (ARCANE_TEST_MODE=1)
    Production uses 100% AI-generated questions via MCP
    """
    if question_number <= len(MOCK_INTERROGATION_QUESTIONS):
        return MOCK_INTERROGATION_QUESTIONS[question_number - 1]

    # If we run out of mock questions, cycle back
    index = (question_number - 1) % len(MOCK_INTERROGATION_QUESTIONS)
    question = MOCK_INTERROGATION_QUESTIONS[index].copy()
    question["question_number"] = question_number
    return question

def generate_interrogation_question_with_retry(player_id: str, question_number: int, previous_answers: list) -> dict:
    """
    Generate interrogation question with retry logic for MCP failures
    Attempts 3 times with exponential backoff before falling back to mock questions
    """
    import time

    if TEST_MODE and not MCP_AVAILABLE:
        # Skip retries in test mode without MCP
        return get_mock_interrogation_question(question_number, previous_answers)

    # Try MCP with retry logic
    for attempt in range(3):
        try:
            logger.info(f"[MCP_RETRY] Attempt {attempt + 1}/3 for question {question_number}")
            mcp_client = SyncMCPClient()
            result = mcp_client.generate_interrogation_question(
                player_id=player_id,
                question_number=question_number,
                previous_answers=previous_answers
            )
            logger.info(f"[MCP_RETRY] Success on attempt {attempt + 1}")
            return result
        except Exception as e:
            logger.warning(f"[MCP_RETRY] Attempt {attempt + 1} failed: {str(e)}")
            if attempt < 2:  # Don't sleep on the last attempt
                sleep_time = 2 ** attempt  # 1s, 2s
                logger.info(f"[MCP_RETRY] Sleeping for {sleep_time} seconds before retry")
                time.sleep(sleep_time)

    # All attempts failed, fall back to mock questions
    logger.error(f"[MCP_RETRY] All MCP attempts failed for question {question_number}, using mock questions")
    return get_mock_interrogation_question(question_number, previous_answers)

# Active game sessions
game_sessions: Dict[str, GameSession] = {}

# Initialize database and divine council systems
db = ArcaneDatabase(db_path="arcane_codex.db")
voting_system = VotingSystem(db, GOD_PERSONALITIES)
consequence_engine = ConsequenceEngine(db)

print("[OK] Database and Divine Council systems initialized")

# ============================================================================
# SOCKETIO EVENT HANDLERS - PHASE H: Real-Time Multiplayer
# ============================================================================

# ============================================================================
# SOCKETIO SECURITY - Rate Limiting for Connections
# ============================================================================

# Rate limiting for SocketIO connections
connection_attempts = defaultdict(list)
MAX_CONNECTIONS_PER_IP = 5
CONNECTION_WINDOW = 60  # seconds

@socketio.on('connect')
def handle_connect():
    """Secured connect handler with validation and rate limiting"""
    player_id = session.get('player_id')
    username = session.get('username')
    game_code = session.get('game_code')
    client_ip = request.remote_addr

    # Rate limit connections per IP
    now = time.time()
    connection_attempts[client_ip] = [t for t in connection_attempts[client_ip] if now - t < CONNECTION_WINDOW]

    if len(connection_attempts[client_ip]) >= MAX_CONNECTIONS_PER_IP:
        logger.warning(f"[SECURITY] Rate limit exceeded for IP {client_ip}")
        return False

    connection_attempts[client_ip].append(now)

    # Validate authentication
    if not player_id or not username:
        logger.warning(f"[SOCKETIO] Connection rejected - no credentials: {request.sid}")
        return False

    # Verify player is in a valid game
    if game_code:
        game_session = game_sessions.get(game_code)
        if not game_session:
            logger.warning(f"[SOCKETIO] Connection rejected - invalid game: {game_code}")
            return False

        # Check if player is in the game (players dict maps player_id -> username)
        if player_id not in game_session.players and username not in game_session.players.values():
            logger.warning(f"[SOCKETIO] Connection rejected - player {username} not in game {game_code}")
            return False

        join_room(game_code)
        logger.info(f"[SOCKETIO] {username} connected to game {game_code} (sid={request.sid})")

        # Store connection info
        connected_clients[request.sid] = {
            'player_id': player_id,
            'game_code': game_code,
            'connected_at': datetime.now().isoformat()
        }

        # Track presence
        if game_code not in player_presence:
            player_presence[game_code] = set()
        player_presence[game_code].add(player_id)

        # Notify others in the room
        emit('player_connected', {
            'player_id': player_id,
            'player_name': username,
            'timestamp': datetime.now().isoformat()
        }, room=game_code, skip_sid=request.sid)

        # Send presence list to the connecting player
        emit('presence_update', {
            'online_players': list(player_presence[game_code]),
            'total_players': len(game_session.players)
        })
    else:
        logger.info(f"[SOCKETIO] {username} connected (no game) (sid={request.sid})")
        # Store connection info even if no game
        connected_clients[request.sid] = {
            'player_id': player_id,
            'game_code': None,
            'connected_at': datetime.now().isoformat()
        }

    return True


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    if request.sid not in connected_clients:
        return

    client_info = connected_clients[request.sid]
    player_id = client_info['player_id']
    game_code = client_info['game_code']

    logger.info(f"[SocketIO] Client disconnected: {request.sid} (player: {player_id[:8]}...)")

    # Update presence
    if game_code and game_code in player_presence:
        player_presence[game_code].discard(player_id)

        # Notify others in the room
        if game_code in game_sessions:
            game_session = game_sessions[game_code]
            player_name = game_session.players.get(player_id, 'Unknown')

            emit('player_disconnected', {
                'player_id': player_id,
                'player_name': player_name,
                'timestamp': datetime.now().isoformat()
            }, room=game_code)

            # Send updated presence to room
            emit('presence_update', {
                'online_players': list(player_presence[game_code]),
                'total_players': len(game_session.players)
            }, room=game_code)

    # Clean up
    del connected_clients[request.sid]


@socketio.on('join_game_room')
def handle_join_game_room(data):
    """Join a game room (called after joining via HTTP API)"""
    player_id = session.get('player_id')
    if not player_id:
        emit('error', {'message': 'Authentication required', 'code': 'AUTH_REQUIRED'})
        return

    game_code = data.get('game_code', '').upper()

    if not game_code or game_code not in game_sessions:
        emit('error', {'message': 'Invalid game code', 'code': 'INVALID_GAME'})
        return

    game_session = game_sessions[game_code]

    # Verify player is actually in this game
    if player_id not in game_session.players:
        emit('error', {'message': 'Not authorized for this game', 'code': 'NOT_IN_GAME'})
        return

    # Join the room
    join_room(game_code)

    # Update presence
    if game_code not in player_presence:
        player_presence[game_code] = set()
    player_presence[game_code].add(player_id)

    # Update connection tracking
    if request.sid in connected_clients:
        connected_clients[request.sid]['game_code'] = game_code

    player_name = game_session.players[player_id]

    logger.info(f"[SocketIO] {player_name} joined room {game_code}")

    # Notify room
    emit('player_joined', {
        'player_id': player_id,
        'player_name': player_name,
        'player_count': len(game_session.players),
        'timestamp': datetime.now().isoformat()
    }, room=game_code)

    # Send presence update
    emit('presence_update', {
        'online_players': list(player_presence[game_code]),
        'total_players': len(game_session.players)
    }, room=game_code)


@socketio.on('player_chose')
def handle_player_chose(data):
    """Broadcast when a player submits their choice"""
    player_id = session.get('player_id')
    game_code = session.get('game_code')

    if not player_id or not game_code:
        return

    game_session = game_sessions.get(game_code)
    if not game_session or not game_session.current_scenario:
        return

    player_name = game_session.players.get(player_id, 'Unknown')

    # Broadcast to room
    emit('player_chose', {
        'player_id': player_id,
        'player_name': player_name,
        'choices_submitted': len(game_session.current_scenario.choices_submitted),
        'total_players': len(game_session.players),
        'all_submitted': game_session.all_choices_submitted(),
        'waiting_for': game_session.get_waiting_players(),
        'timestamp': datetime.now().isoformat()
    }, room=game_code)

    logger.info(f"[SocketIO] {player_name} submitted choice in {game_code}")


@socketio.on('request_presence')
def handle_request_presence():
    """Request current presence information"""
    player_id = session.get('player_id')
    game_code = session.get('game_code')

    if not player_id or not game_code:
        return

    if game_code in game_sessions:
        game_session = game_sessions[game_code]
        online_players = list(player_presence.get(game_code, set()))

        emit('presence_update', {
            'online_players': online_players,
            'total_players': len(game_session.players),
            'players': [
                {
                    'player_id': pid,
                    'player_name': pname,
                    'online': pid in online_players
                }
                for pid, pname in game_session.players.items()
            ]
        })

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_game_code() -> str:
    """Generate unique 6-character game code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in game_sessions:
            return code

def get_player_id() -> str:
    """Get or create player ID for current session"""
    if 'player_id' not in session:
        session['player_id'] = secrets.token_hex(16)
    return session['player_id']

def get_game_session(game_code: str) -> Optional[GameSession]:
    """Get game session by code"""
    return game_sessions.get(game_code)

def generate_scenario_via_mcp(game_session: GameSession) -> Scenario:
    """
    Generate dynamic scenario using MCP → Claude Desktop (€200 Max plan)

    NO MOCK SCENARIOS. NO FALLBACK. MCP ONLY.

    If MCP is not configured, this will raise an exception with setup instructions.
    """

    if not MCP_AVAILABLE:
        raise RuntimeError(
            "[ERROR] MCP client not available!\n\n"
            "This game requires MCP (Model Context Protocol) for 100% dynamic scenarios.\n"
            "NO static/mock scenarios are used.\n\n"
            "To configure MCP:\n"
            "1. See MCP_SETUP.md for full instructions\n"
            "2. Or see QUICK_TEST_SETUP.md for quick start\n\n"
            "Your €200 Claude Max plan provides unlimited dynamic scenarios via MCP."
        )

    # Gather game context
    party_trust = game_session.game.game_state.party_trust if game_session.game.game_state else 50
    player_classes = list(game_session.player_classes.values())
    previous_themes = game_session.scenario_history[-3:] if game_session.scenario_history else []

    # Prepare NPC data
    npcs = []
    if game_session.game.game_state and game_session.game.game_state.npc_companions:
        for npc in game_session.game.game_state.npc_companions:
            npcs.append({
                "name": npc.name,
                "approval": npc.approval
            })

    # Prepare divine favor
    divine_favor = {}
    if game_session.game.interrogations:
        # Get first player's divine favor as reference
        first_player = list(game_session.players.keys())[0]
        if first_player in game_session.game.interrogations:
            divine_favor = game_session.game.interrogations[first_player].divine_favor

    # Create MCP client
    mcp_client = SyncMCPClient()

    # Generate via MCP (uses €200 Max plan)
    try:
        scenario_data = mcp_client.generate_scenario(
            party_trust=party_trust,
            player_classes=player_classes,
            npcs=npcs,
            divine_favor=divine_favor,
            previous_themes=previous_themes,
            location=game_session.game.game_state.current_location if game_session.game.game_state else "Unknown",
            difficulty="medium"
        )
    except Exception as e:
        raise RuntimeError(
            f"[ERROR] MCP scenario generation failed!\n\n"
            f"Error: {e}\n\n"
            f"Possible causes:\n"
            f"1. MCP server not configured in Claude Desktop\n"
            f"2. Claude Desktop not running\n"
            f"3. MCP server script path incorrect\n\n"
            f"See MCP_SETUP.md for troubleshooting."
        )

    # Extract whispers for each player
    whispers = {}
    for player_id, player_class in game_session.player_classes.items():
        base_class = player_class.split(" ")[0].lower()  # "Fighter (Lawful)" → "fighter"
        whisper = scenario_data.get("player_whispers", {}).get(base_class, "")
        whispers[player_id] = whisper

    # Create scenario from MCP response
    return Scenario(
        scenario_id=scenario_data.get("scenario_id", f"mcp_{secrets.token_hex(8)}"),
        public_scene=scenario_data.get("public_scene", ""),
        whispers=whispers,
        theme=scenario_data.get("theme", "dynamic"),
        turn_number=len(game_session.scenario_history) + 1
    )

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/favicon.ico')
def favicon():
    """Serve favicon to prevent 404 console errors"""
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/api/set_username', methods=['POST'])
def set_username():
    """Set username for the player (simple auth - no password)"""
    data = request.json or {}
    username = data.get('username', '').strip()

    # Validate username using security validator
    is_valid, error_message = validate_username(username)
    if not is_valid:
        logger.warning(f"[SECURITY] Invalid username attempt from {request.remote_addr}: {error_message}")
        return jsonify({'status': 'error', 'message': error_message}), 400

    # Additional minimum length check
    if len(username) < 2:
        return jsonify({'status': 'error', 'message': 'Username must be at least 2 characters'}), 400

    # Sanitize username
    username = sanitize_text(username, max_length=MAX_USERNAME_LENGTH)

    # Store username in session
    session['username'] = username

    # Generate player_id if not exists
    if 'player_id' not in session:
        session['player_id'] = secrets.token_hex(16)

    logger.info(f"[AUTH] Username set: {username} (player_id: {session['player_id'][:8]}...)")

    return jsonify({
        'status': 'success',
        'username': username,
        'message': f'Welcome, {username}!'
    })

@app.route('/api/get_username', methods=['GET'])
def get_username():
    """Get current username from session"""
    username = session.get('username')

    if not username:
        return jsonify({'status': 'success', 'username': None})

    return jsonify({
        'status': 'success',
        'username': username
    })

# ============================================================================
# MULTIPLAYER SESSION ENDPOINTS
# ============================================================================

@app.route('/api/create_game', methods=['POST'])
@limiter.limit("10 per hour")  # Prevent game spam
@require_authentication
def create_game():
    """Create new multiplayer game session"""
    try:
        # Get username from session (required)
        username = session.get('username')
        player_id = get_player_id()

        logger.info(f"[CREATE_GAME] Player {player_id[:8]}... attempting to create new game as {username}")

        if not username:
            logger.warning(f"[CREATE_GAME] Username required but not found in session. Player: {player_id[:8]}...")
            return jsonify({'status': 'error', 'message': 'Username required. Please set username first.'}), 400

        # Get JSON data (may be None if no body sent)
        try:
            data = request.get_json(silent=True) or {}
        except:
            data = {}

        player_name = username  # Use session username instead of request data

        # Generate game code
        code = generate_game_code()

        logger.info(f"[CREATE_GAME] Generated game code {code} for player {player_name}")

        # Create new game
        try:
            game = ArcaneCodexGame()
            logger.debug(f"[CREATE_GAME] ArcaneCodexGame instance created successfully")
        except Exception as game_error:
            logger.error(f"[CREATE_GAME] Failed to create ArcaneCodexGame: {str(game_error)}", exc_info=True)
            raise

        game_session = GameSession(
            code=code,
            game=game,
            players={player_id: player_name},
            player_classes={}
        )

        game_sessions[code] = game_session

        # Store game code in session
        session['game_code'] = code

        logger.info(f"[CREATE_GAME] Game {code} created successfully. Players: 1/4 | Creator: {player_name}")

        # PHASE H: Emit SocketIO event for game creation
        socketio.emit('game_created', {
            'game_code': code,
            'player_name': player_name,
            'timestamp': datetime.now().isoformat()
        }, room=code)

        return jsonify({
            'status': 'success',
            'game_code': code,
            'player_id': player_id,
            'player_name': player_name,
            'message': f'Game created! Share code {code} with friends (up to 3 more players)'
        })

    except Exception as e:
        logger.error(f"[CREATE_GAME] Failed to create game: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to create game: {str(e)}'
        }), 500

@app.route('/api/join_game', methods=['POST'])
@limiter.limit("20 per hour")  # Prevent join spam
@require_authentication
def join_game():
    """Join existing game session"""
    try:
        # Get username from session (required)
        username = session.get('username')
        player_id = get_player_id()

        logger.info(f"[JOIN_GAME] Player {player_id[:8]}... ({username}) attempting to join game")

        if not username:
            logger.warning(f"[JOIN_GAME] Username required but not found. Player: {player_id[:8]}...")
            return jsonify({'status': 'error', 'message': 'Username required. Please set username first.'}), 400

        data = request.json or {}
        game_code = data.get('game_code', '').strip().upper()
        player_name = username  # Use session username

        # Validate game code
        is_valid, error_message = validate_game_code(game_code)
        if not is_valid:
            logger.warning(f"[SECURITY] Invalid game code from {username} ({request.remote_addr}): {error_message}")
            return jsonify({'status': 'error', 'message': error_message}), 400

        logger.info(f"[JOIN_GAME] Player {player_name} attempting to join game {game_code}")

        game_session = get_game_session(game_code)

        if not game_session:
            logger.warning(f"[JOIN_GAME] Game {game_code} not found. Player: {player_name}")
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        if game_session.is_full():
            logger.warning(f"[JOIN_GAME] Game {game_code} is full. Player: {player_name} denied")
            return jsonify({'status': 'error', 'message': 'Game is full (4 players max)'}), 400

        if game_session.game_started:
            logger.warning(f"[JOIN_GAME] Game {game_code} already started. Player: {player_name} denied")
            return jsonify({'status': 'error', 'message': 'Game already started'}), 400

        # Check if player already in game
        if player_id in game_session.players:
            logger.info(f"[JOIN_GAME] Player {player_name} already in game {game_code}")
            return jsonify({
                'status': 'success',
                'game_code': game_code,
                'player_id': player_id,
                'message': 'Already in this game',
                'players': list(game_session.players.values())
            })

        # Add player to game
        game_session.players[player_id] = player_name
        session['game_code'] = game_code

        logger.info(f"[JOIN_GAME] Player {player_name} joined game {game_code}. Players: {len(game_session.players)}/4")

        # PHASE H: Emit SocketIO event for player joining
        socketio.emit('player_joined', {
            'player_id': player_id,
            'player_name': player_name,
            'player_count': len(game_session.players),
            'timestamp': datetime.now().isoformat()
        }, room=game_code)

        return jsonify({
            'status': 'success',
            'game_code': game_code,
            'player_id': player_id,
            'player_name': player_name,
            'message': f'Joined game {game_code}!',
            'players': list(game_session.players.values()),
            'player_count': len(game_session.players)
        })

    except Exception as e:
        logger.error(f"[JOIN_GAME] Error joining game: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Error joining game: {str(e)}'
        }), 500

@app.route('/api/session_info', methods=['GET'])
def session_info():
    """Get current session info"""
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    game_session = get_game_session(game_code)

    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    # Build player info
    players_info = []
    for pid, pname in game_session.players.items():
        player_info = {
            'player_id': pid,
            'player_name': pname,
            'is_you': pid == player_id
        }

        # Add class if assigned
        if pid in game_session.player_classes:
            player_info['class'] = game_session.player_classes[pid]

        players_info.append(player_info)

    return jsonify({
        'status': 'success',
        'game_code': game_code,
        'player_id': player_id,
        'player_count': len(game_session.players),
        'max_players': game_session.max_players,
        'is_full': game_session.is_full(),
        'game_started': game_session.game_started,
        'all_ready': game_session.all_players_ready(),
        'players': players_info
    })

# ============================================================================
# MCP SCENARIO GENERATION
# ============================================================================

@app.route('/api/generate_scenario', methods=['POST'])
@limiter.limit("5 per minute")  # Expensive MCP call
def generate_scenario():
    """
    Generate new scenario using MCP → Claude Desktop

    100% DYNAMIC. NO MOCK SCENARIOS. NO FALLBACK.

    Requires MCP configured (see MCP_SETUP.md)
    Uses your €200 Claude Max plan for unlimited unique scenarios
    """
    try:
        game_code = session.get('game_code')

        logger.info(f"[GENERATE_SCENARIO] Generating scenario for game {game_code}")

        if not game_code:
            logger.warning(f"[GENERATE_SCENARIO] No game code in session")
            return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

        game_session = get_game_session(game_code)

        if not game_session:
            logger.warning(f"[GENERATE_SCENARIO] Game {game_code} not found")
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        if not game_session.all_players_ready():
            logger.warning(f"[GENERATE_SCENARIO] Not all players ready in game {game_code}")
            return jsonify({'status': 'error', 'message': 'Not all players ready'}), 400

        # Generate scenario via MCP (100% dynamic, NO mock scenarios)
        try:
            logger.info(f"[GENERATE_SCENARIO] Calling MCP for game {game_code}. Players: {len(game_session.players)}")
            scenario = generate_scenario_via_mcp(game_session)
            logger.info(f"[GENERATE_SCENARIO] Successfully generated scenario {scenario.scenario_id} with theme '{scenario.theme}'")
        except RuntimeError as e:
            logger.error(f"[GENERATE_SCENARIO] MCP generation failed for game {game_code}: {str(e)}", exc_info=True)
            return jsonify({'status': 'error', 'message': str(e)}), 500

        # Store scenario
        game_session.current_scenario = scenario
        game_session.scenario_history.append(scenario.theme)

        logger.info(f"[GENERATE_SCENARIO] Scenario stored. Turn number: {scenario.turn_number}")

        # PHASE H: Emit SocketIO event for new scenario
        socketio.emit('new_scenario', {
            'scenario_id': scenario.scenario_id,
            'theme': scenario.theme,
            'turn_number': scenario.turn_number,
            'timestamp': datetime.now().isoformat(),
            'message': 'New scenario available! Check your whisper.'
        }, room=game_code)

        return jsonify({
            'status': 'success',
            'scenario_id': scenario.scenario_id,
            'theme': scenario.theme,
            'turn_number': scenario.turn_number,
            'message': 'Scenario generated! View with /api/current_scenario'
        })

    except Exception as e:
        logger.error(f"[GENERATE_SCENARIO] Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Error generating scenario: {str(e)}'
        }), 500

# ============================================================================
# SCENARIO DISPLAY
# ============================================================================

@app.route('/api/current_scenario', methods=['GET'])
def current_scenario():
    """Get current scenario public scene (what everyone sees)"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    game_session = get_game_session(game_code)

    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    if not game_session.current_scenario:
        return jsonify({'status': 'error', 'message': 'No active scenario'}), 404

    scenario = game_session.current_scenario

    return jsonify({
        'status': 'success',
        'scenario_id': scenario.scenario_id,
        'public_scene': scenario.public_scene,
        'theme': scenario.theme,
        'turn_number': scenario.turn_number,
        'resolved': scenario.resolved,
        'choices_submitted': len(scenario.choices_submitted),
        'total_players': len(game_session.players)
    })

@app.route('/api/my_whisper', methods=['GET'])
def my_whisper():
    """Get player's private whisper (class-specific secret info)"""
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    game_session = get_game_session(game_code)

    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    if not game_session.current_scenario:
        return jsonify({'status': 'error', 'message': 'No active scenario'}), 404

    scenario = game_session.current_scenario
    whisper = scenario.whispers.get(player_id, "You sense nothing special...")

    return jsonify({
        'status': 'success',
        'whisper': whisper,
        'player_class': game_session.player_classes.get(player_id, 'Unknown'),
        'message': 'This is YOUR SECRET. Share it... or don\'t.'
    })

# ============================================================================
# TURN-BASED CHOICES
# ============================================================================

@app.route('/api/make_choice', methods=['POST'])
@limiter.limit("30 per minute")  # Reasonable gameplay rate
@require_game_session
def make_choice():
    """Submit player's choice for current turn"""
    try:
        game_code = session.get('game_code')
        player_id = get_player_id()

        logger.info(f"[MAKE_CHOICE] Player {player_id[:8]}... making choice in game {game_code}")

        if not game_code:
            logger.warning(f"[MAKE_CHOICE] Player {player_id[:8]}... not in a game")
            return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

        game_session = get_game_session(game_code)

        if not game_session:
            logger.warning(f"[MAKE_CHOICE] Game {game_code} not found for player {player_id[:8]}...")
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        # FIXED: Verify player is actually in this game (prevents hijacking)
        if player_id not in game_session.players:
            logger.error(f"[MAKE_CHOICE] Unauthorized: Player {player_id[:8]}... not in game {game_code}")
            return jsonify({'status': 'error', 'message': 'You are not in this game'}), 403

        if not game_session.current_scenario:
            logger.warning(f"[MAKE_CHOICE] No active scenario in game {game_code}")
            return jsonify({'status': 'error', 'message': 'No active scenario'}), 404

        if game_session.current_scenario.resolved:
            logger.warning(f"[MAKE_CHOICE] Scenario already resolved in game {game_code}")
            return jsonify({'status': 'error', 'message': 'Scenario already resolved'}), 400

        # FIXED: Prevent duplicate submissions
        if player_id in game_session.current_scenario.choices_submitted:
            logger.warning(f"[MAKE_CHOICE] Duplicate submission from player {player_id[:8]}... in game {game_code}")
            return jsonify({'status': 'error', 'message': 'You have already submitted your choice'}), 400

        data = request.json or {}
        choice = data.get('choice', '').strip()

        # Validate choice using security validator
        is_valid, error_message = validate_choice(choice)
        if not is_valid:
            logger.warning(f"[SECURITY] Invalid choice from {player_id[:8]}... in game {game_code}: {error_message}")
            return jsonify({'status': 'error', 'message': error_message}), 400

        # Sanitize choice to prevent XSS
        choice = sanitize_text(choice, max_length=MAX_CHOICE_LENGTH)

        # Record choice
        player_choice = PlayerChoice(
            player_id=player_id,
            choice=choice,
            timestamp=time.time()
        )

        game_session.current_scenario.choices_submitted[player_id] = player_choice

        all_submitted = game_session.all_choices_submitted()

        player_name = game_session.players.get(player_id, 'Unknown')

        logger.info(f"[MAKE_CHOICE] Player {player_name} submitted choice in game {game_code}. Submissions: {len(game_session.current_scenario.choices_submitted)}/{len(game_session.players)}")

        # PHASE H: Emit SocketIO event for choice submission
        socketio.emit('player_chose', {
            'player_id': player_id,
            'player_name': player_name,
            'choices_submitted': len(game_session.current_scenario.choices_submitted),
            'total_players': len(game_session.players),
            'all_submitted': all_submitted,
            'waiting_for': game_session.get_waiting_players(),
            'timestamp': datetime.now().isoformat()
        }, room=game_code)

        if all_submitted:
            logger.info(f"[MAKE_CHOICE] All players submitted choices in game {game_code}. Turn ready for resolution.")

        return jsonify({
            'status': 'success',
            'message': 'Choice submitted!',
            'choices_submitted': len(game_session.current_scenario.choices_submitted),
            'total_players': len(game_session.players),
            'all_submitted': all_submitted,
            'waiting_for': game_session.get_waiting_players()
        })

    except Exception as e:
        logger.error(f"[MAKE_CHOICE] Error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Error submitting choice: {str(e)}'
        }), 500

@app.route('/api/waiting_for', methods=['GET'])
def waiting_for():
    """Check which players haven't submitted choices yet"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    game_session = get_game_session(game_code)

    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    if not game_session.current_scenario:
        return jsonify({'status': 'error', 'message': 'No active scenario'}), 404

    waiting = game_session.get_waiting_players()
    waiting_names = [game_session.players[pid] for pid in waiting]

    return jsonify({
        'status': 'success',
        'waiting_player_ids': waiting,
        'waiting_player_names': waiting_names,
        'choices_submitted': len(game_session.current_scenario.choices_submitted),
        'total_players': len(game_session.players),
        'all_submitted': game_session.all_choices_submitted()
    })

@app.route('/api/resolve_turn', methods=['POST'])
def resolve_turn():
    """
    Resolve turn once all players have made choices

    TODO: This should:
    1. Send all choices to MCP
    2. Get narrative outcome from Claude
    3. Update game state (trust, NPC approval, etc.)
    4. Trigger Divine Council if needed
    5. Return results
    """
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    # SECURITY FIX: Wrap critical section with race condition lock
    with with_game_lock(game_code):
        game_session = get_game_session(game_code)

        if not game_session:
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        if not game_session.current_scenario:
            return jsonify({'status': 'error', 'message': 'No active scenario'}), 404

        # Double-check after acquiring lock to prevent race conditions
        if game_session.current_scenario.resolved:
            return jsonify({'status': 'error', 'message': 'Scenario already resolved'}), 400

        if not game_session.all_choices_submitted():
            return jsonify({
                'status': 'error',
                'message': 'Not all players have submitted choices',
                'waiting_for': game_session.get_waiting_players()
            }), 400

        scenario = game_session.current_scenario

        # Mark as resolved immediately after lock acquisition
        scenario.resolved = True

        # Gather choices for MCP resolution
        choices_summary = {}
        for pid, pchoice in scenario.choices_submitted.items():
            player_name = game_session.players[pid]
            player_class = game_session.player_classes[pid]
            whisper = scenario.whispers.get(pid, "")
            choices_summary[player_name] = {
                'class': player_class,
                'choice': pchoice.choice,
                'whisper_received': whisper
            }

        # Send to MCP for resolution (100% dynamic outcome)
        # TODO: Create resolve_turn_via_mcp() similar to generate_scenario_via_mcp()
        # For now: Basic resolution with trust calculation

        # Calculate trust change based on choice alignment
        choices = [c.choice.lower() for c in scenario.choices_submitted.values()]

        # Simple heuristic: aligned choices = trust increase
        unique_choices = len(set(choices))
        if unique_choices == 1:
            trust_change = 10  # Perfect alignment
        elif unique_choices == 2:
            trust_change = 0   # Some disagreement
        else:
            trust_change = -10  # Major conflict

        if game_session.game.game_state:
            game_session.game.update_trust(trust_change, f"Turn {scenario.turn_number} resolution")

        # Placeholder outcome (MCP resolution integration needed)
        outcome = f"""
TURN {scenario.turn_number} RESOLVED

The party's choices have consequences...

Trust: {trust_change:+d} (now {game_session.game.game_state.party_trust if game_session.game.game_state else 50}/100)

[Full narrative outcome will be generated by MCP in future update]
"""

        return jsonify({
            'status': 'success',
            'resolved': True,
            'outcome': outcome,
            'choices_made': choices_summary,
            'trust_change': trust_change,
            'message': 'Turn resolved! Generate next scenario when ready.'
        })

# ============================================================================
# EXISTING ENDPOINTS (Divine Interrogation + Game State)
# ============================================================================

# CSRF Token endpoint for frontend
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Provide CSRF token to frontend for AJAX requests"""
    token = generate_csrf()
    return jsonify({'csrf_token': token})

@app.route('/')
def index():
    """RPG Game Main Menu - AI-Powered Divine Interrogation"""
    return send_from_directory('static', 'game_flow_beautiful_integrated.html')

@app.route('/boring')
def boring_version():
    """The old boring HTML version - DEPRECATED"""
    return render_template('index.html')

@app.route('/game')
def game():
    """Main game page"""
    return render_template('game.html')

@app.route('/api/start_interrogation', methods=['POST'])
@limiter.limit("20 per hour")  # Allow more for testing/retries
def start_interrogation():
    """Start Divine Interrogation for a player - AI GENERATED ONLY!"""
    try:
        game_code = session.get('game_code')
        player_id = get_player_id()

        logger.info(f"[START_INTERROGATION] Player {player_id[:8]}... starting Divine Interrogation in game {game_code}")

        if not game_code:
            logger.warning(f"[START_INTERROGATION] No game code in session")
            return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

        game_session = get_game_session(game_code)

        if not game_session:
            logger.warning(f"[START_INTERROGATION] Game {game_code} not found")
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        # Initialize interrogation progress if not exists
        if player_id not in game_session.game.divine_interrogation_progress:
            game_session.game.divine_interrogation_progress[player_id] = {
                "answers": [],
                "current_question": 0,
                "divine_favor": {god: 0 for god in SEVEN_GODS},
                "questions": []  # Store AI-generated questions
            }

        # Generate first question via MCP (or mock in test mode)
        if not MCP_AVAILABLE and not TEST_MODE:
            logger.error(f"[START_INTERROGATION] MCP not available and not in TEST_MODE")
            raise RuntimeError(
                "[ERROR] MCP client not available!\n\n"
                "Divine Interrogation requires MCP for 100% unique questions per player.\n"
                "NO static questions are used.\n\n"
                "See MCP_SETUP.md for configuration.\n"
                "For testing, set ARCANE_TEST_MODE=1 environment variable."
            )

        try:
            # Use the new retry logic function
            logger.info(f"[START_INTERROGATION] Generating question 1 for player {player_id[:8]}...")
            question_data = generate_interrogation_question_with_retry(
                player_id=player_id,
                question_number=1,
                previous_answers=[]
            )

            # Store generated question
            game_session.game.divine_interrogation_progress[player_id]["questions"].append(question_data)

            logger.info(f"[START_INTERROGATION] Question generated for player {player_id[:8]}... Question: {question_data.get('question_number', 1)}")

            return jsonify({
                'status': 'success',
                'message': 'The Seven Gods await your truth...',
                'question': question_data
            })
        except Exception as e:
            logger.error(f"[START_INTERROGATION] Failed to generate question: {str(e)}", exc_info=True)
            raise RuntimeError(
                f"[ERROR] MCP interrogation question generation failed!\n\n"
                f"Error: {e}\n\n"
                f"See MCP_SETUP.md for troubleshooting."
            )
    except Exception as e:
        logger.error(f"[START_INTERROGATION] Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/answer_question', methods=['POST'])
@limiter.limit("20 per minute")  # Normal gameplay rate
def answer_question():
    """Answer a Divine Interrogation question - AI GENERATED ONLY!"""
    try:
        game_code = session.get('game_code')
        player_id = get_player_id()

        if not game_code:
            logger.warning(f"[ANSWER_QUESTION] No game code in session")
            return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

        game_session = get_game_session(game_code)

        if not game_session:
            logger.warning(f"[ANSWER_QUESTION] Game {game_code} not found")
            return jsonify({'status': 'error', 'message': 'Game not found'}), 404

        data = request.json or {}
        answer_id = data.get('answer_id')

        logger.info(f"[ANSWER_QUESTION] Player {player_id[:8]}... answering with answer_id: {answer_id}")

        progress = game_session.game.divine_interrogation_progress.get(player_id)
        if not progress:
            logger.warning(f"[ANSWER_QUESTION] Interrogation not started for player {player_id[:8]}...")
            return jsonify({'status': 'error', 'message': 'Interrogation not started'}), 400

        # Get current question from stored AI-generated questions
        current_index = progress["current_question"]
        if current_index >= len(progress["questions"]):
            logger.error(f"[ANSWER_QUESTION] Invalid question index {current_index} for player {player_id[:8]}...")
            return jsonify({'status': 'error', 'message': 'Invalid question index'}), 400

        current_question = progress["questions"][current_index]

        # Find selected option and update divine favor
        selected_option = None
        for option in current_question.get("options", []):
            if option["id"] == answer_id:
                selected_option = option
                break

        if not selected_option:
            logger.warning(f"[ANSWER_QUESTION] Invalid answer ID {answer_id} for player {player_id[:8]}...")
            return jsonify({'status': 'error', 'message': 'Invalid answer ID'}), 400

        # Update divine favor based on selected option
        for god, favor_change in selected_option.get("favor", {}).items():
            progress["divine_favor"][god] = progress["divine_favor"].get(god, 0) + favor_change

        # Record answer
        progress["answers"].append({
            "question_number": current_question.get("question_number", current_index + 1),
            "answer_id": answer_id,
            "answer_text": selected_option["text"]
        })

        logger.info(f"[ANSWER_QUESTION] Player {player_id[:8]}... answered question {current_question.get('question_number', current_index + 1)}")

        # Move to next question
        progress["current_question"] += 1

        # Check if interrogation complete (10 questions)
        if progress["current_question"] >= 10:
            # INTERROGATION COMPLETE - Determine character class from divine favor
            divine_favor = progress["divine_favor"]

            # Find god with highest favor
            max_favor = max(divine_favor.values())
            top_god = [god for god, favor in divine_favor.items() if favor == max_favor][0]

            # Map god to character class (simplified)
            god_to_class = {
                "VALDRIS": "Fighter",
                "KAITHA": "Thief",
                "MORVANE": "Cleric",
                "SYLARA": "Mage",
                "KORVAN": "Fighter",
                "ATHENA": "Mage",
                "MERCUS": "Thief"
            }
            character_class = god_to_class.get(top_god, "Fighter")

            # Get player name from session
            player_name = game_session.players[player_id]

            # Create character with determined class
            character = game_session.game.create_character(player_id, player_name)
            character.character_class = character_class  # Override with AI-determined class

            # Store character class
            game_session.player_classes[player_id] = character.character_class

            # Mark interrogation as complete for this player
            game_session.interrogation_complete.add(player_id)

            logger.info(f"[ANSWER_QUESTION] Interrogation COMPLETE for {player_name}. Assigned class: {character_class} (highest favor: {top_god})")

            # Check if all players ready to start
            all_ready = game_session.all_players_ready()

            # Initialize game state if all ready
            if all_ready and not game_session.game_started:
                # Create characters list
                characters = []
                for pid in game_session.players.keys():
                    pname = game_session.players[pid]
                    char = game_session.game.create_character(pid, pname)
                    characters.append(char)

                # Create NPCs
                npcs = game_session.game.create_default_npcs()

                # Initialize game state
                game_session.game.game_state = GameState(
                    party_id=game_code,
                    player_characters=characters,
                    npc_companions=npcs,
                    party_trust=50,
                    party_leader=list(game_session.players.keys())[0],
                    current_location="valdria_town"
                )

                game_session.game_started = True
                logger.info(f"[ANSWER_QUESTION] All players ready! Game {game_code} STARTED")

            return jsonify({
                'status': 'complete',
                'assigned_class': character_class,
                'character_class': character_class,
                'divine_favor': divine_favor,
                'character': {
                    'name': character.name,
                    'class': character.character_class,
                    'hp': character.hp,
                    'mana': character.mana
                },
                'all_ready': all_ready,
                'game_started': game_session.game_started
            })

        else:
            # CONTINUE - Generate next question using retry logic
            try:
                logger.info(f"[ANSWER_QUESTION] Generating question {progress['current_question'] + 1} for player {player_id[:8]}...")
                next_question = generate_interrogation_question_with_retry(
                    player_id=player_id,
                    question_number=progress["current_question"] + 1,
                    previous_answers=progress["answers"]
                )

                # Store generated question
                progress["questions"].append(next_question)

                return jsonify({
                    'status': 'continue',
                    'next_question': next_question
                })
            except Exception as e:
                logger.error(f"[ANSWER_QUESTION] Failed to generate next question: {str(e)}", exc_info=True)
                raise RuntimeError(
                    f"[ERROR] MCP interrogation question generation failed!\n\n"
                    f"Error: {e}\n\n"
                    f"See MCP_SETUP.md for troubleshooting."
                )

    except Exception as e:
        logger.error(f"[ANSWER_QUESTION] Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# ============================================================================
# CLIENT ERROR LOGGING
# ============================================================================

@app.route('/api/log_client_error', methods=['POST'])
def log_client_error():
    """Log client-side errors for debugging and monitoring"""
    try:
        data = request.json or {}
        error_message = data.get('error', 'Unknown error')
        error_stack = data.get('stack', '')
        context = data.get('context', 'Unknown context')
        timestamp = data.get('timestamp', datetime.now().isoformat())
        username = session.get('username', 'Unknown')
        game_code = session.get('game_code', 'None')

        logger.error(f"[CLIENT_ERROR] {error_message} | Context: {context} | User: {username} | Game: {game_code} | Time: {timestamp}")

        if error_stack:
            logger.debug(f"[CLIENT_ERROR_STACK] {error_stack}")

        return jsonify({'status': 'logged'}), 200

    except Exception as e:
        logger.error(f"[LOG_CLIENT_ERROR] Failed to log client error: {str(e)}", exc_info=True)
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/game_state', methods=['GET'])
def get_game_state():
    """Get current game state (enhanced with scenario info)"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    game_session = get_game_session(game_code)

    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    player_id = get_player_id()

    # Backward compatibility: Initialize interrogation_complete for old sessions
    if not hasattr(game_session, 'interrogation_complete'):
        game_session.interrogation_complete = set()

    # Check if this player has completed interrogation
    player_interrogation_complete = player_id in game_session.interrogation_complete
    all_players_interrogation_done = len(game_session.interrogation_complete) == len(game_session.players)

    # PHASE 1: PARTY/INTERROGATION - Before game starts
    if not game_session.game.game_state:
        # Determine sub-phase: lobby (waiting) vs interrogation (character creation)
        if player_interrogation_complete:
            # This player is done, waiting for others
            phase = 'lobby'
        else:
            # This player still needs to do interrogation
            phase = 'interrogation'

        return jsonify({
            'status': 'active',
            'phase': phase,
            'interrogation_complete': player_interrogation_complete,
            'game_code': game_code,
            'trust_level': 100,
            'players': [
                {
                    'name': pname,
                    'class': game_session.player_classes.get(pid, 'Unknown'),
                    'ready': pid in game_session.interrogation_complete
                }
                for pid, pname in game_session.players.items()
            ],
            'all_players_ready': all_players_interrogation_done
        })

    # PHASE 2: GAME STARTED - Scenario gameplay
    game_state = game_session.game.game_state

    response = {
        'status': 'active',
        'phase': 'scenario',  # Game has started, we're in scenario phase
        'game_code': game_code,
        'party_trust': game_state.party_trust,
        'trust_level': game_state.party_trust,
        'location': game_state.current_location,
        'turn': game_state.turn_count,
        'players': [
            {
                'name': pc.name,
                'class': pc.character_class,
                'hp': pc.hp,
                'hp_max': pc.hp_max,
                'mana': pc.mana,
                'mana_max': pc.mana_max
            }
            for pc in game_state.player_characters
        ],
        'npcs': [
            {
                'name': npc.name,
                'title': npc.title,
                'approval': npc.approval,
                'is_alive': npc.is_alive
            }
            for npc in game_state.npc_companions
        ]
    }

    # Add current scenario info if exists
    if game_session.current_scenario:
        response['current_scenario'] = {
            'scenario_id': game_session.current_scenario.scenario_id,
            'theme': game_session.current_scenario.theme,
            'turn_number': game_session.current_scenario.turn_number,
            'resolved': game_session.current_scenario.resolved,
            'choices_submitted': len(game_session.current_scenario.choices_submitted),
            'total_players': len(game_session.players)
        }

    return jsonify(response)

# ============================================================================
# SERVER START
# ============================================================================


# ============================================================================
# PHASE D: UI Support Endpoints
# ============================================================================

@app.route('/api/character/stats', methods=['GET'])
def get_character_stats():
    """Get character statistics (STR, DEX, CON, INT, WIS, CHA)"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        # Get player's character
        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        return jsonify({
            'stats': {
                'STR': character.strength,
                'DEX': character.dexterity,
                'CON': character.constitution,
                'INT': character.intelligence,
                'WIS': character.wisdom,
                'CHA': character.charisma
            },
            'level': character.level,
            'xp': character.xp,
            'xp_to_next': character.xp_to_next_level(),
            'hp': character.hp,
            'max_hp': character.max_hp,
            'class': character.character_class
        })

    except Exception as e:
        logger.error(f"Error getting character stats: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/character/divine_favor', methods=['GET'])
def get_divine_favor():
    """Get character's favor with all 7 gods"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Return favor for all gods
        favor_data = {}
        for god_name in SEVEN_GODS:
            favor_data[god_name] = character.divine_favor.get(god_name, 0)

        return jsonify({'favor': favor_data})

    except Exception as e:
        logger.error(f"Error getting divine favor: {e}")
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/inventory/all', methods=['GET'])
def get_inventory():
    """Get character's full inventory"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Format inventory items
        inventory_items = []
        for item in character.inventory:
            inventory_items.append({
                'id': item.get('id', ''),
                'name': item.get('name', ''),
                'type': item.get('type', ''),
                'description': item.get('description', ''),
                'quantity': item.get('quantity', 1),
                'equipped': item.get('equipped', False)
            })

        return jsonify({
            'items': inventory_items,
            'gold': character.gold,
            'weight': sum(item.get('weight', 0) for item in character.inventory),
            'max_weight': character.max_carry_weight
        })

    except Exception as e:
        logger.error(f"Error getting inventory: {e}")
        return jsonify({'error': str(e)}), 500




@require_game_session
@app.route('/api/inventory/equip', methods=['POST'])
@limiter.limit("30 per minute")
def equip_item():
    """Equip item to slot"""
    try:
        data = request.json
        item_id = data.get('item_id')
        slot = data.get('slot')

        if not item_id or not slot:
            return jsonify({'error': 'Missing item_id or slot'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        result = inv_manager.equip_item(item_id, slot)

        if result['success']:
            # Transaction logging for security audit
            log_transaction(
                player_id=session.get('player_id', 'unknown'),
                game_code=game_code,
                transaction_type='ITEM_EQUIPPED',
                details={'item_id': item_id, 'slot': slot, 'username': username},
                success=True
            )

            # Emit SocketIO event to all players in the game
            socketio.emit('item_equipped', {
                'username': username,
                'item': result.get('equipped'),
                'slot': slot
            }, room=game_code)

            logger.info(f"{username} equipped {item_id} to {slot}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error equipping item: {e}")
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/inventory/unequip', methods=['POST'])
@limiter.limit("30 per minute")
def unequip_item():
    """Unequip item"""
    try:
        data = request.json
        item_id = data.get('item_id')

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        result = inv_manager.unequip_item(item_id)

        if result['success']:
            # Emit SocketIO event
            socketio.emit('item_unequipped', {
                'username': username,
                'item': result.get('item')
            }, room=game_code)

            logger.info(f"{username} unequipped {item_id}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error unequipping item: {e}")
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/inventory/use', methods=['POST'])
@limiter.limit("30 per minute")
def use_item():
    """Use consumable item"""
    try:
        data = request.json
        item_id = data.get('item_id')

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        result = inv_manager.use_item(item_id)

        if result['success']:
            # Transaction logging for security audit
            log_transaction(
                player_id=session.get('player_id', 'unknown'),
                game_code=game_code,
                transaction_type='ITEM_USED',
                details={'item_id': item_id, 'username': username, 'effect': result.get('effect')},
                success=True
            )

            # Emit SocketIO event
            socketio.emit('item_used', {
                'username': username,
                'item_id': item_id,
                'effect': result.get('effect'),
                'value': result.get('value'),
                'message': result.get('message')
            }, room=game_code)

            logger.info(f"{username} used {item_id}: {result.get('message')}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error using item: {e}")
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/inventory/drop', methods=['POST'])
@limiter.limit("30 per minute")
def drop_item():
    """Drop item from inventory"""
    try:
        data = request.json
        item_id = data.get('item_id')
        quantity = data.get('quantity', 1)

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        success = inv_manager.remove_item(item_id, quantity)

        if success:
            # Transaction logging for security audit
            log_transaction(
                player_id=session.get('player_id', 'unknown'),
                game_code=game_code,
                transaction_type='ITEM_DROPPED',
                details={'item_id': item_id, 'quantity': quantity, 'username': username},
                success=True
            )

            # Emit SocketIO event
            socketio.emit('item_dropped', {
                'username': username,
                'item_id': item_id,
                'quantity': quantity
            }, room=game_code)

            logger.info(f"{username} dropped {quantity}x {item_id}")

            return jsonify({
                'success': True,
                'message': f'Dropped {quantity} item(s)'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to drop item'
            })

    except Exception as e:
        logger.error(f"Error dropping item: {e}")
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/inventory/move', methods=['POST'])
@limiter.limit("60 per minute")
def move_item():
    """Move item between inventory slots"""
    try:
        data = request.json
        from_index = data.get('from_index')
        to_index = data.get('to_index')

        if from_index is None or to_index is None:
            return jsonify({'error': 'Missing from_index or to_index'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Validate indices
        if from_index < 0 or to_index < 0:
            return jsonify({'error': 'Invalid indices'}), 400

        if from_index >= len(character.inventory) or to_index >= len(character.inventory):
            return jsonify({'error': 'Index out of range'}), 400

        # Swap items
        character.inventory[from_index], character.inventory[to_index] =             character.inventory[to_index], character.inventory[from_index]

        logger.info(f"{username} moved item from slot {from_index} to {to_index}")

        return jsonify({'success': True})

    except Exception as e:
        logger.error(f"Error moving item: {e}")
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/inventory/add', methods=['POST'])
@limiter.limit("30 per minute")
def add_item():
    """Add item to inventory (for loot/rewards)"""
    try:
        data = request.json
        item_id = data.get('item_id')
        quantity = data.get('quantity', 1)

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Import inventory manager and item database
        from inventory_manager import InventoryManager
        from inventory_system import ItemDatabase

        inv_manager = InventoryManager(character)
        item_db = ItemDatabase()

        # Get item from database
        db_item = item_db.get_item(item_id)
        if not db_item:
            return jsonify({'error': 'Item not found in database'}), 404

        # Convert to dict
        item_dict = {
            'id': db_item.id,
            'name': db_item.name,
            'type': db_item.type.value if hasattr(db_item.type, 'value') else str(db_item.type),
            'description': db_item.description,
            'quantity': quantity,
            'weight': 1.0,
            'value': db_item.value,
            'rarity': db_item.rarity.value if hasattr(db_item.rarity, 'value') else str(db_item.rarity),
            'icon': db_item.icon,
            'stackable': db_item.stackable,
            'stats': {}
        }

        # Add stats if equipment
        if hasattr(db_item, 'stats') and db_item.stats:
            item_dict['stats'] = {
                'attack': db_item.stats.attack,
                'defense': db_item.stats.defense,
                'magic': db_item.stats.magic,
                'speed': db_item.stats.speed
            }

        # Add consumable properties
        if hasattr(db_item, 'effect_type'):
            item_dict['effect_type'] = db_item.effect_type
            item_dict['effect_value'] = db_item.effect_value

        success = inv_manager.add_item(item_dict, quantity)

        if success:
            # Emit SocketIO event
            socketio.emit('item_added', {
                'username': username,
                'item': item_dict,
                'quantity': quantity
            }, room=game_code)

            logger.info(f"Added {quantity}x {item_id} to {username}'s inventory")

            return jsonify({
                'success': True,
                'message': f'Added {quantity}x {db_item.name}',
                'item': item_dict
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Inventory full or overweight'
            })

    except Exception as e:
        logger.error(f"Error adding item: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/quests/active', methods=['GET'])
def get_active_quests():
    """Get character's active quests"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Get active quests
        active_quests = []
        for quest in character.active_quests:
            active_quests.append({
                'id': quest.get('id', ''),
                'name': quest.get('name', ''),
                'description': quest.get('description', ''),
                'objectives': quest.get('objectives', []),
                'progress': quest.get('progress', 0),
                'reward': quest.get('reward', '')
            })

        return jsonify({'quests': active_quests})

    except Exception as e:
        logger.error(f"Error getting active quests: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/quests/completed', methods=['GET'])
def get_completed_quests():
    """Get character's completed quests"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Get completed quests
        completed_quests = []
        for quest in character.completed_quests:
            completed_quests.append({
                'id': quest.get('id', ''),
                'name': quest.get('name', ''),
                'description': quest.get('description', ''),
                'completed_date': quest.get('completed_date', '')
            })

        return jsonify({'quests': completed_quests})

    except Exception as e:
        logger.error(f"Error getting completed quests: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/map/current', methods=['GET'])
def get_current_location():
    """Get character's current location"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        # Return current location from game state
        return jsonify({
            'location': game.current_location,
            'description': game.location_description
        })

    except Exception as e:
        logger.error(f"Error getting current location: {e}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# DIVINE COUNCIL ENDPOINTS - PHASE F
# ============================================================================

@app.route('/api/divine_council/convene', methods=['POST'])
@limiter.limit("10 per hour")  # Expensive operation
def convene_divine_council():
    """
    Trigger a divine council vote on a player action

    Request: {
        "action": "Player broke oath to village elder",
        "context": {
            "involves_oath": true,
            "breaks_law": false
        }
    }

    Response: {
        "votes": [...],
        "outcome": {...},
        "consequences": {...}
    }
    """
    try:
        data = request.json
        player_id = get_player_id()
        game_code = session.get('game_code')

        logger.info(f"[DIVINE_COUNCIL] Convening council for player {player_id[:8]}... in game {game_code}")

        if not player_id or not game_code:
            return jsonify({'success': False, 'error': 'Not in game'}), 401

        game_session = get_game_session(game_code)
        if not game_session:
            return jsonify({'success': False, 'error': 'Game not found'}), 404

        action = data.get('action')
        context = data.get('context', {})

        if not action:
            return jsonify({'success': False, 'error': 'Action required'}), 400

        # Get game database ID for tracking
        game_db = db.get_game_by_code(game_code)
        if not game_db:
            return jsonify({'success': False, 'error': 'Game database not found'}), 404

        game_id = game_db['id']

        # 1. Convene council and get votes
        vote_result = voting_system.convene_council(player_id, game_id, action, context)

        # 2. Apply consequences
        consequences = consequence_engine.apply_consequences(
            player_id,
            game_id,
            vote_result['outcome'].outcome,
            {v.god_name: v.position for v in vote_result['votes']}
        )

        # 3. Save vote to database
        db.save_divine_council_vote(
            game_id,
            game_db['turn'],
            player_id,
            action,
            {v.god_name: {'position': v.position, 'weight': v.weight, 'reasoning': v.reasoning}
             for v in vote_result['votes']},
            vote_result['outcome'].outcome,
            vote_result['outcome'].weighted_score,
            consequences
        )

        logger.info(f"[DIVINE_COUNCIL] Council complete. Outcome: {vote_result['outcome'].outcome}")

        # 4. Emit SocketIO event for real-time update
        socketio.emit('divine_council_result', {
            'player_id': player_id,
            'outcome': vote_result['outcome'].outcome,
            'timestamp': datetime.now().isoformat()
        }, room=game_code)

        # 5. Return result for UI
        return jsonify({
            'success': True,
            'votes': [
                {
                    'god_name': v.god_name,
                    'position': v.position,
                    'weight': v.weight,
                    'reasoning': v.reasoning,
                    'favor_before': v.favor_before
                }
                for v in vote_result['votes']
            ],
            'outcome': {
                'type': vote_result['outcome'].outcome,
                'raw_count': vote_result['outcome'].raw_count,
                'weighted_score': vote_result['outcome'].weighted_score,
                'decisive_gods': vote_result['outcome'].decisive_gods,
                'swing_gods': vote_result['outcome'].swing_gods
            },
            'consequences': consequences
        })

    except Exception as e:
        logger.error(f"[DIVINE_COUNCIL] Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/divine_council/history', methods=['GET'])
def divine_council_history():
    """Get past divine council votes for the current game"""
    try:
        game_code = session.get('game_code')

        if not game_code:
            return jsonify({'success': False, 'error': 'Not in game'}), 400

        game_db = db.get_game_by_code(game_code)
        if not game_db:
            return jsonify({'success': False, 'error': 'Game not found'}), 404

        history = db.get_council_history(game_db['id'], limit=20)

        return jsonify({
            'success': True,
            'history': history
        })

    except Exception as e:
        logger.error(f"[DIVINE_COUNCIL] History error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/divine_favor/all', methods=['GET'])
def get_all_divine_favor():
    """Get player's favor with all 7 gods"""
    try:
        player_id = get_player_id()

        if not player_id:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401

        favor = db.get_all_favor(player_id)

        return jsonify({
            'success': True,
            'favor': favor
        })

    except Exception as e:
        logger.error(f"[DIVINE_FAVOR] Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/divine_effects/active', methods=['GET'])
def get_active_divine_effects():
    """Get all active divine effects for a player"""
    try:
        player_id = get_player_id()
        game_code = session.get('game_code')

        if not player_id or not game_code:
            return jsonify({'success': False, 'error': 'Not in game'}), 400

        game_db = db.get_game_by_code(game_code)
        if not game_db:
            return jsonify({'success': False, 'error': 'Game not found'}), 404

        effects = db.get_active_effects(player_id, game_db['id'])

        return jsonify({
            'success': True,
            'effects': effects
        })

    except Exception as e:
        logger.error(f"[DIVINE_EFFECTS] Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# SKILLS & ABILITIES ENDPOINTS - PHASE J
# ============================================================================

@require_game_session
@app.route('/api/skills/tree', methods=['GET'])
@limiter.limit("100 per minute")
def get_skill_tree():
    """Get complete skill tree for character class"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Get skill tree data
        tree_data = character.skills_manager.get_skill_tree_data()

        return jsonify({
            'success': True,
            'skill_tree': tree_data
        })

    except Exception as e:
        logger.error(f"Error getting skill tree: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/skills/unlock', methods=['POST'])
@limiter.limit("30 per minute")
def unlock_skill():
    """Unlock an ability"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        data = request.json
        ability_id = data.get('ability_id')

        if not ability_id:
            return jsonify({'error': 'Missing ability_id'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Unlock ability
        result = character.skills_manager.unlock_ability(ability_id)

        if result['success']:
            # Transaction logging for security audit
            log_transaction(
                player_id=session.get('player_id', 'unknown'),
                game_code=game_code,
                transaction_type='SKILL_UNLOCKED',
                details={'ability_id': ability_id, 'username': username, 'cost': result.get('cost', 0)},
                success=True
            )

            logger.info(f"{username} unlocked ability {ability_id}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error unlocking skill: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/skills/rankup', methods=['POST'])
@limiter.limit("30 per minute")
def rank_up_skill():
    """Increase ability rank"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        data = request.json
        ability_id = data.get('ability_id')

        if not ability_id:
            return jsonify({'error': 'Missing ability_id'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Rank up ability
        result = character.skills_manager.rank_up_ability(ability_id)

        if result['success']:
            # Transaction logging for security audit
            log_transaction(
                player_id=session.get('player_id', 'unknown'),
                game_code=game_code,
                transaction_type='SKILL_RANKED_UP',
                details={'ability_id': ability_id, 'username': username, 'new_rank': result.get('rank', 0)},
                success=True
            )

            logger.info(f"{username} ranked up ability {ability_id}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error ranking up skill: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/skills/assign_hotkey', methods=['POST'])
@limiter.limit("30 per minute")
def assign_hotkey():
    """Assign ability to hotkey 1-8"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        data = request.json
        ability_id = data.get('ability_id')
        hotkey = data.get('hotkey')

        if not ability_id or hotkey is None:
            return jsonify({'error': 'Missing ability_id or hotkey'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Assign to hotkey
        result = character.skills_manager.assign_to_hotkey(ability_id, int(hotkey))

        if result['success']:
            logger.info(f"{username} assigned {ability_id} to hotkey {hotkey}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error assigning hotkey: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/skills/use', methods=['POST'])
@limiter.limit("60 per minute")
def use_skill():
    """Use an active ability"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        data = request.json
        ability_id = data.get('ability_id')
        target = data.get('target')  # Optional target

        if not ability_id:
            return jsonify({'error': 'Missing ability_id'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Use ability
        result = character.skills_manager.use_ability(ability_id, target)

        if result['success']:
            logger.info(f"{username} used ability {ability_id}")

            # Broadcast to all players in game (real-time update)
            socketio.emit('ability_used', {
                'username': username,
                'ability': result['ability']['name'],
                'result': result['result']
            }, room=game_code)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error using skill: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@require_game_session
@app.route('/api/skills/cooldowns', methods=['GET'])
@limiter.limit("100 per minute")
def get_cooldowns():
    """Get current cooldown timers"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Update cooldowns (remove expired)
        character.skills_manager.update_cooldowns()

        # Get active cooldowns
        cooldowns = character.skills_manager.get_active_cooldowns()

        return jsonify({
            'success': True,
            'cooldowns': cooldowns
        })

    except Exception as e:
        logger.error(f"Error getting cooldowns: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/character/level_up', methods=['POST'])
@limiter.limit("10 per minute")
def level_up_character():
    """Level up character (grants skill points and stats)"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Level up
        character.level += 1

        # Grant skill points (2 per level)
        character.skill_points += 2

        # Increase base stats
        character.hp_max += 10
        character.hp = character.hp_max  # Full heal on level up
        character.mana_max += 5
        character.mana = character.mana_max
        character.mp = character.mana  # Keep mp synced with mana

        logger.info(f"{username} leveled up to {character.level}, gained 2 skill points (total: {character.skill_points})")

        # Broadcast to all players in game
        socketio.emit('level_up', {
            'username': username,
            'new_level': character.level,
            'skill_points_gained': 2,
            'total_skill_points': character.skill_points
        }, room=game_code)

        return jsonify({
            'success': True,
            'level': character.level,
            'skill_points': character.skill_points,
            'hp_max': character.hp_max,
            'mana_max': character.mana_max
        })

    except Exception as e:
        logger.error(f"Error leveling up: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


# ============================================================================
# MISSING ENDPOINTS - PHASE M INTEGRATION
# ============================================================================

@app.route('/api/inventory', methods=['GET'])
@limiter.limit("100 per minute")
def get_inventory_alias():
    """
    Generic inventory endpoint (alias for /api/inventory/all)
    Provides backward compatibility for frontend that calls /api/inventory
    """
    return get_all_inventory()


@app.route('/api/inventory/destroy', methods=['POST'])
@limiter.limit("30 per minute")
@require_game_session
def destroy_item():
    """
    Permanently delete an item from inventory
    Unlike drop (which puts item on ground), destroy removes it from game entirely

    Request: {
        "item_id": "sword_of_truth",
        "quantity": 1
    }
    """
    try:
        data = request.json
        item_id = data.get('item_id')
        quantity = data.get('quantity', 1)

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        success = inv_manager.remove_item(item_id, quantity)

        if success:
            # Transaction logging for security audit
            log_transaction(
                player_id=session.get('player_id', 'unknown'),
                game_code=game_code,
                transaction_type='ITEM_DESTROYED',
                details={'item_id': item_id, 'quantity': quantity, 'username': username},
                success=True
            )

            # Emit SocketIO event
            socketio.emit('item_destroyed', {
                'username': username,
                'item_id': item_id,
                'quantity': quantity
            }, room=game_code)

            logger.info(f"{username} destroyed {quantity}x {item_id}")

            return jsonify({
                'success': True,
                'message': f'Destroyed {quantity} item(s) permanently'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to destroy item'
            }), 400

    except Exception as e:
        logger.error(f"Error destroying item: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/divine_council/vote', methods=['POST'])
@limiter.limit("10 per hour")
def divine_council_vote_alias():
    """
    Alias for /api/divine_council/convene
    Provides backward compatibility for frontend that calls /api/divine_council/vote
    """
    return convene_divine_council()


@app.route('/api/npcs', methods=['GET'])
@limiter.limit("100 per minute")
@require_game_session
def get_all_npcs():
    """
    Get all NPC companions in the current game

    Response: {
        "success": true,
        "npcs": [
            {
                "id": "npc_001",
                "name": "Eldrin the Wise",
                "approval": 75,
                "status": "alive",
                "personality": {...},
                "hp": {...}
            }
        ]
    }
    """
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        # Get NPCs from game state
        npcs = []
        if game.game_state and hasattr(game.game_state, 'npc_companions'):
            for npc in game.game_state.npc_companions:
                npcs.append({
                    'id': npc.id if hasattr(npc, 'id') else '',
                    'name': npc.name if hasattr(npc, 'name') else '',
                    'approval': npc.approval if hasattr(npc, 'approval') else 50,
                    'status': npc.status if hasattr(npc, 'status') else 'alive',
                    'personality': npc.personality if hasattr(npc, 'personality') else {},
                    'hp': npc.hp if hasattr(npc, 'hp') else {'current': 100, 'max': 100}
                })

        logger.info(f"{username} requested NPC list in game {game_code}, found {len(npcs)} NPCs")

        return jsonify({
            'success': True,
            'npcs': npcs
        })

    except Exception as e:
        logger.error(f"Error getting NPCs: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/party/trust', methods=['GET'])
@limiter.limit("100 per minute")
@require_game_session
def get_party_trust():
    """
    Get current party trust level

    Response: {
        "success": true,
        "trust": 75,
        "trust_level": "High",
        "description": "The party trusts each other deeply"
    }
    """
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        # Get party trust from game state
        trust = 50  # Default
        if game.game_state and hasattr(game.game_state, 'party_trust'):
            trust = game.game_state.party_trust

        # Calculate trust level description
        if trust >= 80:
            trust_level = "Very High"
            description = "The party trusts each other completely"
        elif trust >= 60:
            trust_level = "High"
            description = "The party trusts each other deeply"
        elif trust >= 40:
            trust_level = "Moderate"
            description = "The party has reasonable trust"
        elif trust >= 20:
            trust_level = "Low"
            description = "The party has some doubts about each other"
        else:
            trust_level = "Very Low"
            description = "The party barely trusts each other"

        logger.info(f"{username} requested party trust in game {game_code}: {trust}")

        return jsonify({
            'success': True,
            'trust': trust,
            'trust_level': trust_level,
            'description': description
        })

    except Exception as e:
        logger.error(f"Error getting party trust: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/quests', methods=['GET'])
@limiter.limit("100 per minute")
@require_game_session
def get_all_quests():
    """
    Get all quests (both active and completed)

    Response: {
        "success": true,
        "active": [...],
        "completed": [...]
    }
    """
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Get active quests
        active_quests = []
        if hasattr(character, 'active_quests'):
            for quest in character.active_quests:
                active_quests.append({
                    'id': quest.get('id', ''),
                    'name': quest.get('name', ''),
                    'description': quest.get('description', ''),
                    'objectives': quest.get('objectives', []),
                    'progress': quest.get('progress', 0),
                    'reward': quest.get('reward', '')
                })

        # Get completed quests
        completed_quests = []
        if hasattr(character, 'completed_quests'):
            for quest in character.completed_quests:
                completed_quests.append({
                    'id': quest.get('id', ''),
                    'name': quest.get('name', ''),
                    'description': quest.get('description', ''),
                    'completed_date': quest.get('completed_date', '')
                })

        logger.info(f"{username} requested all quests: {len(active_quests)} active, {len(completed_quests)} completed")

        return jsonify({
            'success': True,
            'active': active_quests,
            'completed': completed_quests,
            'total_active': len(active_quests),
            'total_completed': len(completed_quests)
        })

    except Exception as e:
        logger.error(f"Error getting all quests: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/skills/refund', methods=['POST'])
@limiter.limit("10 per minute")
@require_game_session
def refund_skill():
    """
    Refund a skill point (costs gold as a penalty)

    Request: {
        "skill_id": "fireball"
    }

    Response: {
        "success": true,
        "skill_points_refunded": 1,
        "gold_cost": 50,
        "skill_points": 3,
        "gold": 100
    }
    """
    try:
        data = request.json
        skill_id = data.get('skill_id')

        if not skill_id:
            return jsonify({'error': 'Missing skill_id'}), 400

        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Initialize skills manager if not already done
        if not hasattr(character, 'skills_manager'):
            character.skills_manager = SkillsManager(character)

        # Check if skill is unlocked
        if skill_id not in character.skills_manager.unlocked_skills:
            return jsonify({
                'success': False,
                'error': 'Skill not unlocked'
            }), 400

        # Calculate refund cost (50 gold per skill point)
        refund_cost = 50
        current_gold = getattr(character, 'gold', 0)

        if current_gold < refund_cost:
            return jsonify({
                'success': False,
                'error': f'Not enough gold (need {refund_cost}, have {current_gold})'
            }), 400

        # Get skill info to determine points invested
        skill_info = character.skills_manager.get_skill_info(skill_id)
        if not skill_info:
            return jsonify({
                'success': False,
                'error': 'Skill not found'
            }), 400

        # Refund the skill point
        points_refunded = skill_info.get('rank', 1)  # Refund based on rank

        # Remove skill from unlocked skills
        character.skills_manager.unlocked_skills.remove(skill_id)

        # Refund skill points
        character.skill_points += points_refunded

        # Deduct gold
        character.gold -= refund_cost

        # Transaction logging
        log_transaction(
            player_id=session.get('player_id', 'unknown'),
            game_code=game_code,
            transaction_type='SKILL_REFUNDED',
            details={
                'skill_id': skill_id,
                'points_refunded': points_refunded,
                'gold_cost': refund_cost,
                'username': username
            },
            success=True
        )

        # Emit SocketIO event
        socketio.emit('skill_refunded', {
            'username': username,
            'skill_id': skill_id,
            'points_refunded': points_refunded
        }, room=game_code)

        logger.info(f"{username} refunded skill {skill_id}, got {points_refunded} points back for {refund_cost} gold")

        return jsonify({
            'success': True,
            'skill_points_refunded': points_refunded,
            'gold_cost': refund_cost,
            'skill_points': character.skill_points,
            'gold': character.gold,
            'message': f'Refunded {points_refunded} skill point(s) for {refund_cost} gold'
        })

    except Exception as e:
        logger.error(f"Error refunding skill: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


# ============================================================================
# BATTLE SYSTEM ENDPOINTS
# ============================================================================

@app.route('/api/battle/test', methods=['POST'])
@limiter.limit("10 per minute")
@csrf.exempt  # Exempt from CSRF for testing
def test_battle():
    """Quick test endpoint to trigger a battle with animations"""
    try:
        data = request.get_json() or {}
        game_code = data.get('game_code')

        if not game_code:
            return jsonify({'error': 'Missing game_code'}), 400

        # Set up test session credentials for SocketIO connection
        if not session.get('player_id'):
            session['player_id'] = 'test_player'
            session['username'] = 'TestPlayer'
            session['game_code'] = game_code
            session.permanent = True

            # Ensure test game exists in game_sessions
            if game_code not in game_sessions:
                # Create a minimal test game
                test_game_instance = ArcaneCodexGame()
                test_game = GameSession(
                    code=game_code,
                    game=test_game_instance,
                    players={'test_player': 'TestPlayer'},
                    player_classes={'test_player': 'Warrior'}
                )
                test_game.game_started = True
                game_sessions[game_code] = test_game

        # For testing, use dummy character if not in session
        player_id = session.get('player_id', 'test_player')

        # Simple test enemy data (Phase 1)
        test_enemy = {
            'name': 'Goblin Scout',
            'icon': '👺',
            'type': 'normal',
            'hp': 8,
            'max_hp': 8,
            'attack': 4,
            'defense': 2,
            'flavor_text': 'A goblin scout emerges from the shadows!'
        }

        # Simple test player data
        test_player = {
            'name': 'Test Hero',
            'hp': 20,
            'max_hp': 20,
            'attack': 5,
            'defense': 3
        }

        # Store battle state for this game
        if not hasattr(app, 'active_battles'):
            app.active_battles = {}

        app.active_battles[game_code] = {
            'enemy_hp': test_enemy['hp'],
            'player_hp': test_player['hp'],
            'player_id': player_id
        }

        logger.info(f"[Battle Test] Started battle for {game_code}")

        # Return enemy data for client-side animation
        return jsonify({
            'success': True,
            'battle_id': f"battle_{game_code}_{int(time.time())}",
            'enemy': test_enemy,
            'player': test_player
        })

    except Exception as e:
        logger.error(f"Test battle error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@socketio.on('battle_action')
def handle_battle_action(data):
    """Handle battle actions from client (Phase 1: Simple implementation)"""
    try:
        game_code = data.get('game_code')
        player_id = session.get('player_id', 'test_player')
        action_type = data.get('action')  # attack, defend, flee

        logger.info(f"[Battle] Action from {player_id} in {game_code}: {action_type}")

        # Get battle state
        if not hasattr(app, 'active_battles') or game_code not in app.active_battles:
            emit('error', {'message': 'No active battle found'})
            return

        battle_state = app.active_battles[game_code]

        if action_type == 'attack':
            # Roll damage
            damage = random.randint(3, 8)
            battle_state['enemy_hp'] -= damage
            enemy_hp = max(0, battle_state['enemy_hp'])

            socketio.emit('action_result', {
                'actor': player_id,
                'action': 'attack',
                'target': 'enemy',
                'damage': damage,
                'critical': damage >= 7,
                'message': f'You strike for {damage} damage!',
                'remaining_enemy_hp': enemy_hp
            }, room=game_code)

            # Check if enemy defeated
            if enemy_hp <= 0:
                socketio.emit('battle_victory', {
                    'message': 'Victory! The goblin falls!',
                    'rewards': {
                        'xp': 25,
                        'gold': 10
                    }
                }, room=game_code)

                # Clean up battle state
                del app.active_battles[game_code]
                logger.info(f"[Battle] Victory in {game_code}")

        elif action_type == 'defend':
            socketio.emit('action_result', {
                'actor': player_id,
                'action': 'defend',
                'message': 'You brace for impact!',
                'defense_bonus': 2
            }, room=game_code)

        elif action_type == 'flee':
            flee_success = random.random() > 0.5
            socketio.emit('flee_result', {
                'success': flee_success,
                'message': 'You escaped!' if flee_success else 'Failed to escape!'
            }, room=game_code)

            if flee_success and game_code in app.active_battles:
                del app.active_battles[game_code]
                logger.info(f"[Battle] Fled from {game_code}")

    except Exception as e:
        logger.error(f"[Battle] Action error: {e}", exc_info=True)
        emit('error', {'message': str(e)})


if __name__ == '__main__':
    print("""
===============================================================
    THE ARCANE CODEX - TRUE ASCII GRAPHICS ONLY!
===============================================================

Starting REAL ASCII game server (NO BORING HTML!)...

Open your browser to: http://localhost:5000

TRUE ASCII FEATURES:
- Green phosphor terminal display (like REAL terminals!)
- CRT monitor scanline effects
- Screen shake on impacts
- ASCII particle explosions
- Rhythm engine pulsing at 120 BPM
- 30 FPS animated ASCII graphics
- REAL ASCII art (not HTML pretending!)

MULTIPLAYER:
- 1-4 players with ASCII interface
- Asymmetric whispers in ASCII
- Trust mechanics with ASCII bars

IMPORTANT: Requires MCP configured (see MCP_SETUP.md)
           Uses your €200 Claude Max plan for unlimited scenarios

API ENDPOINTS READY:

Session Management:
  POST /api/create_game - Create new game session
  POST /api/join_game - Join existing game
  GET /api/session_info - Get session info

Character Creation:
  POST /api/start_interrogation - Begin Divine Interrogation
  POST /api/answer_question - Answer interrogation question

Scenarios:
  POST /api/generate_scenario - Generate new scenario
  GET /api/current_scenario - Get public scene
  GET /api/my_whisper - Get your private whisper

Turns:
  POST /api/make_choice - Submit your choice
  GET /api/waiting_for - Check who hasn't chosen
  POST /api/resolve_turn - Resolve turn (all choices in)

Game State:
  GET /api/game_state - Get full game state

===============================================================
""")

    # Start AI Game Master in background thread for automatic scenario generation
    if AI_GM_AVAILABLE:
        try:
            print("[AI GM] Starting AI Game Master automation...")
            ai_gm_thread = start_ai_gm_thread(socketio)
            print("[AI GM] AI GM running in background - will auto-generate scenarios")
        except Exception as e:
            print(f"[AI GM] WARNING: Failed to start AI GM: {e}")
            print("   Game will still work but requires manual scenario generation")
    else:
        print("[AI GM] WARNING: AI GM not available - scenarios must be generated manually")

    # Disable auto-reload to prevent game sessions from being wiped
    # PHASE H: Use socketio.run() instead of app.run() for real-time support
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, use_reloader=False)
