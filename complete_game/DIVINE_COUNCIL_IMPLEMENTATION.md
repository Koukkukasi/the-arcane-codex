# Divine Council Voting System - Implementation Design
**Date**: 2025-11-15
**Status**: Design Phase
**Complexity**: High (Multi-week feature)
**Priority**: Post-MVP (After basic gameplay works)

---

## 📋 EXECUTIVE SUMMARY

**What**: 7 gods debate player actions and vote on divine interventions
**When**: 5-10 times per 100 turns (rare, meaningful moments)
**Innovation**: No other RPG has real-time god debates with coalition voting

**Specification**: 1,649 lines in `DIVINE_COUNCIL_SYSTEM.md`
**Estimated Implementation**: 2-3 weeks full-time
**Dependencies**: Backend integration, AI integration (Claude/MCP)

---

## 🎯 CORE MECHANICS

### **The 7 Gods**:
1. ⚖️ **VALDRIS** - Order/Justice (Gold)
2. 🔥 **KAITHA** - Chaos/Freedom (Red-orange)
3. 💀 **MORVANE** - Survival/Pragmatism (Purple)
4. 🌿 **SYLARA** - Nature/Balance (Green)
5. ⚔️ **KORVAN** - War/Honor (Crimson)
6. 📚 **ATHENA** - Wisdom/Knowledge (Blue)
7. 💰 **MERCUS** - Commerce/Wealth (Gold)

### **Favor Tracking** (-100 to +100 per god):
```
-100 to -50: CURSED (active punishment)
 -49 to -20: OPPOSED (disfavor, penalties)
 -19 to +19: NEUTRAL (no special treatment)
 +20 to +49: APPROVED (minor blessings)
 +50 to +69: FAVORED (significant blessings)
 +70 to +89: CHAMPION (powerful gifts)
 +90 to +100: CHOSEN (legendary status)
```

### **Vote Outcomes**:
- **Unanimous (7-0)**: Most powerful intervention
- **Strong Majority (5-2 or 6-1)**: Significant blessing/curse
- **Narrow Majority (4-3)**: Contested, moderate effect
- **Tied (3-3-1)**: God who abstained decides

---

## 🗄️ DATABASE SCHEMA

### **1. Divine Favor Table**
```sql
CREATE TABLE divine_favor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    god_name TEXT NOT NULL,
    favor_amount INTEGER DEFAULT 0,  -- -100 to +100
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, game_id, god_name)
);
```

### **2. Divine Council Votes Table**
```sql
CREATE TABLE divine_council_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    turn_number INTEGER NOT NULL,
    trigger_event TEXT NOT NULL,  -- What caused the vote
    player_id TEXT NOT NULL,
    vote_result TEXT NOT NULL,  -- "7-0", "5-2", "4-3", etc.
    outcome TEXT NOT NULL,  -- "blessing", "curse", "neutral"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. God Speeches Table**
```sql
CREATE TABLE god_speeches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vote_id INTEGER NOT NULL,
    god_name TEXT NOT NULL,
    speech_text TEXT NOT NULL,
    vote_position TEXT NOT NULL,  -- "for", "against", "abstain"
    favor_change INTEGER DEFAULT 0,
    FOREIGN KEY (vote_id) REFERENCES divine_council_votes(id)
);
```

### **4. Divine Blessings/Curses Table**
```sql
CREATE TABLE divine_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    effect_type TEXT NOT NULL,  -- "blessing", "curse"
    god_name TEXT NOT NULL,
    effect_name TEXT NOT NULL,  -- "DIVINE CONCORDANCE", "OATHBREAKER'S MARK"
    effect_description TEXT,
    duration_turns INTEGER,  -- -1 for permanent
    turns_remaining INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

---

## 🧠 IMPLEMENTATION ARCHITECTURE

### **Module Structure**:

```
complete_game/
├── divine_council.py          # Main Divine Council logic
├── god_personalities.py       # God speech generation
├── voting_system.py           # Vote calculation & coalition logic
├── blessings_curses.py        # Effect catalog & application
└── trigger_detection.py       # When to convene council
```

---

## 📄 FILE: `divine_council.py`

### **Core Class**:

