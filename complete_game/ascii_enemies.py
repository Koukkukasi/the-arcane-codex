"""
The Arcane Codex - Enemy Type ASCII Art
Contains detailed ASCII symbols for all enemy types with threat levels
"""

# BASIC GUARD - Low Threat
# Colors: Iron gray #374151, leather brown #78350F
GUARD_BASIC = """
  ╭─╥─╮
  │▐█▌│
  ├─╫─┤
 ╱│ ║ │╲
│ └─║─┘ │
╰──╱╲──╯
   │ │
"""

# ELITE GUARD - Medium Threat
# Colors: Steel #6B7280, crimson #DC2626, gold accents #D4AF37
GUARD_ELITE = """
  ╔═╦═╗
  ║◆█◆║
  ╠═╬═╣
 ╱║▓║▓║╲
║ ╚═╬═╝ ║
╚══╱╲══╝
   ╨ ╨
"""

# ROGUE ENEMY - Medium Threat
# Colors: Shadow #1F2937, poison green #22C55E
ROGUE = """
   ◢◣
  ╱▓▓╲
 │ ◉◉ │
 │ ╲╱ │
 ├─><─┤
╱└─┬┬─┘╲
╲ ╱╱╲╲ ╱
 ╲╱  ╲╱
"""

# MAGE ENEMY - Medium-High Threat
# Colors: Dark purple #581C87, corrupt red #B91C1C
MAGE = """
    ☆
   ╱◊╲
  │███│
  │◐◑◐│
  ├───┤
 ╱ ███ ╲
│ ╱╱║╲╲ │
╰╱ ╱ ╲ ╲╯
  ╲▼▼▼╱
"""

# WEREWOLF - High Threat
# Colors: Beast brown #451A03, blood red #7F1D1D, yellow eyes #FDE047
WEREWOLF = """
   ╱◣◢╲
  ╱ ██ ╲
 │ ◉▼◉ │
 │ ╱▼▼╲ │
╱├─╱╲╱╲─┤╲
││ ╱╱╲╲ ││
╰╲╱╱  ╲╲╱╯
  ╱╱  ╲╲
"""

# DRAGON - Boss Threat (EXTREME)
# Colors: Scales #B91C1C, fire #F97316, gold hoard #F59E0B
DRAGON = """
    ╱◣▲◢╲
   ╱ ◢██◣ ╲
  │ ◉═══◉ │
 ╱├─▼▼▼▼▼─┤╲
╱ │ ╱███╲ │ ╲
│ ╰╱ ╱█╲ ╲╯ │
├─◢ ╱███╲ ◣─┤
│ ╲╱█████╲╱ │
╰─╱ ╲═══╱ ╲─╯
 ╱╱  ╲▼╱  ╲╲
"""

# ZOMBIE/UNDEAD - Low-Medium Threat
# Colors: Decay green #4D7C0F, bone white #E7E5E4, shadow #0C0A09
ZOMBIE = """
  ╭─┬─╮
  │░░░│
  │◕ ◕│
  │ ╱ │
 ╱├─┴─┤╲
│ │▒▒▒│ │
╰─┤░░░├─╯
  │╱ ╲│
"""

# ASSASSIN - High Threat
# Colors: Assassin black #030712, blood #7F1D1D, poison #10B981
ASSASSIN = """
   ▼▼▼
  │███│
  │ ▬ │
  │◢◣◢│
 ╱└┬┬┬┘╲
│ ╱│││╲ │
╰╱ ╱▼╲ ╲╯
  ╲───╱
"""

# CULTIST - Medium Threat
# Colors: Ritual purple #6B21A8, blood #991B1B, dark gold #854D0E
CULTIST = """
  ╱▲▲▲╲
 │ ███ │
 │ ◉◈◉ │
 ├─╱○╲─┤
╱│ ███ │╲
││ ╱█╲ ││
╰╲╱ ▼ ╲╱╯
  ╲═══╱
"""

# NEMESIS - Variable Threat (Adaptive Enemy)
# Colors: Changes based on player actions, crimson core #B91C1C
NEMESIS = """
  ╔═◆═╗
  ║▓█▓║
  ║◉▼◉║
  ╠═══╣
 ╱║███║╲
║ ╚═╬═╝ ║
╚══╱╲══╝
  ╱!!╲
"""

