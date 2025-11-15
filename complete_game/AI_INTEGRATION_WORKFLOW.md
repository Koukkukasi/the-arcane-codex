# AI Integration Workflow
## How AI Scenario Generation Integrates with Game Code

---

## Overview

The Arcane Codex uses a **hybrid approach**:
1. **Static Templates** (scenarios.py): Example scenarios demonstrating patterns
2. **Dynamic Generation** (Claude via Claude Code/MCP): Real-time scenario creation
3. **Integration Layer** (ai_gm_auto.py): Connects AI to game systems

This document explains how they all work together.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  AUTONOMOUS AI GAME MASTER (Claude via MCP)                  │
│                                                               │
│  • Detects when scenario needed                             │
│  • Generates scenario autonomously                          │
│  • Presents via Web UI + Chat                               │
│  • Tracks state, applies consequences                       │
│  • Zero human intervention                                  │
│                                                               │
│  Internal Knowledge Base:                                    │
│  • AI_SCENARIO_GENERATION_PATTERNS.md                       │
│  • AI_SCENARIO_QUALITY_CHECKLIST.md                         │
│  • AI_GENERATION_EXAMPLES.md                                │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  AI GM INTEGRATION LAYER (ai_gm_auto.py)                     │
│                                                               │
│  • Receives scenario from AI GM                             │
│  • Formats for Web UI + Chat                                │
│  • Triggers game events                                      │
│  • Updates game state automatically                         │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  PLAYER INTERFACES                                            │
│                                                               │
│  ┌───────────────┐  ┌──────────────────────────────┐       │
│  │  Web UI       │  │  Chat Integration            │       │
│  │  (Flask)      │  │                              │       │
│  │               │  │  Discord OR WhatsApp         │       │
│  │  • Visuals    │  │  • Party chat               │       │
│  │  • Choices    │  │  • Private whispers         │       │
│  │  • Status     │  │  • NPC dialogue             │       │
│  └───────────────┘  └──────────────────────────────┘       │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  GAME BACKEND                                                 │
│                                                               │
│  • Database (database.py) - State persistence              │
│  • Scenarios (scenarios.py) - Fallback templates           │
│  • Discord Bot (discord_bot.py) - Chat integration         │
└──────────────────────────────────────────────────────────────┘
```

---

## Integration Flow: Step-by-Step

### Step 1: AI GM Detects Scenario Need (Autonomous)

**Trigger Conditions**:
- Party completes previous scenario
- Party enters new location
- Major choice consequences resolved
- Manual trigger via admin command (optional)

**AI GM Internal Check**:
```python
def check_if_scenario_needed(game_state):
    if game_state['current_scenario'] is None:
        return True
    if game_state['current_scenario']['completed']:
        return True
    return False
```

### Step 2: AI GM Gathers Game State (Autonomous)

**Auto-Collected Data**:
```python
game_state = {
    'party_trust': 65,
    'players': [{'class': 'Fighter', 'hp': 85}, {'class': 'Mage', 'hp': 60}],
    'npcs': [{'name': 'Grimsby', 'approval': 45}, {'name': 'Renna', 'approval': 60}],
    'divine_favor': {'KAITHA': 25, 'VALDRIS': 15},
    'scenario_history': ['medicine heist', 'plague outbreak'],
    'location': 'Thieves Guild Territory'
}
```

### Step 3: AI GM Generates Scenario (Autonomous)

**Process**:
1. AI GM analyzes game state
2. Applies patterns from `AI_SCENARIO_GENERATION_PATTERNS.md`
3. Checks quality with `AI_SCENARIO_QUALITY_CHECKLIST.md`
4. Outputs complete scenario JSON
5. **No human intervention at any step**

**Output Format**:
```json
{
    "scenario_id": "gen_informant_001",
    "theme": "The Informant's Dilemma",
    "moral_type": "MUTUALLY_EXCLUSIVE",
    "difficulty": "medium",
    "acts": [...],
    "npcs": [...],
    "environmental_tactics": [...],
    "solution_paths": [...]
}
```

### Step 3: Integration with Game Code

You have **three options** for using the generated scenario:

#### Option A: Manual Integration (Simplest)

**You do manually**:
1. Copy scenario JSON from Claude
2. Read public scenes aloud to players
3. Send whispers via Discord DMs / WhatsApp
4. Track trust/approval changes in a spreadsheet
5. Apply consequences manually

**Best for**: First-time GMs, small groups, casual play

#### Option B: Semi-Automated (Recommended)

**Code Integration**:
```python
# In ai_gm_auto.py or your custom script

