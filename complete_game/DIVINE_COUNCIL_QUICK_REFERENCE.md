# Divine Council - Developer Quick Reference Card
**One-page cheat sheet for implementation**

---

## VOTE CALCULATION FORMULA

```python
# 1. Calculate vote weight
favor_multiplier = 1.0 + (favor / 200)  # Range: 0.5x to 2.0x
weighted_vote = base_vote * max(0.5, min(2.0, favor_multiplier))

# 2. Determine god's vote
alignment = calculate_action_alignment(god, action, context)
vote_tendency = alignment + (favor * 0.3)

if vote_tendency >= 30: return 1     # Support
elif vote_tendency <= -30: return -1  # Oppose
else: return 0 or check_abstain()    # Abstain or lean

# 3. Calculate outcome
total_score = sum(weighted_votes)     # Range: -14 to +14

if score >= 5.0: "STRONG_SUPPORT"
elif score >= 2.0: "NARROW_SUPPORT"
elif score > -2.0: "DEADLOCK"
elif score > -5.0: "NARROW_OPPOSITION"
else: "STRONG_OPPOSITION"

# Special: all 7 support = "UNANIMOUS_BLESSING"
# Special: all 7 oppose = "UNANIMOUS_CURSE"
```

---

## GOD PERSONALITIES AT A GLANCE

| God | Domain | Loves | Hates | Abstain % | Vote Style |
|-----|--------|-------|-------|-----------|------------|
| VALDRIS ⚖️ | Order | Oaths, law | Chaos, lying | 10% | Principled |
| KAITHA 🔥 | Chaos | Freedom, rebellion | Tyranny, rules | 5% | Passionate |
| MORVANE 💀 | Survival | Pragmatism, harsh truth | Idealism, waste | 15% | Calculated |
| SYLARA 🌿 | Nature | Balance, harmony | Destruction, poison | 25% | Patient |
| KORVAN ⚔️ | War | Honor, courage | Cowardice, pacifism | 8% | Direct |
| ATHENA 📚 | Wisdom | Knowledge, strategy | Ignorance, rashness | 20% | Analytical |
| MERCUS 💰 | Commerce | Profit, deals | Waste, charity | 12% | Transactional |

---

## CONSEQUENCE TIERS

| Outcome | Raw Votes | Weighted Score | Favor Change | Effect Duration | Bonus/Penalty |
|---------|-----------|----------------|--------------|-----------------|---------------|
| Unanimous Blessing | 7-0 | +14.0 | +20 all | 25 turns | +20% checks, 1 resurrection |
| Strong Support | 5-2 or 6-1 | +5.0 to +13.9 | +15 support | 15 turns | +12% checks, +15 NPC reactions |
| Narrow Support | 4-3 | +2.0 to +4.9 | +10 support | 8 turns | +6% checks |
| Deadlock | 3-3-1 or 4-2-1 | -1.9 to +1.9 | ±5 | 5 turns | Random events |
| Narrow Opposition | 3-4 | -4.9 to -2.0 | -10 oppose | 10 turns | -8% checks |
| Strong Opposition | 2-5 or 1-6 | -13.9 to -5.0 | -15 oppose | 15 turns | -15% checks, -20 NPC reactions |
| Unanimous Curse | 0-7 | -14.0 | -25 all | 30 turns | -25% checks, no divine magic |

---

## DATABASE SCHEMA

```sql
-- Divine Favor Tracking
CREATE TABLE divine_favor (
    player_id TEXT, god_name TEXT,
    favor_amount INTEGER DEFAULT 0,  -- -100 to +100
    UNIQUE(player_id, god_name)
);

-- Divine Council Votes
CREATE TABLE divine_councils (
    id INTEGER PRIMARY KEY,
    game_id TEXT, player_id TEXT, turn INTEGER,
    action_judged TEXT,
    votes JSON,              -- {god: {position, weight}}
    outcome TEXT,            -- "STRONG_SUPPORT", etc.
    weighted_score REAL,
    impact JSON              -- favor changes, effects
);

-- Divine Effects (Blessings/Curses)
CREATE TABLE divine_effects (
    id INTEGER PRIMARY KEY,
    player_id TEXT,
    effect_type TEXT,        -- "blessing", "curse"
    effect_name TEXT,
    mechanical_effects JSON,
    duration_turns INTEGER,
    turns_remaining INTEGER,
    is_active BOOLEAN
);
```

---

## API ENDPOINT

```python
# POST /api/divine_council/convene
# Request:
{
    "action": "Player broke oath to village elder",
    "context": {
        "involves_oath": true,
        "breaks_law": false
    }
}

# Response:
{
    "success": true,
    "votes": [
        {
            "god_name": "VALDRIS",
            "position": -1,
            "weight": 1.45,
            "reasoning": "Oaths are sacred..."
        },
        // ... 6 more gods
    ],
    "outcome": {
        "type": "NARROW_OPPOSITION",
        "raw_count": [2, 4, 1],
        "weighted_score": -2.3
    },
    "consequences": {
        "favor_changes": {"VALDRIS": -10, ...},
        "applied_effects": [{...}]
    }
}
```

---

