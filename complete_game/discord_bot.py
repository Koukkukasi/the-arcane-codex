"""
THE ARCANE CODEX - Discord Bot
Handles gameplay via Discord (whispers, decisions, Divine Council)
Character creation happens via web UI
"""

import discord
from discord.ext import commands
import asyncio
import json
from typing import Dict, Optional
from arcane_codex_server import ArcaneCodexGame, Character, NPCCompanion, GameState
from ai_gm import AutomatedGM

# ============================================================================
# DISCORD BOT CONFIGURATION
# ============================================================================

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Global game instance
game = ArcaneCodexGame()

# Player ID mapping (Discord User ID -> Player ID from web)
player_mapping: Dict[int, str] = {}

# Active games by channel
active_games: Dict[int, GameState] = {}

# ============================================================================
# GOD EMOJIS
# ============================================================================

GOD_EMOJIS = {
    "VALDRIS": "🌩️",
    "KAITHA": "🔥",
    "MORVANE": "💀",
    "SYLARA": "🌿",
    "KORVAN": "⚔️",
    "ATHENA": "📚",
    "MERCUS": "💰"
}

# ============================================================================
# BOT EVENTS
# ============================================================================

@bot.event
async def on_ready():
    print(f"""
===============================================================
|         THE ARCANE CODEX - DISCORD BOT                    |
===============================================================

Bot logged in as: {bot.user.name} (ID: {bot.user.id})

Ready for players!

PLAYER WORKFLOW (Everything in Discord!):
  1. !begin                - Start Divine Interrogation (DMs)
  2. Answer 10 questions   - Gods assign your class
  3. !start                - Begin adventure (2 players needed)
  4. Play!                 - AI GM sends whispers, votes happen

Player Commands:
  !begin                 - Begin Divine Interrogation (character creation)
  !start                 - Start game (requires 2 players with completed interrogation)
  !status                - Show party status
  !trust                 - Show trust level
  !npcs                  - Show NPC approval ratings
  !town                  - Return to Valdria (safe town)

AI GM Commands (Administrator Only):
  !whisper <@user> <message>              - Send private whisper to player
  !council <action>                       - Trigger Divine Council vote
  !npc_approval <npc_id> <change> <reason> - Update NPC approval

AUTOMATED AI GM (Administrator Only):
  !auto_scenario <name>                   - Run automated scenario (heist)
  !auto_council <action>                  - Automated Divine Council vote

Optional (for web UI users):
  !register <player_id>  - Link Discord account to web character

===============================================================
""")

# ============================================================================
# DIVINE INTERROGATION (In Discord - No Web UI Needed!)
# ============================================================================

# Track interrogation progress per user
interrogation_sessions = {}

def has_completed_interrogation(player_id: str) -> bool:
    """Check if player has completed all 10 Divine Interrogation questions"""
    if player_id not in game.divine_interrogation_progress:
        return False

    progress = game.divine_interrogation_progress[player_id]

    # Import here to avoid circular dependency
    from arcane_codex_server import DIVINE_INTERROGATION_QUESTIONS

    # Check if current_question index >= total questions (10)
    return progress["current_question"] >= len(DIVINE_INTERROGATION_QUESTIONS)

async def safe_send_dm(user: discord.User, content: str, channel_fallback: Optional[discord.TextChannel] = None) -> bool:
    """Safely send DM with error handling

    Args:
        user: Discord user to send DM to
        content: Message content
        channel_fallback: Optional channel to notify if DM fails

    Returns:
        True if DM sent successfully, False otherwise
    """
    try:
        dm_channel = await user.create_dm()
        await dm_channel.send(content)
        return True
    except discord.Forbidden:
        print(f"⚠️ Cannot send DM to {user.name} (DMs disabled)")
        if channel_fallback:
            try:
                await channel_fallback.send(f"⚠️ {user.mention} - I can't send you DMs! Please enable DMs from server members in your Discord privacy settings.")
            except:
                pass
        return False
    except discord.HTTPException as e:
        print(f"[ERROR] Failed to send DM to {user.name}: {e}")
        if channel_fallback:
            try:
                await channel_fallback.send(f"⚠️ {user.mention} - Failed to send you a DM. Please try again.")
            except:
                pass
        return False