def load_claude_scenario(scenario_json):
    """
    Load scenario generated by Claude into game system
    """
    scenario = json.loads(scenario_json)

    # Create scenario object
    game_scenario = {
        'id': scenario['scenario_id'],
        'theme': scenario['theme'],
        'current_act': 1,
        'acts': scenario['acts'],
        'npcs': scenario['npcs'],
        'environmental_elements': scenario['environmental_tactics'],
        'outcomes': scenario['solution_paths']
    }

    return game_scenario

def present_scenario_to_players(scenario, game_state):
    """
    Present scenario via game interface (Discord/Web)
    """
    # Get current act
    act = scenario['acts'][scenario['current_act'] - 1]

    # Send public scene to all players
    send_to_all_players(act['public'])

    # Send whispers privately to each player
    for player in game_state['players']:
        class_name = player['class'].lower()
        if class_name in act['whispers']:
            send_private_message(
                player['id'],
                f"[WHISPER - ONLY YOU SEE THIS]\n{act['whispers'][class_name]}"
            )

    # Present choices
    present_choices(act['choices'])

def apply_scenario_consequences(choice_id, scenario, game_state):
    """
    Apply consequences of player choice
    """
    # Find the chosen outcome
    outcome = None
    for path in scenario['outcomes']:
        if path['id'] == choice_id:
            outcome = path
            break

    if not outcome:
        return

    # Apply immediate consequences
    if 'immediate_consequences' in outcome:
        consequences = outcome['immediate_consequences']

        # Update trust
        if 'trust' in consequences:
            game_state['party_trust'] += consequences['trust']

        # Update NPC approvals
        if 'npc_reactions' in consequences:
            for npc_name, change in consequences['npc_reactions'].items():
                update_npc_approval(npc_name, change)

        # Handle deaths
        if 'lives' in consequences:
            narrate_outcome(consequences['lives'])

    # Schedule long-term consequences
    if 'long_term_consequences' in outcome:
        schedule_future_event(outcome['long_term_consequences'])

    return outcome
```

**Best for**: Regular campaigns, Discord bots, automated systems

#### Option C: Fully Automated (Advanced)

**MCP Integration**:
```python
# mcp_client.py - Claude Desktop integration

class MCPScenarioGenerator:
    def __init__(self):
        self.mcp_connection = connect_to_claude_desktop()

    def request_scenario(self, game_state):
        """
        Request scenario from Claude via MCP
        """
        request = format_scenario_request(game_state)

        # Send to Claude Desktop
        response = self.mcp_connection.send(
            tool="generate_scenario",
            parameters=request
        )

        scenario = json.loads(response)
        return scenario

    def auto_present_scenario(self, scenario, game_state):
        """
        Automatically present scenario without manual intervention
        """
        # Load into game system
        load_claude_scenario(scenario)

        # Present to players
        present_scenario_to_players(scenario, game_state)

        # Wait for player choices
        choice = wait_for_player_choice()

        # Apply consequences automatically
        apply_scenario_consequences(choice, scenario, game_state)

        # Update database
        save_game_state(game_state)
```

**Best for**: Production deployments, zero-manual-intervention games

### Step 4: Game System Processes Scenario

**In app.py** (Flask server):
```python
@app.route('/api/scenario/present', methods=['POST'])
def present_scenario():
    """
    API endpoint to present a scenario to players
    """
    scenario_json = request.json['scenario']
    game_id = request.json['game_id']

    # Load game state
    game_state = db.get_game_state(game_id)

    # Load scenario
    scenario = load_claude_scenario(scenario_json)

    # Present to players via WebSocket
    present_scenario_to_players(scenario, game_state)

    return {'status': 'success'}

@app.route('/api/scenario/choice', methods=['POST'])
def process_choice():
    """
    API endpoint to process player choice
    """
    choice_id = request.json['choice_id']
    game_id = request.json['game_id']

    # Load game state and current scenario
    game_state = db.get_game_state(game_id)
    scenario = game_state['current_scenario']

    # Apply consequences
    outcome = apply_scenario_consequences(choice_id, scenario, game_state)

    # Save updated state
    db.save_game_state(game_state)

    # Return outcome to players
    return {'status': 'success', 'outcome': outcome}
