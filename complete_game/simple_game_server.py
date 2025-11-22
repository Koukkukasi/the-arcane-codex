#!/usr/bin/env python3
"""
Simple Game Server - Provides API endpoints for The Arcane Codex game
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Game storage (in-memory for simplicity)
games = {}
players = {}

def generate_game_code():
    """Generate a random 6-character game code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# Serve the main HTML file
@app.route('/')
def index():
    return send_from_directory('static', 'game_flow_beautiful_integrated.html')

# Serve static files
@app.route('/css/<path:filename>')
def serve_css(filename):
    css_path = os.path.join(app.static_folder, 'css')
    if os.path.exists(os.path.join(css_path, filename)):
        return send_from_directory(css_path, filename)
    else:
        # Return empty CSS to prevent 404 errors
        return '', 200, {'Content-Type': 'text/css'}

@app.route('/js/<path:filename>')
def serve_js(filename):
    js_path = os.path.join(app.static_folder, 'js')
    if os.path.exists(os.path.join(js_path, filename)):
        return send_from_directory(js_path, filename)
    else:
        # Return empty JS to prevent 404 errors
        return '// File not found: ' + filename, 200, {'Content-Type': 'application/javascript'}

# API Endpoints
@app.route('/api/create_game', methods=['POST'])
def create_game():
    """Create a new game session"""
    try:
        game_code = generate_game_code()

        # Store game info
        games[game_code] = {
            'code': game_code,
            'players': [],
            'host': request.json.get('player_name', 'Host'),
            'status': 'waiting',
            'max_players': 4
        }

        logger.info(f"Created new game: {game_code}")

        return jsonify({
            'status': 'success',
            'game_code': game_code,
            'message': 'Game created successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error creating game: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to create game'
        }), 500

@app.route('/api/join_game', methods=['POST'])
def join_game():
    """Join an existing game session"""
    try:
        data = request.json
        game_code = data.get('game_code', '').upper()
        player_name = data.get('player_name', 'Player')

        logger.info(f"Join game request: code={game_code}, player={player_name}")

        # For testing, accept any game code and create it if it doesn't exist
        if game_code not in games:
            games[game_code] = {
                'code': game_code,
                'players': [],
                'host': player_name,
                'status': 'waiting',
                'max_players': 4
            }
            logger.info(f"Created game {game_code} on join request")

        game = games[game_code]

        # Check if game is full
        if len(game['players']) >= game['max_players']:
            return jsonify({
                'status': 'error',
                'message': 'Game is full'
            }), 400

        # Add player to game
        player_id = f"{game_code}_{player_name}_{random.randint(1000,9999)}"
        game['players'].append({
            'id': player_id,
            'name': player_name,
            'ready': False
        })

        logger.info(f"Player {player_name} joined game {game_code}")

        return jsonify({
            'status': 'success',
            'game_code': game_code,
            'player_id': player_id,
            'message': 'Joined game successfully',
            'game_info': {
                'players': len(game['players']),
                'max_players': game['max_players'],
                'host': game['host']
            }
        }), 200

    except Exception as e:
        logger.error(f"Error joining game: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to join game'
        }), 500

@app.route('/api/game_status/<game_code>', methods=['GET'])
def game_status(game_code):
    """Get the status of a game"""
    game_code = game_code.upper()

    if game_code not in games:
        return jsonify({
            'status': 'error',
            'message': 'Game not found'
        }), 404

    game = games[game_code]
    return jsonify({
        'status': 'success',
        'game': {
            'code': game['code'],
            'player_count': len(game['players']),
            'max_players': game['max_players'],
            'game_status': game['status'],
            'players': [{'name': p['name'], 'ready': p['ready']} for p in game['players']]
        }
    }), 200

@app.route('/api/start_game', methods=['POST'])
def start_game():
    """Start a game session"""
    try:
        data = request.json
        game_code = data.get('game_code', '').upper()

        if game_code not in games:
            return jsonify({
                'status': 'error',
                'message': 'Game not found'
            }), 404

        game = games[game_code]
        game['status'] = 'in_progress'

        logger.info(f"Started game: {game_code}")

        return jsonify({
            'status': 'success',
            'message': 'Game started',
            'game_code': game_code
        }), 200

    except Exception as e:
        logger.error(f"Error starting game: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to start game'
        }), 500

# Socket.IO Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to game server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_game')
def handle_join_game(data):
    """Handle player joining a game room"""
    game_code = data.get('game_code', '').upper()
    player_name = data.get('player_name', 'Player')

    join_room(game_code)

    # Notify other players
    emit('player_joined', {
        'player_name': player_name,
        'game_code': game_code
    }, room=game_code, include_self=False)

    logger.info(f"Player {player_name} joined room {game_code}")

@socketio.on('leave_game')
def handle_leave_game(data):
    """Handle player leaving a game room"""
    game_code = data.get('game_code', '').upper()
    player_name = data.get('player_name', 'Player')

    leave_room(game_code)

    # Notify other players
    emit('player_left', {
        'player_name': player_name,
        'game_code': game_code
    }, room=game_code, include_self=False)

    logger.info(f"Player {player_name} left room {game_code}")

@socketio.on('player_ready')
def handle_player_ready(data):
    """Handle player ready status"""
    game_code = data.get('game_code', '').upper()
    player_name = data.get('player_name', 'Player')
    ready = data.get('ready', True)

    if game_code in games:
        game = games[game_code]
        for player in game['players']:
            if player['name'] == player_name:
                player['ready'] = ready
                break

        # Notify all players in the room
        emit('player_status_update', {
            'player_name': player_name,
            'ready': ready,
            'all_ready': all(p['ready'] for p in game['players'])
        }, room=game_code)

    logger.info(f"Player {player_name} ready status: {ready}")

@socketio.on('game_action')
def handle_game_action(data):
    """Handle in-game actions"""
    game_code = data.get('game_code', '').upper()
    action = data.get('action')

    # Broadcast action to all players in the game
    emit('game_update', {
        'action': action,
        'data': data
    }, room=game_code)

    logger.info(f"Game action in {game_code}: {action}")

# Health check endpoint
@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Arcane Codex Game Server',
        'games_active': len(games),
        'version': '1.0.0'
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Arcane Codex Game Server on port {port}")
    logger.info("Available endpoints:")
    logger.info("  GET  / - Main game page")
    logger.info("  POST /api/create_game - Create new game")
    logger.info("  POST /api/join_game - Join existing game")
    logger.info("  GET  /api/game_status/<code> - Get game status")
    logger.info("  POST /api/start_game - Start game")
    logger.info("  GET  /health - Health check")

    socketio.run(app, host='0.0.0.0', port=port, debug=True)