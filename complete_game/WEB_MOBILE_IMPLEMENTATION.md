# THE ARCANE CODEX - Web/Mobile Implementation Plan

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│           PLAYERS (1-4)                               │
│  📱 Mobile Phones  💻 Tablets  🖥️ Desktop Browsers   │
│         ↓              ↓              ↓               │
│         └──────────────┴──────────────┘               │
│                        │                              │
│              Responsive Web UI                        │
│              (HTML5 + CSS3 + JS)                      │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│           Flask Web Server (Python)                   │
│                 localhost:5000                        │
│                                                        │
│  • Session management (1-4 players per game)          │
│  • Real-time updates (polling or WebSocket)           │
│  • Asymmetric whisper delivery                        │
│  • Game state persistence                             │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│         Game Engine (arcane_codex_server.py)          │
│                                                        │
│  • Party trust tracking (0-100)                       │
│  • NPC approval ratings                               │
│  • Divine favor calculations                          │
│  • Turn resolution                                    │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│         Dynamic Content Generation                     │
│         (Claude Code = YOU request, I generate)        │
│                                                        │
│  • Unique scenarios per request                       │
│  • Asymmetric whispers by class                       │
│  • NPC behaviors adapted to state                     │
│  • NO STATIC CONTENT                                  │
└──────────────────────────────────────────────────────┘
```

## Core Features Implementation

### 1. Responsive Web UI

**Mobile-First Design**:
- Touch-friendly buttons (min 44x44px)
- Collapsible panels for info
- Swipe navigation
- Vertical scrolling optimized
- Works on 320px wide screens (iPhone SE)

**Tablet Optimization**:
- Side-by-side panels (public scene + player info)
- Larger touch targets
- More visible content

**Desktop Enhancement**:
- Full-width layout with sidebars
- Keyboard shortcuts
- Multi-panel view
- Richer animations

### 2. Multiplayer System (1-4 Players)

**Game Creation**:
```
Player 1 (Host):
1. Clicks "Create Game"
2. Gets game code: ABCD-1234
3. Shares code with friends

Players 2-4:
1. Enter game code
2. Choose character name
3. Complete Divine Interrogation
4. Join lobby

When all ready:
Host clicks "Start Adventure"
```

**Session Management**:
- Flask-Session for state
- Each game has unique session ID
- Players reconnect with same session
- Game state persists for 24 hours

### 3. Asymmetric Whispers

**How It Works**:
```
Public Scene (All players see):
┌─────────────────────────────────────────┐
│ Grimsby leads you to the warehouse.     │
│ Guards patrol the perimeter...          │
└─────────────────────────────────────────┘

Fighter's Whisper (Only Fighter sees):
┌─────────────────────────────────────────┐
│ 🔒 WHISPER - ONLY YOU SEE THIS          │
│                                          │
│ Your military training notices: These   │
│ guards are PROFESSIONALS, not standard  │
│ city watch. Someone important is inside.│
└─────────────────────────────────────────┘

Mage's Whisper (Only Mage sees):
┌─────────────────────────────────────────┐
│ 🔒 WHISPER - ONLY YOU SEE THIS          │
│                                          │
│ You sense dark magic. The crates inside │
│ radiate necromantic energy. Whatever is │
│ in there, it's been cursed.             │
└─────────────────────────────────────────┘
```

**Technical Implementation**:
- Each player has separate `/whisper/<player_id>` endpoint
- Polled every 5 seconds
- Whispers appear as notifications
- Can be toggled to show/hide

### 4. Dynamic Scenario Generation

**No Static Content - Workflow**:

```python
# WRONG (Static):
scenarios = {
    "heist": "You arrive at midnight...",
    "dragon": "A dragon appears..."
}

