"""
The Arcane Codex - Inventory and Item System
Equipment, consumables, and loot management
"""

import json
import random
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)

class ItemType(Enum):
    """Item categories"""
    WEAPON = "weapon"
    ARMOR = "armor"
    ACCESSORY = "accessory"
    CONSUMABLE = "consumable"
    QUEST = "quest"
    MATERIAL = "material"
    TREASURE = "treasure"

class ItemRarity(Enum):
    """Item rarity tiers"""
    COMMON = "common"      # Gray - 60% drop rate
    UNCOMMON = "uncommon"  # Green - 25% drop rate
    RARE = "rare"         # Blue - 10% drop rate
    EPIC = "epic"         # Purple - 4% drop rate
    LEGENDARY = "legendary"  # Orange - 1% drop rate
    DIVINE = "divine"     # Gold - Special events only

class WeaponType(Enum):
    """Weapon categories"""
    SWORD = "sword"
    AXE = "axe"
    DAGGER = "dagger"
    BOW = "bow"
    STAFF = "staff"
    MACE = "mace"
    WAND = "wand"

class ArmorSlot(Enum):
    """Armor equipment slots"""
    HEAD = "head"
    CHEST = "chest"
    LEGS = "legs"
    FEET = "feet"
    HANDS = "hands"
    SHIELD = "shield"

@dataclass
class ItemStats:
    """Item stat modifiers"""
    attack: int = 0
    defense: int = 0
    magic: int = 0
    speed: int = 0
    hp_bonus: int = 0
    critical_chance: float = 0.0
    dodge_chance: float = 0.0
    damage_reduction: float = 0.0

@dataclass
class Item:
    """Base item class"""
    id: str
    name: str
    description: str
    type: ItemType
    rarity: ItemRarity
    value: int  # Gold value
    level_requirement: int = 1
    class_requirement: Optional[str] = None
    stats: ItemStats = field(default_factory=ItemStats)
    effects: Dict[str, Any] = field(default_factory=dict)
    stackable: bool = False
    max_stack: int = 1
    icon: str = "📦"

@dataclass
class Equipment(Item):
    """Equipment item (weapon/armor)"""
    slot: Optional[str] = None  # WeaponType or ArmorSlot
    durability: int = 100
    max_durability: int = 100
    enchantments: List[str] = field(default_factory=list)

@dataclass
class Consumable(Item):
    """Consumable item"""
    uses: int = 1
    effect_type: str = "healing"  # healing, buff, damage, utility
    effect_value: int = 0
    effect_duration: int = 0  # Turns for buffs
    cooldown: int = 0

@dataclass
class InventorySlot:
    """Inventory slot container"""
    item: Optional[Item] = None
    quantity: int = 0
    slot_index: int = 0

