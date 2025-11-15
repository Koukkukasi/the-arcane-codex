"""
The Arcane Codex - Character Class ASCII Art
Contains detailed ASCII symbols for all 6 playable character classes
"""

# FIGHTER - The Steadfast Warrior
# Domain: Strength, Protection, Combat Mastery
# Colors: Steel gray #6B7280, blood red #DC2626, gold trim #D4AF37
FIGHTER = """
   ╔═══╗
  ╔╝▀█▀╚╗
 ╔╝  ║  ╚╗
║▐  ╬╬╬  ▌║
║│ ╔═╬═╗ │║
║│ ║▓▓▓║ │║
║│ ╚═╬═╝ │║
║▐  ╱║╲  ▌║
 ╚╗ ╱ ╲ ╔╝
  ╚═╧═╧═╝
"""

# MAGE - The Arcane Scholar
# Domain: Magic, Knowledge, Elemental Power
# Colors: Arcane purple #7C3AED, mystic blue #2563EB, energy white #F0F9FF
MAGE = """
     ✦
    ╱│╲
   ╱ ◊ ╲
  │ ╱│╲ │
  │╱ ◯ ╲│
  ◢◤▓▓▓◥◣
 ╱│ ███ │╲
│ └─┬─┬─┘ │
├───┴─┴───┤
╰─────────╯
"""

# THIEF - The Shadow Dancer
# Domain: Stealth, Cunning, Agility
# Colors: Shadow black #0F172A, poison green #22C55E, silver #C0C0C0
THIEF = """
    ◢◤
   ╱██╲
  ╱ ▼▼ ╲
 │ ◉  ◉ │
 │   ◊   │
 ├─╲▼▼╱─┤
╱│  ││  │╲
│└──┬┬──┘│
╰───╨╨───╯
   ╱  ╲
"""

# RANGER - The Wild Hunter
# Domain: Nature, Archery, Beast Mastery
# Colors: Forest green #059669, leather brown #92400E, sky blue #38BDF8
RANGER = """
    ╱╲
   ╱╱╲╲
  ╱│  │╲
 ╱ ┝━┥ ╲
║  │◈│  ║
║  └┬┘  ║
║ ╱╱║╲╲ ║
╚╱ ╱║╲ ╲╝
 ╲╱ ▼ ╲╱
  ╰─┴─╯
"""

# CLERIC - The Divine Healer
# Domain: Healing, Faith, Divine Magic
# Colors: Divine gold #D4AF37, holy white #FFFFFF, healing green #10B981
CLERIC = """
    ╋
   ╱║╲
  ╱ ║ ╲
 │ ┏╋┓ │
 │ ┃◯┃ │
 │ ┗╋┛ │
 ├──▼──┤
╱│ ╱║╲ │╲
│└─┴┴┴─┘│
╰───────╯
"""

# BARD - The Charismatic Performer
# Domain: Performance, Charm, Inspiration
# Colors: Royal purple #7C3AED, performance gold #F59E0B, charm pink #EC4899
BARD = """
   ♪♫♪
  ╭─◈─╮
 ╱ ╱┃╲ ╲
│ ╱ ┃ ╲ │
│║ ♬♬♬ ║│
│║ ┃┃┃ ║│
│╚═╤╤╤═╝│
╰─┬┴┴┴┬─╯
  └───┘
   ♪ ♪
"""

# Class metadata for rendering and game logic
CLASS_METADATA = {
    'fighter': {
        'name': 'Fighter',
        'ascii': FIGHTER,
        'colors': {
            'primary': '#6B7280',  # Steel gray
            'secondary': '#DC2626',  # Blood red
            'accent': '#D4AF37'  # Gold trim
        },
        'animation': 'Shield pulse on block, sword gleam on attack',
        'particles': 'Sparks on weapon clash, defensive aura shimmer'
    },
    'mage': {
        'name': 'Mage',
        'ascii': MAGE,
        'colors': {
            'primary': '#7C3AED',  # Arcane purple
            'secondary': '#2563EB',  # Mystic blue
            'accent': '#F0F9FF'  # Energy white
        },
        'animation': 'Crystal rotation, magical energy crackling, rune glow',
        'particles': 'Floating runes, magical sparkles, elemental wisps'
    },
    'thief': {
        'name': 'Thief',
        'ascii': THIEF,
        'colors': {
            'primary': '#0F172A',  # Shadow black
            'secondary': '#22C55E',  # Poison green
            'accent': '#C0C0C0'  # Silver
        },
        'animation': 'Fade in/out for stealth, dagger flip, hood shadow shift',
        'particles': 'Shadow wisps, smoke trails, glint of blade'
    },
    'ranger': {
        'name': 'Ranger',
        'ascii': RANGER,
        'colors': {
            'primary': '#059669',  # Forest green
            'secondary': '#92400E',  # Leather brown
            'accent': '#38BDF8'  # Sky blue
        },
        'animation': 'Bowstring draw, arrow nock, leaf rustle',
        'particles': 'Falling leaves, animal tracks appearing, wind currents'
    },
    'cleric': {
        'name': 'Cleric',
        'ascii': CLERIC,
        'colors': {
            'primary': '#D4AF37',  # Divine gold
            'secondary': '#FFFFFF',  # Holy white
            'accent': '#10B981'  # Healing green
        },
        'animation': 'Holy glow pulse, cross rotation, healing wave emanation',
        'particles': 'Golden motes, healing sparkles, divine light rays'
    },
    'bard': {
        'name': 'Bard',
        'ascii': BARD,
        'colors': {
            'primary': '#7C3AED',  # Royal purple
            'secondary': '#F59E0B',  # Performance gold
            'accent': '#EC4899'  # Charm pink
        },
        'animation': 'Music notes floating, strings vibrating, scroll unfurling',
        'particles': 'Musical notes, charm hearts, story bubbles'
    }
}

def get_class_ascii(class_name):
    """Get ASCII art for a specific class"""
    class_name = class_name.lower()
    if class_name in CLASS_METADATA:
        return CLASS_METADATA[class_name]['ascii']
    return None

def get_class_colors(class_name):
    """Get color scheme for a specific class"""
    class_name = class_name.lower()
    if class_name in CLASS_METADATA:
        return CLASS_METADATA[class_name]['colors']
    return None