# Enemy metadata for game logic and rendering
ENEMY_METADATA = {
    'guard_basic': {
        'name': 'Guard',
        'ascii': GUARD_BASIC,
        'threat_level': 1,
        'colors': {
            'primary': '#374151',  # Iron gray
            'secondary': '#78350F'  # Leather brown
        },
        'behavior': 'Predictable patterns, basic attacks',
        'loot': 'Common gear, small gold'
    },
    'guard_elite': {
        'name': 'Elite Guard',
        'ascii': GUARD_ELITE,
        'threat_level': 2,
        'colors': {
            'primary': '#6B7280',  # Steel
            'secondary': '#DC2626',  # Crimson
            'accent': '#D4AF37'  # Gold
        },
        'behavior': 'Advanced tactics, coordinated attacks',
        'loot': 'Uncommon gear, moderate gold'
    },
    'rogue': {
        'name': 'Rogue',
        'ascii': ROGUE,
        'threat_level': 2,
        'colors': {
            'primary': '#1F2937',  # Shadow
            'secondary': '#22C55E'  # Poison green
        },
        'behavior': 'Sneak attacks, vanish ability',
        'loot': 'Poison daggers, lockpicks, stolen goods'
    },
    'mage': {
        'name': 'Mage',
        'ascii': MAGE,
        'threat_level': 3,
        'colors': {
            'primary': '#581C87',  # Dark purple
            'secondary': '#B91C1C'  # Corrupt red
        },
        'behavior': 'Ranged spells, elemental attacks',
        'loot': 'Spell scrolls, mana potions, arcane crystals'
    },
    'werewolf': {
        'name': 'Werewolf',
        'ascii': WEREWOLF,
        'threat_level': 3,
        'colors': {
            'primary': '#451A03',  # Beast brown
            'secondary': '#7F1D1D',  # Blood red
            'accent': '#FDE047'  # Yellow eyes
        },
        'animation': 'Transformation sequence, claw swipe, howl effect',
        'behavior': 'Berserk attacks, pack tactics, regeneration',
        'loot': 'Beast hide, claws, rare armor'
    },
    'dragon': {
        'name': 'Dragon',
        'ascii': DRAGON,
        'threat_level': 5,
        'colors': {
            'primary': '#B91C1C',  # Scales
            'secondary': '#F97316',  # Fire
            'accent': '#F59E0B'  # Gold hoard
        },
        'animation': 'Fire breath charge, wing flap, tail swipe',
        'behavior': 'Multi-phase fight, devastating attacks',
        'loot': 'Legendary gear, dragon scales, massive gold'
    },
    'zombie': {
        'name': 'Zombie',
        'ascii': ZOMBIE,
        'threat_level': 2,
        'colors': {
            'primary': '#4D7C0F',  # Decay green
            'secondary': '#E7E5E4',  # Bone white
            'accent': '#0C0A09'  # Shadow
        },
        'behavior': 'Slow but relentless, disease attacks',
        'loot': 'Bones, cursed items, plague samples'
    },
    'assassin': {
        'name': 'Assassin',
        'ascii': ASSASSIN,
        'threat_level': 4,
        'colors': {
            'primary': '#030712',  # Assassin black
            'secondary': '#7F1D1D',  # Blood
            'accent': '#10B981'  # Poison
        },
        'behavior': 'One-shot attempts, vanish, critical strikes',
        'loot': 'Rare daggers, poison vials, contracts'
    },
    'cultist': {
        'name': 'Cultist',
        'ascii': CULTIST,
        'threat_level': 2,
        'colors': {
            'primary': '#6B21A8',  # Ritual purple
            'secondary': '#991B1B',  # Blood
            'accent': '#854D0E'  # Dark gold
        },
        'behavior': 'Dark magic, summons, sacrificial attacks',
        'loot': 'Ritual components, dark tomes, cursed artifacts'
    },
    'nemesis': {
        'name': 'Nemesis',
        'ascii': NEMESIS,
        'threat_level': 0,  # Variable
        'colors': {
            'primary': '#B91C1C',  # Crimson core
            'secondary': None  # Changes dynamically
        },
        'animation': 'Power surge, adaptive stance, revenge aura',
        'behavior': 'Learns from defeats, returns stronger, remembers player',
        'loot': 'Unique gear, nemesis tokens, epic rewards'
    }
}

def get_enemy_ascii(enemy_type):
    """Get ASCII art for a specific enemy type"""
    enemy_type = enemy_type.lower()
    if enemy_type in ENEMY_METADATA:
        return ENEMY_METADATA[enemy_type]['ascii']
    return None

def get_enemy_threat_level(enemy_type):
    """Get threat level (1-5) for an enemy"""
    enemy_type = enemy_type.lower()
    if enemy_type in ENEMY_METADATA:
        return ENEMY_METADATA[enemy_type]['threat_level']
    return 1

def get_enemy_colors(enemy_type):
    """Get color scheme for a specific enemy"""
    enemy_type = enemy_type.lower()
    if enemy_type in ENEMY_METADATA:
        return ENEMY_METADATA[enemy_type]['colors']
    return None
