# MCP Service Documentation

## Overview

The MCP (Model Context Protocol) Service provides AI-powered content generation for The Arcane Codex game using Claude by Anthropic. It features advanced capabilities including streaming responses, request queuing, rate limiting, and comprehensive token tracking.

## Features

### 1. Real-time Streaming
- Stream scenario responses as they're generated
- Reduces perceived latency for players
- Provides engaging real-time experience

### 2. Request Queue with Rate Limiting
- Maximum 50 requests per minute per session
- Priority queue system (urgent scenarios processed first)
- Automatic queue overflow handling
- Prevents API rate limit issues

### 3. Retry Logic with Exponential Backoff
- Automatic retry on failures (default: 3 attempts)
- Exponential backoff: 1s → 2s → 4s
- Graceful degradation to mock data on failure

### 4. Token Usage Tracking
- Per-session token tracking
- Total usage across all sessions
- Cost estimation based on model pricing
- Detailed logging for monitoring

### 5. Structured Prompt Engineering
- Four specialized prompt templates:
  - Divine Interrogation
  - Moral Dilemma
  - Investigation
  - General Scenario
- Each template includes game lore and context
- System message with comprehensive game world information

### 6. Context Window Management
- Automatic token tracking
- Model-aware token limits
- Intelligent context truncation

## Configuration

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional (with defaults)
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
MCP_MAX_RETRIES=3
MCP_TIMEOUT_MS=30000
```

### Supported Models

- `claude-sonnet-4-5-20250929` (recommended) - Latest Sonnet 4.5
- `claude-3-5-sonnet-20241022` - Sonnet 3.5
- `claude-3-haiku-20240307` - Faster, cheaper option

## API Reference

### Class: MCPService

#### Constructor
```typescript
constructor(config?: MCPConfig)
```

#### Methods

##### checkAvailability()
```typescript
public checkAvailability(): boolean
```
Returns whether the MCP service is available (API key configured).

##### getSessionTokenUsage()
```typescript
public getSessionTokenUsage(sessionId: string): TokenUsage | null
```
Get token usage statistics for a specific session.

Returns:
```typescript
{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // USD
}
```

##### getTotalTokenUsage()
```typescript
public getTotalTokenUsage(): TokenUsage
```
Get total token usage across all sessions.

##### generateInterrogationQuestion()
```typescript
public async generateInterrogationQuestion(
  playerId: string,
  questionNumber: number,
  previousAnswers?: any[]
): Promise<InterrogationQuestion>
```
Generate a divine interrogation question with moral dilemma choices.

##### generateDynamicScenario()
```typescript
public async generateDynamicScenario(
  context: ScenarioContext
): Promise<any>
```
**NEW METHOD** - Generate a scenario based on context and type.

Parameters:
```typescript
interface ScenarioContext {
  gameCode: string;
  players: string[];
  theme?: string;
  scenarioType: 'divine_interrogation' | 'moral_dilemma' | 'investigation' | 'general';
  previousScenarios?: string[];
  playerChoices?: any[];
  godFavor?: Record<string, Record<string, number>>;
}
```

##### streamScenarioResponse()
```typescript
public async streamScenarioResponse(
  context: ScenarioContext,
  callback: (chunk: string, isDone: boolean) => void
): Promise<void>
```
**NEW METHOD** - Stream a scenario response in real-time.

Callback receives:
- `chunk`: Partial content as it arrives
- `isDone`: True when streaming is complete

## Usage Examples

### Basic Scenario Generation

```typescript
import { getMCPService } from './services/mcp';

const mcp = getMCPService();

// Generate a moral dilemma scenario
const scenario = await mcp.generateDynamicScenario({
  gameCode: 'GAME123',
  players: ['Alice', 'Bob', 'Charlie'],
  scenarioType: 'moral_dilemma',
  theme: 'A cursed artifact threatens the village'
});

console.log(scenario.title);
console.log(scenario.description);
```

### Streaming Scenario

```typescript
let fullResponse = '';

