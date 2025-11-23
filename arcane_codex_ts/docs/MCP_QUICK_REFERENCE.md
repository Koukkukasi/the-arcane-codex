# MCP Service Quick Reference

## New Methods

### generateDynamicScenario()

**Purpose**: Generate AI scenarios with full context support

**Signature**:
```typescript
async generateDynamicScenario(context: ScenarioContext): Promise<any>
```

**Parameters**:
```typescript
interface ScenarioContext {
  gameCode: string;                    // Game session ID
  players: string[];                   // Player names
  theme?: string;                      // Scenario theme/topic
  scenarioType: 'divine_interrogation' // Type of scenario
                | 'moral_dilemma'
                | 'investigation'
                | 'general';
  previousScenarios?: string[];        // Previous scenario titles
  playerChoices?: any[];               // Past player decisions
  godFavor?: Record<string,            // Player->God->Favor mapping
             Record<string, number>>;
}
```

**Example**:
```typescript
const scenario = await mcp.generateDynamicScenario({
  gameCode: 'GAME123',
  players: ['Alice', 'Bob'],
  scenarioType: 'moral_dilemma',
  theme: 'Cursed artifact threatens village'
});
```

**Returns**: Scenario object (format depends on scenarioType)

---

### streamScenarioResponse()

**Purpose**: Stream scenario generation in real-time

**Signature**:
```typescript
async streamScenarioResponse(
  context: ScenarioContext,
  callback: (chunk: string, isDone: boolean) => void
): Promise<void>
```

**Callback Parameters**:
- `chunk`: Partial text content (empty string when done)
- `isDone`: True when streaming is complete

**Example**:
```typescript
let fullText = '';

await mcp.streamScenarioResponse(
  {
    gameCode: 'GAME123',
    players: ['Alice', 'Bob'],
    scenarioType: 'investigation',
    theme: 'Mystery at the manor'
  },
  (chunk, isDone) => {
    if (!isDone) {
      fullText += chunk;
      updateUI(fullText); // Update in real-time
    } else {
      const scenario = JSON.parse(fullText);
      displayScenario(scenario);
    }
  }
);
```

---

### getSessionTokenUsage()

**Purpose**: Get token usage for a specific game session

**Signature**:
```typescript
getSessionTokenUsage(sessionId: string): TokenUsage | null
```

**Returns**:
```typescript
{
  inputTokens: number;   // Tokens in prompts
  outputTokens: number;  // Tokens in responses
  totalTokens: number;   // Sum of input + output
  cost: number;          // Estimated cost in USD
}
```

**Example**:
```typescript
const usage = mcp.getSessionTokenUsage('GAME123');
if (usage) {
  console.log(`Tokens used: ${usage.totalTokens}`);
  console.log(`Cost: $${usage.cost.toFixed(4)}`);
}
```

---

### getTotalTokenUsage()

**Purpose**: Get cumulative token usage across all sessions

**Signature**:
```typescript
getTotalTokenUsage(): TokenUsage
```

**Example**:
```typescript
const total = mcp.getTotalTokenUsage();
console.log(`Total cost today: $${total.cost.toFixed(2)}`);
```

## Scenario Types

### divine_interrogation
- Generates moral dilemma questions
- 4 choices with god favor/disfavor
- Used for character creation
- **Priority**: 0 (urgent)

### moral_dilemma
- Complex ethical scenarios
- Multiple courses of action
- Consequence previews
- **Priority**: 1 (normal)

### investigation
- Mystery scenarios
- Clue and suspect system
- Detective gameplay
- **Priority**: 1 (normal)

### general
- Epic adventure scenarios
- Rich world-building
- Multiple objectives and NPCs
- **Priority**: 1 (normal)

## Environment Setup

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your API key
ANTHROPIC_API_KEY=sk-ant-...
```

## Rate Limiting

- **Max**: 50 requests per minute
- **Queue**: Automatically queues excess requests
- **Priority**: Urgent scenarios processed first
- **Overflow**: Rejects if queue exceeds 100 requests

## Error Handling

All methods gracefully fall back to mock data:

```typescript
// No need to check if API is available
// Service handles it automatically
const scenario = await mcp.generateDynamicScenario(context);
// Returns either AI-generated or mock scenario
```

## Cost Estimation

### Sonnet 4.5 (claude-sonnet-4-5-20250929)
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens
- Typical scenario: ~2000 tokens = ~$0.03

### Haiku (claude-3-haiku-20240307)
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- Typical scenario: ~1500 tokens = ~$0.002

**Recommendation**: Use Haiku for development, Sonnet for production

## Common Patterns

### Pattern 1: Generate with Usage Tracking
```typescript
const scenario = await mcp.generateDynamicScenario(context);
const usage = mcp.getSessionTokenUsage(context.gameCode);
logCost(usage.cost);
```

### Pattern 2: Stream for Better UX
```typescript
const chunks = [];
await mcp.streamScenarioResponse(context, (chunk, done) => {
  if (!done) {
    chunks.push(chunk);
    showLoadingAnimation(chunks.join(''));
  } else {
    const scenario = JSON.parse(chunks.join(''));
    displayScenario(scenario);
  }
});
```

### Pattern 3: Progressive Context
```typescript
const context: ScenarioContext = {
  gameCode: session.id,
  players: session.playerNames,
  scenarioType: 'moral_dilemma',
  theme: userInput,
  previousScenarios: session.scenarioHistory,
  playerChoices: session.pastChoices,
  godFavor: session.godFavorScores
};

const scenario = await mcp.generateDynamicScenario(context);
```

## Debugging

### Enable Verbose Logging
All MCP operations log with `[MCP]` prefix:

```
[MCP] Service initialized successfully
[MCP] Model: claude-sonnet-4-5-20250929
[MCP] Queued request req_123, queue size: 1
[MCP] Processing request req_123 (priority: 1)
[MCP] Generating moral_dilemma scenario for game GAME123
[MCP] Token usage - Session GAME123: 1523 tokens ($0.0228)
```

### Check Service Status
```typescript
if (mcp.checkAvailability()) {
  console.log('Using Claude API');
} else {
  console.log('Using mock data (no API key)');
}
```

### Monitor Queue
Queue size appears in logs:
```
[MCP] Queued request req_123, queue size: 5
```

If queue size approaches 100, consider:
1. Reducing request frequency
2. Using Haiku for faster responses
3. Implementing client-side caching

## Performance Tips

1. **Cache scenarios**: Don't regenerate identical scenarios
2. **Use Haiku for testing**: Much cheaper, still high quality
3. **Batch operations**: Group related requests
4. **Monitor usage**: Set cost alerts
5. **Stream long content**: Better perceived performance

## Troubleshooting

### "Queue is full" Error
- Current queue size: 100 requests
- Wait for queue to process
- Reduce request rate

### High Costs
- Check total usage: `mcp.getTotalTokenUsage()`
- Switch to Haiku model
- Reduce max_tokens in prompts
- Implement caching

### Slow Responses
- Use streaming for better UX
- Check queue size in logs
- Consider Haiku for faster model
- Verify network connection
