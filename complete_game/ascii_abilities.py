"""
The Arcane Codex - Class Abilities & Skills Icons
Contains detailed ASCII art for all class ability icons
"""

# ========== FIGHTER ABILITIES ==========

POWER_STRIKE = """
 ╱╲
╱▓▓╲
████
╲▓▓╱
 ╲╱
"""

DEFENSIVE_STANCE = """
╔═══╗
║▓█▓║
║███║
╚═══╝
"""

RALLYING_CRY = """
 ╱◊╲
│!!!│
╲▼▼▼╱
"""

BERSERKER_RAGE = """
▓█▓
◉▼◉
███
"""

# ========== MAGE ABILITIES ==========

FIREBALL = """
 ◢▓◣
▓███▓
 ◥▓◤
"""

ICE_SHARD = """
  ▲
 ╱█╲
█████
 ╲█╱
  ▼
"""

ARCANE_SHIELD = """
╱◊─◊╲
│◊◊◊│
╲◊─◊╱
"""

LIGHTNING_BOLT = """
╲ ╱
 ╳
╱ ╲
⚡⚡⚡
"""

TELEPORT = """
◊...◊
 ╱ ╲
 ╲ ╱
◊...◊
"""

ELEMENTAL_AFFINITY = """
🔥💧
⚡🍃
"""

# ========== THIEF ABILITIES ==========

SNEAK_ATTACK = """
 ◢◣
 ██
╱▼▼╲
"""

SMOKE_BOMB = """
░░░
▓█▓
░░░
"""

POISON_BLADE = """
 ╱◣
│☠│
 ╲◤
"""

LOCKPICK = """
╔╗
◊║
╚╝
"""

STEALTH_MASTERY = """
░░░
░◉░
░░░
"""

# ========== RANGER ABILITIES ==========

AIMED_SHOT = """
──◉→
  │
  ▼
"""

ANIMAL_COMPANION = """
╱ᵕ╲
████
╱╱╲╲
"""

HUNTERS_MARK = """
╔◉╗
║╳║
╚═╝
"""

TRACK = """
...
.◊.
...
"""

BEAST_TAMING = """
♥ᵕ♥
╲╱
"""

# ========== CLERIC ABILITIES ==========

HEAL = """
 ╋
╱♥╲
╲♥╱
 ╋
"""

DIVINE_STRIKE = """
╋▓╋
▓█▓
╋▓╋
"""

BLESSING = """
╱◊╲
◊✨◊
╲◊╱
"""

TURN_UNDEAD = """
╋╋╋
☠╳☠
╋╋╋
"""

RESURRECTION = """
 ☆
╱♥╲
████
╲▲╱
"""

# ========== BARD ABILITIES ==========

INSPIRE = """
♪♫♪
◊◊◊
♪♫♪
"""

VICIOUS_MOCKERY = """
╱!╲
◉╳◉
╲!╱
"""

SONG_OF_REST = """
♬♬♬
~~~
zzz
"""

CHARM = """
♥◊♥
◊♥◊
♥◊♥
"""

LEGENDARY_TALE = """
╔═══╗
║◊◊◊║
║███║
╚═══╝
"""

# ========== ABILITY METADATA ==========

