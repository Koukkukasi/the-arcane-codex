"""
The Arcane Codex - Items & Equipment ASCII Art
Contains detailed ASCII art for weapons, consumables, armor, and treasure
"""

# ========== WEAPONS ==========

# Iron Sword - Basic melee weapon
IRON_SWORD = """
     ╱╲
    ╱██╲
   ╱████╲
  │██████│
  │██████│
  │██████│
  ╰──██──╯
    ╱██╲
   ╔════╗
   ╚════╝
"""

# Mage Staff - Magic weapon
MAGE_STAFF = """
     ◊
    ╱◊╲
   │◊◊◊│
   │ ║ │
   │ ║ │
   │ ║ │
   │ ║ │
   │ ║ │
   ╰─╬─╯
     ▼
"""

# Shadow Dagger - Rogue weapon
SHADOW_DAGGER = """
    ▲
   ╱█╲
  ╱███╲
 │█████│
 ╰─███─╯
   ╱█╲
  ╔═══╗
  ╚═══╝
"""

# Blessed Mace - Cleric weapon
BLESSED_MACE = """
    ╋╋╋
   ╔███╗
   ║███║
   ╚═╬═╝
     ║
     ║
     ║
   ╔═╬═╗
   ╚═══╝
"""

# Wooden Shield - Defense item
WOODEN_SHIELD = """
  ╔═════╗
 ╱║░░░░░║╲
│ ║░░◊░░║ │
│ ║░░░░░║ │
│ ║░░░░░║ │
 ╲║░░░░░║╱
  ╚═════╝
"""

# ========== CONSUMABLES ==========

# Health Potion - HP restoration
HEALTH_POTION = """
    ╱◣
   │██│
   │▓▓│
  ╱▓▓▓╲
 │█████│
 │█████│
 │█████│
 ╰─────╯
   ╲═╱
"""

# Mana Potion - MP restoration
MANA_POTION = """
    ╱◣
   │░░│
   │▒▒│
  ╱▒▒▒╲
 │█████│
 │█████│
 │█████│
 ╰─────╯
   ╲═╱
"""

# Scroll of Power - Spell scroll
SCROLL_OF_POWER = """
 ╔══════╗
 ║▓▓▓▓▓▓║
 ║═══════║
 ║───────║
 ║~~~~~~~║
 ║═══════║
 ╚══╤╤══╝
    ││
"""

# ========== TREASURE & QUEST ITEMS ==========

# Treasure Chest - Loot container
TREASURE_CHEST = """
  ╔═══════╗
 ╱║ ◊ ◊ ◊ ║╲
│ ╚═══════╝ │
│ █████████ │
│ █████████ │
│ █████████ │
╰───────────╯
"""

# Ancient Key - Quest item
ANCIENT_KEY = """
    ◊
   ╱◊╲
  │◊◊◊│
  │ ║ │
  │ ║ │
  ╰─╬─╯
   ╱╬╲
  ╱╱╬╲╲
"""

# ========== ARMOR PIECES ==========

# Iron Helmet - Head armor
IRON_HELMET = """
  ╔═══╗
 ╱║▓▓▓║╲
│ ║▓▓▓║ │
│ ╚═══╝ │
│  ╲ ╱  │
╰───▼───╯
"""

# Leather Armor - Chest armor
LEATHER_ARMOR = """
 ╔═════╗
╱║░░░░░║╲
║░░░░░░░║
║░╔═══╗░║
║░║   ║░║
║░╚═══╝░║
╚═══════╝
"""

# Silver Ring - Accessory
SILVER_RING = """
   ╱◈╲
  │ ◊ │
  │◊ ◊│
  │ ◊ │
   ╲◈╱
"""

# ========== CRAFTING MATERIALS ==========

# Iron Ore - Metal crafting material
IRON_ORE = """
  ╱▓▓╲
 │▓██▓│
│██████│
╰──────╯
"""

# Monster Hide - Leather crafting material
MONSTER_HIDE = """
 ╭─────╮
│░░░░░░│
│▒▒▒▒▒▒│
│░░░░░░│
╰─────╯
"""

# ========== RARITY BORDERS ==========

# Common (Gray) - Basic items
BORDER_COMMON = """
┌─────┐
│ITEM │
└─────┘
"""

# Uncommon (Green) - Slightly better items
BORDER_UNCOMMON = """
╔═════╗
║ITEM ║
╚═════╝
"""

