/**
 * AI Provider Service
 * Abstracts AI model interactions (Anthropic Claude, OpenAI, etc.)
 * Provides unified interface for AI-powered game features
 */

import { gameLogger } from '../logger';

// ============================================
// Types
// ============================================

export interface AIProviderConfig {
  provider: 'anthropic' | 'openai' | 'mock';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

export interface AICompletionResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'max_tokens' | 'error';
}

export interface AIStreamHandler {
  onToken: (token: string) => void;
  onComplete: (response: AICompletionResponse) => void;
  onError: (error: Error) => void;
}

// ============================================
// AI Provider Interface
// ============================================

export interface IAIProvider {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  stream(request: AICompletionRequest, handler: AIStreamHandler): Promise<void>;
  getModelInfo(): { provider: string; model: string; maxContext: number };
}

// ============================================
// Mock AI Provider (for testing/development)
// ============================================

class MockAIProvider implements IAIProvider {
  private model: string = 'mock-model';

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate mock response based on last user message
    const lastUserMessage = request.messages.filter(m => m.role === 'user').pop();
    const content = this.generateMockResponse(lastUserMessage?.content || '');

    return {
      content,
      usage: {
        inputTokens: request.messages.reduce((sum, m) => sum + m.content.length / 4, 0),
        outputTokens: content.length / 4
      },
      model: this.model,
      finishReason: 'stop'
    };
  }

  async stream(request: AICompletionRequest, handler: AIStreamHandler): Promise<void> {
    try {
      const response = await this.complete(request);

      // Simulate streaming
      const words = response.content.split(' ');
      for (const word of words) {
        handler.onToken(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      handler.onComplete(response);
    } catch (error) {
      handler.onError(error as Error);
    }
  }

  getModelInfo() {
    return {
      provider: 'mock',
      model: this.model,
      maxContext: 4096
    };
  }

  private generateMockResponse(userMessage: string): string {
    // Simple mock responses for testing
    if (userMessage.toLowerCase().includes('clue')) {
      return 'The victim was last seen near the old lighthouse. A torn piece of fabric was found caught on the railing.';
    }
    if (userMessage.toLowerCase().includes('suspect')) {
      return 'Lord Blackwood has been acting strangely since the incident. He refuses to discuss his whereabouts that night.';
    }
    if (userMessage.toLowerCase().includes('alibi')) {
      return 'I was in my study, reading correspondence until well past midnight. My butler can confirm this.';
    }
    return 'The mystery deepens. You feel there is more to discover in this case.';
  }
}

// ============================================
// Anthropic Claude Provider
// ============================================

class AnthropicProvider implements IAIProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = config.model || 'claude-3-sonnet-20240229';
    this.maxTokens = config.maxTokens || 1024;
    this.temperature = config.temperature || 0.7;

    if (!this.apiKey) {
      gameLogger.warn('Anthropic API key not configured');
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemMessage = request.messages.find(m => m.role === 'system')?.content || '';
    const messages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxTokens || this.maxTokens,
          temperature: request.temperature ?? this.temperature,
          system: systemMessage,
          messages,
          stop_sequences: request.stopSequences
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as {
        content: Array<{ text?: string }>;
        usage?: { input_tokens?: number; output_tokens?: number };
        model: string;
        stop_reason?: string;
      };

      return {
        content: data.content[0]?.text || '',
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0
        },
        model: data.model,
        finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'max_tokens'
      };
    } catch (error) {
      gameLogger.error({ error }, 'Anthropic API call failed');
      throw error;
    }
  }

  async stream(request: AICompletionRequest, handler: AIStreamHandler): Promise<void> {
    // For simplicity, use non-streaming and simulate
    // In production, would use SSE streaming endpoint
    try {
      const response = await this.complete(request);

      // Simulate streaming for UI responsiveness
      const words = response.content.split(' ');
      for (const word of words) {
        handler.onToken(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      handler.onComplete(response);
    } catch (error) {
      handler.onError(error as Error);
    }
  }

  getModelInfo() {
    return {
      provider: 'anthropic',
      model: this.model,
      maxContext: 200000 // Claude 3 context window
    };
  }
}

// ============================================
// OpenAI Provider
// ============================================

class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'gpt-4-turbo-preview';
    this.maxTokens = config.maxTokens || 1024;
    this.temperature = config.temperature || 0.7;

    if (!this.apiKey) {
      gameLogger.warn('OpenAI API key not configured');
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: request.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          max_tokens: request.maxTokens || this.maxTokens,
          temperature: request.temperature ?? this.temperature,
          stop: request.stopSequences
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as {
        choices: Array<{ message?: { content?: string }; finish_reason?: string }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
        model: string;
      };
      const choice = data.choices[0];

      return {
        content: choice?.message?.content || '',
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0
        },
        model: data.model,
        finishReason: choice?.finish_reason === 'stop' ? 'stop' : 'max_tokens'
      };
    } catch (error) {
      gameLogger.error({ error }, 'OpenAI API call failed');
      throw error;
    }
  }

  async stream(request: AICompletionRequest, handler: AIStreamHandler): Promise<void> {
    try {
      const response = await this.complete(request);

      const words = response.content.split(' ');
      for (const word of words) {
        handler.onToken(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      handler.onComplete(response);
    } catch (error) {
      handler.onError(error as Error);
    }
  }

  getModelInfo() {
    return {
      provider: 'openai',
      model: this.model,
      maxContext: 128000 // GPT-4 Turbo context window
    };
  }
}

// ============================================
// AI Provider Factory
// ============================================

export class AIProviderFactory {
  private static instance: IAIProvider | null = null;
  private static config: AIProviderConfig | null = null;

  static configure(config: AIProviderConfig): void {
    this.config = config;
    this.instance = null; // Reset instance to use new config
  }

  static getProvider(): IAIProvider {
    if (!this.instance) {
      const config = this.config || { provider: 'mock' as const };

      switch (config.provider) {
        case 'anthropic':
          this.instance = new AnthropicProvider(config);
          break;
        case 'openai':
          this.instance = new OpenAIProvider(config);
          break;
        case 'mock':
        default:
          this.instance = new MockAIProvider();
          break;
      }

      gameLogger.info({ provider: config.provider }, 'AI provider initialized');
    }

    return this.instance;
  }

  static resetProvider(): void {
    this.instance = null;
  }
}

// Export singleton getter for convenience
export function getAIProvider(): IAIProvider {
  return AIProviderFactory.getProvider();
}
