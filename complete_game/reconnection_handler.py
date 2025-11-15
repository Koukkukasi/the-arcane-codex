"""
The Arcane Codex - Player Reconnection and Session Recovery
Phase 6: Graceful Disconnection Handling
"""

import json
import time
import logging
from typing import Dict, Optional, List, Any, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import secrets

logger = logging.getLogger(__name__)

class ConnectionState(Enum):
    """Player connection states"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    RECONNECTING = "reconnecting"
    TIMED_OUT = "timed_out"
    ABANDONED = "abandoned"

@dataclass
class PlayerSession:
    """Player session information"""
    player_id: str
    game_id: str
    socket_id: Optional[str]
    state: ConnectionState
    last_seen: datetime
    reconnect_token: str
    missed_events: List[Dict] = field(default_factory=list)
    connection_count: int = 0
    total_playtime: float = 0
    last_action: Optional[Dict] = None

@dataclass
class ReconnectionAttempt:
    """Reconnection attempt details"""
    player_id: str
    token: str
    timestamp: datetime
    ip_address: str
    success: bool
    reason: Optional[str] = None

class ReconnectionHandler:
    """
    Handles player disconnections and reconnections gracefully
    """

    def __init__(self, socketio=None, db=None, timeout_minutes: int = 10):
        self.socketio = socketio
        self.db = db
        self.timeout_minutes = timeout_minutes
        self.sessions: Dict[str, PlayerSession] = {}
        self.socket_to_player: Dict[str, str] = {}
        self.reconnection_attempts: List[ReconnectionAttempt] = []
        self.event_buffer: Dict[str, List[Dict]] = {}  # game_id -> events
        self.ai_takeover: Set[str] = set()  # Players being controlled by AI

    def create_session(self, player_id: str, game_id: str,
                      socket_id: str) -> PlayerSession:
        """Create new player session"""
        token = secrets.token_urlsafe(32)

        session = PlayerSession(
            player_id=player_id,
            game_id=game_id,
            socket_id=socket_id,
            state=ConnectionState.CONNECTED,
            last_seen=datetime.now(),
            reconnect_token=token,
            connection_count=1
        )

        self.sessions[player_id] = session
        self.socket_to_player[socket_id] = player_id

        logger.info(f"Session created for player {player_id}")

        # Initialize event buffer for game
        if game_id not in self.event_buffer:
            self.event_buffer[game_id] = []

        return session

    def handle_disconnect(self, socket_id: str) -> Optional[str]:
        """Handle player disconnection"""
        if socket_id not in self.socket_to_player:
            return None

        player_id = self.socket_to_player[socket_id]
        del self.socket_to_player[socket_id]

        if player_id not in self.sessions:
            return None

        session = self.sessions[player_id]
        session.socket_id = None
        session.state = ConnectionState.DISCONNECTED
        session.last_seen = datetime.now()

        logger.info(f"Player {player_id} disconnected, starting grace period")

        # Notify other players
        if self.socketio and session.game_id:
            self.socketio.emit('player_disconnected', {
                'player_id': player_id,
                'grace_period': self.timeout_minutes * 60,
                'message': f"Player disconnected, waiting {self.timeout_minutes} minutes for reconnection"
            }, room=session.game_id, skip_sid=socket_id)

        # Start grace period timer
        self._start_grace_period(player_id)

        return player_id

    def _start_grace_period(self, player_id: str):
        """Start grace period for reconnection"""
        import threading

        def check_timeout():
            time.sleep(self.timeout_minutes * 60)

            if player_id in self.sessions:
                session = self.sessions[player_id]

                if session.state == ConnectionState.DISCONNECTED:
                    # Grace period expired
                    self._handle_timeout(player_id)

        timer = threading.Thread(target=check_timeout, daemon=True)
        timer.start()

    def _handle_timeout(self, player_id: str):
        """Handle connection timeout"""
        if player_id not in self.sessions:
            return

        session = self.sessions[player_id]
        session.state = ConnectionState.TIMED_OUT

        logger.warning(f"Player {player_id} timed out")

        # Enable AI takeover
        self.enable_ai_takeover(player_id)

        # Notify game
        if self.socketio and session.game_id:
            self.socketio.emit('player_timeout', {
                'player_id': player_id,
                'ai_takeover': True,
                'message': "Player connection timed out, AI taking over"
            }, room=session.game_id)

    def attempt_reconnection(self, token: str, socket_id: str,
                            ip_address: str = None) -> Dict[str, Any]:
        """Attempt to reconnect a player"""
        # Find session by token
        player_id = None
        for pid, session in self.sessions.items():
            if session.reconnect_token == token:
                player_id = pid
                break

        if not player_id:
            # Log failed attempt
            attempt = ReconnectionAttempt(
                player_id="unknown",
                token=token[:8] + "...",  # Log partial token
                timestamp=datetime.now(),
                ip_address=ip_address or "unknown",
                success=False,
                reason="Invalid token"
            )
            self.reconnection_attempts.append(attempt)

            return {
                'success': False,
                'error': 'Invalid reconnection token'
            }

        session = self.sessions[player_id]

        # Check if already connected
        if session.state == ConnectionState.CONNECTED:
            return {
                'success': False,
                'error': 'Already connected'
            }

        # Check if abandoned
        if session.state == ConnectionState.ABANDONED:
            return {
                'success': False,
                'error': 'Session abandoned'
            }

        # Successful reconnection
        old_state = session.state
        session.socket_id = socket_id
        session.state = ConnectionState.CONNECTED
        session.last_seen = datetime.now()
        session.connection_count += 1

        self.socket_to_player[socket_id] = player_id

        # Disable AI takeover if enabled
        if player_id in self.ai_takeover:
            self.disable_ai_takeover(player_id)

        # Log successful attempt
        attempt = ReconnectionAttempt(
            player_id=player_id,
            token=token[:8] + "...",
            timestamp=datetime.now(),
            ip_address=ip_address or "unknown",
            success=True
        )
        self.reconnection_attempts.append(attempt)

        logger.info(f"Player {player_id} reconnected successfully")

        # Notify other players
        if self.socketio and session.game_id:
            self.socketio.emit('player_reconnected', {
                'player_id': player_id,
                'message': "Player reconnected"
            }, room=session.game_id, skip_sid=socket_id)

        # Prepare reconnection data
        reconnect_data = {
            'success': True,
            'player_id': player_id,
            'game_id': session.game_id,
            'missed_events': session.missed_events,
            'was_ai_controlled': old_state == ConnectionState.TIMED_OUT,
            'connection_count': session.connection_count
        }

        # Clear missed events
        session.missed_events = []

        # Restore game state for player
        self._restore_player_state(player_id, socket_id)

        return reconnect_data

    def _restore_player_state(self, player_id: str, socket_id: str):
        """Restore game state for reconnected player"""
        if not self.db or player_id not in self.sessions:
            return

        session = self.sessions[player_id]

        try:
            # Get current game state
            with self.db.get_connection() as conn:
                # Get game info
                game = conn.execute("""
                    SELECT * FROM games WHERE id = ?
                """, (session.game_id,)).fetchone()

                if not game:
                    return

                # Get player info
                player = conn.execute("""
                    SELECT * FROM players WHERE id = ?
                """, (player_id,)).fetchone()

                if not player:
                    return

                # Get current scenario
                scenario = conn.execute("""
                    SELECT * FROM scenarios
                    WHERE game_id = ? AND turn = ?
                    ORDER BY created_at DESC LIMIT 1
                """, (session.game_id, game['turn'])).fetchone()

                # Get player's whispers
                whispers = conn.execute("""
                    SELECT * FROM sensory_whispers
                    WHERE game_id = ? AND player_id = ? AND turn = ?
                """, (session.game_id, player_id, game['turn'])).fetchall()

            # Send restored state to player
            if self.socketio:
                # Send game state
                self.socketio.emit('state_restored', {
                    'game': dict(game) if game else None,
                    'player': dict(player) if player else None,
                    'turn': game['turn'] if game else 0,
                    'phase': game['phase'] if game else 'unknown'
                }, room=f"player_{player_id}")

                # Send current scenario if exists
                if scenario:
                    scenario_data = dict(scenario)
                    scenario_data['whispers'] = json.loads(scenario_data.get('whispers', '{}'))
                    scenario_data['choices'] = json.loads(scenario_data.get('choices', '[]'))

                    self.socketio.emit('scenario_restored', {
                        'public': scenario_data.get('public_scene', ''),
                        'choices': scenario_data.get('choices', []),
                        'theme': scenario_data.get('theme', '')
                    }, room=f"player_{player_id}")

                # Send whispers
                for whisper in whispers:
                    whisper_data = dict(whisper)
                    whisper_data['sensory_data'] = json.loads(whisper_data.get('sensory_data', '{}'))

                    self.socketio.emit('whisper_restored', {
                        'sense_type': whisper_data.get('sense_type', 'visual'),
                        'content': whisper_data.get('content', ''),
                        'sensory_data': whisper_data.get('sensory_data', {})
                    }, room=f"player_{player_id}")

        except Exception as e:
            logger.error(f"Error restoring player state: {e}")

    def record_missed_event(self, game_id: str, event: Dict):
        """Record an event that disconnected players missed"""
        # Add to game's event buffer
        if game_id not in self.event_buffer:
            self.event_buffer[game_id] = []

        self.event_buffer[game_id].append({
            'timestamp': datetime.now().isoformat(),
            **event
        })

        # Keep only last 50 events per game
        if len(self.event_buffer[game_id]) > 50:
            self.event_buffer[game_id] = self.event_buffer[game_id][-50:]

        # Add to disconnected players' missed events
        for player_id, session in self.sessions.items():
            if (session.game_id == game_id and
                session.state in [ConnectionState.DISCONNECTED, ConnectionState.TIMED_OUT]):
                session.missed_events.append(event)

                # Keep only last 20 events per player
                if len(session.missed_events) > 20:
                    session.missed_events = session.missed_events[-20:]

    def enable_ai_takeover(self, player_id: str):
        """Enable AI control for disconnected player"""
        self.ai_takeover.add(player_id)

        logger.info(f"AI takeover enabled for player {player_id}")

        # Update database
        if self.db:
            with self.db.get_connection() as conn:
                conn.execute("""
                    UPDATE players
                    SET ai_controlled = 1
                    WHERE id = ?
                """, (player_id,))

    def disable_ai_takeover(self, player_id: str):
        """Disable AI control when player returns"""
        if player_id in self.ai_takeover:
            self.ai_takeover.remove(player_id)

            logger.info(f"AI takeover disabled for player {player_id}")

            # Update database
            if self.db:
                with self.db.get_connection() as conn:
                    conn.execute("""
                        UPDATE players
                        SET ai_controlled = 0
                        WHERE id = ?
                    """, (player_id,))

    def is_ai_controlled(self, player_id: str) -> bool:
        """Check if player is AI controlled"""
        return player_id in self.ai_takeover

    def get_connected_players(self, game_id: str) -> List[str]:
        """Get list of connected players in a game"""
        connected = []
        for player_id, session in self.sessions.items():
            if (session.game_id == game_id and
                session.state == ConnectionState.CONNECTED):
                connected.append(player_id)
        return connected

    def get_session_stats(self, player_id: str) -> Optional[Dict]:
        """Get session statistics for a player"""
        if player_id not in self.sessions:
            return None

        session = self.sessions[player_id]

        return {
            'player_id': player_id,
            'game_id': session.game_id,
            'state': session.state.value,
            'last_seen': session.last_seen.isoformat(),
            'connection_count': session.connection_count,
            'total_playtime': session.total_playtime,
            'missed_events_count': len(session.missed_events),
            'is_ai_controlled': player_id in self.ai_takeover
        }

    def abandon_session(self, player_id: str):
        """Permanently abandon a player session"""
        if player_id not in self.sessions:
            return

        session = self.sessions[player_id]
        session.state = ConnectionState.ABANDONED

        # Remove from AI control
        if player_id in self.ai_takeover:
            self.ai_takeover.remove(player_id)

        # Notify game
        if self.socketio and session.game_id:
            self.socketio.emit('player_abandoned', {
                'player_id': player_id,
                'message': "Player has left the game permanently"
            }, room=session.game_id)

        logger.info(f"Session abandoned for player {player_id}")

    def cleanup_old_sessions(self, hours: int = 24):
        """Clean up old abandoned or timed out sessions"""
        cutoff = datetime.now() - timedelta(hours=hours)
        to_remove = []

        for player_id, session in self.sessions.items():
            if (session.state in [ConnectionState.ABANDONED, ConnectionState.TIMED_OUT] and
                session.last_seen < cutoff):
                to_remove.append(player_id)

        for player_id in to_remove:
            del self.sessions[player_id]
            logger.info(f"Cleaned up old session for player {player_id}")

        return len(to_remove)

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Reconnection Handler...")

    handler = ReconnectionHandler(timeout_minutes=1)

    # Create a session
    session = handler.create_session("player1", "game1", "socket1")
    print(f"Session created: {session.reconnect_token}")

    # Simulate disconnect
    disconnected = handler.handle_disconnect("socket1")
    print(f"Player disconnected: {disconnected}")

    # Record some missed events
    handler.record_missed_event("game1", {
        'type': 'scenario_update',
        'data': 'Something happened while you were away'
    })

    # Attempt reconnection with wrong token
    result = handler.attempt_reconnection("wrong_token", "socket2")
    print(f"Wrong token result: {result}")

    # Attempt reconnection with correct token
    result = handler.attempt_reconnection(session.reconnect_token, "socket2")
    print(f"Correct token result: {result}")

    # Get session stats
    stats = handler.get_session_stats("player1")
    print(f"Session stats: {json.dumps(stats, indent=2)}")

    print("\nReconnection handler test completed!")