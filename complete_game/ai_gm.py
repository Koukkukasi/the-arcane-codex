"""
Automated AI GM for The Arcane Codex
Uses Claude AI to generate scenarios and manage the game
"""

import discord
from discord.ext import commands
import asyncio
import os
from typing import List, Dict

# Import the game engine
from arcane_codex_server import ArcaneCodexGame, DIVINE_INTERROGATION_QUESTIONS

class AutomatedGM:
    """Automated AI Game Master"""

    def __init__(self, bot: commands.Bot, channel_id: int):
        self.bot = bot
        self.channel_id = channel_id
        self.game = ArcaneCodexGame()
        self.current_scenario = None
        self.turn_count = 0

    async def start_scenario(self, scenario_name: str):
        """Start a new scenario with asymmetric whispers"""

        channel = self.bot.get_channel(self.channel_id)
        if not channel:
            print("Channel not found!")
            return

        # Get all members in the channel
        guild = channel.guild
        members = [m for m in guild.members if not m.bot]

        if len(members) < 2:
            await channel.send("Need at least 2 players!")
            return

        player1 = members[0]
        player2 = members[1]

        # Scenario 1: The Heist
        if scenario_name == "heist":
            # Public scene (everyone sees)
            public_scene = """
===============================================================
                    THE ARCANE CODEX - Turn 1
===============================================================

SCENARIO: Grimsby's Desperate Plea

You arrive at the Duke's warehouse at midnight. Fog is thick.

GRIMSBY (nervous): "The medicine for my daughter is inside!
We need to move FAST. Guards change shifts in 10 minutes."

OBSERVATIONS:
• Two guards at front door (distracted, talking)
• Side door slightly ajar
• Grimsby is sweating, checking his watch constantly

-----------------------------------------------------------
Trust: 50/100 | NPCs: Grimsby (50), Renna (50)

What do you do?
"""

            await channel.send(public_scene)

            # Asymmetric whispers (different info to each player)
            whisper1 = """
[WHISPER - ONLY YOU SEE THIS]

Your military training reveals critical details:

COMBAT ANALYSIS:
• These guards are NOT distracted - they're PROFESSIONALS
• Their "casual" stance is actually combat-ready position
• This feels like a TRAP
• Side door = likely ambush point

Share this... or don't.
"""

            whisper2 = """
[WHISPER - ONLY YOU SEE THIS]

Your arcane senses detect something WRONG:

MAGICAL ANALYSIS:
• Medicine crates inside = DARK MAGIC aura
• The medicine is CURSED
• If used, 200+ people will die within a week
• The curse is expertly hidden - Grimsby can't detect it
• He genuinely believes the medicine is safe

Share this... or don't.
"""

            # Send whispers via DM
            try:
                dm1 = await player1.create_dm()
                await dm1.send(f"🔮 {whisper1}")
                print(f"✅ Whisper sent to {player1.name}")
            except Exception as e:
                print(f"❌ Failed to send whisper to {player1.name}: {e}")

            try:
                dm2 = await player2.create_dm()
                await dm2.send(f"🔮 {whisper2}")
                print(f"✅ Whisper sent to {player2.name}")
            except Exception as e:
                print(f"❌ Failed to send whisper to {player2.name}: {e}")

            await channel.send("\n✅ **Asymmetric whispers sent!** Check your DMs.")
            await channel.send("\n💬 **Discuss and decide what to do...**")

    async def trigger_divine_council(self, action: str):
        """Trigger Divine Council vote on player action"""

        channel = self.bot.get_channel(self.channel_id)
        if not channel:
            return

        # Simulate Divine Council (normally would call game.convene_divine_council)
        council_result = f"""
===============================================================
            THE GODS DEBATE YOUR FATE
===============================================================

ACTION JUDGED:
{action}

-----------------------------------------------------------

NPC TESTIMONIES:

✅ GRIMSBY: "They... they PROMISED to help my daughter.
They lied to me. My child will DIE because of them.
VALDRIS, this is betrayal!"

✅ RENNA: "They made the hard choice. The medicine was
cursed. They saved 200 lives by NOT using it. That takes
courage."

-----------------------------------------------------------

THE GODS VOTE:

✅ VALDRIS: "Broke an oath. Grimsby's trust violated."
❌ KAITHA: "Chaos! Breaking promises! I LOVE IT!"
❌ MORVANE: "Death chose them. They accepted it."
✅ SYLARA: "Saved many. Nature approves."
✅ KORVAN: "Pragmatic choice in battle."
❌ ATHENA: "Deception, even for good, is still deception."
✅ MERCUS: "The math checks out. 200 lives saved."

-----------------------------------------------------------

DIVINE JUDGMENT

Result: NARROW MAJORITY SUPPORT (4-3)
Support: 4 | Oppose: 3

CONSEQUENCES:
✨ Minor Blessing: +5% to wisdom checks (10 turns)
🤝 Trust Change: -5 (Grimsby's testimony hurt you)

The gods have spoken. Continue your journey...
===============================================================
"""

        await channel.send(council_result)


# Standalone function to run automated scenarios
async def run_automated_gm(bot: commands.Bot, channel_id: int):
    """Run the automated GM in a specific channel"""

    gm = AutomatedGM(bot, channel_id)

    print(f"🎮 Automated GM starting in channel {channel_id}...")

    # Wait a bit for the bot to be ready
    await asyncio.sleep(2)

    # Run scenario 1
    await gm.start_scenario("heist")

    # Wait for players to discuss (simulated - in reality would wait for their input)
    print("⏳ Waiting for players to decide...")
    await asyncio.sleep(10)

    # Trigger Divine Council based on their action
    # (In reality, you'd monitor chat and trigger based on what they do)
    await gm.trigger_divine_council(
        "Players stole medicine from Duke's warehouse but refused to give it to Grimsby"
    )

    print("✅ Scenario complete!")


if __name__ == "__main__":
    print("""
===============================================================
         AUTOMATED AI GM - Test Mode
===============================================================

This would normally run integrated with the Discord bot.
Use this to test scenario generation.

""")

    # Test scenario generation
    print("Scenario: The Heist")
    print("\nThis demonstrates asymmetric whispers:")
    print("- Player 1 gets combat/trap intel")
    print("- Player 2 gets curse/poison intel")
    print("\nBoth must decide: share info or not?")