```python
class DivineCouncil:
    """
    Manages the 7-god voting system for The Arcane Codex
    """

    def __init__(self, db: ArcaneDatabase, ai_client=None):
        self.db = db
        self.ai_client = ai_client  # For generating speeches
        self.gods = self._initialize_gods()

    def _initialize_gods(self) -> List[God]:
        """Initialize 7 gods with personalities"""
        return [
            God(
                name="VALDRIS",
                domain="Order/Justice",
                color="#d4af37",
                personality="Stern judge, values consistency over mercy",
                favors=["keeping promises", "upholding law", "protecting innocents"],
                opposes=["oath-breaking", "chaos", "anarchy"]
            ),
            # ... 6 more gods
        ]

    def should_convene(self, game_state: GameState, player_action: str) -> bool:
        """
        Determine if gods should debate this action

        Triggers:
        1. Sacred oaths
        2. Forbidden acts
        3. Legendary achievements
        4. Divine threshold (±70 favor)
        5. Life-or-death moments
        6. Random (5% at turns 20, 40, 60, 80)

        Returns: True if gods should convene (5-10 times per 100 turns)
        """
        # SACRED OATHS
        if "oath" in player_action.lower() or "swear" in player_action.lower():
            return True

        # FORBIDDEN ACTS
        forbidden_keywords = ["forbidden magic", "murder innocent", "betray"]
        if any(kw in player_action.lower() for kw in forbidden_keywords):
            return True

        # LEGENDARY ACHIEVEMENTS
        if hasattr(game_state, 'recent_achievement') and game_state.recent_achievement == "legendary":
            return True

        # DIVINE THRESHOLD
        for god in self.gods:
            favor = self.get_favor(game_state.player_id, god.name)
            if abs(favor) >= 70:
                return True

        # LIFE-OR-DEATH
        if game_state.player_hp <= 10 and game_state.in_combat:
            return True

        # RANDOM DIVINE ATTENTION (5% at milestone turns)
        if game_state.turn % 20 == 0 and random.random() < 0.05:
            return True

        return False

    def convene_council(self, game_state: GameState, trigger_event: str) -> DivineVote:
        """
        Convene divine council and generate vote

        Steps:
        1. Generate god speeches (for/against)
        2. Calculate votes based on favor + event alignment
        3. Determine outcome (blessing/curse/neutral)
        4. Apply effects
        5. Update favor
        6. Save to database
        7. Return vote result for UI display
        """
        player_id = game_state.player_id
        game_id = game_state.game_id

        # 1. Generate speeches
        speeches = self._generate_speeches(player_id, trigger_event)

        # 2. Calculate votes
        votes = self._calculate_votes(player_id, trigger_event, speeches)

        # 3. Determine outcome
        vote_result = self._count_votes(votes)  # e.g., "5-2"
        outcome = self._determine_outcome(vote_result, votes)

        # 4. Apply effects
        effect = self._apply_outcome(player_id, outcome, vote_result)

        # 5. Update favor
        self._update_favor(player_id, speeches)

        # 6. Save to database
        vote_id = self._save_vote(game_id, game_state.turn, trigger_event, player_id, vote_result, outcome)
        self._save_speeches(vote_id, speeches)
        if effect:
            self._save_effect(player_id, effect)

        # 7. Return result
        return DivineVote(
            vote_result=vote_result,
            outcome=outcome,
            speeches=speeches,
            effect=effect,
            favor_changes=self._extract_favor_changes(speeches)
        )

    def _generate_speeches(self, player_id: str, trigger_event: str) -> List[GodSpeech]:
        """
        Generate god speeches using AI or templates

        Returns: List of speeches (one per god)
        """
        speeches = []

        for god in self.gods:
            favor = self.get_favor(player_id, god.name)
            alignment = self._calculate_alignment(god, trigger_event)

            # Determine vote position
            if alignment > 30 or favor > 50:
                position = "for"
            elif alignment < -30 or favor < -50:
                position = "against"
            else:
                position = "abstain"

            # Generate speech text
            if self.ai_client:
                speech_text = self._generate_ai_speech(god, trigger_event, position, favor)
            else:
                speech_text = self._generate_template_speech(god, position)

            speeches.append(GodSpeech(
                god_name=god.name,
                speech_text=speech_text,
                vote_position=position,
                favor_change=self._calculate_favor_change(position, alignment)
            ))

        return speeches

    def _calculate_votes(self, player_id: str, trigger_event: str, speeches: List[GodSpeech]) -> Dict[str, str]:
        """
        Calculate how each god votes

        Returns: {"VALDRIS": "for", "KAITHA": "against", ...}
        """
        votes = {}

        for speech in speeches:
            votes[speech.god_name] = speech.vote_position

        return votes

    def _count_votes(self, votes: Dict[str, str]) -> str:
        """
        Count votes and return result format

        Returns: "7-0", "5-2", "4-3", etc.
        """
        for_count = sum(1 for v in votes.values() if v == "for")
        against_count = sum(1 for v in votes.values() if v == "against")

        return f"{for_count}-{against_count}"

    def _determine_outcome(self, vote_result: str, votes: Dict[str, str]) -> str:
        """
        Determine blessing, curse, or neutral based on vote

        Returns: "blessing", "curse", "neutral"
        """
        for_count, against_count = map(int, vote_result.split('-'))

        if for_count == 7:
            return "unanimous_blessing"
        elif against_count == 7:
            return "unanimous_curse"
        elif for_count >= 5:
            return "blessing"
        elif against_count >= 5:
            return "curse"
        else:
            return "neutral"

    def _apply_outcome(self, player_id: str, outcome: str, vote_result: str) -> Optional[DivineEffect]:
        """
        Apply blessing or curse to player

        Returns: DivineEffect object or None
        """
        if outcome == "unanimous_blessing":
            return DivineEffect(
                effect_type="blessing",
                god_name="ALL",
                effect_name="DIVINE CONCORDANCE",
                effect_description="All checks +15% for 20 turns, Free resurrection, Legend status",
                duration_turns=20
            )
        elif outcome == "blessing":
            return DivineEffect(
                effect_type="blessing",
                god_name="MAJORITY",
                effect_name="DIVINE FAVOR",
                effect_description="All checks +10% for 10 turns, NPC reactions +10",
                duration_turns=10
            )
        elif outcome == "curse":
            return DivineEffect(
                effect_type="curse",
                god_name="MAJORITY",
                effect_name="DIVINE DISFAVOR",
                effect_description="All checks -10% for 10 turns, NPC reactions -10",
                duration_turns=10
            )
        # For neutral or other outcomes
        return None

    def get_favor(self, player_id: str, god_name: str) -> int:
        """Get current favor with specific god"""
        with self.db.get_connection() as conn:
            result = conn.execute(
                "SELECT favor_amount FROM divine_favor WHERE player_id = ? AND god_name = ?",
                (player_id, god_name)
            ).fetchone()
            return result[0] if result else 0

    def update_favor(self, player_id: str, god_name: str, change: int):
        """Update favor with specific god (clamped to -100/+100)"""
        current = self.get_favor(player_id, god_name)
        new_favor = max(-100, min(100, current + change))

        with self.db.get_connection() as conn:
            conn.execute("""
                INSERT INTO divine_favor (player_id, god_name, favor_amount)
                VALUES (?, ?, ?)
                ON CONFLICT(player_id, god_name)
                DO UPDATE SET favor_amount = ?, last_updated = CURRENT_TIMESTAMP
            """, (player_id, god_name, new_favor, new_favor))
```

