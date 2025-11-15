# Divine Council Voting Mechanics - Complete Design
**Phase F: Divine Council Implementation**
**Date**: 2025-11-15
**Status**: Design Complete - Ready for Implementation

---

## EXECUTIVE SUMMARY

This document provides the complete voting mechanics design for The Arcane Codex Divine Council system, where 7 gods vote on player actions with weighted influence based on divine favor.

**Key Innovation**: Unlike static approval systems, this creates dynamic god coalitions, dramatic vote reveals, and meaningful consequences that ripple through gameplay.

**Gods**: VALDRIS (Order), KAITHA (Chaos), MORVANE (Survival), SYLARA (Nature), KORVAN (War), ATHENA (Wisdom), MERCUS (Commerce) - 7 total (Note: DRAKMOR removed to maintain odd-number voting)

---

## 1. VOTING MECHANICS CORE DESIGN

### 1.1 Vote Options

Each god casts ONE vote per council session with THREE possible positions:

```python
VOTE_POSITIONS = {
    "SUPPORT": {
        "value": +1,
        "display": "✅ SUPPORT",
        "description": "The god approves this action"
    },
    "OPPOSE": {
        "value": -1,
        "display": "❌ OPPOSE",
        "description": "The god condemns this action"
    },
    "ABSTAIN": {
        "value": 0,
        "display": "⏸️ ABSTAIN",
        "description": "The god is conflicted or indifferent"
    }
}
```

**Why 3 options instead of binary?**
- Creates dramatic tension (abstentions can swing close votes)
- Reflects god personality complexity
- Enables "torn god" narratives
- Makes unanimous votes extremely rare and special

### 1.2 Vote Weight System

Divine favor affects vote INFLUENCE, not just the vote itself:

```python
def calculate_vote_weight(god_name: str, favor: int, base_vote: int) -> float:
    """
    Calculate weighted vote value based on divine favor

    Args:
        god_name: Which god is voting
        favor: Current favor (-100 to +100)
        base_vote: -1 (oppose), 0 (abstain), +1 (support)

    Returns:
        Weighted vote value (0.5 to 2.0 multiplier)
    """

    # Base weight starts at 1.0 (normal influence)
    base_weight = 1.0

    # Favor modifies weight (±50%)
    # -100 favor = 0.5x weight
    #    0 favor = 1.0x weight
    # +100 favor = 2.0x weight
    favor_multiplier = 1.0 + (favor / 200)

    # Clamp between 0.5 and 2.0
    weight = max(0.5, min(2.0, base_weight * favor_multiplier))

    # Apply to base vote
    weighted_vote = base_vote * weight

    return weighted_vote

# Examples:
# God with +80 favor voting SUPPORT: +1 * 1.4 = +1.4
# God with -60 favor voting OPPOSE: -1 * 0.7 = -0.7
# God with +100 favor voting OPPOSE: -1 * 2.0 = -2.0 (devastating)
# God with 0 favor abstaining: 0 * 1.0 = 0
```

**Key Insight**: A god with high favor has MORE influence whether they support OR oppose. This creates stakes - building favor with a god is powerful, but if you betray them later, their condemnation hits harder.

### 1.3 Vote Calculation Algorithm

```python
def calculate_council_outcome(votes: Dict[str, int], favor_levels: Dict[str, int]) -> Dict:
    """
    Calculate the weighted outcome of a Divine Council vote

    Args:
        votes: {god_name: vote_value} (-1, 0, +1)
        favor_levels: {god_name: favor} (-100 to +100)

    Returns:
        {
            'raw_count': (support_count, oppose_count, abstain_count),
            'weighted_score': float,
            'outcome': str,
            'margin': float,
            'decisive_gods': [god_names],
            'swing_gods': [god_names]
        }
    """

    # 1. Count raw votes
    raw_support = sum(1 for v in votes.values() if v == 1)
    raw_oppose = sum(1 for v in votes.values() if v == -1)
    raw_abstain = sum(1 for v in votes.values() if v == 0)

    # 2. Calculate weighted votes
    weighted_votes = {}
    total_score = 0

    for god_name, vote in votes.items():
        favor = favor_levels.get(god_name, 0)
        weighted = calculate_vote_weight(god_name, favor, vote)
        weighted_votes[god_name] = weighted
        total_score += weighted

    # 3. Determine outcome
    # Weighted score ranges from -14 (all oppose max favor) to +14 (all support max favor)
    # Thresholds:
    # >= +5.0: Strong Support
    # +2.0 to +4.9: Narrow Support
    # -1.9 to +1.9: Deadlock
    # -4.9 to -2.0: Narrow Opposition
    # <= -5.0: Strong Opposition

    if total_score >= 5.0:
        outcome = "STRONG_SUPPORT"
    elif total_score >= 2.0:
        outcome = "NARROW_SUPPORT"
    elif total_score > -2.0:
        outcome = "DEADLOCK"
    elif total_score > -5.0:
        outcome = "NARROW_OPPOSITION"
    else:
        outcome = "STRONG_OPPOSITION"

    # Special case: Unanimous raw votes
    if raw_support == 7:
        outcome = "UNANIMOUS_BLESSING"
    elif raw_oppose == 7:
        outcome = "UNANIMOUS_CURSE"

    # 4. Find decisive gods (highest weighted influence)
    sorted_weights = sorted(weighted_votes.items(), key=lambda x: abs(x[1]), reverse=True)
    decisive_gods = [god for god, weight in sorted_weights[:2]]  # Top 2 most influential

    # 5. Find swing gods (abstained with high favor)
    swing_gods = [
        god for god, vote in votes.items()
        if vote == 0 and abs(favor_levels.get(god, 0)) >= 50
    ]

    # 6. Calculate margin
    margin = abs(total_score)

    return {
        'raw_count': (raw_support, raw_oppose, raw_abstain),
        'weighted_score': total_score,
        'outcome': outcome,
        'margin': margin,
        'decisive_gods': decisive_gods,
        'swing_gods': swing_gods,
        'vote_breakdown': weighted_votes
    }
```

