# MCP Character Creation Issue & Fix

## Problem

The game crashes at character creation with:
```
RuntimeError: Failed to parse MCP response:
Generate a COMPLETELY UNIQUE Divine Interrogation question...
```

## Root Cause

Line 289 in `mcp_scenario_server.py`:
```python
return [TextContent(type="text", text=request)]
```

**The MCP server tool is returning the PROMPT instead of the AI-generated JSON response.**

## Why This Happens

The current MCP architecture is:
```
Flask Game → calls MCP tool → MCP server returns PROMPT text → Flask tries to parse as JSON → CRASH
```

But it should be:
```
Flask Game → calls MCP tool → MCP uses Claude Desktop to generate JSON → Returns JSON → Flask parses successfully
```

## The Fix

MCP servers that need to generate AI content should use **PROMPTS + SAMPLING**, not just tools.

### Option 1: Use MCP Sampling (Correct Approach)

The MCP server should request Claude Desktop to generate content using the sampling API.

**Required changes to `mcp_scenario_server.py`:**

1. Import sampling types:
```python
from mcp.server.models import SamplingParams
```

2. In the tool handler (line 289), instead of returning the prompt:
```python
# OLD (WRONG):
return [TextContent(type="text", text=request)]

# NEW (CORRECT):
# Request Claude Desktop to generate the JSON
sampling_result = await server.request_sampling(
    messages=[{
        "role": "user",
        "content": request
    }],
    params=SamplingParams(
        temperature=0.8,
        max_tokens=2000
    )
)

# Parse and return the JSON
json_response = sampling_result.content
return [TextContent(type="text", text=json_response)]
```

### Option 2: Simpler Architecture (Also Valid)

Instead of having the MCP tool generate content, have Claude Desktop in the conversation loop:

1. MCP tool returns game state data only
2. Claude Desktop (in chat with user) uses that data to generate scenarios
3. User copies scenarios into game

This is simpler but requires manual intervention.

## Current Status

- ✅ Create/join game works (200 SUCCESS)
- ✅ Graphics fixed (Medieval Fantasy CRT only)
- ✅ API request handling fixed
- ❌ MCP character creation fails (MCP server returns prompt instead of JSON)

## Next Steps

1. Update `mcp_scenario_server.py` to use sampling API
2. Test character creation flow
3. Verify JSON is properly generated and parsed

## Important Notes

- **NO MOCK DATA**: All content must be AI-generated via MCP
- **NO HARDCODED QUESTIONS**: Every question must be unique per player
- **USE €200 CLAUDE MAX PLAN**: No separate API key needed
- **MCP IS MANDATORY**: The game cannot work without proper MCP integration

## Alternative: Direct Claude API (NOT RECOMMENDED)

If MCP sampling proves difficult, could use Claude API directly:
- Requires API key (defeats purpose of using Max plan)
- Adds cost per request
- Not the intended architecture

**DO NOT USE THIS APPROACH** unless MCP sampling is impossible.

---

**Status**: MCP server bug identified, fix in progress.
