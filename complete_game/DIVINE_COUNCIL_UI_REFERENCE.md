# Divine Council UI/UX Visual Reference
**Frontend Design Mockups & Specifications**

---

## SCREEN FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: CONVENE (2s)                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │                  ⚖️🔥💀🌿⚔️📚💰                          │ │
│ │                                                           │ │
│ │               THE GODS CONVENE                            │ │
│ │                                                           │ │
│ │              [Pulsing divine symbols]                     │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: ACTION PRESENTED (3s)                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ╔════════════════════════════════════════════════════╗  │ │
│ │ ║           THE ACTION JUDGED                        ║  │ │
│ │ ╠════════════════════════════════════════════════════╣  │ │
│ │ ║                                                    ║  │ │
│ │ ║  "You swore an oath to save the village, then     ║  │ │
│ │ ║   broke that oath to pursue personal vengeance    ║  │ │
│ │ ║   instead."                                        ║  │ │
│ │ ║                                                    ║  │ │
│ │ ╚════════════════════════════════════════════════════╝  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: VOTES REVEAL (1.5s each × 7 = 10.5s)              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ ⚖️ VALDRIS                      Favor: +45       │   │ │
│ │ │ "Oaths are sacred. This betrayal cannot stand   │   │ │
│ │ │  unpunished."                                     │   │ │
│ │ │ ❌ OPPOSE                        Weight: 1.45x   │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ 🔥 KAITHA                       Favor: -30       │   │ │
│ │ │ "Vengeance burns hotter than duty. I respect     │   │ │
│ │ │  the choice."                                     │   │ │
│ │ │ ✅ SUPPORT                       Weight: 0.70x   │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │ [... 5 more gods reveal sequentially ...]              │ │
│ │                                                         │ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ RUNNING TALLY:                                    │   │ │
│ │ │ ├────────────┼────────────────────────────┤      │   │ │
│ │ │ -14      ●0.0           +14                       │   │ │
│ │ │          Score: -2.3                              │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: OUTCOME (4s)                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ╔═══════════════════════════════════════════════════╗  │ │
│ │ ║     ⚠️ NARROW OPPOSITION ⚠️                       ║  │ │
│ │ ║                                                   ║  │ │
│ │ ║   Raw Votes: 2 Support - 4 Oppose - 1 Abstain    ║  │ │
│ │ ║   Weighted Score: -2.3 / 14.0                     ║  │ │
│ │ ║                                                   ║  │ │
│ │ ║   "The gods condemn your broken oath"            ║  │ │
│ │ ╚═══════════════════════════════════════════════════╝  │ │
│ │                                                         │ │
│ │              [Flash red effect]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: CONSEQUENCES (5s)                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DIVINE JUDGMENT                                         │ │
│ │                                                         │ │
│ │ FAVOR CHANGES:                                          │ │
│ │ • VALDRIS:  -10  (was +45, now +35)                    │ │
│ │ • KORVAN:   -10  (was +20, now +10)                    │ │
│ │ • ATHENA:   -8   (was +35, now +27)                    │ │
│ │ • MORVANE:  -8   (was +10, now +2)                     │ │
│ │ • KAITHA:   +8   (was -30, now -22)                    │ │
│ │ • SYLARA:    0   (was +60, now +60)                    │ │
│ │ • MERCUS:    0   (was -15, now -15)                    │ │
│ │                                                         │ │
│ │ DIVINE EFFECTS:                                         │ │
│ │ ┌──────────────────────────────────────────────────┐  │ │
│ │ │ 🔻 Divine Disfavor                               │  │ │
│ │ │ The gods are displeased. Their judgment weighs   │  │ │
│ │ │ heavy upon you.                                   │  │ │
│ │ │                                                   │  │ │
│ │ │ • All skill checks: -8%                          │  │ │
│ │ │ • NPC reactions: -10                             │  │ │
│ │ │ • Duration: 10 turns                             │  │ │
│ │ └──────────────────────────────────────────────────┘  │ │
│ │                                                         │ │
│ │                  [CONTINUE]                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## DESKTOP LAYOUT (1920x1080)

