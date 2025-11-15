"""
Test script for Divine Council voting system
Tests core voting mechanics, favor tracking, and consequence application
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import ArcaneDatabase
from divine_council import VotingSystem, ConsequenceEngine, GOD_PERSONALITIES

def test_vote_weight_calculation():
    """Test vote weight calculation with different favor levels"""
    print("\n=== Testing Vote Weight Calculation ===")

    db = ArcaneDatabase(":memory:")  # In-memory database for testing
    voting_system = VotingSystem(db, GOD_PERSONALITIES)

    test_cases = [
        (0, 1, 1.0, "Zero favor, support vote"),
        (100, 1, 2.0, "Max favor, support vote"),
        (-100, 1, 0.5, "Min favor, support vote"),
        (50, -1, -1.5, "Positive favor, oppose vote"),
        (-50, -1, -0.5, "Negative favor, oppose vote"),
    ]

    all_passed = True
    for favor, base_vote, expected, description in test_cases:
        result = voting_system.calculate_vote_weight(favor, base_vote)
        passed = abs(result - expected) < 0.01
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status}: {description}")
        print(f"       Favor: {favor:+4d}, Base Vote: {base_vote:+2d}, Expected: {expected:+5.2f}, Got: {result:+5.2f}")
        all_passed = all_passed and passed

    return all_passed


def test_action_alignment():
    """Test action alignment calculation"""
    print("\n=== Testing Action Alignment ===")

    db = ArcaneDatabase(":memory:")
    voting_system = VotingSystem(db, GOD_PERSONALITIES)

    test_cases = [
        ("VALDRIS", "I swear an oath to uphold justice", {"involves_oath": True}, "positive", "Oath-keeping"),
        ("VALDRIS", "I break my oath to the king", {"breaks_law": True}, "negative", "Oath-breaking"),
        ("KAITHA", "I defy tyranny and rebel against the oppressive king", {}, "positive", "Rebellion"),
        ("KAITHA", "I submit to authority", {"restricts_freedom": True}, "negative", "Submit to authority"),
        ("KORVAN", "I charge into battle with honor", {"involves_combat": True}, "positive", "Honorable combat"),
        ("MORVANE", "We must sacrifice one to save many", {"pragmatic_survival": True}, "positive", "Pragmatic survival"),
        ("SYLARA", "I preserve the natural order", {"preserves_nature": True}, "positive", "Preserve nature"),
    ]

    all_passed = True
    for god, action, context, expected_sign, description in test_cases:
        alignment = voting_system.calculate_action_alignment(god, action, context)

        if expected_sign == "positive":
            passed = alignment > 0
        else:
            passed = alignment < 0

        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status}: {god:8s} - {description}")
        print(f"       Alignment: {alignment:+4d}")
        all_passed = all_passed and passed

    return all_passed


def test_council_voting():
    """Test full council voting process"""
    print("\n=== Testing Full Council Voting ===")

    # Use a temporary file database instead of :memory: to avoid table issues
    import tempfile
    import os
    import time
    import uuid
    # Create unique temp file to avoid database locking
    temp_filename = f"test_db_{uuid.uuid4().hex}.db"
    temp_path = os.path.join(tempfile.gettempdir(), temp_filename)

    try:
        db = ArcaneDatabase(temp_path)
        voting_system = VotingSystem(db, GOD_PERSONALITIES)

        # Create test game and player
        game_id = db.create_game("TEST")
        player_id = db.create_player(game_id, "TestPlayer")

        # Set some initial favor
        db.update_divine_favor(player_id, game_id, "VALDRIS", 50)
        db.update_divine_favor(player_id, game_id, "KAITHA", -30)
        db.update_divine_favor(player_id, game_id, "KORVAN", 40)

        # Test oath-breaking action
        action = "I broke my sacred oath to the village elder to pursue personal vengeance"
        context = {
            "involves_oath": True,
            "breaks_law": False
        }

        result = voting_system.convene_council(player_id, game_id, action, context)

        print(f"\nAction: {action}")
        print(f"\nVoting Results:")
        print(f"  Raw Count: {result['outcome'].raw_count[0]} Support, {result['outcome'].raw_count[1]} Oppose, {result['outcome'].raw_count[2]} Abstain")
        print(f"  Weighted Score: {result['outcome'].weighted_score:.2f}")
        print(f"  Outcome: {result['outcome'].outcome}")
        print(f"  Decisive Gods: {', '.join(result['outcome'].decisive_gods)}")

        print(f"\nIndividual Votes:")
        for vote in result['votes']:
            position_text = "SUPPORT" if vote.position == 1 else ("OPPOSE" if vote.position == -1 else "ABSTAIN")
            print(f"  {vote.god_name:8s}: {position_text:7s} (weight: {vote.weight:+5.2f}) - {vote.reasoning}")

        # Basic validation
        passed = (
            len(result['votes']) == 7 and  # All 7 gods voted
            result['outcome'].outcome in ['UNANIMOUS_BLESSING', 'STRONG_SUPPORT', 'NARROW_SUPPORT',
                                           'DEADLOCK', 'NARROW_OPPOSITION', 'STRONG_OPPOSITION', 'UNANIMOUS_CURSE']
        )

        status = "[PASS]" if passed else "[FAIL]"
        print(f"\n{status}: Council voting completed")

        return passed

    finally:
        # Clean up temp database
        try:
            time.sleep(0.1)  # Give database time to release
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        except Exception as e:
            print(f"    (Warning: Could not delete temp database: {e})")


def test_consequence_application():
    """Test consequence engine"""
    print("\n=== Testing Consequence Application ===")

    # Use temporary file database
    import tempfile
    import os
    import time
    import uuid
    # Create unique temp file to avoid database locking
    temp_filename = f"test_db_{uuid.uuid4().hex}.db"
    temp_path = os.path.join(tempfile.gettempdir(), temp_filename)

    try:
        db = ArcaneDatabase(temp_path)
        consequence_engine = ConsequenceEngine(db)

        # Create test game and player
        game_id = db.create_game("TEST2")
        player_id = db.create_player(game_id, "TestPlayer2")

        # Test strong support consequences
        votes = {
            "VALDRIS": 1,
            "KAITHA": 1,
            "MORVANE": 1,
            "SYLARA": 1,
            "KORVAN": 0,
            "ATHENA": -1,
            "MERCUS": -1
        }

        result = consequence_engine.apply_consequences(
            player_id,
            game_id,
            "STRONG_SUPPORT",
            votes
        )

        print(f"\nOutcome: STRONG_SUPPORT")
        print(f"\nFavor Changes:")
        for god, change in result['favor_changes'].items():
            print(f"  {god:8s}: {change:+3d}")

        print(f"\nApplied Effects:")
        for effect in result['applied_effects']:
            print(f"  - {effect['name']} ({effect['type']})")
            print(f"    {effect['description']}")
            print(f"    Duration: {effect['duration']} turns")

        # Verify favor was actually updated
        updated_favor = db.get_all_favor(player_id)
        print(f"\nUpdated Divine Favor:")
        for god, favor in updated_favor.items():
            print(f"  {god:8s}: {favor:+4d}")

        passed = (
            len(result['favor_changes']) == 7 and
            len(result['applied_effects']) > 0 and
            result['impact_level'] == 'major_positive'
        )

        status = "[PASS]" if passed else "[FAIL]"
        print(f"\n{status}: Consequence application completed")

        return passed

    finally:
        # Clean up temp database
        try:
            time.sleep(0.1)  # Give database time to release
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        except Exception as e:
            print(f"    (Warning: Could not delete temp database: {e})")


def main():
    """Run all tests"""
    print("=" * 60)
    print("DIVINE COUNCIL VOTING SYSTEM - TEST SUITE")
    print("=" * 60)

    tests = [
        ("Vote Weight Calculation", test_vote_weight_calculation),
        ("Action Alignment", test_action_alignment),
        ("Council Voting", test_council_voting),
        ("Consequence Application", test_consequence_application),
    ]

    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed, None))
        except Exception as e:
            results.append((name, False, str(e)))
            print(f"\n[FAIL]: {name} - Exception: {str(e)}")

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    for name, passed, error in results:
        if passed:
            print(f"[PASS]: {name}")
        else:
            print(f"[FAIL]: {name}")
            if error:
                print(f"        Error: {error}")

    total_passed = sum(1 for _, passed, _ in results if passed)
    total_tests = len(results)

    print(f"\nTotal: {total_passed}/{total_tests} tests passed")

    if total_passed == total_tests:
        print("\n[SUCCESS] ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n[ERROR] {total_tests - total_passed} TESTS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
