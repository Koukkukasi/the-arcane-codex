# PROTOTYPE_PLAN.md
**Project Argent: The Arcane Codex**
**Prototype Build Roadmap**
**Current Version:** v0.1-prototype
**Last Updated:** 2025-10-30

---

## 📋 Overview

**Goal:** Build a functional prototype in 3-5 days to answer ONE critical question:

> **"Is the AI Dungeon Master entertaining enough to build a full game around?"**

**Success Criteria:**
- 3-4 playtesters can complete a 30-minute quest
- Players laugh at least once
- Players are surprised by a twist
- Players remember an NPC's name
- Players want to play again tomorrow

**NOT testing:**
- Scalability (1000 players)
- Multiplayer asymmetry (that's v0.2)
- Transmedia features (WhatsApp, email)
- Perfect game balance

---

## 🎯 Prototype Scope

### What We're Building

**Minimum Viable Demo:**
- Discord bot in ONE test server
- 3 manually created channels (#story, #planning, #status)
- 3 commands: `/action`, `/status`, `/rest`
- Single-player experience (multiplayer in v0.2)
- Claude AI narration with personality
- Skill check system
- Simple combat
- 1 test quest (~30 min to complete)

### What We're NOT Building

- ❌ Multiplayer whispers (v0.2)
- ❌ Persistent database (using JSON file)
- ❌ Character creation flow (hardcode 1 character)
- ❌ Complex inventory system (basic list)
- ❌ WhatsApp/Email integration
- ❌ Background events
- ❌ Multiple parties

---

## 📅 5-Day Sprint Plan

### **Day 1: Foundation (4-6 hours)**

**Goal:** Bot connects to Discord and responds to basic commands

#### Morning (2-3 hours)
- [ ] **Set up Discord bot**
  - Create application at https://discord.com/developers
  - Enable required intents (Message Content, Presence)
  - Get bot token
  - Invite bot to test server
  - Create 3 channels: #story, #planning, #status

- [ ] **Set up development environment**
  - Install Python 3.11+
  - Create virtual environment
  - Install dependencies: `discord.py`, `anthropic`
  - Create project structure (bot.py, config.json, etc.)

- [ ] **Get Claude API access**
  - Create Anthropic account
  - Get API key ($5 free credit)
  - Test basic API call

#### Afternoon (2-3 hours)
- [ ] **Build bot skeleton**
  - Bot connects to Discord
  - Responds to `/ping` command
  - Logs events (on_ready, on_message)

- [ ] **Create config system**
  - config.json with bot token, API key, channel IDs
  - Add to .gitignore

- [ ] **Test basic Claude integration**
  - Make simple API call
  - Print response to console
  - Verify structured output works

**Acceptance Criteria:**
- ✅ Bot shows as online in Discord
- ✅ `/ping` command returns "Pong!"
- ✅ Claude API returns a response when called from Python
- ✅ No errors in console

---

### **Day 2: Core Game Loop (6-8 hours)**

**Goal:** Players can take actions and get narrated responses

#### Morning (3-4 hours)
- [ ] **Implement game state**
  - Create initial game_state.json structure
  - Single hardcoded player (Mage class)
  - Basic stats: HP, Mana, skills
  - Simple inventory: ["staff", "health_potion", "torch"]

- [ ] **Build `/action` command**
  - Parse player input
  - Load game state from JSON
  - Build prompt for Claude
  - Call Claude API
  - Parse response
  - Post narration to #story channel

- [ ] **Implement skill check system**
  - `skill_check(skill, difficulty)` function
  - Random roll (1-100)
  - Success threshold calculation
  - Return (success, roll, threshold)

#### Afternoon (3-4 hours)
- [ ] **Connect Claude to mechanics**
  - Claude receives game state in prompt
  - Claude returns structured JSON response:
    ```json
    {
      "narration": "You see...",
      "actions": [
        {"id": 1, "description": "...", "skill": "perception", "difficulty": 20}
      ],
      "state_updates": {"hp": 60}
    }
    ```
  - Bot parses JSON and applies state updates
  - Save updated game_state.json

- [ ] **Format action choices**
  - Display 3-4 options with emojis
  - Show difficulty indicators (🟢🟡🔴)
  - Calculate success chance from player skills

- [ ] **Test full loop**
  - `/action I search the room`
  - Bot narrates result
  - Presents new choices
  - Player can chain actions

**Acceptance Criteria:**
- ✅ Player can type `/action <text>` and get a response
- ✅ Claude generates contextual action choices
- ✅ Skill checks work (success/failure based on math)
- ✅ Game state persists between actions
- ✅ Can play 5+ actions in a row without errors

---

### **Day 3: Combat & Character (6-8 hours)**

**Goal:** Combat works and `/status` command shows stats

#### Morning (3-4 hours)
- [ ] **Implement `/status` command**
  - Shows HP, Mana, Stamina
  - Lists top 5 skills
  - Shows inventory
  - Formatted Discord embed (looks nice)

- [ ] **Add skill progression**
  - Skills increase on successful checks
  - +1 easy, +2 moderate, +3 hard
  - Update game state after each success

- [ ] **Implement `/rest` command**
  - Camp: restore 30% HP/Mana/Stamina
  - Inn: restore 100% (costs gold)
  - Remove status effects

#### Afternoon (3-4 hours)
- [ ] **Build combat system**
  - Combat state in game_state.json
  - Enemy data structure: {name, hp, damage, description}
  - Combat-specific action choices
  - Damage calculation: `10 + (skill / 10)`
  - Enemy turn (auto-resolves after player)

- [ ] **Implement status effects**
  - Poisoned: -5 HP/turn for 5 turns
  - Track in game_state
  - Display in `/status`
  - Process effects each turn

- [ ] **Add critical success/failure**
  - Roll 1-5 = critical success (+5 skill, bonus effect)
  - Roll 96-100 = critical failure (tool breaks, extra damage)

**Acceptance Criteria:**
- ✅ `/status` shows all player stats correctly
- ✅ Skills improve when used successfully
- ✅ Combat encounter works start-to-finish
- ✅ Player can defeat an enemy or flee
- ✅ Status effects apply and tick down
- ✅ `/rest` restores resources correctly

---

### **Day 4: AI Personality & Test Quest (6-8 hours)**

**Goal:** Claude narrates entertainingly + first complete quest playable

#### Morning (3-4 hours)
- [ ] **Refine Claude prompt (MOST IMPORTANT)**
  - Copy DM_SYSTEM_PROMPT from PROMPTS.md
  - Add anti-cliché rules
  - Add NPC personality instructions
  - Add example exchanges
  - Test different prompts and compare outputs

- [ ] **Test AI quality**
  - Generate 10 different scenes
  - Check for:
    - ✅ Specific details (not "dark tavern")
    - ✅ NPC names and quirks
    - ✅ Humor and personality
    - ✅ Surprising responses to creative actions
  - Iterate on prompt until satisfying

- [ ] **Implement Momentum system**
  - Track momentum points in game state
  - Award for creative actions
  - Spend for: reroll, hint, auto-succeed
  - Display in `/status`

#### Afternoon (3-4 hours)
- [ ] **Design test quest: "The Soggy Boot Mystery"**

  **Quest Structure:**

  **Act 1: The Hook (5-10 min)**
  - Start at The Soggy Boot tavern
  - Meet Guildmaster Thorne (grumpy, missing hand, wine-stained)
  - Quest: "Find my nephew. He was supposed to deliver a 'package.' He didn't."
  - Twist seed planted: "Don't open the package. I mean it."

  **Act 2: Investigation (10-15 min)**
  - 3 locations to explore:
    1. Warehouse District (find clues)
    2. Thieves' Guild contact (NPC with personality)
    3. Abandoned mill (combat encounter)
  - Clues point to: Nephew was smuggling weapons, not spices
  - Plot twist: Nephew is hiding because he discovered WHO he was smuggling FOR

  **Act 3: Resolution (5-10 min)**
  - Find nephew (he's terrified, not a villain)
  - Moral choice:
    - Turn him in (Guildmaster's wrath, but justice?)
    - Help him flee (make enemy of Guildmaster?)
    - Expose the REAL smuggler (harder, but "right"?)
  - No "correct" answer

- [ ] **Script key NPCs**
  - Guildmaster Thorne: Grumpy, pragmatic, wine-dependent
  - Grimsby (Thieves' contact): Nervous, counts on fingers, fears Guild
  - Nephew (Marcus): Young, scared, in over his head
  - "The Package Buyer": Mysterious, appears if players investigate deeply

- [ ] **Add quest to game state**
  - Track quest stages: 0=not_started, 1=investigating, 2=found_nephew, 3=resolved
  - World flags: {warehouse_searched, grimsby_met, nephew_location_known}

**Acceptance Criteria:**
- ✅ Quest has a beginning, middle, and end
- ✅ NPCs have memorable names and quirks
- ✅ At least 1 surprising twist
- ✅ Moral choice at the end (no obvious "right" answer)
- ✅ Takes 20-40 minutes to complete
- ✅ Claude narrates with personality throughout

---

### **Day 5: Polish & Playtest (4-6 hours)**

**Goal:** 3 people play the quest and provide feedback

#### Morning (2-3 hours)
- [ ] **Bug fixes**
  - Test all commands
  - Handle edge cases:
    - What if player types gibberish?
    - What if HP reaches 0?
    - What if they run out of money?
  - Add error messages

- [ ] **Add safety features**
  - Claude doesn't invent items
  - Can't soft-lock the game (every puzzle has 2+ solutions)
  - Hint system if player stuck 3x

- [ ] **Improve formatting**
  - Use Discord embeds for action choices
  - Add emojis for clarity
  - Color-code success chances (green/yellow/red)

#### Afternoon (2-3 hours)
- [ ] **Recruit 3 playtesters**
  - Friends who like RPGs or storytelling
  - Brief them: "This is a prototype, focus on fun factor"

- [ ] **Run playtest sessions**
  - Observe (don't help unless stuck)
  - Take notes on:
    - Where do they laugh?
    - Where do they seem confused?
    - What actions do they try?
    - Do they remember NPC names after?

- [ ] **Post-playtest survey**

  **Ask each player:**
  1. ❓ Did you laugh at least once? (Y/N + example)
  2. ❓ Were you surprised by something? (Y/N + what?)
  3. ❓ Do you remember any NPC's name? (Open answer)
  4. ❓ Did your choices feel meaningful? (1-5 scale)
  5. ❓ Would you play again tomorrow? (Y/N + why?)
  6. 💬 What was your favorite moment?
  7. 💬 What was frustrating or confusing?
  8. 💬 Other feedback?

**Acceptance Criteria:**
- ✅ 3 people complete the quest
- ✅ Average score: 4/5 questions answered positively
- ✅ At least 2 people remember an NPC's name
- ✅ At least 2 people want to play again

**Decision Point:**
- **If 4/5 success criteria met:** Proceed to MVP planning
- **If <4/5:** Iterate on AI prompts and quest design for another 2-3 days

---

## 🧪 Daily Testing Checklist

**Run these tests at the end of each day:**

### Functional Tests
- [ ] Bot connects to Discord
- [ ] `/action` command works
- [ ] `/status` shows correct data
- [ ] `/rest` restores resources
- [ ] Game state saves/loads correctly
- [ ] Claude API responds (no errors)
- [ ] Skill checks calculate correctly

### AI Quality Tests
- [ ] Descriptions are specific (not generic)
- [ ] NPCs have names
- [ ] Responses are entertaining
- [ ] Action choices are contextual
- [ ] Surprises exist (not predictable)

### Error Handling
- [ ] Doesn't crash on invalid input
- [ ] Handles missing game state gracefully
- [ ] API errors show helpful message
- [ ] Player can't break the game

---

## 💰 Budget Tracking

**Keep costs under $5 for prototype:**

| Item | Estimated Cost | Actual Cost |
|------|---------------|-------------|
| Claude API (50 actions) | $0.50 | $ |
| Discord bot hosting | $0 (local) | $ |
| Test accounts | $0 | $ |
| **Total** | **$0.50** | **$** |

**If costs exceed $5:** You're probably over-testing. Prototype is for validation, not perfection.

---

## 🔧 Troubleshooting Guide

### Common Issues

**Problem: Bot doesn't respond to commands**
- ✅ Check bot has "Message Content Intent" enabled
- ✅ Verify bot has "Send Messages" permission in channel
- ✅ Check console for errors
- ✅ Try `/ping` first to test basic connectivity

**Problem: Claude API returns errors**
- ✅ Verify API key is correct in config.json
- ✅ Check you have credits remaining (console.anthropic.com)
- ✅ Reduce max_tokens if hitting limits
- ✅ Check prompt isn't exceeding context window

**Problem: JSON parsing fails**
- ✅ Claude sometimes returns markdown (```json ... ```)
- ✅ Strip code fences before json.loads()
- ✅ Add "respond ONLY with valid JSON" to prompt
- ✅ Check for trailing commas or syntax errors

**Problem: Game state corrupts**
- ✅ Add try/except around json.load()
- ✅ Keep backup: `game_state_backup.json`
- ✅ Validate structure before saving
- ✅ Use git to version control game state

**Problem: Actions feel repetitive**
- ✅ Refine Claude prompt (see PROMPTS.md)
- ✅ Add more variety to action templates
- ✅ Increase "temperature" parameter (0.7-0.9)
- ✅ Provide more context in prompts

---

## 📊 Success Metrics Dashboard

**Track these throughout the sprint:**

### Technical Metrics
- [ ] Commands working: ___ / 3 (action, status, rest)
- [ ] Test coverage: ___ / 10 scenarios
- [ ] Bugs found: ___
- [ ] Bugs fixed: ___
- [ ] API calls made: ___
- [ ] Total cost: $___

### Quality Metrics
- [ ] NPCs created: ___ (target: 3+)
- [ ] Unique locations: ___ (target: 4+)
- [ ] Surprising moments: ___ (target: 2+)
- [ ] Playtest sessions: ___ / 3
- [ ] Players who laughed: ___ / 3
- [ ] Players who'd replay: ___ / 3

**Goal: 80%+ on both technical and quality metrics**

---

## 🚀 Next Steps After Prototype

### If Prototype Succeeds (4/5 criteria met):

**Week 2-3: MVP Planning**
1. Design multiplayer asymmetry system
2. Plan Firestore database schema
3. Create 3 more character classes
4. Design 3 full quests
5. Set up production Discord server

**Week 4-6: MVP Build**
1. Migrate to cloud database
2. Implement whisper system
3. Add character creation flow
4. Build 6-class system
5. Recruit 10-15 alpha testers

### If Prototype Fails (<4/5 criteria):

**Iterate on AI personality:**
1. A/B test different Claude prompts
2. Study what DID work vs. what didn't
3. Reduce scope (maybe remove combat, focus on story)
4. Test with different AI models
5. Consider pivot: maybe this is a single-player experience?

**Pivot options:**
- Make it a "Choose Your Own Adventure" book generator
- Focus on NPC conversations (dating sim-style?)
- Turn it into a writing assistant for DMs
- Simplify to chatbot-style game

---

## 📋 Final Checklist Before Launch

**Before inviting playtesters:**

### Technical
- [ ] Bot runs without errors for 1 hour straight
- [ ] All 3 commands work
- [ ] Game state persists across bot restarts
- [ ] No API errors in last 10 actions
- [ ] config.json is NOT committed to git

### Content
- [ ] Test quest is complete (beginning/middle/end)
- [ ] 3+ NPCs with names and quirks
- [ ] At least 1 surprising twist
- [ ] Moral choice at the end
- [ ] Quest takes 20-40 minutes

### Quality
- [ ] Claude responses are entertaining (test 10 actions)
- [ ] No generic fantasy descriptions
- [ ] NPCs have personality
- [ ] Action choices are contextual
- [ ] Failures are interesting, not punishing

### User Experience
- [ ] Clear instructions in #planning channel
- [ ] Error messages are helpful
- [ ] Formatting is readable
- [ ] Response time < 5 seconds per action
- [ ] Players know what to do next

---

## 📝 Daily Log Template

**Use this to track progress:**

### Day X: [Date]

**Time worked:** ___ hours

**Completed:**
- [ ] Task 1
- [ ] Task 2

**Blockers:**
- Issue 1: [Description + how resolved]

**Discoveries:**
- Learning 1: [What you learned]

**Tomorrow's priority:**
- [ ] Next task

**Mood:** 😀 😐 😞 (circle one)

---

## 🎉 Definition of Done

**The prototype is DONE when:**

✅ All Day 1-5 tasks are checked off
✅ 3 playtesters have completed the quest
✅ 4/5 success criteria are met:
  1. Players laughed
  2. Players surprised
  3. Players remember NPC names
  4. Choices felt meaningful
  5. Players want more

✅ You have data to answer: **"Is the AI DM entertaining?"**

**If YES:** Write up findings and proceed to MVP planning
**If NO:** Analyze what didn't work and iterate or pivot

---

## 📝 Changelog

### v0.1-prototype-plan (2025-10-30)
- 5-day sprint plan created
- Focus on validating AI entertainment value
- Minimum viable scope defined
- Success criteria established
- Test quest designed ("The Soggy Boot Mystery")
- Daily tasks broken down with hour estimates
- Playtest survey created

---

## 🔗 Related Documents
- **MECHANICS.md** - Game rules to implement
- **PROMPTS.md** - Claude personality to use
- **TECH_STACK.md** - How to build it
- **VISION.md** - What comes after if this works

---

**Status:** ✅ Ready to execute
**Start Date:** [Fill in when you begin]
**Target Completion:** [Start date + 5 days]
**Actual Completion:** [Fill in when done]
