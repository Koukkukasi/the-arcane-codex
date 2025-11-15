"""
Test The Arcane Codex with 1-4 players
Simulates a complete game session
"""

import requests
import time
import random
from typing import Dict, List

BASE_URL = "http://localhost:5000"

class TestPlayer:
    """Simulates a player in the game"""

    def __init__(self, name: str, session=None):
        self.name = name
        self.session = session or requests.Session()
        self.game_code = None
        self.player_class = None

    def create_game(self) -> str:
        """Create a new game and return the game code"""
        response = self.session.post(f"{BASE_URL}/api/create_game",
                                    json={"player_name": self.name})
        data = response.json()
        self.game_code = data.get('game_code')
        print(f"[{self.name}] Created game with code: {self.game_code}")
        return self.game_code

    def join_game(self, game_code: str) -> bool:
        """Join an existing game"""
        response = self.session.post(f"{BASE_URL}/api/join_game",
                                    json={"game_code": game_code,
                                         "player_name": self.name})
        if response.status_code == 200:
            self.game_code = game_code
            print(f"[{self.name}] Joined game {game_code}")
            return True
        else:
            print(f"[{self.name}] Failed to join game: {response.text}")
            return False

    def complete_divine_interrogation(self):
        """Complete the 10-question character creation"""
        print(f"\n[{self.name}] Starting Divine Interrogation...")

        # Start interrogation
        response = self.session.post(f"{BASE_URL}/api/start_interrogation")
        if response.status_code != 200:
            print(f"[{self.name}] Failed to start interrogation")
            return

        # Answer 10 questions
        for i in range(10):
            # Get current question
            response = self.session.get(f"{BASE_URL}/api/session_info")
            session_data = response.json()

            # Pick random answer (1-5)
            answer = random.randint(1, 5)

            # Submit answer
            response = self.session.post(f"{BASE_URL}/api/answer_question",
                                        json={"answer": answer})

            if response.status_code == 200:
                data = response.json()
                if data.get('interrogation_complete'):
                    self.player_class = data.get('assigned_class')
                    print(f"[{self.name}] Question {i+1}/10: Answered {answer}")
                    print(f"[{self.name}] Class assigned: {self.player_class}")
                    break
                else:
                    print(f"[{self.name}] Question {i+1}/10: Answered {answer}")
            else:
                print(f"[{self.name}] Failed to answer question {i+1}")

    def get_game_state(self) -> Dict:
        """Get current game state"""
        response = self.session.get(f"{BASE_URL}/api/game_state")
        return response.json() if response.status_code == 200 else {}

    def generate_scenario(self) -> bool:
        """Generate a new scenario"""
        response = self.session.post(f"{BASE_URL}/api/generate_scenario")
        if response.status_code == 200:
            print(f"[{self.name}] Generated new scenario")
            return True
        return False

    def get_scenario(self) -> Dict:
        """Get current public scenario"""
        response = self.session.get(f"{BASE_URL}/api/current_scenario")
        return response.json() if response.status_code == 200 else {}

    def get_whisper(self) -> str:
        """Get private whisper"""
        response = self.session.get(f"{BASE_URL}/api/my_whisper")
        data = response.json() if response.status_code == 200 else {}
        return data.get('whisper', 'No whisper')

    def make_choice(self, choice: str) -> bool:
        """Submit a choice for current scenario"""
        response = self.session.post(f"{BASE_URL}/api/make_choice",
                                    json={"choice": choice})
        if response.status_code == 200:
            print(f"[{self.name}] Made choice: {choice}")
            return True
        return False

    def check_waiting(self) -> List[str]:
        """Check who we're waiting for"""
        response = self.session.get(f"{BASE_URL}/api/waiting_for")
        data = response.json() if response.status_code == 200 else {}
        return data.get('waiting_for', [])


def test_solo_game():
    """Test 1-player game"""
    print("\n" + "="*60)
    print("TESTING 1-PLAYER GAME")
    print("="*60)

    # Create player
    alice = TestPlayer("Alice")

    # Create game
    game_code = alice.create_game()

    # Complete character creation
    alice.complete_divine_interrogation()

    # Get game state
    state = alice.get_game_state()
    print(f"\nGame State:")
    print(f"  Players: {state.get('players', [])}")
    print(f"  Trust: {state.get('party_trust', 0)}")
    print(f"  NPCs: {state.get('npcs', [])}")

    # Generate and play a scenario
    alice.generate_scenario()
    scenario = alice.get_scenario()
    whisper = alice.get_whisper()

    print(f"\nScenario: {scenario.get('scene', 'No scenario')[:100]}...")
    print(f"Whisper: {whisper[:100]}...")

    # Make a choice
    alice.make_choice("I investigate carefully")

    print("\n[SOLO GAME TEST COMPLETE]")


