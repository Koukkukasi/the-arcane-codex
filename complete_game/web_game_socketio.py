"""
THE ARCANE CODEX - Web Game Interface with SocketIO
Web/mobile multiplayer (1-4 players) with REAL-TIME updates via SocketIO

PHASE H: Real-Time Multiplayer Enhancements
- SocketIO for real-time updates (replaces HTTP polling)
- Room-based messaging (one room per game code)
- Reconnection handling
- Presence indicators
"""
from flask import Flask, render_template, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
import secrets
import random
import string
import os
from arcane_codex_server import ArcaneCodexGame, SEVEN_GODS, GameState, Character, NPCCompanion
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict, field
import json

# SocketIO Integration
from socketio_integration import (
    init_socketio,
    setup_socketio_handlers,
    broadcast_to_game,
    get_online_players,
    is_player_online
)

# MCP Client for dynamic scenario generation
try:
    from mcp_client import SyncMCPClient, generate_scenario_prompt
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    print("❌ MCP client not available. Game requires MCP for dynamic scenarios!")
    print("   See MCP_SETUP.md or QUICK_TEST_SETUP.md for configuration.")

# TEST MODE
TEST_MODE = os.environ.get('ARCANE_TEST_MODE', '0') == '1'
if TEST_MODE:
    print("⚠️  TEST MODE ENABLED - Using mock interrogation questions")

app = Flask(__name__)

# FIXED: Persist secret key
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

# CSRF Protection
csrf = CSRFProtect(app)
app.config['WTF_CSRF_TIME_LIMIT'] = None
print("[OK] CSRF protection enabled")

# ============================================================================
# SOCKETIO INITIALIZATION
# ============================================================================

# Active game sessions (shared with SocketIO)
game_sessions: Dict[str, 'GameSession'] = {}

# Initialize SocketIO
socketio = init_socketio(app, game_sessions)
setup_socketio_handlers(socketio)

print("[OK] SocketIO initialized with real-time event handlers")

# ============================================================================
# CACHE PREVENTION (Development)
# ============================================================================

if app.debug:
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    print("[DEV MODE] Static file caching DISABLED for development")

@app.after_request
def prevent_dev_caching(response):
    """Prevent aggressive browser caching during development"""
    if app.debug:
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers.pop('ETag', None)
        response.headers.pop('Last-Modified', None)
    return response

# ============================================================================
# DATA STRUCTURES (from original web_game.py)
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
    public_scene: str
    whispers: Dict[str, str]
    theme: str
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
    scenario_history: List[str] = field(default_factory=list)
    interrogation_complete: set = field(default_factory=set)

    def is_full(self) -> bool:
        return len(self.players) >= self.max_players

    def all_players_ready(self) -> bool:
        return len(self.player_classes) == len(self.players) and len(self.players) > 0

    def all_choices_submitted(self) -> bool:
        if not self.current_scenario:
            return False
        return len(self.current_scenario.choices_submitted) == len(self.players)

    def get_waiting_players(self) -> List[str]:
        if not self.current_scenario:
            return []
        submitted = set(self.current_scenario.choices_submitted.keys())
        all_players = set(self.players.keys())
        return list(all_players - submitted)

# ============================================================================
# TEST MODE: Mock Interrogation Questions
# ============================================================================

MOCK_INTERROGATION_QUESTIONS = [
    {
        "question_number": 1,
        "question_text": "A comrade lies dying. Their final wish is to reveal a secret that could save the party or doom them. Do you listen?",
        "options": [
            {"id": "q1_a", "letter": "A", "text": "Listen carefully - knowledge is power", "favor": {"Myrth": 2, "Gorath": -1}},
            {"id": "q1_b", "letter": "B", "text": "Refuse - some secrets are better buried", "favor": {"Althara": 2, "Gorath": 1}},
            {"id": "q1_c", "letter": "C", "text": "End their suffering before they speak", "favor": {"Gorath": 2, "Vexor": 1}}
        ]
    },
    {
        "question_number": 2,
        "question_text": "You discover your companion has been stealing from the party treasury. They claim it's for their sick child.",
        "options": [
            {"id": "q2_a", "letter": "A", "text": "Expose them to the group immediately", "favor": {"Nerys": 2, "Vexor": -1}},
            {"id": "q2_b", "letter": "B", "text": "Confront them privately and demand repayment", "favor": {"Valrik": 2, "Nerys": 1}},
            {"id": "q2_c", "letter": "C", "text": "Say nothing and secretly add your own gold", "favor": {"Althara": 3, "Gorath": -2}}
        ]
    }
]

