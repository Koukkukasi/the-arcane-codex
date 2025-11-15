#!/usr/bin/env python3
"""
The Arcane Codex - WhatsApp Bot Prototype
Uses Twilio API for WhatsApp messaging
Demonstrates asymmetric whisper system via private messages
"""

from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import json
from datetime import datetime
import os

# Flask app for webhook
app = Flask(__name__)

# Twilio credentials (set these as environment variables)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'YOUR_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', 'YOUR_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Game state (in production, use Redis or database)
game_sessions = {}  # group_id: GameSession
player_registry = {}  # phone_number: {name, char_class, group_id}


class GameSession:
    """Represents an active game session in a WhatsApp group"""
    def __init__(self, group_id, party_leader_phone):
        self.group_id = group_id
        self.party_leader = party_leader_phone
        self.players = {}  # phone_number: PlayerCharacter
        self.turn_counter = 0
        self.pending_actions = {}  # phone_number: action
        self.world_state = {
            'location': 'The Soggy Boot Tavern',
            'time': 'Evening',
            'flags': {}
        }


class PlayerCharacter:
    """Player character"""
    def __init__(self, phone, name, char_class):
        self.phone = phone
        self.name = name
        self.char_class = char_class
        self.hp = 60
        self.max_hp = 60
        self.skills = self.get_starting_skills(char_class)
        self.secret_objective = None

    def get_starting_skills(self, char_class):
        if char_class.lower() == 'fighter':
            return {'combat': 75, 'intimidation': 65, 'perception': 60}
        elif char_class.lower() == 'mage':
            return {'arcana': 80, 'investigation': 70, 'persuasion': 55}
        elif char_class.lower() == 'thief':
            return {'stealth': 85, 'lockpicking': 80, 'perception': 70}
        else:
            return {'perception': 50, 'combat': 50}


def send_whatsapp_message(to_number, message):
    """Send a WhatsApp message via Twilio"""
    try:
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=message,
            to=f'whatsapp:{to_number}'
        )
        return message.sid
    except Exception as e:
        print(f"Error sending message: {e}")
        return None


def send_group_message(group_id, message):
    """Send message to WhatsApp group (or broadcast to all players)"""
    if group_id in game_sessions:
        session = game_sessions[group_id]
        for phone in session.players.keys():
            send_whatsapp_message(phone, f"[GROUP] {message}")


def send_asymmetric_whispers(session, scene_id):
    """
    THE REVOLUTIONARY FEATURE:
    Send different private information to each player based on class/skills
    """

    if scene_id == "tavern_start":
        for phone, character in session.players.items():

            # Base message
            whisper = f"""🔒 *PRIVATE INTEL* (Turn {session.turn_counter})
━━━━━━━━━━━━━━━━━━━━━━

"""

            # Class-specific information
            if character.char_class.lower() == 'fighter':
                whisper += """⚔️ *FIGHTER PERCEPTION:*

You size up the 3 thugs:
• Left: Nervous, shaking - WEAK
• Middle: Scarred, confident - VETERAN ⚠️
• Right: Young, eager - follower

*TACTICAL EDGE:*
Oak table can flip for cover (Str: 20)
Target veteran first - others will break

*OIL LAMP* nearby = fire weapon
"""

            elif character.char_class.lower() == 'mage':
                whisper += """🔮 *ARCANE PERCEPTION:*

You sense *magical tracking spell* on Grimsby!
Guild knows he's here. COMPROMISED.

*GRIMSBY'S COINS:* Marked with Guild runes
He's not innocent.

*SPELL OPTIONS:*
• Oil lamp + fire = explosion (Arcana: 15)
• Veteran has anti-magic charm (-10% vs him)

*HIDDEN SECRET:*
Chimney = escape route (Investigation: 25)
"""

            elif character.char_class.lower() == 'thief':
                whisper += """🗝️ *THIEF'S EYE:*

*GRIMSBY IS LYING* (touching ear = tell)

His "80 gold" = actually ~200g in pouch

*BACK DOOR:* Simple lock, 6 seconds

*GUILD THUG:* Middle one has 50g purse
(Sleight: 30 to steal during chaos)

*ESCAPE ROUTES:*
1. Back door (you can pick it)
2. Upstairs window
3. Chimney (tight)

⚠️ *SUSPICIOUS:* Veteran keeps glancing at Grimsby like he knows him. This might be a SETUP.
"""

            # Skill-based bonus
            if character.skills.get('perception', 0) >= 65:
                whisper += """

👁️ *HIGH PERCEPTION BONUS:*
Grimsby's clothes are clean, nails perfect.
NOT acting like desperate father searching 3 days.
"""

            whisper += """
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *THIS INFO IS YOURS ALONE*

Share strategically - or keep secrets!
Trust is gameplay.

Reply with your action when ready.
━━━━━━━━━━━━━━━━━━━━━━
"""

            # Send private message
            send_whatsapp_message(phone, whisper)