@bot.command(name='begin')
async def begin_interrogation(ctx):
    """Begin Divine Interrogation (character creation) in DMs

    Usage: !begin

    The bot will DM you 10 questions from the 7 gods.
    Answer them to determine your character class organically.
    """
    discord_id = ctx.author.id

    # Generate unique player ID
    player_id = f"discord_{discord_id}"

    # Start interrogation in game engine
    result = game.start_divine_interrogation(player_id)

    # Store session
    interrogation_sessions[discord_id] = {
        "player_id": player_id,
        "channel_id": ctx.channel.id  # Remember where they started
    }

    # Register player automatically
    player_mapping[discord_id] = player_id

    # Send intro via DM using safe helper
    intro_sent = await safe_send_dm(ctx.author, result["message"], ctx.channel)

    if not intro_sent:
        # Cleanup if DM failed
        del interrogation_sessions[discord_id]
        del player_mapping[discord_id]
        return

    # Send first question
    question_sent = await send_interrogation_question(ctx.author, result["question"], ctx.channel)

    if question_sent:
        await ctx.send(f"✅ {ctx.author.mention} - Check your DMs! The gods are waiting...")

async def send_interrogation_question(user, question_data, channel_fallback: Optional[discord.TextChannel] = None) -> bool:
    """Send interrogation question to user via DM

    Args:
        user: Discord user to send question to
        question_data: Question data from game engine
        channel_fallback: Optional channel to notify if DM fails

    Returns:
        True if question sent successfully, False otherwise
    """
    # Build question in plain text format (Option B)
    god_emoji = GOD_EMOJIS[question_data['god']]
    question_text = f"""
{god_emoji} **{question_data['god']} speaks...**

{question_data['question_text']}

**YOUR CHOICES:**
"""

    # Add options
    for option in question_data['options']:
        question_text += f"{option['id']}. {option['text']}\n\n"

    question_text += f"───────────────────────────\nQuestion {question_data['question_number']} of {question_data['total_questions']}\n\n**Reply with the number (1-5) of your choice:**"

    return await safe_send_dm(user, question_text, channel_fallback)

@bot.event
async def on_message(message):
    """Handle Divine Interrogation answers via DM"""
    # Ignore bot messages
    if message.author.bot:
        return

    # Check if this is a DM
    if isinstance(message.channel, discord.DMChannel):
        discord_id = message.author.id

        # Check if user is in interrogation
        if discord_id in interrogation_sessions:
            # Try to parse answer
            try:
                answer_id = int(message.content.strip())

                if answer_id < 1 or answer_id > 5:
                    await message.channel.send("⚠️ Please answer with a number from 1 to 5.")
                    return

                # Submit answer
                player_id = interrogation_sessions[discord_id]["player_id"]
                result = game.answer_interrogation_question(player_id, answer_id)

                if result["status"] == "continue":
                    # Send next question
                    question_sent = await send_interrogation_question(message.author, result["next_question"])
                    if not question_sent:
                        await message.channel.send("⚠️ Failed to send next question. Please enable DMs and try `!begin` again.")
                        # Cleanup failed session
                        if discord_id in interrogation_sessions:
                            del interrogation_sessions[discord_id]

                elif result["status"] == "complete":
                    # Interrogation complete!
                    verdict_sent = await send_divine_verdict(message.author, result)
                    if not verdict_sent:
                        await message.channel.send("⚠️ Failed to send verdict. Please enable DMs and try `!begin` again.")
                        return

                    # Remove from active sessions
                    channel_id = interrogation_sessions[discord_id]["channel_id"]
                    del interrogation_sessions[discord_id]

                    # Announce in original channel
                    channel = bot.get_channel(channel_id)
                    if channel:
                        await channel.send(f"""
✨ **{message.author.mention} has been judged by the gods!**

Class: **{result['character_class']}**

Use `!start` when both players are ready to begin the adventure.
""")

            except ValueError:
                await message.channel.send("⚠️ Please answer with a number from 1 to 5.")
                return

    # Process commands
    await bot.process_commands(message)

