# PROJECT CONTEXT VERIFICATION CHECKLIST

**Run this every time Claude finishes working on the project**

## ✅ Core Innovation Check

- [ ] **Asymmetric Whispers**: Players receive DIFFERENT private information about same situation
- [ ] **Dynamic Generation**: NO hardcoded scenarios - everything AI-generated and unique
- [ ] **Moral Dilemmas**: Every choice has consequences, no "perfect" solution
- [ ] **NPC Agency**: NPCs act based on approval/trust/fatal flaws, can betray
- [ ] **Divine Council**: 7 gods vote on player actions with different values

## ✅ GDD Compliance Check

Read these files to verify implementation matches design:
- [ ] `C:\Users\ilmiv\ProjectArgent\QUEST_SCENARIOS.md` - Scenario patterns followed?
- [ ] `C:\Users\ilmiv\ProjectArgent\AI_GM_SPECIFICATION.md` - AI GM rules implemented?
- [ ] `C:\Users\ilmiv\ProjectArgent\AI_GM_ENHANCEMENTS.md` - Enhanced features present?
- [ ] `C:\Users\ilmiv\ProjectArgent\MECHANICS.md` - Game mechanics correct?

## ✅ File Structure Check

Verify these files exist and are up-to-date:
- [ ] `complete_game/arcane_codex_server.py` - Game engine
- [ ] `complete_game/discord_bot.py` - Discord bot integration
- [ ] `complete_game/ai_gm.py` - AI GM system (MUST be dynamic, not static)
- [ ] `complete_game/run_bot.py` - Bot launcher
- [ ] `complete_game/requirements.txt` - Dependencies list

## ✅ Anti-Static Verification

**CRITICAL**: Check these items to ensure nothing is hardcoded:

### ❌ FORBIDDEN (Static Content):
- [ ] Hardcoded scenario text (like "The Heist" with fixed dialogue)
- [ ] Predefined whisper content (must be generated dynamically)
- [ ] Static NPC dialogue (must adapt to approval/trust)
- [ ] Fixed Divine Council votes (must consider context)
- [ ] Repetitive environmental descriptions

### ✅ REQUIRED (Dynamic Content):
- [ ] Scenarios generated fresh each time using AI
- [ ] Whispers adapted to player classes dynamically
- [ ] NPC behavior changes based on approval/trust state
- [ ] Divine Council reasoning reflects actual player actions
- [ ] Environmental tactics vary by location type

## ✅ Bot Status Check

Run these commands to verify bot is working:

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game

# Check if bot is running
# Should see bot process in task list

# Check bot logs
python -c "print('Bot check commands here')"
```

## ✅ Game Flow Verification

Test this sequence:
1. [ ] `!begin` - Divine Interrogation starts (questions randomized per player)
2. [ ] Answer 10 questions - Class assigned based on answers
3. [ ] `!start` - Game begins with 2 players
4. [ ] `!auto_scenario` - **DYNAMIC scenario generated** (never same twice)
5. [ ] Players receive different whispers via DM
6. [ ] NPC behavior adapts to choices
7. [ ] `!auto_council` - Divine Council votes on action

## ✅ Integration Points Check

Verify these systems work together:
- [ ] Discord bot ↔ Game engine (arcane_codex_server.py)
- [ ] Game engine ↔ AI GM (ai_gm.py)
- [ ] AI GM ↔ Player state (trust, approval, divine favor)
- [ ] Divine Interrogation ↔ Character classes
- [ ] Whispers ↔ Player classes (Fighter sees tactics, Mage sees magic)

## ✅ Dependency Check

Run to verify all packages installed:
```bash
pip list | grep -E "discord|anthropic|flask"
```

Should show:
- [ ] discord.py (2.6.4+)
- [ ] flask (3.0.0+)
- [ ] flask-cors (4.0.0+)

## ✅ Innovation Preservation

Ask yourself these questions:
1. **Is every scenario unique?** (NO two playthroughs should see same quest)
2. **Do whispers create genuine dilemmas?** (Conflicting information that requires collaboration)
3. **Can NPCs betray?** (Low trust + low approval = countdown to betrayal)
4. **Do gods disagree?** (VALDRIS ≠ KAITHA in values)
5. **Are choices meaningful?** (Every path has consequences, no "reload game")

## ✅ Common Anti-Patterns to Avoid

**RED FLAGS** - If you see these, implementation is WRONG:

❌ **Static Scenario Library**:
```python
scenarios = {
    "heist": {"text": "Grimsby wants...", ...},
    "dragon": {"text": "You meet a dragon...", ...}
}
```
→ Should be: AI generates fresh scenarios every time

❌ **Hardcoded Whispers**:
```python
whisper_fighter = "The guards are professionals"
whisper_mage = "The medicine is cursed"
```
→ Should be: Generated based on situation context

❌ **Predetermined Outcomes**:
```python
if choice == "steal":
    result = "200 people die"
```
→ Should be: AI determines consequences based on full context

❌ **Static NPC Responses**:
```python
grimsby_dialogue = "Thank you for helping me"
```
→ Should be: NPC response adapts to approval rating

## ✅ Success Metrics

After implementation, verify:
- [ ] **Uniqueness Test**: Run 3 scenarios - all should be different
- [ ] **Whisper Test**: 2 players get different information about same situation
- [ ] **NPC Test**: NPC with approval 80 helps, NPC with approval 20 betrays
- [ ] **Divine Council Test**: Gods vote differently based on action context
- [ ] **Trust Test**: Sharing whispers increases trust, lying decreases it

## ✅ Final Verification Commands

Run these to ensure everything works:

```bash
# 1. Check bot is running
ps aux | grep python | grep discord_bot

# 2. Verify game state file exists
ls -la C:\Users\ilmiv\ProjectArgent\complete_game\game_state.json

# 3. Test bot connection (in Discord)
# Type: !status
# Should respond with party info

# 4. Test dynamic scenario generation (in Discord)
# Type: !auto_scenario
# Should generate UNIQUE scenario with asymmetric whispers
```

## ⚠️ CRITICAL: When to STOP Claude

**STOP ME if:**
1. I create hardcoded scenario libraries
2. I write static whisper content
3. I use predefined NPC dialogue
4. I suggest "template" quests that don't change
5. I focus on "basic RPG features" instead of innovations

**REMIND ME:**
- "Never do anything static"
- "Every scenario must be unique"
- "Follow the GDD patterns, not basic RPG conventions"

---

## 📋 Quick Context Refresh for Claude

When starting a new session, tell Claude:

> "This is The Arcane Codex project. Read:
> - C:\Users\ilmiv\ProjectArgent\QUEST_SCENARIOS.md
> - C:\Users\ilmiv\ProjectArgent\AI_GM_SPECIFICATION.md
> - C:\Users\ilmiv\ProjectArgent\AI_GM_ENHANCEMENTS.md
>
> CRITICAL RULES:
> 1. Never create static content
> 2. Everything must be AI-generated dynamically
> 3. Core innovation: Asymmetric whispers force collaboration
> 4. NPCs have fatal flaws and can betray
> 5. Every scenario must be unique"

---

**VERSION**: 1.0
**LAST UPDATED**: 2025-11-06
**PURPOSE**: Prevent Claude from losing context and reverting to generic RPG implementations