def get_mock_interrogation_question(question_number: int, previous_answers: list = None) -> dict:
    """Generate mock interrogation question for testing (TEST MODE ONLY)"""
    if question_number <= len(MOCK_INTERROGATION_QUESTIONS):
        return MOCK_INTERROGATION_QUESTIONS[question_number - 1]
    index = (question_number - 1) % len(MOCK_INTERROGATION_QUESTIONS)
    question = MOCK_INTERROGATION_QUESTIONS[index].copy()
    question["question_number"] = question_number
    return question

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
    """Generate dynamic scenario using MCP → Claude Desktop"""
    if not MCP_AVAILABLE:
        raise RuntimeError("❌ MCP client not available! See MCP_SETUP.md")

    # Gather game context
    party_trust = game_session.game.game_state.party_trust if game_session.game.game_state else 50
    player_classes = list(game_session.player_classes.values())
    previous_themes = game_session.scenario_history[-3:] if game_session.scenario_history else []

    # Prepare NPC data
    npcs = []
    if game_session.game.game_state and game_session.game.game_state.npc_companions:
        for npc in game_session.game.game_state.npc_companions:
            npcs.append({"name": npc.name, "approval": npc.approval})

    # Prepare divine favor
    divine_favor = {}
    if game_session.game.interrogations:
        first_player = list(game_session.players.keys())[0]
        if first_player in game_session.game.interrogations:
            divine_favor = game_session.game.interrogations[first_player].divine_favor

    # Create MCP client
    mcp_client = SyncMCPClient()

    # Generate via MCP
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
        raise RuntimeError(f"❌ MCP scenario generation failed: {e}")

    # Extract whispers for each player
    whispers = {}
    for player_id, player_class in game_session.player_classes.items():
        base_class = player_class.split(" ")[0].lower()
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
# ROUTES (HTTP API - Modified to emit SocketIO events)
# ============================================================================

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/api/set_username', methods=['POST'])
def set_username():
    """Set username for the player"""
    data = request.json or {}
    username = data.get('username', '').strip()

    if not username or len(username) < 2 or len(username) > 20:
        return jsonify({'status': 'error', 'message': 'Username must be 2-20 characters'}), 400

    session['username'] = username
    return jsonify({'status': 'success', 'username': username, 'message': f'Welcome, {username}!'})

@app.route('/api/get_username', methods=['GET'])
def get_username():
    """Get current username from session"""
    username = session.get('username')
    return jsonify({'status': 'success', 'username': username})

