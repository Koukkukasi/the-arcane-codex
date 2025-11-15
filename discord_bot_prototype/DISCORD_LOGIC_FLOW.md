# DISCORD BOT LOGIC FLOW
**How Asymmetric Whispers + Turn Timers Work**

---

## 🎯 THE COMPLETE FLOW

```
TURN STARTS
    ↓
[1] GM Posts Public Scene to Channel
    ↓
[2] Bot Sends DIFFERENT Private DMs to Each Player (SIMULTANEOUS)
    ↓
[3] Each Player Has 60-Second Timer
    ↓
[4] Players Submit Actions (independently, can't see each other's)
    ↓
[5] When ALL Submit OR Timer Expires → Resolve Turn
    ↓
[6] GM Posts Public Resolution
    ↓
[7] Repeat
```

---

## 📨 STEP 1: PUBLIC SCENE (Everyone Sees)

**#game-channel** (public):

```
═══════════════════════════════════════════
⚔️ TURN 1 - The Soggy Boot Tavern
═══════════════════════════════════════════

🌅 Rain hammers the roof. The door creaks open.

GRIMSBY (missing 3 fingers):
"Please! The Guild took my daughter! I'll pay 80 gold!"

THREE GUILD THUGS stand up, hands on weapons.

VETERAN: "Grimsby. We TOLD you. No adventurers."

━━━━━━━━━━━━━━━━━━━━━━
⏱️ Players have 60 seconds to submit actions!
━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔒 STEP 2: ASYMMETRIC DMs (Sent Simultaneously)

### To: @Theron (Fighter)

**DM from The Chronicler Bot:**

```
🔒 PRIVATE INTEL - TURN 1
━━━━━━━━━━━━━━━━━━━━━━
⏱️ 60 SECONDS REMAINING

⚔️ FIGHTER TACTICAL ANALYSIS:

ENEMY ASSESSMENT:
• LEFT THUG: Young, trembling - WEAK
• VETERAN (center): Scarred, confident - DANGEROUS
  → Reaching for BRASS HORN on belt
  → If he blows it = REINFORCEMENTS in 60s
• RIGHT THUG: Stocky, experienced

TACTICAL OPTIONS:
🪑 Oak table 5 feet left (flip for cover)
🔥 Oil lamp on shelf (improvised weapon)
⚠️ PRIORITY: Stop the horn!

━━━━━━━━━━━━━━━━━━━━━━
YOUR OPTIONS:

1. 💬 "We're just passing through." [Persuasion: 25] 🟡 60%
2. ⚔️ Charge veteran before horn [Combat: 25] 🟢 75%
3. 🪑 Flip table for cover [Strength: 20] 🟢 78%
4. 🔥 Grab oil lamp [Athletics: 15] 🟢 82%
5. 👁️ Size up weak points [Perception: 20] 🟢 75%
6. ✍️ Something else

React with number (1-6) or type custom action!

⏱️ Timer: [████████████████████] 60s
━━━━━━━━━━━━━━━━━━━━━━
⚠️ YOUR INFORMATION ONLY
```

---

### To: @Lyra (Mage)

**DM from The Chronicler Bot:**

```
🔒 PRIVATE INTEL - TURN 1
━━━━━━━━━━━━━━━━━━━━━━
⏱️ 60 SECONDS REMAINING

🔮 ARCANE PERCEPTION:

MAGICAL DETECTION:
✨ TRACKING SPELL on Grimsby (active right now!)
   Someone is watching his location in real-time.
   The Guild FOLLOWED him here.

✨ Veteran has ANTI-MAGIC CHARM
   Your direct spells: -15% vs him
   AOE effects still work normally

💎 GRIMSBY'S COINS:
   Marked with Guild runes: "GUILD PROPERTY"
   He WORKED for the Guild. Not just a victim.

🔍 FRESH INK STAINS on his hands
   + Char smell = He burned documents recently

━━━━━━━━━━━━━━━━━━━━━━
YOUR OPTIONS:

1. 🔮 Sense for more magic [Arcana: 15] 🟢 88%
2. 🔥 Telekinesis grab horn [Arcana: 20] 🟢 80%
3. 💬 "Guild business? We'll leave." [Persuasion: 25] 🟡 55%
4. 🔥 Palm oil lamp secretly [Sleight: 25] 🟡 48%
5. 🔮 Sleep spell (all 3 thugs) [Arcana: 35] 🔴 38%
6. ✍️ Something else

React with number (1-6) or type custom action!

⏱️ Timer: [████████████████████] 60s
━━━━━━━━━━━━━━━━━━━━━━
⚠️ YOUR SECRETS. SHARE OR HIDE?
```

---

### To: @Ash (Thief)

**DM from The Chronicler Bot:**

```
🔒 PRIVATE INTEL - TURN 1
━━━━━━━━━━━━━━━━━━━━━━
⏱️ 60 SECONDS REMAINING

🗝️ THIEF'S EYE:

