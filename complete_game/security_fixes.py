"""
CRITICAL SECURITY FIXES FOR ARCANE CODEX
Addresses all critical issues from PHASE_M_CODE_REVIEW_REPORT.md

Apply these fixes to web_game.py
"""

# ============================================================================
# FIX #1: SESSION MANAGEMENT SECURITY
# ============================================================================

SESSION_SECURITY_CONFIG = '''
from datetime import timedelta

# Session security configuration (add after app initialization)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=4)
app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only (set False for development)
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS access to cookies
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
app.config['SESSION_REFRESH_EACH_REQUEST'] = True  # Extend session on activity
'''

# ============================================================================
# FIX #2: INPUT VALIDATION HELPERS
# ============================================================================

INPUT_VALIDATION_CODE = '''
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
'''

# ============================================================================
# FIX #3: AUTHENTICATION & AUTHORIZATION DECORATOR
# ============================================================================

AUTH_DECORATOR_CODE = '''
from functools import wraps
from flask import session, jsonify, request

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
        game_session = active_games.get(game_code)
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
    game_session = active_games.get(game_code)
    if not game_session:
        return False

    return username in game_session.players
'''

# ============================================================================
# FIX #4: RACE CONDITION PROTECTION
# ============================================================================

RACE_CONDITION_FIX = '''
import threading
from collections import defaultdict

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
'''

# ============================================================================
# FIX #5: TRANSACTION LOGGING
# ============================================================================

TRANSACTION_LOGGING_CODE = '''
import json
from datetime import datetime

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
'''

# ============================================================================
# FIX #6: ENHANCED SOCKETIO SECURITY
# ============================================================================

SOCKETIO_SECURITY_FIX = '''
from collections import defaultdict
import time

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
        game_session = active_games.get(game_code)
        if not game_session:
            logger.warning(f"[SOCKETIO] Connection rejected - invalid game: {game_code}")
            return False

        if username not in game_session.players:
            logger.warning(f"[SOCKETIO] Connection rejected - player {username} not in game {game_code}")
            return False

        join_room(game_code)
        logger.info(f"[SOCKETIO] {username} connected to game {game_code} (sid={request.sid})")
    else:
        logger.info(f"[SOCKETIO] {username} connected (no game) (sid={request.sid})")

    return True
'''

# ============================================================================
# IMPLEMENTATION INSTRUCTIONS
# ============================================================================

IMPLEMENTATION_GUIDE = """
STEP-BY-STEP IMPLEMENTATION GUIDE
==================================

1. SESSION SECURITY (lines 70-90 in web_game.py)
   - Add SESSION_SECURITY_CONFIG after app initialization
   - For development, set SESSION_COOKIE_SECURE = False
   - For production, ensure HTTPS and set to True

2. INPUT VALIDATION (add before route handlers, around line 100)
   - Add INPUT_VALIDATION_CODE
   - Import these helpers at top of file

3. AUTHENTICATION DECORATORS (add before route handlers, around line 200)
   - Add AUTH_DECORATOR_CODE
   - Apply @require_authentication to all API endpoints
   - Apply @require_game_session to game-specific endpoints

4. RACE CONDITION PROTECTION (add near imports, line 30)
   - Add RACE_CONDITION_FIX
   - Wrap critical sections (turn resolution, item operations) with locks

5. TRANSACTION LOGGING (add after helpers, around line 300)
   - Add TRANSACTION_LOGGING_CODE
   - Call log_transaction() for all state-changing operations

6. SOCKETIO SECURITY (replace existing @socketio.on('connect'))
   - Replace with SOCKETIO_SECURITY_FIX

7. UPDATE EXISTING ENDPOINTS
   Apply validators to these endpoints:
   - /api/set_username: Use validate_username()
   - /api/create_game: Use validate_game_code()
   - /api/join_game: Use validate_game_code()
   - /api/make_choice: Use validate_choice(), sanitize_text()
   - All inventory endpoints: Add transaction logging
   - All skills endpoints: Add transaction logging

8. TEST THOROUGHLY
   - Test with malicious inputs
   - Test concurrent operations
   - Test session expiration
   - Review logs for transaction audit trail

ESTIMATED TIME: 13 hours
PRIORITY: CRITICAL - Deploy ASAP
"""

if __name__ == '__main__':
    print("="*80)
    print("ARCANE CODEX - CRITICAL SECURITY FIXES")
    print("="*80)
    print(IMPLEMENTATION_GUIDE)
    print("\nAll fix code is in this file. Apply manually to web_game.py")
    print("or use the fix application script.")
