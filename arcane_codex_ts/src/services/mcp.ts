import { InterrogationQuestion } from '../types/game';
import { getMockInterrogationQuestion } from '../data/questions';
import { mcpLogger } from './logger';

// Lazy-load Anthropic SDK to avoid issues in test environments
let Anthropic: any = null;
function getAnthropicClass(): any {
  if (!Anthropic) {
    try {
      // Dynamic import to avoid module loading issues in test environments
      Anthropic = require('@anthropic-ai/sdk').default;
    } catch (error) {
      mcpLogger.warn('Anthropic SDK not available, using mock mode');
      return null;
    }
  }
  return Anthropic;
}

// MCP (Model Context Protocol) service for AI integration
// Supports Claude API with streaming, rate limiting, and fallback to mock data

export interface MCPConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

// Kept for future use - may be needed for extended token tracking features
// export interface TokenUsage {
//   inputTokens: number;
//   outputTokens: number;
//   totalTokens: number;
//   cost: number; // Estimated cost in USD
// }

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // Estimated cost in USD
}

interface QueuedRequest {
  id: string;
  priority: number; // 0 = urgent, 1 = normal, 2 = low
  timestamp: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// Kept for future use - will be needed for dynamic scenario generation
// export interface ScenarioContext {
//   gameCode: string;
//   players: string[];
//   theme?: string;
//   scenarioType: 'divine_interrogation' | 'moral_dilemma' | 'investigation' | 'general';
//   previousScenarios?: string[];
//   playerChoices?: any[];
//   godFavor?: Record<string, Record<string, number>>; // playerId -> god -> favor
// }

interface ScenarioContext {
  gameCode: string;
  players: string[];
  theme?: string;
  scenarioType: 'divine_interrogation' | 'moral_dilemma' | 'investigation' | 'general';
  previousScenarios?: string[];
  playerChoices?: any[];
  godFavor?: Record<string, Record<string, number>>; // playerId -> god -> favor
}

/**
 * MCP Service for AI-powered game content generation
 */
export class MCPService {
  private client: any = null;
  private isAvailable: boolean = false;
  private config: MCPConfig;

  // Rate limiting
  private requestQueue: QueuedRequest[] = [];
  private requestsInLastMinute: number[] = []; // Timestamps of requests
  private readonly MAX_REQUESTS_PER_MINUTE = 50;
  private readonly MAX_QUEUE_SIZE = 100;
  private isProcessingQueue = false;

  // Token tracking
  private sessionTokenUsage: Map<string, TokenUsage> = new Map();
  private totalTokenUsage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cost: 0
  };

  // Pricing (per million tokens) - Updated for Sonnet 4.5
  private readonly PRICING = {
    'claude-sonnet-4-5-20250929': { input: 3.00, output: 15.00 },
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'default': { input: 3.00, output: 15.00 }
  };

  constructor(config: MCPConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      model: config.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      maxRetries: config.maxRetries || parseInt(process.env.MCP_MAX_RETRIES || '3'),
      timeout: config.timeout || parseInt(process.env.MCP_TIMEOUT_MS || '30000')
    };