```

**In discord_bot.py** (Discord integration):
```python
@bot.command(name='scenario')
async def present_scenario(ctx, scenario_file):
    """
    Load and present a Claude-generated scenario
    """
    # Load scenario JSON from file
    with open(scenario_file, 'r') as f:
        scenario_json = f.read()

    scenario = json.loads(scenario_json)

    # Send public scene to channel
    await ctx.send(scenario['acts'][0]['public'])

    # Send whispers to each player
    for member in ctx.guild.members:
        player = get_player(member.id)
        if player and player['class'].lower() in scenario['acts'][0]['whispers']:
            whisper = scenario['acts'][0]['whispers'][player['class'].lower()]
            await member.send(f"🔮 [WHISPER - ONLY YOU SEE THIS]\n\n{whisper}")

    # Present choices as reactions or dropdown
    await present_choices(ctx, scenario['acts'][0]['choices'])
```

---

## Data Flow: Game State to Scenario and Back

### Game State Structure

```python
game_state = {
    'game_id': 'unique_id',
    'party_trust': 65,
    'players': [
        {
            'id': 'player_1',
            'name': 'Arcturus',
            'class': 'Fighter',
            'hp': 85,
            'max_hp': 100
        },
        {
            'id': 'player_2',
            'name': 'Elara',
            'class': 'Mage',
            'hp': 60,
            'max_hp': 70
        }
    ],
    'npcs': [
        {
            'id': 'grimsby',
            'name': 'Grimsby',
            'approval': 45,
            'fatal_flaw': 'DESPERATE',
            'hidden_agenda': 'Revenge on Duke'
        },
        {
            'id': 'renna',
            'name': 'Renna',
            'approval': 60,
            'fatal_flaw': 'IMPULSIVE',
            'hidden_agenda': 'Kill brother (Thieves Guild leader)'
        }
    ],
    'divine_favor': {
        'VALDRIS': 15,
        'KAITHA': 25,
        'MORVANE': 10,
        'SYLARA': 5,
        'KORVAN': 0,
        'ATHENA': 0,
        'MERCUS': 0,
        'DRAKMOR': 0
    },
    'scenario_history': [
        'medicine heist',
        'plague outbreak',
        'noble corruption'
    ],
    'current_location': 'Thieves Guild Territory',
    'current_scenario': None  # Will be populated
}
```

### Scenario Request from Game State

```python
def format_scenario_request_from_state(game_state):
    """
    Convert game state to scenario request format
    """
    # Extract player classes and HP
    players = [
        f"{p['class']} (HP {p['hp']}/{p['max_hp']})"
        for p in game_state['players']
    ]

    # Extract NPCs with approval
    npcs = [
        f"{npc['name']} (Approval {npc['approval']})"
        for npc in game_state['npcs']
    ]

    # Extract non-zero divine favor
    favor = [
        f"{god}: {value:+d}"
        for god, value in game_state['divine_favor'].items()
        if value != 0
    ]

    request = f"""
Generate Arcane Codex scenario:
- Party Trust: {game_state['party_trust']}/100
- Players: {', '.join(players)}
- NPCs: {', '.join(npcs)}
- Divine Favor: {', '.join(favor)}
- Location: {game_state['current_location']}
- Previous Themes: {game_state['scenario_history'][-5:]}
- Difficulty: Medium
    """

    return request
```

### Scenario Response to Game State Update

```python
def update_game_state_from_outcome(game_state, outcome):
    """
    Update game state based on scenario outcome
    """
    if 'immediate_consequences' in outcome:
        consequences = outcome['immediate_consequences']

        # Update party trust
        if 'trust' in consequences:
            trust_change = consequences['trust']
            game_state['party_trust'] += trust_change
            game_state['party_trust'] = max(0, min(100, game_state['party_trust']))

        # Update NPC approvals
        if 'npc_reactions' in consequences:
            for npc_name, change in consequences['npc_reactions'].items():
                for npc in game_state['npcs']:
                    if npc['name'].lower() == npc_name.lower():
                        npc['approval'] += change
                        npc['approval'] = max(0, min(100, npc['approval']))

        # Handle NPC deaths/departures
        if 'npc_deaths' in consequences:
            for npc_name in consequences['npc_deaths']:
                game_state['npcs'] = [
                    npc for npc in game_state['npcs']
                    if npc['name'].lower() != npc_name.lower()
                ]

    # Update divine favor
    if 'long_term_consequences' in outcome:
        if 'divine_favor' in outcome['long_term_consequences']:
            for god, change in outcome['long_term_consequences']['divine_favor'].items():
                game_state['divine_favor'][god] += change

    # Add scenario theme to history
    if 'theme' in outcome:
        game_state['scenario_history'].append(outcome['theme'])
        # Keep only last 10
        game_state['scenario_history'] = game_state['scenario_history'][-10:]

    return game_state