```css
/* divine_council.css */

.council-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
}

.council-container.active {
    opacity: 1;
    pointer-events: all;
}

/* Phase 1: Convene */
.council-convene {
    text-align: center;
    animation: fadeIn 1s ease;
}

.divine-title {
    font-size: 48px;
    font-family: 'Cinzel', serif;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    margin-bottom: 40px;
    letter-spacing: 4px;
}

.divine-symbols {
    font-size: 64px;
    display: flex;
    gap: 30px;
    justify-content: center;
}

.god-symbol {
    animation: pulse 2s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
}

/* Phase 2: Action Judged */
.action-judged {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.3));
    border: 2px solid #9370DB;
    border-radius: 15px;
    padding: 40px 60px;
    max-width: 800px;
    box-shadow: 0 0 40px rgba(147, 112, 219, 0.5);
    animation: slideIn 1s ease;
}

.action-judged h3 {
    color: #FFD700;
    font-size: 28px;
    margin-bottom: 20px;
    text-align: center;
    font-family: 'Cinzel', serif;
}

.action-judged p {
    color: #E6E6FA;
    font-size: 20px;
    line-height: 1.6;
    text-align: center;
}

/* Phase 3: Votes */
.votes-container {
    width: 90%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.vote-tally {
    position: relative;
    height: 60px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    margin-bottom: 30px;
    border: 2px solid #9370DB;
}

.tally-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 50px;
    background: #9370DB;
    border-radius: 5px;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease;
    box-shadow: 0 0 20px currentColor;
}

.tally-score {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 10px black;
}

.votes-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.vote-card {
    display: grid;
    grid-template-columns: 200px 1fr 150px;
    gap: 20px;
    align-items: center;
    background: rgba(30, 0, 60, 0.6);
    border: 2px solid #6A5ACD;
    border-radius: 10px;
    padding: 20px;
    opacity: 0;
    transform: translateX(-50px);
    transition: all 0.5s ease;
}

.vote-card.visible {
    opacity: 1;
    transform: translateX(0);
}

.vote-god {
    font-size: 20px;
    font-weight: bold;
    color: #FFD700;
    display: flex;
    align-items: center;
    gap: 10px;
}

.vote-position {
    font-size: 18px;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 8px;
    text-align: center;
}

.vote-position.support {
    background: rgba(0, 255, 0, 0.2);
    color: #90EE90;
    border: 2px solid #32CD32;
}

.vote-position.oppose {
    background: rgba(255, 0, 0, 0.2);
    color: #FF6B6B;
    border: 2px solid #DC143C;
}

.vote-position.abstain {
    background: rgba(128, 128, 128, 0.2);
    color: #C0C0C0;
    border: 2px solid #808080;
}

.vote-weight {
    color: #E6E6FA;
    font-size: 16px;
    text-align: right;
}

/* Phase 4: Outcome */
.outcome-screen {
    text-align: center;
    animation: zoomIn 1s ease;
}

.outcome-title {
    font-size: 56px;
    font-family: 'Cinzel', serif;
    margin-bottom: 30px;
    text-shadow: 0 0 30px currentColor;
    animation: flashOnce 0.5s ease;
}

.outcome-positive {
    color: #FFD700;
}

.outcome-negative {
    color: #DC143C;
}

.outcome-neutral {
    color: #9370DB;
}

.outcome-details {
    background: rgba(0, 0, 0, 0.5);
    padding: 30px;
    border-radius: 15px;
    border: 2px solid currentColor;
    max-width: 600px;
    margin: 0 auto;
}

.outcome-details p {
    color: #E6E6FA;
    font-size: 20px;
    margin: 10px 0;
}

/* Phase 5: Consequences */
.consequences-screen {
    max-width: 800px;
    background: rgba(20, 0, 40, 0.8);
    border: 3px solid #9370DB;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 0 50px rgba(147, 112, 219, 0.6);
}

.consequences-screen h3 {
    color: #FFD700;
    font-size: 36px;
    text-align: center;
    margin-bottom: 30px;
    font-family: 'Cinzel', serif;
}

.favor-changes {
    margin-bottom: 30px;
}

.favor-changes h4 {
    color: #9370DB;
    font-size: 24px;
    margin-bottom: 15px;
}

.favor-changes p {
    font-size: 18px;
    margin: 8px 0;
    padding-left: 20px;
}

.favor-changes .positive {
    color: #90EE90;
}

.favor-changes .negative {
    color: #FF6B6B;
}

.divine-effects {
    margin-bottom: 30px;
}

.divine-effects h4 {
    color: #9370DB;
    font-size: 24px;
    margin-bottom: 15px;
}

.effect-card {
    background: rgba(138, 43, 226, 0.2);
    border: 2px solid #6A5ACD;
    border-radius: 10px;
    padding: 20px;
    margin: 15px 0;
}

.effect-card h5 {
    color: #FFD700;
    font-size: 22px;
    margin-bottom: 10px;
}

.effect-card p {
    color: #E6E6FA;
    font-size: 16px;
    margin: 5px 0;
}

.effect-card .duration {
    color: #C0C0C0;
    font-style: italic;
    margin-top: 10px;
}

.consequences-screen button {
    width: 100%;
    padding: 15px;
    font-size: 20px;
    font-weight: bold;
    background: linear-gradient(135deg, #9370DB, #6A5ACD);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
}

.consequences-screen button:hover {
    background: linear-gradient(135deg, #6A5ACD, #483D8B);
    box-shadow: 0 0 20px rgba(147, 112, 219, 0.8);
    transform: scale(1.05);
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.5);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes flashOnce {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
```

