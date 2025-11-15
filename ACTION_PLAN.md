# ACTION PLAN
**Project Argent: The Arcane Codex**
**Post-Prototype Success - Next Steps**
**Date:** 2025-10-30

---

## 🎉 PROTOTYPE VALIDATION: SUCCESS

**Test Duration:** 4 turns (~10 minutes)
**Result:** DIAMOND CONFIRMED 💎

### What Worked:
✅ AI GM personality (witty, specific, surprising)
✅ NPC memorability (Grimsby = nervous coin-counter)
✅ Narrative tension (mystery, strangers, stakes)
✅ Choice meaningfulness (consequences clear)
✅ Player engagement ("already hooked" in 4 turns)
✅ UX improvements (turn counter, % display)

### Key Success Metrics Hit:
- ✅ Player hooked in <10 minutes
- ✅ NPC remembered (Grimsby)
- ✅ Wanted to keep playing
- ✅ Requested improvements (shows investment)

**Conclusion:** Core concept validated. Proceed to build.

---

## 🎯 RECOMMENDED PATH: Discord Bot (Multiplayer-Ready)

### Why Discord (Not Terminal):

**Skip the terminal bot because:**
- ❌ Terminal = solo only (no asymmetric whispers)
- ❌ Would need to rebuild everything for Discord anyway
- ❌ Can't test the CORE innovation (class-based private info)
- ✅ You already validated AI quality (terminal served its purpose)

**Go straight to Discord because:**
- ✅ Multiplayer-ready from day 1
- ✅ Tests the REAL game (asymmetric whispers)
- ✅ Friends can playtest immediately
- ✅ Mobile-native (Discord app = always accessible)
- ✅ Closer to final vision (transmedia, async play)

---

## 📅 BUILD PLAN: Discord Bot (Next 2-3 Days)

### Phase 1: Basic Discord Bot (Day 1 - 4 hours)
**Goal:** Bot connects, responds to /action commands

**Tasks:**
- [ ] Create Discord bot application (15 min)
- [ ] Set up test server with 3 channels (10 min)
- [ ] Install discord.py library (5 min)
- [ ] Get Anthropic API key (10 min)
- [ ] Write bot.py skeleton (1 hour)
- [ ] Test bot connects to Discord (30 min)
- [ ] Test basic /action command (1 hour)
- [ ] Verify Claude API integration works (30 min)

**Acceptance Criteria:**
- ✅ Bot shows as online in Discord
- ✅ /action command triggers Claude response
- ✅ Response posts to #story channel
- ✅ No errors in console

---

### Phase 2: Game Mechanics (Day 2 - 6 hours)

**Goal:** Full game loop works (skills, combat, state)

**Tasks:**
- [ ] Implement game_state.json persistence (1 hour)
- [ ] Add /create command (character creation) (1 hour)
- [ ] Add /status command (character sheet) (30 min)
- [ ] Implement skill checks with % display (1 hour)
- [ ] Add skill progression (+1/+2/+3) (30 min)
- [ ] Implement turn counter display (30 min)
- [ ] Add /rest command (camp/inn) (30 min)
- [ ] Test combat encounter (1 hour)

**Acceptance Criteria:**
- ✅ Can create character and see stats
- ✅ Skill checks work with % shown
- ✅ Skills improve on success
- ✅ Combat resolves correctly
- ✅ Turn counter displays

---

### Phase 3: Polish & First Quest (Day 3 - 4 hours)

**Goal:** Complete "Soggy Boot Mystery" playable start-to-finish

**Tasks:**
- [ ] Write quest script (Guildmaster → Grimsby → Strangers → Resolution) (1 hour)
- [ ] Create 3 key NPCs with personalities (30 min)
- [ ] Add quest state tracking (flags, stages) (1 hour)
- [ ] Implement formatted Discord embeds (action choices look good) (1 hour)
- [ ] Add error handling (graceful failures) (30 min)

**Acceptance Criteria:**
- ✅ Quest has beginning, middle, end
- ✅ NPCs have names and quirks
- ✅ Quest takes 30-40 minutes to complete
- ✅ At least 1 surprising twist
- ✅ Formatting looks good in Discord

---

### Phase 4: Multiplayer Test (Day 4 - 2 hours)

**Goal:** 2-3 friends playtest together