@app.route('/api/create_game', methods=['POST'])
def create_game():
    """Create new multiplayer game session"""
    try:
        username = session.get('username')
        if not username:
            return jsonify({'status': 'error', 'message': 'Username required'}), 400

        code = generate_game_code()
        player_id = get_player_id()

        game = ArcaneCodexGame()
        game_session = GameSession(
            code=code,
            game=game,
            players={player_id: username},
            player_classes={}
        )

        game_sessions[code] = game_session
        session['game_code'] = code

        return jsonify({
            'status': 'success',
            'game_code': code,
            'player_id': player_id,
            'player_name': username,
            'message': f'Game created! Share code {code} with friends'
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to create game: {str(e)}'}), 500

@app.route('/api/join_game', methods=['POST'])
def join_game():
    """Join existing game session"""
    username = session.get('username')
    if not username:
        return jsonify({'status': 'error', 'message': 'Username required'}), 400

    data = request.json
    game_code = data.get('game_code', '').upper()
    game_session = get_game_session(game_code)

    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    if game_session.is_full():
        return jsonify({'status': 'error', 'message': 'Game is full (4 players max)'}), 400

    if game_session.game_started:
        return jsonify({'status': 'error', 'message': 'Game already started'}), 400

    player_id = get_player_id()

    if player_id in game_session.players:
        return jsonify({
            'status': 'success',
            'game_code': game_code,
            'player_id': player_id,
            'message': 'Already in this game',
            'players': list(game_session.players.values())
        })

    game_session.players[player_id] = username
    session['game_code'] = game_code

    # SOCKETIO: Notify will happen when client emits 'join_game_room'

    return jsonify({
        'status': 'success',
        'game_code': game_code,
        'player_id': player_id,
        'player_name': username,
        'message': f'Joined game {game_code}!',
        'players': list(game_session.players.values()),
        'player_count': len(game_session.players)
    })

@app.route('/api/make_choice', methods=['POST'])
def make_choice():
    """Submit player's choice for current turn"""
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'status': 'error', 'message': 'Not in a game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

    if player_id not in game_session.players:
        return jsonify({'status': 'error', 'message': 'You are not in this game'}), 403

    if not game_session.current_scenario:
        return jsonify({'status': 'error', 'message': 'No active scenario'}), 404

    if game_session.current_scenario.resolved:
        return jsonify({'status': 'error', 'message': 'Scenario already resolved'}), 400

    if player_id in game_session.current_scenario.choices_submitted:
        return jsonify({'status': 'error', 'message': 'You have already submitted your choice'}), 400

    data = request.json
    choice = data.get('choice', '').strip()

    if not choice or len(choice) > 1000:
        return jsonify({'status': 'error', 'message': 'Invalid choice'}), 400

    # Sanitize HTML
    import html
    choice = html.escape(choice)

    # Record choice
    import time
    player_choice = PlayerChoice(player_id=player_id, choice=choice, timestamp=time.time())
    game_session.current_scenario.choices_submitted[player_id] = player_choice

    all_submitted = game_session.all_choices_submitted()

    # SOCKETIO: Broadcast via client's 'choice_submitted' event emission

    return jsonify({
        'status': 'success',
        'message': 'Choice submitted!',
        'choices_submitted': len(game_session.current_scenario.choices_submitted),
        'total_players': len(game_session.players),
        'all_submitted': all_submitted,
        'waiting_for': game_session.get_waiting_players()
    })

# ... Continue with other endpoints from original web_game.py ...
# (For brevity, showing key modified endpoints. Full file would include all endpoints)

# CSRF Token endpoint
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Provide CSRF token to frontend"""
    token = generate_csrf()
    return jsonify({'csrf_token': token})

@app.route('/')
def index():
    """RPG Game Main Menu"""
    return send_from_directory('static', 'rpg_game.html')

# ============================================================================
# SERVER START
# ============================================================================

if __name__ == '__main__':
    print("""
===============================================================
    THE ARCANE CODEX - REAL-TIME MULTIPLAYER
===============================================================

PHASE H: SocketIO Real-Time Enhancements

FEATURES:
- Real-time updates (NO MORE POLLING!)
- Room-based messaging (one room per game code)
- Instant notifications for:
  * Player joins/leaves
  * Choice submissions
  * Turn resolutions
  * Scenario generation
- Reconnection handling
- Presence indicators

SOCKETIO EVENTS:
  Connection:
    - connect/disconnect
    - reconnect
    - join_game_room

  Scenarios:
    - choice_submitted
    - scenario_generated
    - turn_resolved

  Presence:
    - player_connected
    - player_disconnected
    - player_reconnected
    - presence_update

  Utility:
    - ping/pong
    - typing

===============================================================
""")

    # Run with SocketIO instead of app.run()
    socketio.run(
        app,
        debug=True,
        host='0.0.0.0',
        port=5000,
        use_reloader=False  # Prevent session wipe
    )