---

## 2. GOD PERSONALITY & VOTING PATTERNS

### 2.1 God Personality Matrix

Each god has intrinsic values that determine their base vote tendency:

```python
GOD_PERSONALITIES = {
    "VALDRIS": {
        "core_values": ["order", "law", "justice", "consistency", "oaths"],
        "opposed_to": ["chaos", "lawbreaking", "oath-breaking", "anarchy"],
        "voting_style": "principled",  # Rarely abstains
        "coalition_affinity": ["KORVAN", "ATHENA"],  # Often aligns with
        "coalition_rivalry": ["KAITHA", "MORVANE"],  # Often opposes
        "abstain_likelihood": 0.1,  # 10% chance to abstain when conflicted
        "speech_tone": "stern, formal, judicial"
    },

    "KAITHA": {
        "core_values": ["freedom", "chaos", "change", "rebellion", "individuality"],
        "opposed_to": ["tyranny", "conformity", "stagnation", "oppression"],
        "voting_style": "passionate",  # Strong opinions
        "coalition_affinity": ["DRAKMOR", "MERCUS"],
        "coalition_rivalry": ["VALDRIS", "KORVAN"],
        "abstain_likelihood": 0.05,  # Rarely abstains
        "speech_tone": "fiery, defiant, provocative"
    },

    "MORVANE": {
        "core_values": ["survival", "pragmatism", "harsh_truth", "efficiency"],
        "opposed_to": ["idealism", "waste", "sentiment", "weakness"],
        "voting_style": "calculated",  # Votes based on outcomes
        "coalition_affinity": ["MERCUS", "ATHENA"],
        "coalition_rivalry": ["SYLARA", "KORVAN"],
        "abstain_likelihood": 0.15,  # Abstains when outcome unclear
        "speech_tone": "cold, blunt, realistic"
    },

    "SYLARA": {
        "core_values": ["balance", "nature", "growth", "harmony", "cycles"],
        "opposed_to": ["corruption", "destruction", "imbalance", "poison"],
        "voting_style": "patient",  # Thinks long-term
        "coalition_affinity": ["ATHENA", "VALDRIS"],
        "coalition_rivalry": ["MORVANE", "KORVAN"],
        "abstain_likelihood": 0.25,  # Often abstains, prefers observation
        "speech_tone": "calm, measured, philosophical"
    },

    "KORVAN": {
        "core_values": ["honor", "courage", "strength", "glory", "combat"],
        "opposed_to": ["cowardice", "dishonor", "weakness", "pacifism"],
        "voting_style": "direct",  # Quick to judge
        "coalition_affinity": ["VALDRIS"],
        "coalition_rivalry": ["KAITHA", "SYLARA"],
        "abstain_likelihood": 0.08,  # Rarely abstains
        "speech_tone": "fierce, commanding, martial"
    },

    "ATHENA": {
        "core_values": ["wisdom", "knowledge", "strategy", "learning", "truth"],
        "opposed_to": ["ignorance", "recklessness", "destroying knowledge"],
        "voting_style": "analytical",  # Weighs all factors
        "coalition_affinity": ["VALDRIS", "SYLARA"],
        "coalition_rivalry": ["KAITHA", "KORVAN"],
        "abstain_likelihood": 0.20,  # Abstains when more info needed
        "speech_tone": "thoughtful, precise, scholarly"
    },

    "MERCUS": {
        "core_values": ["commerce", "wealth", "ambition", "negotiation", "value"],
        "opposed_to": ["waste", "destroying value", "foolish deals"],
        "voting_style": "transactional",  # What's the ROI?
        "coalition_affinity": ["MORVANE", "KAITHA"],
        "coalition_rivalry": ["VALDRIS", "SYLARA"],
        "abstain_likelihood": 0.12,  # Abstains when no clear profit/loss
        "speech_tone": "shrewd, persuasive, opportunistic"
    }
}
```

### 2.2 Action Alignment Calculator

```python
def calculate_action_alignment(god_name: str, action: str, context: Dict) -> int:
    """
    Calculate how aligned an action is with a god's values

    Returns: -100 (completely opposed) to +100 (perfectly aligned)
    """

    personality = GOD_PERSONALITIES[god_name]
    alignment_score = 0

    # Keyword matching
    action_lower = action.lower()

    # Check core values (positive alignment)
    for value in personality['core_values']:
        if value in action_lower:
            alignment_score += 20

    # Check opposed values (negative alignment)
    for opposed in personality['opposed_to']:
        if opposed in action_lower:
            alignment_score -= 25

    # Context modifiers
    if context.get('involves_oath') and god_name == "VALDRIS":
        alignment_score += 30

    if context.get('involves_combat') and god_name == "KORVAN":
        alignment_score += 25

    if context.get('involves_trade') and god_name == "MERCUS":
        alignment_score += 20

    if context.get('breaks_law') and god_name == "VALDRIS":
        alignment_score -= 40

    if context.get('restricts_freedom') and god_name == "KAITHA":
        alignment_score -= 35

    # Clamp to -100, +100
    return max(-100, min(100, alignment_score))
```

### 2.3 Vote Decision Logic

