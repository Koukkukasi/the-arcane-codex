#!/usr/bin/env python3
"""
The Arcane Codex - Local Network Game Server
Run this on your computer, your son plays from his phone browser!
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import random
import urllib.parse

# Game state stored in memory
games = {}

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Arcane Codex</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #eee;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.6);
            border: 2px solid #ffd700;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }
        h1 {
            text-align: center;
            color: #ffd700;
            font-size: 24px;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #ffd700;
        }
        .scene {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-left: 4px solid #4a9eff;
            margin: 20px 0;
            line-height: 1.6;
        }
        .dialogue {
            color: #4a9eff;
            font-weight: bold;
            margin: 10px 0;
        }
        .action {
            color: #ff4a4a;
            font-weight: bold;
        }
        .options {
            margin: 20px 0;
        }
        .option {
            background: linear-gradient(135deg, #2d3561 0%, #1f2544 100%);
            border: 2px solid #666;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s;
        }
        .option:hover {
            border-color: #ffd700;
            background: linear-gradient(135deg, #3d4571 0%, #2f3554 100%);
            transform: translateX(5px);
        }
        .option:active {
            background: #1a1a2e;
        }
        .option-number {
            color: #ffd700;
            font-size: 20px;
            font-weight: bold;
            margin-right: 10px;
        }
        .chance {
            float: right;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .high { background: #2d5016; color: #90EE90; }
        .medium { background: #5a4a1f; color: #FFD700; }
        .low { background: #5a1f1f; color: #FF6B6B; }
        .result {
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            animation: fadeIn 0.5s;
        }
        .success { background: #2d5016; color: #90EE90; border: 2px solid #90EE90; }
        .failure { background: #5a1f1f; color: #FF6B6B; border: 2px solid #FF6B6B; }
        .critical { background: #5a4a1f; color: #FFD700; border: 2px solid #FFD700; }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .hp-bar {
            background: #333;
            height: 25px;
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
            border: 2px solid #666;
        }
        .hp-fill {
            height: 100%;
            background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
            transition: width 0.5s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        button {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #1a1a2e;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            margin: 10px 0;
            transition: all 0.3s;
        }
        button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
        button:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚔️ THE ARCANE CODEX ⚔️</h1>
        <div id="game"></div>
    </div>

    <script>
        let gameState = {};

        async function startGame() {
            const response = await fetch('/start');
            const data = await response.json();
            gameState = data;
            renderGame();
        }

        async function makeChoice(choice) {
            const response = await fetch('/action', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({choice: choice})
            });
            const data = await response.json();
            gameState = data;
            renderGame();
        }

        function renderGame() {
            const gameDiv = document.getElementById('game');

            if (gameState.state === 'start') {
                gameDiv.innerHTML = `
                    <div class="scene">
                        <p>Welcome to <strong>The Arcane Codex</strong>!</p>
                        <p style="margin-top: 15px;">A fantasy RPG where your choices shape your destiny.</p>
                        <p style="margin-top: 15px;">⚡ Your class will be revealed by your actions</p>
                        <p>🎭 NPCs remember everything you do</p>
                        <p>🔮 Gods watch and judge you</p>
                    </div>
                    <button onclick="startGame()">BEGIN ADVENTURE</button>
                `;
            } else if (gameState.state === 'playing') {
                let html = '';

                // HP Bar
                if (gameState.player) {
                    const hpPercent = (gameState.player.hp / gameState.player.max_hp) * 100;
                    html += `
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${hpPercent}%">
                                HP: ${gameState.player.hp}/${gameState.player.max_hp}
                            </div>
                        </div>
                    `;
                }

                // Scene
                if (gameState.scene) {
                    html += `<div class="scene">${gameState.scene}</div>`;
                }

                // Result
                if (gameState.result) {
                    const resultClass = gameState.result.type;
                    html += `<div class="result ${resultClass}">${gameState.result.message}</div>`;
                }

                // Options
                if (gameState.options) {
                    html += '<div class="options">';
                    gameState.options.forEach((option, i) => {
                        let chanceClass = 'medium';
                        if (option.chance >= 65) chanceClass = 'high';
                        else if (option.chance < 40) chanceClass = 'low';

                        html += `
                            <div class="option" onclick="makeChoice(${i})">
                                <span class="option-number">${i + 1}</span>
                                ${option.text}
                                ${option.chance ? `<span class="chance ${chanceClass}">${option.chance}%</span>` : ''}
                            </div>
                        `;
                    });
                    html += '</div>';
                }

                gameDiv.innerHTML = html;
            }
        }

        // Start on load
        fetch('/state').then(r => r.json()).then(data => {
            gameState = data;
            renderGame();
        });
    </script>
</body>
</html>
"""


class GameHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode())

        elif self.path == '/state':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            if 'game' not in games:
                games['game'] = {'state': 'start'}

            self.wfile.write(json.dumps(games['game']).encode())

        elif self.path == '/start':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # Start game - Turn 1
            games['game'] = {
                'state': 'playing',
                'turn': 1,
                'player': {
                    'name': 'Adventurer',
                    'hp': 60,
                    'max_hp': 60,
                    'skills': {'combat': 65, 'persuasion': 55, 'perception': 60}
                },
                'scene': '''
<p>🌧️ Rain hammers the crooked roof.</p>
<p>You push open the warped door of <strong>"The Soggy Boot"</strong> - a tavern that reeks of wet dog and burnt porridge.</p>
<p style="margin-top: 15px;" class="dialogue">🗣️ GRIMSBY (missing 3 fingers): "Adventurers! Thank the gods!"</p>
<p>"The Thieves' Guild took my daughter! They want 500 gold! I'll give you 80 gold if you help!"</p>
<p style="margin-top: 15px;" class="action">⚔️ Three Guild thugs stand up. Hands on weapons.</p>
<p class="dialogue">🗣️ VETERAN: "Grimsby. We told you. NO adventurers."</p>
                ''',
                'options': [
                    {'text': '💬 "We\'re just passing through. No trouble."', 'skill': 'persuasion', 'difficulty': 25, 'chance': 60},
                    {'text': '⚔️ Charge the veteran before he acts', 'skill': 'combat', 'difficulty': 25, 'chance': 70},
                    {'text': '🪑 Flip table for cover', 'skill': 'strength', 'difficulty': 20, 'chance': 75},
                    {'text': '👁️ Look for escape routes', 'skill': 'perception', 'difficulty': 20, 'chance': 75},
                ]
            }

            self.wfile.write(json.dumps(games['game']).encode())

    def do_POST(self):
        if self.path == '/action':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())

            choice = data['choice']
            game = games.get('game', {})

            # Get selected option
            option = game['options'][choice]

            # Roll dice
            player_skill = game['player']['skills'].get(option['skill'], 50)
            difficulty = option['difficulty']
            threshold = 50 + ((player_skill - difficulty) / 2)
            roll = random.randint(1, 100)
            success = roll <= threshold

            # Determine result
            if roll <= 5:
                result_type = 'critical'
                result_msg = f'✨ CRITICAL SUCCESS! Roll: {roll}/100'
            elif success:
                result_type = 'success'
                result_msg = f'✅ SUCCESS! Roll: {roll}/100'
            else:
                result_type = 'failure'
                result_msg = f'❌ FAILURE! Roll: {roll}/100'

            # Update scene based on choice and result
            if choice == 0:  # Persuasion
                if success:
                    scene = '''
<p class="dialogue">🗣️ VETERAN: "...Fine. But this is YOUR problem, Grimsby."</p>
<p>The thugs lower their weapons. They leave through the back door.</p>
<p>Grimsby exhales shakily. <span class="dialogue">"Thank you. THANK YOU."</span></p>
<p style="margin-top: 15px;">He tells you about the old mill north of town...</p>
                    '''
                else:
                    scene = '''
<p class="dialogue">🗣️ VETERAN: "Passing through? With weapons? Choose. NOW."</p>
<p class="action">His hand moves to his knife. The other two spread out.</p>
<p>Grimsby backs away. This is about to get violent...</p>
                    '''

            elif choice == 1:  # Combat
                if success:
                    game['player']['hp'] = game['player']['hp']  # No damage
                    scene = '''
<p class="action">⚔️ You CHARGE!</p>
<p>Your blade catches him off-guard. Steel CRASHES into his shoulder!</p>
<p>💀 <strong>Veteran takes 18 damage! BLOODIED!</strong></p>
<p class="dialogue">🗣️ VETERAN (gasping): "You're... BETTER than I thought..."</p>
<p>The young thug drops his dagger and RUNS. The other hesitates.</p>
                    '''
                else:
                    game['player']['hp'] -= 12
                    scene = '''
<p class="action">💔 You charge but he's FASTER!</p>
<p>His blade deflects yours. Counter-strike to your ribs!</p>
<p><strong>You take 12 damage!</strong></p>
<p class="dialogue">🗣️ VETERAN (grinning): "Not bad. But not good enough."</p>
                    '''

            elif choice == 2:  # Flip table
                if success:
                    scene = '''
<p class="action">🪑 The table SLAMS onto its side!</p>
<p>Mugs shatter. Ale splashes. The thugs freeze.</p>
<p>You have HARD COVER now (+30% defense for next turn)</p>
<p class="dialogue">🗣️ VETERAN: "Smart. But you're still trapped in here with us."</p>
                    '''
                else:
                    scene = '''
<p class="action">💔 The table is too heavy!</p>
<p>You strain. It barely budges. The thugs laugh.</p>
<p class="dialogue">🗣️ GRIMSBY: "Oh no... oh NO..."</p>
                    '''

            elif choice == 3:  # Perception
                if success:
                    scene = '''
<p>👁️ <strong>You notice critical details:</strong></p>
<p>• Young thug (left) is trembling - WEAK LINK</p>
<p>• Veteran has BRASS HORN on belt - reinforcements!</p>
<p>• Back door slightly ajar - ESCAPE ROUTE</p>
<p>• Grimsby's clothes are clean - not a desperate father searching 3 days?</p>
<p style="margin-top: 15px;">Something doesn't add up...</p>
                    '''
                else:
                    scene = '''
<p>You scan the room but see nothing special.</p>
<p>Just three armed men and a nervous clerk.</p>
                    '''

            # New options
            new_options = [
                {'text': '⚔️ Attack the veteran', 'skill': 'combat', 'difficulty': 25, 'chance': 70},
                {'text': '💬 "Grimsby, tell us the TRUTH."', 'skill': 'persuasion', 'difficulty': 20, 'chance': 65},
                {'text': '🏃 Sprint for the back door', 'skill': 'athletics', 'difficulty': 20, 'chance': 75},
                {'text': '🗣️ "How much to walk away?" (to thugs)', 'skill': 'persuasion', 'difficulty': 30, 'chance': 50},
            ]

            game['scene'] = scene
            game['result'] = {'type': result_type, 'message': result_msg}
            game['options'] = new_options
            game['turn'] += 1

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(game).encode())

    def log_message(self, format, *args):
        return  # Suppress log messages


def get_local_ip():
    """Get local IP address"""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


if __name__ == '__main__':
    port = 8080
    local_ip = get_local_ip()

    print("\n" + "=" * 60)
    print("⚔️  THE ARCANE CODEX - Local Server")
    print("=" * 60)
    print(f"\n🎮 Server running on your local network!")
    print(f"\n📱 Your son can play from his phone:")
    print(f"   Open browser and go to: http://{local_ip}:{port}")
    print(f"\n💻 Or play from this computer:")
    print(f"   http://localhost:{port}")
    print(f"\n⚠️  Make sure both devices are on the same WiFi!")
    print(f"\n🛑 Press Ctrl+C to stop the server")
    print("=" * 60 + "\n")

    server = HTTPServer(('0.0.0.0', port), GameHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n⚔️  Server stopped. Thanks for playing!")
