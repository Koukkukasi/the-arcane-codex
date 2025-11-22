# When to Use Opus 4.1 vs Sonnet 4.5 - The Arcane Codex Guide

## Quick Decision Matrix

| Task Type | Model | Reason |
|-----------|-------|--------|
| **Creative Writing** (narratives, dialogue, lore) | **Opus 4.1** | Superior storytelling, nuance, character depth |
| **Code Review** | Sonnet 4.5 | Fast, accurate, good pattern recognition |
| **Bug Fixing** | Sonnet 4.5 | Quick, efficient, cost-effective |
| **Architecture Design** | **Opus 4.1** | Better systems thinking, trade-off analysis |
| **Game Balance** | **Opus 4.1** | Complex reasoning about interactions |
| **UI/UX Design** | **Opus 4.1** | Better understanding of user psychology |
| **Testing (writing tests)** | Sonnet 4.5 | Fast, good at edge cases |
| **Testing (analyzing failures)** | **Opus 4.1** | Better root cause analysis |
| **Refactoring** | Sonnet 4.5 | Good pattern recognition |
| **Security Audit** | **Opus 4.1** | Deeper threat modeling |
| **Documentation** | Sonnet 4.5 | Clear, concise, fast |
| **API Integration** | Sonnet 4.5 | Good at following specs |
| **Algorithm Design** | **Opus 4.1** | Better complex problem solving |

---

## Detailed Guidance by Agent Type

### 🎮 **game-ux-optimizer** Agent
**Use Opus 4.1 when:**
- Designing core game loops
- Balancing engagement vs frustration
- Creating retention mechanics
- Analyzing why players drop off
- Designing tutorial/onboarding flows
- Optimizing for "fun factor"

**Use Sonnet when:**
- Implementing UI component changes
- Fixing specific UX bugs
- Adding tooltips/help text
- Simple layout adjustments

**Example:**
```javascript
// ❌ Sonnet: "Make the button bigger"
// ✅ Opus 4.1: "Analyze why 70% of players don't complete divine interrogation and redesign the flow"
```

---

### 🎨 **ui-design-system-architect** Agent
**Use Opus 4.1 when:**
- Creating a design system from scratch
- Establishing visual hierarchy
- Designing animation timing/choreography
- Color palette psychology (emotional impact)
- Creating cohesive brand experience
- Designing for accessibility AND aesthetics

**Use Sonnet when:**
- Implementing existing design tokens
- Converting designs to CSS
- Fixing alignment issues
- Standardizing spacing

**Example:**
```javascript
// ✅ Opus 4.1: "Design a design system that reflects the arcane/divine duality theme"
// ❌ Sonnet: "Convert these Figma colors to CSS variables"
```

---

### 🎲 **game-level-designer** Agent
**Use Opus 4.1 when:**
- Designing quest scenarios
- Balancing difficulty curves
- Creating moral dilemmas
- Designing boss encounters
- Crafting puzzle mechanics
- Planning quest progression arcs

**Use Sonnet when:**
- Implementing level layouts from specs
- Placing items/enemies from a list
- Generating random encounters
- Simple terrain generation

**Example:**
```javascript
// ✅ Opus 4.1: "Design 3 morally ambiguous scenarios that make VALDRIS and KAITHA vote opposite ways"
// ❌ Sonnet: "Place 5 healing potions in this dungeon"
```

---

### 🖼️ **game-graphics-designer** Agent
**Use Opus 4.1 when:**
- Designing visual identity/style guide
- Creating character concepts
- Designing god symbols with meaning
- Planning animation sequences for emotional impact
- Designing particle effects that communicate gameplay

**Use Sonnet when:**
- Implementing sprite variations
- Converting SVG files
- Batch processing assets
- Technical sprite sheet generation

**Example:**
```javascript
// ✅ Opus 4.1: "Design 7 god symbols that visually represent their domains and contrast each other"
// ❌ Sonnet: "Resize these 20 icons to 64x64"
```

---

### 📝 **code-reviewer** Agent
**Use Opus 4.1 when:**
- Reviewing security-critical code (authentication, payments)
- Analyzing complex algorithms
- Reviewing game balance code
- Architectural review of major systems
- Reviewing AI/ML integration code

**Use Sonnet when:**
- Standard code review (formatting, best practices)
- Reviewing CRUD operations
- Checking for common vulnerabilities (XSS, SQL injection)
- Reviewing test coverage

