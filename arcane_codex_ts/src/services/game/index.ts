/**
 * Game Services Index
 * Export all game logic services
 */

// Game Session Management
export { GameSessionService } from './GameSessionService';
export type {
  GameSession,
  SessionPlayer,
  ScenarioSessionState
} from './GameSessionService';

// Scenario Management
export { ScenarioManager } from './ScenarioManager';
export type {
  Scenario,
  ScenarioChoice,
  ScenarioConsequence,
  ScenarioType,
  PlayerChoice,
  ScenarioSession,
  ScenarioOutcome
} from './ScenarioManager';

// Interrogation
export { InterrogationService } from './interrogation.service';
export type {
  Question,
  Answer,
  Suspect,
  InterrogationState,
  AskQuestionResult
} from './interrogation.service';

// Voting & Accusation
export { VotingService } from './voting.service';
export type {
  Vote,
  VotingRound,
  VotingOption,
  VotingResult,
  Accusation,
  DebateState
} from './voting.service';

// Scoring
export { ScoringService } from './scoring.service';
export type {
  PlayerScore,
  ScoreBonus,
  ScorePenalty,
  ScoreBreakdown,
  SessionScores,
  Achievement,
  LeaderboardEntry,
  VictoryConditions
} from './scoring.service';
