import Anthropic from '@anthropic-ai/sdk';
import { InterrogationQuestion } from '../types/game';
import { getMockInterrogationQuestion } from '../data/questions';

// MCP (Model Context Protocol) service for AI integration
// Currently using mock data, but ready for Claude integration

interface MCPConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * MCP Service for AI-powered game content generation
 */
export class MCPService {
  private client: Anthropic | null = null;
  private isAvailable: boolean = false;
  private config: MCPConfig;

  constructor(config: MCPConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      model: config.model || 'claude-3-haiku-20240307',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000
    };

    this.initialize();
  }

  /**
   * Initialize the MCP client
   */
  private initialize(): void {
    if (this.config.apiKey) {
      try {
        this.client = new Anthropic({
          apiKey: this.config.apiKey
        });
        this.isAvailable = true;
        console.log('[MCP] Service initialized successfully');
      } catch (error) {
        console.error('[MCP] Failed to initialize:', error);
        this.isAvailable = false;
      }
    } else {
      console.log('[MCP] No API key provided, using mock data');
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
   * Generate an interrogation question using AI
   */
  public async generateInterrogationQuestion(
    playerId: string,
    questionNumber: number,
    previousAnswers: any[] = []
  ): Promise<InterrogationQuestion> {
    // If MCP is not available, fall back to mock questions
    if (!this.isAvailable || !this.client) {
      console.log(`[MCP] Using mock question for ${playerId}, question ${questionNumber}`);
      return getMockInterrogationQuestion(questionNumber);
    }

    try {
      // Attempt to generate question with Claude
      const prompt = this.buildInterrogationPrompt(questionNumber, previousAnswers);

      const response = await this.retryWithBackoff(async () => {
        return await this.client!.messages.create({
          model: this.config.model!,
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        } as any);
      });

      // Parse the AI response into a question format
      const responseText = typeof response.content[0] === 'string' ? response.content[0] : (response.content[0] as any).text;
      const question = this.parseInterrogationResponse(responseText, questionNumber);
      console.log(`[MCP] Generated AI question for ${playerId}, question ${questionNumber}`);
      return question;

    } catch (error) {
      console.error('[MCP] Error generating question:', error);
      // Fall back to mock questions on error
      return getMockInterrogationQuestion(questionNumber);
    }
  }

  /**
   * Generate a game scenario using AI
   */
  public async generateScenario(
    gameCode: string,
    players: string[],
    theme?: string
  ): Promise<any> {
    if (!this.isAvailable || !this.client) {
      console.log('[MCP] Using mock scenario');
      return this.getMockScenario(theme);
    }

    try {
      const prompt = this.buildScenarioPrompt(players, theme);

      const response = await this.retryWithBackoff(async () => {
        return await this.client!.messages.create({
          model: this.config.model!,
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        } as any);
      });

      const responseText = typeof response.content[0] === 'string' ? response.content[0] : (response.content[0] as any).text;
      const scenario = this.parseScenarioResponse(responseText);
      console.log(`[MCP] Generated AI scenario for game ${gameCode}`);
      return scenario;

    } catch (error) {
      console.error('[MCP] Error generating scenario:', error);
      return this.getMockScenario(theme);
    }
  }

  /**
   * Build prompt for interrogation question
   */
  private buildInterrogationPrompt(questionNumber: number, previousAnswers: any[]): string {
    return `
You are the Divine Interrogator for The Arcane Codex game. Generate question ${questionNumber} of a moral interrogation.

The seven gods are:
- VALDRIS (Justice)
- KAITHA (Chaos)
- MORVANE (Death)
- SYLARA (Nature)
- KORVAN (War)
- ATHENA (Wisdom)
- MERCUS (Commerce)

Previous answers: ${JSON.stringify(previousAnswers)}

Generate a moral dilemma question with 4 choices. Each choice should favor different gods.

Format your response as JSON:
{
  "question_text": "Your moral dilemma question here",
  "options": [
    {
      "id": "q${questionNumber}_a",
      "letter": "A",
      "text": "First choice",
      "favor": { "GOD_NAME": 2, "ANOTHER_GOD": -1 }
    },
    // ... 3 more options
  ]
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
      console.error('[MCP] Failed to parse AI response:', error);
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
      console.error('[MCP] Failed to parse scenario response:', error);
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
          console.log(`[MCP] Retry attempt ${attempt + 1} after ${delay}ms`);
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