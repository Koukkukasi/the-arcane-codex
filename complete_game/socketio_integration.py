"""
PHASE H: Real-Time Multiplayer SocketIO Integration
Server-side event handlers for The Arcane Codex

This module provides:
- Room-based messaging (one room per game code)
- Real-time event broadcasting
- Reconnection handling
- Presence tracking
- Session-based authentication integration
"""

from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect, rooms
from flask import request, session
from functools import wraps
import logging
from typing import Dict, Optional, Set
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# SOCKETIO INITIALIZATION
# ============================================================================

def init_socketio(app, game_sessions_dict):
    """
    Initialize SocketIO with the Flask app

    Args:
        app: Flask application instance
        game_sessions_dict: Reference to game_sessions dictionary from web_game.py

    Returns:
        socketio: Configured SocketIO instance
    """
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

    # Store reference to game sessions
    socketio.game_sessions = game_sessions_dict

    # Track connected clients: socket_id -> {player_id, game_code, connected_at}
    socketio.connected_clients: Dict[str, dict] = {}

    # Track player presence: game_code -> set of player_ids
    socketio.player_presence: Dict[str, Set[str]] = {}

    logger.info("[SocketIO] Initialized with eventlet async mode")

    return socketio


# ============================================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================================

def authenticated_only(f):
    """
    Decorator to require authentication for SocketIO events
    Checks for valid session with player_id
    """
    @wraps(f)
    def wrapped(*args, **kwargs):
        player_id = session.get('player_id')
        if not player_id:
            logger.warning(f"[SocketIO] Unauthenticated connection attempt from {request.sid}")
            emit('error', {
                'message': 'Authentication required',
                'code': 'AUTH_REQUIRED'
            })
            disconnect()
            return
        return f(*args, **kwargs)
    return wrapped


def in_game_only(f):
    """
    Decorator to require player to be in a game
    Checks for valid game_code in session
    """
    @wraps(f)
    def wrapped(*args, **kwargs):
        game_code = session.get('game_code')
        if not game_code:
            emit('error', {
                'message': 'Not in a game',
                'code': 'NO_GAME'
            })
            return
        return f(*args, **kwargs)
    return wrapped


# ============================================================================
# CONNECTION MANAGEMENT
# ============================================================================