```

---

## Integration with Existing Systems

### Integration with scenarios.py (Template Library)

**scenarios.py provides**:
- 3 example scenarios as TEMPLATES
- Pattern demonstrations
- Fallback content if AI unavailable

**How to use together**:
```python
# ai_gm_auto.py

class HybridScenarioManager:
    def __init__(self):
        self.template_library = ScenarioLibrary()  # From scenarios.py
        self.ai_generator = MCPScenarioGenerator()  # Claude integration

    def get_scenario(self, game_state, prefer_ai=True):
        """
        Get scenario, preferring AI but falling back to templates
        """
        if prefer_ai:
            try:
                # Try AI generation first
                scenario = self.ai_generator.request_scenario(game_state)
                return scenario
            except Exception as e:
                logger.warning(f"AI generation failed: {e}")
                # Fall back to templates

        # Use template library
        theme = self.select_unused_theme(game_state)
        scenario = self.template_library.get_scenario(theme)

        # Adapt template to current game state
        scenario = self.adapt_template_to_state(scenario, game_state)

        return scenario

    def adapt_template_to_state(self, template, game_state):
        """
        Modify template scenario to match current game state
        """
        # Update NPC approval behaviors
        for npc in template['npcs']:
            if npc['name'] in [n['name'] for n in game_state['npcs']]:
                # Get current approval
                current_npc = next(n for n in game_state['npcs'] if n['name'] == npc['name'])
                npc['approval'] = current_npc['approval']

                # Adjust behavior based on approval
                if npc['approval'] < 40:
                    npc['behavior'] = 'untrustworthy'
                elif npc['approval'] > 70:
                    npc['behavior'] = 'loyal'

        # Filter whispers by present classes
        present_classes = [p['class'].lower() for p in game_state['players']]
        for act in template['acts']:
            act['whispers'] = {
                class_name: whisper
                for class_name, whisper in act['whispers'].items()
                if class_name in present_classes
            }

        return template
```

### Integration with database.py (Persistence)

**Store scenario state in database**:
```python
# database.py additions

