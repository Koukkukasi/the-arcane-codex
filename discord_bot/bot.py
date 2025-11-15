#!/usr/bin/env python3
"""
The Arcane Codex - Discord Bot
Asymmetric Whisper System Prototype
"""

import discord
from discord import app_commands
from discord.ext import commands
import json
import asyncio
from typing import Dict, List, Optional
import anthropic
from datetime import datetime

# Load config
with open('config.json', 'r') as f:
    config = json.load(f)

# Initialize Discord bot
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Initialize Claude client
claude_client = anthropic.Anthropic(api_key=config['CLAUDE_API_KEY'])

# Game state storage (will be per-server/per-party in production)
game_sessions: Dict[int, dict] = {}  # server_id -> game_state


# ==========================================
# ASYMMETRIC WHISPER SYSTEM - THE CORE MAGIC
# ==========================================

WHISPER_TEMPLATES = {
    "mage": {
        "prompt": """You are providing ARCANE KNOWLEDGE to the Mage player.

Based on this scene: {scene}

What magical/arcane information would only a Mage detect? (enchantments, spell patterns, magical weaknesses, ritual knowledge, etc.)

Provide 2-3 sentences of specific, actionable arcane insight that OTHER CLASSES WON'T KNOW.
Make it feel special and valuable. No generic observations."""
    },

    "fighter": {
        "prompt": """You are providing TACTICAL COMBAT INSIGHT to the Fighter player.

Based on this scene: {scene}

What combat/tactical information would only a Fighter notice? (weak points, timing windows, terrain advantages, opponent patterns, escape routes, etc.)

Provide 2-3 sentences of specific, actionable tactical insight that OTHER CLASSES WON'T KNOW.
Make it feel special and valuable. No generic observations."""
    },

    "thief": {
        "prompt": """You are providing DECEPTION DETECTION to the Thief/Rogue player.

Based on this scene: {scene}

What lies, hidden motives, or environmental secrets would only a Thief spot? (body language tells, hidden objects, security weaknesses, who's lying, hidden exits, etc.)

Provide 2-3 sentences of specific, actionable insight that OTHER CLASSES WON'T KNOW.
Make it feel special and valuable. No generic observations."""
    },

    "ranger": {
        "prompt": """You are providing ENVIRONMENTAL AWARENESS to the Ranger player.

Based on this scene: {scene}

What environmental details would only a Ranger notice? (structural weaknesses, natural hazards, useful materials, animal behavior, weather patterns, tracking clues, etc.)

Provide 2-3 sentences of specific, actionable insight that OTHER CLASSES WON'T KNOW.
Make it feel special and valuable. No generic observations."""
    },

    "cleric": {
        "prompt": """You are providing DIVINE/SPIRITUAL INSIGHT to the Cleric player.

Based on this scene: {scene}

What divine, spiritual, or undead-related information would only a Cleric sense? (holy/unholy presence, trapped souls, curses, blessing opportunities, spiritual weaknesses, etc.)

Provide 2-3 sentences of specific, actionable insight that OTHER CLASSES WON'T KNOW.
Make it feel special and valuable. No generic observations."""
    },

    "bard": {
        "prompt": """You are providing SOCIAL/HISTORICAL KNOWLEDGE to the Bard player.

Based on this scene: {scene}

What social dynamics, historical context, or negotiation opportunities would only a Bard recognize? (cultural references, hidden meanings, persuasion angles, song/legend connections, etc.)

Provide 2-3 sentences of specific, actionable insight that OTHER CLASSES WON'T KNOW.
Make it feel special and valuable. No generic observations."""
    }
}


async def generate_whisper(player_class: str, scene_description: str) -> str:
    """
    Generate class-specific whisper using Claude API
    This is THE INNOVATION - each player gets unique information
    """
    template = WHISPER_TEMPLATES.get(player_class.lower())
    if not template:
        return f"⚠️ Unknown class: {player_class}"

    prompt = template["prompt"].format(scene=scene_description)

    try:
        response = claude_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        whisper_text = response.content[0].text
        return whisper_text.strip()

    except Exception as e:
        print(f"❌ Error generating whisper for {player_class}: {e}")
        return "⚠️ The spirits are silent..."


async def send_asymmetric_whispers(
    party: List[Dict],
    scene_description: str,
    story_channel: discord.TextChannel
) -> None:
    """
    THE CORE MAGIC: Send simultaneous DMs with different information to each player

    This is what makes The Arcane Codex unique - every player gets critical
    puzzle pieces, but NO ONE has the full picture. Forces collaboration.
    """
    print(f"\n🔮 Generating {len(party)} asymmetric whispers...")

    # Generate all whispers in parallel (fast!)
    whisper_tasks = [
        generate_whisper(player["class"], scene_description)
        for player in party
    ]
    whispers = await asyncio.gather(*whisper_tasks)

    # Send all DMs simultaneously
    dm_tasks = []
    for player, whisper_text in zip(party, whispers):
        user = player["user"]
        player_class = player["class"]

        embed = discord.Embed(
            title=f"🔮 {player_class.upper()} WHISPER",
            description=whisper_text,
            color=get_class_color(player_class),
            timestamp=datetime.utcnow()
        )
        embed.set_footer(text="💡 Share this in #planning to coordinate with your party!")

        dm_tasks.append(user.send(embed=embed))

    # Execute all DMs at once
    await asyncio.gather(*dm_tasks)

    # Notify in story channel
    await story_channel.send(
        "📨 **Private whispers sent!** Check your DMs for class-specific information. "
        "Head to <#planning> to share what you learned!"
    )

    print(f"✅ Sent {len(party)} whispers simultaneously")