```python
def determine_god_vote(god_name: str, action: str, context: Dict, current_favor: int) -> int:
    """
    Determine how a god votes on an action

    Returns: -1 (oppose), 0 (abstain), +1 (support)
    """

    # 1. Calculate action alignment
    alignment = calculate_action_alignment(god_name, action, context)

    # 2. Factor in current favor
    # High favor makes gods more lenient, low favor makes them harsher
    favor_adjustment = current_favor * 0.3

    # Combined score
    vote_tendency = alignment + favor_adjustment

    # 3. Apply personality-based thresholds
    personality = GOD_PERSONALITIES[god_name]
    abstain_chance = personality['abstain_likelihood']

    # Determine vote
    if vote_tendency >= 30:
        # Strong support
        return 1
    elif vote_tendency <= -30:
        # Strong opposition
        return -1
    elif -10 <= vote_tendency <= 10:
        # Ambiguous zone - check abstain likelihood
        if random.random() < abstain_chance:
            return 0
        else:
            # Lean toward favor
            return 1 if current_favor > 0 else -1
    else:
        # Moderate zone
        if vote_tendency > 0:
            return 1
        else:
            return -1
```

---

## 3. CONSEQUENCE GENERATION

### 3.1 Consequence Tiers

```python
CONSEQUENCE_TIERS = {
    "UNANIMOUS_BLESSING": {
        "favor_change": {god: +20 for god in GOD_PERSONALITIES.keys()},
        "effects": [
            {
                "name": "Divine Concordance",
                "description": "The gods sing in perfect harmony. Your path is blessed.",
                "mechanical_effects": {
                    "all_checks": +20,  # +20% to all skill checks
                    "divine_interventions": 1,  # 1 free "undo death" token
                    "reputation": +50,  # Massive reputation boost
                    "duration_turns": 25
                }
            }
        ],
        "narrative_impact": "legendary",
        "rarity": "extremely_rare"  # < 1% of votes
    },

    "STRONG_SUPPORT": {
        "favor_change_formula": lambda votes: {
            god: +15 if vote == 1 else +5 if vote == 0 else -5
            for god, vote in votes.items()
        },
        "effects": [
            {
                "name": "Divine Favor",
                "description": "The gods approve your path. Their blessings flow through you.",
                "mechanical_effects": {
                    "all_checks": +12,
                    "npc_reactions": +15,
                    "heal": 30,  # Restore 30 HP
                    "duration_turns": 15
                }
            }
        ],
        "narrative_impact": "major_positive"
    },

    "NARROW_SUPPORT": {
        "favor_change_formula": lambda votes: {
            god: +10 if vote == 1 else 0 if vote == 0 else -8
            for god, vote in votes.items()
        },
        "effects": [
            {
                "name": "Contested Blessing",
                "description": "Some gods smile upon you, others frown. The balance is delicate.",
                "mechanical_effects": {
                    "all_checks": +6,
                    "npc_reactions": +5,
                    "duration_turns": 8
                }
            }
        ],
        "narrative_impact": "minor_positive"
    },

    "DEADLOCK": {
        "favor_change_formula": lambda votes: {
            god: +5 if vote == 1 else -5 if vote == -1 else 0
            for god, vote in votes.items()
        },
        "effects": [
            {
                "name": "Divine Schism",
                "description": "The gods war among themselves. Reality cracks.",
                "mechanical_effects": {
                    "random_events": True,  # Trigger unpredictable events
                    "reality_distortion": True,
                    "duration_turns": 5
                }
            }
        ],
        "narrative_impact": "chaotic_neutral",
        "special_mechanics": "reality_tears"
    },

    "NARROW_OPPOSITION": {
        "favor_change_formula": lambda votes: {
            god: +8 if vote == 1 else 0 if vote == 0 else -10
            for god, vote in votes.items()
        },
        "effects": [
            {
                "name": "Divine Disfavor",
                "description": "The gods are displeased. Their judgment weighs heavy.",
                "mechanical_effects": {
                    "all_checks": -8,
                    "npc_reactions": -10,
                    "duration_turns": 10
                }
            }
        ],
        "narrative_impact": "minor_negative"
    },

    "STRONG_OPPOSITION": {
        "favor_change_formula": lambda votes: {
            god: +5 if vote == 1 else -5 if vote == 0 else -15
            for god, vote in votes.items()
        },
        "effects": [
            {
                "name": "Divine Condemnation",
                "description": "The gods have judged you and found you wanting.",
                "mechanical_effects": {
                    "all_checks": -15,
                    "npc_reactions": -20,
                    "stamina_drain": 20,  # Lose 20 stamina
                    "duration_turns": 15
                }
            }
        ],
        "narrative_impact": "major_negative"
    },

    "UNANIMOUS_CURSE": {
        "favor_change": {god: -25 for god in GOD_PERSONALITIES.keys()},
        "effects": [
            {
                "name": "Divine Abandonment",
                "description": "All gods turn their faces from you. You walk alone in darkness.",
                "mechanical_effects": {
                    "all_checks": -25,
                    "no_divine_magic": True,
                    "max_hp_reduction": -30,
                    "npc_reactions": -50,
                    "duration_turns": 30
                }
            }
        ],
        "narrative_impact": "catastrophic",
        "rarity": "extremely_rare",  # < 1% of votes
        "quest_trigger": "redemption_arc"  # Triggers special quest to regain favor
    }
}
```

### 3.2 Consequence Application System