async def send_divine_verdict(user, result) -> bool:
    """Send divine verdict after interrogation complete

    Returns:
        True if verdict sent successfully, False otherwise
    """
    # Plain text format (Option B)
    verdict_text = f"""
⚖️ **THE GODS HAVE JUDGED YOU** ⚖️

{result['verdict']}

**YOUR CLASS:** {result['character_class']}

**DIVINE FAVOR:**
"""

    # Show divine favor
    for god, favor in result['divine_favor'].items():
        emoji = GOD_EMOJIS[god]
        if favor != 0:  # Only show non-zero
            verdict_text += f"{emoji} {god}: {favor:+d}\n"

    verdict_text += """
───────────────────────────

Character creation complete! You're ready to adventure.
"""

    # Create character BEFORE sending verdict (prevent race condition)
    player_id = f"discord_{user.id}"
    try:
        character = game.create_character(player_id, user.display_name)

        # Send verdict after successful character creation using safe helper
        verdict_sent = await safe_send_dm(user, verdict_text)
        if not verdict_sent:
            return False

        confirmation_sent = await safe_send_dm(user, f"\n✅ Character **{character.name}** created successfully! ({character.character_class})")
        return confirmation_sent

    except Exception as e:
        # Handle character creation failure
        print(f"[ERROR] Character creation failed for {user.name} (ID: {user.id}): {e}")
        error_sent = await safe_send_dm(user, "⚠️ Error creating character. Please try `!begin` again or contact an administrator.")

        # Clean up progress to allow retry
        if player_id in game.divine_interrogation_progress:
            del game.divine_interrogation_progress[player_id]

        return False

@bot.command(name='register')
async def register_player(ctx, player_id: str):
    """Register Discord user with web character (OPTIONAL - use !begin instead)

    Usage: !register player_abc123

    Only needed if you completed Divine Interrogation on web UI.
    Normally, just use !begin to do everything in Discord!
    """
    discord_id = ctx.author.id
    player_mapping[discord_id] = player_id

    await ctx.send(f"""
✅ **Registration Successful!**

Discord User: {ctx.author.mention}
Player ID: `{player_id}`

You're now linked to your character. Use `!start` when both players are ready.
""")

# ============================================================================
# GAME MANAGEMENT
# ============================================================================