---

## 🎨 UI INTEGRATION

### **Frontend Display** (already in UI):

```javascript
// In arcane_codex_scenario_ui_enhanced.html
// God speech boxes already exist!

function showDivineCouncilResponse(voteData) {
    // voteData from /api/divine_council/vote endpoint

    // Animate god speeches appearing one by one
    const speechContainer = document.querySelector('.divine-speeches');
    speechContainer.innerHTML = '';

    voteData.speeches.forEach((speech, index) => {
        setTimeout(() => {
            const speechBox = createGodSpeechBox(speech);
            speechContainer.appendChild(speechBox);

            // Animate entrance
            setTimeout(() => {
                speechBox.classList.add('visible');
            }, 50);
        }, index * 300);  // Stagger by 300ms
    });

    // Show vote result after all speeches
    setTimeout(() => {
        showVoteResult(voteData.vote_result, voteData.outcome);
    }, voteData.speeches.length * 300 + 500);
}

function createGodSpeechBox(speech) {
    const box = document.createElement('div');
    box.className = 'god-speech';
    box.innerHTML = `
        <div class="god-icon">${getGodIcon(speech.god_name)}</div>
        <div class="god-name">${speech.god_name}</div>
        <div class="speech-text">${speech.speech_text}</div>
        <div class="vote-indicator ${speech.vote_position}">
            ${speech.vote_position === 'for' ? '✅' : speech.vote_position === 'against' ? '❌' : '⏸️'}
        </div>
    `;
    return box;
}
```

### **Backend API Endpoint**:

```python
# In web_game.py

@app.route('/api/divine_council/vote', methods=['POST'])
def divine_council_vote():
    """
    Trigger divine council vote

    Request: {"trigger_event": "Player swore oath to save village"}
    Response: {
        "vote_result": "5-2",
        "outcome": "blessing",
        "speeches": [
            {"god_name": "VALDRIS", "speech_text": "...", "vote_position": "for"},
            ...
        ],
        "effect": {
            "effect_name": "DIVINE FAVOR",
            "effect_description": "...",
            "duration_turns": 10
        },
        "favor_changes": {
            "VALDRIS": +15,
            "KAITHA": +10,
            ...
        }
    }
    """
    data = request.json
    trigger_event = data.get('trigger_event')

    player_id = session.get('player_id')
    game_code = session.get('game_code')
    game_session = get_game_session(game_code)

    # Initialize Divine Council
    council = DivineCouncil(db, ai_client=mcp_client if MCP_AVAILABLE else None)

    # Convene council
    vote = council.convene_council(game_session.game, trigger_event)

    return jsonify({
        'success': True,
        'vote_result': vote.vote_result,
        'outcome': vote.outcome,
        'speeches': [asdict(s) for s in vote.speeches],
        'effect': asdict(vote.effect) if vote.effect else None,
        'favor_changes': vote.favor_changes
    })
```

---

## 🎯 IMPLEMENTATION PHASES

### **Phase 1: Foundation** (Week 1)
- ✅ Create database schema
- ✅ Implement `divine_council.py` core class
- ✅ Implement god personalities
- ✅ Basic favor tracking
- ✅ Simple template-based speeches

### **Phase 2: Voting Logic** (Week 2)
- ✅ Implement trigger detection
- ✅ Implement vote calculation
- ✅ Implement coalition logic
- ✅ Implement blessing/curse catalog
- ✅ Effect application system

### **Phase 3: AI Integration** (Week 3)
- ✅ Connect to MCP/Claude for dynamic speeches
- ✅ Contextual speech generation
- ✅ Personality-driven debates
- ✅ Polish and balance

### **Phase 4: UI Polish** (Week 4)
- ✅ Animated god speeches
- ✅ Vote result animations
- ✅ Blessing/curse visual effects
- ✅ Favor tracking UI
- ✅ Testing & balancing

---

## 🧪 TESTING STRATEGY

### **Unit Tests**:
1. Favor tracking (-100 to +100 clamping)
2. Vote counting (all combinations)
3. Trigger detection (all conditions)
4. Effect application
5. Speech generation

### **Integration Tests**:
1. Full vote cycle (trigger → speeches → vote → effect)
2. Multiple concurrent players
3. Favor changes over time
4. Blessing/curse stacking

### **Gameplay Tests**:
1. Unanimous vote triggers
2. Narrow majority scenarios
3. God coalition formation
4. Curse removal quests
5. Champion/Chosen thresholds

---

## 📊 COMPLEXITY ANALYSIS

| Component | Complexity | Time Estimate |
|-----------|-----------|---------------|
| Database schema | Low | 2 hours |
| Core voting logic | Medium | 8 hours |
| God personalities | Medium | 6 hours |
| Trigger detection | Medium | 4 hours |
| Blessing/curse catalog | High | 12 hours |
| AI speech generation | High | 10 hours |
| UI integration | Medium | 8 hours |
| Testing & polish | Medium | 10 hours |
| **Total** | **High** | **60 hours (1.5 weeks)** |

---

## 🎯 DEPENDENCIES

**Required Before Starting**:
- ✅ Backend integration complete
- ✅ Game state management working
- ✅ AI/MCP integration functional

**Optional**:
- Character progression system (for favor-based unlocks)
- Quest system (for curse removal quests)
- Achievement system (for legendary triggers)

---

## 🚀 RECOMMENDATION

**Status**: **Design Complete - Ready for Implementation**

**Start When**:
- After backend integration (Task 1) is complete
- After basic gameplay loop works
- After multiplayer is stable

**Priority**: **High** (Core innovation feature)

**Timeline**: 2-3 weeks for full implementation

---

## 📝 NEXT STEPS

1. ✅ Review and approve this design
2. Create `divine_council.py` skeleton
3. Implement database schema
4. Build core voting logic
5. Add template speeches
6. Test with basic scenarios
7. Integrate AI speech generation
8. Polish UI animations
9. Comprehensive testing
10. Launch!

---

**This is the feature that makes The Arcane Codex revolutionary.**

**Let's build it. ⚡**