```python
def apply_council_consequences(game_id: str, player_id: str, outcome: Dict, votes: Dict) -> Dict:
    """
    Apply the consequences of a Divine Council vote

    Returns: Applied effects and narrative
    """

    consequence_tier = CONSEQUENCE_TIERS[outcome['outcome']]

    # 1. Calculate favor changes
    if 'favor_change' in consequence_tier:
        # Fixed favor changes (unanimous)
        favor_changes = consequence_tier['favor_change']
    else:
        # Dynamic favor changes based on votes
        favor_changes = consequence_tier['favor_change_formula'](votes)

    # 2. Apply favor changes to database
    for god, change in favor_changes.items():
        update_god_favor(player_id, god, change)

    # 3. Apply mechanical effects
    effects = consequence_tier['effects']
    applied_effects = []

    for effect in effects:
        effect_id = apply_divine_effect(
            player_id=player_id,
            effect_name=effect['name'],
            effect_data=effect['mechanical_effects'],
            duration=effect['mechanical_effects'].get('duration_turns', -1)
        )
        applied_effects.append({
            'id': effect_id,
            'name': effect['name'],
            'description': effect['description']
        })

    # 4. Generate narrative
    narrative = generate_consequence_narrative(
        outcome=outcome,
        votes=votes,
        favor_changes=favor_changes,
        effects=effects
    )

    # 5. Check for special mechanics
    if consequence_tier.get('quest_trigger'):
        trigger_redemption_quest(player_id, consequence_tier['quest_trigger'])

    if consequence_tier.get('special_mechanics') == 'reality_tears':
        trigger_reality_distortion_event(game_id)

    return {
        'favor_changes': favor_changes,
        'applied_effects': applied_effects,
        'narrative': narrative,
        'impact_level': consequence_tier['narrative_impact']
    }
```

---

## 4. VISUALIZATION & UI/UX FLOW

### 4.1 Voting Sequence Timeline

```
PHASE 1: COUNCIL CONVENES (2 seconds)
├── Screen dims
├── Divine symbols appear
└── "THE GODS CONVENE" title

PHASE 2: ACTION PRESENTED (3 seconds)
├── Display player action in golden frame
├── Show context (NPC testimonies if any)
└── Dramatic pause

PHASE 3: GOD SPEECHES (1.5 seconds each = 10.5 seconds total)
├── VALDRIS speaks (scales icon pulses)
├── KAITHA speaks (flames flicker)
├── MORVANE speaks (skull glows)
├── SYLARA speaks (leaves drift)
├── KORVAN speaks (swords clash)
├── ATHENA speaks (book pages turn)
└── MERCUS speaks (coins flip)

PHASE 4: VOTE REVEAL (0.8 seconds each = 5.6 seconds total)
├── Each god's vote appears in sequence
├── Running tally updates
├── Tension builds
└── Background changes color based on tally

PHASE 5: OUTCOME DECLARATION (4 seconds)
├── Final vote count displayed
├── Outcome title appears (BLESSED / CURSED / etc)
├── Screen flash effect
└── Sound effect (angelic / ominous)

PHASE 6: CONSEQUENCES (5 seconds)
├── Favor changes scroll
├── Blessings/curses appear
├── Mechanical effects listed
└── "Continue" button appears

TOTAL: ~30 seconds (dramatic but not tedious)
```

### 4.2 Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│                  THE DIVINE COUNCIL                     │
│                                                         │
│  ⚖️ VALDRIS    🔥 KAITHA    💀 MORVANE    🌿 SYLARA  │
│    [VOTE]       [VOTE]       [VOTE]        [VOTE]     │
│   Favor: +45   Favor: -30   Favor: +10   Favor: +60  │
│                                                         │
│  ⚔️ KORVAN    📚 ATHENA    💰 MERCUS                  │
│    [VOTE]       [VOTE]       [VOTE]                   │
│   Favor: +20   Favor: +35   Favor: -15               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                   THE ACTION JUDGED                     │
│                                                         │
│  "You swore an oath to save the village, then broke    │
│   that oath to pursue personal vengeance instead."     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    GODS SPEAK                           │
│                                                         │
│  ⚖️ VALDRIS: "Oaths are sacred. This betrayal cannot  │
│              stand unpunished."                         │
│              Vote: ❌ OPPOSE (Weight: 1.45x)           │
│                                                         │
│  🔥 KAITHA: "Vengeance burns hotter than duty. I       │
│             respect the choice."                        │
│             Vote: ✅ SUPPORT (Weight: 0.7x)            │
│                                                         │
│  [... other gods ...]                                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                   DIVINE VERDICT                        │
│                                                         │
│  Raw Count: 2 Support - 4 Oppose - 1 Abstain          │
│  Weighted Score: -6.2 / 14.0                           │
│                                                         │
│  ╔═══════════════════════════════════════════════╗    │
│  ║       ⚠️ STRONG OPPOSITION ⚠️                ║    │
│  ║   "The gods condemn your broken oath"         ║    │
│  ╚═══════════════════════════════════════════════╝    │
│                                                         │
│  CONSEQUENCES:                                          │
│  • Divine Condemnation (-15% all checks, 15 turns)    │
│  • VALDRIS: -15 favor                                  │
│  • KORVAN: -12 favor                                   │
│  • ATHENA: -10 favor                                   │
│  • KAITHA: +8 favor                                    │
│                                                         │
│              [ACCEPT JUDGMENT]                          │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Animation Details

