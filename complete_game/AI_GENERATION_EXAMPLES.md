# AI Scenario Generation Examples
## The Arcane Codex - 5 Complete Generated Scenarios

Each example shows the full generation process from context to final scenario.

---

## Example 1: "The Informant's Dilemma"

### 1. Context Received

```
GENERATION REQUEST:
- Party Trust: 65/100
- Players: Fighter (HP 85/100), Mage (HP 60/70)
- NPCs: Grimsby (Approval 45/100), Renna (Approval 60/100)
- Divine Favor: VALDRIS +15, KAITHA +25, MORVANE +10, SYLARA +5
- Location: Thieves Guild Territory (urban)
- Previous Themes: [medicine heist, plague outbreak, noble corruption, dragon attack, haunted mansion]
- Moral Dilemma Type: MUTUALLY_EXCLUSIVE
- Difficulty: Medium
```

### 2. Analysis Performed

**Trust Level** (65/100): Medium trust
- NPCs should cooperate but not fully transparently
- Grimsby (45) will withhold some info, act selfishly
- Renna (60) will share most info, but with hesitation

**Class Analysis**:
- Fighter: Needs tactical/combat whisper (positioning, numbers, ambush detection)
- Mage: Needs magical whisper (auras, compulsions, scrying)

**Theme Avoidance**:
- NOT medicine (used recently)
- NOT plague (used recently)
- NOT noble corruption (used recently)
- NEW: Informant betrayal, brother vs ledgers dilemma

**Divine Favor Context**:
- KAITHA +25: Party leans chaotic/freedom, influence NPC attitudes
- VALDRIS +15: Some lawful favor, but not dominant

### 3. Patterns Applied

