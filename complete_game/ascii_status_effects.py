"""
The Arcane Codex - Status Effect ASCII Badges
Contains detailed ASCII badges for all 10 combat status effects
"""

# POISONED - Damage over time
# Color: Sickly green #4ADE80
POISONED = """
╔═══╗
║☠▓☠║
║▓☠▓║
╚═══╝
"""

# STUNNED - Skip turn
# Color: Electric yellow #FDE047
STUNNED = """
╔═══╗
║⚡⚡⚡║
║◉╳◉║
╚═══╝
"""

# BLESSED - Positive buff
# Color: Holy gold #D4AF37
BLESSED = """
╔═══╗
║✨◊✨║
║◊✨◊║
╚═══╝
"""

# CURSED - Negative debuff
# Color: Dark purple #6B21A8
CURSED = """
╔═══╗
║💀▓💀║
║▓💀▓║
╚═══╝
"""

# BURNING - Fire damage over time
# Color: Fire orange #F97316
BURNING = """
╔═══╗
║🔥🔥🔥║
║▓█▓║
╚═══╝
"""

# FROZEN - Chance to skip turn
# Color: Ice blue #38BDF8
FROZEN = """
╔═══╗
║❄❄❄║
║█░█║
╚═══╝
"""

# INVISIBLE - Evasion buff
# Color: Transparent #FFFFFF20
INVISIBLE = """
╔═══╗
║░░░║
║░◉░║
╚═══╝
"""

# ENRAGED - Attack up, defense down
# Color: Rage red #EF4444
ENRAGED = """
╔═══╗
║▓█▓║
║◉▼◉║
╚═══╝
"""

# SHIELDED - Damage absorption
# Color: Shield silver #C0C0C0
SHIELDED = """
╔═══╗
║◊█◊║
║█◊█║
╚═══╝
"""

# REGENERATING - Healing over time
# Color: Healing green #10B981
REGENERATING = """
╔═══╗
║+♥+║
║♥+♥║
╚═══╝
"""

# Status effect metadata matching battle_system.py effects
STATUS_EFFECT_METADATA = {
    'POISONED': {
        'name': 'Poisoned',
        'ascii': POISONED,
        'effect': '-2 HP per turn',
        'color': '#4ADE80',  # Sickly green
        'animation': 'Drip effect, pulse',
        'duration_based': True
    },
    'STUNNED': {
        'name': 'Stunned',
        'ascii': STUNNED,
        'effect': 'Skip turn',
        'color': '#FDE047',  # Electric yellow
        'animation': 'Star spin, dizzy swirl',
        'duration_based': True
    },
    'BLESSED': {
        'name': 'Blessed',
        'ascii': BLESSED,
        'effect': '+2 to all rolls',
        'color': '#D4AF37',  # Holy gold
        'animation': 'Sparkle float, glow pulse',
        'duration_based': True
    },
    'CURSED': {
        'name': 'Cursed',
        'ascii': CURSED,
        'effect': '-2 to all rolls',
        'color': '#6B21A8',  # Dark purple
        'animation': 'Shadow tendrils, corruption spread',
        'duration_based': True
    },
    'BURNING': {
        'name': 'Burning',
        'ascii': BURNING,
        'effect': '-3 HP per turn',
        'color': '#F97316',  # Fire orange
        'animation': 'Flame flicker, heat waves',
        'duration_based': True
    },
    'FROZEN': {
        'name': 'Frozen',
        'ascii': FROZEN,
        'effect': '50% chance skip turn',
        'color': '#38BDF8',  # Ice blue
        'animation': 'Ice crystals form, frost spread',
        'duration_based': True
    },
    'INVISIBLE': {
        'name': 'Invisible',
        'ascii': INVISIBLE,
        'effect': 'Harder to hit',
        'color': '#FFFFFF20',  # Transparent
        'animation': 'Fade in/out, shimmer',
        'duration_based': True
    },
    'ENRAGED': {
        'name': 'Enraged',
        'ascii': ENRAGED,
        'effect': '+4 damage, -2 defense',
        'color': '#EF4444',  # Rage red
        'animation': 'Steam puff, shake',
        'duration_based': True
    },
    'SHIELDED': {
        'name': 'Shielded',
        'ascii': SHIELDED,
        'effect': 'Absorb 10 damage',
        'color': '#C0C0C0',  # Shield silver
        'animation': 'Barrier shimmer, deflect spark',
        'duration_based': False  # Damage-based
    },
    'REGENERATING': {
        'name': 'Regenerating',
        'ascii': REGENERATING,
        'effect': '+2 HP per turn',
        'color': '#10B981',  # Healing green
        'animation': 'Health pulse, restoration glow',
        'duration_based': True
    }
}

def get_status_effect_ascii(effect_name):
    """Get ASCII badge for a specific status effect"""
    effect_name = effect_name.upper()
    if effect_name in STATUS_EFFECT_METADATA:
        return STATUS_EFFECT_METADATA[effect_name]['ascii']
    return None

def get_status_effect_color(effect_name):
    """Get color for a specific status effect"""
    effect_name = effect_name.upper()
    if effect_name in STATUS_EFFECT_METADATA:
        return STATUS_EFFECT_METADATA[effect_name]['color']
    return '#FFFFFF'

def get_all_active_effects_display(active_effects):
    """Generate a display string showing all active status effects"""
    if not active_effects:
        return ""

    display_lines = ["Active Effects:"]
    for effect in active_effects:
        effect_name = effect.upper()
        if effect_name in STATUS_EFFECT_METADATA:
            metadata = STATUS_EFFECT_METADATA[effect_name]
            display_lines.append(f"{metadata['ascii'].strip()} {metadata['name']}: {metadata['effect']}")

    return "\n".join(display_lines)