```javascript
// Frontend animation sequence
async function displayDivineCouncilVote(voteData) {
    // Phase 1: Convene
    await fadeToBlack(500);
    await showTitle("THE GODS CONVENE", 2000);

    // Phase 2: Action
    await displayAction(voteData.action, voteData.context);
    await pause(3000);

    // Phase 3: Speeches (sequential with dramatic timing)
    for (let i = 0; i < voteData.speeches.length; i++) {
        const speech = voteData.speeches[i];

        // Show god icon pulsing
        await pulseGodIcon(speech.god_name);

        // Type out speech text
        await typewriterEffect(speech.speech_text, 80); // 80ms per char

        // Brief pause before next god
        await pause(500);
    }

    // Phase 4: Vote reveal (build tension)
    let runningScore = 0;
    for (let i = 0; i < voteData.votes.length; i++) {
        const vote = voteData.votes[i];

        // Show vote with animation
        await revealVote(vote.god, vote.position, vote.weight);

        // Update running tally
        runningScore += vote.weighted_value;
        updateTallyBar(runningScore);

        // Background color shifts based on current tally
        updateBackgroundTension(runningScore);

        await pause(800);
    }

    // Phase 5: Outcome (dramatic reveal)
    await hideAllVotes();
    await flashScreen(voteData.outcome.impact_level);
    await showOutcomeTitle(voteData.outcome.title);
    await playSound(voteData.outcome.sound);

    // Phase 6: Consequences
    await showFavorChanges(voteData.favor_changes);
    await showEffects(voteData.applied_effects);
    await showContinueButton();
}

// God icon pulse animations
function pulseGodIcon(godName) {
    const effects = {
        'VALDRIS': scalesPulse,
        'KAITHA': flameFlicker,
        'MORVANE': skullGlow,
        'SYLARA': leafFloat,
        'KORVAN': swordClash,
        'ATHENA': pageFlip,
        'MERCUS': coinFlip
    };

    return effects[godName]();
}

// Background tension system
function updateBackgroundTension(score) {
    // Score ranges from -14 to +14
    // Map to hue: -14 = deep red, 0 = neutral purple, +14 = radiant gold

    let hue;
    if (score >= 0) {
        // Blessing range: purple to gold
        hue = 270 + (score / 14) * 30; // 270° to 300° (purple to gold)
    } else {
        // Curse range: purple to red
        hue = 270 + (score / 14) * 30; // 270° to 240° (purple to red)
    }

    document.body.style.background = `linear-gradient(135deg,
        hsl(${hue}, 50%, 10%) 0%,
        hsl(${hue}, 30%, 5%) 100%)`;
}
```

### 4.4 Mobile-Optimized Layout

```
MOBILE (Portrait):
┌───────────────────┐
│  DIVINE COUNCIL   │
├───────────────────┤
│ ⚖️ VALDRIS (+45) │
│ [Speech...]       │
│ ✅ SUPPORT 1.45x  │
├───────────────────┤
│ 🔥 KAITHA (-30)  │
│ [Speech...]       │
│ ❌ OPPOSE 0.7x   │
├───────────────────┤
│ [...scrollable]   │
├───────────────────┤
│ VERDICT:          │
│ STRONG OPPOSITION │
│                   │
│ [Consequences]    │
│ [CONTINUE]        │
└───────────────────┘
```

---

## 5. IMPLEMENTATION PRIORITY ORDER

### Phase 1: Core Voting Logic (Week 1)
**Priority: CRITICAL**

```
✅ Task 1.1: Vote Weight Calculation
   - Implement calculate_vote_weight()
   - Unit tests for all favor levels
   - Edge case testing (-100, 0, +100 favor)

✅ Task 1.2: Vote Decision Logic
   - Implement determine_god_vote()
   - Implement calculate_action_alignment()
   - Test all god personalities

✅ Task 1.3: Outcome Calculation
   - Implement calculate_council_outcome()
   - Test all outcome tiers
   - Validate weighted scoring

✅ Task 1.4: Database Integration
   - Create divine_council_votes table
   - Create divine_effects table
   - Migration scripts
```

**Deliverable**: Working backend voting system with tests

---

### Phase 2: Consequence System (Week 1-2)
**Priority: HIGH**

```
✅ Task 2.1: Consequence Tier Implementation
   - Define all 7 consequence tiers
   - Implement favor change formulas
   - Create effect catalog

✅ Task 2.2: Effect Application
   - Implement apply_divine_effect()
   - Track effect durations
   - Handle effect expiration

✅ Task 2.3: Special Mechanics
   - Reality distortion events
   - Redemption quest triggers
   - Divine intervention tokens
```

**Deliverable**: Full consequence system with mechanical effects

---

### Phase 3: God Personalities & Speeches (Week 2)
**Priority: HIGH**

```
✅ Task 3.1: Personality System
   - Implement GOD_PERSONALITIES data
   - Coalition affinity logic
   - Speech tone generation

✅ Task 3.2: Speech Generation
   - Template-based speeches
   - AI speech generation (Claude/MCP)
   - Context-aware reasoning

✅ Task 3.3: NPC Testimonies
   - Gather NPC opinions
   - Weight by NPC importance
   - Integrate with vote context
```

**Deliverable**: Dynamic god speeches with personality

---

### Phase 4: Frontend Visualization (Week 2-3)
**Priority: MEDIUM**

```
✅ Task 4.1: Council Screen Layout
   - HTML/CSS for council UI
   - God icon displays
   - Vote position indicators

✅ Task 4.2: Animation System
   - Sequential vote reveal
   - God icon animations
   - Background tension system

✅ Task 4.3: Mobile Optimization
   - Responsive layout
   - Touch-friendly controls
   - Reduced animation complexity
```

**Deliverable**: Polished council voting UI

---

### Phase 5: Integration & Polish (Week 3)
**Priority: MEDIUM**

```
✅ Task 5.1: Backend API
   - /api/divine_council/convene endpoint
   - /api/divine_council/results endpoint
   - WebSocket for real-time votes

✅ Task 5.2: Game Flow Integration
   - Trigger detection system
   - Turn integration
   - Save/load vote history

✅ Task 5.3: Testing
   - End-to-end vote scenarios
   - Edge case testing
   - Performance optimization
```

**Deliverable**: Fully integrated Divine Council system

---

### Phase 6: Advanced Features (Week 4 - Optional)
**Priority: LOW**