# Rare (Blue) - Valuable items
BORDER_RARE = """
╔╦═══╦╗
╠╣ITM╠╣
╚╩═══╩╝
"""

# Epic (Purple) - Very rare items
BORDER_EPIC = """
◆═════◆
║ITEM ║
◆═════◆
"""

# Legendary (Orange) - Extremely rare items
BORDER_LEGENDARY = """
✦═════✦
║ITEM ║
✦═════✦
"""

# Divine (Gold) - Mythical god-tier items
BORDER_DIVINE = """
☆═════☆
║ITEM ║
☆═════☆
"""

# ========== ITEM METADATA ==========

ITEM_METADATA = {
    # Weapons
    'iron_sword': {
        'name': 'Iron Sword',
        'ascii': IRON_SWORD,
        'type': 'weapon',
        'slot': 'main_hand',
        'rarity': 'common',
        'stats': {'attack': 3},
        'description': 'A basic iron blade for warriors',
        'animation': 'Blade gleam, slash trail',
        'color': '#9CA3AF'  # Common gray
    },
    'mage_staff': {
        'name': 'Mage Staff',
        'ascii': MAGE_STAFF,
        'type': 'weapon',
        'slot': 'two_hand',
        'rarity': 'uncommon',
        'stats': {'magic': 4},
        'description': 'A crystalline staff channeling arcane power',
        'animation': 'Crystal glow, energy pulse',
        'color': '#10B981'  # Uncommon green
    },
    'shadow_dagger': {
        'name': 'Shadow Dagger',
        'ascii': SHADOW_DAGGER,
        'type': 'weapon',
        'slot': 'main_hand',
        'rarity': 'rare',
        'stats': {'attack': 5, 'crit_chance': 15},
        'description': 'A poisoned blade that strikes from the shadows',
        'animation': 'Poison drip, shadow trail',
        'color': '#3B82F6'  # Rare blue
    },
    'blessed_mace': {
        'name': 'Blessed Mace',
        'ascii': BLESSED_MACE,
        'type': 'weapon',
        'slot': 'main_hand',
        'rarity': 'epic',
        'stats': {'attack': 6, 'magic': 3},
        'description': 'A holy weapon blessed by the divine',
        'animation': 'Holy glow, impact burst',
        'damage_type': 'holy',
        'color': '#A855F7'  # Epic purple
    },
    'wooden_shield': {
        'name': 'Wooden Shield',
        'ascii': WOODEN_SHIELD,
        'type': 'shield',
        'slot': 'off_hand',
        'rarity': 'common',
        'stats': {'defense': 1, 'damage_reduction': 5},
        'description': 'A simple wooden shield for protection',
        'animation': 'Block flash, damage absorb ripple',
        'color': '#9CA3AF'  # Common gray
    },

    # Consumables
    'health_potion': {
        'name': 'Health Potion',
        'ascii': HEALTH_POTION,
        'type': 'consumable',
        'rarity': 'common',
        'effect': {'heal': 20},
        'stack_max': 10,
        'description': 'Restores 20 HP',
        'animation': 'Bubble float, cork pop, liquid swirl',
        'color': '#DC2626'  # Red
    },
    'mana_potion': {
        'name': 'Mana Potion',
        'ascii': MANA_POTION,
        'type': 'consumable',
        'rarity': 'common',
        'effect': {'restore_mp': 10},
        'stack_max': 10,
        'description': 'Restores 10 MP',
        'animation': 'Mystic sparkle, energy restoration',
        'color': '#2563EB'  # Blue
    },
    'scroll_of_power': {
        'name': 'Scroll of Power',
        'ascii': SCROLL_OF_POWER,
        'type': 'consumable',
        'rarity': 'rare',
        'effect': {'buff': 'attack', 'duration': 3},
        'stack_max': 5,
        'description': 'Grants +3 attack for 3 turns',
        'animation': 'Unroll, rune glow, burn after use',
        'color': '#3B82F6'  # Rare blue
    },

    # Treasure & Quest Items
    'treasure_chest': {
        'name': 'Treasure Chest',
        'ascii': TREASURE_CHEST,
        'type': 'container',
        'rarity': 'legendary',
        'description': 'Contains random loot based on level',
        'animation': 'Lock break, lid open, treasure sparkle',
        'color': '#F97316'  # Legendary orange
    },
    'ancient_key': {
        'name': 'Ancient Key',
        'ascii': ANCIENT_KEY,
        'type': 'quest_item',
        'rarity': 'epic',
        'description': 'Opens sealed doors in ancient ruins',
        'animation': 'Rune glow, mystic resonance',
        'color': '#A855F7'  # Epic purple
    },

    # Armor Pieces
    'iron_helmet': {
        'name': 'Iron Helmet',
        'ascii': IRON_HELMET,
        'type': 'armor',
        'slot': 'head',
        'rarity': 'common',
        'stats': {'defense': 1, 'hp': 5},
        'description': 'Basic head protection',
        'animation': 'Damage deflect spark',
        'color': '#9CA3AF'  # Common gray
    },
    'leather_armor': {
        'name': 'Leather Armor',
        'ascii': LEATHER_ARMOR,
        'type': 'armor',
        'slot': 'chest',
        'rarity': 'common',
        'stats': {'defense': 2},
        'description': 'Light and flexible body armor',
        'animation': 'Flex on movement',
        'color': '#9CA3AF'  # Common gray
    },
    'silver_ring': {
        'name': 'Silver Ring',
        'ascii': SILVER_RING,
        'type': 'accessory',
        'slot': 'ring',
        'rarity': 'uncommon',
        'stats': {'magic': 1},
        'description': 'A simple enchanted ring',
        'animation': 'Sparkle rotation',
        'color': '#10B981'  # Uncommon green
    },

    # Crafting Materials
    'iron_ore': {
        'name': 'Iron Ore',
        'ascii': IRON_ORE,
        'type': 'material',
        'rarity': 'common',
        'stack_max': 99,
        'description': 'Raw iron for crafting weapons and armor',
        'color': '#9CA3AF'  # Common gray
    },
    'monster_hide': {
        'name': 'Monster Hide',
        'ascii': MONSTER_HIDE,
        'type': 'material',
        'rarity': 'common',
        'stack_max': 50,
        'description': 'Tough hide for crafting leather goods',
        'color': '#9CA3AF'  # Common gray
    }
}