## FRONTEND ANIMATION SEQUENCE

```javascript
// 30-second dramatic reveal
1. showConveneAnimation()     // 2s - Divine symbols appear
2. showAction(action)          // 3s - Display action
3. revealVotes(votes)          // 10.5s - Sequential reveals (1.5s each)
4. showOutcome(outcome)        // 4s - Outcome title
5. showConsequences(effects)   // 5s - Favor changes + effects
6. waitForContinue()           // ∞ - Player clicks Continue

// Speed up: Press SPACE to set animationSpeed = 200ms
// Skip: Press ESC to close immediately
```

---

## COLOR PALETTE

```css
/* Backgrounds */
--council-bg: linear-gradient(135deg, #1a0033, #0a0015);
--overlay: rgba(20, 0, 40, 0.8);

/* Outcomes */
--blessing: #FFD700;  /* Gold */
--curse: #DC143C;     /* Crimson */
--neutral: #9370DB;   /* Purple */

/* Vote Positions */
--support: #90EE90;   /* Light green */
--oppose: #FF6B6B;    /* Light red */
--abstain: #C0C0C0;   /* Silver */
```

---

## TRIGGER CONDITIONS

```python
# Always trigger council if:
- "oath" in action and player broke it
- "forbidden magic" used
- NPC with approval > 80 dies
- Any god favor reaches ±70
- Legendary achievement earned

# Sometimes trigger (50% chance) if:
- Player HP < 10 in combat
- Major betrayal occurred
- Sacred site desecrated

# Never trigger if:
- < 5 turns since last council
- Player in tutorial phase
- Game in cutscene mode
```

---

## TESTING COMMANDS

```python
# Backend unit tests
pytest divine_council/tests/test_voting_system.py

# Test specific god vote
>>> voting = VotingSystem(db, GOD_PERSONALITIES)
>>> vote = voting.determine_god_vote("VALDRIS", "broke oath", {}, 0)
-1  # Valdris opposes

# Test full council
>>> result = voting.convene_council("player1", "game1", "broke oath", {})
>>> result['outcome'].outcome
"NARROW_OPPOSITION"

# Frontend test
triggerDivineCouncil("Test action", {involves_oath: true})
```

---

## BALANCE KNOBS

```python
# Tune these for difficulty
FAVOR_GAINS = {
    "council_support": 10,    # Increase to reward favor faster
    "council_oppose": -15,    # Decrease to punish less harshly
    "unanimous": 20           # Rare event bonus
}

EFFECT_STRENGTHS = {
    "blessing_bonus": 12,     # % bonus to checks
    "curse_penalty": -15,     # % penalty to checks
    "duration_multiplier": 1  # Multiply all durations
}

VOTE_FREQUENCY = {
    "min_gap": 5,             # Turns between councils
    "max_per_100": 12         # Max councils per game
}
```

---

## COMMON BUGS & FIXES

### Bug: Vote tally doesn't update
**Fix**: Check `updateTally()` is called after each vote reveal

### Bug: Favor changes don't persist
**Fix**: Ensure `update_divine_favor()` commits transaction

### Bug: Animations lag on mobile
**Fix**: Add `will-change: transform` to animated elements

### Bug: Gods always vote the same way
**Fix**: Add randomness to `abstain_likelihood` check

### Bug: Unanimous outcomes never trigger
**Fix**: Check raw vote count before weighted calculation

---

## PERFORMANCE TARGETS

- Vote calculation: < 50ms
- Database query: < 100ms
- Animation FPS: 60
- Total sequence: 30 seconds
- Memory usage: < 10MB
- API response: < 200ms

---

## FILE LOCATIONS

```
Key Files:
- divine_council/voting_system.py
- divine_council/god_personalities.py
- divine_council/consequence_engine.py
- static/js/divine_council_ui.js
- static/css/divine_council.css

Documentation:
- DIVINE_COUNCIL_VOTING_MECHANICS.md (complete design)
- DIVINE_COUNCIL_IMPLEMENTATION_GUIDE.md (code guide)
- DIVINE_COUNCIL_UI_REFERENCE.md (visual specs)
- PHASE_F_COMPLETE_SUMMARY.md (overview)
```

---

## PRIORITY ORDER

**Week 1**: Backend
1. Database tables
2. Voting logic
3. Favor tracking
4. Unit tests

**Week 2**: Consequences
5. Effect application
6. Speech generation
7. Integration

**Week 3**: Frontend
8. UI components
9. Animations
10. Mobile responsive

**Week 4**: Polish
11. Sound effects
12. Accessibility
13. Advanced features

---

## ONE-LINER CHEAT CODES

```python
# Get player's highest favor god
max(favor_dict, key=favor_dict.get)

# Check if council should trigger
any(abs(favor) >= 70 for favor in favor_dict.values())

# Calculate weighted outcome in one line
sum(vote * (1 + favor/200) for vote, favor in zip(votes, favors))

# Get god symbol
{"VALDRIS": "⚖️", "KAITHA": "🔥", ...}[god_name]

# Format favor change
f"{god}: {change:+d}"  # "VALDRIS: +15"
```

---

**Print this page and keep it next to your keyboard during development!**
