/**
 * AI Services Index
 * Export all AI-related services
 */

// AI Provider
export {
  AIProviderFactory,
  getAIProvider,
  type AIProviderConfig,
  type AIMessage,
  type AICompletionRequest,
  type AICompletionResponse,
  type AIStreamHandler,
  type IAIProvider
} from './ai.provider';

// AI Game Master
export {
  AIGameMasterService,
  type ScenarioConfig,
  type GeneratedScenario,
  type GeneratedSuspect,
  type GeneratedClue,
  type TimelineEvent,
  type DialogueRequest,
  type DialogueResponse,
  type NarrativeRequest
} from './gm.service';
