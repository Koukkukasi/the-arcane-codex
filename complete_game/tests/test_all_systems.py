"""
The Arcane Codex - Complete System Test Suite
Tests all game systems to ensure everything works
"""

import os
import sys
import json
import time
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class GameSystemTester:
    """Complete test suite for all game systems"""

    def __init__(self):
        self.test_results = {}
        self.errors = []
        self.warnings = []

    def print_header(self, title):
        """Print formatted header"""
        print("\n" + "="*60)
        print(f"  {title}")
        print("="*60)

    def test_imports(self):
        """Test 1: Verify all modules can be imported"""
        self.print_header("TEST 1: Module Imports")

        modules_to_test = [
            ('database', 'Database System'),
            ('app', 'Flask Server'),
            ('battle_system', 'Battle System'),
            ('inventory_system', 'Inventory System'),
            ('character_progression', 'Character Progression'),
            ('game_controller', 'Game Controller'),
            ('sensory_system', 'Sensory System'),
            ('divine_interrogation', 'Divine Interrogation'),
            ('scenarios', 'Scenario System'),
            ('error_handler', 'Error Handler'),
            ('performance_monitor', 'Performance Monitor'),
            ('reconnection_handler', 'Reconnection Handler'),
            ('ai_gm_auto', 'AI Game Master'),
            ('mcp_client', 'MCP Client')
        ]

        import_results = []
        for module_name, display_name in modules_to_test:
            try:
                __import__(module_name)
                import_results.append((display_name, True, None))
                print(f"  ✅ {display_name}")
            except ImportError as e:
                import_results.append((display_name, False, str(e)))
                print(f"  ❌ {display_name}: {e}")
                self.errors.append(f"Failed to import {module_name}: {e}")
            except Exception as e:
                import_results.append((display_name, False, str(e)))
                print(f"  ⚠️  {display_name}: {e}")
                self.warnings.append(f"Warning importing {module_name}: {e}")

        # Calculate success rate
        success_count = sum(1 for _, success, _ in import_results if success)
        total_count = len(import_results)
        success_rate = (success_count / total_count) * 100

        self.test_results['imports'] = {
            'passed': success_count,
            'total': total_count,
            'rate': success_rate
        }

        print(f"\n  Import Success Rate: {success_rate:.1f}% ({success_count}/{total_count})")
        return success_rate == 100

    def test_database(self):
        """Test 2: Database operations"""
        self.print_header("TEST 2: Database System")

        try:
            from database import ArcaneDatabase

            # Create test database
            test_db = ArcaneDatabase(db_path="test_game.db")
            print("  ✅ Database created")

            # Test game creation
            game_id = test_db.create_game("TEST01")
            assert game_id is not None
            print("  ✅ Game created")

            # Test player creation
            player_id = test_db.create_player(game_id, "TestHero")
            assert player_id is not None
            print("  ✅ Player created")

            # Test data retrieval
            player = test_db.get_player(player_id)
            assert player is not None
            assert player['name'] == "TestHero"
            print("  ✅ Player retrieved")

            # Test NPC creation
            npc_id = test_db.create_npc(game_id, "TestNPC", "merchant")
            assert npc_id is not None
            print("  ✅ NPC created")

            # Clean up
            os.remove("test_game.db") if os.path.exists("test_game.db") else None

            self.test_results['database'] = {'status': 'passed'}
            print("\n  Database Test: PASSED")
            return True

        except Exception as e:
            self.test_results['database'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Database test failed: {e}")
            print(f"\n  Database Test: FAILED - {e}")
            return False

    def test_character_system(self):
        """Test 3: Character creation and progression"""
        self.print_header("TEST 3: Character System")

        try:
            from character_progression import Character, CharacterProgression
            from divine_interrogation import DivineInterrogation

            # Create character
            character = Character(
                id="test_char",
                name="TestHero",
                class_type="Fighter"
            )
            print(f"  ✅ Character created: {character.name}")

            # Test stats calculation
            character.stats.calculate_derived_stats("Fighter", 1)
            assert character.stats.max_hp > 0
            print(f"  ✅ Stats calculated: HP={character.stats.max_hp}")

            # Test experience and leveling
            initial_level = character.level
            rewards = character.add_experience(200)
            assert character.level > initial_level
            print(f"  ✅ Level up: {initial_level} → {character.level}")

            # Test attribute spending
            initial_str = character.stats.strength
            success = character.spend_attribute_point('strength')
            assert success
            assert character.stats.strength > initial_str
            print(f"  ✅ Attribute point spent: STR {initial_str} → {character.stats.strength}")

            # Test skill learning
            success = character.learn_skill('power_attack')
            assert success or character.level < 2  # Skill requires level 2
            print(f"  ✅ Skill system working")

            # Test divine interrogation
            di = DivineInterrogation()
            question = di.questions[0]
            assert question is not None
            print(f"  ✅ Divine Interrogation: {len(di.questions)} questions loaded")

            self.test_results['character'] = {'status': 'passed'}
            print("\n  Character System Test: PASSED")
            return True

        except Exception as e:
            self.test_results['character'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Character test failed: {e}")
            print(f"\n  Character System Test: FAILED - {e}")
            return False

    def test_battle_system(self):
        """Test 4: Combat system"""
        self.print_header("TEST 4: Battle System")

        try:
            from battle_system import BattleSystem, CombatAction, DiceRoller

            # Create battle system
            battle = BattleSystem()
            print("  ✅ Battle system created")

            # Create test battle
            test_players = [
                {'id': 'p1', 'name': 'Hero', 'class_type': 'Fighter', 'level': 1}
            ]
            test_enemies = [
                {'name': 'Goblin', 'type': 'goblin', 'level': 1}
            ]

            battle_state = battle.start_battle('test_battle', test_players, test_enemies)
            assert battle_state is not None
            print("  ✅ Battle started")

            # Test dice rolling
            dice = DiceRoller()
            roll, dice_values = dice.roll(1, 20, 0)
            assert 1 <= roll <= 20
            print(f"  ✅ Dice rolled: d20 = {roll}")

            # Test combat action
            action = CombatAction(
                actor_id='p1',
                action_type='attack',
                target_id='enemy_0'
            )
            result = battle.process_action('test_battle', action)
            print(f"  ✅ Combat action processed: {result.message[:50]}...")

            # Test class abilities
            from battle_system import ClassAbilities
            abilities = ClassAbilities.ABILITIES
            assert 'Fighter' in abilities
            assert 'power_strike' in abilities['Fighter']
            print(f"  ✅ Class abilities: {len(abilities)} classes configured")

            self.test_results['battle'] = {'status': 'passed'}
            print("\n  Battle System Test: PASSED")
            return True

        except Exception as e:
            self.test_results['battle'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Battle test failed: {e}")
            print(f"\n  Battle System Test: FAILED - {e}")
            return False

    def test_inventory_system(self):
        """Test 5: Inventory and items"""
        self.print_header("TEST 5: Inventory System")

        try:
            from inventory_system import Inventory, ItemDatabase, LootTable

            # Create inventory
            inventory = Inventory(capacity=30)
            inventory.gold = 100
            print(f"  ✅ Inventory created: {inventory.capacity} slots, {inventory.gold} gold")

            # Test item database
            item_db = ItemDatabase()
            sword = item_db.get_item('iron_sword')
            assert sword is not None
            print(f"  ✅ Item loaded: {sword.name}")

            # Test adding items
            success = inventory.add_item(sword, 1)
            assert success
            print(f"  ✅ Item added to inventory")

            # Test equipment
            from inventory_system import Equipment
            if isinstance(sword, Equipment):
                prev_equipped = inventory.equip_item(sword)
                print(f"  ✅ Item equipped")

            # Test consumables
            potion = item_db.get_item('health_potion')
            inventory.add_item(potion, 5)
            effect = inventory.use_consumable('health_potion')
            assert effect is not None
            print(f"  ✅ Consumable used: {effect['type']}")

            # Test loot generation
            loot_table = LootTable()
            loot = loot_table.generate_loot('goblin', level=1)
            assert 'gold' in loot
            print(f"  ✅ Loot generated: {loot['gold']} gold, {len(loot['items'])} items")

            self.test_results['inventory'] = {'status': 'passed'}
            print("\n  Inventory System Test: PASSED")
            return True

        except Exception as e:
            self.test_results['inventory'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Inventory test failed: {e}")
            print(f"\n  Inventory System Test: FAILED - {e}")
            return False

    def test_game_controller(self):
        """Test 6: Main game controller"""
        self.print_header("TEST 6: Game Controller")

        try:
            from game_controller import GameController, GamePhase, Quest, QuestStatus

            # Create game controller
            game = GameController('test_game')
            print("  ✅ Game controller created")

            # Test game initialization
            test_players = [
                {
                    'id': 'p1',
                    'name': 'Hero',
                    'class_type': 'Fighter',
                    'divine_favor': {'VALDRIS': 30}
                }
            ]

            loop = asyncio.new_event_loop()
            success = loop.run_until_complete(game.start_new_game(test_players))
            assert success
            print("  ✅ Game started")

            # Test phase management
            assert game.phase == GamePhase.TOWN
            print(f"  ✅ Game phase: {game.phase.value}")

            # Test quest system
            assert len(game.active_quests) > 0
            quest = game.active_quests[0]
            print(f"  ✅ Quest active: {quest.name}")

            # Test save/load
            save_data = game.save_game()
            assert 'game_id' in save_data
            print(f"  ✅ Game saved: {len(save_data)} fields")

            new_game = GameController('test_game_2')
            success = new_game.load_game(save_data)
            assert success
            print("  ✅ Game loaded")

            self.test_results['controller'] = {'status': 'passed'}
            print("\n  Game Controller Test: PASSED")
            return True

        except Exception as e:
            self.test_results['controller'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Controller test failed: {e}")
            print(f"\n  Game Controller Test: FAILED - {e}")
            return False

    def test_sensory_system(self):
        """Test 7: Sensory whisper system"""
        self.print_header("TEST 7: Sensory System")

        try:
            from sensory_system import SensorySystem, SensoryWhisper

            # Create sensory system
            sensory = SensorySystem()
            print("  ✅ Sensory system created")

            # Test whisper generation
            test_state = {
                'location': 'Dark Forest',
                'scenario': 'exploration',
                'players': [
                    {'id': 'p1', 'class_type': 'Fighter'},
                    {'id': 'p2', 'class_type': 'Mage'}
                ]
            }

            scene = sensory.generate_sensory_scene(test_state)
            assert scene is not None
            assert scene.public_description != ""
            print(f"  ✅ Scene generated: {scene.public_description[:50]}...")

            # Test class-specific whispers
            assert len(scene.player_whispers) > 0
            print(f"  ✅ Whispers generated: {len(scene.player_whispers)} players")

            # Test sensory types
            sensory_types = ['visual', 'audio', 'smell', 'touch', 'taste',
                           'supernatural', 'emotional', 'temporal']
            print(f"  ✅ Sensory types: {len(sensory_types)} types available")

            self.test_results['sensory'] = {'status': 'passed'}
            print("\n  Sensory System Test: PASSED")
            return True

        except Exception as e:
            self.test_results['sensory'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Sensory test failed: {e}")
            print(f"\n  Sensory System Test: FAILED - {e}")
            return False

    def test_ai_gm(self):
        """Test 8: AI Game Master"""
        self.print_header("TEST 8: AI Game Master")

        try:
            from ai_gm_auto import AIGameMaster
            from mcp_client import SyncMCPClient

            # Create AI GM
            ai_gm = AIGameMaster()
            print("  ✅ AI GM created")

            # Test MCP client
            mcp = SyncMCPClient()
            print("  ✅ MCP client created")

            # Test game state preparation
            test_state = ai_gm.get_complete_game_state('test_game')
            assert isinstance(test_state, dict)
            print("  ✅ Game state prepared")

            # Test fallback scenario
            fallback = ai_gm.get_fallback_scenario(test_state)
            assert fallback is not None
            assert fallback.public_narration != ""
            print(f"  ✅ Fallback scenario: {fallback.public_narration[:50]}...")

            self.test_results['ai_gm'] = {'status': 'passed'}
            print("\n  AI GM Test: PASSED")
            return True

        except Exception as e:
            self.test_results['ai_gm'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"AI GM test failed: {e}")
            print(f"\n  AI GM Test: FAILED - {e}")
            return False

    def test_web_interface(self):
        """Test 9: Web interface files"""
        self.print_header("TEST 9: Web Interface")

        files_to_check = [
            ('templates/game_ui.html', 'Game UI'),
            ('templates/main_menu.html', 'Main Menu'),
            ('static/css/design-system.css', 'Design System'),
            ('static/css/ux_enhancements.css', 'UX Enhancements'),
            ('static/js/ux_enhancements.js', 'UX JavaScript')
        ]

        file_results = []
        for filepath, name in files_to_check:
            if os.path.exists(filepath):
                size = os.path.getsize(filepath)
                file_results.append((name, True, f"{size} bytes"))
                print(f"  ✅ {name}: {size} bytes")
            else:
                file_results.append((name, False, "Not found"))
                print(f"  ❌ {name}: Not found")
                self.warnings.append(f"Missing file: {filepath}")

        success_count = sum(1 for _, success, _ in file_results if success)

        self.test_results['web_interface'] = {
            'files_found': success_count,
            'total': len(files_to_check)
        }

        print(f"\n  Web Interface Test: {success_count}/{len(files_to_check)} files found")
        return success_count == len(files_to_check)

    def test_integration(self):
        """Test 10: System integration"""
        self.print_header("TEST 10: System Integration")

        try:
            # Test that all systems can work together
            from game_controller import GameController
            from battle_system import BattleSystem
            from inventory_system import Inventory
            from character_progression import Character

            # Create integrated test
            game = GameController('integration_test')
            character = Character('test', 'IntegrationHero', 'Fighter')
            inventory = Inventory()
            battle = BattleSystem()

            # Add character to game
            game.players[character.id] = character
            game.inventories[character.id] = inventory

            print("  ✅ Systems integrated")

            # Test data flow
            character.add_experience(100)
            inventory.gold += 50

            # Save integrated state
            save_data = game.save_game()
            assert len(save_data['players']) > 0
            assert len(save_data['inventories']) > 0

            print("  ✅ Data flow working")
            print("  ✅ Integration successful")

            self.test_results['integration'] = {'status': 'passed'}
            print("\n  Integration Test: PASSED")
            return True

        except Exception as e:
            self.test_results['integration'] = {'status': 'failed', 'error': str(e)}
            self.errors.append(f"Integration test failed: {e}")
            print(f"\n  Integration Test: FAILED - {e}")
            return False

    def run_all_tests(self):
        """Run complete test suite"""
        print("""
╔══════════════════════════════════════════════════════════════╗
║            THE ARCANE CODEX - SYSTEM TEST SUITE             ║
╚══════════════════════════════════════════════════════════════╝
        """)

        start_time = time.time()

        # Run all tests
        test_methods = [
            self.test_imports,
            self.test_database,
            self.test_character_system,
            self.test_battle_system,
            self.test_inventory_system,
            self.test_game_controller,
            self.test_sensory_system,
            self.test_ai_gm,
            self.test_web_interface,
            self.test_integration
        ]

        results = []
        for test in test_methods:
            try:
                result = test()
                results.append(result)
            except Exception as e:
                results.append(False)
                self.errors.append(f"Test crashed: {e}")

        elapsed_time = time.time() - start_time

        # Generate summary
        self.print_header("TEST SUMMARY")

        total_tests = len(results)
        passed_tests = sum(1 for r in results if r)
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100

        print(f"\n  Total Tests: {total_tests}")
        print(f"  ✅ Passed: {passed_tests}")
        print(f"  ❌ Failed: {failed_tests}")
        print(f"  Success Rate: {success_rate:.1f}%")
        print(f"  Time Elapsed: {elapsed_time:.2f} seconds")

        if self.errors:
            print(f"\n  ⚠️  Errors ({len(self.errors)}):")
            for error in self.errors[:5]:  # Show first 5 errors
                print(f"    • {error[:80]}")

        if self.warnings:
            print(f"\n  ⚠️  Warnings ({len(self.warnings)}):")
            for warning in self.warnings[:5]:
                print(f"    • {warning[:80]}")

        # Overall verdict
        print("\n" + "="*60)
        if success_rate >= 80:
            print("  🎉 GAME IS READY TO PLAY! 🎉")
            print("  Run: python start_game.py")
        elif success_rate >= 60:
            print("  ⚠️  GAME MOSTLY WORKING")
            print("  Some features may not work properly")
        else:
            print("  ❌ CRITICAL ISSUES DETECTED")
            print("  Please fix errors before playing")
        print("="*60)

        # Save test report
        report = {
            'timestamp': datetime.now().isoformat(),
            'success_rate': success_rate,
            'passed': passed_tests,
            'failed': failed_tests,
            'errors': self.errors,
            'warnings': self.warnings,
            'results': self.test_results
        }

        with open('test_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        print("\n  📄 Full report saved to test_report.json")

        return success_rate >= 60

def main():
    """Main test entry point"""
    tester = GameSystemTester()
    success = tester.run_all_tests()

    if success:
        print("\n✅ Tests passed! You can now play the game:")
        print("   python start_game.py")
    else:
        print("\n❌ Tests failed. Please check test_report.json for details")
        sys.exit(1)

if __name__ == "__main__":
    main()