**Moral Dilemma**: MUTUALLY_EXCLUSIVE
- Goal A: Save Renna's brother (personal loyalty)
- Goal B: Get blackmail ledgers (Grimsby's need)
- Constraint: Informant can only give ONE before being caught

**3-Act Structure**:
- Act 1: Renna reveals brother's danger, informant has intel
- Act 2: Discover informant is bait for trap
- Act 3: Time runs out, choose brother OR ledgers

**Whispers**:
- Fighter: Sees trap setup (ambush, false guards)
- Mage: Detects magical compulsion on informant (geas)
- Both reveal danger but different aspects

**Environmental Elements** (urban tavern):
1. Rain gutter → Second floor entry
2. Burning brazier → Smoke screen
3. Horse cart → Battering ram
4. Grimsby's herbs → Sleeping gas
5. Fireplace blind spot → Avoid scrying

**NPCs**:
- Grimsby (45 approval): DESPERATE flaw, prioritizes ledgers over Renna's needs
- Renna (60 approval): IMPULSIVE flaw, close to attacking if brother endangered

### 4. Complete Scenario Generated

```json
{
    "scenario_id": "gen_informant_dilemma_001",
    "theme": "The Informant's Dilemma",
    "moral_type": "MUTUALLY_EXCLUSIVE",
    "difficulty": "medium",
    "estimated_playtime": "15 minutes",

    "acts": [
        {
            "act": 1,
            "name": "The Desperate Lead",
            "public": "Rain hammers the cobblestones as Renna leads you through the Thieves Guild's back alleys. She stops outside a dilapidated tavern, its sign—The Broken Blade—creaking in the wind.\n\n'My brother's informant works here,' she mutters, pulling her hood tighter. 'He knows where the Guild keeps their blackmail ledgers. But...' She hesitates. 'He's also planning to rat out my brother to the city guard tonight. If we don't stop him, my brother hangs. But if we do, we lose our only lead on the ledgers.'\n\nThrough the grimy window, you see a nervous-looking man at the bar, glancing at the door every few seconds. Two city guards sit in the corner, nursing ales.\n\nGrimsby shifts uncomfortably. 'I NEED those ledgers. They have proof of the Duke's involvement in my daughter's poisoning.'\n\nThe rain intensifies. The informant stands, heading for the guards' table.\n\nYou have seconds to decide.",

            "whispers": {
                "fighter": "Your combat training kicks in. You notice:\n\n• The 'informant' has a bulge under his left arm—a concealed dagger, military-grade\n• The two 'guards' are sitting TOO casually—their swords are too clean, never used in real combat\n• The back exit is blocked by crates (recent—dust pattern shows they were moved TODAY)\n\nThis is a TRAP. The 'informant' is bait. Renna is being set up to walk into an ambush.\n\nBut you also notice: The guards' patrol route has a 40-second gap when they pass the alley. If you act in that window, you could grab the informant without a fight.",

                "mage": "Your arcane senses detect something WRONG:\n\n• The informant radiates faint enchantment magic—he's under a GEAS (magical compulsion)\n• Someone is FORCING him to betray Renna's brother\n• The 'guards' wear amulets—anti-magic wards, EXPENSIVE ones (military or noble grade)\n• There's a scrying sensor above the bar—someone is WATCHING this tavern remotely\n\nIf you dispel the geas, the informant will be free... but whoever cast it will know you're here within seconds.\n\nYou also notice: The scrying sensor has a blind spot near the fireplace. If you move there, you could act unobserved for about 2 minutes."
            },

            "choices": [
                {
                    "id": "enter_immediately",
                    "text": "Rush in immediately, grab the informant",
                    "risk": "High chance of combat, trap springs"
                },
                {
                    "id": "share_whispers",
                    "text": "Share whispers with party, plan together",
                    "benefit": "Trust +5, better plan possible",
                    "time_cost": "Informant gets closer to guards"
                },
                {
                    "id": "use_environment",
                    "text": "Use environmental tactics (smoke, entry, etc.)",
                    "requires": "Choose specific environmental element"
                },
                {
                    "id": "follow_informant",
                    "text": "Let him talk to guards, follow to see who set this up",
                    "risk": "Renna's brother arrested tonight"
                }
            ]
        },
        {
            "act": 2,
            "name": "The Trap Springs",
            "public": "Your choice determines how events unfold:\n\nIf you entered: The 'guards' reveal themselves as Thieves Guild enforcers. Combat erupts.\n\nIf you shared whispers: Renna's eyes widen. 'It's a trap... but my brother...' Her hand shakes on her blade. Grimsby interrupts: 'Forget her brother! We need those ledgers!' Tension rises.\n\nIf you used environment: [Specific outcome based on environmental choice]\n\nRegardless of approach, you learn:\n\nThe informant WAS going to betray Renna's brother (that part is true). But someone ELSE discovered this and set up the ambush to catch Renna when she tried to stop him. The Guild wants her dead for past betrayals.\n\nGrimsby's desperation shows: 'I don't care about her brother. Those ledgers are my daughter's only hope for justice!'\n\nRenna's impulsive flaw activates: 'My brother is DYING! The ledgers can wait!'\n\nThe informant, if captured, gasps: 'The ledgers are in the Guild's vault. But I also know where they're holding your brother. I can tell you ONE location before my handlers realize I'm compromised. CHOOSE!'",

            "whispers": {
                "fighter": "Your tactical analysis: If you go for the brother first, the Guild will move the ledgers within the hour (security protocol). If you go for the ledgers first, the brother's execution is tonight at midnight (4 hours from now). The vault is 30 minutes away. The brother's location is 20 minutes away. Either way, you can only accomplish ONE before the other becomes impossible.",

                "mage": "Your arcane detection: The geas on the informant will break in 10 minutes (it's weakening). Once broken, whoever cast it will know. You could speed up the break with a dispel (instant, but alerts caster immediately) or let it decay naturally (10 min, delayed alert). The caster is likely the Guild's mage, who can teleport reinforcements in seconds if alerted early."
            },

            "environmental_tactics": [
                {
                    "object": "Rain gutter to second floor",
                    "action": "Climb to second floor window",
                    "consequence": "Avoid ground-level trap, stealth advantage",
                    "risk": "Loud crash if failed climb (alerts everyone)",
                    "class_synergy": "Thief/Ranger get +5 to climb"
                },
                {
                    "object": "Burning brazier near entrance",
                    "action": "Kick over to create smoke screen",
                    "consequence": "Chaos, easy to grab informant and flee",
                    "risk": "Civilians hurt (SYLARA -15, trust -5)",
                    "class_synergy": "Thief can move unseen in smoke"
                },
                {
                    "object": "Horse cart nearby",
                    "action": "Use as battering ram through back door",
                    "consequence": "Fast entry, destroys crate barricade",
                    "risk": "Very loud, reinforcements arrive in 2 turns",
                    "class_synergy": "Fighter can control cart effectively"
                },
                {
                    "object": "Grimsby's medical supplies",
                    "action": "Create sleeping gas from rare herbs",
                    "consequence": "Knock out entire tavern (2 min prep), nonlethal",
                    "risk": "Uses Grimsby's last supplies (approval -10), takes time",
                    "class_synergy": "Cleric can identify correct herbs"
                },
                {
                    "object": "Fireplace blind spot",
                    "action": "Mage dispels geas from blind spot",
                    "consequence": "Informant freed, delayed alert (10 min before caster knows)",
                    "risk": "Requires positioning, takes 1 turn to move there",
                    "class_synergy": "Mage only"
                }
            ]
        },
        {
            "act": 3,
            "name": "The Impossible Choice",
            "public": "The informant, freed from the geas, looks at you with desperate eyes:\n\n'I didn't want to do this. They forced me. I can help you, but you have to choose NOW:'\n\n'OPTION A: I'll tell you where Renna's brother is hidden (execution at midnight, 4 hours away). But the Guild will move the ledgers within the hour once they realize I'm compromised. The ledgers will be lost forever.'\n\n'OPTION B: I'll tell you where the blackmail ledgers are (vault, 30 minutes away). But I can't help with the brother—he hangs at midnight. You won't have time for both.'\n\nGrimsby grabs your arm: 'Those ledgers are my daughter's only chance for justice! The Duke walks free without them!'\n\nRenna's voice cracks: 'He's my BROTHER. Please...'\n\nThe informant adds: 'There's a THIRD option... but it's desperate. I know a forger. If you can get me a sample of the Guild's seal from the vault, I can forge documents that exonerate Renna's brother. But breaking into the vault takes time—he'd hang before you finish. UNLESS...' He hesitates. 'Unless you attack the execution site FIRST, delay it with chaos, THEN hit the vault. But that's two combat encounters back-to-back. Your mage is already low on spells.'\n\nTime is up. What do you do?",

            "final_choices": [
                {
                    "id": "save_brother",
                    "name": "Save Renna's Brother",
                    "description": "Raid the holding site, free the brother before execution",
                    "immediate_consequences": {
                        "lives": "Brother saved, Renna's family intact",
                        "cost": "Ledgers moved, Grimsby's daughter's killer escapes justice",
                        "npc_reactions": {
                            "renna": "Approval +25, loyal forever, shares all secrets",
                            "grimsby": "Approval -30, DESPERATE flaw triggers, abandons party to hunt Duke alone (he dies)"
                        },
                        "trust": "-10 (chose one NPC over another)",
                        "items": "None gained"
                    },
                    "long_term_consequences": {
                        "turns_3_to_5": "Grimsby found dead, killed attempting solo raid on Duke. Renna guilt-ridden (her happiness cost his life).",
                        "turns_5_to_10": "Duke's crimes remain hidden, continues corruption. Poor district suffers. Renna slowly becomes vengeful toward Duke.",
                        "divine_favor": {
                            "KORVAN": "+20 (loyalty to companion)",
                            "MORVANE": "+15 (saved achievable goal)",
                            "VALDRIS": "-15 (criminal escaped justice)",
                            "SYLARA": "+10 (preserved life)"
                        }
                    },
                    "divine_council": {
                        "support": ["KORVAN (honor)", "MORVANE (pragmatic)", "SYLARA (life)", "KAITHA (freedom)"],
                        "oppose": ["VALDRIS (justice denied)", "ATHENA (could've tried harder)"],
                        "abstain": ["MERCUS (no economic impact)", "DRAKMOR (not bold enough)"],
                        "outcome": "4 SUPPORT, 2 OPPOSE, 2 ABSTAIN → MINOR BLESSING",
                        "blessing": "Renna's loyalty grants +2 to stealth checks (she teaches you Guild secrets)"
                    }
                },
                {
                    "id": "get_ledgers",
                    "name": "Retrieve the Blackmail Ledgers",
                    "description": "Raid the vault, secure evidence against the Duke",
                    "immediate_consequences": {
                        "lives": "Brother executed at midnight, ledgers secured",
                        "cost": "Renna's family destroyed, Grimsby obsessed with revenge",
                        "npc_reactions": {
                            "grimsby": "Approval +30, grateful, becomes valuable underworld ally",
                            "renna": "Approval -40 → 20, IMPULSIVE flaw triggers, ATTACKS party in rage, then flees"
                        },
                        "trust": "-20 (party chose evidence over life)",
                        "items": "Blackmail Ledgers (can expose Duke's crimes)"
                    },
                    "long_term_consequences": {
                        "turns_3_to_5": "Duke arrested using ledgers, daughter gets justice. Renna returns as enemy, joined Blood Vengeance cult.",
                        "turns_5_to_10": "Duke's son swears revenge on party. Renna hunts party with cult. Grimsby helps from shadows.",
                        "divine_favor": {
                            "VALDRIS": "+30 (justice served)",
                            "ATHENA": "+20 (wise choice for greater good)",
                            "SYLARA": "-25 (let innocent die)",
                            "KORVAN": "-20 (betrayed companion)"
                        }
                    },
                    "divine_council": {
                        "support": ["VALDRIS (justice)", "ATHENA (wisdom)", "MERCUS (ledgers valuable)"],
                        "oppose": ["SYLARA (death)", "KORVAN (betrayal)", "KAITHA (authority over freedom)"],
                        "abstain": ["MORVANE (both pragmatic)", "DRAKMOR (bold but cold)"],
                        "outcome": "3 SUPPORT, 3 OPPOSE, 2 ABSTAIN → DEADLOCK",
                        "result": "No divine intervention (gods are divided)"
                    }
                },
                {
                    "id": "desperate_gambit",
                    "name": "The Desperate Gambit",
                    "description": "Attack execution site for delay, then raid vault for forged evidence",
                    "immediate_consequences": {
                        "lives": "Brother's execution delayed 2 hours, attempt both goals",
                        "cost": "Two combat encounters, high resource drain, exhaustion",
                        "npc_reactions": {
                            "grimsby": "Approval +15 (attempting to save his goal)",
                            "renna": "Approval +15 (attempting to save her goal)"
                        },
                        "trust": "+10 (party tries for everyone)",
                        "requires": "Success on two separate challenges"
                    },
                    "success_path": {
                        "challenge_1": "Combat at execution site (DC 16, delay guards for 2 hours)",
                        "challenge_2": "Stealth/combat at vault (DC 18, steal Guild seal sample)",
                        "challenge_3": "Persuasion with forger (DC 15, convince him to forge quickly)",
                        "time_pressure": "Must complete all three in 3 hours",
                        "on_full_success": "Brother saved, ledgers secured (via forgeries), both NPCs happy, trust +20",
                        "on_partial_success": "Choose which challenge to prioritize when time runs out",
                        "on_failure": "Both goals fail (brother hangs, vault alerted and emptied)"
                    },
                    "long_term_consequences": {
                        "on_success": "Duke exposed, brother free, both NPCs loyal. Guild becomes major enemy (you humiliated them).",
                        "divine_favor": {
                            "ATHENA": "+40 (clever third option)",
                            "SYLARA": "+30 (saved all lives)",
                            "VALDRIS": "+25 (justice + mercy)",
                            "KAITHA": "-10 (too perfect, boring)"
                        }
                    },
                    "divine_council": {
                        "support": ["VALDRIS", "ATHENA", "SYLARA", "KORVAN", "MORVANE", "DRAKMOR"],
                        "oppose": ["KAITHA (too neat)"],
                        "abstain": ["MERCUS (neutral on outcome)"],
                        "outcome": "6 SUPPORT, 1 OPPOSE, 1 ABSTAIN → STRONG BLESSING",
                        "blessing": "Guild's respect granted: +3 to persuasion with criminals, Guild stops hunting you"
                    }
                },
                {
                    "id": "negotiate_informant",
                    "name": "Negotiate with Informant",
                    "description": "Convince informant to give BOTH locations, trust his change of heart",
                    "immediate_consequences": {
                        "requires": "Persuasion check DC 20 (very hard)",
                        "on_success": "Informant gives both locations, warns Guild will move ledgers in 2 hours (narrow window for both)",
                        "on_failure": "Informant panics, flees, alerts Guild, both goals become harder (DC +5 each)"
                    },
                    "success_mechanics": {
                        "dc_modifiers": {
                            "base": 20,
                            "if_shared_whispers": "-3 (trust shown)",
                            "if_freed_from_geas_gently": "-2 (he's grateful)",
                            "if_grimsby_present": "+2 (he intimidates informant)",
                            "if_renna_present": "-2 (he sympathizes with her)"
                        },
                        "on_success": "2-hour window to attempt both, but must be FAST and PERFECT",
                        "realistic_outcome": "Likely get one goal perfectly, other goal partially (brother freed but ledgers partly destroyed, OR ledgers secured but brother injured in rescue)"
                    },
                    "divine_council": {
                        "support": ["ATHENA (clever)", "MERCUS (negotiation)", "KAITHA (trusting freedom)"],
                        "oppose": ["MORVANE (risky gamble)"],
                        "abstain": ["Others (wait to see outcome)"],
                        "outcome": "Conditional based on success/failure"
                    }
                },
                {
                    "id": "abandon_both",
                    "name": "Abandon Both Goals",
                    "description": "Refuse to participate, flee before Guild reinforcements arrive",
                    "immediate_consequences": {
                        "lives": "Party survives, brother dies, ledgers hidden",
                        "cost": "Both NPCs' goals fail, massive approval loss",
                        "npc_reactions": {
                            "grimsby": "Approval -50, DESPERATE flaw triggers, attempts solo raid (dies)",
                            "renna": "Approval -50, IMPULSIVE flaw triggers, attacks party, then leaves forever"
                        },
                        "trust": "-30 (party abandoned allies in need)",
                        "safety": "Party avoids combat, survives safely"
                    },
                    "long_term_consequences": {
                        "both_npcs_become_enemies": true,
                        "grimsby": "Dies in solo raid, haunts party",
                        "renna": "Joins Blood Vengeance, hunts party",
                        "divine_favor": {
                            "MORVANE": "+10 (survival prioritized)",
                            "KORVAN": "-40 (cowardice)",
                            "VALDRIS": "-20 (abandoned justice)",
                            "ALL_OTHERS": "-15 (disappointing)"
                        }
                    },
                    "divine_council": {
                        "support": ["MORVANE (barely)"],
                        "oppose": ["KORVAN", "VALDRIS", "SYLARA", "ATHENA", "KAITHA", "DRAKMOR"],
                        "abstain": ["MERCUS (neutral)"],
                        "outcome": "1 SUPPORT, 6 OPPOSE, 1 ABSTAIN → MAJOR CURSE",
                        "curse": "Coward's Mark: -5 to initiative (fear slows reactions), NPCs trust you less"
                    }
                }
            ]
        }
    ],

    "npcs": [
        {
            "name": "Grimsby",
            "role": "ally with agenda",
            "motivation": "Get blackmail ledgers to expose Duke's involvement in daughter's poisoning",
            "secret": "Daughter already recovered, but he wants REVENGE on Duke now",
            "fatal_flaw": "DESPERATE",
            "approval": 45,
            "behavior_at_approval": "Withholds secret about daughter's recovery, pushes for ledgers obsessively, will abandon party if they choose brother over ledgers",
            "betrayal_condition": "If party chooses brother over ledgers (approval drops to 15, he attempts solo raid and dies)",
            "loyalty_reward": "If party gets ledgers: becomes valuable underworld contact, +30 approval, teaches party about noble corruption",
            "divine_affinity": {
                "VALDRIS": 30,
                "MORVANE": 20,
                "MERCUS": -10,
                "SYLARA": 15
            }
        },
        {
            "name": "Renna",
            "role": "companion with family ties",
            "motivation": "Save brother from execution",
            "secret": "Brother is actually innocent of the crimes he's accused of (framed by Guild leader)",
            "fatal_flaw": "IMPULSIVE",
            "approval": 60,
            "behavior_at_approval": "Shares most information, hesitates slightly, will snap if brother endangered",
            "betrayal_condition": "If party chooses ledgers over brother (approval drops to 20, she attacks party in rage, then flees to Blood Vengeance cult)",
            "loyalty_reward": "If party saves brother: becomes loyal forever, teaches Guild stealth techniques (+2 stealth), shares contacts",
            "divine_affinity": {
                "KAITHA": 40,
                "KORVAN": 25,
                "VALDRIS": -20,
                "MORVANE": 15
            }
        },
        {
            "name": "The Informant (Marcus)",
            "role": "victim/wildcard",
            "motivation": "Survive, escape Guild control",
            "secret": "Was planning to betray Renna's brother, but only because Guild threatened his own family",
            "fatal_flaw": "COWARDLY",
            "approval": "N/A (not party member)",
            "behavior": "Will help whoever frees him from geas, but will panic and flee if threatened",
            "divine_affinity": {
                "MORVANE": 30,
                "KAITHA": -20
            }
        }
    ],

    "quality_verification": {
        "context_integration": true,
        "uniqueness_verified": true,
        "whisper_quality": true,
        "environmental_design": true,
        "npc_consistency": true,
        "moral_dilemma_quality": true,
        "consequence_design": true,
        "divine_council_logic": true,
        "solution_diversity": true,
        "technical_completeness": true,
        "red_flags": "NONE",
        "estimated_quality_score": "92/100 (Excellent)"
    }
}
```

### 5. Quality Checklist Verification

✅ **Context Integration**: Party trust, classes, NPC approvals all reflected in behavior
✅ **Uniqueness**: New theme (informant betrayal), new NPCs (Marcus), new location (Broken Blade tavern)
✅ **Whisper Quality**: Fighter sees trap, Mage sees geas - both different, both useful
✅ **Environmental Design**: 5 elements (rain gutter, brazier, cart, herbs, fireplace), all enable solutions
✅ **NPC Consistency**: Grimsby (45) withholds daughter secret, Renna (60) shares most but hesitates
✅ **Moral Dilemma**: MUTUALLY_EXCLUSIVE - can only save brother OR get ledgers, both equally important
✅ **Consequence Design**: Immediate (who lives/dies), short-term (NPC reactions), long-term (world changes)
✅ **Divine Council**: Logical votes (VALDRIS wants justice, KORVAN values loyalty)
✅ **Solution Diversity**: 5 distinct paths (save brother, get ledgers, desperate gambit, negotiate, abandon)
✅ **Technical Completeness**: All JSON fields present, proper structure

**Quality Score**: 92/100 (Excellent)

---

## Example 2: "The Cursed Sanctuary"

### 1. Context Received

```
GENERATION REQUEST:
- Party Trust: 40/100
- Players: Cleric (HP 70/75), Thief (HP 55/60), Ranger (HP 80/80)
- NPCs: Brother Aldric (Approval 30/100), Sera the Scout (Approval 55/100)
- Divine Favor: SYLARA +35, VALDRIS -10, KAITHA +5, MORVANE -5
- Location: Ancient Forest Temple (wilderness/religious)
- Previous Themes: [informant betrayal, dragon attack, political intrigue, haunted mansion, poison plot]
- Moral Dilemma Type: COMPLEMENTARY
- Difficulty: High
```

### 2. Analysis Performed

**Trust Level** (40/100): Fragile alliance
- NPCs will NOT share whispers freely
- Brother Aldric (30) is untrustworthy, likely to withhold or lie
- Sera (55) will share some info but cautiously

**Class Analysis**:
- Cleric: Divine/moral whisper (consecration, holy presence)
- Thief: Hidden details whisper (traps, secret motivations)
- Ranger: Nature whisper (corrupted ecosystem, animal warnings)

**Theme Avoidance**:
- NEW: Religious corruption, nature vs divine conflict, sacrificial magic

**Dilemma Type**: COMPLEMENTARY
- All whispers fit together to reveal a no-win situation
- Cleric sees holy corruption
- Thief sees Brother Aldric's deception
- Ranger sees nature dying
- COMBINED: Sanctuary keeps forest alive but corrupts it, removing sanctuary kills forest

### 3. Patterns Applied

(Similar detailed breakdown as Example 1...)

### 4. Complete Scenario Generated

```json
{
    "scenario_id": "gen_cursed_sanctuary_002",
    "theme": "The Cursed Sanctuary - Nature vs Divine",
    "moral_type": "COMPLEMENTARY",
    "difficulty": "high",

    "brief_summary": "A forest temple maintains the ancient woods through sacrificial blood magic. Brother Aldric claims it's holy, but all whispers reveal: the magic IS keeping the forest alive, BUT it's corrupting both nature and the divine. Removing the sanctuary kills the forest. Keeping it corrupts everything. No perfect solution exists - party must choose the lesser evil.",

    "key_elements": {
        "cleric_whisper": "Temple magic is CORRUPTED (unholy sacrifice sustains holy ground - paradox)",
        "thief_whisper": "Brother Aldric KNOWS it's corrupted, lies to protect his life's work",
        "ranger_whisper": "Forest NEEDS the temple (animals confirm), but temple CORRUPTS forest (twisted plants)",
        "complementary_revelation": "All three whispers together show: temple is both savior and poison of forest"
    },

    "impossible_choice": {
        "option_a": "Destroy temple (forest dies in months, but cleanly)",
        "option_b": "Keep temple (forest lives but becomes twisted, corrupted ecosystem)",
        "option_c": "Find 'pure' alternative (requires divine intervention, extremely difficult)",
        "moral_weight": "Corrupt life vs clean death vs desperate gamble"
    },

    "divine_council_preview": {
        "destroy_temple": "VALDRIS +30, MORVANE -40, SYLARA -30 (killing life)",
        "keep_temple": "SYLARA +20, VALDRIS -40 (accepting corruption), MORVANE +20",
        "find_alternative": "ATHENA +40, SYLARA +35, ALL others respect attempt"
    },

    "estimated_quality_score": "88/100"
}
```

(Full scenario JSON would be similarly detailed as Example 1, abbreviated here for space)

---

## Example 3: "The False Accusation"

### 1. Context Received

```
GENERATION REQUEST:
- Party Trust: 85/100
- Players: Bard (HP 65/65), Mage (HP 70/70)
- NPCs: Lord Castellan (Approval 75/100), Ivy the Handmaid (Approval 80/100)
- Divine Favor: ATHENA +30, MERCUS +20, KORVAN +15
- Location: Noble estate (social setting)
- Previous Themes: [cursed sanctuary, informant betrayal, plague outbreak, dragon attack]
- Moral Dilemma Type: CONTRADICTORY
- Difficulty: Low-Medium
```

### 2. Analysis Performed

**Trust Level** (85/100): Unbreakable bond
- NPCs share ALL information freely
- No withholding expected
- Party works as tight unit

**Class Analysis**:
- Bard: Social/emotional whisper (reading true feelings, hidden relationships)
- Mage: Magical whisper (detecting possession, enchantment, illusions)

**Dilemma Type**: CONTRADICTORY
- Bard's whisper: Lord's son is INNOCENT (reads his genuine confusion)
- Mage's whisper: Lord's son is GUILTY (magical evidence of blood on his sword)
- CONTRADICTION: Both are correct!
- RESOLUTION: Son is possessed at night, doesn't remember killing

### 3. Complete Scenario (Abbreviated)

```json
{
    "scenario_id": "gen_false_accusation_003",
    "theme": "The False Accusation - Innocent Murderer",
    "moral_type": "CONTRADICTORY",
    "difficulty": "low-medium",

    "contradiction_setup": {
        "bard_whisper": "Lord's son is genuinely innocent (body language shows real confusion)",
        "mage_whisper": "Lord's son is guilty (magical blood evidence, necromantic traces on his sword)",
        "resolution": "BOTH correct - son is possessed at night by advisor, doesn't remember killing",
        "dilemma": "Son IS killing people (must be stopped) but is INNOCENT (possessed). Kill innocent boy to stop murders, OR find possessor (hard, murders continue until successful)?"
    },

    "key_choice": {
        "path_a": "Kill son (stops murders immediately, but murder an innocent)",
        "path_b": "Find possessor (righteous but risky, murders continue during investigation)",
        "path_c": "Imprison son (humane but his life is ruined even if possessor found later)",
        "path_d": "Exorcism (risky magical solution, might kill son, might fail)"
    },

    "estimated_quality_score": "85/100"
}
```

---

## Example 4: "The Starving Village"

### 1. Context Received

```
GENERATION REQUEST:
- Party Trust: 20/100
- Players: Fighter (HP 40/100), Thief (HP 30/60)
- NPCs: Captain Vortis (Approval 15/100), Lena the Refugee (Approval 25/100)
- Divine Favor: MORVANE +40, VALDRIS -30, KAITHA -15
- Location: War-torn border village (wilderness/combat)
- Previous Themes: [false accusation, cursed sanctuary, informant betrayal]
- Moral Dilemma Type: MUTUALLY_EXCLUSIVE
- Difficulty: Extreme
```

### 2. Analysis Performed

**Trust Level** (20/100): Imminent betrayal
- NPCs are on the edge of leaving/betraying
- Captain Vortis (15) will betray at first opportunity
- Lena (25) is untrustworthy, demands payment upfront
- Party itself is fractured

**Twist**: LOW trust should CREATE interesting gameplay
- NPCs DON'T share whispers (information starvation)
- Players must operate with incomplete information
- Betrayal happens DURING scenario (not just threatened)

### 3. Complete Scenario (Abbreviated)

```json
{
    "scenario_id": "gen_starving_village_004",
    "theme": "The Starving Village - Supply or Soldiers",
    "moral_type": "MUTUALLY_EXCLUSIVE",
    "difficulty": "extreme",

    "low_trust_mechanics": {
        "captain_vortis_betrayal": "At 15 approval, withholds critical info that supply caravan is poisoned, WANTS party to deliver poison to enemy (his real loyalty)",
        "lena_betrayal": "At 25 approval, demands payment before sharing that soldiers are deserters (they'll massacre village)",
        "party_fracture": "At 20 trust, Fighter and Thief don't trust each other's whispers"
    },

    "dilemma": {
        "village_needs": "Food OR protection (can only get one before winter hits)",
        "option_a": "Deliver supply caravan (poisoned - kills village)",
        "option_b": "Hire soldier company (deserters - massacre village)",
        "true_solution": "Requires REBUILDING trust by sharing whispers despite low trust"
    },

    "estimated_quality_score": "90/100 (shows low trust can be engaging)"
}
```

---

## Example 5: "The Mad Inventor"

### 1. Context Received

```
GENERATION REQUEST:
- Party Trust: 55/100
- Players: Ranger (HP 90/90), Cleric (HP 80/80), Fighter (HP 95/95), Mage (HP 75/75)
- NPCs: Professor Thaddeus (Approval 65/100)
- Divine Favor: ATHENA +50, MERCUS +10, DRAKMOR +30
- Location: Underground laboratory (dungeon/science)
- Previous Themes: [starving village, false accusation, cursed sanctuary]
- Moral Dilemma Type: MUTUALLY_EXCLUSIVE
- Difficulty: Medium
```

### 2. Analysis Performed

**Party Size**: 4 players! Need 4 distinct whispers
**Setting**: Rare steampunk/science location
**Theme**: Progress vs safety, invention vs tradition

### 3. Complete Scenario (Abbreviated)

```json
{
    "scenario_id": "gen_mad_inventor_005",
    "theme": "The Mad Inventor - Progress or Safety",
    "moral_type": "MUTUALLY_EXCLUSIVE",
    "difficulty": "medium",

    "four_player_whispers": {
        "fighter": "Inventor's steam engine is WEAPON-grade (military application obvious)",
        "mage": "Engine draws power from elemental plane (unstable, could tear reality)",
        "cleric": "Gods OPPOSE this invention (divine insight shows 6/8 gods want it destroyed)",
        "ranger": "Engine pollutes heavily (already killing nearby forest in test runs)"
    },

    "dilemma": {
        "inventor_claims": "Engine will revolutionize society (end poverty, enable flight, cure diseases)",
        "whispers_reveal": "ALL benefits are true, BUT invention is dangerous/offensive to gods/environmentally destructive/militarily dangerous",
        "choice": "Allow progress (with all its dangers) OR stop invention (lose all benefits)"
    },

    "complexity": "With 4 players, each has different priority (Fighter: security, Mage: magical safety, Cleric: divine will, Ranger: environment)",

    "estimated_quality_score": "87/100"
}
```

---

## Key Patterns Across All Examples

### Pattern 1: Context Drives Everything
- High trust (85) → NPCs share freely, party cohesive
- Medium trust (65, 55, 40) → Selective sharing, conditional cooperation
- Low trust (20) → Withholding, betrayal, fractured party

### Pattern 2: Class Whispers Never Repeat
- Fighter: Always tactical/combat (ambush, numbers, positioning)
- Mage: Always magical (auras, compulsions, curses)
- Thief: Always deception (lies, hidden motives, secrets)
- Ranger: Always nature (animals, plants, tracking)
- Cleric: Always divine/moral (soul state, god presence, holy/unholy)
- Bard: Always social (emotions, relationships, true feelings)

### Pattern 3: Moral Dilemmas Have No Perfect Answer
- MUTUALLY_EXCLUSIVE: Save A or B (both important)
- CONTRADICTORY: Info suggests opposite actions (both partly correct)
- COMPLEMENTARY: All info reveals no-win (full knowledge makes it harder)

### Pattern 4: Consequences Cascade
- Immediate (turn 1) → Short-term (turns 3-5) → Long-term (turns 5-10)
- Example: Use plague → 200 die → Cult forms → End-game civil war

### Pattern 5: Divine Votes Follow Logic
- VALDRIS: Law > chaos
- KAITHA: Freedom > authority
- MORVANE: Survival > principle
- SYLARA: Life > death
- KORVAN: Honor > dishonor
- ATHENA: Wisdom > foolishness
- MERCUS: Commerce > waste
- DRAKMOR: Boldness > passivity

---

## Usage Guide

### For AI Generating Scenarios:
1. Read context carefully
2. Apply appropriate patterns from examples
3. Ensure uniqueness (check theme history)
4. Verify quality with checklist
5. Deliver complete scenario JSON

### For Game Masters:
1. Use these as templates
2. Modify for your specific context
3. Focus on the PATTERNS, not the specific content
4. Run quality check before using

### For Players:
1. These examples show the VARIETY possible
2. No two scenarios should feel the same
3. If you see repetition, request regeneration

---

## Quality Scores Summary

| Scenario | Quality Score | Strengths |
|----------|---------------|-----------|
| The Informant's Dilemma | 92/100 | Excellent whisper design, clear stakes |
| The Cursed Sanctuary | 88/100 | Complex complementary info, high difficulty |
| The False Accusation | 85/100 | Strong contradiction, good social setting |
| The Starving Village | 90/100 | Low trust mechanics done well, betrayal integrated |
| The Mad Inventor | 87/100 | 4-player whispers handled, unique setting |

**Average**: 88.4/100 (High quality across all examples)

---

## Final Notes

These examples demonstrate:
- ✅ Context-driven generation
- ✅ Unique themes and NPCs per scenario
- ✅ Class-appropriate whispers that create tension
- ✅ Environmental elements enabling multiple solutions
- ✅ NPC behaviors matching approval ratings
- ✅ Genuine moral dilemmas with no perfect answers
- ✅ Clear, cascading consequences
- ✅ Logical Divine Council votes
- ✅ Solution path diversity

**Remember**: These are EXAMPLES, not templates to reuse. Generate fresh content for every scenario request.

---

**See also**:
- AI_SCENARIO_GENERATION_PATTERNS.md (pattern library)
- AI_SCENARIO_QUALITY_CHECKLIST.md (quality assurance)