@bot.command(name='start')
async def start_game(ctx):
    """Start game in this channel

    Requires 2 registered players in the channel.
    Both must have completed Divine Interrogation on the web UI.
    """
    channel_id = ctx.channel.id

    # Check if game already active
    if channel_id in active_games:
        await ctx.send("⚠️ Game already active in this channel. Use `!restart` to start over.")
        return

    # Get registered players in this channel
    registered_in_channel = []
    async for member in ctx.guild.fetch_members(limit=None):
        if member.id in player_mapping and not member.bot:
            registered_in_channel.append(member)

    if len(registered_in_channel) < 2:
        await ctx.send(f"""
⚠️ **Need 2 registered players to start!**

Registered: {len(registered_in_channel)}/2

To register:
1. Complete Divine Interrogation at http://localhost:5000
2. Copy your player_id
3. Use `!register <player_id>`
""")
        return

    player1 = registered_in_channel[0]
    player2 = registered_in_channel[1]

    player1_id = player_mapping[player1.id]
    player2_id = player_mapping[player2.id]

    # Check if characters exist (Divine Interrogation completed - all 10 questions answered)
    if not has_completed_interrogation(player1_id):
        await ctx.send(f"⚠️ {player1.mention} hasn't completed Divine Interrogation! Use `!begin` to start.")
        return
    if not has_completed_interrogation(player2_id):
        await ctx.send(f"⚠️ {player2.mention} hasn't completed Divine Interrogation! Use `!begin` to start.")
        return

    # Create characters
    char1_name = player1.display_name
    char2_name = player2.display_name

    char1 = game.create_character(player1_id, char1_name)
    char2 = game.create_character(player2_id, char2_name)

    # Create NPCs
    npcs = game.create_default_npcs()

    # Initialize game state
    game_state = GameState(
        party_id=f"discord_{channel_id}",
        player_characters=[char1, char2],
        npc_companions=npcs,
        party_trust=50,
        party_leader=player1_id,
        current_location="valdria_town"
    )

    active_games[channel_id] = game_state
    game.game_state = game_state

    # Send welcome message
    await ctx.send(f"""
===============================================================
|              GAME START - THE ARCANE CODEX                |
===============================================================

**Party Formed:**
⚔️ {player1.mention} - {char1.character_class}
⚔️ {player2.mention} - {char2.character_class}

**NPC Companions:**
👤 **Grimsby** (Desperate Father) - Approval: 50/100
   Fatal Flaw: Desperate
   Hidden Agenda: Save daughter at any cost

👤 **Renna** (Vengeful Rogue) - Approval: 50/100
   Fatal Flaw: Impulsive
   Hidden Agenda: Kill brother (Thieves Guild leader)

**Party Trust:** 50/100 (Professional)
**Location:** Valdria - The Safe Haven

===============================================================
           🏰 VALDRIA - THE SAFE HAVEN 🏰
===============================================================

You stand in the bustling market square of Valdria, the last
civilized outpost before the Cursed Wastes.

Stone buildings rise around you, their windows glowing with
warm firelight. The smell of fresh bread mixes with the tang
of weapon oil.

**This is a SAFE ZONE** - no combat, no danger. A place to rest,
prepare, and plan your next move.

**Around the square you see:**
🛏️ **The Resting Dragon Inn** - Full rest, save game
🛒 **Market District** - Buy/sell items, upgrades
📋 **Adventurer's Guild** - Accept quests, turn in completed
🍺 **The Soggy Boot Tavern** - NPC interactions, rumors
⛪ **Temple of the Seven** - Check divine favor, pray
🚪 **Town Gates** - Depart for quests

**Available Commands:**
`!status` - Party status
`!trust` - Trust level
`!npcs` - NPC approval
`!town` - Town hub menu

**Your adventure begins... The AI GM will guide you from here.**
""")

@bot.command(name='status')
async def show_status(ctx):
    """Show current party status"""
    channel_id = ctx.channel.id
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel. Use `!start` to begin.")
        return

    game_state = active_games[channel_id]

    # Plain text format (Option B)
    status_text = """
⚔️ **PARTY STATUS**

**PLAYERS:**
"""

    # Players
    for pc in game_state.player_characters:
        status_text += f"• **{pc.name}** ({pc.character_class})\n"
        status_text += f"  HP: {pc.hp}/{pc.hp_max} | Mana: {pc.mana}/{pc.mana_max} | Level: {pc.level}\n\n"

    status_text += "**NPC COMPANIONS:**\n"

    # NPCs
    for npc in game_state.npc_companions:
        status_emoji = "✅" if npc.is_alive and not npc.has_left_party else "[ERROR]"
        status_text += f"{status_emoji} **{npc.name}** - Approval: {npc.approval}/100\n"

    # Party Info
    trust_tier = game.get_trust_tier()
    status_text += f"""
───────────────────────────
🤝 **Trust:** {game_state.party_trust}/100 ({trust_tier})
📍 **Location:** {game_state.current_location}
🎲 **Turn:** {game_state.turn_count}
"""

    await ctx.send(status_text)

