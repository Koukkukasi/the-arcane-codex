"""
The Arcane Codex - Main Application Server
Flask + SocketIO for real-time multiplayer gameplay
"""

from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import secrets
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
import logging

from database import ArcaneDatabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)
app.config['JSON_SORT_KEYS'] = False

# Initialize SocketIO with CORS support
socketio = SocketIO(app,
                   cors_allowed_origins="*",
                   async_mode='threading',
                   logger=True,
                   engineio_logger=True)

# Initialize database
db = ArcaneDatabase()

# Active game sessions (for quick access)
active_games = {}

# Player socket mapping
player_sockets = {}  # socket_id -> player_id

# ========== Web Routes ==========

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/game')
def game():
    """Main game interface"""
    return render_template('game.html')

@app.route('/api/create_game', methods=['POST'])
def create_game():
    """Create a new game session"""
    try:
        # Generate unique game code
        code = generate_game_code()

        # Create game in database
        game_id = db.create_game(code)

        # Add to active games
        active_games[code] = {
            'id': game_id,
            'code': code,
            'players': [],
            'phase': 'waiting',
            'created_at': datetime.now().isoformat()
        }

        logger.info(f"Game created: {code}")

        return jsonify({
            'success': True,
            'code': code,
            'game_id': game_id
        })

    except Exception as e:
        logger.error(f"Error creating game: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/join_game', methods=['POST'])
def join_game():
    """Join an existing game"""
    try:
        data = request.json
        code = data.get('code', '').upper()
        player_name = data.get('player_name', '')

        if not code or not player_name:
            return jsonify({
                'success': False,
                'error': 'Game code and player name required'
            }), 400

        # Check if game exists
        game = db.get_game_by_code(code)
        if not game:
            return jsonify({
                'success': False,
                'error': 'Game not found'
            }), 404

        # Check if game is full (max 4 players)
        current_players = db.get_players_in_game(game['id'])
        if len(current_players) >= 4:
            return jsonify({
                'success': False,
                'error': 'Game is full (max 4 players)'
            }), 400

        # Create player
        player_id = db.create_player(game['id'], player_name)

        # Update active games
        if code in active_games:
            active_games[code]['players'].append({
                'id': player_id,
                'name': player_name
            })

        logger.info(f"Player {player_name} joined game {code}")

        return jsonify({
            'success': True,
            'game_id': game['id'],
            'player_id': player_id,
            'player_name': player_name
        })

    except Exception as e:
        logger.error(f"Error joining game: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/game_state/<game_id>')
def get_game_state(game_id):
    """Get current game state"""
    try:
        game = db.get_game_by_code(game_id)
        if not game:
            # Try by ID
            with db.get_connection() as conn:
                result = conn.execute("""
                    SELECT * FROM games WHERE id = ?
                """, (game_id,)).fetchone()
                if result:
                    game = dict(result)
                    game['state'] = json.loads(game['state'])

        if not game:
            return jsonify({'error': 'Game not found'}), 404

        # Get players
        players = db.get_players_in_game(game['id'])

        # Get NPCs
        npcs = db.get_npcs_for_game(game['id'])

        # Get current turn whispers
        whispers = db.get_whispers_for_turn(game['id'], game['turn'])

        return jsonify({
            'success': True,
            'game': game,
            'players': players,
            'npcs': npcs,
            'whispers': whispers
        })

    except Exception as e:
        logger.error(f"Error getting game state: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ========== WebSocket Events ==========

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

    # Clean up player socket mapping
    if request.sid in player_sockets:
        player_id = player_sockets[request.sid]
        del player_sockets[request.sid]

        # Notify game room
        # TODO: Handle player disconnection in game

@socketio.on('join_game_room')
def handle_join_game_room(data):
    """Join a game room for real-time updates"""
    try:
        game_id = data.get('game_id')
        player_id = data.get('player_id')

        if not game_id or not player_id:
            emit('error', {'message': 'Missing game_id or player_id'})
            return

        # Join game room
        join_room(game_id)
        logger.info(f"Socket {request.sid} joined game room {game_id}")

        # Join private room for whispers
        player_room = f"player_{player_id}"
        join_room(player_room)
        logger.info(f"Socket {request.sid} joined private room {player_room}")

        # Map socket to player
        player_sockets[request.sid] = player_id

        # Get player info
        player = db.get_player(player_id)

        # Notify room
        emit('player_joined', {
            'player_id': player_id,
            'player_name': player['name'] if player else 'Unknown'
        }, room=game_id, skip_sid=request.sid)

        # Send current game state to joining player
        emit('game_state_update', {
            'message': 'Successfully joined game',
            'player_id': player_id
        })

    except Exception as e:
        logger.error(f"Error joining game room: {e}")
        emit('error', {'message': str(e)})

@socketio.on('submit_action')
def handle_submit_action(data):
    """Handle player action submission"""
    try:
        game_id = data.get('game_id')
        player_id = data.get('player_id')
        action = data.get('action')

        if not all([game_id, player_id, action]):
            emit('error', {'message': 'Missing required data'})
            return

        # Submit action to database
        db.submit_action(game_id, player_id, action)

        # Check if all players have acted
        if db.all_players_acted(game_id):
            # Trigger AI GM processing (will be implemented in Phase 2)
            logger.info(f"All players acted in game {game_id}, ready for AI GM")

            # For now, notify that turn is ready
            emit('turn_ready', {
                'message': 'All players have acted, processing turn...'
            }, room=game_id)

            # Clear actions for next turn
            db.clear_pending_actions(game_id)
            db.advance_turn(game_id)

        # Notify room of action submission
        emit('action_submitted', {
            'player_id': player_id,
            'status': 'Action submitted'
        }, room=game_id)

    except Exception as e:
        logger.error(f"Error submitting action: {e}")
        emit('error', {'message': str(e)})

@socketio.on('share_whisper')
def handle_share_whisper(data):
    """Handle sharing a private whisper with the party"""
    try:
        game_id = data.get('game_id')
        whisper_id = data.get('whisper_id')
        whisper_content = data.get('content')
        sense_type = data.get('sense_type')

        # Mark whisper as shared in database
        if whisper_id:
            db.share_whisper(whisper_id)

        # Broadcast to game room
        emit('whisper_shared', {
            'player_id': player_sockets.get(request.sid),
            'sense_type': sense_type,
            'content': whisper_content
        }, room=game_id)

    except Exception as e:
        logger.error(f"Error sharing whisper: {e}")
        emit('error', {'message': str(e)})

@socketio.on('send_message')
def handle_send_message(data):
    """Handle chat messages between players"""
    try:
        game_id = data.get('game_id')
        player_id = data.get('player_id')
        message = data.get('message')

        # Get player name
        player = db.get_player(player_id)
        player_name = player['name'] if player else 'Unknown'

        # Broadcast to game room
        emit('chat_message', {
            'player_id': player_id,
            'player_name': player_name,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }, room=game_id)

    except Exception as e:
        logger.error(f"Error sending message: {e}")
        emit('error', {'message': str(e)})

# ========== Broadcast Functions ==========

def broadcast_scenario(game_id: str, scenario: dict):
    """Broadcast scenario to all players"""
    # Public narration to everyone
    socketio.emit('scenario_update', {
        'public': scenario.get('public', ''),
        'turn': scenario.get('turn', 0),
        'choices': scenario.get('choices', [])
    }, room=game_id)

    # Private whispers
    for player_id, whispers in scenario.get('whispers', {}).items():
        socketio.emit('private_whispers', whispers,
                     room=f"player_{player_id}")

    # Sensory data (Phase 3)
    for player_id, senses in scenario.get('sensory', {}).items():
        socketio.emit('sensory_update', senses,
                     room=f"player_{player_id}")

def broadcast_divine_council(game_id: str, council_result: dict):
    """Broadcast Divine Council results"""
    socketio.emit('divine_council', council_result, room=game_id)

def broadcast_npc_action(game_id: str, npc_action: dict):
    """Broadcast NPC actions"""
    socketio.emit('npc_action', npc_action, room=game_id)

# ========== Helper Functions ==========

def generate_game_code() -> str:
    """Generate a unique 6-character game code"""
    import random
    import string

    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # Check if code already exists
        existing = db.get_game_by_code(code)
        if not existing:
            return code

def validate_player_session(game_id: str, player_id: str) -> bool:
    """Validate that a player belongs to a game"""
    player = db.get_player(player_id)
    return player and player['game_id'] == game_id

# ========== Error Handlers ==========

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ========== Main Entry Point ==========

if __name__ == '__main__':
    logger.info("Starting The Arcane Codex server...")
    logger.info("Database initialized")
    logger.info("Server ready at http://localhost:5000")

    # Run with SocketIO
    socketio.run(app,
                debug=True,
                host='0.0.0.0',
                port=5000,
                allow_unsafe_werkzeug=True)