def get_class_color(player_class: str) -> int:
    """Return Discord embed color for each class"""
    colors = {
        "mage": 0x9B59B6,      # Purple
        "fighter": 0xE74C3C,   # Red
        "thief": 0x34495E,     # Dark gray
        "ranger": 0x27AE60,    # Green
        "cleric": 0xF39C12,    # Gold
        "bard": 0x3498DB       # Blue
    }
    return colors.get(player_class.lower(), 0x95A5A6)  # Default gray


# ==========================================
# DISCORD BOT EVENTS
# ==========================================

@bot.event
async def on_ready():
    """Bot startup"""
    print(f'\n{"="*60}')
    print(f'🎮 THE ARCANE CODEX - Discord Bot Online')
    print(f'{"="*60}')
    print(f'Logged in as: {bot.user.name}')
    print(f'Bot ID: {bot.user.id}')
    print(f'Servers: {len(bot.guilds)}')
    print(f'{"="*60}\n')

    # Sync slash commands
    try:
        synced = await bot.tree.sync()
        print(f'✅ Synced {len(synced)} slash commands')
    except Exception as e:
        print(f'❌ Failed to sync commands: {e}')


@bot.event
async def on_guild_join(guild):
    """Auto-setup when bot joins a server"""
    print(f'📥 Joined new server: {guild.name} (ID: {guild.id})')


# ==========================================
# SLASH COMMANDS
# ==========================================

@bot.tree.command(name="setup", description="Set up The Arcane Codex channels")
@app_commands.describe(
    story_channel="Channel for main story narration",
    planning_channel="Private planning channel (bot won't read)"
)
async def setup_game(
    interaction: discord.Interaction,
    story_channel: discord.TextChannel,
    planning_channel: discord.TextChannel
):
    """Setup game channels"""
    server_id = interaction.guild_id

    game_sessions[server_id] = {
        "story_channel_id": story_channel.id,
        "planning_channel_id": planning_channel.id,
        "party": [],
        "turn_counter": 0,
        "world": {
            "location": "The Soggy Boot Tavern",
            "time": "Evening",
            "quest": "Not started",
            "quest_stage": 0
        }
    }

    embed = discord.Embed(
        title="⚔️ The Arcane Codex - Setup Complete!",
        description=f"📖 Story: {story_channel.mention}\n"
                    f"🗨️ Planning: {planning_channel.mention}\n\n"
                    f"**Next steps:**\n"
                    f"1. Use `/join <class>` to create your character\n"
                    f"2. Once everyone's ready, use `/start` to begin\n"
                    f"3. Use `/action <what you do>` to play!",
        color=0x2ECC71
    )

    await interaction.response.send_message(embed=embed)


@bot.tree.command(name="join", description="Create your character and join the party")
@app_commands.describe(
    character_class="Your character class",
    character_name="Your character's name"
)
@app_commands.choices(character_class=[
    app_commands.Choice(name="🔮 Mage", value="mage"),
    app_commands.Choice(name="⚔️ Fighter", value="fighter"),
    app_commands.Choice(name="🗡️ Thief", value="thief"),
    app_commands.Choice(name="🏹 Ranger", value="ranger"),
    app_commands.Choice(name="⚕️ Cleric", value="cleric"),
    app_commands.Choice(name="🎵 Bard", value="bard"),
])
async def join_game(
    interaction: discord.Interaction,
    character_class: str,
    character_name: str
):
    """Join the game with a character"""
    server_id = interaction.guild_id

    if server_id not in game_sessions:
        await interaction.response.send_message(
            "❌ Game not set up! An admin needs to run `/setup` first.",
            ephemeral=True
        )
        return

    session = game_sessions[server_id]

    # Check if user already joined
    if any(p["user"].id == interaction.user.id for p in session["party"]):
        await interaction.response.send_message(
            "❌ You've already joined this game!",
            ephemeral=True
        )
        return

    # Add player to party
    player = {
        "user": interaction.user,
        "name": character_name,
        "class": character_class,
        "hp": 60,
        "max_hp": 60,
        "skills": {"perception": 15, "arcana": 20} if character_class == "mage" else {"strength": 20, "perception": 10}
    }

    session["party"].append(player)

    embed = discord.Embed(
        title=f"✅ {character_name} the {character_class.title()} joins the party!",
        description=f"**Party size:** {len(session['party'])} adventurers\n\n"
                    f"You'll receive **private whispers** with class-specific information during the game. "
                    f"Share your insights in <#{session['planning_channel_id']}> to solve puzzles together!",
        color=get_class_color(character_class)
    )

    await interaction.response.send_message(embed=embed)