---

## MOBILE LAYOUT (375x667 - iPhone SE)

```css
/* Mobile Responsive */
@media (max-width: 768px) {
    .divine-title {
        font-size: 28px;
        letter-spacing: 2px;
    }

    .divine-symbols {
        font-size: 36px;
        gap: 15px;
        flex-wrap: wrap;
    }

    .action-judged {
        padding: 20px 30px;
        max-width: 90%;
    }

    .action-judged h3 {
        font-size: 20px;
    }

    .action-judged p {
        font-size: 16px;
    }

    .votes-container {
        width: 95%;
    }

    .vote-tally {
        height: 40px;
        margin-bottom: 20px;
    }

    .tally-score {
        font-size: 18px;
    }

    .vote-card {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        padding: 15px;
        gap: 10px;
    }

    .vote-god {
        font-size: 18px;
    }

    .vote-position {
        font-size: 16px;
        padding: 8px 15px;
    }

    .vote-weight {
        text-align: left;
        font-size: 14px;
    }

    .outcome-title {
        font-size: 28px;
    }

    .outcome-details {
        padding: 20px;
    }

    .outcome-details p {
        font-size: 16px;
    }

    .consequences-screen {
        max-width: 95%;
        padding: 20px;
    }

    .consequences-screen h3 {
        font-size: 24px;
    }

    .favor-changes h4,
    .divine-effects h4 {
        font-size: 18px;
    }

    .favor-changes p {
        font-size: 14px;
    }

    .effect-card {
        padding: 15px;
    }

    .effect-card h5 {
        font-size: 18px;
    }

    .effect-card p {
        font-size: 14px;
    }

    .consequences-screen button {
        font-size: 18px;
        padding: 12px;
    }
}
```

---

## COLOR PALETTE

```css
/* Divine Council Color System */
:root {
    /* Background */
    --council-bg-dark: #1a0033;
    --council-bg-darker: #0a0015;
    --council-overlay: rgba(20, 0, 40, 0.8);

    /* Primary Colors */
    --divine-gold: #FFD700;
    --divine-purple: #9370DB;
    --divine-indigo: #6A5ACD;

    /* Outcome Colors */
    --blessing-gold: #FFD700;
    --curse-red: #DC143C;
    --neutral-purple: #9370DB;
    --support-green: #90EE90;
    --oppose-red: #FF6B6B;
    --abstain-gray: #C0C0C0;

    /* God Colors */
    --valdris-gold: #FFD700;
    --kaitha-orange: #FF4500;
    --morvane-purple: #800080;
    --sylara-green: #228B22;
    --korvan-crimson: #DC143C;
    --athena-blue: #4169E1;
    --mercus-gold: #FFD700;

    /* Text */
    --text-light: #E6E6FA;
    --text-white: #FFFFFF;
    --text-shadow: rgba(0, 0, 0, 0.8);
}
```

---

## ANIMATION TIMING CHART

```
TIME (s)  EVENT                           VISUAL
─────────────────────────────────────────────────────────
0.0       Council triggered               Screen fades to black
0.5       Convene begins                  Divine symbols appear
1.0       Symbols pulse                   Pulsing animation starts
2.0       Action presented                Action text types in
5.0       First vote reveals              VALDRIS speech appears
6.5       Second vote reveals             KAITHA speech appears
8.0       Third vote reveals              MORVANE speech appears
9.5       Fourth vote reveals             SYLARA speech appears
11.0      Fifth vote reveals              KORVAN speech appears
12.5      Sixth vote reveals              ATHENA speech appears
14.0      Seventh vote reveals            MERCUS speech appears
15.5      All votes shown                 Tally bar at final position
16.0      Outcome reveal                  Title zooms in with flash
20.0      Consequences appear             Favor changes scroll
25.0      Continue button active          Player can proceed
─────────────────────────────────────────────────────────
TOTAL: ~30 seconds (optimal engagement time)
```