# RIGHT (Dynamic):
def request_scenario_from_claude_code():
    """
    User tells Claude Code:
    'Generate scenario for:
     - Party: Fighter (Alice HP 85), Mage (Bob HP 60)
     - Trust: 65/100
     - NPCs: Grimsby (approval 45), Renna (60)
     - Avoid theme: medicine heist'

    Claude Code generates completely unique scenario
    following GDD patterns from QUEST_SCENARIOS.md
    """
    pass
```

**You generate scenarios** by requesting from me (Claude Code):
1. Check current game state
2. Request scenario from me
3. I analyze state + previous themes
4. I generate unique content
5. You copy into game or I write to file

### 5. Technical Stack

**Backend (Python + Flask)**:
```python
# Dependencies
Flask==3.0.0
flask-cors==4.0.0
flask-session
python-dotenv

# Structure
web_game.py          # Main Flask app
├─ /api/create_game  # Create new game session
├─ /api/join_game    # Join existing game
├─ /api/start_interrogation  # Begin character creation
├─ /api/answer_question      # Answer Divine question
├─ /api/get_scene           # Get current public scene
├─ /api/get_whisper         # Get player's private whisper
├─ /api/submit_action       # Submit player action
├─ /api/get_state           # Get game state
└─ /api/council_vote        # Trigger Divine Council
```

**Frontend (HTML5 + CSS3 + Vanilla JS)**:
```
templates/
├─ index.html           # Landing page
├─ lobby.html           # Pre-game lobby
├─ interrogation.html   # Divine Interrogation
├─ game.html            # Main game interface
└─ council.html         # Divine Council voting scene

static/
├─ css/
│   ├─ game.css         # Main styles
│   └─ mobile.css       # Mobile overrides
└─ js/
    ├─ game.js          # Game logic
    └─ whisper.js       # Whisper polling
```

### 6. Mobile Responsive Design

**CSS Media Queries**:
```css
/* Mobile (320px - 767px) */
@media (max-width: 767px) {
    .game-container {
        flex-direction: column;
    }
    .sidebar {
        display: none; /* Collapsible */
    }
    .action-button {
        min-height: 44px; /* Touch friendly */
    }
}