@bot.command(name='trust')
async def show_trust(ctx):
    """Show trust level and effects"""
    channel_id = ctx.channel.id
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel.")
        return

    game_state = active_games[channel_id]
    trust = game_state.party_trust
    tier = game.get_trust_tier()

    # Determine trust effects
    if trust >= 80:
        effects = "✅ +10 to all group checks\n✅ NPCs share whispers freely\n✅ +5 Divine Council favor"
    elif trust >= 40:
        effects = "➖ Normal gameplay"
    elif trust >= 10:
        effects = "⚠️ -10 to all group checks\n⚠️ NPCs withhold information\n⚠️ -5 Divine Council favor"
    else:
        effects = "🚨 -20 to all group checks\n🚨 NPCs actively betray\n🚨 -10 Divine Council favor\n🚨 **BETRAYAL IMMINENT!**"

    trust_text = f"""
🤝 **PARTY TRUST**

**Trust:** {trust}/100
**Tier:** {tier}

**CURRENT EFFECTS:**
{effects}
"""

    await ctx.send(trust_text)

@bot.command(name='npcs')
async def show_npcs(ctx):
    """Show NPC approval ratings and status"""
    channel_id = ctx.channel.id
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel.")
        return

    game_state = active_games[channel_id]

    npc_text = "👥 **NPC COMPANIONS**\n\n"

    for npc in game_state.npc_companions:
        status = "✅ In Party" if npc.is_alive and not npc.has_left_party else "[ERROR] Gone"

        npc_text += f"**👤 {npc.name}** ({npc.title})\n"
        npc_text += f"**Approval:** {npc.approval}/100\n"
        npc_text += f"**Status:** {status}\n"
        npc_text += f"**Fatal Flaw:** {npc.fatal_flaw}\n"
        npc_text += f"**Hidden Agenda:** {npc.hidden_agenda if npc.approval >= 70 else '???'}\n\n"

        npc_text += "**Divine Favor:**\n"
        for god, favor in npc.divine_favor.items():
            if favor != 0:
                npc_text += f"{GOD_EMOJIS[god]} {god}: {favor:+d}\n"

        npc_text += "\n───────────────────────────\n\n"

    await ctx.send(npc_text)

@bot.command(name='town')
async def town_menu(ctx):
    """Show town hub menu"""
    channel_id = ctx.channel.id
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel.")
        return

    game_state = active_games[channel_id]
    game.game_state = game_state

    town_data = game.enter_town()

    await ctx.send(f"""
===============================================================
           🏰 VALDRIA - THE SAFE HAVEN 🏰
===============================================================

{town_data['description']}

**Available Locations:**
🛏️ **The Resting Dragon Inn** - Full rest, save game
🛒 **Market District** - Buy/sell items, upgrades
📋 **Adventurer's Guild** - Accept quests, turn in completed
🍺 **The Soggy Boot Tavern** - NPC interactions, rumors
⛪ **Temple of the Seven** - Check divine favor, pray
🚪 **Town Gates** - Depart for quests

**Party Trust:** {game_state.party_trust}/100
**Turn:** {game_state.turn_count}
""")

# ============================================================================
# AI GM COMMANDS (Manual Use by User)
# ============================================================================

@bot.command(name='whisper')
@commands.has_permissions(administrator=True)
async def send_whisper(ctx, member: discord.Member, *, message: str):
    """Send private whisper to a player (AI GM only)

    Usage: !whisper @Player1 You sense dark magic in the air...

    This sends a private DM to the player with their asymmetric whisper.
    The other player receives a different message.
    """
    # Input validation
    if not message or not message.strip():
        await ctx.send("⚠️ Whisper message cannot be empty!")
        return

    # Prevent @everyone/@here abuse
    if '@everyone' in message or '@here' in message:
        await ctx.send("⚠️ Cannot use @everyone or @here in whispers!")
        return

    # Check message length (Discord limit is 2000, leave room for formatting)
    if len(message) > 1800:
        await ctx.send("⚠️ Whisper message too long! (Max 1800 characters)")
        return

    # Build whisper text - plain text format (Option B)
    whisper_text = f"""
🔮 **[WHISPER - ONLY YOU SEE THIS]**

{message}

───────────────────────────

Share this... or don't.
"""

    # Send using safe helper
    sent = await safe_send_dm(member, whisper_text, ctx.channel)

    if sent:
        # Confirm in channel
        await ctx.send(f"✅ Whisper sent to {member.mention}")
    else:
        await ctx.send(f"⚠️ Failed to send whisper to {member.mention}")

