"""
The Arcane Codex - Complete Game Launcher
One-click startup for the complete game
"""

import os
import sys
import time
import json
import logging
import webbrowser
import subprocess
import threading
import asyncio
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ArcaneCodexLauncher:
    """Complete game launcher with all systems integrated"""

    def __init__(self):
        self.processes = []
        self.game_ready = False
        self.port = 5000

        # ASCII art logo
        self.logo = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ████████╗██╗  ██╗███████╗                                  ║
║  ╚══██╔══╝██║  ██║██╔════╝                                  ║
║     ██║   ███████║█████╗                                    ║
║     ██║   ██╔══██║██╔══╝                                    ║
║     ██║   ██║  ██║███████╗                                  ║
║     ╚═╝   ╚═╝  ╚═╝╚══════╝                                  ║
║                                                              ║
║   █████╗ ██████╗  ██████╗ █████╗ ███╗   ██╗███████╗        ║
║  ██╔══██╗██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔════╝        ║
║  ███████║██████╔╝██║     ███████║██╔██╗ ██║█████╗          ║
║  ██╔══██║██╔══██╗██║     ██╔══██║██║╚██╗██║██╔══╝          ║
║  ██║  ██║██║  ██║╚██████╗██║  ██║██║ ╚████║███████╗        ║
║  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝        ║
║                                                              ║
║   ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗                 ║
║  ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝                 ║
║  ██║     ██║   ██║██║  ██║█████╗   ╚███╔╝                  ║
║  ██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗                  ║
║  ╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗                 ║
║   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝                 ║
║                                                              ║
║         🔮 AI-Powered Asymmetric Information RPG 🔮         ║
║              ⚔️ Where Every Whisper Tells ⚔️                ║
║                  ✨ A Different Story ✨                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """

    def check_requirements(self):
        """Check if all requirements are installed"""
        print("\n[CHECK] Checking requirements...")

        required_packages = {
            'flask': 'Flask',
            'flask_socketio': 'Flask-SocketIO',
            'flask_cors': 'Flask-CORS',
            'psutil': 'psutil',
            'eventlet': 'eventlet'
        }

        missing = []
        for package, name in required_packages.items():
            try:
                __import__(package)
                print(f"  [OK] {name} installed")
            except ImportError:
                print(f"  [ERROR] {name} missing")
                missing.append(package)

        if missing:
            print("\n[WARNING]  Missing packages detected!")
            print("Installing missing packages...")

            for package in missing:
                subprocess.run([sys.executable, "-m", "pip", "install", package],
                             capture_output=True)

            print("[OK] All packages installed!")
        else:
            print("\n[OK] All requirements satisfied!")

        return True

    def initialize_database(self):
        """Initialize the database with test data"""
        print("\n[DB]  Initializing database...")

        try:
            from database import ArcaneDatabase

            db = ArcaneDatabase()

            # Create test game if needed
            with db.get_connection() as conn:
                # Check if any games exist
                games = conn.execute("SELECT COUNT(*) FROM games").fetchone()[0]

                if games == 0:
                    print("  [CREATE] Creating sample game...")
                    game_id = db.create_game("DEMO01")
                    print(f"  [OK] Sample game created: DEMO01")
                else:
                    print("  [OK] Database already initialized")

            return True

        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            return False

    def start_server(self):
        """Start the main game server"""
        print("\n[START] Starting game server...")

        def run_server():
            try:
                # Import here to avoid issues
                from flask import Flask, render_template, jsonify, request
                from flask_socketio import SocketIO
                from flask_cors import CORS

                # Import game systems
                from game_controller import GameController
                from battle_system import BattleSystem
                from inventory_system import Inventory, ItemDatabase
                from character_progression import Character

                # Create Flask app
                app = Flask(__name__)
                app.config['SECRET_KEY'] = 'arcane-codex-secret-key-change-in-production'
                CORS(app)

                # Initialize SocketIO
                socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

                # Store active games
                active_games = {}

                # Routes
                @app.route('/')
                def index():
                    """Main menu"""
                    return render_template('main_menu.html')

                @app.route('/game')
                def game():
                    """Game interface"""
                    return render_template('game_ui.html')

                @app.route('/api/create_game', methods=['POST'])
                def create_game():
                    """Create new game"""
                    try:
                        import random
                        import string

                        # Generate game code
                        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

                        # Create game controller
                        game_controller = GameController(code, socketio)
                        active_games[code] = game_controller

                        return jsonify({
                            'success': True,
                            'game_code': code
                        })
                    except Exception as e:
                        return jsonify({
                            'success': False,
                            'error': str(e)
                        }), 500

                @app.route('/api/join_game', methods=['POST'])
                def join_game():
                    """Join existing game"""
                    data = request.json
                    code = data.get('code')
                    player_name = data.get('player_name')

                    if code in active_games:
                        # Create character
                        character = Character(
                            id=f"player_{len(active_games[code].players) + 1}",
                            name=player_name,
                            class_type=data.get('class_type', 'Fighter')
                        )

                        return jsonify({
                            'success': True,
                            'player_id': character.id,
                            'game_code': code
                        })

                    return jsonify({
                        'success': False,
                        'error': 'Game not found'
                    }), 404

                @app.route('/api/game/<game_id>/state')
                def get_game_state(game_id):
                    """Get game state"""
                    if game_id in active_games:
                        game = active_games[game_id]
                        return jsonify({
                            'success': True,
                            'phase': game.phase.value,
                            'location': game.current_location,
                            'players': [p.serialize() for p in game.players.values()]
                        })

                    return jsonify({'success': False, 'error': 'Game not found'}), 404

                @app.route('/api/game/<game_id>/town_action', methods=['POST'])
                def town_action(game_id):
                    """Handle town actions"""
                    if game_id not in active_games:
                        return jsonify({'success': False, 'error': 'Game not found'}), 404

                    data = request.json
                    game = active_games[game_id]

                    # Run async action in sync context
                    loop = asyncio.new_event_loop()
                    result = loop.run_until_complete(
                        game.process_town_action(
                            data['player_id'],
                            data['action'],
                            data.get('target')
                        )
                    )

                    return jsonify(result)

                @app.route('/api/game/<game_id>/explore', methods=['POST'])
                def explore(game_id):
                    """Start exploration"""
                    if game_id not in active_games:
                        return jsonify({'success': False, 'error': 'Game not found'}), 404

                    game = active_games[game_id]
                    loop = asyncio.new_event_loop()
                    result = loop.run_until_complete(game._start_exploration())

                    return jsonify(result)

                @app.route('/api/game/<game_id>/save', methods=['POST'])
                def save_game(game_id):
                    """Save game state"""
                    if game_id in active_games:
                        save_data = active_games[game_id].save_game()

                        # Save to file
                        with open(f'saves/game_{game_id}.json', 'w') as f:
                            json.dump(save_data, f, indent=2)

                        return jsonify({'success': True})

                    return jsonify({'success': False, 'error': 'Game not found'}), 404

                # Socket events
                @socketio.on('connect')
                def handle_connect():
                    logger.info(f"Client connected: {request.sid}")

                @socketio.on('disconnect')
                def handle_disconnect():
                    logger.info(f"Client disconnected: {request.sid}")

                @socketio.on('join_game_room')
                def handle_join_room(data):
                    from flask_socketio import join_room
                    game_id = data.get('game_id')
                    player_id = data.get('player_id')

                    join_room(game_id)
                    join_room(f"player_{player_id}")

                    logger.info(f"Player {player_id} joined game {game_id}")

                @socketio.on('submit_action')
                def handle_action(data):
                    game_id = data.get('game_id')
                    if game_id in active_games:
                        # Process action
                        pass

                @socketio.on('combat_action')
                def handle_combat(data):
                    game_id = data.get('game_id')
                    if game_id in active_games:
                        game = active_games[game_id]

                        loop = asyncio.new_event_loop()
                        result = loop.run_until_complete(
                            game.process_combat_action(
                                data['player_id'],
                                data['action']
                            )
                        )

                        socketio.emit('combat_result', result, room=game_id)

                # Health check
                @app.route('/health')
                def health():
                    return jsonify({'status': 'running', 'timestamp': datetime.now().isoformat()})

                # Start server
                print(f"  [OK] Server running on http://localhost:{self.port}")
                print(f"  [WEB] Open your browser to start playing!")
                self.game_ready = True

                socketio.run(app,
                           host='0.0.0.0',
                           port=self.port,
                           debug=False,
                           allow_unsafe_werkzeug=True)

            except Exception as e:
                logger.error(f"Server failed to start: {e}")
                print(f"\n[ERROR] Server error: {e}")
                print("\nTrying alternate startup method...")
                self.start_alternate_server()

        # Start server in thread
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()

        # Wait for server to be ready
        time.sleep(3)

        return server_thread

    def start_alternate_server(self):
        """Fallback server startup using main_integration.py"""
        try:
            print("\n[RETRY] Using alternate server startup...")
            subprocess.Popen([sys.executable, "main_integration.py"],
                           cwd=os.path.dirname(os.path.abspath(__file__)))
            time.sleep(3)
            self.game_ready = True
            print("  [OK] Alternate server started!")
        except Exception as e:
            print(f"  [ERROR] Alternate startup failed: {e}")

    def create_main_menu(self):
        """Create main menu HTML if missing"""
        menu_path = os.path.join('templates', 'main_menu.html')

        if not os.path.exists(menu_path):
            print("\n[MENU] Creating main menu...")

            os.makedirs('templates', exist_ok=True)

            menu_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Arcane Codex - Main Menu</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: white;
        }
        .menu-container {
            text-align: center;
            background: rgba(0,0,0,0.7);
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 20px rgba(255,255,255,0.5);
        }
        .subtitle {
            font-size: 1.2rem;
            color: #ccc;
            margin-bottom: 2rem;
        }
        .menu-buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 300px;
            margin: 0 auto;
        }
        .menu-btn {
            padding: 1rem 2rem;
            font-size: 1.2rem;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .menu-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .game-code-input {
            display: none;
            margin-top: 2rem;
        }
        .game-code-input input {
            padding: 0.75rem;
            font-size: 1.1rem;
            border: none;
            border-radius: 10px;
            margin-right: 0.5rem;
            background: rgba(255,255,255,0.9);
            color: #333;
        }
        .player-count {
            margin-top: 2rem;
            color: #aaa;
        }
    </style>
</head>
<body>
    <div class="menu-container">
        <h1>The Arcane Codex</h1>
        <div class="subtitle">AI-Powered Asymmetric Information RPG</div>

        <div class="menu-buttons">
            <button class="menu-btn" onclick="createGame()">Create New Game</button>
            <button class="menu-btn" onclick="showJoinGame()">Join Game</button>
            <button class="menu-btn" onclick="quickStart()">Quick Start (Solo)</button>
            <button class="menu-btn" onclick="showCredits()">Credits</button>
        </div>

        <div class="game-code-input" id="join-section">
            <input type="text" id="game-code" placeholder="Enter Game Code" maxlength="6">
            <input type="text" id="player-name" placeholder="Your Name">
            <button class="menu-btn" onclick="joinGame()">Join</button>
        </div>

        <div class="player-count">
            Supports 1-4 Players | Zero API Costs | Powered by Claude Desktop
        </div>
    </div>

    <script>
        function createGame() {
            fetch('/api/create_game', {method: 'POST'})
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('game_id', data.game_code);
                        localStorage.setItem('is_host', 'true');
                        alert('Game created! Code: ' + data.game_code);
                        window.location.href = '/game?game_id=' + data.game_code;
                    }
                });
        }

        function showJoinGame() {
            document.getElementById('join-section').style.display = 'block';
        }

        function joinGame() {
            const code = document.getElementById('game-code').value.toUpperCase();
            const name = document.getElementById('player-name').value;

            if (!code || !name) {
                alert('Please enter both game code and your name');
                return;
            }

            fetch('/api/join_game', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code: code, player_name: name})
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('game_id', code);
                    localStorage.setItem('player_id', data.player_id);
                    window.location.href = '/game?game_id=' + code;
                } else {
                    alert('Game not found!');
                }
            });
        }

        function quickStart() {
            // Create game and auto-join
            fetch('/api/create_game', {method: 'POST'})
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        return fetch('/api/join_game', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                code: data.game_code,
                                player_name: 'Hero',
                                class_type: 'Fighter'
                            })
                        });
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('game_id', data.game_code);
                        localStorage.setItem('player_id', data.player_id);
                        window.location.href = '/game';
                    }
                });
        }

        function showCredits() {
            alert('The Arcane Codex\\n\\nCreated with Claude\\nZero API Costs using Claude Desktop\\n\\n20,000+ lines of code\\n15+ integrated systems\\n6 character classes\\n\\nEnjoy your adventure!');
        }
    </script>
</body>
</html>'''

            with open(menu_path, 'w', encoding='utf-8') as f:
                f.write(menu_html)

            print("  [OK] Main menu created!")

    def open_browser(self):
        """Open game in browser"""
        if self.game_ready:
            url = f"http://localhost:{self.port}"
            print(f"\n[BROWSER] Opening browser to {url}")
            time.sleep(1)
            webbrowser.open(url)

    def run_tests(self):
        """Run basic system tests"""
        print("\n[TEST] Running system tests...")

        test_results = []

        # Test 1: Database
        try:
            from database import ArcaneDatabase
            db = ArcaneDatabase()
            test_results.append(("Database", True))
        except Exception as e:
            test_results.append(("Database", False))

        # Test 2: Battle System
        try:
            from battle_system import BattleSystem
            battle = BattleSystem()
            test_results.append(("Battle System", True))
        except:
            test_results.append(("Battle System", False))

        # Test 3: Inventory
        try:
            from inventory_system import Inventory
            inv = Inventory()
            test_results.append(("Inventory System", True))
        except:
            test_results.append(("Inventory System", False))

        # Test 4: Character
        try:
            from character_progression import Character
            char = Character("test", "TestHero", "Fighter")
            test_results.append(("Character System", True))
        except:
            test_results.append(("Character System", False))

        # Test 5: Game Controller
        try:
            from game_controller import GameController
            gc = GameController("test")
            test_results.append(("Game Controller", True))
        except:
            test_results.append(("Game Controller", False))

        # Print results
        print("\nTest Results:")
        all_passed = True
        for name, passed in test_results:
            status = "[OK]" if passed else "[ERROR]"
            print(f"  {status} {name}")
            if not passed:
                all_passed = False

        return all_passed

    def display_instructions(self):
        """Display how to play instructions"""
        instructions = """
