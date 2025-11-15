# PARTY LEADER SYSTEM
**The Arcane Codex - Async Multiplayer Leadership**
**Date:** 2025-10-30

---

## 🎯 THE PROBLEM

**Without a party leader in async multiplayer:**
- ❌ Game stalls waiting for all 4 players to be online
- ❌ No one can make decisions (rest? accept quest? enter dungeon?)
- ❌ Players in different timezones = game never progresses
- ❌ One AFK player blocks everyone

**Your unique challenge:**
Unlike BG3 (real-time sessions), you have **async mobile-first design** where:
- Players check in throughout the day (lunch break, commute, before bed)
- Rarely all online simultaneously
- Game MUST keep moving 24/7

---

## ✅ THE SOLUTION: Flexible Leadership

**Core Philosophy:**
> "The leader keeps the game alive, but doesn't control other players' souls."

**Two-Tier System:**
1. **LEADER POWERS** - Keep game moving (quest decisions, rests, major story choices)
2. **PLAYER AUTONOMY** - Everyone controls their own actions, whispers, and character

---

## 👥 PARTY STRUCTURE (Updated for NPCs)

### Current Party Composition:

**Standard Party:** 2 Human Players + 1-2 NPC Companions = 3-4 Total Members

```
Example Party:
- Jake (Human Player, Leader, Fighter)
- Sarah (Human Player, Mage)
- Grimsby (NPC Companion, Desperate Father)
- Renna (NPC Companion, Vengeful Rogue)

Total: 4 members (2 players + 2 NPCs)
```

### Key Differences from All-Human Parties:

**NPCs Are Not Players:**
- ❌ NPCs do NOT vote on party decisions
- ❌ NPCs do NOT have leader/objection powers
- ❌ NPCs do NOT control their own actions directly
- ✅ NPCs ACT based on approval, trust, and AI GM decisions
- ✅ NPCs CAN betray, leave, or die permanently
- ✅ NPCs CANNOT be kicked (fixed party structure)

**Voting System Adjusted:**
```
OLD (4 human players): Requires 3/4 votes (75%) for major decisions
NEW (2 human players): Requires BOTH players to agree OR leader decides

Example:
Major Decision: "Betray Grimsby to save city?"
- Jake (Leader): YES
- Sarah: NO

Result: DEADLOCK
→ Leader can override after 24 hours OR
→ Leader can call for discussion/compromise
→ If urgent, leader's vote counts as 1.5 (breaks tie)
```

**NPCs Influence Decisions Through Approval:**
```
If Grimsby has 80+ approval:
Bot: "⚠️ GRIMSBY OBJECTS STRONGLY
     'Please... don't betray me. I've helped you!'

     @Jake - Grimsby's high approval (85) means this will hurt party morale.
     Proceed anyway?"

Jake (Leader): "Sorry buddy, city needs saving."
[Grimsby Approval: 85 → 15 (HOSTILE)]
[Grimsby may betray party later]
```

### Leadership in 2-Player Parties:

