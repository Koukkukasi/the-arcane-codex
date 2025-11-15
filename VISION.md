# VISION.md
**Project Argent: The Arcane Codex**
**Long-Term Vision & Future Features**
**Current Version:** v0.1-prototype
**Last Updated:** 2025-10-30

---

## 📋 Overview

This document outlines the **full vision** for Project Argent beyond the prototype. These features are aspirational—we only build them IF the prototype validates that the AI DM is entertaining.

**Guiding Principle:** "The game bleeds into reality."

Players should feel like the fantasy world is real, persistent, and proactive. The game doesn't pause when they log off. NPCs message them at unexpected hours. Quests have real-world deadlines. The experience is mobile-native and always-on.

---

## 🎯 The Three Phases

### Phase 0: Prototype (NOW)
**Goal:** Is the AI DM entertaining?
**Timeline:** 5 days
**Scope:** Single-player, Discord-only, 1 test quest
**Tech:** Python + discord.py + Claude API + JSON file

### Phase 1: MVP (After Prototype Success)
**Goal:** Full multiplayer asymmetry + persistence
**Timeline:** 4-6 weeks
**Scope:** 1-4 players, 6 classes, whispers, persistent database, 3 quests
**Tech:** + Firestore database, multi-party support

### 2: Transmedia "Magic Bleed" (Post-MVP)
**Goal:** Game bleeds into reality via real-world apps
**Timeline:** 8-12 weeks
**Scope:** WhatsApp/SMS, Email, web puzzles, 24/7 proactive events
**Tech:** + Twilio (WhatsApp/SMS), SendGrid (email), Firebase Hosting (web), Cloud Functions (async events)

---

## ⚠️ Phase 1: MVP Feature Set

**Target: 100-500 players, 25-125 active parties**

### 1. Persistent Database (Firestore)

**Why:** JSON files don't scale beyond 1 party

**Migration:**
```
game_state.json → Firestore collections:
- parties/{party_id}
- players/{player_id}
- quests/{quest_id}
- npcs/{npc_id}
- scheduled_events/{event_id}
```

**Benefits:**
- Real-time sync (all players see updates instantly)
- Scalable (1000+ parties)
- Backups automatic
- Query support (leaderboards, faction tracking)

### 2. Full Multiplayer Asymmetry

**The Core Innovation:** Private whispers force collaboration

**How It Works:**

