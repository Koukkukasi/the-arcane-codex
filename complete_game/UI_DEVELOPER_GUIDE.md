# The Arcane Codex - UI Developer Guide

**Last Updated:** November 6, 2025
**Status:** Production Ready

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [CSS Customization Guide](#css-customization-guide)
4. [JavaScript Development](#javascript-development)
5. [HTML Template Structure](#html-template-structure)
6. [Common Tasks](#common-tasks)
7. [Debugging Tips](#debugging-tips)
8. [Performance Optimization](#performance-optimization)

---

## Project Overview

### What is This?

The Arcane Codex UI is a production-ready web interface for a multiplayer RPG game. It uses vanilla HTML, CSS, and JavaScript with no external frameworks.

### Key Statistics

- **Total Code:** 2,593 lines
- **CSS:** 1,462 lines with 40+ design tokens
- **JavaScript:** 769 lines in single class
- **HTML:** 362 lines across 2 templates
- **Animations:** 31 keyframe animations
- **API Endpoints:** 13 game endpoints
- **Responsive Breakpoints:** 4 levels

### Architecture

```
ArcaneCodexGame (Single Class)
├── Session Management (localStorage)
├── API Integration (Fetch-based)
├── Game Loop (2000ms polling)
├── Screen Management (6 screens)
└── UI Updates (DOM manipulation)
```

---

## Directory Structure

```
complete_game/
├── templates/
│   ├── index.html          # Landing page
│   └── game.html           # Main game interface
├── static/
│   ├── css/
│   │   └── game.css        # Complete stylesheet (1,462 lines)
│   └── js/
│       └── game.js         # Client code (769 lines)
├── web_game.py             # Flask backend
├── arcane_codex_server.py   # Game server
└── [Other backend files]
```

### File Purposes

| File | Purpose | Size |
|------|---------|------|
| templates/index.html | Landing page, game creation/joining | 126 lines |
| templates/game.html | Main game interface, 6 screens | 236 lines |
| static/css/game.css | Design system, styling, animations | 1,462 lines |
| static/js/game.js | Client logic, API calls, state | 769 lines |

---

## CSS Customization Guide

### Understanding the Design System

All styling is built on CSS custom properties defined in `:root`:

```css
:root {
  --color-primary: #8B5CF6;
  --color-accent: #F59E0B;
  --color-bg-primary: #0F0F17;
  /* ... 40+ more variables ... */
}
```

### Changing Colors

#### Primary Color (Purple)

To change the primary purple color throughout the app:

```css
:root {
  /* Old */
  --color-primary: #8B5CF6;
  --color-primary-dark: #6D28D9;
  --color-primary-light: #A78BFA;

  /* New - your colors */
  --color-primary: #YOUR_COLOR;
  --color-primary-dark: #YOUR_DARKER_COLOR;
  --color-primary-light: #YOUR_LIGHTER_COLOR;
}
```

**Affected Elements:**
- All primary buttons
- Form input focus states
- Primary text colors
- Borders and glows
- Progress bars
- Trust meter

#### Accent Color (Gold)

To change the accent gold color:

```css
:root {
  --color-accent: #F59E0B;        /* Main accent */
  --color-accent-dark: #D97706;
  --color-accent-light: #FCD34D;
}
```

**Affected Elements:**
- Secondary text accents
- Class badges
- Code display
- Whisper icons
- Hover effects

#### Background Colors

Four levels of background darkness:

```css
:root {
  --color-bg-primary: #0F0F17;    /* Darkest - body background */
  --color-bg-secondary: #1A1A2E;  /* Header, sections */
  --color-bg-tertiary: #252540;   /* Cards, panels */
  --color-bg-card: #2A2A45;       /* Question cards, etc */
}
```

**Pro Tip:** Maintain the hierarchy (primary darkest, card lightest) for proper contrast.

#### Status Colors

```css
--color-success: #10B981;  /* Green - positive effects */
--color-warning: #F59E0B;  /* Orange - warnings */
--color-danger: #EF4444;   /* Red - errors, negative */
--color-info: #3B82F6;     /* Blue - information */
```

### Modifying Spacing

All spacing is based on 8px units:

```css
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */
--space-3xl: 4rem;      /* 64px */
```

**To increase all spacing by 50%:**

```css
:root {
  --space-xs: 0.375rem;   /* 6px */
  --space-sm: 0.75rem;    /* 12px */
  --space-md: 1.5rem;     /* 24px */
  /* etc... */
}
```

### Modifying Typography

Typography is also scalable:

```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

**To make all text 10% larger:**

```css
:root {
  --text-xs: 0.825rem;
  --text-sm: 0.9625rem;
  --text-base: 1.1rem;
  /* etc... */
}
```

### Creating a New Button Style

All buttons inherit from `.btn` class:

```css
.btn {
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-default);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}
```

To add a new button variant:

```css
.btn-tertiary {
  background: var(--color-bg-tertiary);
  color: var(--color-accent);
  border: 2px solid var(--color-accent);
}

.btn-tertiary:hover {
  background: var(--color-accent);
  color: white;
}
```

Then in HTML:

```html
<button class="btn btn-tertiary">Tertiary Action</button>
```

### Adding Animations

Animations are defined as keyframes and applied to elements:

```css
/* Define the animation */
@keyframes myAnimation {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Apply to element */
.my-element {
  animation: myAnimation var(--duration-normal) var(--easing-default);
}
```

**Animation Tokens:**
- `--duration-fast: 150ms`
- `--duration-normal: 300ms`
- `--duration-slow: 500ms`
- `--easing-default: cubic-bezier(0.4, 0, 0.2, 1)`
- `--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Responsive Design

Mobile-first approach with breakpoints:

```css
/* Mobile first (320px+) */
.element {
  font-size: var(--text-base);
  padding: var(--space-md);
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .element {
    font-size: var(--text-lg);
    padding: var(--space-lg);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .element {
    font-size: var(--text-xl);
    padding: var(--space-xl);
  }
}
```

### Organizing CSS Changes

The CSS file is organized in sections (search for these headers):

1. **CSS Variables & Design Tokens** - Define all reusable values
2. **Global Reset & Base Styles** - Browser resets
3. **Typography** - Font sizes and styles
4. **Landing Page Styles** - Landing page components
5. **Game Page Styles** - Game interface styles
6. **Component Styles** - Individual component styling
7. **Animation Keyframes** - Animation definitions
8. **Responsive Design** - Media queries
9. **Accessibility** - Motion and contrast preferences
10. **Print Styles** - Printing styles

---

## JavaScript Development

### Understanding the ArcaneCodexGame Class

The entire client is one class with organized methods:

```javascript
class ArcaneCodexGame {
  // Constructor & initialization
  constructor()
  initLandingPage()
  initGameInterface()

  // Session management
  loadPlayerSession()
  savePlayerSession()
  clearPlayerSession()

  // API methods
  async apiRequest(endpoint, method, body)
  async createGame(playerName)
  // ... 11 more API methods

  // Event handlers
  async handleCreateGame(form)
  async handleJoinGame(form)
  setupMenuToggle()
  setupChoiceInput()

  // Game loop
  async startGameLoop()
  async updateGameState()

  // Screen management
  showScreen(screenId)
  async showInterrogationScreen(state)
  // ... 5 more screen methods

  // UI updates
  updateGameHeader(response)
  updateCharacterInfo(response)
  // ... 6 more update methods
}
```

### Adding a New API Endpoint

1. **Add the method to ArcaneCodexGame:**

```javascript
async myNewEndpoint(param1, param2) {
  return await this.apiRequest('/my_endpoint', 'POST', {
    param_1: param1,
    param_2: param2
  });
}
```

2. **Use it in the game loop or event handler:**

```javascript
async updateGameState() {
  // ... existing code ...

  const result = await this.myNewEndpoint('value1', 'value2');
  this.updateSomeUI(result);
}
```

3. **Add error handling if needed:**

```javascript
async myNewEndpoint(param1) {
  try {
    return await this.apiRequest('/my_endpoint', 'POST', {
      param: param1
    });
  } catch (error) {
    console.error('Endpoint failed:', error);
    this.showError('Could not complete action: ' + error.message);
    throw error;
  }
}
```

### Adding a New Screen

1. **Add HTML in templates/game.html:**

```html
<div id="my-screen" class="game-screen" style="display: none;">
  <div class="screen-header">
    <h2 class="screen-title">My Screen Title</h2>
  </div>
  <div id="my-content" class="screen-content">
    <!-- Content goes here -->
  </div>
</div>
```

2. **Add display method in game.js:**

```javascript
async showMyScreen(state) {
  this.showScreen('my');  // Matches 'my-screen' ID

  // Update screen content
  const content = document.getElementById('my-content');
  content.innerHTML = `
    <p>Screen content: ${state.someData}</p>
  `;
}
```

3. **Call from updateGameState:**

```javascript
async updateGameState() {
  const state = await this.getGameState();

  // ... existing state handling ...

  if (state.phase === 'my_phase') {
    this.showMyScreen(state);
  }
}
```

### Modifying the Game Loop

The game loop runs every 2 seconds (POLLING_DELAY):

```javascript
// In constructor:
this.POLLING_DELAY = 2000;  // Change this to adjust frequency

// In startGameLoop:
this.pollingInterval = setInterval(() => {
  this.updateGameState();
}, this.POLLING_DELAY);
```

**Performance Considerations:**
- Lower interval = more responsive but more API calls
- 2000ms (2 seconds) is a good balance
- Don't go below 1000ms for production
- Each call hits the backend

### Handling API Errors

Errors are automatically shown to users:

```javascript
// This automatically calls showError()
const response = await this.apiRequest('/endpoint');

// Or handle manually:
try {
  const response = await this.apiRequest('/endpoint');
  // Use response...
} catch (error) {
  console.error('Error:', error);
  // Already showed error to user
  // Optional: do something additional
}
```

**Error Display:**
- Landing page: Red error div in form
- Game page: Toast notification (top-right, fixed position)

### Debugging API Calls

Add logging to see what's happening:

```javascript
async apiRequest(endpoint, method = 'GET', body = null) {
  console.log(`API: ${method} ${endpoint}`, body);

  const options = { /* ... */ };

  try {
    const response = await fetch(`${this.API_BASE}${endpoint}`, options);
    console.log(`Response: ${response.status}`, response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Data:`, data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    this.showError(error.message);
    throw error;
  }
}
```

Then check browser console (F12) for logs.

### State Management with localStorage

Player session is persisted:

```javascript
savePlayerSession() {
  if (this.playerId) {
    localStorage.setItem('arcane_player_id', this.playerId);
  }
  if (this.gameCode) {
    localStorage.setItem('arcane_game_code', this.gameCode);
  }
}

loadPlayerSession() {
  const savedPlayerId = localStorage.getItem('arcane_player_id');
  const savedGameCode = localStorage.getItem('arcane_game_code');

  if (savedPlayerId) this.playerId = savedPlayerId;
  if (savedGameCode) this.gameCode = savedGameCode;
}
```

To add new persistent data:

```javascript
// Save
localStorage.setItem('myKey', 'myValue');

// Load
const value = localStorage.getItem('myKey');

// Clear
localStorage.removeItem('myKey');
```

---

## HTML Template Structure

### Landing Page (templates/index.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags and CSS -->
  </head>
  <body class="landing-page">
    <div class="container">
      <header class="game-header">
        <!-- Title -->
      </header>

      <main class="landing-content">
        <div class="features-grid">
          <!-- Feature cards -->
        </div>

        <div class="game-actions">
          <!-- Create and join forms -->
        </div>

        <div id="error-message"></div>
        <div id="loading-overlay"></div>
      </main>

      <footer class="game-footer">
        <!-- Footer info -->
      </footer>
    </div>

    <script src="/static/js/game.js"></script>
  </body>
</html>
```

### Game Interface (templates/game.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags and CSS -->
  </head>
  <body class="game-page">
    <div class="game-container">
      <header class="game-header-bar">
        <!-- Game code, player count, trust meter -->
      </header>

      <div class="game-layout">
        <main class="game-main">
          <!-- Six game screens -->
          <div id="interrogation-screen">...</div>
          <div id="scenario-screen">...</div>
          <div id="waiting-screen">...</div>
          <div id="results-screen">...</div>
          <div id="creation-complete-screen">...</div>
        </main>

        <aside id="game-sidebar">
          <!-- Character info, party, NPCs -->
        </aside>
      </div>

      <div id="error-toast"></div>
      <div id="loading-overlay"></div>
    </div>

    <script src="/static/js/game.js"></script>
  </body>
</html>
```

### Key DOM IDs (JavaScript Uses These)

```javascript
// Forms
'create-game-form'
'join-game-form'

// Landing Page
'creator-name'
'game-code'
'player-name'
'error-message'

// Game Header
'game-code'        // Display
'player-count'
'trust-bar'
'trust-value'
'menu-toggle'

// Screens
'interrogation-screen'
'scenario-screen'
'waiting-screen'
'results-screen'
'creation-complete-screen'

// Question Screen
'question-number'
'progress-fill'
'question-text'
'answer-options'

// Scenario Screen
'public-description'
'whisper-content'
'choice-input'
'char-count'
'submit-choice'

// Sidebar
'game-sidebar'
'player-name'
'player-class'
'hp-fill'
'hp-text'
'mana-fill'
'mana-text'
'players-container'
'npcs-container'
'leave-game'
```

---

## Common Tasks

### Task 1: Change the Theme Color

**Want to change from purple to blue?**

1. Open `static/css/game.css`
2. Find `:root {` at the top
3. Change these lines:

```css
--color-primary: #8B5CF6;        /* From purple */
--color-primary-dark: #6D28D9;
--color-primary-light: #A78BFA;

/* To blue: */
--color-primary: #3B82F6;        /* Blue */
--color-primary-dark: #1E40AF;
--color-primary-light: #60A5FA;
```

4. Save and refresh browser

All buttons, text, borders, and effects using the primary color will update automatically.

### Task 2: Add a New Form Field

1. In `templates/index.html` or `templates/game.html`:

```html
<div class="form-group">
  <label for="my-field">Field Label</label>
  <input
    type="text"
    id="my-field"
    name="fieldName"
    placeholder="Placeholder text"
    maxlength="20"
    required
    aria-label="Field description"
  >
</div>
```

2. In `static/js/game.js`, update the handler:

```javascript
async handleCreateGame(form) {
  const formData = new FormData(form);
  const playerName = formData.get('playerName').trim();
  const myField = formData.get('fieldName').trim();  // Add this

  if (!playerName || !myField) {
    this.showError('Please fill in all fields');
    return;
  }

  // ... rest of code ...
}
```

### Task 3: Update Colors Based on Game State

**Want to change button color based on game state?**

In JavaScript:

```javascript
updateGameState() {
  const state = await this.getGameState();

  // Change button color based on trust level
  const button = document.getElementById('submit-choice');

  if (state.trust_level > 75) {
    button.style.background = 'linear-gradient(135deg, #10B981, #059669)';  // Green
  } else if (state.trust_level > 50) {
    button.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';  // Orange
  } else {
    button.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';  // Red
  }
}
```

Or better, use CSS classes:

```css
.btn-trust-high {
  background: linear-gradient(135deg, #10B981, #059669);
}
.btn-trust-medium {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}
.btn-trust-low {
  background: linear-gradient(135deg, #EF4444, #DC2626);
}
```

JavaScript:

```javascript
button.className = 'btn btn-primary btn-trust-' +
  (state.trust_level > 75 ? 'high' :
   state.trust_level > 50 ? 'medium' : 'low');
```

### Task 4: Add Sound Effects

Create a helper in JavaScript:

```javascript
playSound(soundName) {
  const sounds = {
    'click': '/static/sounds/click.mp3',
    'success': '/static/sounds/success.mp3',
    'error': '/static/sounds/error.mp3'
  };

  if (sounds[soundName]) {
    const audio = new Audio(sounds[soundName]);
    audio.play().catch(err => console.error('Sound failed:', err));
  }
}
```

Then use it:

```javascript
async selectAnswer(questionIndex, answerIndex) {
  this.playSound('click');
  // ... rest of code ...
}
```

### Task 5: Add Tooltips

Add HTML:

```html
<button class="btn btn-primary" title="Click to submit your answer">
  Submit Answer
</button>
```

The `title` attribute provides browser tooltips automatically.

For custom tooltips, add CSS:

```css
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 999;
  margin-bottom: 4px;
}
```

---

## Debugging Tips

### 1. Check Browser Console

Press `F12` in browser to open Developer Tools.

Look at:
- **Console tab:** JavaScript errors and logs
- **Network tab:** API calls and responses
- **Application tab:** LocalStorage data

### 2. Common Issues

**Forms not submitting:**
```javascript
// Check that form ID matches in JavaScript
// In HTML: id="create-game-form"
// In JS: getElementById('create-game-form')
```

**Buttons not working:**
```javascript
// Check that button ID matches
// Check that event handler is attached
console.log('Button:', document.getElementById('my-button'));
```

**Styling not applying:**
```javascript
// Check CSS class name matches HTML
// Check media query breakpoints
// Open DevTools > Inspect Element to see computed styles
```

**API calls failing:**
```javascript
// Check in Network tab what request was sent
// Check response status code
// Check response body for error message
// Check backend logs
```

### 3. Useful Debug Techniques

Add logging:

```javascript
updateGameState() {
  console.log('Polling...', new Date());

  const state = await this.getGameState();
  console.log('State:', state);

  this.showScreen('interrogation');
  console.log('Screen shown');
}
```

Check element visibility:

```javascript
const screen = document.getElementById('my-screen');
console.log('Display:', screen.style.display);
console.log('Visible:', screen.offsetHeight > 0);
```

Check localStorage:

```javascript
// In browser console:
localStorage
localStorage.getItem('arcane_player_id')
localStorage.setItem('test', 'value')
localStorage.removeItem('test')
```

---

## Performance Optimization

### 1. Minify for Production

Before deploying:

```bash
# Install minifier (example with cssnano for CSS)
npm install -g cssnano csso-cli

# Minify CSS
csso static/css/game.css -o static/css/game.min.css

# Minify JavaScript (use UglifyJS or similar)
npm install -g uglify-js
uglifyjs static/js/game.js -o static/js/game.min.js

# Update HTML to reference minified files
# Change: <link rel="stylesheet" href="/static/css/game.css">
# To: <link rel="stylesheet" href="/static/css/game.min.css">
```

### 2. Enable Gzip Compression

In Flask (web_game.py):

```python
from flask_compress import Compress

app = Flask(__name__)
Compress(app)
```

### 3. Cache Static Files

Add headers in Flask:

```python
@app.after_request
def add_header(response):
  response.cache_control.max_age = 86400  # 24 hours
  return response
```

### 4. Reduce Polling Interval

In `game.js`:

```javascript
this.POLLING_DELAY = 3000;  // Change from 2000ms to 3000ms
```

Lower frequency = fewer API calls but slightly less responsive.

### 5. Lazy Load Images

If images are added:

```html
<img src="image.jpg" loading="lazy" alt="Description">
```

### 6. Use CSS Minification

Current CSS is 1,462 lines (40-50 KB).
Minified should be 25-35 KB.
With gzip: ~10-15 KB.

### 7. Monitor Performance

In browser DevTools Performance tab:
1. Open DevTools (F12)
2. Click Performance tab
3. Click Record button
4. Interact with page
5. Click Stop
6. Analyze timeline

Look for:
- JavaScript execution time
- Rendering time
- Paint times
- Layout shifts

---

## File Modification Checklist

Before modifying files, ensure you:

- [ ] Have a backup of original files
- [ ] Understand the current structure
- [ ] Make one change at a time
- [ ] Test in browser after each change
- [ ] Check browser console for errors
- [ ] Test on mobile viewport
- [ ] Test form submissions
- [ ] Test all game screens

---

## Useful Resources

### CSS Custom Properties
Every color, size, and timing is a variable.
Edit `:root { }` to change globally.

### CSS Responsive Design
Uses mobile-first approach with min-width breakpoints.
Look for `@media (min-width: 768px)` etc.

### JavaScript Structure
Single class with organized method groups.
Each method handles one responsibility.

### HTML Accessibility
ARIA labels on inputs, roles on interactive elements.
Semantic HTML (header, main, aside, footer).

---

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Look at network tab for API failures
3. Verify file paths are correct
4. Check localStorage in Application tab
5. Review the verification report in project root

---

## Version History

- **v1.0** (Nov 6, 2025): Initial production release
  - 2,593 lines of code
  - 40+ design tokens
  - 13 API endpoints
  - 4 responsive breakpoints
  - 8.5/10 quality rating

---

**Happy coding!**