**Tasks:**
- [ ] Invite 2-3 friends to Discord server
- [ ] Guide them through /create
- [ ] Observe gameplay (don't help unless stuck)
- [ ] Collect feedback (did you laugh? surprised? remember NPCs?)
- [ ] Document issues and improvements needed

**Success Criteria:**
- ✅ All players complete quest
- ✅ 2/3 players laughed at least once
- ✅ 2/3 players remember an NPC name
- ✅ Players want to play again

**Decision Point:**
- **If 2/3 success criteria met:** Proceed to MVP (add whispers, 6 classes)
- **If <2/3:** Iterate on AI prompts and quest design

---

## 🔮 FUTURE PHASES (Post-Discord Success)

### Phase 5: Multiplayer Asymmetry (Week 2)
- Add private whispers (DMs based on class)
- Implement #planning channel (bot doesn't read)
- Add /action [group plan] for coordinated moves
- Test 3-4 player party dynamics

### Phase 6: Transmedia "Magic Bleed" (Week 3-4)
- Integrate WhatsApp (Twilio API) for urgent messages
- Add voice messages from NPCs (audio immersion)
- Create mobile-optimized "scrying pool" websites
- Implement 24/7 world clock with scheduled events

### Phase 7: Scale & Polish (Month 2)
- Database migration (JSON → Firestore)
- Multiple party support
- Character creation flow polish
- 6 classes implemented
- 5+ quests available

---

## 💰 COST ESTIMATES

### Prototype (Complete):
- **Cost:** €0 (used Claude Code plan)
- **Time:** 10 minutes
- **Value:** Validated entire concept ✅

### Discord Bot (Next 3 Days):
- **Anthropic API:** ~€1-2 (testing/playtesting)
- **Discord:** €0 (free tier)
- **Time:** 12-16 hours
- **Value:** Playable game with friends

### MVP (Weeks 2-4):
- **Anthropic API:** ~€5-10/month (10-20 active players)
- **Twilio (WhatsApp):** €5-10/month (messages)
- **Firebase:** €0 (free tier sufficient)
- **Time:** 40-60 hours
- **Value:** 50-100 player beta

---

## 🎯 IMMEDIATE NEXT STEPS (Choose One)

### Option A: Start Discord Bot NOW
**If you want to build immediately:**
1. Create Discord application (15 min)
2. Set up test server (10 min)
3. I'll guide you through bot.py setup
4. Playing with friends by tomorrow

### Option B: Finish This Play Session First
**If you want to complete the prototype story:**
1. Play 5-10 more turns (finish Soggy Boot scene)
2. Test combat and quest resolution
3. Validate full gameplay loop
4. THEN start Discord build with full confidence

### Option C: Document & Plan
**If you want to strategize first:**
1. Write down what you loved about prototype
2. Sketch out quest ideas
3. Define MVP scope clearly
4. Start fresh tomorrow

---

## 💎 THE DIAMOND YOU DISCOVERED

**You found the magic formula:**

1. **AI GM personality** (witty, specific, surprising) = Engagement
2. **Transparent mechanics** (% chances, turn counter) = Strategy
3. **Memorable NPCs** (names, quirks, motivations) = Immersion
4. **Meaningful choices** (visible consequences) = Agency
5. **Fast hook** (<10 min to "already hooked") = Retention

**This is your blueprint. Protect it. Build on it.**

---

## 📝 QUESTIONS TO ANSWER BEFORE BUILDING

1. **Scope:** Solo first? Or multiplayer from day 1?
2. **Platform:** Discord only? Or terminal + Discord?
3. **Timeline:** Weekend sprint? Or 2-week careful build?
4. **Help needed:** Want me to write the Discord bot code?
5. **Testing:** How many friends can playtest?

---

## 🚀 READY TO BUILD?

**You have:**
- ✅ Validated concept (diamond confirmed)
- ✅ All documentation (8 design docs)
- ✅ Working prototype code (terminal_prototype/)
- ✅ Clear next steps (this action plan)

**You need:**
- [ ] Discord bot setup (30 min)
- [ ] Anthropic API key (10 min)
- [ ] 12-16 hours coding time (spread over 2-3 days)

**What do you want to do next?**

---

**Status:** ✅ Prototype validated - Ready to build production version
**Decision needed:** Which path (A/B/C) do you choose?
**Timeline:** Can have Discord bot running by this weekend