```
⭕ Task 6.1: God Coalitions
   - Dynamic coalition formation
   - Coalition speeches (gods debate each other)
   - Coalition bonuses

⭕ Task 6.2: Historical Context
   - Gods remember past votes
   - Trending favor affects votes
   - Redemption arc system

⭕ Task 6.3: Advanced Visualizations
   - 3D god models
   - Particle effects
   - Voice acting (TTS)
```

**Deliverable**: Enhanced immersion features

---

## 6. KEY DESIGN DECISIONS & RATIONALE

### 6.1 Why Weighted Votes Instead of Simple Majority?

**Decision**: Use favor-weighted votes rather than "1 god = 1 vote"

**Rationale**:
1. **Player Agency**: Rewards players for building relationships
2. **Strategic Depth**: Players must consider which gods to favor
3. **Dramatic Stakes**: High-favor god's betrayal hits harder
4. **Avoids Stalemate**: Weighted system reduces pure 50/50 splits
5. **Narrative Power**: "The gods speak with different authority"

### 6.2 Why 7 Gods Instead of 8?

**Decision**: Remove DRAKMOR, keep 7 gods (odd number)

**Rationale**:
1. **Avoids Tie Votes**: 7 is odd, preventing 50/50 deadlocks in raw counts
2. **Cleaner UI**: 7 fits better in visual layouts (3-4 split)
3. **Quorum**: Majority = 4 votes (clear threshold)
4. **Performance**: Fewer AI calls for speech generation

### 6.3 Why Allow Abstentions?

**Decision**: Include ABSTAIN as a vote option

**Rationale**:
1. **Personality Depth**: Some gods (Sylara, Athena) naturally prefer observation
2. **Dramatic Tension**: "Which way will the abstaining god swing?"
3. **Realistic**: Not all actions are clear-cut good/evil
4. **Narrative Hooks**: Abstaining god can be persuaded in future events

### 6.4 Why Reveal Votes Sequentially Instead of Simultaneously?

**Decision**: Show votes one-by-one in dramatic sequence

**Rationale**:
1. **Suspense**: Builds tension as tally shifts
2. **Understanding**: Players see each god's reasoning
3. **Memorability**: Creates memorable moments ("When Valdris voted against me...")
4. **Time to Process**: 30-second sequence allows emotional investment

---

## 7. BALANCE CONSIDERATIONS

### 7.1 Favor Gain/Loss Rates

```python
# Typical favor changes per action:
FAVOR_CALIBRATION = {
    "aligned_minor_action": +5,      # e.g., keeping small promise
    "aligned_major_action": +15,     # e.g., upholding sacred oath
    "opposed_minor_action": -5,      # e.g., small lie
    "opposed_major_action": -20,     # e.g., oath-breaking
    "council_vote_support": +10,     # God voted in your favor
    "council_vote_oppose": -15,      # God voted against you
    "unanimous_blessing": +20,       # All gods supported
    "unanimous_curse": -25           # All gods opposed
}

# Expected progression:
# Turn 1-20: Favor ranges -30 to +40 (establishing relationships)
# Turn 21-50: Favor ranges -60 to +70 (clear patterns emerge)
# Turn 51-100: Favor ranges -100 to +100 (extreme love or hate possible)
```

### 7.2 Vote Trigger Frequency

```python
# Prevent vote fatigue:
TRIGGER_RULES = {
    "min_turns_between_votes": 5,  # At least 5 turns between councils
    "max_votes_per_100_turns": 12, # ~12% of turns trigger votes
    "priority_triggers": {
        "oath_breaking": "always",
        "npc_death_major": "always",
        "divine_threshold_reached": "always",  # ±70 favor
        "player_near_death": "sometimes",  # 50% chance
        "legendary_achievement": "always"
    }
}
```

### 7.3 Effect Duration Balance

```python
# Ensure effects feel impactful but not permanent:
EFFECT_DURATIONS = {
    "unanimous_blessing": 25,     # ~25% of typical game
    "strong_support": 15,
    "narrow_support": 8,
    "deadlock": 5,                # Short chaos
    "narrow_opposition": 10,
    "strong_opposition": 15,
    "unanimous_curse": 30          # Long punishment
}

# Effects should:
# 1. Last long enough to matter (minimum 5 turns)
# 2. Not last so long they're forgotten
# 3. Stack interestingly (blessing + curse = complexity)
```

---

## 8. TESTING SCENARIOS

### 8.1 Unit Test Cases

```python
# test_divine_council.py

def test_vote_weight_calculation():
    # Test 1: Zero favor = 1.0x weight
    assert calculate_vote_weight("VALDRIS", 0, 1) == 1.0

    # Test 2: Max favor = 2.0x weight
    assert calculate_vote_weight("VALDRIS", 100, 1) == 2.0

    # Test 3: Min favor = 0.5x weight
    assert calculate_vote_weight("VALDRIS", -100, 1) == 0.5

    # Test 4: Oppose with high favor = strong negative
    assert calculate_vote_weight("VALDRIS", 80, -1) == -1.4

def test_outcome_determination():
    # Test 1: Unanimous support
    votes = {god: 1 for god in GOD_PERSONALITIES.keys()}
    favor = {god: 0 for god in GOD_PERSONALITIES.keys()}
    outcome = calculate_council_outcome(votes, favor)
    assert outcome['outcome'] == "UNANIMOUS_BLESSING"

    # Test 2: Weighted favor swings narrow vote
    votes = {"VALDRIS": 1, "KAITHA": 1, "MORVANE": 1,
             "SYLARA": -1, "KORVAN": -1, "ATHENA": -1, "MERCUS": 0}
    favor = {"VALDRIS": 100, "KAITHA": 0, "MORVANE": 0,
             "SYLARA": 0, "KORVAN": 0, "ATHENA": 0, "MERCUS": 0}
    outcome = calculate_council_outcome(votes, favor)
    # 3 support (one with 2x weight) vs 3 oppose = support wins
    assert outcome['outcome'] in ["NARROW_SUPPORT", "STRONG_SUPPORT"]

def test_god_personality_voting():
    # Test 1: Valdris opposes oath-breaking
    vote = determine_god_vote("VALDRIS", "broke sacred oath", {}, 0)
    assert vote == -1

    # Test 2: Kaitha supports rebellion
    vote = determine_god_vote("KAITHA", "rebelled against tyrant", {}, 0)
    assert vote == 1

    # Test 3: High favor can override alignment
    vote = determine_god_vote("VALDRIS", "broke oath to save child", {}, 80)
    # Even Valdris might support with very high favor
    assert vote in [0, 1]  # Abstain or support, not oppose
```