class ItemDatabase:
    """Database of all items"""

    def __init__(self):
        self.items = {}
        self._load_base_items()

    def _load_base_items(self):
        """Load base item templates"""

        # Weapons
        self.items['rusty_sword'] = Equipment(
            id='rusty_sword',
            name='Rusty Sword',
            description='A worn blade that has seen better days',
            type=ItemType.WEAPON,
            rarity=ItemRarity.COMMON,
            value=10,
            stats=ItemStats(attack=2),
            slot=WeaponType.SWORD.value,
            icon='⚔️'
        )

        self.items['iron_sword'] = Equipment(
            id='iron_sword',
            name='Iron Sword',
            description='A reliable iron blade',
            type=ItemType.WEAPON,
            rarity=ItemRarity.UNCOMMON,
            value=50,
            level_requirement=3,
            stats=ItemStats(attack=4, critical_chance=0.05),
            slot=WeaponType.SWORD.value,
            icon='🗡️'
        )

        self.items['mage_staff'] = Equipment(
            id='mage_staff',
            name='Apprentice Staff',
            description='A basic staff for channeling magic',
            type=ItemType.WEAPON,
            rarity=ItemRarity.COMMON,
            value=15,
            class_requirement='Mage',
            stats=ItemStats(magic=3),
            slot=WeaponType.STAFF.value,
            icon='🔱'
        )

        self.items['shadow_dagger'] = Equipment(
            id='shadow_dagger',
            name='Shadow Dagger',
            description='A blade that seems to drink in the light',
            type=ItemType.WEAPON,
            rarity=ItemRarity.RARE,
            value=150,
            level_requirement=5,
            class_requirement='Thief',
            stats=ItemStats(attack=5, speed=2, critical_chance=0.15),
            slot=WeaponType.DAGGER.value,
            icon='🗡️'
        )

        self.items['divine_mace'] = Equipment(
            id='divine_mace',
            name='Blessed Mace',
            description='A mace blessed by the gods',
            type=ItemType.WEAPON,
            rarity=ItemRarity.EPIC,
            value=500,
            level_requirement=7,
            class_requirement='Cleric',
            stats=ItemStats(attack=6, magic=3),
            slot=WeaponType.MACE.value,
            effects={'holy_damage': 5},
            icon='🔨'
        )

        # Armor
        self.items['leather_armor'] = Equipment(
            id='leather_armor',
            name='Leather Armor',
            description='Basic leather protection',
            type=ItemType.ARMOR,
            rarity=ItemRarity.COMMON,
            value=20,
            stats=ItemStats(defense=2),
            slot=ArmorSlot.CHEST.value,
            icon='🎽'
        )

        self.items['iron_helmet'] = Equipment(
            id='iron_helmet',
            name='Iron Helmet',
            description='Sturdy head protection',
            type=ItemType.ARMOR,
            rarity=ItemRarity.UNCOMMON,
            value=40,
            level_requirement=2,
            stats=ItemStats(defense=1, hp_bonus=5),
            slot=ArmorSlot.HEAD.value,
            icon='⛑️'
        )

        self.items['mage_robes'] = Equipment(
            id='mage_robes',
            name='Mystic Robes',
            description='Robes that enhance magical power',
            type=ItemType.ARMOR,
            rarity=ItemRarity.UNCOMMON,
            value=60,
            level_requirement=3,
            class_requirement='Mage',
            stats=ItemStats(magic=2, defense=1),
            slot=ArmorSlot.CHEST.value,
            icon='🥼'
        )

        self.items['wooden_shield'] = Equipment(
            id='wooden_shield',
            name='Wooden Shield',
            description='A basic wooden shield',
            type=ItemType.ARMOR,
            rarity=ItemRarity.COMMON,
            value=15,
            stats=ItemStats(defense=1, damage_reduction=0.05),
            slot=ArmorSlot.SHIELD.value,
            icon='🛡️'
        )

        # Accessories
        self.items['silver_ring'] = Item(
            id='silver_ring',
            name='Silver Ring',
            description='A simple silver band',
            type=ItemType.ACCESSORY,
            rarity=ItemRarity.UNCOMMON,
            value=30,
            stats=ItemStats(magic=1),
            icon='💍'
        )

        self.items['lucky_charm'] = Item(
            id='lucky_charm',
            name='Lucky Charm',
            description='Increases your fortune',
            type=ItemType.ACCESSORY,
            rarity=ItemRarity.RARE,
            value=100,
            stats=ItemStats(critical_chance=0.1, dodge_chance=0.05),
            effects={'luck_bonus': 10},
            icon='🍀'
        )

        # Consumables
        self.items['health_potion'] = Consumable(
            id='health_potion',
            name='Health Potion',
            description='Restores 20 HP',
            type=ItemType.CONSUMABLE,
            rarity=ItemRarity.COMMON,
            value=25,
            effect_type='healing',
            effect_value=20,
            stackable=True,
            max_stack=10,
            icon='🧪'
        )

        self.items['mana_potion'] = Consumable(
            id='mana_potion',
            name='Mana Potion',
            description='Restores 10 MP',
            type=ItemType.CONSUMABLE,
            rarity=ItemRarity.COMMON,
            value=20,
            effect_type='mana',
            effect_value=10,
            stackable=True,
            max_stack=10,
            icon='💙'
        )

        self.items['strength_elixir'] = Consumable(
            id='strength_elixir',
            name='Strength Elixir',
            description='+3 Attack for 5 turns',
            type=ItemType.CONSUMABLE,
            rarity=ItemRarity.UNCOMMON,
            value=50,
            effect_type='buff',
            effect_value=3,
            effect_duration=5,
            stackable=True,
            max_stack=5,
            icon='💪'
        )

        self.items['smoke_bomb'] = Consumable(
            id='smoke_bomb',
            name='Smoke Bomb',
            description='Escape from battle',
            type=ItemType.CONSUMABLE,
            rarity=ItemRarity.UNCOMMON,
            value=40,
            effect_type='utility',
            effect_value=1,  # Guaranteed escape
            stackable=True,
            max_stack=5,
            icon='💨'
        )

        # Quest Items
        self.items['ancient_key'] = Item(
            id='ancient_key',
            name='Ancient Key',
            description='An old key covered in mysterious runes',
            type=ItemType.QUEST,
            rarity=ItemRarity.RARE,
            value=0,  # Quest items have no sell value
            icon='🗝️'
        )

        # Materials
        self.items['iron_ore'] = Item(
            id='iron_ore',
            name='Iron Ore',
            description='Raw iron for crafting',
            type=ItemType.MATERIAL,
            rarity=ItemRarity.COMMON,
            value=5,
            stackable=True,
            max_stack=99,
            icon='⛏️'
        )

        self.items['monster_hide'] = Item(
            id='monster_hide',
            name='Monster Hide',
            description='Tough hide from a slain beast',
            type=ItemType.MATERIAL,
            rarity=ItemRarity.UNCOMMON,
            value=15,
            stackable=True,
            max_stack=50,
            icon='🦴'
        )

    def get_item(self, item_id: str) -> Optional[Item]:
        """Get item by ID"""
        return self.items.get(item_id)

    def generate_random_item(self, level: int = 1,
                           rarity: Optional[ItemRarity] = None) -> Item:
        """Generate a random item based on level"""
        if not rarity:
            # Random rarity based on weights
            roll = random.random() * 100
            if roll < 60:
                rarity = ItemRarity.COMMON
            elif roll < 85:
                rarity = ItemRarity.UNCOMMON
            elif roll < 95:
                rarity = ItemRarity.RARE
            elif roll < 99:
                rarity = ItemRarity.EPIC
            else:
                rarity = ItemRarity.LEGENDARY

        # Filter items by level and rarity
        eligible_items = [
            item for item in self.items.values()
            if item.level_requirement <= level and item.rarity == rarity
        ]

        if eligible_items:
            return random.choice(eligible_items)

        # Fallback to any common item
        return random.choice([i for i in self.items.values()
                            if i.rarity == ItemRarity.COMMON])

