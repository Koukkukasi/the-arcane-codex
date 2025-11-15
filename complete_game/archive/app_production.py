"""
The Arcane Codex - Production-Optimized Flask Server
Enhanced with connection pooling, caching, security, and monitoring
"""

from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import secrets
import json
import asyncio
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from logging.handlers import RotatingFileHandler
import signal
import sys

from database_pooled import ArcaneDatabase
from performance_monitor import PerformanceMonitor, measure_performance
from reconnection_handler import ReconnectionHandler
from cache_manager import CacheManager
from security import SecurityManager, rate_limit, validate_input
from health_check import HealthCheck

# ========== CONFIGURATION ==========

class ProductionConfig:
    """Production configuration"""
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))
    JSON_SORT_KEYS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max request size

    # SocketIO
    SOCKETIO_ASYNC_MODE = 'eventlet'  # Use eventlet for production
    SOCKETIO_PING_TIMEOUT = 60
    SOCKETIO_PING_INTERVAL = 25
    SOCKETIO_MESSAGE_QUEUE = os.getenv('REDIS_URL', None)  # Redis for multi-worker support
    SOCKETIO_ENGINEIO_LOGGER = False  # Disable in production

    # Database
    DB_PATH = os.getenv('DB_PATH', 'arcane_codex.db')
    DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', 20))
    DB_TIMEOUT = int(os.getenv('DB_TIMEOUT', 30))

    # Redis Cache
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'true').lower() == 'true'
    CACHE_DEFAULT_TTL = int(os.getenv('CACHE_DEFAULT_TTL', 300))

    # Security
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    MAX_REQUESTS_PER_MINUTE = int(os.getenv('MAX_REQUESTS_PER_MINUTE', 60))

    # Performance
    ENABLE_COMPRESSION = True
    ENABLE_MONITORING = True
    MAX_CONCURRENT_GAMES = int(os.getenv('MAX_CONCURRENT_GAMES', 100))

    # Reconnection
    RECONNECT_TIMEOUT_MINUTES = int(os.getenv('RECONNECT_TIMEOUT_MINUTES', 10))

config = ProductionConfig()

# ========== LOGGING SETUP ==========