LIE DETECTION:
❌ GRIMSBY IS LYING
   • Touching left ear = deception tell
   • "80 gold" = FALSE
   • Actual pouch weight: ~200 gold minimum

🎭 HIS PERFORMANCE:
   Clothes CLEAN, nails perfect.
   NOT a desperate father searching 3 days.
   This is THEATER.

👁️ VETERAN BEHAVIOR:
   Keeps glancing at Grimsby with RECOGNITION.
   They KNOW each other.

THEORY: This isn't kidnapping.
→ Guild retrieving stolen money?
→ Setup/trap with Grimsby as bait?
→ Internal Guild power struggle?

━━━━━━━━━━━━━━━━━━━━━━
ESCAPE ROUTES IDENTIFIED:
🚪 Back door: Simple lock (6 seconds to pick)
🪟 Window: Unlatched, 8-foot drop
🪜 Upstairs: Rooms, possible balcony

━━━━━━━━━━━━━━━━━━━━━━
YOUR OPTIONS:

1. 👁️ Count his pouch by weight [Perception: 15] 🟢 90%
2. 🗝️ Check back door lock [Lockpicking: 10] 🟢 95%
3. 💬 "How much for the girl?" (to thugs) [Persuasion: 30] 🟡 58%
4. 🤐 Slip toward window [Stealth: 20] 🟢 88%
5. 👁️ Watch veteran's hands [Perception: 25] 🟢 78%
6. ✍️ Something else

React with number (1-6) or type custom action!

⏱️ Timer: [████████████████████] 60s
━━━━━━━━━━━━━━━━━━━━━━
⚠️ MORVANE WHISPERS:
"He's bait. Take his gold. Leave."
```

---

## ⏱️ STEP 3: TIMER COUNTDOWN (Each Player Sees in Their DM)

**Every 10 seconds, bot edits the DM to update timer:**

```
⏱️ Timer: [████████████░░░░░░░░] 40s
```

```
⏱️ Timer: [██████░░░░░░░░░░░░░░] 20s  ⚠️ HURRY!
```

```
⏱️ Timer: [███░░░░░░░░░░░░░░░░░] 10s  🚨 FINAL WARNING!
```

---

## 📤 STEP 4: PLAYERS SUBMIT ACTIONS

**Players react to their DM with emoji (1️⃣-6️⃣) or type custom action.**

### @Theron reacts with: 2️⃣ (Charge veteran)

**Bot updates Theron's DM:**
```
✅ ACTION SUBMITTED: Charge veteran before horn

⏱️ Waiting for other players...

PARTY STATUS:
✅ Theron - READY
🕐 Lyra - 35s remaining
🕐 Ash - 42s remaining
```

### @Lyra reacts with: 2️⃣ (Telekinesis grab horn)

**Bot updates Lyra's DM:**
```
✅ ACTION SUBMITTED: Telekinesis grab horn

⏱️ Waiting for other players...

PARTY STATUS:
✅ Theron - READY
✅ Lyra - READY
🕐 Ash - 28s remaining
```

### @Ash reacts with: 2️⃣ (Check back door)

**Bot updates Ash's DM:**
```
✅ ACTION SUBMITTED: Check back door lock

⏱️ All players ready! Resolving turn...
```

---

## 🎬 STEP 5: TURN RESOLUTION (Public Channel)

**#game-channel** (public):

```
⏳ The Chronicler weaves your fates together...

━━━━━━━━━━━━━━━━━━━━━━
PARTY ACTIONS:
• Theron: Charge veteran before horn
• Lyra: Telekinesis grab horn
• Ash: Check back door lock
━━━━━━━━━━━━━━━━━━━━━━

[Skill checks run, narration posted...]

🎲 LYRA - ARCANA CHECK
Roll: 91/100 ❌ FAILURE
💫 But Kaitha's Wild Luck! → ✨ SUCCESS!

🔮 The brass horn RIPS from veteran's belt!
It flies across the room into the fireplace. LOST.

━━━━━━━━━━━━━━━━━━━━━━

🎲 THERON - COMBAT CHECK
Roll: 67/100 ✅ SUCCESS!

⚔️ Theron CHARGES! Shield slams veteran into wall!
💀 Veteran: 55 → 33 HP - BLOODIED

━━━━━━━━━━━━━━━━━━━━━━

[etc...]
```

---

## 🔄 STEP 6: NEW ASYMMETRIC DMS (Next Turn)

**Bot immediately sends NEW private intel based on changed situation:**

### To: @Theron

```
🔒 TURN 2 PRIVATE INTEL
━━━━━━━━━━━━━━━━━━━━━━

⚔️ UPDATED SITUATION:

Veteran is BLOODIED (33/55 HP)
Young thug PANICKING - about to flee
Stocky thug UNCERTAIN

NEW INTEL:
Grimsby just pulled a CROSSBOW from his coat.
He's pointing it at the stocky thug, not you.

⚠️ Something's wrong. Grimsby isn't scared anymore.