def save_scenario_state(game_id, scenario):
    """
    Save current scenario to database
    """
    conn = sqlite3.connect('arcane_codex.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT OR REPLACE INTO scenario_state
        (game_id, scenario_id, scenario_json, current_act, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        game_id,
        scenario['scenario_id'],
        json.dumps(scenario),
        scenario.get('current_act', 1),
        datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()

def load_scenario_state(game_id):
    """
    Load current scenario from database
    """
    conn = sqlite3.connect('arcane_codex.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT scenario_json, current_act
        FROM scenario_state
        WHERE game_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    ''', (game_id,))

    result = cursor.fetchone()
    conn.close()

    if result:
        scenario = json.loads(result[0])
        scenario['current_act'] = result[1]
        return scenario

    return None
```

### Integration with Discord Bot

**Example full integration**:
```python
# discord_bot.py

@bot.command(name='continue')
async def continue_scenario(ctx):
    """
    Continue the current scenario
    """
    # Get game state
    game_state = db.get_game_state(ctx.guild.id)

    # Load current scenario
    scenario = db.load_scenario_state(ctx.guild.id)

    if not scenario:
        await ctx.send("No active scenario. Use !start_scenario first.")
        return

    # Check if scenario is complete
    if scenario['current_act'] > len(scenario['acts']):
        await ctx.send("Scenario complete! Request new scenario.")
        return

    # Present current act
    act = scenario['acts'][scenario['current_act'] - 1]

    # Send public scene
    await ctx.send(f"**{act['name']}**\n\n{act['public']}")

    # Send whispers
    for member in ctx.guild.members:
        player = get_player(member.id)
        if player and player['class'].lower() in act['whispers']:
            whisper = act['whispers'][player['class'].lower()]
            await member.send(f"🔮 **[WHISPER - ONLY YOU SEE THIS]**\n\n{whisper}")

    # Present choices
    if 'choices' in act:
        choices_text = "\n".join([
            f"{i+1}. {choice['text']}"
            for i, choice in enumerate(act['choices'])
        ])
        await ctx.send(f"**What do you do?**\n{choices_text}")

@bot.command(name='choose')
async def make_choice(ctx, choice_num: int):
    """
    Make a choice in the scenario
    """
    game_state = db.get_game_state(ctx.guild.id)
    scenario = db.load_scenario_state(ctx.guild.id)

    act = scenario['acts'][scenario['current_act'] - 1]

    # Validate choice
    if choice_num < 1 or choice_num > len(act['choices']):
        await ctx.send(f"Invalid choice. Choose 1-{len(act['choices'])}")
        return

    chosen = act['choices'][choice_num - 1]

    # Advance to next act or complete scenario
    scenario['current_act'] += 1

    # If scenario complete, apply consequences
    if scenario['current_act'] > len(scenario['acts']):
        # Find matching outcome
        outcome = find_outcome(scenario, chosen['id'])
        if outcome:
            # Apply consequences
            update_game_state_from_outcome(game_state, outcome)

            # Narrate outcome
            await ctx.send(f"**Consequences:**\n{outcome['description']}")

            # Divine Council
            if 'divine_council' in outcome:
                await present_divine_council(ctx, outcome['divine_council'])

    # Save updated state
    db.save_scenario_state(ctx.guild.id, scenario)
    db.save_game_state(game_state)

    await ctx.send(f"Choice recorded: {chosen['text']}")
```

---

## File System Integration

### Where Files Live

```
complete_game/
├── AI_SCENARIO_GENERATION_PATTERNS.md    ← Pattern library (read by Claude)
├── AI_SCENARIO_QUALITY_CHECKLIST.md      ← Quality standards (used by Claude)
├── AI_GENERATION_EXAMPLES.md             ← Examples (reference for Claude)
├── AI_SCENARIO_USAGE_GUIDE.md            ← How to request (read by GM)
├── GAME_MASTER_QUICKSTART.md             ← GM guide (read by GM)
├── AI_INTEGRATION_WORKFLOW.md            ← This file (integration docs)
│
├── scenarios.py                           ← Template library (fallback)
├── ai_gm_auto.py                         ← AI integration (Python code)
├── mcp_client.py                         ← MCP connection (optional)
├── app.py                                 ← Flask server (game engine)
├── discord_bot.py                        ← Discord interface (player UI)
├── database.py                           ← Persistence (storage)
│
└── generated_scenarios/                   ← Store Claude outputs (optional)
    ├── scenario_001_informant.json
    ├── scenario_002_sanctuary.json
    └── ...
```

### Saving Generated Scenarios

```python
# In ai_gm_auto.py or your integration script

def save_generated_scenario(scenario, game_id):
    """
    Save Claude-generated scenario to file for reference
    """
    filename = f"generated_scenarios/scenario_{game_id}_{scenario['scenario_id']}.json"

    os.makedirs('generated_scenarios', exist_ok=True)

    with open(filename, 'w') as f:
        json.dump(scenario, f, indent=2)

    logger.info(f"Saved scenario to {filename}")
    return filename

def load_saved_scenario(filename):
    """
    Load previously generated scenario
    """
    with open(filename, 'r') as f:
        scenario = json.load(f)

    return scenario
```

---

## Testing Integration

### Test 1: Manual Integration Test

```python
# test_integration.py

def test_manual_integration():
    """
    Test manual integration (copy-paste workflow)
    """
    # Simulate game state
    game_state = {
        'party_trust': 65,
        'players': [
            {'class': 'Fighter', 'hp': 85},
            {'class': 'Mage', 'hp': 60}
        ],
        'npcs': [
            {'name': 'Grimsby', 'approval': 45},
            {'name': 'Renna', 'approval': 60}
        ],
        'divine_favor': {'KAITHA': 25, 'VALDRIS': 15}
    }

    # Format request
    request = format_scenario_request_from_state(game_state)
    print("REQUEST TO CLAUDE:")
    print(request)

    # (Claude would respond here - simulated for test)
    scenario_json = """
    {
        "scenario_id": "test_001",
        "theme": "Test Scenario",
        "acts": [...]
    }
    """

    # Load scenario
    scenario = load_claude_scenario(scenario_json)
    assert scenario['scenario_id'] == 'test_001'

    print("✓ Manual integration test passed")

def test_semi_automated_integration():
    """
    Test semi-automated integration (Python code workflow)
    """
    game_state = create_test_game_state()

    # Generate scenario (simulated)
    scenario = {
        'scenario_id': 'test_002',
        'acts': [{'public': 'Test scene', 'whispers': {'fighter': 'Test whisper'}}],
        'outcomes': [{'id': 'choice_a', 'immediate_consequences': {'trust': 10}}]
    }

    # Present scenario
    present_scenario_to_players(scenario, game_state)

    # Simulate choice
    outcome = apply_scenario_consequences('choice_a', scenario, game_state)

    # Verify trust updated
    assert game_state['party_trust'] == 75  # Was 65, +10

    print("✓ Semi-automated integration test passed")

if __name__ == '__main__':
    test_manual_integration()
    test_semi_automated_integration()
    print("\nAll integration tests passed!")
```

---

## Troubleshooting Integration Issues

### Issue 1: Scenario JSON doesn't match expected format

**Symptom**: KeyError when accessing scenario fields

**Solution**:
```python
# Add validation
def validate_scenario_json(scenario):
    """
    Validate scenario has all required fields
    """
    required_fields = ['scenario_id', 'theme', 'acts', 'npcs']
    for field in required_fields:
        if field not in scenario:
            raise ValueError(f"Missing required field: {field}")

    # Validate acts structure
    for i, act in enumerate(scenario['acts']):
        required_act_fields = ['act', 'name', 'public', 'whispers']
        for field in required_act_fields:
            if field not in act:
                raise ValueError(f"Act {i+1} missing field: {field}")

    return True
```

### Issue 2: Whispers not reaching players

**Symptom**: Players don't see private messages

**Solution**:
```python
# Add delivery confirmation
async def send_whisper_with_confirmation(player_id, whisper_text):
    """
    Send whisper and confirm delivery
    """
    try:
        user = await bot.fetch_user(player_id)
        await user.send(whisper_text)
        logger.info(f"Whisper delivered to {player_id}")
        return True
    except discord.Forbidden:
        logger.error(f"Cannot DM user {player_id} (DMs closed)")
        return False
    except Exception as e:
        logger.error(f"Failed to deliver whisper: {e}")
        return False
```

### Issue 3: Game state out of sync

**Symptom**: Trust/approval values don't match what's displayed

**Solution**:
```python
# Add state synchronization
def sync_game_state():
    """
    Ensure game state is consistent across all systems
    """
    # Load from database
    db_state = db.get_game_state(game_id)

    # Load from memory cache
    memory_state = cache.get(game_id)

    # If different, database is source of truth
    if db_state != memory_state:
        logger.warning(f"State mismatch for game {game_id}, syncing from DB")
        cache.set(game_id, db_state)
        return db_state

    return db_state
```

---

## Production Deployment Checklist

When deploying AI integration in production:

- [ ] MCP connection configured (if using MCP)
- [ ] Scenario validation enabled
- [ ] Error handling for AI unavailability (fallback to templates)
- [ ] Scenario persistence in database
- [ ] Whisper delivery confirmation
- [ ] State synchronization between systems
- [ ] Logging of all scenario requests/responses
- [ ] Rate limiting on scenario generation (avoid spam)
- [ ] Backup scenario library (templates) tested
- [ ] Integration tests passing
- [ ] Discord permissions correct (can DM players)
- [ ] Database migrations complete (scenario_state table)

---

## Summary

**Integration Options**:
1. **Manual**: Claude generates → You copy-paste → You narrate
2. **Semi-Automated**: Claude generates → Python loads → Discord sends
3. **Fully Automated**: MCP requests → Auto-presents → Auto-updates

**Key Integration Points**:
- `format_scenario_request_from_state()`: Game state → Claude request
- `load_claude_scenario()`: Claude JSON → Game scenario object
- `present_scenario_to_players()`: Scenario → Player interfaces
- `apply_scenario_consequences()`: Choice → Game state updates
- `update_game_state_from_outcome()`: Outcome → State persistence

**Files Involved**:
- **Docs**: AI_SCENARIO_*.md (Claude reads these)
- **Code**: ai_gm_auto.py (integration layer)
- **Code**: scenarios.py (fallback templates)
- **Code**: app.py, discord_bot.py (game interfaces)
- **Code**: database.py (persistence)

**The integration allows**:
- ✅ Dynamic scenario generation by Claude
- ✅ Seamless loading into game systems
- ✅ Automatic presentation to players
- ✅ Consequence tracking and persistence
- ✅ Fallback to templates if AI unavailable

---

**Next**: See GAME_MASTER_QUICKSTART.md for practical usage, or AI_SCENARIO_USAGE_GUIDE.md for requesting scenarios.