await mcp.streamScenarioResponse(
  {
    gameCode: 'GAME123',
    players: ['Alice', 'Bob'],
    scenarioType: 'investigation',
    theme: 'Mystery in the haunted manor'
  },
  (chunk, isDone) => {
    if (!isDone) {
      fullResponse += chunk;
      // Update UI with partial content
      console.log('Received chunk:', chunk);
    } else {
      console.log('Streaming complete!');
      console.log('Full response:', fullResponse);
    }
  }
);
```

### Token Usage Tracking

```typescript
// Generate some content
await mcp.generateDynamicScenario(context);

// Check usage
const sessionUsage = mcp.getSessionTokenUsage('GAME123');
console.log(`Session used ${sessionUsage.totalTokens} tokens`);
console.log(`Estimated cost: $${sessionUsage.cost.toFixed(4)}`);

// Check total usage
const totalUsage = mcp.getTotalTokenUsage();
console.log(`Total tokens: ${totalUsage.totalTokens}`);
console.log(`Total cost: $${totalUsage.cost.toFixed(2)}`);
```

### Priority Queue

```typescript
// Urgent scenario (priority 0) - processed first
const urgentContext: ScenarioContext = {
  gameCode: 'GAME123',
  players: ['Alice'],
  scenarioType: 'divine_interrogation',
  theme: 'Character creation'
};

// The divine_interrogation type automatically gets priority 0
await mcp.generateDynamicScenario(urgentContext);
```

## Rate Limiting

The service implements a priority queue with rate limiting:

- **Max Rate**: 50 requests per minute
- **Queue Size**: 100 requests maximum
- **Priorities**:
  - 0: Urgent (divine interrogation, character creation)
  - 1: Normal (most scenarios)
  - 2: Low (background tasks)

Requests exceeding the queue size are rejected with an error.

## Error Handling

The service includes comprehensive error handling:

1. **Retry Logic**: Automatically retries failed requests (3 attempts by default)
2. **Graceful Degradation**: Falls back to mock data if API is unavailable
3. **Queue Overflow**: Rejects new requests if queue is full
4. **Timeout Protection**: Requests timeout after 30 seconds (configurable)

## Logging

All operations are logged with the `[MCP]` prefix:

```
[MCP] Service initialized successfully
[MCP] Model: claude-sonnet-4-5-20250929
[MCP] Max retries: 3
[MCP] Timeout: 30000ms
[MCP] Queued request req_1234567890_abc, queue size: 1
[MCP] Processing request req_1234567890_abc (priority: 1)
[MCP] Generating moral_dilemma scenario for game GAME123
[MCP] Token usage - Session GAME123: 1523 tokens ($0.0228)
[MCP] Total usage: 5847 tokens ($0.0877)
```

## Prompt Templates

### 1. Divine Interrogation
- Generates moral dilemma questions
- 4 choices aligned with different gods
- Includes favor/disfavor system
- Builds narrative from previous answers

### 2. Moral Dilemma
- Complex ethical scenarios
- Multiple courses of action
- Positive and negative consequences
- God alignment for each choice

### 3. Investigation
- Mystery scenarios
- Clues and red herrings
- Multiple suspects
- Moral implications in methods

### 4. General Scenario
- Epic adventure scenarios
- Multiple objectives
- Challenges and NPCs
- Possible outcomes

## Best Practices

1. **Monitor Token Usage**: Regularly check token consumption to manage costs
2. **Use Streaming for Long Content**: Improves user experience for lengthy scenarios
3. **Leverage Priority Queue**: Mark urgent requests appropriately
4. **Handle Graceful Degradation**: Always handle the mock data fallback case
5. **Set Appropriate Timeouts**: Adjust based on your use case

## Troubleshooting

### "Queue is full" errors
- Reduce request frequency
- Implement client-side throttling
- Increase `MAX_QUEUE_SIZE` if needed

### High token costs
- Use Haiku model for less complex scenarios
- Reduce `max_tokens` in prompts
- Cache and reuse generated content

### Rate limit errors
- Requests are automatically queued
- Check queue size in logs
- Consider implementing request batching

## Migration Guide

### From Old generateScenario() to generateDynamicScenario()

**Old:**
```typescript
await mcp.generateScenario(gameCode, players, theme);
```

**New:**
```typescript
await mcp.generateDynamicScenario({
  gameCode,
  players,
  theme,
  scenarioType: 'general'
});
```

The old method still works but lacks advanced features like:
- Scenario type selection
- Previous scenario context
- Player choices integration
- God favor tracking