class Inventory:
    """Player inventory management"""

    def __init__(self, capacity: int = 30):
        self.capacity = capacity
        self.slots: List[InventorySlot] = [
            InventorySlot(slot_index=i) for i in range(capacity)
        ]
        self.equipped: Dict[str, Optional[Equipment]] = {
            WeaponType.SWORD.value: None,
            ArmorSlot.HEAD.value: None,
            ArmorSlot.CHEST.value: None,
            ArmorSlot.LEGS.value: None,
            ArmorSlot.FEET.value: None,
            ArmorSlot.HANDS.value: None,
            ArmorSlot.SHIELD.value: None,
            'accessory_1': None,
            'accessory_2': None
        }
        self.gold: int = 0
        self.item_db = ItemDatabase()

    def add_item(self, item: Item, quantity: int = 1) -> bool:
        """Add item to inventory"""
        if item.stackable:
            # Try to stack with existing
            for slot in self.slots:
                if (slot.item and slot.item.id == item.id and
                    slot.quantity < item.max_stack):
                    can_add = min(quantity, item.max_stack - slot.quantity)
                    slot.quantity += can_add
                    quantity -= can_add
                    if quantity == 0:
                        return True

        # Add to empty slots
        for slot in self.slots:
            if slot.item is None:
                if item.stackable:
                    add_amount = min(quantity, item.max_stack)
                    slot.item = item
                    slot.quantity = add_amount
                    quantity -= add_amount
                    if quantity == 0:
                        return True
                else:
                    slot.item = item
                    slot.quantity = 1
                    quantity -= 1
                    if quantity == 0:
                        return True

        # Inventory full
        return quantity == 0

    def remove_item(self, item_id: str, quantity: int = 1) -> bool:
        """Remove item from inventory"""
        remaining = quantity

        for slot in self.slots:
            if slot.item and slot.item.id == item_id:
                if slot.quantity >= remaining:
                    slot.quantity -= remaining
                    if slot.quantity == 0:
                        slot.item = None
                    return True
                else:
                    remaining -= slot.quantity
                    slot.item = None
                    slot.quantity = 0

        return remaining == 0

    def equip_item(self, item: Equipment) -> Optional[Equipment]:
        """Equip an item, returns previously equipped item"""
        if item.type not in [ItemType.WEAPON, ItemType.ARMOR]:
            return None

        slot = item.slot
        previously_equipped = self.equipped.get(slot)

        # Remove from inventory
        if self.remove_item(item.id, 1):
            # Add previously equipped to inventory
            if previously_equipped:
                self.add_item(previously_equipped, 1)

            # Equip new item
            self.equipped[slot] = item
            return previously_equipped

        return None

    def unequip_item(self, slot: str) -> bool:
        """Unequip item from slot"""
        item = self.equipped.get(slot)
        if item and self.add_item(item, 1):
            self.equipped[slot] = None
            return True
        return False

    def get_total_stats(self) -> ItemStats:
        """Calculate total stats from all equipped items"""
        total_stats = ItemStats()

        for item in self.equipped.values():
            if item and hasattr(item, 'stats'):
                total_stats.attack += item.stats.attack
                total_stats.defense += item.stats.defense
                total_stats.magic += item.stats.magic
                total_stats.speed += item.stats.speed
                total_stats.hp_bonus += item.stats.hp_bonus
                total_stats.critical_chance += item.stats.critical_chance
                total_stats.dodge_chance += item.stats.dodge_chance
                total_stats.damage_reduction += item.stats.damage_reduction

        return total_stats

    def use_consumable(self, item_id: str) -> Optional[Dict]:
        """Use a consumable item"""
        for slot in self.slots:
            if slot.item and slot.item.id == item_id:
                if isinstance(slot.item, Consumable):
                    effect = {
                        'type': slot.item.effect_type,
                        'value': slot.item.effect_value,
                        'duration': slot.item.effect_duration
                    }

                    # Remove one use
                    slot.quantity -= 1
                    if slot.quantity == 0:
                        slot.item = None

                    return effect
        return None

    def get_inventory_value(self) -> int:
        """Calculate total inventory value"""
        total = self.gold

        for slot in self.slots:
            if slot.item:
                total += slot.item.value * slot.quantity

        for item in self.equipped.values():
            if item:
                total += item.value

        return total

    def serialize(self) -> Dict:
        """Serialize inventory for storage"""
        return {
            'gold': self.gold,
            'capacity': self.capacity,
            'items': [
                {
                    'item_id': slot.item.id if slot.item else None,
                    'quantity': slot.quantity
                }
                for slot in self.slots
            ],
            'equipped': {
                slot: item.id if item else None
                for slot, item in self.equipped.items()
            }
        }

    def deserialize(self, data: Dict):
        """Load inventory from serialized data"""
        self.gold = data.get('gold', 0)
        self.capacity = data.get('capacity', 30)

        # Load items
        for i, item_data in enumerate(data.get('items', [])):
            if item_data['item_id']:
                item = self.item_db.get_item(item_data['item_id'])
                if item and i < len(self.slots):
                    self.slots[i].item = item
                    self.slots[i].quantity = item_data['quantity']

        # Load equipped items
        for slot, item_id in data.get('equipped', {}).items():
            if item_id:
                item = self.item_db.get_item(item_id)
                if item:
                    self.equipped[slot] = item