def setup_connection_handlers(socketio):
    """Setup connection/disconnection event handlers"""

    @socketio.on('connect')
    def handle_connect():
        """Handle new client connection"""
        player_id = session.get('player_id')
        game_code = session.get('game_code')

        if not player_id:
            logger.warning(f"[SocketIO] Connection rejected - no player_id: {request.sid}")
            return False  # Reject connection

        # Store connection info
        socketio.connected_clients[request.sid] = {
            'player_id': player_id,
            'game_code': game_code,
            'connected_at': datetime.now().isoformat()
        }

        logger.info(f"[SocketIO] Client connected: {request.sid} (player: {player_id[:8]}...)")

        # If player is in a game, join the room and announce presence
        if game_code and game_code in socketio.game_sessions:
            join_room(game_code)

            # Track presence
            if game_code not in socketio.player_presence:
                socketio.player_presence[game_code] = set()
            socketio.player_presence[game_code].add(player_id)

            # Get player info
            game_session = socketio.game_sessions[game_code]
            player_name = game_session.players.get(player_id, 'Unknown')

            logger.info(f"[SocketIO] Player {player_name} joined room {game_code}")

            # Notify others in the room
            emit('player_connected', {
                'player_id': player_id,
                'player_name': player_name,
                'timestamp': datetime.now().isoformat()
            }, room=game_code, skip_sid=request.sid)

            # Send presence list to the connecting player
            emit('presence_update', {
                'online_players': list(socketio.player_presence[game_code]),
                'total_players': len(game_session.players)
            })

        return True


    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        if request.sid not in socketio.connected_clients:
            return

        client_info = socketio.connected_clients[request.sid]
        player_id = client_info['player_id']
        game_code = client_info['game_code']

        logger.info(f"[SocketIO] Client disconnected: {request.sid} (player: {player_id[:8]}...)")

        # Update presence
        if game_code and game_code in socketio.player_presence:
            socketio.player_presence[game_code].discard(player_id)

            # Notify others in the room
            if game_code in socketio.game_sessions:
                game_session = socketio.game_sessions[game_code]
                player_name = game_session.players.get(player_id, 'Unknown')

                emit('player_disconnected', {
                    'player_id': player_id,
                    'player_name': player_name,
                    'timestamp': datetime.now().isoformat()
                }, room=game_code)

                # Send updated presence to room
                emit('presence_update', {
                    'online_players': list(socketio.player_presence[game_code]),
                    'total_players': len(game_session.players)
                }, room=game_code)

        # Clean up
        del socketio.connected_clients[request.sid]


    @socketio.on('reconnect')
    @authenticated_only
    def handle_reconnect():
        """Handle explicit reconnection request"""
        player_id = session.get('player_id')
        game_code = session.get('game_code')

        logger.info(f"[SocketIO] Reconnection request from {player_id[:8]}...")

        if game_code and game_code in socketio.game_sessions:
            # Re-join room
            join_room(game_code)

            # Update presence
            if game_code not in socketio.player_presence:
                socketio.player_presence[game_code] = set()
            socketio.player_presence[game_code].add(player_id)

            # Get current game state
            game_session = socketio.game_sessions[game_code]

            # Send full sync to reconnecting player
            state_data = {
                'game_code': game_code,
                'players': [
                    {
                        'player_id': pid,
                        'player_name': pname,
                        'class': game_session.player_classes.get(pid, 'Unknown'),
                        'online': pid in socketio.player_presence[game_code]
                    }
                    for pid, pname in game_session.players.items()
                ],
                'game_started': game_session.game_started,
                'has_scenario': game_session.current_scenario is not None
            }

            if game_session.current_scenario:
                state_data['scenario'] = {
                    'scenario_id': game_session.current_scenario.scenario_id,
                    'theme': game_session.current_scenario.theme,
                    'turn_number': game_session.current_scenario.turn_number,
                    'resolved': game_session.current_scenario.resolved,
                    'choices_submitted': len(game_session.current_scenario.choices_submitted),
                    'total_players': len(game_session.players),
                    'waiting_for': game_session.get_waiting_players()
                }

            emit('reconnect_sync', state_data)

            # Notify others
            player_name = game_session.players.get(player_id, 'Unknown')
            emit('player_reconnected', {
                'player_id': player_id,
                'player_name': player_name,
                'timestamp': datetime.now().isoformat()
            }, room=game_code, skip_sid=request.sid)


# ============================================================================
# GAME SESSION EVENTS
# ============================================================================

def setup_game_session_handlers(socketio):
    """Setup game session event handlers"""

    @socketio.on('join_game_room')
    @authenticated_only
    def handle_join_game_room(data):
        """Join a game room (called after joining via HTTP API)"""
        game_code = data.get('game_code', '').upper()
        player_id = session.get('player_id')

        if not game_code or game_code not in socketio.game_sessions:
            emit('error', {'message': 'Invalid game code', 'code': 'INVALID_GAME'})
            return

        game_session = socketio.game_sessions[game_code]

        # Verify player is actually in this game
        if player_id not in game_session.players:
            emit('error', {'message': 'Not authorized for this game', 'code': 'NOT_IN_GAME'})
            return

        # Join the room
        join_room(game_code)

        # Update presence
        if game_code not in socketio.player_presence:
            socketio.player_presence[game_code] = set()
        socketio.player_presence[game_code].add(player_id)

        # Update connection tracking
        if request.sid in socketio.connected_clients:
            socketio.connected_clients[request.sid]['game_code'] = game_code

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
            'online_players': list(socketio.player_presence[game_code]),
            'total_players': len(game_session.players)
        }, room=game_code)


# ============================================================================
# SCENARIO & TURN EVENTS
# ============================================================================