### 8.2 Integration Test Scenarios

```python
# Scenario 1: Oath-Breaking with Mixed Favor
def test_oath_breaking_scenario():
    player_id = "test_player"
    action = "Broke oath to the village elder to pursue personal revenge"
    context = {"involves_oath": True, "breaks_law": False}

    # Set up favor
    setup_favor(player_id, {
        "VALDRIS": -20,  # Already suspicious
        "KAITHA": +40,   # Likes you
        "MORVANE": +10,
        "SYLARA": 0,
        "KORVAN": +30,   # Respects your combat prowess
        "ATHENA": -10,
        "MERCUS": +5
    })

    # Convene council
    result = convene_council(player_id, action, context)

    # Expected: Valdris and Athena oppose, Kaitha and Korvan support
    # Likely outcome: NARROW_OPPOSITION or DEADLOCK
    assert result['outcome'] in ["NARROW_OPPOSITION", "DEADLOCK"]
    assert result['favor_changes']['VALDRIS'] < 0  # Loses more Valdris favor

# Scenario 2: Unanimous Blessing (extremely rare)
def test_unanimous_blessing():
    player_id = "test_hero"
    action = "Sacrificed own life to save innocent village from dragon"
    context = {
        "involves_sacrifice": True,
        "saves_innocents": True,
        "heroic": True
    }

    # Set up universally positive favor
    setup_favor(player_id, {god: +60 for god in GOD_PERSONALITIES.keys()})

    result = convene_council(player_id, action, context)

    # Should be unanimous or near-unanimous
    assert result['raw_count'][0] >= 6  # At least 6 support
    assert "blessing" in result['outcome'].lower()
```

### 8.3 Edge Case Testing

```python
# Edge Case 1: All gods abstain (theoretically possible)
def test_all_abstain():
    votes = {god: 0 for god in GOD_PERSONALITIES.keys()}
    favor = {god: 0 for god in GOD_PERSONALITIES.keys()}
    outcome = calculate_council_outcome(votes, favor)
    assert outcome['outcome'] == "DEADLOCK"
    assert outcome['weighted_score'] == 0

# Edge Case 2: One god with max favor vs six with min favor
def test_extreme_favor_imbalance():
    votes = {"VALDRIS": 1, **{god: -1 for god in list(GOD_PERSONALITIES.keys())[1:]}}
    favor = {"VALDRIS": 100, **{god: -100 for god in list(GOD_PERSONALITIES.keys())[1:]}}

    outcome = calculate_council_outcome(votes, favor)
    # Valdris: +1 * 2.0 = +2.0
    # Others: -1 * 0.5 * 6 = -3.0
    # Total: -1.0 (narrow opposition)
    assert outcome['weighted_score'] < 0
```

---

## 9. ADVANCED FEATURES (POST-MVP)

### 9.1 God Coalition System

```python
# Gods form temporary alliances based on shared interests
COALITION_SYSTEM = {
    "The Lawful Alliance": {
        "members": ["VALDRIS", "KORVAN", "ATHENA"],
        "trigger": "when order is threatened",
        "bonus": "Combined speeches, +1.2x weight when all agree"
    },
    "The Freedom Pact": {
        "members": ["KAITHA", "MERCUS"],
        "trigger": "when freedom is restricted",
        "bonus": "Joint vote counts as 1.5x"
    },
    "The Pragmatist Axis": {
        "members": ["MORVANE", "MERCUS", "ATHENA"],
        "trigger": "when survival is at stake",
        "bonus": "Shared reasoning in speeches"
    }
}

def check_coalition_activation(action: str, context: Dict) -> Optional[str]:
    """Check if action triggers a god coalition"""
    # Implementation would check action keywords against coalition triggers
    pass
```

### 9.2 Historical Voting Patterns

```python
# Gods remember past votes and reference them
def get_historical_context(player_id: str, god_name: str) -> Dict:
    """
    Get god's voting history with this player

    Returns:
        {
            'total_votes': 15,
            'supported': 8,
            'opposed': 5,
            'abstained': 2,
            'trend': 'improving',  # or 'declining', 'stable'
            'memorable_votes': [
                {
                    'turn': 45,
                    'action': 'broke oath',
                    'vote': 'oppose',
                    'reasoning': 'Oaths are sacred'
                }
            ]
        }
    """
    # Query divine_councils table for this player's vote history
    pass

# Example speech using history:
"""
VALDRIS: "Once before, you broke an oath and I condemned you.
          Yet you have since proven your commitment to order.
          This time, I see the necessity. I support this action."
"""
```

### 9.3 Redemption Arc System