**Example:**
```javascript
// ✅ Opus 4.1: "Review the divine favor calculation algorithm for exploits and balance issues"
// ❌ Sonnet: "Check this form handler for XSS vulnerabilities"
```

---

### 🔍 **Explore** Agent
**Use Opus 4.1 when:**
- Exploring unfamiliar/complex codebases
- Understanding architectural patterns
- Finding hidden dependencies
- Analyzing legacy code
- Understanding domain logic

**Use Sonnet when:**
- Finding specific functions/classes
- Searching for file patterns
- Quick codebase navigation
- Finding usage examples

**Example:**
```javascript
// ✅ Opus 4.1: "Explore how the divine favor system affects quest outcomes across the codebase"
// ❌ Sonnet: "Find all files that import 'battle_system.py'"
```

---

### 🎯 **Plan** Agent
**Use Opus 4.1 when:**
- Planning major features (multiplayer, new systems)
- Designing API architectures
- Planning database schemas
- Designing integration strategies
- Planning refactoring of complex systems

**Use Sonnet when:**
- Planning implementation of defined features
- Breaking down tasks into subtasks
- Planning test coverage
- Planning simple migrations

**Example:**
```javascript
// ✅ Opus 4.1: "Plan how to add a real-time combat system without breaking turn-based scenarios"
// ❌ Sonnet: "Plan steps to add a new database field for player_level"
```

---

### 🛡️ **fact-checker** Agent
**Use Opus 4.1 when:**
- Verifying complex domain logic
- Checking game balance calculations
- Verifying security claims
- Analyzing AI model outputs
- Checking lore consistency

**Use Sonnet when:**
- Verifying API documentation
- Checking code examples work
- Verifying configuration values
- Checking dependency versions

**Example:**
```javascript
// ✅ Opus 4.1: "Verify if a player can achieve 100 favor with all 7 gods simultaneously given current mechanics"
// ❌ Sonnet: "Check if Flask-SocketIO version 5.3.0 is compatible with Python 3.11"
```

---

## The Arcane Codex Specific Use Cases

### ✨ Use Opus 4.1 For:

1. **Divine Interrogation Questions**
   - Creating morally complex scenarios
   - Balancing god favor responses
   - Writing god reasoning/dialogue
   - Designing choice consequences

2. **Quest Scenario Writing**
   - Creating 3-act quest structures
   - Writing asymmetric whispers
   - Designing class-specific information
   - Creating NPC personalities

3. **Game Balance Analysis**
   - Analyzing if combat is too easy/hard
   - Checking if certain gods/classes are overpowered
   - Balancing item economy
   - Analyzing progression curves

4. **Narrative Design**
   - Writing NPC dialogue
   - Creating betrayal storylines
   - Designing divine council scenes
   - Writing flavor text for items/locations

5. **Animation Choreography**
   - Designing animation timing for emotional impact
   - Creating animation sequences for story beats
   - Balancing spectacle vs gameplay flow

6. **UX Psychology**
   - Why players abandon divine interrogation
   - How to make moral choices feel meaningful
   - Designing for player retention
   - Creating "aha!" moments

### ⚡ Use Sonnet 4.5 For:

1. **Bug Fixes**
   - XSS vulnerabilities
   - SocketIO disconnection issues
   - Inventory bugs
   - UI rendering problems

2. **Implementation**
   - Converting designs to HTML/CSS
   - Implementing API endpoints
   - Writing database queries
   - Setting up SocketIO events

3. **Testing**
   - Writing Playwright tests
   - Unit tests for utilities
   - Integration test setup
   - Test data generation

4. **Refactoring**
   - Code cleanup
   - DRY principle enforcement
   - Performance optimization (known patterns)
   - Dependency updates

5. **Documentation**
   - API documentation
   - Setup guides
   - Inline code comments
   - Configuration documentation

---

## Cost Comparison

**Opus 4.1:**
- Input: $15 per 1M tokens
- Output: $75 per 1M tokens
- **When to splurge:** Creative/strategic work that saves hours of iteration

**Sonnet 4.5:**
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- **When to use:** Implementation/execution work with clear requirements

### Example Cost Analysis

**Bad Use of Opus:**
```javascript
// Task: "Fix the button alignment on line 47"
// Opus cost: $0.05 for 500 tokens
// Sonnet cost: $0.01 for 500 tokens
// Waste: $0.04 (4x more expensive for simple task)
```