@bot.command(name='council')
@commands.has_permissions(administrator=True)
async def trigger_council(ctx, *, action_description: str):
    """Trigger Divine Council vote (AI GM only)

    Usage: !council Players stole medicine from Duke's warehouse

    The gods will debate and vote on this action.
    """
    # Input validation
    if not action_description or not action_description.strip():
        await ctx.send("⚠️ Action description cannot be empty!")
        return

    # Prevent @everyone/@here abuse
    if '@everyone' in action_description or '@here' in action_description:
        await ctx.send("⚠️ Cannot use @everyone or @here in council actions!")
        return

    # Check length
    if len(action_description) > 500:
        await ctx.send("⚠️ Action description too long! (Max 500 characters)")
        return

    channel_id = ctx.channel.id
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel.")
        return

    game_state = active_games[channel_id]
    game.game_state = game_state

    result = game.convene_divine_council(action_description, {})

    # Plain text format (Option B - matches WhatsApp)
    council_text = f"""
⚖️ **THE GODS DEBATE YOUR FATE** ⚖️

**ACTION JUDGED:**
{action_description}

───────────────────────────

👥 **NPC TESTIMONIES:**

"""

    # NPC Testimonies
    for testimony in result['testimonies']:
        stance_emoji = "✅" if testimony['stance'] == "SUPPORT" else "[ERROR]"
        council_text += f"{stance_emoji} **{testimony['npc']}**: {testimony['text']}\n\n"

    council_text += "───────────────────────────\n\n⚖️ **THE GODS VOTE:**\n\n"

    # God Votes
    for god, vote_data in result['votes'].items():
        vote_emoji = "✅" if vote_data['vote'] == "SUPPORT" else "[ERROR]"
        council_text += f"{vote_emoji} {GOD_EMOJIS[god]} **{god}**: {vote_data['reasoning']}\n"

    # Outcome
    outcome = result['outcome']
    council_text += f"""
───────────────────────────

📜 **DIVINE JUDGMENT**

**Result:** {outcome['type']}
**Support:** {outcome['support']} | **Oppose:** {outcome['oppose']}

**CONSEQUENCES:**
"""

    # Consequences
    consequences = result['consequences']
    if consequences['blessings']:
        for blessing in consequences['blessings']:
            council_text += f"✨ {blessing}\n"
    if consequences['curses']:
        for curse in consequences['curses']:
            council_text += f"💀 {curse}\n"
    if consequences['trust_change']:
        council_text += f"🤝 Trust Change: {consequences['trust_change']:+d}\n"

    council_text += "\nThe gods have spoken. Continue your journey..."

    await ctx.send(council_text)

    # Apply trust change
    if consequences['trust_change']:
        game.update_trust(consequences['trust_change'], f"Divine Council: {outcome['type']}")

@bot.command(name='npc_approval')
@commands.has_permissions(administrator=True)
async def update_approval(ctx, npc_id: str, change: int, *, reason: str):
    """Update NPC approval (AI GM only)

    Usage: !npc_approval grimsby +10 Party saved his daughter
    Usage: !npc_approval renna -15 Party killed Thieves Guild member
    """
    channel_id = ctx.channel.id
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel.")
        return

    game_state = active_games[channel_id]
    game.game_state = game_state

    game.update_npc_approval(npc_id, change, reason)

    # Check for betrayal
    will_betray = game.check_npc_betrayal(npc_id)

    npc = next((n for n in game_state.npc_companions if n.npc_id == npc_id), None)

    if npc:
        betrayal_warning = ""
        if will_betray:
            betrayal_warning = "\n\n🚨 **WARNING: Betrayal imminent!**"

        await ctx.send(f"""
📊 **NPC Approval Updated**

**{npc.name}**
Approval: {npc.approval}/100 ({change:+d})
Reason: {reason}{betrayal_warning}
""")