---

## ACCESSIBILITY FEATURES

### Screen Reader Support

```html
<!-- Add ARIA labels -->
<div class="vote-card" role="article" aria-label="Divine vote from Valdris">
    <div class="vote-god" aria-label="God name">
        <span aria-hidden="true">⚖️</span>
        <span>VALDRIS</span>
    </div>
    <div class="vote-position support" aria-label="Vote position: Support">
        ✅ SUPPORT
    </div>
    <div class="vote-weight" aria-label="Vote weight: 1.45 times">
        Weight: 1.45x
    </div>
</div>
```

### Keyboard Navigation

```javascript
// Add keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        divineCouncilUI.close();
    }
    if (e.key === 'Enter' || e.key === ' ') {
        // Speed up animations
        divineCouncilUI.animationSpeed = 200;
    }
});
```

### Reduced Motion

```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
    .god-symbol,
    .vote-card,
    .outcome-title {
        animation: none !important;
        transition: none !important;
    }

    .vote-card {
        opacity: 1;
        transform: none;
    }
}
```

---

## SOUND DESIGN RECOMMENDATIONS

```javascript
// Sound effects for immersion
const COUNCIL_SOUNDS = {
    convene: 'divine_bells.mp3',           // Deep, resonant bells
    vote_reveal: 'magic_whoosh.mp3',       // Soft magical whoosh
    support: 'angelic_chord.mp3',          // Pleasant chord
    oppose: 'ominous_tone.mp3',            // Discordant tone
    abstain: 'neutral_hum.mp3',            // Neutral hum
    blessing: 'divine_chorus.mp3',         // Angelic singing
    curse: 'demonic_growl.mp3',            // Ominous rumble
    deadlock: 'reality_crack.mp3',         // Reality tearing sound
    continue: 'menu_select.mp3'            // UI confirmation
};

function playCouncilSound(soundKey) {
    const audio = new Audio(`/static/sounds/${COUNCIL_SOUNDS[soundKey]}`);
    audio.volume = 0.5;
    audio.play();
}
```

---

## PERFORMANCE OPTIMIZATION

### Lazy Loading

```javascript
// Only load council UI when needed
async function loadCouncilUI() {
    if (!window.divineCouncilUI) {
        const [css, js] = await Promise.all([
            import('/static/css/divine_council.css'),
            import('/static/js/divine_council_ui.js')
        ]);

        window.divineCouncilUI = new DivineCouncilUI();
    }
}
```

### Animation Performance

```css
/* Use GPU acceleration */
.vote-card {
    will-change: transform, opacity;
    transform: translateZ(0);
}

.tally-bar {
    will-change: left, background-color;
    transform: translateZ(0);
}
```

---

## TESTING SCENARIOS

### Visual Regression Tests

1. **Unanimous Blessing** - All gold, angelic effects
2. **Unanimous Curse** - All red, ominous effects
3. **Deadlock** - Purple, reality distortion
4. **Mixed Votes** - Ensure tally updates correctly
5. **Mobile Layout** - Verify responsive design
6. **Long Action Text** - Test text overflow handling

### User Flow Tests

1. **Skip Animation** - Press spacebar to speed up
2. **Close Early** - Press escape to close
3. **Multiple Councils** - Ensure state resets properly
4. **Favor Display** - Verify favor changes accumulate

---

## FINAL CHECKLIST

- [ ] Desktop layout (1920x1080) tested
- [ ] Mobile layout (375x667) tested
- [ ] Tablet layout (768x1024) tested
- [ ] All 7 outcome types display correctly
- [ ] Animations run smoothly (60 FPS)
- [ ] Sound effects sync with visuals
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Reduced motion mode works
- [ ] Vote tally updates accurately
- [ ] Favor changes persist to database
- [ ] Effects apply to gameplay

---

**This UI reference provides complete visual specifications for implementing the Divine Council voting interface. Use alongside the Implementation Guide for full development.**