/* Tablet (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
    .game-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
    .game-container {
        display: grid;
        grid-template-columns: 250px 1fr 300px;
    }
}
```

**Touch Gestures**:
- Swipe left/right: Navigate tabs
- Pull down: Refresh game state
- Long press: Show whisper details
- Pinch zoom: Disabled (fixed layout)

### 7. Game Flow (1-4 Players)

**Step 1: Game Creation**
```
Player 1 (Host):
→ Click "Create Game"
→ Select player count (1-4)
→ Get game code: XYZW-5678
→ Share code with friends
```

**Step 2: Player Join**
```
Players 2-4:
→ Enter game code
→ Enter character name
→ Start Divine Interrogation (in browser)
→ Answer 10 questions
→ Class assigned (Fighter/Mage/Thief/Cleric)
→ Wait in lobby
```

**Step 3: Game Start**
```
When all players ready:
→ Host clicks "Start Adventure"
→ Game begins in Valdria (safe town)
→ Public scene appears
→ NPCs introduced (Grimsby, Renna)
→ Party Trust: 50/100
```

**Step 4: First Scenario**
```
Host (you) requests scenario from Claude Code:
→ "Generate first scenario for 2 players..."
→ Claude Code generates unique quest
→ You input into game via API or UI
→ Public scene sent to all
→ Asymmetric whispers sent to each player
→ Players discuss and decide
```

**Step 5: Turn Resolution**
```
Players submit actions:
→ Fighter: "Attack guards"
→ Mage: "Detect magic on crates"
→ Actions resolved by game engine
→ Consequences applied (HP, trust, approval)
→ Divine Council may convene
→ Next turn begins
```

**Step 6: Divine Council**
```
When major moral choice made:
→ 7-8 gods vote on action
→ Each god has different values:
   • VALDRIS (Order): Judges by law
   • KAITHA (Chaos): Loves rule-breaking
   • MORVANE (Survival): Judges by results
   • SYLARA (Nature): Judges by compassion
   • KORVAN (War): Judges by honor
   • ATHENA (Wisdom): Judges by wisdom
   • MERCUS (Commerce): Judges by profit
   • DRAKMOR (Freedom): Judges by independence
→ Vote result affects party (blessings/curses)
→ Trust changes based on vote
```

## No Static Content Policy

### What You Do
1. Monitor game state (trust, approval, classes)
2. When scenario needed, request from me (Claude Code)
3. I generate unique content based on:
   - Current party composition
   - Trust level
   - NPC approval ratings
   - Divine favor
   - Previous scenario themes (to avoid repetition)
4. You copy generated content into game
5. Repeat for each new scenario

### What I Generate
- Public scenes (2-3 paragraphs, specific details)
- Asymmetric whispers (different per class)
- NPC behaviors (adapted to approval rating)
- Environmental tactics (BG3-style physics)
- Solution paths (5+ unique paths with consequences)
- Divine Council preview (how gods will likely vote)

### Example Generation Request
```
Request to Claude Code:

Generate The Arcane Codex scenario:
- Players: Fighter (Alice HP 85/100), Mage (Bob HP 60/100)
- Party Trust: 65/100 (Medium)
- NPCs:
  * Grimsby (Desperate Father, Approval 45 - nervous)
  * Renna (Vengeful Rogue, Approval 60 - warming up)
- Divine Favor:
  * VALDRIS: +35, KAITHA: +50, MORVANE: +40
- Previous Themes: [Medicine heist, Forest fire choice]
- Moral Dilemma Type: MUTUALLY_EXCLUSIVE (hardest)
- Setting: Urban (Thieves Guild territory)

Me (Claude Code) generates:
→ Complete unique scenario
→ Asymmetric whispers for Fighter/Mage
→ NPC behaviors based on approval
→ Environmental tactics
→ 5 solution paths
→ NO repetition of previous themes
```

## Quick Start Commands

### Run Web Server
```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
python web_game.py
```

Server starts on: http://localhost:5000

### Access from Mobile
1. Find computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac)
2. On phone, open browser: `http://192.168.1.X:5000`
3. Both desktop and mobile connect to same game

### Test on Different Devices
- Desktop: http://localhost:5000
- Phone: http://<your-ip>:5000
- Tablet: http://<your-ip>:5000

All devices can play in same game session.

## Implementation Priority

### Phase 1: Core Web UI (2-3 hours)
- [x] Flask server basics (web_game.py exists)
- [ ] Mobile-responsive HTML templates
- [ ] Divine Interrogation flow
- [ ] Basic game interface

### Phase 2: Multiplayer (2-3 hours)
- [ ] Game code system
- [ ] 1-4 player sessions
- [ ] Player join/leave handling
- [ ] Real-time state sync

### Phase 3: Asymmetric Whispers (1-2 hours)
- [ ] Whisper delivery per player
- [ ] Private endpoints per session
- [ ] Notification system
- [ ] Toggle visibility

### Phase 4: Dynamic Content Integration (1 hour)
- [ ] Scenario request documentation
- [ ] State analysis helpers
- [ ] Content insertion API
- [ ] Testing with generated scenarios

### Phase 5: Polish (2-3 hours)
- [ ] Mobile touch optimizations
- [ ] Loading states
- [ ] Error handling
- [ ] Reconnection logic

## Success Criteria

✅ Works on phones (320px+)
✅ Works on tablets (768px+)
✅ Works on desktop (1024px+)
✅ 1-4 players can join same game
✅ Each player gets different whispers
✅ NO static content - all generated dynamically
✅ Party trust tracking works
✅ NPC approval affects behavior
✅ Divine Council votes correctly

## Next Step

Tell me: "Start Phase 1 - Create mobile-responsive templates" and I'll build the complete HTML/CSS/JS interface.