@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle incoming WhatsApp messages"""
    incoming_msg = request.values.get('Body', '').strip()
    sender = request.values.get('From', '').replace('whatsapp:', '')

    resp = MessagingResponse()
    msg = resp.message()

    # Parse command
    command = incoming_msg.lower().split()[0] if incoming_msg else ''

    # START GAME
    if command == '/start':
        group_id = f"group_{sender}"  # In production, use actual WhatsApp group ID

        if group_id in game_sessions:
            msg.body("❌ Game already running!")
            return str(resp)

        session = GameSession(group_id, sender)
        game_sessions[group_id] = session

        msg.body("""🎮 *THE ARCANE CODEX*
━━━━━━━━━━━━━━━━━━━━━━

*Party Leader:* You!

*TO JOIN:*
Send: `/join YourName ClassName`
Example: `/join Theron Fighter`

*Classes:*
Fighter, Mage, Thief

*When ready:* `/begin`
━━━━━━━━━━━━━━━━━━━━━━
""")

    # JOIN GAME
    elif command == '/join':
        parts = incoming_msg.split()
        if len(parts) != 3:
            msg.body("❌ Usage: /join YourName ClassName")
            return str(resp)

        name = parts[1]
        char_class = parts[2].capitalize()

        if char_class not in ['Fighter', 'Mage', 'Thief']:
            msg.body("❌ Invalid class! Choose: Fighter, Mage, Thief")
            return str(resp)

        # Find which group this player belongs to (simplified)
        group_id = f"group_{sender}"  # Would need proper group detection

        if group_id not in game_sessions:
            msg.body("❌ No game running! Leader must /start first.")
            return str(resp)

        session = game_sessions[group_id]

        if sender in session.players:
            msg.body(f"❌ You're already {session.players[sender].name}!")
            return str(resp)

        # Create character
        character = PlayerCharacter(sender, name, char_class)
        session.players[sender] = character
        player_registry[sender] = {'name': name, 'class': char_class, 'group': group_id}

        # Send to group
        send_group_message(group_id, f"✅ *{name}* the {char_class} joined!")

        # Send character sheet privately
        send_whatsapp_message(sender, f"""🎭 *YOUR CHARACTER*

*Name:* {name}
*Class:* {char_class}
*HP:* {character.hp}/{character.max_hp}

*Top Skills:*
{chr(10).join([f'• {s.title()}: {v}' for s, v in sorted(character.skills.items(), key=lambda x: x[1], reverse=True)])}

You'll receive *private whispers* based on your skills!
This info is YOURS ALONE.
""")

        msg.body(f"✅ Joined as *{name}* the {char_class}!")

    # BEGIN GAME
    elif command == '/begin':
        group_id = f"group_{sender}"

        if group_id not in game_sessions:
            msg.body("❌ No game found!")
            return str(resp)

        session = game_sessions[group_id]

        if sender != session.party_leader:
            msg.body("❌ Only party leader can start!")
            return str(resp)

        if len(session.players) == 0:
            msg.body("❌ Need at least 1 player!")
            return str(resp)

        session.turn_counter = 1

        # Send opening scene to group
        opening_scene = """🎬 *TURN 1 - The Soggy Boot*
━━━━━━━━━━━━━━━━━━━━━━

You push open the door of *"The Soggy Boot"* - a tavern that smells like wet dog and burnt porridge.

A nervous man waves frantically, knocking over his ale.

*GRIMSBY THE COIN-COUNTER* (missing two fingers):
_"Thank the gods! Adventurers! I need help!"_

He fidgets with coins obsessively.

_"My daughter... The Thieves' Guild took her. They want 500 gold I don't have!"_

