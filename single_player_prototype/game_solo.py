#!/usr/bin/env python3
"""
THE ARCANE CODEX - Single Player Prototype
No API key needed - you play by responding to prompts
Perfect for testing with your son!
"""

import json
import random
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'terminal_prototype'))

try:
    from colors import *
except ImportError:
    # Fallback if colors.py not found
    class Colors:
        RESET = ''
        RED = ''
        GREEN = ''
        YELLOW = ''
        BLUE = ''
        MAGENTA = ''
        CYAN = ''
        BRIGHT_YELLOW = ''
        BRIGHT_GREEN = ''
        BRIGHT_RED = ''
        BRIGHT_CYAN = ''
        BOLD = ''

    def colorize(text, color):
        return text

    def print_header(text):
        print("=" * 60)
        print(f"    {text}")
        print("=" * 60)

# Game state
player = {}
game_state = {
    'turn': 0,
    'location': 'The Soggy Boot Tavern',
    'npcs': {},
    'flags': {},
    'recent_events': []
}


def clear_screen():
    """Clear terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_slow(text, delay=0.03):
    """Print text with typewriter effect"""
    for char in text:
        print(char, end='', flush=True)
        import time
        time.sleep(delay)
    print()


def divine_interrogation():
    """10-question character creation"""
    clear_screen()
    print_header("THE DIVINE INTERROGATION")
    print()
    print_slow("You stand in darkness.")
    print_slow("Seven voices echo from nowhere and everywhere...")
    print()
    input("Press ENTER to begin...")

    divine_favor = {
        'valdris': 0,
        'kaitha': 0,
        'morvane': 0,
        'sylara': 0,
        'korvan': 0,
        'athena': 0,
        'mercus': 0
    }

    traits = {
        'lawful': 0,
        'chaotic': 0,
        'pragmatic': 0,
        'honorable': 0,
        'scholarly': 0
    }

    # Question 1
    clear_screen()
    print(colorize("═" * 60, Colors.BRIGHT_YELLOW))
    print(colorize("QUESTION 1/10", Colors.BRIGHT_YELLOW + Colors.BOLD))
    print(colorize("═" * 60, Colors.BRIGHT_YELLOW))
    print()
    print(colorize("⚖️  VALDRIS, Lord of Order, asks:", Colors.CYAN + Colors.BOLD))
    print()
    print('"A starving thief steals bread.')
    print('The law demands his hand be taken.')
    print('You are the judge. What do you do?"')
    print()
    print("1. Uphold the law. The hand is taken.")
    print("2. Pay for the bread yourself. Release him.")
    print("3. Burn the baker's shop. Hoarding food is the real crime.")
    print("4. Put both on trial. Investigate first.")
    print("5. Trial by combat. Let strength decide.")
    print()

    choice = input("Your choice (1-5): ").strip()

    if choice == '1':
        divine_favor['valdris'] += 20
        divine_favor['korvan'] += 10
        traits['lawful'] += 2
    elif choice == '2':
        divine_favor['valdris'] += 15
        divine_favor['mercus'] += 15
        traits['pragmatic'] += 1
    elif choice == '3':
        divine_favor['kaitha'] += 30
        divine_favor['valdris'] -= 25
        traits['chaotic'] += 2
    elif choice == '4':
        divine_favor['athena'] += 20
        divine_favor['valdris'] += 15
        traits['scholarly'] += 2
    elif choice == '5':
        divine_favor['korvan'] += 25
        divine_favor['valdris'] -= 15
        traits['honorable'] += 2

    # Question 2 (simplified for prototype)
    clear_screen()
    print(colorize("QUESTION 2/10", Colors.BRIGHT_YELLOW + Colors.BOLD))
    print()
    print(colorize("🔥 KAITHA, Goddess of Chaos, asks:", Colors.MAGENTA + Colors.BOLD))
    print()
    print('"Forbidden magic could save 100 lives.')
    print('But using it is punishable by death.')
    print('What do you do?"')
    print()
    print("1. Use it. Lives > laws.")
    print("2. Don't use it. Law exists for a reason.")
    print("3. Use it secretly, hide the evidence.")
    print("4. Research alternatives first.")
    print("5. Let them die. Not your problem.")
    print()

    choice = input("Your choice (1-5): ").strip()

    if choice == '1':
        divine_favor['kaitha'] += 25
        divine_favor['sylara'] += 15
        traits['chaotic'] += 2
    elif choice == '2':
        divine_favor['valdris'] += 20
        divine_favor['kaitha'] -= 20
        traits['lawful'] += 2
    elif choice == '3':
        divine_favor['morvane'] += 25
        traits['pragmatic'] += 2
    elif choice == '4':
        divine_favor['athena'] += 25
        traits['scholarly'] += 2
    elif choice == '5':
        divine_favor['morvane'] += 15
        divine_favor['korvan'] -= 20
        traits['pragmatic'] += 1

    # Skip to results (can add 8 more questions for full version)
    print()
    print(colorize("⏳ The gods deliberate...", Colors.BRIGHT_CYAN))
    import time
    time.sleep(2)

    # Determine class
    character_class = 'Fighter'
    archetype = 'The Wanderer'

    if divine_favor['kaitha'] > 40:
        character_class = 'Mage'
        archetype = 'The Chaotic Scholar'
    elif divine_favor['morvane'] > 30:
        character_class = 'Thief'
        archetype = 'The Pragmatist'
    elif divine_favor['korvan'] > 30:
        character_class = 'Fighter'
        archetype = 'The Warrior'
    elif divine_favor['athena'] > 30:
        character_class = 'Mage'
        archetype = 'The Scholar'

    # Results
    clear_screen()
    print(colorize("═" * 60, Colors.BRIGHT_YELLOW))
    print(colorize("⚡ THE GODS HAVE DECIDED ⚡", Colors.BRIGHT_YELLOW + Colors.BOLD))
    print(colorize("═" * 60, Colors.BRIGHT_YELLOW))
    print()
    print(f"Class: {colorize(character_class, Colors.BRIGHT_CYAN + Colors.BOLD)}")
    print(f"Archetype: {colorize(archetype, Colors.CYAN)}")
    print()
    print("Divine Favor:")
    for god, favor in divine_favor.items():
        if favor > 0:
            print(f"  ✨ {god.title()}: +{favor}")
        elif favor < 0:
            print(f"  💔 {god.title()}: {favor}")
    print()

    name = input("What is your character's name? ").strip()
    if not name:
        name = "Adventurer"

    return {
        'name': name,
        'class': character_class,
        'archetype': archetype,
        'hp': 60,
        'max_hp': 60,
        'divine_favor': divine_favor,
        'skills': get_starting_skills(character_class)
    }


def get_starting_skills(char_class):
    """Get starting skills based on class"""
    if char_class == 'Fighter':
        return {'combat': 75, 'intimidation': 65, 'perception': 60, 'athletics': 70}
    elif char_class == 'Mage':
        return {'arcana': 80, 'investigation': 70, 'persuasion': 55, 'perception': 50}
    elif char_class == 'Thief':
        return {'stealth': 85, 'lockpicking': 80, 'sleight_of_hand': 75, 'perception': 70}
    else:
        return {'combat': 50, 'perception': 50, 'persuasion': 50}


def skill_check(skill_name, difficulty):
    """Perform skill check with visual display"""
    player_skill = player['skills'].get(skill_name, 10)
    roll = random.randint(1, 100)
    threshold = 50 + ((player_skill - difficulty) / 2)

    success = roll <= threshold

    # Display
    print()
    print(colorize(f"🎲 {skill_name.upper()} CHECK", Colors.CYAN + Colors.BOLD))
    print(colorize("━" * 40, Colors.BRIGHT_BLACK))
    print(f"Your Skill:    {player_skill}")
    print(f"Difficulty:    {difficulty}")
    print(f"Threshold:     {int(threshold)}%")
    print(colorize("━" * 40, Colors.BRIGHT_BLACK))

    # Roll bar
    filled = int((roll / 100) * 10)
    empty = 10 - filled
    bar = "[" + "■" * filled + "□" * empty + "]"
    print(f"Roll: {bar} {roll}/100")
    print()

    if roll <= 5:
        print(colorize("✨ CRITICAL SUCCESS! ✨", Colors.BRIGHT_YELLOW + Colors.BOLD))
        return True, 'critical'
    elif success:
        print(colorize("✅ SUCCESS!", Colors.GREEN))
        return True, 'success'
    else:
        print(colorize("❌ FAILURE", Colors.RED))
        return False, 'failure'


def main_game():
    """Main game loop"""
    clear_screen()
    print_header("THE ARCANE CODEX")
    print()
    print(colorize(f"Welcome, {player['name']} the {player['class']}!", Colors.BRIGHT_CYAN))
    print(f"HP: {player['hp']}/{player['max_hp']}")
    print()
    input("Press ENTER to begin your adventure...")

    # Turn 1
    clear_screen()
    print(colorize("═" * 60, Colors.BRIGHT_YELLOW))
    print(colorize("TURN 1 - The Soggy Boot Tavern", Colors.BRIGHT_YELLOW + Colors.BOLD))
    print(colorize("═" * 60, Colors.BRIGHT_YELLOW))
    print()

    print(colorize("🌅 SCENE:", Colors.YELLOW))
    print()
    print("Rain hammers the crooked roof. You push open the warped door.")
    print()
    print("The tavern REEKS - wet dog, burnt porridge, broken dreams.")
    print()
    print("At the bar, a man with three missing fingers waves frantically.")
    print("Coins scatter. He doesn't pick them up.")
    print()

    print(colorize('🗣️  GRIMSBY: ', Colors.CYAN) + '"Thank the gods! Adventurers!"')
    print()
    print('"My daughter! The Thieves\' Guild took her three days ago!"')
    print('"They want 500 gold I don\'t have! Help me - I\'ll give you 80 gold!"')
    print()

    print(colorize("⚔️  Three Guild thugs stand up. Hands on weapons.", Colors.RED))
    print()
    print(colorize('🗣️  VETERAN: ', Colors.CYAN) + '"Grimsby. We TOLD you. No adventurers."')
    print()

    print(colorize("━" * 60, Colors.BRIGHT_BLACK))
    print()
    print("What do you do?")
    print()
    print("1. 💬 \"We're just passing through.\" [Persuasion: 25] 🟡 60%")
    print("2. ⚔️  Charge the veteran [Combat: 25] 🟢 75%")
    print("3. 🪑  Flip table for cover [Strength: 20] 🟢 78%")
    print("4. 👁️  Size up the situation [Perception: 20] 🟢 75%")
    print("5. ✍️  Something else (describe)")
    print()

    choice = input("Your choice (1-5): ").strip()

    if choice == '1':
        success, result = skill_check('persuasion', 25)
        if success:
            print()
            print(colorize("The veteran hesitates.", Colors.GREEN))
            print('"...Fine. But Grimsby, you handle this yourself."')
            print("The thugs leave. Grimsby looks relieved.")
        else:
            print()
            print(colorize("The veteran laughs.", Colors.RED))
            print('"Passing through? With weapons? Choose a side. NOW."')
            print("His hand moves to his knife...")

    elif choice == '2':
        success, result = skill_check('combat', 25)
        if success:
            print()
            print(colorize("⚔️  You CHARGE!", Colors.BRIGHT_RED))
            print("Your blade catches him off-guard. He staggers back!")
            print()
            print(colorize("💀 Veteran takes 18 damage!", Colors.RED))
            print('"You... you\'re GOOD," he gasps.')
            print("The other thugs hesitate...")
        else:
            print()
            print(colorize("💔 You charge but he's FASTER!", Colors.RED))
            print("His blade deflects yours. You stumble.")
            print()
            print(colorize("💔 You take 12 damage!", Colors.RED))
            player['hp'] -= 12
            print(f"HP: {player['hp']}/{player['max_hp']}")

    elif choice == '3':
        success, result = skill_check('strength', 20)
        if success:
            print()
            print(colorize("🪑 The table SLAMS onto its side!", Colors.GREEN))
            print("Mugs shatter. The thugs freeze.")
            print("You have COVER (+30% defense)")
            print('"Smart," the veteran mutters.')
        else:
            print()
            print(colorize("💔 The table is too heavy!", Colors.RED))
            print("You strain. It barely budges.")
            print("The thugs laugh. Grimsby looks horrified.")

    elif choice == '4':
        success, result = skill_check('perception', 20)
        if success:
            print()
            print(colorize("👁️  You notice details:", Colors.GREEN))
            print("• Young thug (left) is trembling - inexperienced")
            print("• Veteran has HORN on belt - reinforcements!")
            print("• Back door is slightly ajar - escape route")
            print()
            print("Tactical advantage gained!")
        else:
            print()
            print(colorize("You scan but see nothing special.", Colors.RED))

    else:
        print()
        print("(Custom actions would work with AI GM in full version)")

    print()
    print(colorize("═" * 60, Colors.BRIGHT_BLACK))
    print()
    print(colorize("📖 TO BE CONTINUED...", Colors.BRIGHT_CYAN + Colors.BOLD))
    print()
    print("This is a prototype demo showing:")
    print("✅ Divine Interrogation character creation")
    print("✅ Colored terminal output")
    print("✅ Skill checks with visual feedback")
    print("✅ Interactive storytelling")
    print()
    print("Full version includes:")
    print("• 10 full Divine Interrogation questions")
    print("• Complete AI GM responses (via Claude API)")
    print("• NPC memory & approval system")
    print("• Divine Council interventions")
    print("• Multiplayer via Discord/WhatsApp")
    print()
    print(colorize("Thanks for playing! 🎮", Colors.BRIGHT_GREEN + Colors.BOLD))
    print()


if __name__ == "__main__":
    try:
        print()
        player = divine_interrogation()
        main_game()
    except KeyboardInterrupt:
        print()
        print(colorize("\nGame interrupted. Thanks for playing!", Colors.BRIGHT_YELLOW))
    except Exception as e:
        print()
        print(colorize(f"\n❌ Error: {e}", Colors.RED))
        print("Make sure you're running Python 3.8+")