def setup_scenario_handlers(socketio):
    """Setup scenario and turn-based event handlers"""

    @socketio.on('choice_submitted')
    @authenticated_only
    @in_game_only
    def handle_choice_submitted(data):
        """
        Broadcast when a player submits their choice
        Note: Choice is already saved via HTTP API
        """
        game_code = session.get('game_code')
        player_id = session.get('player_id')

        game_session = socketio.game_sessions.get(game_code)
        if not game_session or not game_session.current_scenario:
            return

        player_name = game_session.players.get(player_id, 'Unknown')

        # Broadcast to room (excluding sender)
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


    @socketio.on('scenario_generated')
    @authenticated_only
    @in_game_only
    def handle_scenario_generated(data):
        """Broadcast new scenario to all players"""
        game_code = session.get('game_code')

        emit('new_scenario', {
            'scenario_id': data.get('scenario_id'),
            'theme': data.get('theme'),
            'turn_number': data.get('turn_number'),
            'timestamp': datetime.now().isoformat(),
            'message': 'New scenario available! Check your whisper.'
        }, room=game_code)

        logger.info(f"[SocketIO] New scenario broadcast to room {game_code}")


    @socketio.on('turn_resolved')
    @authenticated_only
    @in_game_only
    def handle_turn_resolved(data):
        """Broadcast turn resolution to all players"""
        game_code = session.get('game_code')

        emit('turn_resolution', {
            'turn_number': data.get('turn_number'),
            'trust_change': data.get('trust_change'),
            'timestamp': datetime.now().isoformat(),
            'message': 'Turn resolved! View the outcome.'
        }, room=game_code)

        logger.info(f"[SocketIO] Turn resolution broadcast to room {game_code}")


# ============================================================================
# UTILITY EVENTS
# ============================================================================

def setup_utility_handlers(socketio):
    """Setup utility event handlers"""

    @socketio.on('request_presence')
    @authenticated_only
    @in_game_only
    def handle_request_presence():
        """Request current presence information"""
        game_code = session.get('game_code')

        if game_code in socketio.game_sessions:
            game_session = socketio.game_sessions[game_code]
            online_players = list(socketio.player_presence.get(game_code, set()))

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


    @socketio.on('ping')
    @authenticated_only
    def handle_ping():
        """Respond to client ping (for connection testing)"""
        emit('pong', {'timestamp': datetime.now().isoformat()})


    @socketio.on('typing')
    @authenticated_only
    @in_game_only
    def handle_typing(data):
        """Broadcast typing indicator to room"""
        game_code = session.get('game_code')
        player_id = session.get('player_id')

        game_session = socketio.game_sessions.get(game_code)
        if not game_session:
            return

        player_name = game_session.players.get(player_id, 'Unknown')
        is_typing = data.get('is_typing', False)

        emit('player_typing', {
            'player_id': player_id,
            'player_name': player_name,
            'is_typing': is_typing
        }, room=game_code, skip_sid=request.sid)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def broadcast_to_game(socketio, game_code: str, event: str, data: dict, exclude_player: Optional[str] = None):
    """
    Helper function to broadcast events to a game room

    Args:
        socketio: SocketIO instance
        game_code: Game code (room name)
        event: Event name
        data: Event payload
        exclude_player: Optional player_id to exclude from broadcast
    """
    if exclude_player:
        # Find socket ID for player to exclude
        exclude_sid = None
        for sid, client_info in socketio.connected_clients.items():
            if client_info['player_id'] == exclude_player and client_info['game_code'] == game_code:
                exclude_sid = sid
                break

        socketio.emit(event, data, room=game_code, skip_sid=exclude_sid)
    else:
        socketio.emit(event, data, room=game_code)

    logger.debug(f"[SocketIO] Broadcast {event} to room {game_code}")


def get_online_players(socketio, game_code: str) -> Set[str]:
    """
    Get set of online player IDs for a game

    Args:
        socketio: SocketIO instance
        game_code: Game code

    Returns:
        Set of player IDs currently online
    """
    return socketio.player_presence.get(game_code, set())


def is_player_online(socketio, game_code: str, player_id: str) -> bool:
    """
    Check if a specific player is online

    Args:
        socketio: SocketIO instance
        game_code: Game code
        player_id: Player ID to check

    Returns:
        True if player is online, False otherwise
    """
    return player_id in socketio.player_presence.get(game_code, set())


# ============================================================================
# MAIN SETUP FUNCTION
# ============================================================================

def setup_socketio_handlers(socketio):
    """
    Setup all SocketIO event handlers

    Call this after initializing SocketIO
    """
    setup_connection_handlers(socketio)
    setup_game_session_handlers(socketio)
    setup_scenario_handlers(socketio)
    setup_utility_handlers(socketio)

    logger.info("[SocketIO] All event handlers registered")