**Public Narration (#story channel):**
```
You enter the abandoned mill. Dust motes dance in dim light filtering
through broken windows. A locked chest sits in the corner, and stairs
descend into darkness.
```

**Private Whispers (Discord DMs):**
```
📱 To Mage:
[Arcana] You sense a ward on the chest. Opening it without dispelling
will trigger... something bad. You don't know what.

📱 To Thief:
[Perception] The chest lock is a Silverhand Triple-Tumbler. You could
pick it in 2 minutes. BUT—there's a tripwire leading to the ceiling.

📱 To Fighter:
[Strength] The stairs are rotted. You could smash through to the basement
level—might be quieter than whatever that chest trap does.
```

**Players must:**
1. Share their whispers in #planning
2. Formulate a group plan
3. Execute via `/action [group plan]`

**Success Criteria:**
- Players MUST communicate to progress
- Solo players get stuck
- Withholding info = risk of party failure

### 3. Character Creation Flow

**Currently:** Hardcoded character
**MVP:** Full creation system

```
/create_character

Bot: "Welcome to The Arcane Codex! Let's create your character.

What's your name?"

> Kaelen

Bot: "Choose your class:
1. ⚔️ Fighter - Tank, melee combat, sees structural weaknesses
2. 🔮 Mage - Magic damage, puzzle-solving, sees magical auras
3. 🗡️ Thief - Stealth, traps, sees hidden paths
4. 🏹 Ranger - Ranged combat, tracking, sees environmental hazards
5. ✨ Cleric - Healing, undead hunter, detects lies/curses
6. 🎵 Bard - Social expert, lore, reads NPC emotions

Type 1-6"

> 2

Bot: "Kaelen the Mage. Welcome to the Guild.

[Character created with starting stats, inventory]

To start your first quest, type /join_party or /solo_quest"
```

### 4. Party Formation System

**Options:**

**A. Join Existing Party:**
```
/join_party

Bot shows: "Open parties looking for players:

1. The Crimson Blades (2/4) - Need Thief + Cleric
2. Shadow Runners (3/4) - Need Mage
3. Random matchmaking (auto-assign)"
```

**B. Create Private Party:**
```
/create_party "Iron Wolves"

Bot: "Party created! Invite friends:
- Sarah: Use code IRON-WOLF-7F3A
- Marcus: Use code IRON-WOLF-7F3A

Or share invite link: discord.gg/arcane/join?party=iron-wolf-7f3a"
```

**C. Solo Play:**
```
/solo_quest

Bot: "AI companions will fill your party (they're not as clever as
real players, but they won't let you die)."
```

### 5. Expanded Content

**3 Full Quests:**

1. **"The Soggy Boot Mystery"** (Prototype quest, refined)
   - 30-45 minutes
   - Weapon smuggling conspiracy
   - Moral choice: justice vs. mercy

2. **"The Necromancer's Daughter"**
   - 45-60 minutes
   - More complex moral dilemma
   - Multiple factions involved
   - 3 different endings

3. **"The Vault of Echoes"**
   - 60-90 minutes
   - Puzzle-heavy dungeon crawl
   - Requires all 3 classes working together
   - Surprise: vault is a prison, not a treasure room

**6 Character Classes:**
- Fighter, Mage, Thief (from prototype)
- Ranger, Cleric, Bard (new)

**12 Unique NPCs:**
- Each with personality, motivation, quirks
- Can appear in multiple quests
- Remember past interactions

### 6. Faction Reputation System

**Track standing with:**
- Adventurer's Guild (employers)
- Thieves' Guild (black market)
- Royal Guard (law enforcement)
- Mages' College (magic items, lore)
- The Church (healing, undead info)

**Effects:**
```
Thieves' Guild Rep: 75/100 (Trusted)
Benefits:
- 20% discount at black market shops
- Access to "gray area" quests
- Safe houses in cities
- Thieves won't attack you

Thieves' Guild Rep: -20/100 (Hostile)
Consequences:
- Ambushed in dark alleys
- Can't use fences to sell stolen goods
- Prices inflated (if they trade at all)
```

**Reputation changes:**
- Steal from merchant: Guild -10, Thieves +5
- Turn in criminal: Guard +15, Thieves -20
- Complete quest for faction: +10-25

### 7. Presence & Async Improvements

**Party Status Dashboard:**
```
🎮 PARTY: The Crimson Blades

⚔️ Jake (Fighter) 🟢 ONLINE - Last action: 2m ago
🔮 Sarah (Mage) 🟡 IDLE - Last action: 18m ago
🗡️ Marcus (Thief) 🔴 OFFLINE - Last seen: 3h ago
🏹 Emma (Ranger) 🟢 ONLINE - Last action: 5m ago

📍 Location: Old Mill
🎯 Quest: "The Soggy Boot Mystery" (Stage 2/3)
⏰ Time remaining: 4h 12m

💬 2 messages in #planning need attention
📦 Shared inventory: rope, 50 gold, map
```

**Sync Opportunities:**
```
🎉 SYNC WINDOW ACTIVE! 🎉

3/4 party members online!

You can now:
- Enter real-time combat mode (10 min window)
- Coordinate combo actions
- Have in-character conversations

Type /sync to activate
```

**Breadcrumb System:**
When offline player returns:
```
🔔 WELCOME BACK, MARCUS!

While you were away (4 hours):
✅ Party explored the mill
✅ Found the chest (it's trapped—your expertise needed)
✅ Jake fell through rotten stairs (took damage, now exploring basement)
⚠️ Sarah detected a ward on the chest

Your skills are needed:
- Disarm the chest trap [Lockpicking]
- Join Jake in basement [Stealth approach]

📖 Read full log (5 min) or 🏃 Jump in now?
```

---

## 📋 Phase 2: Transmedia "Magic Bleed"

**Target: 500-2000 players, always-on experience**

**The Vision:** The game happens in the gaps of real life. Players check their phones between classes, during lunch, before bed. The fantasy world feels real because it uses real communication tools.

### 1. Sending Stones (WhatsApp/SMS via Twilio)

**In-Game Item:**
```
[Quest reward: Sending Stone]

Guildmaster Thorne hands you a smooth, warm stone.

"Attune it to your... what do you call it? 'WhatsApp'? Modern magic,
I don't understand it. But it lets me reach you anywhere. Don't ignore
messages from the Guild. We track that."

To activate, provide your phone number: /attune +1-555-...
```

**Real-World Integration:**
```
[2:47 AM] WhatsApp from "Guildmaster Thorne":
"Where are you?! The Duke's guards are asking about the 'package.'
You need to be back at the Guild by dawn or I can't protect you.

This isn't a game. MOVE."
```

**Use Cases:**
- Urgent quest updates
- NPC requests for help
- Villain taunts (proactive anxiety)
- Time-sensitive choices
- Party member emergency pings

**Player Control:**
- Can mute for sleep hours (8 PM - 8 AM)
- Can set "Do Not Disturb" mode
- Can opt-out of WhatsApp (Discord DMs only)

### 2. Magic Scrolls (WhatsApp/Telegram Documents)

**In-Game Item:**
```
You receive a sealed scroll from the Guild.

[WhatsApp message from "Adventurer's Guild"]

📜 *OFFICIAL QUEST CONTRACT*
The Vault of Echoes

[Image attachment: hand-drawn quest map]
[Document attachment: quest_contract.pdf]

"You are hereby contracted to investigate the Vault of Echoes
beneath the Old City. Standard rates apply (100g upon completion).

Reply 'ACCEPT' to sign the contract.

- Guild Administration"
```

**Use Cases:**
- Quest contracts (with image/PDF attachments via WhatsApp)
- Maps sent as images (easy to view on phone)
- NPC letters (long-form story messages)
- Voice messages from NPCs (audio files via WhatsApp)
- Quest recaps (weekly digest messages)
- Lore documents (shared as mobile-friendly PDFs)

### 3. Scrying Pools (Hidden Websites)

**In-Game Puzzle:**
```
You find a note with a strange symbol and a URL:

"Only those who know the WORD may enter."

https://arcanecodex.com/scry/vault-echo-7f3a

What do you do?
1. Visit the website (opens in browser)
2. Ignore it
3. Research the symbol first [Research check]
```

**Real Website (Static HTML):**
```html
<!-- Simple password-protected page -->

THE SCRYING POOL

Enter the word spoken by the guardian:

[___________] [ENTER]

(Players must find password in-game first)

If correct:
→ Reveals hidden quest info, bonus loot codes, NPC secrets
```

**Use Cases:**
- Puzzle elements
- Hidden lore
- Bonus treasure codes
- Multiplayer coordination (shared password)
- ARG-style meta puzzles

### 4. Proactive Event System (24/7 World Clock)

**The Anxiety Engine:**

The world doesn't pause. Time advances even when players are offline.

**Background Worker (Firebase Cloud Function):**
```python
# Runs every 5 minutes
def check_world_events():
    parties = firestore.collection('parties').get()

    for party in parties:
        # Check quest timers
        if party['quest_deadline'] < NOW():
            trigger_quest_failure(party)

        # Check world flags
        if party['flags']['scepter_stolen'] and not party['flags']['villain_alerted']:
            schedule_villain_message(party, delay_hours=2)

        # Check NPC schedules
        if party['location'] == 'marketplace' and time_is('morning'):
            trigger_npc_event('merchant_arrival', party)
```

**Example: Villain Reaction**
```
[Party steals the Scepter at 6 PM]

game_state.flags.scepter_stolen = true

[Villain Agent detects this change]

[Schedules WhatsApp message for 8 PM]

[8:00 PM] WhatsApp from "Unknown Number":
"You have no idea what you've taken. Or from whom.

I'll be seeing you soon. Very soon."

[Next day, villain ambush triggers when party enters city]
```

**Time-Sensitive Quests:**
```
Quest: "Stop the Ritual"
Deadline: 24 REAL hours from acceptance

If players don't complete in time:
- Ritual succeeds
- City is cursed
- New quest chain unlocks ("Lift the Curse")
- Prices increase, NPCs hostile
- World permanently changed
```

### 5. NPC Agents (Separate AI Personalities)

**Currently:** DM plays all NPCs
**Future:** Key NPCs are separate AI instances

**The Villain (Separate Agent):**
```python
# villain_agent.py

class VillainAI:
    personality = "Cunning, patient, always 3 steps ahead"

    def monitor_parties(self):
        # Check Firestore for villain-related flags
        parties_with_scepter = query(flags.scepter_stolen == true)

        for party in parties_with_scepter:
            if not party.flags.villain_knows:
                # First contact
                self.send_taunt(party, delay_hours=random(1, 3))
                party.flags.villain_knows = true

    def send_taunt(self, party, delay_hours):
        message = self.generate_message(party.recent_actions)
        schedule_whatsapp(party.players, message, delay_hours)

    def generate_message(self, context):
        # Call Claude with villain personality
        prompt = f"As the villain, send a taunting message about {context}"
        return claude.generate(prompt, personality=self.personality)
```

**Benefits:**
- Villain feels like a real adversary
- Adapts to party's specific actions
- Creates personal rivalry
- Runs 24/7 (proactive threat)

**Other NPC Agents:**
- Guildmaster (checks in, assigns quests)
- Mentor (offers hints if party is stuck)
- Rival Party (competing for same quests)

### 6. World Events (MMO-Style)

**Shared World State:**

All parties exist in the same world. Major events affect everyone.

**Example: "The Dragon Awakens"**
```
🌍 GLOBAL EVENT ANNOUNCED 🌍

All parties receive message:

"Reports flood in from across the kingdom: The Ancient Dragon
has awakened. Villagers speak of fire in the mountains, and the
sky turns red at dusk.

The King offers 10,000 gold to any party that can slay the beast.

Event Duration: 7 REAL DAYS

Contribute by:
- Defeating Dragon Shards (mini-bosses in your quests)
- Collecting Dragon Scales (rare drops)
- Donating to the Dragon Slayers' Fund

Top 10 contributing parties receive legendary rewards!

🐉 Dragon HP: 100,000 (shared across all parties)
⚔️ Damage dealt: 0 (0%)
⏰ Time remaining: 6d 23h 59m
"
```

**Progress is SHARED:**
- Party A defeats a shard: Dragon HP -1,000
- Party B donates scales: Dragon HP -500
- All parties see real-time progress in #global-events

**Final Battle (if HP reaches 0 in time):**
- Top 10 parties invited to synchronized final raid
- Epic multi-party combat event
- Legendary loot for participants
- World changes permanently (dragon's lair opens, new quests unlock)

### 7. Leaderboards & Competition

**#leaderboards channel (auto-updated):**
```
🏆 THE ARCANE CODEX LEADERBOARDS 🏆

Top Parties (by Quest Completion):
1. 🥇 The Crimson Blades - 12 quests, 94% success rate
2. 🥈 Shadow Runners - 11 quests, 88% success rate
3. 🥉 Iron Wolves - 10 quests, 91% success rate
...

Top Solo Players (by Skill Mastery):
1. Kaelen the Wise - 5 skills at 80+
2. Marcus the Swift - 4 skills at 80+
...

Most Creative Action (voted by players):
"I seduce the door" - Marcus (succeeded via confusion tactics)
```

**Benefits:**
- Encourages competition
- Showcases creative moments
- Builds community
- Rewards skilled play

---

## 🏗️ Scaling Architecture (Multi-Party)

**For 1000+ players, 250+ parties:**

### Option A: Single Server, Dynamic Channels
- One Discord server
- Parties get temporary private channels
- Limit: 500 channels (need rotation)

### Option B: Player-Hosted Servers
- Players invite bot to their own Discord servers
- Bot creates game channels there
- Infinite scaling
- No global matchmaking

### Option C: Hybrid (Recommended)
- Official server for matchmaking, events, leaderboards
- Bot joins player servers for actual gameplay
- Best of both worlds

**Implementation Path:**
1. Prototype: Single server, manual setup
2. MVP: Option A (dynamic channels)
3. Scale: Migrate to Option C (hybrid)

---

## 💰 Monetization Strategy (Post-Launch)

**Current:** Free (testing)
**Future Options:**

### Option 1: Freemium
- **Free Tier:** 1 active quest at a time, basic classes
- **Premium ($5/month):** Unlimited quests, all 6 classes, cosmetic perks, priority support

### Option 2: Pay-Per-Quest
- Free account creation
- $2 per quest unlock
- Bundle: 10 quests for $15

### Option 3: Patreon/Subscription
- $3/month: Access to all content
- $10/month: Early access to new quests
- $25/month: Custom NPC named after you

### Option 4: Sponsored Content
- Partner with TTRPG brands (D&D, Pathfinder)
- "Play a quest set in the Forgotten Realms"
- Sponsors pay for content creation

**Recommendation:** Start free, add Freemium after 1000+ active users

---

## 📊 Success Metrics (Long-Term)

**Key Performance Indicators:**

### Engagement
- **Daily Active Users (DAU):** Target 500+
- **Session length:** Target 30+ minutes
- **Sessions per week:** Target 3+
- **Quest completion rate:** Target 70%+

### Retention
- **Day 1 retention:** Target 60%+
- **Day 7 retention:** Target 40%+
- **Day 30 retention:** Target 20%+

### Viral Growth
- **Invite rate:** Target 1.5 (each user invites 1.5 friends)
- **Referral conversion:** Target 30%

### Revenue (if monetized)
- **Conversion to paid:** Target 5-10%
- **Lifetime Value (LTV):** Target $15+
- **Churn rate:** Target <10%/month

### Quality
- **Player satisfaction:** Target 4.5/5 stars
- **NPC name recall:** Target 70%+ (players remember NPC names)
- **"Would recommend":** Target 80%+

---

## 🎮 Competitive Analysis

**Similar Games:**

### AI Dungeon (aidungeon.com)
- ✅ AI-driven text adventure
- ❌ Single-player only
- ❌ No structured mechanics (pure freeform)
- ❌ No Discord/social integration
- **Our Edge:** Multiplayer asymmetry, structured RPG mechanics

### D&D Beyond (dndbeyond.com)
- ✅ Digital D&D tools
- ❌ Requires human DM
- ❌ Scheduling nightmare (need all players online)
- **Our Edge:** AI DM, async play, always-on

### Baldur's Gate 3 (video game)
- ✅ Deep RPG mechanics
- ✅ Multiplayer co-op
- ❌ Requires 60-hour commitment
- ❌ Synchronous play only
- ❌ Fixed story (no AI adaptation)
- **Our Edge:** Bite-sized sessions, async, infinite replayability

### Jackbox Games (party games)
- ✅ Phone-as-controller
- ✅ Social multiplayer
- ❌ Not persistent (sessions are isolated)
- ❌ Shallow (party games, not RPGs)
- **Our Edge:** Persistent world, deep story, character growth

**Market Gap:** No one has built an async, AI-driven, transmedia RPG with forced cooperation. This is a blue ocean.

---

## 🚧 Risks & Mitigation

### Risk 1: AI Isn't Entertaining Enough
**Likelihood:** Medium
**Impact:** High (kills the concept)
**Mitigation:** Prototype phase specifically tests this. If it fails, pivot.

### Risk 2: Players Don't Want Async Play
**Likelihood:** Low
**Impact:** High
**Mitigation:** Survey target audience. If true, pivot to scheduled sessions.

### Risk 3: Transmedia Feels Gimmicky
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:** Make transmedia OPTIONAL. Players can opt for Discord-only.

### Risk 4: Claude API Becomes Too Expensive
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Cache common responses
- Use cheaper models for non-critical tasks
- Implement rate limiting
- Charge users if costs exceed $X/month

### Risk 5: Discord Bans the Bot
**Likelihood:** Low
**Impact:** Critical
**Mitigation:**
- Follow Discord TOS strictly
- Don't spam users
- Implement opt-in for all features
- Have fallback: web app UI

### Risk 6: No One Cares
**Likelihood:** Medium
**Impact:** Critical
**Mitigation:**
- Build in public (share dev journey on Twitter, Reddit)
- Target niche first (TTRPG subreddits, Discord servers)
- Offer free beta to influencers
- Gather feedback early and often

---

## 🔮 Wild Ideas (Maybe Someday)

**These are TOO ambitious for now, but fun to think about:**

### Voice Acting Mode
- Players voice-chat in Discord
- AI transcribes speech to text
- Responds with voice (ElevenLabs TTS)
- True "sitting around a table" feel

### AR Integration
- Scan QR codes in real world to find loot
- "Hidden treasure is at GPS coordinates..."
- Physical meetups for epic battles

### Procedural Quest Generation
- AI creates infinite quests
- No two parties have same experience
- Endless replayability

### Player-Created Content
- Players can write quests
- AI DM runs them for other parties
- Revenue share with quest authors

### Cross-Game Integration
- Your character exists across multiple games
- Stats carry over
- Shared universe

### Live DM Mode
- Hybrid: AI handles mechanics, human DM handles story
- Best of both worlds
- Charge premium for human DM sessions

---

## 📅 Roadmap Timeline

**Rough estimates (subject to change):**

| Phase | Timeline | Goal |
|-------|----------|------|
| **Phase 0: Prototype** | Week 1 | Validate AI entertainment |
| **Phase 1: MVP** | Weeks 2-7 | Multiplayer, 100 players |
| **Phase 2: Transmedia** | Weeks 8-15 | WhatsApp, Email, 500 players |
| **Phase 3: Scale** | Months 4-6 | Global events, 2000 players |
| **Phase 4: Monetize** | Month 7+ | Revenue, sustainability |

**Total time to sustainable business:** 6-9 months (if all goes well)

---

## 📝 Changelog

### v0.1-vision (2025-10-30)
- Initial vision document created
- 3-phase roadmap defined
- MVP features scoped (multiplayer, 6 classes, factions)
- Transmedia features detailed (WhatsApp, email, web puzzles)
- Proactive event system designed
- Scaling architecture options outlined
- Monetization strategies proposed
- Success metrics defined
- Competitive analysis added
- Risk mitigation strategies
- Timeline estimate

---

## 🔗 Related Documents
- **MECHANICS.md** - Current game rules
- **PROMPTS.md** - AI personality system
- **TECH_STACK.md** - Current implementation
- **PROTOTYPE_PLAN.md** - Immediate next steps

---

**Status:** 📋 Aspirational (build only if prototype succeeds)
**Priority:** Document exists for reference, NOT immediate action
**Decision Gate:** Complete prototype → get feedback → decide if MVP is worth building
