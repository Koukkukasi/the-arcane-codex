#!/usr/bin/env python3
"""
ANSI Color Codes for Terminal Output
Makes the game visually engaging with actual colors
"""

# ANSI Color Codes
class Colors:
    # Reset
    RESET = '\033[0m'

    # Text Colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'

    # Bright Text Colors
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'

    # Background Colors
    BG_BLACK = '\033[40m'
    BG_RED = '\033[41m'
    BG_GREEN = '\033[42m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'
    BG_WHITE = '\033[47m'

    # Text Styles
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'
    BLINK = '\033[5m'
    REVERSE = '\033[7m'
    HIDDEN = '\033[8m'


# Semantic Color Mapping
class GameColors:
    """Color scheme for different game elements"""

    # Narration Types
    SCENE = Colors.BRIGHT_YELLOW       # Scene setting
    DIALOGUE = Colors.BRIGHT_CYAN      # NPC speech
    ACTION = Colors.BRIGHT_RED         # Combat/action
    MAGIC = Colors.BRIGHT_MAGENTA      # Magic/supernatural
    DISCOVERY = Colors.BRIGHT_GREEN    # Finding items/secrets
    DANGER = Colors.RED                # Threats/death
    SUCCESS = Colors.GREEN             # Victories
    FAILURE = Colors.BRIGHT_BLACK      # Failures

    # UI Elements
    HEADER = Colors.BRIGHT_WHITE + Colors.BOLD
    DIVIDER = Colors.BRIGHT_BLACK
    PROMPT = Colors.BRIGHT_YELLOW + Colors.BOLD

    # Skill Checks
    SKILL_NAME = Colors.CYAN + Colors.BOLD
    ROLL_SUCCESS = Colors.GREEN
    ROLL_FAILURE = Colors.RED
    ROLL_CRITICAL = Colors.BRIGHT_YELLOW + Colors.BOLD

    # Status Indicators
    HIGH_CHANCE = Colors.GREEN         # 65%+
    MEDIUM_CHANCE = Colors.YELLOW      # 40-64%
    LOW_CHANCE = Colors.RED            # <40%

    # HP/Resource Bars
    HP_FULL = Colors.GREEN
    HP_MEDIUM = Colors.YELLOW
    HP_LOW = Colors.RED

    # Divine Council
    DIVINE = Colors.BRIGHT_MAGENTA + Colors.BOLD
    BLESSING = Colors.BRIGHT_CYAN
    CURSE = Colors.BRIGHT_RED


def colorize(text, color):
    """Wrap text in color codes"""
    return f"{color}{text}{Colors.RESET}"


def hp_bar(current, maximum, width=10):
    """Generate colored HP bar"""
    if current <= 0:
        return colorize("[" + "░" * width + "]", Colors.BRIGHT_BLACK) + f" {current}/{maximum}"

    percentage = current / maximum
    filled = int(percentage * width)
    empty = width - filled

    # Color based on percentage
    if percentage >= 0.7:
        color = GameColors.HP_FULL
    elif percentage >= 0.3:
        color = GameColors.HP_MEDIUM
    else:
        color = GameColors.HP_LOW

    bar = "[" + "█" * filled + "░" * empty + "]"
    return colorize(bar, color) + f" {current}/{maximum}"


def percentage_indicator(percentage):
    """Visual indicator for success chance"""
    if percentage >= 65:
        return colorize(f"🟢 {percentage}%", GameColors.HIGH_CHANCE)
    elif percentage >= 40:
        return colorize(f"🟡 {percentage}%", GameColors.MEDIUM_CHANCE)
    else:
        return colorize(f"🔴 {percentage}%", GameColors.LOW_CHANCE)


