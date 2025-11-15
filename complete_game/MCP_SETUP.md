# MCP Setup - Use Your €200 Claude Max Plan

## What This Does

Connects your game to Claude Desktop so it uses YOUR €200 Max plan to generate scenarios.

NO separate API needed!

## Step 1: Configure Claude Desktop (5 minutes)

1. **Find your config file:**
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
   - Quit Claude Desktop
   - Start it again
   - You should see MCP indicator in bottom-right

## Step 2: Test MCP Connection (2 minutes)

1. Open Claude Desktop
2. Type: "Test the arcane-codex MCP server"
3. You should see the `generate_scenario` tool available

## Step 3: Run Your Game (Now!)

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
python web_game.py
```

Open: http://localhost:5000

## How It Works

```
Your Game (localhost:5000)
    ↓
    Needs scenario
    ↓
MCP Server (Python script)
    ↓
Claude Desktop (your €200 Max)
    ↓
    Generates unique scenario
    ↓
    Flows back to game
```

**Uses your existing €200 subscription. No additional cost!**

## Troubleshooting

**"MCP server not showing in Claude Desktop"**
- Check config file path is correct
- Make sure Python path is correct in config
- Restart Claude Desktop completely (quit + reopen)

**"Can't find claude_desktop_config.json"**
- Create it manually at: `%APPDATA%\Claude\claude_desktop_config.json`
- Use the JSON above

**"Python command not found"**
- Find Python path: `where python` in cmd
- Use full path in config like: `"C:\\Python313\\python.exe"`

## Next Steps

Once MCP is connected:
1. Start game server
2. Players connect on home network
3. Game automatically requests scenarios via MCP
4. Claude Desktop (your €200 plan) generates them
5. Play with fully dynamic content!

**No API key needed. No separate billing. Uses your existing €200 Max plan.**
