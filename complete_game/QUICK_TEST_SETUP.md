# Quick Test Setup - Play in 10 Minutes

**Uses Your €200 Claude Max Plan - NO Separate API Needed!**

## Step 1: Configure Claude Desktop (3 minutes)

1. **Find your Claude Desktop config file:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Full path: `C:\Users\ilmiv\AppData\Roaming\Claude\claude_desktop_config.json`

2. **Edit the config file** (create if doesn't exist):

```json
{
  "mcpServers": {
    "arcane-codex": {
      "command": "python",
      "args": [
        "C:\\Users\\ilmiv\\ProjectArgent\\complete_game\\mcp_scenario_server.py"
      ]
    }
  }
}
```

3. **Restart Claude Desktop completely**
   - Quit Claude Desktop (not just close window)
   - Start it again
   - You should see MCP indicator in bottom-right

## Step 2: Test MCP Connection (1 minute)

1. Open Claude Desktop
2. Type: "Test the arcane-codex MCP server"
3. You should see the `generate_scenario` tool available
4. If you see it, MCP is connected! ✅

## Step 3: Start Game Server (1 minute)

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
python web_game.py
```

Server starts on: http://localhost:5000

## Step 4: Connect Players (2 minutes)

**Player 1 (Your Computer):**
- Open browser: http://localhost:5000

**Player 2 (Another Device on Same Network):**
1. Find your computer's IP:
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address": 192.168.X.X
2. On other device, open browser: http://192.168.X.X:5000

## Step 5: Play! (Now!)

1. Both complete Divine Interrogation (10 questions)
2. Game assigns classes based on answers
3. Start adventure
4. **AI GM generates unique scenarios via MCP** (using your €200 Max plan)
5. Each player gets different whispers
6. Make choices together
7. Divine Council judges your actions

## Troubleshooting

**"MCP server not showing in Claude Desktop"**
- Check config file path is correct: `%APPDATA%\Claude\claude_desktop_config.json`
- Make sure Python path is correct in config
- Restart Claude Desktop completely (quit + reopen)
- Check for MCP indicator in bottom-right corner

**"Server won't start"**
- Check Python installed: `python --version`
- Install packages: `pip install flask flask-cors python-dotenv mcp`

**"Can't connect from phone"**
- Make sure both devices on same WiFi network
- Check firewall isn't blocking port 5000
- Find your IP with `ipconfig` and use http://192.168.X.X:5000

**"Can't find claude_desktop_config.json"**
- Create it manually at: `%APPDATA%\Claude\claude_desktop_config.json`
- Use the JSON config from Step 1

## What You'll See

- Divine Interrogation: 10 questions from gods
- Class Assignment: Fighter, Mage, Thief, or Cleric
- Unique Scenarios: Generated dynamically, never repeat
- Asymmetric Whispers: Different info per player
- Party Trust: 0-100, affects gameplay
- NPC Approval: NPCs can betray if low
- Divine Council: Gods vote on your actions

## Cost

**ZERO additional cost!**

This uses your existing €200 Claude Max plan through MCP (Model Context Protocol). No separate API billing, no credits needed, no per-scenario charges.

Your €200 Max subscription includes:
- Unlimited scenario generation (within Claude Desktop usage)
- All dynamic content creation
- Complete AI GM functionality

**No API key needed. No separate billing. Uses your existing €200 Max plan.**

## How It Works

```
Your Game (localhost:5000)
    ↓
MCP Server (Python script)
    ↓
Claude Desktop (your €200 Max)
    ↓
Generates unique scenarios
    ↓
Flows back to game
```

## Ready?

Follow steps 1-5 above and you'll be playing in 10 minutes!