```python
# Special quest chain triggered by unanimous curse
REDEMPTION_ARC = {
    "trigger": "UNANIMOUS_CURSE",
    "quest_chain": [
        {
            "name": "Seek Divine Forgiveness",
            "description": "Visit the Temple of the Seven to begin your redemption",
            "objectives": ["Reach Temple", "Speak to High Priest"],
            "reward": {god: +10 for god in GOD_PERSONALITIES.keys()}
        },
        {
            "name": "Trials of Atonement",
            "description": "Complete seven trials, one for each god",
            "objectives": [
                "Trial of Order (Valdris): Keep 5 promises",
                "Trial of Freedom (Kaitha): Free 3 prisoners",
                "Trial of Survival (Morvane): Survive without healing",
                # ... etc
            ],
            "reward": {god: +20 for god in GOD_PERSONALITIES.keys()}
        },
        {
            "name": "Divine Reconciliation",
            "description": "Face the Divine Council again in judgment",
            "completion": "Removes DIVINE_ABANDONMENT curse, restores favor to 0"
        }
    ]
}
```

---

## 10. IMPLEMENTATION FILES

### File Structure

```
complete_game/
├── divine_council/
│   ├── __init__.py
│   ├── voting_system.py          # Core voting logic
│   ├── god_personalities.py      # Personality definitions
│   ├── consequence_engine.py     # Effect application
│   ├── speech_generator.py       # Dynamic speeches
│   └── coalition_system.py       # Advanced coalitions
├── database.py                    # (Add divine tables)
├── web_game.py                    # (Add council endpoints)
└── static/
    ├── js/
    │   └── divine_council_ui.js  # Frontend visualization
    └── css/
        └── divine_council.css     # Council styling
```

### Priority File: `voting_system.py`

```python
"""
Divine Council Voting System
Core voting mechanics for The Arcane Codex
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
import random

@dataclass
class Vote:
    god_name: str
    position: int  # -1, 0, 1
    weight: float
    reasoning: str
    favor_before: int
    favor_after: int

@dataclass
class VoteOutcome:
    raw_count: Tuple[int, int, int]  # (support, oppose, abstain)
    weighted_score: float
    outcome: str
    margin: float
    decisive_gods: List[str]
    swing_gods: List[str]
    vote_breakdown: Dict[str, float]

class VotingSystem:
    """Core voting calculation engine"""

    def __init__(self, god_personalities: Dict):
        self.gods = god_personalities

    def calculate_vote_weight(self, favor: int, base_vote: int) -> float:
        """Calculate weighted vote based on favor"""
        # Implementation as defined in Section 1.2
        pass

    def determine_god_vote(self, god_name: str, action: str,
                          context: Dict, favor: int) -> int:
        """Determine how a god votes"""
        # Implementation as defined in Section 2.3
        pass

    def calculate_outcome(self, votes: Dict[str, int],
                         favor_levels: Dict[str, int]) -> VoteOutcome:
        """Calculate weighted vote outcome"""
        # Implementation as defined in Section 1.3
        pass

    def convene_council(self, player_id: str, action: str,
                       context: Dict) -> Dict:
        """
        Full council convening process

        1. Get current favor levels
        2. Determine each god's vote
        3. Generate speeches
        4. Calculate outcome
        5. Apply consequences
        6. Return result for UI display
        """
        pass
```

---

## 11. NEXT STEPS

### Immediate Actions (This Week)

1. ✅ **Review & Approve Design** - Get stakeholder sign-off on mechanics
2. ✅ **Create Database Schema** - Add divine_council_votes and divine_effects tables
3. ✅ **Implement Core Voting Logic** - Build VotingSystem class
4. ✅ **Write Unit Tests** - Ensure vote calculations work correctly
5. ✅ **Create Basic UI Mockup** - HTML prototype of council screen

### Week 1 Deliverables

- Working voting calculation system
- Database integration complete
- Basic god personality system
- Unit test coverage > 80%

### Week 2 Deliverables

- Speech generation (templates + AI)
- Consequence application system
- Frontend basic UI
- Integration with game flow

### Week 3 Deliverables

- Polished animations
- Mobile optimization
- End-to-end testing
- Performance optimization

### Week 4 (Optional)

- Advanced features (coalitions, redemption arcs)
- Voice acting / sound design
- Analytics dashboard for vote patterns

---

## 12. METRICS & SUCCESS CRITERIA

### Quantitative Metrics

```python
SUCCESS_METRICS = {
    "player_engagement": {
        "target": "80% of votes watched to completion",
        "measurement": "Track video completion rate"
    },
    "vote_diversity": {
        "target": "All 7 outcome types occur regularly",
        "measurement": "Outcome distribution should be roughly: "
                      "Unanimous: <5%, Strong: 30%, Narrow: 40%, Deadlock: 25%"
    },
    "favor_progression": {
        "target": "Players reach ±70 favor with at least 2 gods by turn 50",
        "measurement": "Track favor distribution over time"
    },
    "consequence_impact": {
        "target": "Divine effects influence 60%+ of player decisions",
        "measurement": "Survey + behavioral analysis"
    }
}
```

### Qualitative Goals

1. **Dramatic Moments**: Players remember specific council votes as story highlights
2. **Strategic Depth**: Players consciously build/maintain favor with key gods
3. **Narrative Integration**: Votes feel like natural story beats, not random events
4. **Fair But Surprising**: Outcomes make sense in hindsight but aren't predictable

---

## CONCLUSION

This Divine Council voting system creates:

1. **Strategic Depth**: Weighted votes based on favor add complexity
2. **Narrative Drama**: Sequential reveals build tension
3. **Meaningful Consequences**: Effects ripple through gameplay
4. **Replayability**: Different favor patterns = different outcomes
5. **Innovation**: No other RPG has real-time god debates with coalition voting

**Estimated Implementation**: 3-4 weeks full-time
**Core Innovation**: The feature that makes The Arcane Codex revolutionary

---

**Ready to begin implementation. Awaiting approval to proceed with Phase 1.**
