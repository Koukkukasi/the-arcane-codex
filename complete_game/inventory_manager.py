"""
THE ARCANE CODEX - Inventory Manager Module
Manages character inventory, equipment, and item interactions
"""

from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
import json
import logging
from inventory_system import (
    Item, Equipment, Consumable, ItemType, ItemRarity,
    ItemStats, ItemDatabase, InventorySlot, Inventory
)

logger = logging.getLogger(__name__)


@dataclass
class ItemSimple:
    """Simplified item structure for character inventory"""
    id: str
    name: str
    type: str  # weapon, armor, potion, scroll, food, quest, treasure
    description: str
    quantity: int = 1
    weight: float = 1.0
    value: int = 0
    rarity: str = "common"
    equipped: bool = False
    slot: Optional[str] = None  # main_hand, off_hand, armor, helmet, gloves, boots, accessory1, accessory2
    stats: Dict[str, int] = None  # {str: +2, dex: +1, etc}
    icon: str = "📦"

    def __post_init__(self):
        if self.stats is None:
            self.stats = {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'quantity': self.quantity,
            'weight': self.weight,
            'value': self.value,
            'rarity': self.rarity,
            'equipped': self.equipped,
            'slot': self.slot,
            'stats': self.stats or {},
            'icon': self.icon
        }