[New action options...]
```

---

## 🎮 KEY TECHNICAL FEATURES:

### 1. **Simultaneous DM Sending**

```python
async def send_asymmetric_whispers(session):
    """Send different DMs to all players at once"""

    # Prepare all whispers
    whispers = {}
    for player_id, character in session.players.items():
        whispers[player_id] = generate_whisper(character, session.scene)

    # Send ALL DMs simultaneously (asyncio.gather)
    tasks = []
    for player_id, whisper_content in whispers.items():
        user = await bot.fetch_user(player_id)
        task = user.send(whisper_content)
        tasks.append(task)

    # Execute all at once
    await asyncio.gather(*tasks)

    # Start timers
    session.start_turn_timers(duration=60)
```

---

### 2. **Timer Updates**

```python
async def update_timer_displays(session):
    """Update all player DMs with countdown"""

    while session.turn_active:
        await asyncio.sleep(10)  # Update every 10 seconds

        for player_id, timer in session.timers.items():
            remaining = timer.time_remaining()
            progress_bar = create_progress_bar(remaining, 60)

            # Edit the player's DM
            dm_message = session.timer_messages[player_id]
            await dm_message.edit(content=f"⏱️ Timer: {progress_bar} {remaining}s")
```

---

### 3. **Action Submission**

```python
@bot.event
async def on_reaction_add(reaction, user):
    """Player reacts with emoji to choose action"""

    if user.bot:
        return

    # Find their session
    session = find_player_session(user.id)
    if not session:
        return

    # Map emoji to action number
    emoji_map = {'1️⃣': 1, '2️⃣': 2, '3️⃣': 3, '4️⃣': 4, '5️⃣': 5, '6️⃣': 6}

    if reaction.emoji in emoji_map:
        action_num = emoji_map[reaction.emoji]

        # Store their action
        session.submit_action(user.id, action_num)

        # Update their DM
        await user.send(f"""
✅ ACTION SUBMITTED: {session.get_action_description(action_num)}

⏱️ Waiting for other players...

PARTY STATUS:
{session.get_party_status_display()}
        """)

        # Check if all players ready
        if session.all_players_ready():
            await resolve_turn(session)
```

---

### 4. **Preventing Spoilers**

```python
# Each player's DM is PRIVATE
# They cannot see each other's whispers
# Discord handles this automatically

# Party status shows:
# ✅ Theron - READY (doesn't show WHAT they chose)
# 🕐 Lyra - 35s remaining
# 🕐 Ash - 42s remaining

# This creates tension: "What did they choose?"
```

---

### 5. **Auto-Resolution on Timeout**

```python
async def monitor_turn_timeout(session):
    """If timer expires, auto-resolve with submitted actions"""

    await asyncio.sleep(60)  # Wait full 60 seconds

    if not session.all_players_ready():
        # Some players didn't submit
        # Auto-pass for those players
        for player_id in session.pending_players():
            session.submit_action(player_id, "pass")  # Default action

        # Notify channel
        await session.channel.send(
            "⏰ Timer expired! Auto-resolving with submitted actions..."
        )

    await resolve_turn(session)
```

---

## 🎯 PLAYER EXPERIENCE TIMELINE:

```
00:00 - Public scene posted to #game-channel
00:01 - All 3 players receive DIFFERENT DMs simultaneously
00:05 - Theron submits action (55s left)
00:10 - Timer updates show 50s remaining
00:15 - Lyra submits action (45s left)
00:20 - Timer updates show 40s remaining
00:25 - Ash submits action (35s left)
00:26 - "All players ready! Resolving..."
00:27 - Public resolution posted
00:30 - New turn begins, new DMs sent
```

**Average turn time: 30-60 seconds** (faster than traditional D&D!)

---

## 💡 WHY THIS WORKS:

✅ **Speed**: 60-second timer keeps game moving
✅ **Tension**: Players don't know what others chose
✅ **Fairness**: Everyone gets same time limit
✅ **Engagement**: Simultaneous action = no waiting
✅ **Secrets**: Asymmetric info creates drama
✅ **Flexibility**: Can type custom actions too

---

## 🚀 ADVANCED FEATURES:

### Secret Player-to-Player Whispers:

```
Ash wants to tell Lyra secretly: "Grimsby is lying!"

Ash types in DM: !whisper @Lyra Grimsby is lying!

Bot sends to Lyra's DM:
"🤫 SECRET FROM ASH: 'Grimsby is lying!'"

Theron NEVER sees this message.
```

### Variable Timer Per Player:

```python
# Thief gets +10s bonus (quick reflexes)
session.timers['ash'] = 70

# Fighter gets standard 60s
session.timers['theron'] = 60

# Mage gets -10s penalty (analysis paralysis)
session.timers['lyra'] = 50
```

---

**THIS is how The Arcane Codex creates unprecedented tension and engagement!**

No other RPG has:
✅ Asymmetric information per player
✅ Simultaneous action with timers
✅ Real-time trust mechanics
✅ 60-second turns (vs 5-10 minute D&D turns)