def skill_check_display(skill_name, player_skill, difficulty, roll, threshold, success):
    """Colored skill check output"""
    output = []

    # Header
    output.append(colorize(f"\n🎲 {skill_name.upper()} CHECK", GameColors.SKILL_NAME))
    output.append(colorize("━" * 40, GameColors.DIVIDER))

    # Stats
    output.append(f"Your Skill:    {player_skill}")
    output.append(f"Difficulty:    {difficulty}")
    output.append(f"Threshold:     {int(threshold)}%")
    output.append(colorize("━" * 40, GameColors.DIVIDER))

    # Roll visualization
    filled = int((roll / 100) * 10)
    empty = 10 - filled
    bar = "[" + "■" * filled + "□" * empty + "]"
    output.append(f"Roll: {bar} {roll}/100")
    output.append("")

    # Result
    if roll <= 5:
        output.append(colorize("✨ CRITICAL SUCCESS! ✨", GameColors.ROLL_CRITICAL))
    elif success:
        output.append(colorize("✅ SUCCESS!", GameColors.ROLL_SUCCESS))
    else:
        output.append(colorize("❌ FAILURE", GameColors.ROLL_FAILURE))

    output.append(colorize("━" * 40, GameColors.DIVIDER))

    return "\n".join(output)


def print_scene(text):
    """Print scene description in yellow"""
    print(colorize(f"🌅 {text}", GameColors.SCENE))


def print_dialogue(speaker, text):
    """Print NPC dialogue in cyan"""
    print(colorize(f"🗣️ {speaker}: ", GameColors.DIALOGUE) + f'"{text}"')


def print_action(text):
    """Print action text in red"""
    print(colorize(f"⚔️ {text}", GameColors.ACTION))


def print_magic(text):
    """Print magic text in magenta"""
    print(colorize(f"🔮 {text}", GameColors.MAGIC))


def print_discovery(text):
    """Print discovery text in green"""
    print(colorize(f"💎 {text}", GameColors.DISCOVERY))


def print_header(text):
    """Print major section header"""
    print(colorize("═" * 60, GameColors.HEADER))
    print(colorize(f"    {text}", GameColors.HEADER))
    print(colorize("═" * 60, GameColors.HEADER))


def print_divider():
    """Print simple divider"""
    print(colorize("━" * 60, GameColors.DIVIDER))


def momentum_display(current, maximum=5):
    """Display momentum with stars"""
    filled = "★" * current
    empty = "☆" * (maximum - current)
    return colorize(f"[{filled}{empty}] {current}/{maximum}", Colors.BRIGHT_YELLOW)


def divine_council_header():
    """Epic divine council header"""
    lines = [
        "═" * 60,
        "⚡ THE DIVINE COUNCIL CONVENES ⚡",
        "═" * 60
    ]
    return "\n".join([colorize(line, GameColors.DIVINE) for line in lines])


# Test function
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("TESTING COLOR SYSTEM")
    print("=" * 60 + "\n")

    print_header("THE ARCANE CODEX")
    print()

    print_scene("You push open the warped door. The tavern reeks of desperation.")
    print()

    print_dialogue("GRIMSBY", "Please! They took my daughter!")
    print()

    print_action("The veteran draws his blade. Steel glints in firelight.")
    print()

    print_magic("Purple energy crackles around your fingers.")
    print()

    print_discovery("You notice Guild markings on his coins!")
    print()

    print_divider()
    print("\nHP Examples:")
    print("Full:   " + hp_bar(80, 80))
    print("Medium: " + hp_bar(50, 80))
    print("Low:    " + hp_bar(15, 80))
    print("Dead:   " + hp_bar(0, 80))
    print()

    print_divider()
    print("\nSuccess Chances:")
    print("High:   " + percentage_indicator(75))
    print("Medium: " + percentage_indicator(55))
    print("Low:    " + percentage_indicator(25))
    print()

    print_divider()
    print("\nMomentum: " + momentum_display(3, 5))
    print()

    print_divider()
    print(skill_check_display("perception", 65, 25, 42, 70, True))
    print()

    print(divine_council_header())