class LootTable:
    """Loot generation system"""

    def __init__(self):
        self.item_db = ItemDatabase()
        self.enemy_loot_tables = self._create_loot_tables()

    def _create_loot_tables(self) -> Dict:
        """Create loot tables for different enemies"""
        return {
            'goblin': {
                'gold': (1, 10),  # Min-max gold
                'items': [
                    ('health_potion', 0.3),  # 30% chance
                    ('rusty_sword', 0.1),
                    ('leather_armor', 0.05),
                    ('iron_ore', 0.4)
                ]
            },
            'orc': {
                'gold': (5, 20),
                'items': [
                    ('health_potion', 0.4),
                    ('iron_sword', 0.15),
                    ('iron_helmet', 0.1),
                    ('strength_elixir', 0.2)
                ]
            },
            'skeleton': {
                'gold': (0, 5),
                'items': [
                    ('rusty_sword', 0.2),
                    ('wooden_shield', 0.15),
                    ('iron_ore', 0.3)
                ]
            },
            'bandit': {
                'gold': (10, 30),
                'items': [
                    ('health_potion', 0.5),
                    ('smoke_bomb', 0.3),
                    ('shadow_dagger', 0.05),
                    ('silver_ring', 0.1)
                ]
            },
            'boss': {
                'gold': (50, 100),
                'items': [
                    ('health_potion', 1.0),  # Guaranteed
                    ('divine_mace', 0.2),
                    ('lucky_charm', 0.3),
                    ('strength_elixir', 0.5)
                ]
            }
        }

    def generate_loot(self, enemy_type: str, level: int = 1) -> Dict:
        """Generate loot for defeated enemy"""
        loot = {
            'gold': 0,
            'items': []
        }

        table = self.enemy_loot_tables.get(enemy_type, self.enemy_loot_tables['goblin'])

        # Generate gold
        min_gold, max_gold = table['gold']
        loot['gold'] = random.randint(min_gold, max_gold) * level

        # Generate items
        for item_id, chance in table['items']:
            if random.random() < chance:
                item = self.item_db.get_item(item_id)
                if item:
                    quantity = 1
                    if item.stackable:
                        quantity = random.randint(1, min(3, item.max_stack))
                    loot['items'].append({
                        'item': item,
                        'quantity': quantity
                    })

        # Chance for random bonus item based on level
        if random.random() < (0.05 * level):
            bonus_item = self.item_db.generate_random_item(level)
            loot['items'].append({
                'item': bonus_item,
                'quantity': 1
            })

        return loot

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Inventory System...")

    # Create inventory
    inventory = Inventory()
    inventory.gold = 100
    print(f"Starting gold: {inventory.gold}")

    # Get some items
    item_db = ItemDatabase()
    sword = item_db.get_item('iron_sword')
    armor = item_db.get_item('leather_armor')
    potion = item_db.get_item('health_potion')

    # Add items
    print("\nAdding items...")
    inventory.add_item(sword, 1)
    inventory.add_item(armor, 1)
    inventory.add_item(potion, 5)

    # Equip items
    print("\nEquipping sword...")
    inventory.equip_item(sword)

    print("Equipping armor...")
    inventory.equip_item(armor)

    # Check stats
    total_stats = inventory.get_total_stats()
    print(f"\nTotal equipped stats:")
    print(f"  Attack: +{total_stats.attack}")
    print(f"  Defense: +{total_stats.defense}")
    print(f"  Magic: +{total_stats.magic}")

    # Test loot generation
    print("\n\nTesting Loot Generation...")
    loot_table = LootTable()

    for enemy in ['goblin', 'orc', 'bandit']:
        print(f"\nLoot from {enemy}:")
        loot = loot_table.generate_loot(enemy, level=2)
        print(f"  Gold: {loot['gold']}")
        for item_data in loot['items']:
            print(f"  {item_data['item'].name} x{item_data['quantity']}")

    # Test serialization
    print("\n\nTesting Serialization...")
    serialized = inventory.serialize()
    print(f"Serialized data keys: {serialized.keys()}")

    print("\nInventory system test complete!")