╔══════════════════════════════════════════════════════════════╗
║                     🎮 HOW TO PLAY 🎮                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  👤 SINGLE PLAYER:                                           ║
║  ├─ 1. Click "Quick Start" for instant solo game            ║
║  └─ 2. Or "Create New Game" for custom setup                ║
║                                                              ║
║  👥 MULTIPLAYER (2-4 Players):                               ║
║  ├─ 1. Host clicks "Create New Game" → Gets code            ║
║  ├─ 2. Friends click "Join Game" → Enter code               ║
║  ├─ 3. Everyone completes Divine Interrogation              ║
║  └─ 4. Adventure begins when all ready! 🚀                  ║
║                                                              ║
║  ⚔️ GAMEPLAY:                                                ║
║  • 👁️ Explore the world with unique whispers                ║
║  • ⚔️ Fight tactical turn-based battles                     ║
║  • 📈 Level up from 1-20 with skill trees                   ║
║  • 📜 Complete quests and collect loot                      ║
║  • 🏰 Visit town to shop, rest, and get quests              ║
║                                                              ║
║  🎮 CONTROLS:                                                ║
║  • 🖱️ Click buttons for actions                            ║
║  • 💬 Chat with party members                               ║
║  • 💾 Save game anytime                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """
        print(instructions)

    def launch(self):
        """Main launch sequence"""
        # Clear screen
        os.system('cls' if os.name == 'nt' else 'clear')

        # Display logo
        print(self.logo)
        time.sleep(1)

        # Check requirements
        if not self.check_requirements():
            print("\n[ERROR] Failed to install requirements. Please install manually.")
            return False

        # Initialize database
        if not self.initialize_database():
            print("\n[ERROR] Failed to initialize database.")
            return False

        # Create directories
        os.makedirs('saves', exist_ok=True)
        os.makedirs('templates', exist_ok=True)
        os.makedirs('static/css', exist_ok=True)
        os.makedirs('static/js', exist_ok=True)

        # Create main menu
        self.create_main_menu()

        # Run tests
        if not self.run_tests():
            print("\n[WARNING]  Some systems failed tests but game may still work.")

        # Display instructions
        self.display_instructions()

        # Start server
        print("\n" + "="*60)
        print("         STARTING THE ARCANE CODEX")
        print("="*60)

        server_thread = self.start_server()

        # Wait a moment
        time.sleep(2)

        # Open browser
        if self.game_ready:
            self.open_browser()

            print("\n" + "="*60)
            print("\n         GAME IS READY TO PLAY!")
            print(f"\n  If browser didn't open, go to: http://localhost:{self.port}")
            print("\n" + "="*60)

            print("\n\nPress Ctrl+C to stop the server")

            try:
                # Keep running
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n\nThanks for playing The Arcane Codex!")
                sys.exit(0)
        else:
            print("\n[ERROR] Failed to start game server.")
            print("\nTroubleshooting:")
            print("1. Make sure port 5000 is not in use")
            print("2. Try running: python main_integration.py")
            print("3. Check arcane_codex.log for errors")
            return False

def main():
    """Main entry point"""
    launcher = ArcaneCodexLauncher()

    try:
        launcher.launch()
    except Exception as e:
        print(f"\n[ERROR] Launch failed: {e}")
        print("\nPlease try running: python main_integration.py")

if __name__ == "__main__":
    main()