# ============================================================================
# AUTOMATED AI GM COMMANDS (Fully Automated Scenarios)
# ============================================================================

@bot.command(name='auto_scenario')
@commands.has_permissions(administrator=True)
async def run_automated_scenario(ctx, scenario_name: str = "heist"):
    """Run automated AI GM scenario with asymmetric whispers

    Usage: !auto_scenario heist

    Available scenarios:
    - heist: Grimsby's Desperate Plea (medicine heist with moral dilemma)

    The AI GM will automatically:
    1. Send public scene description to channel
    2. Send different whispers to each player via DM
    3. Wait for player discussion and decisions
    4. Trigger Divine Council votes based on outcomes
    """
    channel_id = ctx.channel.id

    # Check if game is active
    if channel_id not in active_games:
        await ctx.send("⚠️ No active game in this channel. Use `!start` first.")
        return

    # Get the automated GM
    gm = AutomatedGM(bot, channel_id)

    await ctx.send(f"""
🎮 **AUTOMATED AI GM ACTIVATED**

Scenario: **{scenario_name}**

The AI GM will now run this scenario automatically.
Prepare for asymmetric whispers...
""")

    # Run the scenario
    await gm.start_scenario(scenario_name)

@bot.command(name='auto_council')
@commands.has_permissions(administrator=True)
async def run_automated_council(ctx, *, action: str):
    """Trigger automated Divine Council vote

    Usage: !auto_council Players refused to give medicine to Grimsby

    The AI GM will automatically run the Divine Council vote.
    """
    channel_id = ctx.channel.id

    if channel_id not in active_games:
        await ctx.send("[WARNING] No active game in this channel.")
        return

    gm = AutomatedGM(bot, channel_id)
    await gm.trigger_divine_council(action)

# ============================================================================
# RUN BOT
# ============================================================================

def run_bot(token: str):
    """Run the Discord bot

    Args:
        token: Discord bot token from https://discord.com/developers/applications
    """
    bot.run(token)


if __name__ == "__main__":
    print("""
===============================================================
         THE ARCANE CODEX - DISCORD BOT
===============================================================

To run this bot, you need a Discord Bot Token.

Get one at: https://discord.com/developers/applications

1. Create New Application
2. Go to "Bot" section
3. Click "Add Bot"
4. Copy the Token
5. Set environment variable:

   Windows (cmd):
     set DISCORD_BOT_TOKEN=your-token-here
     python discord_bot.py

   Windows (PowerShell):
     $env:DISCORD_BOT_TOKEN="your-token-here"
     python discord_bot.py

   Mac/Linux:
     export DISCORD_BOT_TOKEN=your-token-here
     python discord_bot.py
===============================================================
""")

    import sys
    import os

    token = os.getenv('DISCORD_BOT_TOKEN')

    if not token:
        print("[ERROR] ERROR: No Discord token provided!")
        print("\n[WARNING]  SECURITY: Never pass tokens via command line!")
        print("\nSet environment variable:")
        print("\n  Windows (cmd):")
        print("    set DISCORD_BOT_TOKEN=your-token-here")
        print("\n  Windows (PowerShell):")
        print("    $env:DISCORD_BOT_TOKEN=\"your-token-here\"")
        print("\n  Mac/Linux:")
        print("    export DISCORD_BOT_TOKEN=your-token-here")
        print("\nThen run: python discord_bot.py")
        sys.exit(1)

    run_bot(token)