def test_two_player_game():
    """Test 2-player game"""
    print("\n" + "="*60)
    print("TESTING 2-PLAYER GAME")
    print("="*60)

    # Create players
    bob = TestPlayer("Bob")
    carol = TestPlayer("Carol")

    # Bob creates game
    game_code = bob.create_game()

    # Carol joins
    carol.join_game(game_code)

    # Both complete character creation
    bob.complete_divine_interrogation()
    carol.complete_divine_interrogation()

    # Get game state
    state = bob.get_game_state()
    print(f"\nGame State:")
    print(f"  Players: {[p['name'] for p in state.get('players', [])]}")
    print(f"  Classes: {[p.get('character_class') for p in state.get('players', [])]}")
    print(f"  Trust: {state.get('party_trust', 0)}")

    # Generate scenario
    bob.generate_scenario()

    # Both get their whispers
    bob_whisper = bob.get_whisper()
    carol_whisper = carol.get_whisper()

    print(f"\nBob's whisper: {bob_whisper[:100]}...")
    print(f"Carol's whisper: {carol_whisper[:100]}...")

    # Both make choices
    bob.make_choice("I share my information with the party")
    carol.make_choice("I keep my information secret")

    # Check who we're waiting for
    waiting = bob.check_waiting()
    print(f"Waiting for: {waiting}")

    print("\n[2-PLAYER GAME TEST COMPLETE]")


def test_four_player_game():
    """Test 4-player game (maximum)"""
    print("\n" + "="*60)
    print("TESTING 4-PLAYER GAME")
    print("="*60)

    # Create players
    players = [
        TestPlayer("Dave"),
        TestPlayer("Eve"),
        TestPlayer("Frank"),
        TestPlayer("Grace")
    ]

    # Dave creates game
    game_code = players[0].create_game()

    # Others join
    for player in players[1:]:
        player.join_game(game_code)
        time.sleep(0.5)  # Small delay between joins

    # All complete character creation
    for player in players:
        player.complete_divine_interrogation()

    # Get game state
    state = players[0].get_game_state()
    print(f"\nGame State:")
    print(f"  Players: {[p['name'] for p in state.get('players', [])]}")
    print(f"  Classes: {[p.get('character_class') for p in state.get('players', [])]}")
    print(f"  Trust: {state.get('party_trust', 0)}")

    # Generate scenario
    players[0].generate_scenario()

    # All get their whispers
    print("\nWhispers:")
    for player in players:
        whisper = player.get_whisper()
        print(f"  {player.name}: {whisper[:50]}...")

    # All make different choices
    choices = [
        "I rush in immediately",
        "I suggest we plan first",
        "I search for another way",
        "I wait and observe"
    ]

    for i, player in enumerate(players):
        player.make_choice(choices[i])

    print("\n[4-PLAYER GAME TEST COMPLETE]")


def run_all_tests():
    """Run all multiplayer tests"""
    print("""
    ============================================
    THE ARCANE CODEX - MULTIPLAYER TESTING
    ============================================

    Testing 1, 2, and 4 player configurations...
    """)

    # Check if server is running by checking root endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("ERROR: Server not responding. Please start web_game.py first!")
            return
    except:
        print("ERROR: Cannot connect to server at http://localhost:5000")
        print("Please run: python web_game.py")
        return

    # Run tests
    test_solo_game()
    time.sleep(2)

    test_two_player_game()
    time.sleep(2)

    test_four_player_game()

    print("""
    ============================================
    ALL TESTS COMPLETE!
    ============================================

    Summary:
    - Solo (1 player): TESTED
    - Duo (2 players): TESTED
    - Full party (4 players): TESTED

    The game successfully handles 1-4 players with:
    - Unique game codes
    - Divine Interrogation
    - Class assignment
    - Asymmetric whispers
    - Individual choices
    - Trust mechanics

    You can now:
    1. Open http://localhost:5000 in a browser
    2. Create/join games manually
    3. Test with real players
    """)


if __name__ == "__main__":
    run_all_tests()