@bot.tree.command(name="test_whispers", description="[DEBUG] Test the asymmetric whisper system")
async def test_whispers(interaction: discord.Interaction):
    """
    DEBUG COMMAND: Test whisper system with the mill scene
    This demonstrates the core innovation!
    """
    server_id = interaction.guild_id

    if server_id not in game_sessions:
        await interaction.response.send_message(
            "❌ Game not set up! Run `/setup` first.",
            ephemeral=True
        )
        return

    session = game_sessions[server_id]

    if not session["party"]:
        await interaction.response.send_message(
            "❌ No players in party! Use `/join` first.",
            ephemeral=True
        )
        return

    # Defer response (this will take a few seconds)
    await interaction.response.defer()

    # Test scene from our prototype
    test_scene = """
    The abandoned mill by the docks. Marcus (the Guildmaster's nephew) is inside,
    chanting a ritual to open a cursed package. A Name-Eater entity has formed -
    seven feet tall, wrapped in smoke, amber eyes burning. It says: "Thief. Deceiver.
    Nephew. You opened the seal. Now pay the price: your NAME."

    A silence-sphere is expanding from the opened package. Captain Vex has his sword drawn.
    Marcus is crawling backward, sobbing. The mill's ceiling beams are corroding.
    """

    story_channel = bot.get_channel(session["story_channel_id"])

    # Post the shared narrative first
    embed = discord.Embed(
        title="🏚️ The Abandoned Mill",
        description=test_scene.strip(),
        color=0xE74C3C,
        timestamp=datetime.utcnow()
    )
    embed.set_footer(text="Turn 9 | Check your DMs for private information!")

    await story_channel.send(embed=embed)

    # Send asymmetric whispers!
    await send_asymmetric_whispers(
        party=session["party"],
        scene_description=test_scene,
        story_channel=story_channel
    )

    await interaction.followup.send(
        f"✅ **Whisper system test complete!**\n"
        f"Sent {len(session['party'])} different whispers based on class.\n"
        f"Check your DMs and compare what each person received!"
    )


@bot.tree.command(name="action", description="Describe what your character does")
@app_commands.describe(description="What do you do?")
async def player_action(interaction: discord.Interaction, description: str):
    """
    Main gameplay command - player describes action, AI responds with narration + whispers
    """
    server_id = interaction.guild_id

    if server_id not in game_sessions:
        await interaction.response.send_message(
            "❌ Game not set up!",
            ephemeral=True
        )
        return

    session = game_sessions[server_id]

    # Check if player is in party
    player = next((p for p in session["party"] if p["user"].id == interaction.user.id), None)
    if not player:
        await interaction.response.send_message(
            "❌ You haven't joined the game! Use `/join` first.",
            ephemeral=True
        )
        return

    # Defer response (AI call takes 2-5 seconds)
    await interaction.response.defer()

    session["turn_counter"] += 1

    # TODO: Call Claude AI GM for main narration (using prompts from terminal prototype)
    # For now, just acknowledge

    story_channel = bot.get_channel(session["story_channel_id"])

    await story_channel.send(
        f"**{player['name']} the {player['class'].title()}:** {description}\n"
        f"_(AI GM integration coming next!)_"
    )

    await interaction.followup.send(
        f"✅ Action recorded! Turn {session['turn_counter']}",
        ephemeral=True
    )


@bot.tree.command(name="party", description="View current party members")
async def show_party(interaction: discord.Interaction):
    """Show party composition"""
    server_id = interaction.guild_id

    if server_id not in game_sessions:
        await interaction.response.send_message(
            "❌ Game not set up!",
            ephemeral=True
        )
        return

    session = game_sessions[server_id]

    if not session["party"]:
        await interaction.response.send_message(
            "❌ No adventurers in the party yet! Use `/join` to create a character.",
            ephemeral=True
        )
        return

    party_list = "\n".join([
        f"**{p['name']}** the {p['class'].title()} ({p['user'].mention})"
        for p in session["party"]
    ])

    embed = discord.Embed(
        title="⚔️ Party Roster",
        description=party_list,
        color=0x3498DB
    )
    embed.set_footer(text=f"Turn {session['turn_counter']} | {session['world']['location']}")

    await interaction.response.send_message(embed=embed)


# ==========================================
# RUN BOT
# ==========================================

if __name__ == "__main__":
    print("🎮 Starting The Arcane Codex Discord Bot...")
    print("📋 Make sure you've set DISCORD_BOT_TOKEN in config.json")
    print("="*60)

    try:
        bot.run(config['DISCORD_BOT_TOKEN'])
    except KeyboardInterrupt:
        print("\n\n🛑 Bot stopped by user")
    except Exception as e:
        print(f"\n\n❌ Bot crashed: {e}")