class InventoryManager:
    """Manages character inventory and equipment"""

    def __init__(self, character):
        """
        Initialize inventory manager

        Args:
            character: Character object with inventory and equipment attributes
        """
        self.character = character
        self.max_slots = 48
        self.max_weight = getattr(character, 'max_carry_weight', 100.0)
        self.item_db = ItemDatabase()

        # Ensure character has inventory list
        if not hasattr(character, 'inventory') or character.inventory is None:
            character.inventory = []

        # Ensure character has equipment dict
        if not hasattr(character, 'equipment') or character.equipment is None:
            character.equipment = {}

    def get_item(self, item_id: str) -> Optional[Dict]:
        """Get item from character inventory by ID"""
        for item in self.character.inventory:
            if isinstance(item, dict) and item.get('id') == item_id:
                return item
        return None

    def add_item(self, item: Dict, quantity: int = 1) -> bool:
        """
        Add item to inventory

        Args:
            item: Item dictionary
            quantity: Number of items to add

        Returns:
            True if successful, False if inventory full
        """
        # Check slots
        if len(self.character.inventory) >= self.max_slots:
            logger.warning(f"Inventory full: {len(self.character.inventory)}/{self.max_slots}")
            return False

        # Check weight
        item_weight = item.get('weight', 1.0) * quantity
        if self.get_total_weight() + item_weight > self.max_weight:
            logger.warning(f"Inventory too heavy: {self.get_total_weight() + item_weight}/{self.max_weight}")
            return False

        # Check if item is stackable and already exists
        if item.get('stackable', False):
            existing = self.get_item(item['id'])
            if existing:
                existing['quantity'] = existing.get('quantity', 1) + quantity
                logger.info(f"Stacked {quantity}x {item['name']} (total: {existing['quantity']})")
                return True

        # Add new item
        new_item = item.copy()
        new_item['quantity'] = quantity
        new_item['equipped'] = False
        new_item['slot'] = None

        self.character.inventory.append(new_item)
        logger.info(f"Added {quantity}x {item['name']} to inventory")
        return True

    def remove_item(self, item_id: str, quantity: int = 1) -> bool:
        """
        Remove item from inventory

        Args:
            item_id: ID of item to remove
            quantity: Number to remove

        Returns:
            True if successful, False if item not found
        """
        for i, item in enumerate(self.character.inventory):
            if isinstance(item, dict) and item.get('id') == item_id:
                current_qty = item.get('quantity', 1)

                if current_qty > quantity:
                    item['quantity'] = current_qty - quantity
                    logger.info(f"Removed {quantity}x {item['name']} (remaining: {item['quantity']})")
                    return True
                else:
                    self.character.inventory.pop(i)
                    logger.info(f"Removed {item['name']} from inventory")
                    return True

        logger.warning(f"Item {item_id} not found in inventory")
        return False

    def _is_valid_slot(self, item_type: str, slot: str) -> bool:
        """Check if slot is valid for item type"""
        slot_mappings = {
            'weapon': ['main_hand', 'off_hand'],
            'armor': ['armor', 'chest'],
            'helmet': ['helmet', 'head'],
            'gloves': ['gloves', 'hands'],
            'boots': ['boots', 'feet'],
            'shield': ['off_hand', 'shield'],
            'accessory': ['accessory1', 'accessory2', 'ring1', 'ring2'],
            'consumable': []
        }

        valid_slots = slot_mappings.get(item_type, [])
        return slot in valid_slots

    def equip_item(self, item_id: str, slot: str) -> Dict[str, Any]:
        """
        Equip item to slot

        Args:
            item_id: ID of item to equip
            slot: Equipment slot (main_hand, off_hand, armor, helmet, etc.)

        Returns:
            Dictionary with success status and details
        """
        # Find item in inventory
        item = self.get_item(item_id)
        if not item:
            logger.warning(f"Item {item_id} not found for equipping")
            return {'success': False, 'error': 'Item not found'}

        # Check if item can be equipped
        if item.get('type') in ['potion', 'scroll', 'food', 'quest', 'treasure', 'consumable']:
            return {'success': False, 'error': 'Item cannot be equipped'}

        # Check if slot is valid for item type
        if not self._is_valid_slot(item.get('type', ''), slot):
            return {'success': False, 'error': f'Invalid slot {slot} for item type {item.get("type")}'}

        # Unequip current item in slot
        unequipped = None
        for inv_item in self.character.inventory:
            if isinstance(inv_item, dict) and inv_item.get('equipped') and inv_item.get('slot') == slot:
                inv_item['equipped'] = False
                inv_item['slot'] = None
                unequipped = inv_item
                self._remove_item_stats(inv_item)
                logger.info(f"Unequipped {inv_item['name']} from {slot}")

        # Equip new item
        item['equipped'] = True
        item['slot'] = slot
        self._apply_item_stats(item)

        # Update character equipment dict for compatibility
        self.character.equipment[slot] = item_id

        logger.info(f"Equipped {item['name']} to {slot}")

        return {
            'success': True,
            'equipped': item,
            'unequipped': unequipped
        }

    def unequip_item(self, item_id: str) -> Dict[str, Any]:
        """
        Unequip item

        Args:
            item_id: ID of item to unequip

        Returns:
            Dictionary with success status
        """
        item = self.get_item(item_id)
        if not item or not item.get('equipped'):
            return {'success': False, 'error': 'Item not equipped'}

        slot = item.get('slot')
        item['equipped'] = False
        item['slot'] = None

        self._remove_item_stats(item)

        # Update character equipment dict
        if slot and slot in self.character.equipment:
            del self.character.equipment[slot]

        logger.info(f"Unequipped {item['name']}")

        return {'success': True, 'item': item}

    def use_item(self, item_id: str) -> Dict[str, Any]:
        """
        Use consumable item

        Args:
            item_id: ID of item to use

        Returns:
            Dictionary with success status and effect
        """
        item = self.get_item(item_id)
        if not item:
            return {'success': False, 'error': 'Item not found'}

        item_type = item.get('type', '')

        if item_type == 'potion':
            return self._use_potion(item)
        elif item_type == 'scroll':
            return self._use_scroll(item)
        elif item_type == 'food':
            return self._use_food(item)
        elif item_type == 'consumable':
            return self._use_consumable(item)
        else:
            return {'success': False, 'error': 'Item cannot be used'}

    def _use_potion(self, item: Dict) -> Dict[str, Any]:
        """Use a health/mana potion"""
        effect_value = item.get('effect_value', 20)
        effect_type = item.get('effect_type', 'healing')

        if effect_type == 'healing':
            old_hp = self.character.hp
            self.character.hp = min(self.character.hp_max, self.character.hp + effect_value)
            healed = self.character.hp - old_hp

            # Remove one from stack
            self.remove_item(item['id'], 1)

            logger.info(f"Used {item['name']}: healed {healed} HP")

            return {
                'success': True,
                'effect': 'healing',
                'value': healed,
                'message': f"Restored {healed} HP"
            }
        elif effect_type == 'mana':
            old_mana = self.character.mana
            self.character.mana = min(self.character.mana_max, self.character.mana + effect_value)
            restored = self.character.mana - old_mana

            # Remove one from stack
            self.remove_item(item['id'], 1)

            logger.info(f"Used {item['name']}: restored {restored} MP")

            return {
                'success': True,
                'effect': 'mana',
                'value': restored,
                'message': f"Restored {restored} MP"
            }

        return {'success': False, 'error': 'Unknown potion effect'}

    def _use_scroll(self, item: Dict) -> Dict[str, Any]:
        """Use a magic scroll"""
        # Remove from inventory
        self.remove_item(item['id'], 1)

        logger.info(f"Used scroll: {item['name']}")

        return {
            'success': True,
            'effect': 'spell',
            'value': item.get('effect_value', 0),
            'message': f"Cast {item['name']}"
        }

    def _use_food(self, item: Dict) -> Dict[str, Any]:
        """Use food item"""
        effect_value = item.get('effect_value', 10)

        old_stamina = getattr(self.character, 'stamina', 80)
        stamina_max = getattr(self.character, 'stamina_max', 80)
        new_stamina = min(stamina_max, old_stamina + effect_value)

        if hasattr(self.character, 'stamina'):
            self.character.stamina = new_stamina

        restored = new_stamina - old_stamina

        # Remove from inventory
        self.remove_item(item['id'], 1)

        logger.info(f"Used food: {item['name']}, restored {restored} stamina")

        return {
            'success': True,
            'effect': 'stamina',
            'value': restored,
            'message': f"Restored {restored} stamina"
        }

    def _use_consumable(self, item: Dict) -> Dict[str, Any]:
        """Use generic consumable"""
        effect_type = item.get('effect_type', 'healing')
        effect_value = item.get('effect_value', 0)

        # Remove from inventory
        self.remove_item(item['id'], 1)

        logger.info(f"Used consumable: {item['name']}")

        return {
            'success': True,
            'effect': effect_type,
            'value': effect_value,
            'message': f"Used {item['name']}"
        }

    def _apply_item_stats(self, item: Dict):
        """Apply item stat bonuses to character"""
        stats = item.get('stats', {})

        # Apply stat modifiers
        for stat, value in stats.items():
            if stat in ['str', 'strength']:
                if hasattr(self.character, 'skills'):
                    self.character.skills['strength'] = self.character.skills.get('strength', 10) + value
            elif stat in ['dex', 'dexterity']:
                if hasattr(self.character, 'skills'):
                    self.character.skills['archery'] = self.character.skills.get('archery', 10) + value
            elif stat in ['int', 'intelligence']:
                if hasattr(self.character, 'skills'):
                    self.character.skills['arcana'] = self.character.skills.get('arcana', 10) + value
            elif stat in ['con', 'constitution']:
                # Increase max HP
                if hasattr(self.character, 'hp_max'):
                    self.character.hp_max += value * 5
            elif stat == 'attack':
                if hasattr(self.character, 'skills'):
                    self.character.skills['strength'] = self.character.skills.get('strength', 10) + value
            elif stat == 'defense':
                # Could add defense stat if needed
                pass

        logger.debug(f"Applied stats from {item['name']}: {stats}")

    def _remove_item_stats(self, item: Dict):
        """Remove item stat bonuses from character"""
        stats = item.get('stats', {})

        # Remove stat modifiers
        for stat, value in stats.items():
            if stat in ['str', 'strength']:
                if hasattr(self.character, 'skills'):
                    self.character.skills['strength'] = max(0, self.character.skills.get('strength', 10) - value)
            elif stat in ['dex', 'dexterity']:
                if hasattr(self.character, 'skills'):
                    self.character.skills['archery'] = max(0, self.character.skills.get('archery', 10) - value)
            elif stat in ['int', 'intelligence']:
                if hasattr(self.character, 'skills'):
                    self.character.skills['arcana'] = max(0, self.character.skills.get('arcana', 10) - value)
            elif stat in ['con', 'constitution']:
                # Decrease max HP
                if hasattr(self.character, 'hp_max'):
                    self.character.hp_max = max(1, self.character.hp_max - value * 5)
                    self.character.hp = min(self.character.hp, self.character.hp_max)
            elif stat == 'attack':
                if hasattr(self.character, 'skills'):
                    self.character.skills['strength'] = max(0, self.character.skills.get('strength', 10) - value)

        logger.debug(f"Removed stats from {item['name']}: {stats}")

    def get_total_weight(self) -> float:
        """Calculate total inventory weight"""
        total = 0.0
        for item in self.character.inventory:
            if isinstance(item, dict):
                weight = item.get('weight', 1.0)
                quantity = item.get('quantity', 1)
                total += weight * quantity
        return round(total, 2)

    def get_equipped_items(self) -> Dict[str, Dict]:
        """Get all equipped items"""
        equipped = {}
        for item in self.character.inventory:
            if isinstance(item, dict) and item.get('equipped'):
                slot = item.get('slot')
                if slot:
                    equipped[slot] = item
        return equipped

    def get_total_stats(self) -> Dict[str, int]:
        """Get total stats from all equipped items"""
        total_stats = {
            'attack': 0,
            'defense': 0,
            'magic': 0,
            'speed': 0,
            'hp_bonus': 0,
            'critical_chance': 0,
            'dodge_chance': 0
        }

        for item in self.character.inventory:
            if isinstance(item, dict) and item.get('equipped'):
                stats = item.get('stats', {})
                for stat, value in stats.items():
                    if stat in total_stats:
                        total_stats[stat] += value
                    elif stat in ['str', 'strength']:
                        total_stats['attack'] += value
                    elif stat in ['int', 'intelligence']:
                        total_stats['magic'] += value
                    elif stat in ['con', 'constitution']:
                        total_stats['hp_bonus'] += value * 5

        return total_stats