def setup_logging():
    """Configure production logging"""
    # Create logs directory
    os.makedirs('logs', exist_ok=True)

    # Root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Console handler (for Docker)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File handler with rotation
    file_handler = RotatingFileHandler(
        'logs/arcane_codex.log',
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(console_formatter)
    logger.addHandler(file_handler)

    # Error file handler
    error_handler = RotatingFileHandler(
        'logs/errors.log',
        maxBytes=10 * 1024 * 1024,
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(console_formatter)
    logger.addHandler(error_handler)

    return logging.getLogger(__name__)

logger = setup_logging()

# ========== FLASK APP INITIALIZATION ==========

app = Flask(__name__)
app.config.from_object(config)

# CORS configuration
CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

# SocketIO with production settings
socketio = SocketIO(
    app,
    cors_allowed_origins=config.CORS_ORIGINS,
    async_mode=config.SOCKETIO_ASYNC_MODE,
    logger=False,
    engineio_logger=config.SOCKETIO_ENGINEIO_LOGGER,
    ping_timeout=config.SOCKETIO_PING_TIMEOUT,
    ping_interval=config.SOCKETIO_PING_INTERVAL,
    message_queue=config.SOCKETIO_MESSAGE_QUEUE
)

# ========== SYSTEM COMPONENTS ==========

# Database with connection pooling
db = ArcaneDatabase(
    db_path=config.DB_PATH,
    pool_size=config.DB_POOL_SIZE,
    timeout=config.DB_TIMEOUT
)

# Performance monitoring
performance_monitor = PerformanceMonitor() if config.ENABLE_MONITORING else None

# Cache manager (Redis if available, in-memory fallback)
cache_manager = CacheManager(
    redis_url=config.REDIS_URL if config.CACHE_ENABLED else None,
    default_ttl=config.CACHE_DEFAULT_TTL
)

# Security manager
security_manager = SecurityManager(
    rate_limit_enabled=config.RATE_LIMIT_ENABLED,
    max_requests=config.MAX_REQUESTS_PER_MINUTE
)

# Reconnection handler
reconnection_handler = ReconnectionHandler(
    socketio=socketio,
    db=db,
    timeout_minutes=config.RECONNECT_TIMEOUT_MINUTES
)

# Health check system
health_check = HealthCheck(db=db, cache=cache_manager)

# Active game sessions
active_games = {}
player_sockets = {}

# ========== MIDDLEWARE ==========

@app.before_request
def before_request():
    """Pre-request middleware"""
    # Rate limiting
    if config.RATE_LIMIT_ENABLED:
        client_ip = request.remote_addr
        if not security_manager.check_rate_limit(client_ip):
            return jsonify({
                'success': False,
                'error': 'Rate limit exceeded. Please try again later.'
            }), 429

    # Request ID for tracing
    request.request_id = secrets.token_hex(8)

    # Start timing
    request.start_time = datetime.now()

@app.after_request
def after_request(response):
    """Post-request middleware"""
    # Add security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

    # Add request ID
    if hasattr(request, 'request_id'):
        response.headers['X-Request-ID'] = request.request_id

    # Log request timing
    if hasattr(request, 'start_time') and performance_monitor:
        duration = (datetime.now() - request.start_time).total_seconds()
        performance_monitor.record_operation_time(
            f"{request.method}_{request.endpoint}",
            duration
        )

    return response

# ========== HEALTH & MONITORING ENDPOINTS ==========

@app.route('/health')
def health():
    """Health check endpoint"""
    return health_check.get_health_status()

@app.route('/health/ready')
def ready():
    """Readiness check for load balancer"""
    return health_check.get_readiness_status()

@app.route('/health/live')
def live():
    """Liveness check for orchestration"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

@app.route('/metrics')
@rate_limit(max_requests=10)
def metrics():
    """Prometheus-compatible metrics endpoint"""
    if not performance_monitor:
        return jsonify({'error': 'Monitoring disabled'}), 503

    report = performance_monitor.get_report(period_minutes=5)

    return jsonify({
        'active_games': len(active_games),
        'active_connections': len(player_sockets),
        'cache_hit_rate': cache_manager.get_hit_rate(),
        'performance': {
            'averages': report.averages,
            'peaks': report.peaks
        },
        'warnings': report.warnings
    })

# ========== WEB ROUTES ==========

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/game')
def game():
    """Main game interface"""
    return render_template('game.html')

@app.route('/api/create_game', methods=['POST'])
@rate_limit(max_requests=5)
@validate_input(['player_name'])
def create_game():
    """Create a new game session"""
    try:
        # Check game limit
        if len(active_games) >= config.MAX_CONCURRENT_GAMES:
            return jsonify({
                'success': False,
                'error': 'Server at capacity. Please try again later.'
            }), 503

        # Generate unique game code
        code = generate_game_code()

        # Create game in database
        game_id = db.create_game(code)

        # Add to active games with metadata
        active_games[code] = {
            'id': game_id,
            'code': code,
            'players': [],
            'phase': 'waiting',
            'created_at': datetime.now().isoformat(),
            'last_activity': datetime.now()
        }

        # Cache game data
        cache_manager.set(f"game:{code}", active_games[code], ttl=3600)

        logger.info(f"Game created: {code} (id: {game_id})")

        if performance_monitor:
            performance_monitor.record_metric('games.created', 1, 'count')

        return jsonify({
            'success': True,
            'code': code,
            'game_id': game_id
        })

    except Exception as e:
        logger.error(f"Error creating game: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Failed to create game'
        }), 500

@app.route('/api/join_game', methods=['POST'])
@rate_limit(max_requests=10)
@validate_input(['code', 'player_name'])
def join_game():
    """Join an existing game"""
    try:
        data = request.json
        code = data.get('code', '').upper().strip()
        player_name = data.get('player_name', '').strip()

        if not code or not player_name:
            return jsonify({
                'success': False,
                'error': 'Game code and player name required'
            }), 400

        # Input validation
        if len(player_name) > 50:
            return jsonify({
                'success': False,
                'error': 'Player name too long (max 50 characters)'
            }), 400

        if not player_name.replace(' ', '').isalnum():
            return jsonify({
                'success': False,
                'error': 'Player name contains invalid characters'
            }), 400

        # Check cache first
        game = cache_manager.get(f"game:{code}")
        if not game:
            game = db.get_game_by_code(code)
            if game:
                cache_manager.set(f"game:{code}", game, ttl=300)

        if not game:
            return jsonify({
                'success': False,
                'error': 'Game not found'
            }), 404

        # Check if game is full
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
            active_games[code]['last_activity'] = datetime.now()

        # Invalidate game cache
        cache_manager.delete(f"game:{code}")

        logger.info(f"Player {player_name} joined game {code}")

        if performance_monitor:
            performance_monitor.record_metric('players.joined', 1, 'count')

        return jsonify({
            'success': True,
            'game_id': game['id'],
            'player_id': player_id,
            'player_name': player_name
        })

    except Exception as e:
        logger.error(f"Error joining game: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Failed to join game'
        }), 500

@app.route('/api/game_state/<game_id>')
@rate_limit(max_requests=30)
def get_game_state(game_id):
    """Get current game state with caching"""
    try:
        # Try cache first
        cache_key = f"game_state:{game_id}"
        cached_state = cache_manager.get(cache_key)

        if cached_state:
            return jsonify(cached_state)

        # Fetch from database
        game = db.get_game_by_code(game_id)
        if not game:
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

        response_data = {
            'success': True,
            'game': game,
            'players': players,
            'npcs': npcs,
            'whispers': whispers
        }

        # Cache for 10 seconds
        cache_manager.set(cache_key, response_data, ttl=10)

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error getting game state: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Failed to get game state'
        }), 500

# ========== WEBSOCKET EVENTS ==========

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")

    if performance_monitor:
        performance_monitor.record_metric('websocket.connections', 1, 'count')

    emit('connected', {
        'status': 'Connected to server',
        'server_time': datetime.now().isoformat()
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

    # Handle reconnection
    player_id = reconnection_handler.handle_disconnect(request.sid)

    if player_id:
        logger.info(f"Player {player_id} disconnected, reconnection enabled")

    # Clean up player socket mapping
    if request.sid in player_sockets:
        del player_sockets[request.sid]

@socketio.on('join_game_room')
def handle_join_game_room(data):
    """Join a game room for real-time updates"""
    try:
        game_id = data.get('game_id')
        player_id = data.get('player_id')
        reconnect_token = data.get('reconnect_token')

        if not game_id or not player_id:
            emit('error', {'message': 'Missing game_id or player_id'})
            return

        # Check for reconnection
        if reconnect_token:
            result = reconnection_handler.attempt_reconnection(
                reconnect_token,
                request.sid,
                request.remote_addr
            )

            if result['success']:
                logger.info(f"Player {player_id} reconnected successfully")
                emit('reconnected', result)
            else:
                emit('error', {'message': 'Failed to reconnect'})
                return
        else:
            # New connection - create session
            session = reconnection_handler.create_session(
                player_id,
                game_id,
                request.sid
            )

            # Send reconnection token to client
            emit('session_created', {
                'reconnect_token': session.reconnect_token,
                'message': 'Save this token for reconnection'
            })

        # Join game room
        join_room(game_id)
        logger.info(f"Socket {request.sid} joined game room {game_id}")

        # Join private room for whispers
        player_room = f"player_{player_id}"
        join_room(player_room)

        # Map socket to player
        player_sockets[request.sid] = player_id

        # Get player info from cache or DB
        player = cache_manager.get(f"player:{player_id}")
        if not player:
            player = db.get_player(player_id)
            if player:
                cache_manager.set(f"player:{player_id}", player, ttl=300)

        # Notify room
        emit('player_joined', {
            'player_id': player_id,
            'player_name': player['name'] if player else 'Unknown'
        }, room=game_id, skip_sid=request.sid)

        # Send current game state
        emit('game_state_update', {
            'message': 'Successfully joined game',
            'player_id': player_id
        })

    except Exception as e:
        logger.error(f"Error joining game room: {e}", exc_info=True)
        emit('error', {'message': 'Failed to join game'})

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

        # Validate action input
        if not isinstance(action, str) or len(action) > 1000:
            emit('error', {'message': 'Invalid action format'})
            return

        # Submit action to database
        db.submit_action(game_id, player_id, action)

        # Invalidate game state cache
        cache_manager.delete(f"game_state:{game_id}")

        # Record in reconnection handler
        if player_id in reconnection_handler.sessions:
            reconnection_handler.sessions[player_id].last_action = {
                'action': action,
                'timestamp': datetime.now().isoformat()
            }

        # Check if all players have acted
        if db.all_players_acted(game_id):
            logger.info(f"All players acted in game {game_id}")

            emit('turn_ready', {
                'message': 'All players have acted, processing turn...'
            }, room=game_id)

            # Clear actions and advance turn
            db.clear_pending_actions(game_id)
            db.advance_turn(game_id)

            # Invalidate caches
            cache_manager.delete(f"game_state:{game_id}")

        # Notify room
        emit('action_submitted', {
            'player_id': player_id,
            'status': 'Action submitted'
        }, room=game_id)

        if performance_monitor:
            performance_monitor.record_metric('actions.submitted', 1, 'count')

    except Exception as e:
        logger.error(f"Error submitting action: {e}", exc_info=True)
        emit('error', {'message': 'Failed to submit action'})

@socketio.on('send_message')
def handle_send_message(data):
    """Handle chat messages with rate limiting"""
    try:
        game_id = data.get('game_id')
        player_id = data.get('player_id')
        message = data.get('message')

        # Rate limit chat messages
        if not security_manager.check_rate_limit(f"chat:{player_id}", max_requests=10):
            emit('error', {'message': 'Chat rate limit exceeded'})
            return

        # Validate message
        if not message or len(message) > 500:
            emit('error', {'message': 'Invalid message'})
            return

        # Sanitize message
        message = security_manager.sanitize_input(message)

        # Get player name
        player = cache_manager.get(f"player:{player_id}")
        if not player:
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
        logger.error(f"Error sending message: {e}", exc_info=True)
        emit('error', {'message': 'Failed to send message'})

# ========== HELPER FUNCTIONS ==========

def generate_game_code() -> str:
    """Generate a unique 6-character game code"""
    import random
    import string

    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # Check cache first
        if not cache_manager.get(f"game:{code}"):
            # Double-check database
            existing = db.get_game_by_code(code)
            if not existing:
                return code

# ========== GRACEFUL SHUTDOWN ==========

def graceful_shutdown(signum, frame):
    """Handle graceful shutdown"""
    logger.info("Shutting down gracefully...")

    # Stop monitoring
    if performance_monitor:
        performance_monitor.stop()

    # Close database connections
    db.close()

    # Close cache connections
    cache_manager.close()

    logger.info("Shutdown complete")
    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)

# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal error: {error}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(429)
def rate_limit_error(error):
    """Handle rate limit errors"""
    return jsonify({'error': 'Rate limit exceeded'}), 429

# ========== BACKGROUND TASKS ==========

def cleanup_inactive_games():
    """Background task to cleanup inactive games"""
    while True:
        try:
            import time
            time.sleep(300)  # Run every 5 minutes

            cutoff = datetime.now() - timedelta(hours=24)
            removed = []

            for code, game_data in list(active_games.items()):
                if game_data['last_activity'] < cutoff:
                    removed.append(code)
                    del active_games[code]
                    cache_manager.delete(f"game:{code}")

            if removed:
                logger.info(f"Cleaned up {len(removed)} inactive games")

        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")

# Start cleanup thread
import threading
cleanup_thread = threading.Thread(target=cleanup_inactive_games, daemon=True)
cleanup_thread.start()

# ========== MAIN ENTRY POINT ==========

if __name__ == '__main__':
    logger.info("Starting The Arcane Codex Production Server...")
    logger.info(f"Configuration: {config.SOCKETIO_ASYNC_MODE} mode")
    logger.info(f"Database: {config.DB_PATH}")
    logger.info(f"Cache enabled: {config.CACHE_ENABLED}")
    logger.info(f"Rate limiting: {config.RATE_LIMIT_ENABLED}")

    # Run with SocketIO
    socketio.run(
        app,
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )
