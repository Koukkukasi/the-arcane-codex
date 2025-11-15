#!/usr/bin/env python3
"""
The Arcane Codex - Discord Bot Prototype
Demonstrates asymmetric whisper system and party mechanics
"""

import discord
from discord.ext import commands
import json
import asyncio
from datetime import datetime

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Game state (in production, use database)
game_sessions = {}


class GameSession:
    """Represents an active game session"""
    def __init__(self, channel_id, party_leader):
        self.channel_id = channel_id
        self.party_leader = party_leader
        self.players = {}  # user_id: PlayerCharacter
        self.turn_counter = 0
        self.pending_actions = {}  # user_id: action
        self.current_scene = None
        self.npc_states = {}
        self.world_state = {
            'location': 'The Soggy Boot Tavern',
            'time': 'Evening',
            'flags': {}
        }


class PlayerCharacter:
    """Represents a player's character"""
    def __init__(self, user_id, name, char_class):
        self.user_id = user_id
        self.name = name
        self.char_class = char_class
        self.hp = 60
        self.max_hp = 60
        self.skills = self.get_starting_skills(char_class)
        self.inventory = []
        self.secret_objective = None
        self.divine_favor = {}

    def get_starting_skills(self, char_class):
        """Get starting skills based on class"""
        if char_class == 'Fighter':
            return {'combat': 75, 'intimidation': 65, 'perception': 60, 'athletics': 70}
        elif char_class == 'Mage':
            return {'arcana': 80, 'investigation': 70, 'persuasion': 55, 'perception': 50}
        elif char_class == 'Thief':
            return {'stealth': 85, 'lockpicking': 80, 'sleight_of_hand': 75, 'perception': 70}
        else:
            return {'perception': 50, 'persuasion': 50, 'combat': 50, 'investigation': 50}


@bot.event
async def on_ready():
    print(f'🤖 {bot.user} is online!')
    print('Ready to run The Arcane Codex!')


@bot.command(name='start')
async def start_game(ctx):
    """Start a new game session (party leader only)"""
    if ctx.channel.id in game_sessions:
        await ctx.send("❌ A game is already running in this channel!")
        return

    # Create new session
    session = GameSession(ctx.channel.id, ctx.author.id)
    game_sessions[ctx.channel.id] = session

    await ctx.send("""
═══════════════════════════════════════════
🎮 **THE ARCANE CODEX** - Session Starting!
═══════════════════════════════════════════

**Party Leader:** {leader}

**To Join:**
Use `!join <name> <class>`
Example: `!join Theron Fighter`

**Available Classes:**
• Fighter (Combat specialist)
• Mage (Arcana & magic)
• Thief (Stealth & skills)

**When ready, party leader uses:** `!begin`
═══════════════════════════════════════════
""".format(leader=ctx.author.mention))


@bot.command(name='join')
async def join_game(ctx, name: str, char_class: str):
    """Join the current game session"""
    if ctx.channel.id not in game_sessions:
        await ctx.send("❌ No game running! Party leader must use `!start` first.")
        return

    session = game_sessions[ctx.channel.id]

    # Check if already joined
    if ctx.author.id in session.players:
        await ctx.send(f"❌ You're already in the party as **{session.players[ctx.author.id].name}**!")
        return

    # Validate class
    valid_classes = ['Fighter', 'Mage', 'Thief']
    char_class = char_class.capitalize()
    if char_class not in valid_classes:
        await ctx.send(f"❌ Invalid class! Choose from: {', '.join(valid_classes)}")
        return

    # Create character
    character = PlayerCharacter(ctx.author.id, name, char_class)
    session.players[ctx.author.id] = character

    await ctx.send(f"✅ **{name}** the {char_class} has joined the party! (Played by {ctx.author.mention})")

    # Send private character sheet
    try:
        await ctx.author.send(f"""
🎭 **YOUR CHARACTER**

**Name:** {name}
**Class:** {char_class}
**HP:** {character.hp}/{character.max_hp}

**Top Skills:**
{chr(10).join([f'• {skill.title()}: {value}' for skill, value in sorted(character.skills.items(), key=lambda x: x[1], reverse=True)])}

**You will receive private whispers based on your skills and class!**
This information is YOURS ALONE. Share strategically!
""")
    except:
        await ctx.send("⚠️ I couldn't DM you. Please enable DMs from server members!")


@bot.command(name='begin')
async def begin_game(ctx):
    """Begin the adventure (party leader only)"""
    if ctx.channel.id not in game_sessions:
        await ctx.send("❌ No game session found!")
        return

    session = game_sessions[ctx.channel.id]

    # Check if party leader
    if ctx.author.id != session.party_leader:
        await ctx.send("❌ Only the party leader can start the game!")
        return

    # Check if we have players
    if len(session.players) == 0:
        await ctx.send("❌ Need at least 1 player to start!")
        return

    session.turn_counter = 1

    # Public scene description
    await ctx.send("""
═══════════════════════════════════════════
🎬 **TURN 1 - The Soggy Boot Tavern**
═══════════════════════════════════════════

You push open the warped door of **"The Soggy Boot"** - a tavern that smells like wet dog, burnt porridge, and broken dreams.

At the bar, a nervous man waves frantically - then immediately knocks over his ale.

**GRIMSBY THE COIN-COUNTER** (Missing two fingers, counts obsessively):
*"Thank the gods! Adventurers! I - I need help. Please. I can pay!"*

He fidgets with coins, stacking them compulsively. His hands shake.

*"It's my daughter. The Thieves' Guild took her. They say I owe them 500 gold for 'protection.' I don't HAVE 500 gold!"*

He leans closer: *"But I know where they're holding her. An old mill outside town. If you help me, I'll give you everything - 80 gold. And...information. Guild secrets."*

**Around the tavern:**
🪑 Heavy oak tables
🍺 Full mugs on the bar
🚪 Back door to kitchen
🔥 Fireplace crackling, oil lamp nearby
👥 **3 rough patrons wearing Thieves' Guild colors - they HEARD Grimsby**

One stands, hand moving to his belt knife...

═══════════════════════════════════════════
""")

    # Wait a moment for dramatic effect
    await asyncio.sleep(2)

    # Send ASYMMETRIC WHISPERS to each player
    await send_asymmetric_whispers(ctx, session, "tavern_scene_start")

    # Prompt for actions
    await ctx.send("""
💬 **WHAT DO YOU DO?**

Use `!action <your action>` to declare your character's action.

Example: `!action I flip the table for cover`
Example: `!action I try to talk down the thugs`

**Once all players have submitted actions, I'll resolve the turn!**
""")


async def send_asymmetric_whispers(ctx, session, scene_id):
    """
    Send different private information to each player based on their class/skills
    THIS IS THE REVOLUTIONARY FEATURE
    """

    if scene_id == "tavern_scene_start":
        for user_id, character in session.players.items():
            user = await bot.fetch_user(user_id)

            # Base whisper everyone gets
            base_whisper = f"""
🔒 **PRIVATE INFORMATION** (Turn {session.turn_counter})
═══════════════════════════════════════════
"""

            # CLASS-SPECIFIC WHISPERS
            class_whisper = ""

            if character.char_class == 'Fighter':
                class_whisper = """
⚔️ **FIGHTER PERCEPTION:**
You size up the three thugs:
• **Left thug:** Nervous, hand shaking - inexperienced
• **Middle thug:** Scarred face, confident stance - VETERAN (dangerous)
• **Right thug:** Young, eager - will follow leader's cue

**TACTICAL ASSESSMENT:**
The oak table near you could flip for cover (Strength: 20).
If fight starts, target the veteran first - others will break if he falls.

**ENVIRONMENTAL ADVANTAGE:**
You're closer to the fireplace. Oil lamp = improvised weapon (1d6 fire damage AOE).
"""

            elif character.char_class == 'Mage':
                class_whisper = """
🔮 **ARCANE PERCEPTION:**
You sense magical residue on Grimsby - someone cast a tracking spell on him recently.
The Thieves' Guild KNOWS he's here. This meeting is already compromised.

**GRIMSBY'S COINS:** You notice they're marked with tiny runes. Guild currency?
He's not as innocent as he claims.

**SPELL OPPORTUNITIES:**
• Oil lamp + fire spell = explosion (Arcana: 15 to control blast radius)
• Back door is locked with mundane lock (magic not needed)
• The veteran thug has a charm vs magic on his belt (your spells: -10% vs him)

**HIDDEN INFORMATION:**
The fireplace chimney is wide enough to escape through (Investigation: 25 to notice).
"""

            elif character.char_class == 'Thief':
                class_whisper = """
🗝️ **THIEF'S EYE:**
You automatically notice:
• **Grimsby is LYING.** His tells: touching his ear, eyes darting left.
• **His "80 gold" offer:** You spot a bulging coin pouch - more like 200 gold.
• **Back door:** Simple lock, you could pick it in 6 seconds (Lockpicking: 15)
• **Guild thugs:** Middle one has a purse worth ~50 gold (Sleight of Hand: 30 to steal during chaos)

**ESCAPE ROUTES IDENTIFIED:**
1. Back door to kitchen (locked, you can pick it)
2. Upstairs window (Perception: 20 to spot)
3. Chimney (tight squeeze, Dexterity: 25)

**SUSPICIOUS DETAIL:**
The "veteran" thug keeps glancing at Grimsby like he recognizes him.
This might be a SETUP. Grimsby might be working WITH the Guild.
"""

            # SKILL-BASED BONUS WHISPERS
            skill_whisper = ""

            if character.skills.get('perception', 0) >= 65:
                skill_whisper += "\n👁️ **HIGH PERCEPTION BONUS:**\n"
                skill_whisper += "You notice Grimsby's daughter's 'kidnapping' happened 3 days ago,\n"
                skill_whisper += "but Grimsby's clothes are freshly washed, nails clean. He's not acting like\n"
                skill_whisper += "a desperate father who's been searching for 3 days.\n"

            # Combine all whispers
            full_whisper = base_whisper + class_whisper + skill_whisper
            full_whisper += """
═══════════════════════════════════════════
⚠️ **THIS INFORMATION IS YOURS ALONE**

Share with your party strategically - or keep secrets!
Trust is a gameplay mechanic.

Use `!action <your action>` in the main channel when ready.
═══════════════════════════════════════════
"""

            try:
                await user.send(full_whisper)
            except:
                await ctx.send(f"⚠️ Couldn't send whisper to {user.mention} - please enable DMs!")


@bot.command(name='action')
async def submit_action(ctx, *, action: str):
    """Submit your character's action for this turn"""
    if ctx.channel.id not in game_sessions:
        await ctx.send("❌ No active game session!")
        return

    session = game_sessions[ctx.channel.id]

    # Check if player is in the game
    if ctx.author.id not in session.players:
        await ctx.send("❌ You're not in this game! Use `!join` first.")
        return

    # Store action
    session.pending_actions[ctx.author.id] = action
    character = session.players[ctx.author.id]

    await ctx.send(f"✅ **{character.name}** ({ctx.author.mention}) - Action submitted! ({len(session.pending_actions)}/{len(session.players)} ready)")

    # Check if all players submitted
    if len(session.pending_actions) == len(session.players):
        await resolve_turn(ctx, session)


async def resolve_turn(ctx, session):
    """Resolve all player actions (this would call Claude API in production)"""
    await ctx.send("⏳ **The Chronicler is weaving your fates together...**\n")

    await asyncio.sleep(2)

    # Display what each player did (publicly)
    action_summary = "**PARTY ACTIONS:**\n"
    for user_id, action in session.pending_actions.items():
        character = session.players[user_id]
        action_summary += f"• **{character.name}:** {action}\n"

    await ctx.send(action_summary)

    await asyncio.sleep(1)

    # In production, this would call Claude API with all actions
    # For prototype, show example resolution
    await ctx.send("""
═══════════════════════════════════════════
📖 **THE CHRONICLER'S NARRATION**
═══════════════════════════════════════════

**[Fighter flips table]**
The oak table SLAMS onto its side with a thunderous crash. Mugs shatter. Ale pools across the floor. The three thugs FREEZE.

**[Mage grabs oil lamp]**
Your fingers curl around the oil lamp. Grimsby's eyes widen in horror as he realizes what you're planning.

**[Thief picks back door lock]**
*Click.* Six seconds. Child's play. The back door swings open silently. Kitchen beyond. Escape secured.

The veteran thug draws his blade. "You just made this VERY complicated."

Grimsby scrambles behind your flipped table, coins scattering everywhere.

**GRIMSBY:** "I—I didn't think you'd start a FIGHT!"

**VETERAN THUG:** "Grimsby, you IDIOT. The boss said 'quiet conversation.' Now look what you've done."

The other patrons flee. The bartender ducks.

**This is going to get ugly.**

═══════════════════════════════════════════
**NEW SITUATION:**
🪑 Table provides COVER (+20% to ranged defense)
🔥 Mage holds oil lamp (can throw as weapon)
🚪 Back door UNLOCKED (escape route ready)
⚔️ Combat about to begin (3 thugs vs party)

💬 **NEXT ACTIONS?** Use `!action` again!
═══════════════════════════════════════════
""")

    # Send new asymmetric whispers for the updated situation
    session.turn_counter += 1
    await send_asymmetric_whispers_combat(ctx, session)

    # Clear pending actions for next turn
    session.pending_actions = {}


async def send_asymmetric_whispers_combat(ctx, session):
    """Send combat-specific whispers"""
    for user_id, character in session.players.items():
        user = await bot.fetch_user(user_id)

        whisper = f"""
🔒 **PRIVATE COMBAT INTEL** (Turn {session.turn_counter})
═══════════════════════════════════════════
"""

        if character.char_class == 'Fighter':
            whisper += """
⚔️ **TACTICAL UPDATE:**
• Veteran thug is reaching for a HORN on his belt - reinforcements?
• You could CHARGE him before he blows it (Combat: 25, risky but stops backup)
• OR stay behind cover and let Mage throw oil lamp (safer, but he calls backup)

**VETERAN STATS (Estimated):**
Combat: 70 | HP: ~50 | Armor: Medium
**Weak point:** Old leg wound, favors right side
"""

        elif character.char_class == 'Mage':
            whisper += """
🔮 **ARCANE ANALYSIS:**
Oil lamp throw + fire spell = EXPLOSIVE (Arcana: 20)
• SUCCESS: All 3 thugs take 3d6 fire damage, stunned 1 turn
• FAILURE: Lamp breaks, fire spreads to YOUR cover (bad)

**ALTERNATIVE:** Tracking spell on Grimsby can be REVERSED
Cast counter-spell (Arcana: 25) to track who cast it = find Guild hideout WITHOUT Grimsby
"""

        elif character.char_class == 'Thief':
            whisper += """
🗝️ **THIEF'S ADVANTAGE:**
During the chaos, you could:
1. Steal veteran's horn BEFORE he blows it (Sleight of Hand: 30 - HARD but game-changing)
2. Throw a knife at his hand (Combat: 25 - disable the horn)
3. Grab Grimsby's FULL coin pouch (200g) and flee through back door (Stealth: 20 - selfish but profitable)

**GRIMSBY UPDATE:** He's reaching for something under the table.
Could be weapon. Could be signal device. He's not what he seems.
"""

        whisper += """
═══════════════════════════════════════════
⚠️ **YOUR INFORMATION. YOUR CHOICE.**
═══════════════════════════════════════════
"""

        try:
            await user.send(whisper)
        except:
            pass


@bot.command(name='whisper')
async def private_whisper(ctx, target: discord.Member, *, message: str):
    """Send a private message to another party member (secret communication)"""
    if ctx.channel.id not in game_sessions:
        await ctx.send("❌ No active game!", delete_after=5)
        return

    session = game_sessions[ctx.channel.id]

    if ctx.author.id not in session.players or target.id not in session.players:
        await ctx.send("❌ Both players must be in the game!", delete_after=5)
        return

    # Delete the public command
    try:
        await ctx.message.delete()
    except:
        pass

    sender_char = session.players[ctx.author.id]

    # Send to target
    try:
        await target.send(f"""
💬 **SECRET MESSAGE FROM {sender_char.name.upper()}:**
"{message}"

(Reply with: `!whisper @{ctx.author.name} your message`)
""")
        await ctx.author.send(f"✅ Secret message sent to {target.display_name}!")
    except:
        await ctx.author.send("❌ Couldn't deliver whisper - they may have DMs disabled.")


@bot.command(name='party')
async def party_status(ctx):
    """Show current party composition"""
    if ctx.channel.id not in game_sessions:
        await ctx.send("❌ No active game!")
        return

    session = game_sessions[ctx.channel.id]

    status = """
═══════════════════════════════════════════
👥 **PARTY STATUS**
═══════════════════════════════════════════
"""

    for user_id, character in session.players.items():
        user = await bot.fetch_user(user_id)
        status += f"""
**{character.name}** the {character.char_class} (@{user.name})
HP: {character.hp}/{character.max_hp}
Top Skills: {', '.join([f"{s.title()}: {v}" for s, v in sorted(character.skills.items(), key=lambda x: x[1], reverse=True)[:3]])}
"""

    status += f"""
═══════════════════════════════════════════
**Turn:** {session.turn_counter}
**Location:** {session.world_state['location']}
**Actions Pending:** {len(session.pending_actions)}/{len(session.players)}
═══════════════════════════════════════════
"""

    await ctx.send(status)


@bot.command(name='end')
async def end_game(ctx):
    """End the current game session (party leader only)"""
    if ctx.channel.id not in game_sessions:
        await ctx.send("❌ No active game!")
        return

    session = game_sessions[ctx.channel.id]

    if ctx.author.id != session.party_leader:
        await ctx.send("❌ Only the party leader can end the game!")
        return

    del game_sessions[ctx.channel.id]
    await ctx.send("""
═══════════════════════════════════════════
🎬 **GAME SESSION ENDED**

Thank you for playing The Arcane Codex!

Your adventures have been recorded by The Chronicler.
May the gods watch over you.
═══════════════════════════════════════════
""")


@bot.command(name='help_game')
async def help_game(ctx):
    """Show available commands"""
    await ctx.send("""
═══════════════════════════════════════════
🎮 **THE ARCANE CODEX - Commands**
═══════════════════════════════════════════

**Starting a Game:**
`!start` - Start a new game (party leader)
`!join <name> <class>` - Join the party
`!begin` - Begin the adventure (party leader)

**During Game:**
`!action <what you do>` - Submit your action
`!whisper @player <message>` - Secret message to party member
`!party` - Show party status
`!end` - End the game (party leader)

**Classes:** Fighter, Mage, Thief

**How It Works:**
1. Party leader starts game with `!start`
2. Players join with `!join`
3. Party leader begins with `!begin`
4. Each turn, everyone gets **ASYMMETRIC WHISPERS** (private info based on class/skills)
5. Submit actions with `!action`
6. When all players submit, turn resolves!

**Revolutionary Feature:** Each player sees DIFFERENT information!
═══════════════════════════════════════════
""")


# Run the bot
if __name__ == "__main__":
    print("""
═══════════════════════════════════════════
🤖 THE ARCANE CODEX - Discord Bot Prototype
═══════════════════════════════════════════

This prototype demonstrates:
✅ Asymmetric whisper system (different info per player)
✅ Party leader mechanics
✅ Turn-based action submission
✅ Private communication between players
✅ Class-based skill checks

TO RUN:
1. Create Discord bot at https://discord.com/developers
2. Get bot token
3. Replace TOKEN below with your token
4. Invite bot to your server
5. Run: python discord_bot.py

COMMANDS:
!help_game - Show all commands
!start - Start a game
!join Theron Fighter - Join as a character
!begin - Start the adventure
!action <what you do> - Submit action

═══════════════════════════════════════════
""")

    # TODO: Replace with your Discord bot token
    TOKEN = "YOUR_DISCORD_BOT_TOKEN_HERE"

    if TOKEN == "YOUR_DISCORD_BOT_TOKEN_HERE":
        print("❌ ERROR: Please set your Discord bot token in discord_bot.py")
        print("   Get token from: https://discord.com/developers/applications")
    else:
        bot.run(TOKEN)