# Rarity border metadata
RARITY_BORDERS = {
    'common': {
        'border': BORDER_COMMON,
        'color': '#9CA3AF',
        'name': 'Common'
    },
    'uncommon': {
        'border': BORDER_UNCOMMON,
        'color': '#10B981',
        'name': 'Uncommon'
    },
    'rare': {
        'border': BORDER_RARE,
        'color': '#3B82F6',
        'name': 'Rare'
    },
    'epic': {
        'border': BORDER_EPIC,
        'color': '#A855F7',
        'name': 'Epic'
    },
    'legendary': {
        'border': BORDER_LEGENDARY,
        'color': '#F97316',
        'name': 'Legendary'
    },
    'divine': {
        'border': BORDER_DIVINE,
        'color': '#D4AF37',
        'name': 'Divine'
    }
}

def get_item_ascii(item_name):
    """Get ASCII art for a specific item"""
    item_name = item_name.lower().replace(' ', '_')
    if item_name in ITEM_METADATA:
        return ITEM_METADATA[item_name]['ascii']
    return None

def get_item_metadata(item_name):
    """Get full metadata for a specific item"""
    item_name = item_name.lower().replace(' ', '_')
    return ITEM_METADATA.get(item_name)

def get_rarity_border(rarity):
    """Get the border frame for item rarity"""
    rarity = rarity.lower()
    if rarity in RARITY_BORDERS:
        return RARITY_BORDERS[rarity]['border']
    return None

def get_rarity_color(rarity):
    """Get the color for a rarity tier"""
    rarity = rarity.lower()
    if rarity in RARITY_BORDERS:
        return RARITY_BORDERS[rarity]['color']
    return '#FFFFFF'

def render_item_with_border(item_name, show_border=True):
    """Render an item with its rarity border"""
    metadata = get_item_metadata(item_name)
    if not metadata:
        return None

    ascii_art = metadata['ascii']

    if show_border and 'rarity' in metadata:
        border = get_rarity_border(metadata['rarity'])
        if border:
            # Combine item with border (simplified for now)
            return f"{border}\n{ascii_art}"

    return ascii_art

def get_items_by_type(item_type):
    """Get all items of a specific type (weapon, armor, consumable, etc.)"""
    return {
        name: data for name, data in ITEM_METADATA.items()
        if data['type'] == item_type
    }

def get_items_by_rarity(rarity):
    """Get all items of a specific rarity"""
    return {
        name: data for name, data in ITEM_METADATA.items()
        if data.get('rarity') == rarity
    }