ABILITY_METADATA = {
    # Fighter Abilities
    'power_strike': {
        'name': 'Power Strike',
        'ascii': POWER_STRIKE,
        'class': 'fighter',
        'cost': 5,
        'effect': '2x damage',
        'description': 'A devastating attack that deals double damage',
        'animation': 'Sword slam, impact burst',
        'color': '#DC2626'  # Blood red
    },
    'defensive_stance': {
        'name': 'Defensive Stance',
        'ascii': DEFENSIVE_STANCE,
        'class': 'fighter',
        'cost': 3,
        'effect': '+50% defense for 3 turns',
        'description': 'Take a defensive position to reduce incoming damage',
        'animation': 'Shield raise, defensive aura',
        'color': '#6B7280'  # Steel gray
    },
    'rallying_cry': {
        'name': 'Rallying Cry',
        'ascii': RALLYING_CRY,
        'class': 'fighter',
        'cost': 8,
        'effect': 'Party-wide attack boost',
        'description': 'Inspire your allies to fight harder',
        'animation': 'War horn, inspiration waves',
        'color': '#D4AF37'  # Gold
    },
    'berserker_rage': {
        'name': 'Berserker Rage',
        'ascii': BERSERKER_RAGE,
        'class': 'fighter',
        'cost': 10,
        'effect': 'Triple attack, no defense',
        'description': 'Enter a rage that massively boosts damage but removes defense',
        'animation': 'Red aura, rage particles',
        'color': '#EF4444'  # Rage red
    },

    # Mage Abilities
    'fireball': {
        'name': 'Fireball',
        'ascii': FIREBALL,
        'class': 'mage',
        'cost': 6,
        'effect': 'AOE fire damage',
        'description': 'Launch a ball of fire that explodes on impact',
        'animation': 'Fire charge, explosion',
        'color': '#F97316'  # Fire orange
    },
    'ice_shard': {
        'name': 'Ice Shard',
        'ascii': ICE_SHARD,
        'class': 'mage',
        'cost': 5,
        'effect': 'Single target freeze chance',
        'description': 'Shoot a shard of ice that may freeze the enemy',
        'animation': 'Ice form, shatter',
        'color': '#38BDF8'  # Ice blue
    },
    'arcane_shield': {
        'name': 'Arcane Shield',
        'ascii': ARCANE_SHIELD,
        'class': 'mage',
        'cost': 4,
        'effect': 'Magic barrier',
        'description': 'Create a magical shield to protect against damage',
        'animation': 'Rune circle, energy dome',
        'color': '#7C3AED'  # Arcane purple
    },
    'lightning_bolt': {
        'name': 'Lightning Bolt',
        'ascii': LIGHTNING_BOLT,
        'class': 'mage',
        'cost': 8,
        'effect': 'Chain damage',
        'description': 'Strike with lightning that can chain to multiple enemies',
        'animation': 'Lightning strike, chain jump',
        'color': '#FDE047'  # Electric yellow
    },
    'teleport': {
        'name': 'Teleport',
        'ascii': TELEPORT,
        'class': 'mage',
        'cost': 3,
        'effect': 'Reposition',
        'description': 'Instantly teleport to a new position',
        'animation': 'Vanish, reappear sparkle',
        'color': '#2563EB'  # Mystic blue
    },
    'elemental_affinity': {
        'name': 'Elemental Affinity',
        'ascii': ELEMENTAL_AFFINITY,
        'class': 'mage',
        'cost': 12,
        'effect': 'Master all elements',
        'description': 'Gain mastery over all elemental powers',
        'animation': 'Element rotation',
        'color': '#7C3AED'  # Arcane purple
    },

    # Thief Abilities
    'sneak_attack': {
        'name': 'Sneak Attack',
        'ascii': SNEAK_ATTACK,
        'class': 'thief',
        'cost': 4,
        'effect': 'Critical from stealth',
        'description': 'Strike from the shadows for massive damage',
        'animation': 'Shadow strike, backstab',
        'color': '#22C55E'  # Poison green
    },
    'smoke_bomb': {
        'name': 'Smoke Bomb',
        'ascii': SMOKE_BOMB,
        'class': 'thief',
        'cost': 3,
        'effect': 'Escape or blind enemies',
        'description': 'Throw a smoke bomb to escape or confuse enemies',
        'animation': 'Smoke cloud, vanish',
        'color': '#4B5563'  # Smoke gray
    },
    'poison_blade': {
        'name': 'Poison Blade',
        'ascii': POISON_BLADE,
        'class': 'thief',
        'cost': 5,
        'effect': 'Apply poison',
        'description': 'Coat your blade in poison for damage over time',
        'animation': 'Blade drip, toxic glow',
        'color': '#4ADE80'  # Poison green
    },
    'lockpick': {
        'name': 'Lockpick',
        'ascii': LOCKPICK,
        'class': 'thief',
        'cost': 2,
        'effect': 'Open locks',
        'description': 'Pick locks to access treasure and shortcuts',
        'animation': 'Pick turn, lock click',
        'color': '#C0C0C0'  # Silver
    },
    'stealth_mastery': {
        'name': 'Stealth Mastery',
        'ascii': STEALTH_MASTERY,
        'class': 'thief',
        'cost': 10,
        'effect': 'Extended invisibility',
        'description': 'Become invisible for an extended period',
        'animation': 'Fade sequence',
        'color': '#0F172A'  # Shadow black
    },

    # Ranger Abilities
    'aimed_shot': {
        'name': 'Aimed Shot',
        'ascii': AIMED_SHOT,
        'class': 'ranger',
        'cost': 4,
        'effect': 'Guaranteed hit, extra damage',
        'description': 'Take careful aim for a guaranteed critical hit',
        'animation': 'Aim focus, arrow trail',
        'color': '#059669'  # Forest green
    },
    'animal_companion': {
        'name': 'Animal Companion',
        'ascii': ANIMAL_COMPANION,
        'class': 'ranger',
        'cost': 8,
        'effect': 'Summon beast ally',
        'description': 'Call a wild beast to fight alongside you',
        'animation': 'Call whistle, beast appear',
        'color': '#92400E'  # Leather brown
    },
    'hunters_mark': {
        'name': "Hunter's Mark",
        'ascii': HUNTERS_MARK,
        'class': 'ranger',
        'cost': 3,
        'effect': 'Track and bonus damage',
        'description': 'Mark an enemy for tracking and extra damage',
        'animation': 'Mark glow, target lock',
        'color': '#38BDF8'  # Sky blue
    },
    'track': {
        'name': 'Track',
        'ascii': TRACK,
        'class': 'ranger',
        'cost': 2,
        'effect': 'Reveal enemy positions',
        'description': 'Use tracking skills to reveal hidden enemies',
        'animation': 'Footprint appear',
        'color': '#92400E'  # Leather brown
    },
    'beast_taming': {
        'name': 'Beast Taming',
        'ascii': BEAST_TAMING,
        'class': 'ranger',
        'cost': 12,
        'effect': 'Convert beast enemy',
        'description': 'Tame a beast enemy to fight for you',
        'animation': 'Charm hearts, tame glow',
        'color': '#EC4899'  # Charm pink
    },

    # Cleric Abilities
    'heal': {
        'name': 'Heal',
        'ascii': HEAL,
        'class': 'cleric',
        'cost': 5,
        'effect': 'Restore HP',
        'description': 'Call upon divine power to heal wounds',
        'animation': 'Holy light, health flow',
        'color': '#10B981'  # Healing green
    },
    'divine_strike': {
        'name': 'Divine Strike',
        'ascii': DIVINE_STRIKE,
        'class': 'cleric',
        'cost': 6,
        'effect': 'Holy damage',
        'description': 'Smite enemies with holy power',
        'animation': 'Divine hammer, light burst',
        'color': '#D4AF37'  # Divine gold
    },
    'blessing': {
        'name': 'Blessing',
        'ascii': BLESSING,
        'class': 'cleric',
        'cost': 4,
        'effect': 'Buff ally',
        'description': 'Bless an ally with divine power',
        'animation': 'Blessing rays, aura glow',
        'color': '#D4AF37'  # Divine gold
    },
    'turn_undead': {
        'name': 'Turn Undead',
        'ascii': TURN_UNDEAD,
        'class': 'cleric',
        'cost': 7,
        'effect': 'Repel or control undead',
        'description': 'Use holy power to repel or control undead creatures',
        'animation': 'Holy wave, undead flee',
        'color': '#FFFFFF'  # Holy white
    },
    'resurrection': {
        'name': 'Resurrection',
        'ascii': RESURRECTION,
        'class': 'cleric',
        'cost': 20,
        'effect': 'Revive fallen ally',
        'description': 'Bring a fallen ally back from death',
        'animation': 'Soul return, life restored',
        'color': '#D4AF37'  # Divine gold
    },

    # Bard Abilities
    'inspire': {
        'name': 'Inspire',
        'ascii': INSPIRE,
        'class': 'bard',
        'cost': 4,
        'effect': 'Party morale boost',
        'description': 'Inspire your allies with a rousing performance',
        'animation': 'Music notes, inspiration sparkle',
        'color': '#F59E0B'  # Performance gold
    },
    'vicious_mockery': {
        'name': 'Vicious Mockery',
        'ascii': VICIOUS_MOCKERY,
        'class': 'bard',
        'cost': 3,
        'effect': 'Damage and debuff',
        'description': 'Insult an enemy so viciously they take damage',
        'animation': 'Insult bubble, enemy rage',
        'color': '#EF4444'  # Rage red
    },
    'song_of_rest': {
        'name': 'Song of Rest',
        'ascii': SONG_OF_REST,
        'class': 'bard',
        'cost': 6,
        'effect': 'Party healing over time',
        'description': 'Play a soothing song that heals over time',
        'animation': 'Peaceful notes, rest aura',
        'color': '#10B981'  # Healing green
    },
    'charm': {
        'name': 'Charm',
        'ascii': CHARM,
        'class': 'bard',
        'cost': 8,
        'effect': 'Control enemy',
        'description': 'Charm an enemy to fight for you temporarily',
        'animation': 'Heart float, charm spiral',
        'color': '#EC4899'  # Charm pink
    },
    'legendary_tale': {
        'name': 'Legendary Tale',
        'ascii': LEGENDARY_TALE,
        'class': 'bard',
        'cost': 15,
        'effect': 'Massive party buff',
        'description': 'Tell an epic tale that greatly empowers your entire party',
        'animation': 'Epic scroll, story unfold',
        'color': '#7C3AED'  # Royal purple
    }
}

def get_ability_ascii(ability_name):
    """Get ASCII art for a specific ability"""
    ability_name = ability_name.lower().replace(' ', '_').replace("'", '')
    if ability_name in ABILITY_METADATA:
        return ABILITY_METADATA[ability_name]['ascii']
    return None

def get_ability_metadata(ability_name):
    """Get full metadata for a specific ability"""
    ability_name = ability_name.lower().replace(' ', '_').replace("'", '')
    return ABILITY_METADATA.get(ability_name)

def get_abilities_by_class(class_name):
    """Get all abilities for a specific class"""
    class_name = class_name.lower()
    return {
        name: data for name, data in ABILITY_METADATA.items()
        if data['class'] == class_name
    }

def get_ability_color(ability_name):
    """Get the color for a specific ability"""
    ability_name = ability_name.lower().replace(' ', '_').replace("'", '')
    if ability_name in ABILITY_METADATA:
        return ABILITY_METADATA[ability_name]['color']
    return '#FFFFFF'

def get_all_classes():
    """Get list of all classes that have abilities"""
    classes = set()
    for ability in ABILITY_METADATA.values():
        classes.add(ability['class'])
    return list(classes)