He whispers: _"I know where she is. An old mill. Help me, I'll pay 80 gold. And... Guild secrets."_

*AROUND YOU:*
🪑 Oak tables
🍺 Full mugs
🚪 Back door
🔥 Fireplace + oil lamp
👥 *3 thugs in Guild colors - they HEARD Grimsby*

One stands, hand on knife...

━━━━━━━━━━━━━━━━━━━━━━
💬 *Reply with your action!*
━━━━━━━━━━━━━━━━━━━━━━
"""

        send_group_message(group_id, opening_scene)

        # Send asymmetric whispers
        send_asymmetric_whispers(session, "tavern_start")

        msg.body("🎬 Game started! Check your private messages for secret info!")

    # SUBMIT ACTION
    elif command == '/action' or (sender in player_registry and incoming_msg and not incoming_msg.startswith('/')):
        # Find player's group
        if sender not in player_registry:
            msg.body("❌ You're not in a game! Use /join first.")
            return str(resp)

        group_id = player_registry[sender]['group']

        if group_id not in game_sessions:
            msg.body("❌ Game session not found!")
            return str(resp)

        session = game_sessions[group_id]

        if sender not in session.players:
            msg.body("❌ You're not in this game!")
            return str(resp)

        # Extract action
        action = incoming_msg.replace('/action', '').strip() if incoming_msg.startswith('/action') else incoming_msg

        # Store action
        session.pending_actions[sender] = action
        character = session.players[sender]

        # Notify group
        send_group_message(group_id,
                          f"✅ *{character.name}* submitted action! ({len(session.pending_actions)}/{len(session.players)} ready)")

        msg.body(f"✅ Action submitted: _{action}_")

        # Check if all players ready
        if len(session.pending_actions) == len(session.players):
            resolve_turn(group_id, session)

    # PARTY STATUS
    elif command == '/party':
        if sender not in player_registry:
            msg.body("❌ You're not in a game!")
            return str(resp)

        group_id = player_registry[sender]['group']
        session = game_sessions.get(group_id)

        if not session:
            msg.body("❌ Game not found!")
            return str(resp)

        status = "👥 *PARTY STATUS*\n━━━━━━━━━━━━━━━━━━━━━━\n\n"
        for phone, char in session.players.items():
            status += f"*{char.name}* ({char.char_class})\n"
            status += f"HP: {char.hp}/{char.max_hp}\n"
            status += f"Top: {', '.join([f'{s.title()}: {v}' for s, v in sorted(char.skills.items(), key=lambda x: x[1], reverse=True)[:2]])}\n\n"

        status += f"━━━━━━━━━━━━━━━━━━━━━━\n"
        status += f"Turn: {session.turn_counter}\n"
        status += f"Location: {session.world_state['location']}\n"
        status += f"Actions: {len(session.pending_actions)}/{len(session.players)}"

        msg.body(status)

    # HELP
    elif command == '/help':
        msg.body("""🎮 *THE ARCANE CODEX*
━━━━━━━━━━━━━━━━━━━━━━

*COMMANDS:*
`/start` - Start game (leader)
`/join Name Class` - Join party
`/begin` - Begin adventure
`/party` - Party status
`/help` - This message

*GAMEPLAY:*
Just type your action (no / needed)
Or use: `/action what you do`

*REVOLUTIONARY:*
Each player gets *different private info* based on their class & skills!

Fighter sees combat tactics
Mage sees magic secrets
Thief sees hidden opportunities

*Trust is gameplay!*
━━━━━━━━━━━━━━━━━━━━━━
""")

    else:
        msg.body("❓ Unknown command. Send `/help` for info!")

    return str(resp)


def resolve_turn(group_id, session):
    """Resolve all player actions (would call Claude API in production)"""

    # Notify group
    send_group_message(group_id, "⏳ _The Chronicler weaves your fates..._")

    # Show what everyone did
    action_summary = "*PARTY ACTIONS:*\n━━━━━━━━━━━━━━━━━━━━━━\n\n"
    for phone, action in session.pending_actions.items():
        character = session.players[phone]
        action_summary += f"• *{character.name}:* {action}\n"

    send_group_message(group_id, action_summary)

    # In production, call Claude API here with all actions
    # For prototype, show example resolution

    narration = """📖 *THE CHRONICLER'S NARRATION*
━━━━━━━━━━━━━━━━━━━━━━

*[Fighter flips table]*
The oak table SLAMS onto its side. Mugs shatter. Ale pools. The thugs FREEZE.

*[Mage grabs oil lamp]*
Your fingers curl around the lamp. Grimsby's eyes widen in horror.

*[Thief picks lock]*
_Click._ Six seconds. The back door swings open. Escape secured.

The veteran thug draws his blade.

*VETERAN:* "You just made this complicated."

Grimsby scrambles behind your table, coins scattering.

*GRIMSBY:* "I didn't think you'd START A FIGHT!"

*VETERAN:* "Grimsby, you IDIOT. The boss said 'quiet conversation.'"

Other patrons flee. The bartender ducks.

━━━━━━━━━━━━━━━━━━━━━━
*NEW SITUATION:*
🪑 Table = COVER (+20% defense)
🔥 Mage holds oil weapon
🚪 Back door UNLOCKED
⚔️ Combat imminent (3 vs party)

💬 *What do you do next?*
━━━━━━━━━━━━━━━━━━━━━━
"""

    send_group_message(group_id, narration)

    # Send new asymmetric whispers
    session.turn_counter += 1
    send_combat_whispers(session)

    # Clear actions
    session.pending_actions = {}


def send_combat_whispers(session):
    """Send combat-specific asymmetric whispers"""
    for phone, character in session.players.items():

        whisper = f"🔒 *COMBAT INTEL* (Turn {session.turn_counter})\n━━━━━━━━━━━━━━━━━━━━━━\n\n"

        if character.char_class.lower() == 'fighter':
            whisper += """⚔️ *TACTICAL UPDATE:*

Veteran reaching for HORN on belt
= REINFORCEMENTS coming

*OPTIONS:*
• CHARGE before he blows it (Combat: 25, risky)
• Stay in cover, let Mage throw lamp (safer, but backup arrives)

*VETERAN STATS:*
Combat: 70 | HP: ~50
Weak: Old leg wound, favors right
"""

        elif character.char_class.lower() == 'mage':
            whisper += """🔮 *ARCANE ANALYSIS:*

Oil lamp + fire spell = EXPLOSIVE

*ARCANA: 20*
• Success: 3d6 fire to all 3, stunned
• Fail: Fire spreads to YOUR cover

*ALTERNATIVE:*
Counter Grimsby's tracking spell
(Arcana: 25) = find hideout WITHOUT him
"""

        elif character.char_class.lower() == 'thief':
            whisper += """🗝️ *THIEF'S ADVANTAGE:*

During chaos, you could:

1. Steal horn BEFORE he blows it
   (Sleight: 30 - HARD, game-changing)

2. Knife to his hand = disable horn
   (Combat: 25)

3. Grab Grimsby's 200g + flee
   (Stealth: 20 - selfish but rich)

⚠️ *GRIMSBY UPDATE:*
Reaching under table for something.
Weapon? Signal? He's NOT what he claims.
"""

        whisper += "\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ *YOUR INFO. YOUR CHOICE.*\n━━━━━━━━━━━━━━━━━━━━━━"

        send_whatsapp_message(phone, whisper)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'active_games': len(game_sessions)}


if __name__ == '__main__':
    print("""
═══════════════════════════════════════════
📱 THE ARCANE CODEX - WhatsApp Bot Prototype
═══════════════════════════════════════════

This demonstrates:
✅ Asymmetric whisper system via private messages
✅ Party mechanics in WhatsApp groups
✅ Turn-based gameplay
✅ Mobile-first RPG experience

SETUP:
1. Create Twilio account: https://www.twilio.com/
2. Get WhatsApp sandbox access
3. Set environment variables:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_WHATSAPP_NUMBER

4. Deploy webhook (use ngrok for testing):
   ngrok http 5000

5. Configure Twilio webhook URL:
   https://your-ngrok-url/webhook

WHATSAPP COMMANDS:
/start - Start game
/join Theron Fighter - Join as character
/begin - Begin adventure
Just type action (no / needed)
/party - Show party status
/help - Show commands

REVOLUTIONARY FEATURE:
Each player gets DIFFERENT whispers!
Fighter sees tactics
Mage sees magic secrets
Thief sees hidden opportunities

═══════════════════════════════════════════
""")

    # Run Flask server
    app.run(host='0.0.0.0', port=5000, debug=True)