    this.initialize();
    // Queue processor is started automatically via startQueueProcessor() method
    this.startQueueProcessor();
  }

  /**
   * Initialize the MCP client
   */
  private initialize(): void {
    if (this.config.apiKey) {
      try {
        const AnthropicClass = getAnthropicClass();
        if (!AnthropicClass) {
          mcpLogger.info('Anthropic SDK not available, using mock data');
          this.isAvailable = false;
          return;
        }
        this.client = new AnthropicClass({
          apiKey: this.config.apiKey
        });
        this.isAvailable = true;
        mcpLogger.info({
          model: this.config.model,
          maxRetries: this.config.maxRetries,
          timeout: this.config.timeout
        }, 'Service initialized successfully');
      } catch (error) {
        mcpLogger.error({ error }, 'Failed to initialize');
        this.isAvailable = false;
      }
    } else {
      mcpLogger.info('No API key provided, using mock data');
      this.isAvailable = false;
    }
  }

  /**
   * Check if MCP service is available
   */
  public checkAvailability(): boolean {
    return this.isAvailable;
  }

  /**
   * Get token usage statistics for a session
   */
  public getSessionTokenUsage(sessionId: string): TokenUsage | null {
    return this.sessionTokenUsage.get(sessionId) || null;
  }

  /**
   * Get total token usage across all sessions
   */
  public getTotalTokenUsage(): TokenUsage {
    return { ...this.totalTokenUsage };
  }

  /**
   * Start the request queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessingQueue && this.requestQueue.length > 0) {
        this.processQueue();
      }
    }, 100); // Check every 100ms
  }

  /**
   * Process queued requests with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Clean up old timestamps (older than 1 minute)
      const now = Date.now();
      this.requestsInLastMinute = this.requestsInLastMinute.filter(
        timestamp => now - timestamp < 60000
      );

      // Check if we can process more requests
      if (this.requestsInLastMinute.length >= this.MAX_REQUESTS_PER_MINUTE) {
        mcpLogger.warn('Rate limit reached, waiting');
        this.isProcessingQueue = false;
        return;
      }

      // Sort queue by priority (0 = highest priority)
      this.requestQueue.sort((a, b) => a.priority - b.priority);

      // Process the highest priority request
      const request = this.requestQueue.shift();
      if (request) {
        this.requestsInLastMinute.push(now);
        mcpLogger.debug({ requestId: request.id, priority: request.priority }, 'Processing request');

        try {
          const result = await request.execute();
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Add a request to the queue
   */
  private _queueRequest<T>(
    execute: () => Promise<T>,
    priority: number = 1
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.requestQueue.length >= this.MAX_QUEUE_SIZE) {
        mcpLogger.error('Queue overflow, rejecting request');
        reject(new Error('Request queue is full'));
        return;
      }

      const request: QueuedRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        priority,
        timestamp: Date.now(),
        execute: execute as () => Promise<any>,
        resolve,
        reject
      };

      this.requestQueue.push(request);
      mcpLogger.debug({ requestId: request.id, queueSize: this.requestQueue.length }, 'Request queued');
    });
  }

  /**
   * Track token usage for a request
   */
  private _trackTokenUsage(
    sessionId: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    const totalTokens = inputTokens + outputTokens;

    // Get pricing for current model
    const pricing = (this.PRICING as any)[this.config.model!] || this.PRICING.default;
    const cost = (inputTokens * pricing.input + outputTokens * pricing.output) / 1000000;

    // Update session usage
    const sessionUsage = this.sessionTokenUsage.get(sessionId) || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0
    };

    sessionUsage.inputTokens += inputTokens;
    sessionUsage.outputTokens += outputTokens;
    sessionUsage.totalTokens += totalTokens;
    sessionUsage.cost += cost;

    this.sessionTokenUsage.set(sessionId, sessionUsage);

    // Update total usage
    this.totalTokenUsage.inputTokens += inputTokens;
    this.totalTokenUsage.outputTokens += outputTokens;
    this.totalTokenUsage.totalTokens += totalTokens;
    this.totalTokenUsage.cost += cost;

    mcpLogger.info({
      sessionId,
      tokens: totalTokens,
      cost: cost.toFixed(4),
      totalTokens: this.totalTokenUsage.totalTokens,
      totalCost: this.totalTokenUsage.cost.toFixed(4)
    }, 'Token usage tracked');
  }

  /**
   * Generate an interrogation question using AI
   */
  public async generateInterrogationQuestion(
    playerId: string,
    questionNumber: number,
    previousAnswers: any[] = []
  ): Promise<InterrogationQuestion> {
    // If MCP is not available, fall back to mock questions
    if (!this.isAvailable || !this.client) {
      mcpLogger.debug({ playerId, questionNumber }, 'Using mock question');
      return getMockInterrogationQuestion(questionNumber);
    }

    try {
      // Queue the request with normal priority
      const response = await this._queueRequest(async () => {
        const prompt = this.buildInterrogationPrompt(questionNumber, previousAnswers);

        return await this.retryWithBackoff(async () => {
          return await this.client!.messages.create({
            model: this.config.model!,
            max_tokens: 1000,
            system: this._getSystemPrompt(),
            messages: [{
              role: 'user',
              content: prompt
            }]
          } as any);
        });
      }, 1); // Normal priority

      // Track token usage
      const usage = (response as any).usage;
      if (usage) {
        this._trackTokenUsage(playerId, usage.input_tokens, usage.output_tokens);
      }

      // Parse the AI response into a question format
      const responseText = typeof response.content[0] === 'string' ? response.content[0] : (response.content[0] as any).text;
      const question = this.parseInterrogationResponse(responseText, questionNumber);
      mcpLogger.info({ playerId, questionNumber }, 'Generated AI question');
      return question;

    } catch (error) {
      mcpLogger.error({ error }, 'Error generating question');
      // Fall back to mock questions on error
      return getMockInterrogationQuestion(questionNumber);
    }
  }

  /**
   * Generate a game scenario using AI (legacy method - use generateDynamicScenario for new code)
   */
  public async generateScenario(
    gameCode: string,
    players: string[],
    theme?: string
  ): Promise<any> {
    if (!this.isAvailable || !this.client) {
      mcpLogger.debug('Using mock scenario');
      return this.getMockScenario(theme);
    }

    try {
      const prompt = this.buildScenarioPrompt(players, theme);

      const response = await this.retryWithBackoff(async () => {
        return await this.client!.messages.create({
          model: this.config.model!,
          max_tokens: 1500,
          system: this._getSystemPrompt(),
          messages: [{
            role: 'user',
            content: prompt
          }]
        } as any);
      });

      const responseText = typeof response.content[0] === 'string' ? response.content[0] : (response.content[0] as any).text;
      const scenario = this.parseScenarioResponse(responseText);
      mcpLogger.info({ gameCode }, 'Generated AI scenario');
      return scenario;

    } catch (error) {
      mcpLogger.error({ error }, 'Error generating scenario');
      return this.getMockScenario(theme);
    }
  }

  /**
   * Generate a dynamic scenario based on context and scenario type
   * This is the enhanced version with full context support
   */
  public async generateDynamicScenario(context: ScenarioContext): Promise<any> {
    // If MCP is not available, fall back to mock scenarios
    if (!this.isAvailable || !this.client) {
      mcpLogger.debug('Using mock scenario for dynamic generation');
      return this.getMockScenario(context.theme);
    }

    try {
      // Select appropriate prompt based on scenario type
      let prompt: string;
      let maxTokens = 2000;

      switch (context.scenarioType) {
        case 'divine_interrogation':
          prompt = this.buildInterrogationPrompt(1, context.playerChoices || []);
          maxTokens = 1000;
          break;
        case 'moral_dilemma':
          prompt = this._buildMoralDilemmaPrompt(context);
          maxTokens = 2000;
          break;
        case 'investigation':
          prompt = this._buildInvestigationPrompt(context);
          maxTokens = 2500;
          break;
        case 'general':
        default:
          prompt = this._buildGeneralScenarioPrompt(context);
          maxTokens = 2000;
          break;
      }

      // Queue the request (urgent scenarios get priority 0)
      const priority = context.scenarioType === 'divine_interrogation' ? 0 : 1;

      const response = await this._queueRequest(async () => {
        return await this.retryWithBackoff(async () => {
          mcpLogger.info({ scenarioType: context.scenarioType, gameCode: context.gameCode }, 'Generating dynamic scenario');
          return await this.client!.messages.create({
            model: this.config.model!,
            max_tokens: maxTokens,
            system: this._getSystemPrompt(),
            messages: [{
              role: 'user',
              content: prompt
            }]
          } as any);
        });
      }, priority);

      // Track token usage
      const usage = (response as any).usage;
      if (usage) {
        this._trackTokenUsage(context.gameCode, usage.input_tokens, usage.output_tokens);
      }

      // Parse response based on scenario type
      const responseText = typeof response.content[0] === 'string'
        ? response.content[0]
        : (response.content[0] as any).text;

      const scenario = this.parseScenarioResponse(responseText);
      scenario.scenarioType = context.scenarioType;
      scenario.generatedAt = new Date().toISOString();

      mcpLogger.info({ scenarioType: context.scenarioType, gameCode: context.gameCode }, 'Successfully generated dynamic scenario');
      return scenario;

    } catch (error) {
      mcpLogger.error({ error }, 'Error generating dynamic scenario');
      return this.getMockScenario(context.theme);
    }
  }

  /**
   * Stream a scenario response in real-time using Claude's streaming API
   * Callback receives partial content as it arrives
   */
  public async streamScenarioResponse(
    context: ScenarioContext,
    callback: (chunk: string, isDone: boolean) => void
  ): Promise<void> {
    // If MCP is not available, fall back to mock with simulated streaming
    if (!this.isAvailable || !this.client) {
      mcpLogger.debug('Streaming mock scenario (simulated)');
      const mockScenario = this.getMockScenario(context.theme);
      const mockText = JSON.stringify(mockScenario, null, 2);

      // Simulate streaming by sending chunks
      for (let i = 0; i < mockText.length; i += 50) {
        const chunk = mockText.slice(i, i + 50);
        callback(chunk, i + 50 >= mockText.length);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }

    try {
      // Select appropriate prompt based on scenario type
      let prompt: string;
      let maxTokens = 2000;

      switch (context.scenarioType) {
        case 'moral_dilemma':
          prompt = this._buildMoralDilemmaPrompt(context);
          maxTokens = 2000;
          break;
        case 'investigation':
          prompt = this._buildInvestigationPrompt(context);
          maxTokens = 2500;
          break;
        case 'general':
        default:
          prompt = this._buildGeneralScenarioPrompt(context);
          maxTokens = 2000;
          break;
      }

      mcpLogger.info({ scenarioType: context.scenarioType, gameCode: context.gameCode }, 'Streaming scenario');

      // Use streaming API - use .stream() method which returns an async iterable
      const stream = await this.client!.messages.stream({
        model: this.config.model!,
        max_tokens: maxTokens,
        system: this._getSystemPrompt(),
        messages: [{
          role: 'user',
          content: prompt
        }]
      } as any);

      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = (event as any).delta;
          if (delta.type === 'text_delta') {
            const chunk = delta.text;
            fullText += chunk;
            callback(chunk, false);
          }
        } else if (event.type === 'message_start') {
          const message = (event as any).message;
          if (message.usage) {
            inputTokens = message.usage.input_tokens || 0;
          }
        } else if (event.type === 'message_delta') {
          const usage = (event as any).usage;
          if (usage) {
            outputTokens = usage.output_tokens || 0;
          }
        }
      }

      // Track token usage
      if (inputTokens > 0 || outputTokens > 0) {
        this._trackTokenUsage(context.gameCode, inputTokens, outputTokens);
      }

      // Signal completion
      callback('', true);
      mcpLogger.info({ scenarioType: context.scenarioType, gameCode: context.gameCode }, 'Completed streaming scenario');

    } catch (error) {
      mcpLogger.error({ error }, 'Error streaming scenario');
      // Send error as final chunk
      callback(JSON.stringify({ error: 'Failed to stream scenario' }), true);
    }
  }

  /**
   * Get system prompt for The Arcane Codex game
   */
  private _getSystemPrompt(): string {
    return `You are the AI Game Master for "The Arcane Codex", a dark fantasy tabletop RPG experience.

GAME LORE:
The world exists in the shadow of seven divine entities who judge mortal souls:
- VALDRIS (Justice) - The Lawbringer, values order, fairness, and protection of the innocent
- KAITHA (Chaos) - The Trickster, values freedom, unpredictability, and breaking conventions
- MORVANE (Death) - The Reaper, values acceptance of mortality, mercy killings, and natural order
- SYLARA (Nature) - The Wildmother, values harmony with nature, growth, and preservation
- KORVAN (War) - The Battlemaster, values strength, honor in combat, and glory
- ATHENA (Wisdom) - The Scholar, values knowledge, strategy, and thoughtful decision-making
- MERCUS (Commerce) - The Dealmaker, values wealth, negotiation, and mutual benefit

TONE: Dark, morally complex, with weighty consequences. Players face impossible choices where no option is purely good or evil.

YOUR ROLE: Generate compelling scenarios, moral dilemmas, and questions that:
1. Challenge players' moral compasses
2. Reveal character through difficult choices
3. Have no clear "right" answer
4. Reflect the complex philosophies of the seven gods
5. Create memorable storytelling moments

Always respond in valid JSON format as specified in each prompt.`;
  }

  /**
   * Build prompt for divine interrogation questions
   */
  private buildInterrogationPrompt(questionNumber: number, previousAnswers: any[]): string {
    const contextNote = previousAnswers.length > 0
      ? `Build upon these previous answers to create a connected narrative: ${JSON.stringify(previousAnswers)}`
      : 'This is the first question - establish a compelling moral dilemma.';

    return `Generate divine interrogation question ${questionNumber} for The Arcane Codex.

${contextNote}

Create a morally complex scenario with 4 choices. Each choice should:
- Represent a different god's philosophy
- Have both positive and negative consequences
- Favor 1-2 gods positively (+1 to +3 points) and possibly oppose 1-2 gods (-1 to -2 points)
- Be compelling and realistic, not cartoonish

IMPORTANT: Respond ONLY with valid JSON, no other text:
{
  "question_text": "Your scenario/question here (2-4 sentences)",
  "options": [
    {
      "id": "q${questionNumber}_a",
      "letter": "A",
      "text": "First choice description",
      "favor": { "VALDRIS": 2, "KAITHA": -1 }
    },
    {
      "id": "q${questionNumber}_b",
      "letter": "B",
      "text": "Second choice description",
      "favor": { "MORVANE": 2, "SYLARA": 1 }
    },
    {
      "id": "q${questionNumber}_c",
      "letter": "C",
      "text": "Third choice description",
      "favor": { "KORVAN": 3 }
    },
    {
      "id": "q${questionNumber}_d",
      "letter": "D",
      "text": "Fourth choice description",
      "favor": { "ATHENA": 2, "MERCUS": 1 }
    }
  ]
}`;
  }

  /**
   * Build prompt for moral dilemma scenarios
   */
  private _buildMoralDilemmaPrompt(context: ScenarioContext): string {
    return `Generate a moral dilemma scenario for The Arcane Codex.

CONTEXT:
- Players: ${context.players.join(', ')}
- Theme: ${context.theme || 'Dark fantasy moral choice'}
- Previous scenarios: ${context.previousScenarios?.join(', ') || 'None'}

Create a scenario where players must make a difficult moral choice with no clear right answer. The scenario should:
1. Present a conflict involving innocent lives, power, knowledge, or resources
2. Offer 3-4 possible courses of action
3. Each action should have both positive and negative consequences
4. Align choices with different gods' philosophies
5. Be appropriate for ${context.players.length} players to discuss

Respond ONLY with valid JSON:
{
  "title": "Scenario title",
  "description": "Full scenario description (3-5 paragraphs)",
  "conflict": "The central moral dilemma",
  "choices": [
    {
      "action": "What players could do",
      "consequences": "What might happen",
      "godAlignment": ["VALDRIS", "ATHENA"]
    }
  ],
  "context": "Any additional world-building details"
}`;
  }

  /**
   * Build prompt for investigation scenarios
   */
  private _buildInvestigationPrompt(context: ScenarioContext): string {
    return `Generate an investigation scenario for The Arcane Codex.

CONTEXT:
- Players: ${context.players.join(', ')}
- Theme: ${context.theme || 'Dark fantasy mystery'}

Create a mystery scenario where players must gather clues and make deductions. Include:
1. A mysterious event or crime
2. Multiple suspects or leads
3. Hidden clues and red herrings
4. Moral implications in the investigation methods
5. Multiple possible conclusions

Respond ONLY with valid JSON:
{
  "title": "Investigation title",
  "description": "Setup and initial information",
  "mystery": "What needs to be discovered",
  "clues": [
    {
      "description": "A clue description",
      "howToFind": "How players might discover this",
      "significance": "What it reveals"
    }
  ],
  "suspects": ["Suspect 1", "Suspect 2"],
  "moralDilemma": "The ethical challenge within the investigation"
}`;
  }

  /**
   * Build prompt for general scenario generation
   */
  private _buildGeneralScenarioPrompt(context: ScenarioContext): string {
    return `Generate a compelling scenario for The Arcane Codex.

CONTEXT:
- Players: ${context.players.join(', ')}
- Theme: ${context.theme || 'Epic dark fantasy adventure'}
- Player choices so far: ${JSON.stringify(context.playerChoices) || 'None'}

Create an engaging scenario that:
1. Provides opportunities for roleplay and character development
2. Includes moral complexity and difficult decisions
3. Allows for multiple approaches
4. Connects to the seven gods' domains
5. Has dramatic tension and stakes

Respond ONLY with valid JSON:
{
  "title": "Scenario title",
  "description": "Rich scenario description",
  "objectives": ["Primary goal", "Secondary goal"],
  "challenges": ["Challenge 1", "Challenge 2"],
  "npcs": [
    {
      "name": "NPC name",
      "role": "Their role in the scenario",
      "personality": "Brief personality description"
    }
  ],
  "possibleOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"]
}`;
  }

  /**
   * Build prompt for scenario generation
   */
  private buildScenarioPrompt(players: string[], theme?: string): string {
    return `
Create a D&D-style scenario for The Arcane Codex game.

Players: ${players.join(', ')}
${theme ? `Theme: ${theme}` : 'Theme: Choose an appropriate fantasy theme'}

Generate:
1. A compelling scenario description (2-3 paragraphs)
2. A central conflict or mystery
3. 3-4 possible player actions

Format as JSON:
{
  "title": "Scenario title",
  "description": "Full scenario description",
  "conflict": "Central conflict",
  "actions": ["action1", "action2", "action3"]
}`;
  }

  /**
   * Parse AI response into interrogation question format
   */
  private parseInterrogationResponse(response: string, questionNumber: number): InterrogationQuestion {
    try {
      // Attempt to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          question_number: questionNumber,
          question_text: parsed.question_text,
          options: parsed.options,
          total_questions: 30
        };
      }
    } catch (error) {
      mcpLogger.error({ error }, 'Failed to parse AI response');
    }

    // Fall back to mock question if parsing fails
    return getMockInterrogationQuestion(questionNumber);
  }

  /**
   * Parse AI response into scenario format
   */
  private parseScenarioResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      mcpLogger.error({ error }, 'Failed to parse scenario response');
    }

    return this.getMockScenario();
  }

  /**
   * Get a mock scenario
   */
  private getMockScenario(theme?: string): any {
    const scenarios = [
      {
        title: "The Cursed Merchant's Bargain",
        description: "A wealthy merchant approaches your party in a dimly lit tavern. His eyes dart nervously as he explains that his caravan was attacked by bandits, but something far more sinister occurred. The bandits fled in terror when they opened a specific chest, leaving behind all other treasures. The merchant offers you triple the usual rate to retrieve this chest, but refuses to say what's inside.",
        conflict: "The chest contains a trapped demon that grants wishes but demands souls in return",
        actions: [
          "Investigate the attack site for clues",
          "Research the merchant's background",
          "Attempt to negotiate a better deal",
          "Refuse and report to authorities"
        ]
      },
      {
        title: "The Whispering Woods",
        description: "The local village has been plagued by disappearances. Every full moon, someone vanishes into the ancient forest, leaving behind only their clothes neatly folded at the forest's edge. The villagers speak of haunting whispers that call out familiar names in the voices of loved ones. The village elder begs you to investigate before tonight's full moon rises.",
        conflict: "An ancient dryad is recruiting humans to defend her grove from loggers",
        actions: [
          "Set up surveillance at the forest edge",
          "Enter the forest to investigate",
          "Interview recent survivors",
          "Seek guidance from local druids"
        ]
      }
    ];

    return theme && theme.toLowerCase().includes('merchant')
      ? scenarios[0]
      : scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          mcpLogger.warn({ attempt: attempt + 1, delay }, 'Retrying request');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

// Singleton instance
let mcpInstance: MCPService | null = null;

/**
 * Get or create MCP service instance
 */
export function getMCPService(config?: MCPConfig): MCPService {
  if (!mcpInstance) {
    mcpInstance = new MCPService(config);
  }
  return mcpInstance;
}

export default MCPService;