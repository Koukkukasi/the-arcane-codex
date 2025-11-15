"""
Quick API Testing Script for Inventory System
Tests all inventory endpoints with mock session
"""

import requests
import json
from pprint import pprint


class InventoryTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.csrf_token = None

    def get_csrf_token(self):
        """Get CSRF token"""
        try:
            response = self.session.get(f"{self.base_url}/api/csrf-token")
            if response.status_code == 200:
                self.csrf_token = response.json()['csrf_token']
                print(f"[OK] Got CSRF token: {self.csrf_token[:20]}...")
                return True
        except Exception as e:
            print(f"[ERROR] Could not get CSRF token: {e}")
            return False

    def test_get_inventory(self):
        """Test GET /api/inventory/all"""
        print("\n" + "="*70)
        print("TEST: GET /api/inventory/all")
        print("="*70)

        try:
            response = self.session.get(f"{self.base_url}/api/inventory/all")
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print(f"\n[SUCCESS] Inventory loaded:")
                print(f"  Items: {len(data['items'])}")
                print(f"  Gold: {data['gold']}")
                print(f"  Weight: {data['weight']}/{data['max_weight']}")
                print(f"  Slots: {data['slots_used']}/{data['slots_max']}")

                if data['items']:
                    print(f"\n  Sample items:")
                    for item in data['items'][:3]:
                        print(f"    - {item['name']} x{item['quantity']} ({item['type']})")

                return True
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def test_add_item(self, item_id="health_potion", quantity=5):
        """Test POST /api/inventory/add"""
        print("\n" + "="*70)
        print(f"TEST: POST /api/inventory/add (item_id={item_id}, quantity={quantity})")
        print("="*70)

        try:
            response = self.session.post(
                f"{self.base_url}/api/inventory/add",
                json={"item_id": item_id, "quantity": quantity},
                headers={"X-CSRFToken": self.csrf_token} if self.csrf_token else {}
            )
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"[SUCCESS] {data['message']}")
                    print(f"  Item: {data['item']['name']}")
                    print(f"  Type: {data['item']['type']}")
                    print(f"  Rarity: {data['item']['rarity']}")
                    return True
                else:
                    print(f"[FAILED] {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def test_equip_item(self, item_id="iron_sword", slot="main_hand"):
        """Test POST /api/inventory/equip"""
        print("\n" + "="*70)
        print(f"TEST: POST /api/inventory/equip (item_id={item_id}, slot={slot})")
        print("="*70)

        try:
            response = self.session.post(
                f"{self.base_url}/api/inventory/equip",
                json={"item_id": item_id, "slot": slot},
                headers={"X-CSRFToken": self.csrf_token} if self.csrf_token else {}
            )
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"[SUCCESS] Equipped {data['equipped']['name']} to {slot}")
                    if data.get('unequipped'):
                        print(f"  Unequipped: {data['unequipped']['name']}")
                    return True
                else:
                    print(f"[FAILED] {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def test_use_item(self, item_id="health_potion"):
        """Test POST /api/inventory/use"""
        print("\n" + "="*70)
        print(f"TEST: POST /api/inventory/use (item_id={item_id})")
        print("="*70)

        try:
            response = self.session.post(
                f"{self.base_url}/api/inventory/use",
                json={"item_id": item_id},
                headers={"X-CSRFToken": self.csrf_token} if self.csrf_token else {}
            )
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"[SUCCESS] {data['message']}")
                    print(f"  Effect: {data['effect']}")
                    print(f"  Value: {data['value']}")
                    return True
                else:
                    print(f"[FAILED] {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def test_unequip_item(self, item_id="iron_sword"):
        """Test POST /api/inventory/unequip"""
        print("\n" + "="*70)
        print(f"TEST: POST /api/inventory/unequip (item_id={item_id})")
        print("="*70)

        try:
            response = self.session.post(
                f"{self.base_url}/api/inventory/unequip",
                json={"item_id": item_id},
                headers={"X-CSRFToken": self.csrf_token} if self.csrf_token else {}
            )
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"[SUCCESS] Unequipped {data['item']['name']}")
                    return True
                else:
                    print(f"[FAILED] {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def test_drop_item(self, item_id="bread", quantity=1):
        """Test POST /api/inventory/drop"""
        print("\n" + "="*70)
        print(f"TEST: POST /api/inventory/drop (item_id={item_id}, quantity={quantity})")
        print("="*70)

        try:
            response = self.session.post(
                f"{self.base_url}/api/inventory/drop",
                json={"item_id": item_id, "quantity": quantity},
                headers={"X-CSRFToken": self.csrf_token} if self.csrf_token else {}
            )
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"[SUCCESS] {data['message']}")
                    return True
                else:
                    print(f"[FAILED] {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def test_move_item(self, from_index=0, to_index=1):
        """Test POST /api/inventory/move"""
        print("\n" + "="*70)
        print(f"TEST: POST /api/inventory/move (from={from_index}, to={to_index})")
        print("="*70)

        try:
            response = self.session.post(
                f"{self.base_url}/api/inventory/move",
                json={"from_index": from_index, "to_index": to_index},
                headers={"X-CSRFToken": self.csrf_token} if self.csrf_token else {}
            )
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"[SUCCESS] Moved item from slot {from_index} to {to_index}")
                    return True
                else:
                    print(f"[FAILED] {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"[ERROR] {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"[ERROR] {e}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("\n" + "="*70)
        print("INVENTORY API TESTING SUITE")
        print("="*70)
        print("\nNOTE: You must be logged into the game with an active session!")
        print("      Run this script AFTER logging in via the web interface.")
        print("\nServer:", self.base_url)
        print("="*70)

        # Get CSRF token
        if not self.get_csrf_token():
            print("\n[WARNING] Could not get CSRF token - POST requests may fail")

        results = {
            "Get Inventory": self.test_get_inventory(),
        }

        # Only run other tests if we're in a game session
        if results["Get Inventory"]:
            results.update({
                "Add Item (health_potion)": self.test_add_item("health_potion", 3),
                "Add Item (iron_sword)": self.test_add_item("iron_sword", 1),
                "Equip Item (iron_sword)": self.test_equip_item("iron_sword", "main_hand"),
                "Use Item (health_potion)": self.test_use_item("health_potion"),
                "Unequip Item (iron_sword)": self.test_unequip_item("iron_sword"),
                "Drop Item (bread)": self.test_drop_item("bread", 1),
                "Move Item (0 -> 1)": self.test_move_item(0, 1),
            })
        else:
            print("\n[SKIPPED] Not in active game session - skipping other tests")

        # Print summary
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)

        passed = sum(1 for v in results.values() if v)
        total = len(results)

        for test_name, result in results.items():
            status = "[PASS]" if result else "[FAIL]"
            print(f"{status} {test_name}")

        print(f"\nPassed: {passed}/{total}")

        if passed == total:
            print("\n✓ ALL TESTS PASSED!")
        else:
            print(f"\n✗ {total - passed} test(s) failed")

        return passed == total


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Test Inventory API endpoints")
    parser.add_argument("--url", default="http://localhost:5000",
                       help="Server URL (default: http://localhost:5000)")
    parser.add_argument("--test", choices=['get', 'add', 'equip', 'use', 'unequip', 'drop', 'move', 'all'],
                       default='all', help="Test to run (default: all)")

    args = parser.parse_args()

    tester = InventoryTester(args.url)

    if args.test == 'all':
        tester.run_all_tests()
    elif args.test == 'get':
        tester.get_csrf_token()
        tester.test_get_inventory()
    elif args.test == 'add':
        tester.get_csrf_token()
        tester.test_add_item()
    elif args.test == 'equip':
        tester.get_csrf_token()
        tester.test_equip_item()
    elif args.test == 'use':
        tester.get_csrf_token()
        tester.test_use_item()
    elif args.test == 'unequip':
        tester.get_csrf_token()
        tester.test_unequip_item()
    elif args.test == 'drop':
        tester.get_csrf_token()
        tester.test_drop_item()
    elif args.test == 'move':
        tester.get_csrf_token()
        tester.test_move_item()


if __name__ == "__main__":
    main()