**Leader Responsibilities:**
1. Accept/decline quests
2. Trigger rests
3. Set travel destinations
4. Make major story decisions (with other player's input)
5. Manage NPC relationships (can't kick, but can influence through choices)

**Non-Leader Player Autonomy:**
- Full control over own character
- Can object to leader decisions
- Can veto major decisions (both players must agree)
- Whispers remain private
- Can leave party if irreconcilable differences

---

## 👑 PARTY LEADER POWERS

### What the Leader CAN Do:

**1. Accept/Decline Quests**
```
[Guildmaster offers quest: "Find the Missing Caravan"]

LEADER ONLY sees:
✅ Accept quest (starts 8-hour timer for whole party)
❌ Decline quest (party continues exploring)
⏸️ Discuss first (ask party in #planning, 30-min timer)

[Leader clicks "Discuss first"]

Bot: @party "Leader wants to discuss quest. Vote in #planning within 30 min or leader decides."
```

**2. Trigger Party Rests**
```
LEADER ONLY command: /rest [camp/inn]

Jake (Leader): "/rest camp"

Bot: "🔥 CAMP REST initiated by leader
      - Restores 30% HP/Stamina/Mana
      - Advances world clock 1 hour
      - 15% chance of random encounter

      ⏳ Party has 5 minutes to object or rest happens"

[No objections]

Bot: "✅ Party rests. All resources restored. Time: Evening → Night"
```

**3. Set Party Destination**
```
LEADER ONLY: /travel [location]

Jake (Leader): "/travel Old Mill"

Bot: "📍 TRAVEL ORDER: Party heading to Old Mill (15 min journey)

      Party can continue current actions or prepare for arrival.
      Arrival ETA: 3:45 PM real-time"
```

**4. Initiate Major Story Decisions**
```
[NPC offers deal: "Kill the necromancer, I'll pay 500 gold"]

LEADER sees:
🗳️ This is a MAJOR DECISION - trigger party vote?

Jake (Leader): "/vote accept_contract yes/no"

Bot: "🗳️ PARTY VOTE: Accept necromancer contract?
      ✅ YES: 500 gold, fight necromancer
      ❌ NO: Decline, keep searching for caravan

      Vote by reacting ✅ or ❌
      Closes in: 2 hours (or when all vote)"
```

**5. Emergency Actions (Keep Game Moving)**
```
Situation: Party in combat, 2 players offline for 6+ hours

LEADER ONLY: /autopilot [player] [basic/defensive/aggressive]

Jake (Leader): "/autopilot @Marcus defensive"

Bot: "🤖 AUTOPILOT: Marcus (Thief) set to DEFENSIVE
      - Will dodge/hide if attacked
      - Won't use items or make risky moves
      - Owner can reclaim control anytime

      This prevents game from stalling while Marcus is offline."
```

### What the Leader CANNOT Do:

**❌ FORBIDDEN:**
- Control another player's actions
- Read another player's whispers (those are SACRED)
- Spend another player's gold/items
- Force a player to use abilities
- Kick players from party (requires vote)
- Change another player's character

---

## 🗳️ VOTING SYSTEM (Major Decisions Only)

### When Votes Trigger:

**MAJOR decisions** (leader can't unilaterally decide):
- ✅ Betray an NPC/ally
- ✅ Join a faction
- ✅ Sacrifice party member for greater good
- ✅ Split the party (dangerous!)
- ✅ Spend shared party funds (>100 gold)
- ✅ Kick a player from party

**MINOR decisions** (leader decides, others can object):
- ⚡ Accept routine quests
- ⚡ Rest at camp/inn
- ⚡ Travel to new location
- ⚡ Buy items for party

### Voting Mechanics:

```
/vote [decision_id] [option1/option2/option3]

Bot creates Discord poll:
🗳️ PARTY VOTE: Should we betray Marcus to save the city?

✅ YES - Betray Marcus (save 10,000 lives)
❌ NO - Stay loyal to Marcus (risk city destruction)
🤔 ABSTAIN - Let others decide

React to vote. Closes in: 2 hours

Current votes (hidden until close):
⚔️ Jake (Fighter): ...
🔮 Sarah (Mage): ...
🗡️ Renna (Rogue): ...
🏹 Marcus (being betrayed): ... (can still vote!)
```

**Vote Resolution:**
```
AFTER 2 hours (or all players vote):

🗳️ VOTE RESULTS:
✅ YES: 2 votes (Jake, Sarah)
❌ NO: 1 vote (Renna)
🤔 ABSTAIN: 1 vote (Marcus - wisely abstained)

MAJORITY WINS: Party betrays Marcus

[Consequences:]
- Marcus Approval: -50 (now HOSTILE)
- City saved (+reputation)
- Renna disapproves of party decision (-10 party morale)
- Marcus: "I won't forget this. Ever."
```

**Tie-Breaking Rules:**
1. Leader's vote counts as 1.5 in ties (leadership privilege)
2. If still tied → Status quo wins (no change)
3. Emergency only: Leader can override after 24h deadlock

---

## 🎭 PLAYER AUTONOMY (What Everyone Controls)

### Every Player Has Full Control Over:

**1. Their Own Actions**
```
Even if leader says "everyone attack the dragon":

Sarah (Mage): "/action I run away screaming"

✅ ALLOWED - It's her character, her choice
[Consequence: Party loses Mage's firepower, might get mad at her]
```

**2. Their Whispers & Class Information**
```
📱 Mage Whisper (only Sarah sees):
"The dragon is an ILLUSION. Real threat is behind you."

Sarah can:
✅ Share in #planning: "Guys it's fake! Turn around!"
✅ Keep secret: (maybe she wants party to fail?)
✅ Lie about it: "My whisper says attack!"

SACRED RULE: Whispers are private. Leader can't force sharing.
```

**3. Their Dialogue Choices**
```
[NPC talking to Mage specifically]

NPC: "You, Mage. What's your name?"

ONLY SARAH can respond:
1. Tell truth
2. Lie
3. Refuse to answer
4. Cast spell and flee

Leader can suggest in #planning, but CAN'T control Sarah's response.
```

**4. Their Items & Gold**
```
Sarah has 50 personal gold.

Leader CANNOT:
❌ Spend Sarah's gold
❌ Force Sarah to buy health potions
❌ Give Sarah's items to another player

Leader CAN:
✅ Ask Sarah to buy potions for party
✅ Suggest Sarah share items
✅ Vote to kick Sarah if she's hoarding (requires 3/4 vote)
```

**5. When They Play**
```
Leader: "Everyone needs to be online at 8 PM for raid!"

Sarah: "I have work. Can't make it."

✅ ALLOWED - Real life > game
[Leader can /autopilot Sarah if she agrees, or continue with 3 players]
```

---

## 🔄 LEADERSHIP TRANSFER

### How to Change Leaders:

**Option 1: Leader Voluntarily Steps Down**
```
/transfer_leader @NewPlayer

Jake: "/transfer_leader @Sarah"

Bot: "👑 @Sarah is now party leader!
      - Jake remains in party as regular member
      - Sarah can now make leader decisions"
```

**Option 2: Vote to Remove Leader (Mutiny!)**
```
Situation: Leader is AFK for 48 hours, blocking game

/vote_remove_leader

Requires 75% vote (3/4 players in 4-player party)

Bot: "🗳️ VOTE: Remove Jake as leader?
      - Requires 3/4 votes to pass
      - If passed, party chooses new leader
      - Jake stays in party unless also voted to kick"
```

**Option 3: Leader Abandons Party**
```
Leader quits game entirely.

Bot: "⚠️ Leader has left the party!

      🗳️ Choose new leader (vote closes in 1 hour):
      React to vote for new leader:
      🔮 @Sarah (Mage)
      ⚔️ @Renna (Rogue)
      🏹 @Marcus (Ranger)

      Highest votes = new leader"
```

---

## ⚖️ LEADER VS. AUTONOMY EXAMPLES

### Example 1: Quest Acceptance

**Scenario:** Guildmaster offers quest

**Leader Decision:**
```
Jake: "/accept_quest missing_caravan"

Bot: "✅ Quest accepted: Find the Missing Caravan
      - Time limit: 8 hours (real-time)
      - Reward: 200 gold
      - Party is now committed"
```

**Player Autonomy:**
```
Sarah: "Wait, I never agreed to this!"

Sarah: "/action I go to the library instead to research the Name-Eater"

✅ ALLOWED - Sarah can pursue different goal
[Consequence: Party splits, might fail 8-hour quest without Mage]
```

**Resolution:**
```
Other players in #planning:
"Sarah we NEED you for this quest!"
"Come on, you're making us fail!"

Sarah: "Fine. But next time we VOTE on quests."

[Social pressure solved it - no code needed]
```

---

### Example 2: Rest Decision

**Leader Decision:**
```
Jake: "/rest inn"

Bot: "🛏️ RESTING at inn (8 hours)
      - Cost: 30 gold from PARTY FUNDS
      - Full HP/Stamina/Mana restore
      - Advances clock: Evening → Morning

      ⏳ 5 min to object or rest happens"
```

**Player Objection:**
```
Sarah: "WAIT! We have 4 hours left on quest timer!"

Sarah: "/object rest"

Bot: "⚠️ Sarah objects to rest!

      @Jake (leader) choose:
      1. Cancel rest (listen to Sarah)
      2. Force rest anyway (leader override)
      3. Call vote (let party decide)"

Jake: "Oh crap, didn't see timer. Canceling."

Jake: "/cancel"
```

---

### Example 3: Combat Actions (Full Autonomy)

**Scenario:** Dragon fight

**Leader suggests strategy:**
```
Jake in #planning: "Okay plan: I tank, Sarah blast from range, Renna flank"
```

**Players execute (or don't):**
```
TURN 1:
Jake: "/action I charge the dragon" ✅ Follows plan
Sarah: "/action I attack the dragon with fire" ✅ Follows plan
Renna: "/action I steal the dragon's treasure while it's distracted" ❌ CHAOS

Bot: "Renna sneaks to treasure hoard while dragon is distracted by Jake.
      Roll Stealth..."
```

**Leader's Response:**
```
Jake in #planning: "RENNA WTF?!"
Renna in #planning: "I'm a THIEF. This is what I DO."

[No code enforcement - social dynamics handle it]
[If party hates this, they vote to kick Renna later]
```

---

## 🚨 EMERGENCY SYSTEMS

### System 1: AFK Detection

```
TRIGGER: Player hasn't acted in 6+ hours during active quest

Bot: "⚠️ @Sarah has been inactive 6 hours

      Options:
      1. ⏸️ Pause quest timer (wait for Sarah)
      2. 🤖 Autopilot Sarah (basic defensive AI)
      3. 📤 Continue without Sarah (she misses rewards)

      @Jake (leader) choose within 30 min"
```

### System 2: Deadlock Resolution

```
TRIGGER: Party vote has been tied for 24 hours

Bot: "🗳️ VOTE DEADLOCK (24 hours)

      Betray Marcus: 2 yes, 2 no (tie)

      EMERGENCY RESOLUTION:
      1. Leader override (Jake breaks tie)
      2. Status quo wins (don't betray Marcus)
      3. Flip coin (50/50 random)

      @Jake (leader) decide in 1 hour or option 2 auto-applies"
```

### System 3: Leaderless Party

```
TRIGGER: No leader for 1+ hour

Bot: "⚠️ NO ACTIVE LEADER

      Party is in ANARCHY MODE:
      - All major decisions require unanimous vote
      - Any player can trigger votes
      - First to react ✅ on decisions acts as temp leader

      Recommend choosing leader: /vote_leader"
```

---

## 📊 LEADER DASHBOARD

### Leader-Only Commands:

```
/leader_status

Bot shows leader:

👑 PARTY LEADER DASHBOARD

📍 Location: Old Mill
⏰ Quest Timer: 2h 15m remaining
💰 Party Funds: 150 gold

🎮 ACTIVE PLAYERS (online now):
⚔️ Jake (Leader) - 🟢 ONLINE
🔮 Sarah (Mage) - 🟢 ONLINE

💤 OFFLINE PLAYERS:
🗡️ Renna (Rogue) - Last seen: 45 min ago
🏹 Marcus (Ranger) - Last seen: 3 hours ago

⚡ PENDING DECISIONS:
- [Vote] Betray Marcus? (closes in 1h 20m)
- [Objection Timer] Rest at inn (4 min remaining)

🔧 LEADER ACTIONS:
/rest [camp/inn] - Rest party
/travel [location] - Set destination
/accept_quest [id] - Accept quest
/autopilot [player] - Set offline player to AI
/vote [decision] - Trigger party vote
/transfer_leader [player] - Give leadership away
```

---

## 🎯 DESIGN PRINCIPLES

### 1. Leader = Facilitator, Not Dictator

**Good Leader Behavior:**
```
Jake: "Hey team, Guildmaster has quest. Thoughts?"
[Waits 10 min for responses]
[3/4 players say yes]
Jake: "/accept_quest" ✅ Facilitated consensus
```

**Bad Leader Behavior:**
```
Jake: "/accept_quest" (no discussion)
Jake: "/rest inn" (ignores objections)
Jake: "/travel dungeon" (no one agreed)
❌ Dictator - party will vote to remove
```

### 2. Async-First Design

**Real-time sessions (BG3 style):**
- Everyone online for 3 hours
- Synchronous decisions
- Leader represents group

**Async mobile (Your game):**
- Players check in throughout day
- Asynchronous decisions (votes, timers)
- Leader keeps game ALIVE when others offline

### 3. Social > Technical Enforcement

**Don't code-enforce everything:**
```
If Renna steals from party:
❌ DON'T: Prevent her mechanically
✅ DO: Let it happen, create social consequence

Other players:
- Vote to kick Renna
- Refuse to share loot with her
- Turn her in to guards

[Emergent social dynamics > rigid rules]
```

### 4. Whispers Are SACRED

**NEVER let leader:**
- See other players' whispers
- Force players to share whisper info
- Punish players for withholding whispers

**Whispers = trust game:**
- Players CHOOSE to share or withhold
- Consequences are social (party mad at you)
- Creates drama, tension, betrayal potential

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Basic Leadership (Prototype)
- [ ] `/transfer_leader` command
- [ ] Leader-only `/accept_quest`
- [ ] Leader-only `/rest`
- [ ] Objection timer (5 min to object)
- [ ] Basic voting system

### Phase 2: Voting & Democracy (MVP)
- [ ] `/vote` command for major decisions
- [ ] Vote UI (Discord polls/reactions)
- [ ] Tie-breaking rules
- [ ] Vote history tracking

### Phase 3: Advanced Features (Post-MVP)
- [ ] `/autopilot` for AFK players
- [ ] Leader dashboard (`/leader_status`)
- [ ] AFK detection (6-hour inactive warning)
- [ ] Deadlock resolution (24-hour auto-resolve)
- [ ] Mutiny system (`/vote_remove_leader`)

---

## 💡 EXAMPLE PLAY SESSION (Async)

**Monday 8 AM:**
```
Jake (Leader) logs in:
Jake: "/accept_quest missing_caravan"
Bot: "Quest accepted! 8-hour timer starts."
Jake: "/travel Merchant District"
[Jake logs off - going to work]
```

**Monday 12 PM (Lunch Break):**
```
Sarah logs in:
Bot: "Party is traveling to Merchant District (ETA: 2 PM real-time)"
Sarah: "/action I research the caravan route in my spellbook during travel"
Bot: [Resolves action, Sarah gains info]
[Sarah logs off - back to work]
```

**Monday 3 PM:**
```
Renna logs in:
Bot: "Party arrived at Merchant District!"
Renna: "/action I ask merchants about missing caravan"
Bot: [Narrates scene, reveals Thief whisper: "Merchant is lying"]
Renna in #planning: "My whisper says merchant is LYING"
[Renna logs off]
```

**Monday 7 PM:**
```
ALL players online!
Bot: "🎉 SYNC OPPORTUNITY - All players online!"

Jake: "Okay so Renna says merchant is lying. Sarah what did you learn?"
Sarah: "Caravan was headed through Darkwood Forest"
Marcus: "My whisper says there are bandits in Darkwood"

Jake: "Vote: Do we confront lying merchant or go straight to forest?"
Jake: "/vote merchant_or_forest merchant/forest"

[2 hours later - votes in]
Result: 3 forest, 1 merchant
Jake: "/travel Darkwood Forest"

[Party plays together for 1 hour, then people log off]
```

**Result:** Game progressed over 12 hours with players checking in asynchronously, leader keeping things moving!

---

**Status:** ✅ Party Leader System designed
**Next Step:** Add to MECHANICS.md and implement in Discord bot
**Key Innovation:** Leader keeps async game alive WITHOUT controlling player agency

Ready to add this to your GDD?