def create_starting_inventory(character_class: str) -> List[Dict]:
    """
    Create starting inventory based on character class

    Args:
        character_class: Character class (Fighter, Mage, Thief, Cleric)

    Returns:
        List of item dictionaries
    """
    items = []

    if character_class == "Fighter":
        items.append({
            'id': 'iron_sword',
            'name': 'Iron Sword',
            'type': 'weapon',
            'description': 'A reliable iron blade',
            'quantity': 1,
            'weight': 3.0,
            'value': 50,
            'rarity': 'uncommon',
            'stats': {'strength': 2, 'attack': 4},
            'icon': '🗡️',
            'equipped': False,
            'slot': None
        })
        items.append({
            'id': 'leather_armor',
            'name': 'Leather Armor',
            'type': 'armor',
            'description': 'Light but effective protection',
            'quantity': 1,
            'weight': 5.0,
            'value': 40,
            'rarity': 'common',
            'stats': {'constitution': 1, 'defense': 2},
            'icon': '🎽',
            'equipped': False,
            'slot': None
        })

    elif character_class == "Mage":
        items.append({
            'id': 'wooden_staff',
            'name': 'Apprentice Staff',
            'type': 'weapon',
            'description': 'A staff for channeling magical energy',
            'quantity': 1,
            'weight': 2.0,
            'value': 45,
            'rarity': 'common',
            'stats': {'intelligence': 2, 'magic': 3},
            'icon': '🔱',
            'equipped': False,
            'slot': None
        })
        items.append({
            'id': 'cloth_robe',
            'name': 'Mystic Robes',
            'type': 'armor',
            'description': 'Robes that enhance magical power',
            'quantity': 1,
            'weight': 2.0,
            'value': 35,
            'rarity': 'uncommon',
            'stats': {'intelligence': 1, 'magic': 2},
            'icon': '🥼',
            'equipped': False,
            'slot': None
        })

    elif character_class == "Thief":
        items.append({
            'id': 'rusty_dagger',
            'name': 'Rusty Dagger',
            'type': 'weapon',
            'description': 'A worn but sharp blade',
            'quantity': 1,
            'weight': 1.0,
            'value': 25,
            'rarity': 'common',
            'stats': {'dexterity': 1, 'attack': 2},
            'icon': '🗡️',
            'equipped': False,
            'slot': None
        })
        items.append({
            'id': 'leather_armor',
            'name': 'Leather Armor',
            'type': 'armor',
            'description': 'Light but effective protection',
            'quantity': 1,
            'weight': 5.0,
            'value': 40,
            'rarity': 'common',
            'stats': {'dexterity': 1, 'defense': 1},
            'icon': '🎽',
            'equipped': False,
            'slot': None
        })

    elif character_class == "Cleric":
        items.append({
            'id': 'wooden_mace',
            'name': 'Simple Mace',
            'type': 'weapon',
            'description': 'A basic mace blessed by the gods',
            'quantity': 1,
            'weight': 4.0,
            'value': 40,
            'rarity': 'common',
            'stats': {'strength': 1, 'attack': 3},
            'icon': '🔨',
            'equipped': False,
            'slot': None
        })
        items.append({
            'id': 'wooden_shield',
            'name': 'Wooden Shield',
            'type': 'shield',
            'description': 'A basic wooden shield',
            'quantity': 1,
            'weight': 3.0,
            'value': 30,
            'rarity': 'common',
            'stats': {'defense': 2},
            'icon': '🛡️',
            'equipped': False,
            'slot': None
        })

    # Everyone gets starting potions
    items.append({
        'id': 'health_potion',
        'name': 'Health Potion',
        'type': 'potion',
        'description': 'Restores 30 HP',
        'quantity': 3,
        'weight': 0.2,
        'value': 20,
        'rarity': 'common',
        'stackable': True,
        'effect_type': 'healing',
        'effect_value': 30,
        'icon': '🧪',
        'equipped': False,
        'slot': None
    })

    items.append({
        'id': 'bread',
        'name': 'Bread',
        'type': 'food',
        'description': 'Simple but filling',
        'quantity': 2,
        'weight': 0.1,
        'value': 5,
        'rarity': 'common',
        'stackable': True,
        'effect_type': 'stamina',
        'effect_value': 10,
        'icon': '🍞',
        'equipped': False,
        'slot': None
    })

    return items


# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Inventory Manager...")

    # Mock character
    @dataclass
    class MockCharacter:
        name: str
        character_class: str
        hp: int = 80
        hp_max: int = 80
        mana: int = 60
        mana_max: int = 60
        stamina: int = 80
        stamina_max: int = 80
        gold: int = 50
        max_carry_weight: float = 100.0
        inventory: List[Dict] = None
        equipment: Dict[str, str] = None
        skills: Dict[str, int] = None

        def __post_init__(self):
            if self.inventory is None:
                self.inventory = []
            if self.equipment is None:
                self.equipment = {}
            if self.skills is None:
                self.skills = {
                    'strength': 10, 'archery': 10, 'arcana': 10
                }

    # Create test character
    character = MockCharacter(name="Test Hero", character_class="Fighter")

    # Create starting inventory
    starting_items = create_starting_inventory("Fighter")
    print(f"\nStarting items for Fighter: {len(starting_items)}")
    for item in starting_items:
        print(f"  - {item['name']} x{item['quantity']}")

    # Add to character
    inv_manager = InventoryManager(character)
    for item in starting_items:
        inv_manager.add_item(item, item['quantity'])

    print(f"\nInventory: {len(character.inventory)} items")
    print(f"Total weight: {inv_manager.get_total_weight()}/{inv_manager.max_weight}")

    # Test equipping
    sword = inv_manager.get_item('iron_sword')
    if sword:
        result = inv_manager.equip_item('iron_sword', 'main_hand')
        print(f"\nEquip sword: {result['success']}")

        equipped = inv_manager.get_equipped_items()
        print(f"Equipped items: {list(equipped.keys())}")

        total_stats = inv_manager.get_total_stats()
        print(f"Total stats: {total_stats}")

    # Test using potion
    result = inv_manager.use_item('health_potion')
    print(f"\nUse potion: {result}")

    print("\nInventory Manager test complete!")