**Good Use of Opus:**
```javascript
// Task: "Design a quest scenario where a player must choose between honor and survival,
//        affecting Valdris, Morvane, and Korvan favor in complex ways"
// Opus produces: Rich narrative, balanced mechanics, compelling choices
// Sonnet produces: Generic scenario, obvious choices, unbalanced favor
// Value: $0.50 for Opus vs hours of manual iteration = WORTH IT
```

---

## Red Flags: You're Using the Wrong Model

### 🚩 Using Opus for Sonnet Tasks (Wasting Money)
- "Add a console.log statement"
- "Fix this typo"
- "Convert this JSON to CSV"
- "Rename this variable"
- "Update package.json version"

### 🚩 Using Sonnet for Opus Tasks (Wasting Time)
- "Design a compelling moral dilemma"
- "Balance this complex game system"
- "Create a cohesive visual identity"
- "Analyze why players find this boring"
- "Design an emotionally impactful scene"

---

## Workflow: Start Sonnet, Escalate to Opus

```
1. Try Sonnet first for most tasks
2. If output feels "shallow" or "generic" → Use Opus
3. If you're iterating 3+ times → Should have used Opus
4. If task requires "creativity" or "wisdom" → Use Opus
5. If task is "execute this spec" → Use Sonnet
```

---

## Agent Invocation Examples

### ❌ Bad (Wrong Model)
```javascript
// Using Opus for simple task
Task: "Use Opus to fix XSS vulnerability in line 47"
// Should use Sonnet - security fix with known pattern
```

### ✅ Good (Right Model)
```javascript
// Using Opus for creative/complex task
Task: "Use Opus game-level-designer to create 3 scenarios that test player morality
       while introducing the combat system and balancing favor distribution across all 7 gods"
```

### ✅ Good (Right Model)
```javascript
// Using Sonnet for implementation
Task: "Use Sonnet to implement the SocketIO handler for 'player_action' event
       based on the spec in DESIGN_DOC.md"
```

---

## The Golden Rule

> **Use Opus when you need the AI to THINK.**
> **Use Sonnet when you need the AI to EXECUTE.**

### Thinking Tasks (Opus):
- "What should we do?"
- "How should this work?"
- "Why is this failing?"
- "What's the best approach?"
- "Design a solution for..."

### Execution Tasks (Sonnet):
- "Implement this spec"
- "Fix this bug"
- "Write tests for this"
- "Convert this format"
- "Generate this data"

---

## For The Arcane Codex: Recommended Approach

### Phase 1: Testing (Current Phase)
- **Sonnet**: Run Playwright tests, fix bugs
- **Opus**: Analyze test failures for root causes if complex

### Phase 2: Battle System Integration
- **Opus**: Design how combat integrates with turn-based scenarios
- **Sonnet**: Implement SocketIO events and UI updates
- **Opus**: Balance combat difficulty and rewards

### Phase 3: Enhanced Animations
- **Opus**: Design animation choreography for emotional impact
- **Sonnet**: Implement CSS animations from specs
- **Opus**: Design sound effect timing and selection

### Phase 4: Divine Interrogation
- **Opus**: Create new god questions with moral complexity
- **Sonnet**: Implement question flow UI
- **Opus**: Balance favor impacts across gods

### Phase 5: Quest Enhancement
- **Opus**: Write compelling quest narratives
- **Sonnet**: Implement quest state management
- **Opus**: Design asymmetric whisper content

---

## Summary Cheat Sheet

| If the task involves... | Use |
|------------------------|-----|
| 🎨 Creativity | **Opus** |
| 🧠 Complex reasoning | **Opus** |
| 🎭 Storytelling | **Opus** |
| ⚖️ Balancing systems | **Opus** |
| 🎮 UX psychology | **Opus** |
| 🏗️ Architecture design | **Opus** |
| 🔧 Implementation | **Sonnet** |
| 🐛 Bug fixes | **Sonnet** |
| 📝 Documentation | **Sonnet** |
| 🧪 Writing tests | **Sonnet** |
| 📊 Data processing | **Sonnet** |
| 🔄 Refactoring (simple) | **Sonnet** |

**When in doubt:** Start with Sonnet, escalate to Opus if needed.

---

**Remember:** Opus is ~5x more expensive but can save 10x the time on creative/strategic tasks.
