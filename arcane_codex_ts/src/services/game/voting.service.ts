/**
 * Voting Service
 * Handles voting, debate, and accusation phases
 * Players vote on suspects and make final accusations
 */

import { v4 as uuidv4 } from 'uuid';
import { EventBus, ScenarioEvent } from '../event.bus';
import { NotificationService } from '../notification.service';
import { gameLogger } from '../logger';

// ============================================
// Types
// ============================================

export interface Vote {
  id: string;
  playerId: string;
  playerName: string;
  targetId: string; // suspectId or optionId
  timestamp: number;
  reason?: string;
}

export interface VotingRound {
  id: string;
  sessionId: string;
  type: 'debate' | 'accusation' | 'decision';
  title: string;
  description: string;
  options: VotingOption[];
  votes: Map<string, Vote>; // playerId -> Vote
  requiredVotes: number; // Number of players who must vote
  unanimityRequired: boolean;
  timeLimit?: number; // seconds
  startedAt: number;
  endedAt?: number;
  result?: VotingResult;
}

export interface VotingOption {
  id: string;
  label: string;
  description?: string;
  data?: Record<string, any>; // e.g., suspectId for accusation
}

export interface VotingResult {
  winnerId: string | null;
  winnerLabel?: string;
  totalVotes: number;
  votesPerOption: Map<string, number>;
  unanimous: boolean;
  decided: boolean;
  tie: boolean;
}

export interface Accusation {
  id: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  suspectId: string;
  suspectName: string;
  reasoning: string;
  cluesUsed: string[];
  timestamp: number;
  isCorrect?: boolean;
}

export interface DebateState {
  sessionId: string;
  activeRound: VotingRound | null;
  roundHistory: VotingRound[];
  accusations: Accusation[];
  finalVerdict?: {
    accusedId: string;
    accusedName: string;
    isGuilty: boolean;
    correct: boolean;
  };
}

// ============================================
// Voting Service
// ============================================

export class VotingService {
  private static instance: VotingService;

  private eventBus: EventBus;
  private notificationService: NotificationService;

  // Active debate states per session
  private debates: Map<string, DebateState> = new Map();

  // Vote timers
  private voteTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): VotingService {
    if (!VotingService.instance) {
      VotingService.instance = new VotingService();
    }
    return VotingService.instance;
  }

  // ============================================
  // Debate Management
  // ============================================

  /**
   * Initialize debate state for a session
   */
  initializeDebate(sessionId: string): DebateState {
    const state: DebateState = {
      sessionId,
      activeRound: null,
      roundHistory: [],
      accusations: []
    };

    this.debates.set(sessionId, state);
    gameLogger.info({ sessionId }, 'Debate initialized');

    return state;
  }

  /**
   * Get debate state
   */
  getDebateState(sessionId: string): DebateState | null {
    return this.debates.get(sessionId) || null;
  }

  // ============================================
  // Voting Rounds
  // ============================================

  /**
   * Start a new voting round
   */
  startVotingRound(
    sessionId: string,
    type: 'debate' | 'accusation' | 'decision',
    title: string,
    description: string,
    options: Omit<VotingOption, 'id'>[],
    requiredVotes: number,
    options2?: {
      unanimityRequired?: boolean;
      timeLimit?: number;
    }
  ): VotingRound | null {
    let state = this.debates.get(sessionId);
    if (!state) {
      state = this.initializeDebate(sessionId);
    }

    if (state.activeRound) {
      gameLogger.warn({ sessionId }, 'Cannot start new round - round already active');
      return null;
    }

    const round: VotingRound = {
      id: uuidv4(),
      sessionId,
      type,
      title,
      description,
      options: options.map(o => ({ ...o, id: uuidv4() })),
      votes: new Map(),
      requiredVotes,
      unanimityRequired: options2?.unanimityRequired || false,
      timeLimit: options2?.timeLimit,
      startedAt: Date.now()
    };

    state.activeRound = round;

    // Set up timer if time-limited
    if (round.timeLimit) {
      const timer = setTimeout(() => {
        this.endVotingRound(sessionId, true);
      }, round.timeLimit * 1000);

      this.voteTimers.set(round.id, timer);
    }

    // Emit event
    this.emitScenarioEvent(sessionId, 'choice_made', undefined, {
      eventType: 'voting_started',
      roundId: round.id,
      type,
      title,
      options: round.options
    });

    // Notify players
    this.notificationService.notifyRoom(sessionId, sessionId, {
      type: 'info',
      title: 'Vote Required',
      message: title,
      duration: round.timeLimit ? round.timeLimit * 1000 : 0
    });

    gameLogger.info({ sessionId, roundId: round.id, type }, 'Voting round started');

    return round;
  }

  /**
   * Cast a vote
   */
  castVote(
    sessionId: string,
    playerId: string,
    playerName: string,
    optionId: string,
    reason?: string
  ): { success: boolean; error?: string; roundComplete?: boolean } {
    const state = this.debates.get(sessionId);
    if (!state || !state.activeRound) {
      return { success: false, error: 'No active voting round' };
    }

    const round = state.activeRound;

    // Check if player already voted
    if (round.votes.has(playerId)) {
      return { success: false, error: 'Already voted' };
    }

    // Validate option
    if (!round.options.some(o => o.id === optionId)) {
      return { success: false, error: 'Invalid option' };
    }

    // Record vote
    const vote: Vote = {
      id: uuidv4(),
      playerId,
      playerName,
      targetId: optionId,
      timestamp: Date.now(),
      reason
    };

    round.votes.set(playerId, vote);

    // Emit event
    this.emitScenarioEvent(sessionId, 'choice_made', playerId, {
      eventType: 'vote_cast',
      roundId: round.id,
      // Don't reveal who voted for what until round ends
      votesCount: round.votes.size,
      requiredVotes: round.requiredVotes
    });

    gameLogger.debug({ sessionId, playerId, optionId }, 'Vote cast');

    // Check if round is complete
    if (round.votes.size >= round.requiredVotes) {
      this.endVotingRound(sessionId, false);
      return { success: true, roundComplete: true };
    }

    return { success: true, roundComplete: false };
  }

  /**
   * Change vote (if allowed)
   */
  changeVote(
    sessionId: string,
    playerId: string,
    newOptionId: string,
    reason?: string
  ): { success: boolean; error?: string } {
    const state = this.debates.get(sessionId);
    if (!state || !state.activeRound) {
      return { success: false, error: 'No active voting round' };
    }

    const round = state.activeRound;
    const existingVote = round.votes.get(playerId);

    if (!existingVote) {
      return { success: false, error: 'No vote to change' };
    }

    if (!round.options.some(o => o.id === newOptionId)) {
      return { success: false, error: 'Invalid option' };
    }

    existingVote.targetId = newOptionId;
    existingVote.timestamp = Date.now();
    existingVote.reason = reason;

    gameLogger.debug({ sessionId, playerId, newOptionId }, 'Vote changed');

    return { success: true };
  }

  /**
   * End voting round and calculate results
   */
  endVotingRound(sessionId: string, timedOut: boolean): VotingResult | null {
    const state = this.debates.get(sessionId);
    if (!state || !state.activeRound) {
      return null;
    }

    const round = state.activeRound;

    // Clear timer
    const timer = this.voteTimers.get(round.id);
    if (timer) {
      clearTimeout(timer);
      this.voteTimers.delete(round.id);
    }

    // Calculate results
    const votesPerOption = new Map<string, number>();
    round.options.forEach(o => votesPerOption.set(o.id, 0));

    for (const vote of round.votes.values()) {
      votesPerOption.set(vote.targetId, (votesPerOption.get(vote.targetId) || 0) + 1);
    }

    // Find winner
    let maxVotes = 0;
    let winnerId: string | null = null;
    let tie = false;

    for (const [optionId, votes] of votesPerOption.entries()) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winnerId = optionId;
        tie = false;
      } else if (votes === maxVotes && votes > 0) {
        tie = true;
      }
    }

    // Check unanimity if required
    const unanimous = round.votes.size > 0 &&
      Array.from(round.votes.values()).every(v => v.targetId === winnerId);

    const decided = !tie && (!round.unanimityRequired || unanimous);

    const winnerOption = winnerId ? round.options.find(o => o.id === winnerId) : undefined;

    const result: VotingResult = {
      winnerId: decided ? winnerId : null,
      winnerLabel: decided && winnerOption ? winnerOption.label : undefined,
      totalVotes: round.votes.size,
      votesPerOption,
      unanimous,
      decided,
      tie
    };

    round.result = result;
    round.endedAt = Date.now();

    // Move to history
    state.roundHistory.push(round);
    state.activeRound = null;

    // Emit event
    this.emitScenarioEvent(sessionId, 'consequence_revealed', undefined, {
      eventType: 'voting_ended',
      roundId: round.id,
      result,
      timedOut
    });

    // Notify players
    let resultMessage: string;
    if (decided && winnerOption) {
      resultMessage = `Vote decided: ${winnerOption.label}`;
    } else if (tie) {
      resultMessage = 'Vote ended in a tie!';
    } else if (!unanimous && round.unanimityRequired) {
      resultMessage = 'No unanimous decision reached.';
    } else {
      resultMessage = 'Voting ended.';
    }

    this.notificationService.notifyRoom(sessionId, sessionId, {
      type: decided ? 'success' : 'warning',
      title: 'Vote Complete',
      message: resultMessage,
      duration: 5000
    });

    gameLogger.info({ sessionId, roundId: round.id, result }, 'Voting round ended');

    return result;
  }

  // ============================================
  // Accusations
  // ============================================

  /**
   * Make an accusation
   */
  makeAccusation(
    sessionId: string,
    playerId: string,
    playerName: string,
    suspectId: string,
    suspectName: string,
    reasoning: string,
    cluesUsed: string[]
  ): Accusation {
    let state = this.debates.get(sessionId);
    if (!state) {
      state = this.initializeDebate(sessionId);
    }

    const accusation: Accusation = {
      id: uuidv4(),
      sessionId,
      playerId,
      playerName,
      suspectId,
      suspectName,
      reasoning,
      cluesUsed,
      timestamp: Date.now()
    };

    state.accusations.push(accusation);

    // Emit event
    this.emitScenarioEvent(sessionId, 'choice_made', playerId, {
      eventType: 'accusation_made',
      accusationId: accusation.id,
      suspectName,
      cluesCount: cluesUsed.length
    });

    // Notify players
    this.notificationService.notifyRoom(sessionId, sessionId, {
      type: 'warning',
      title: 'Accusation Made!',
      message: `${playerName} has accused ${suspectName}!`,
      duration: 5000
    });

    gameLogger.info({ sessionId, playerId, suspectId }, 'Accusation made');

    return accusation;
  }

  /**
   * Resolve accusation (reveal if correct)
   */
  resolveAccusation(
    sessionId: string,
    accusationId: string,
    isCorrect: boolean
  ): { success: boolean; accusation?: Accusation } {
    const state = this.debates.get(sessionId);
    if (!state) {
      return { success: false };
    }

    const accusation = state.accusations.find(a => a.id === accusationId);
    if (!accusation) {
      return { success: false };
    }

    accusation.isCorrect = isCorrect;

    // Emit event
    this.emitScenarioEvent(sessionId, 'consequence_revealed', undefined, {
      eventType: 'accusation_resolved',
      accusationId,
      isCorrect,
      accuserName: accusation.playerName,
      suspectName: accusation.suspectName
    });

    // Notify players
    this.notificationService.notifyRoom(sessionId, sessionId, {
      type: isCorrect ? 'success' : 'error',
      title: isCorrect ? 'Correct Accusation!' : 'Wrong Accusation!',
      message: isCorrect
        ? `${accusation.playerName} was right! ${accusation.suspectName} is guilty!`
        : `${accusation.playerName} was wrong. ${accusation.suspectName} is innocent.`,
      duration: 8000
    });

    gameLogger.info({ sessionId, accusationId, isCorrect }, 'Accusation resolved');

    return { success: true, accusation };
  }

  /**
   * Set final verdict
   */
  setFinalVerdict(
    sessionId: string,
    accusedId: string,
    accusedName: string,
    isGuilty: boolean,
    playerGuessedCorrectly: boolean
  ): void {
    const state = this.debates.get(sessionId);
    if (!state) return;

    state.finalVerdict = {
      accusedId,
      accusedName,
      isGuilty,
      correct: playerGuessedCorrectly
    };

    // Emit event
    this.emitScenarioEvent(sessionId, 'scenario_complete', undefined, {
      eventType: 'verdict_revealed',
      verdict: state.finalVerdict
    });

    gameLogger.info({ sessionId, verdict: state.finalVerdict }, 'Final verdict set');
  }

  // ============================================
  // Queries
  // ============================================

  /**
   * Get current voting round
   */
  getCurrentRound(sessionId: string): VotingRound | null {
    const state = this.debates.get(sessionId);
    return state?.activeRound || null;
  }

  /**
   * Get voting history
   */
  getVotingHistory(sessionId: string): VotingRound[] {
    const state = this.debates.get(sessionId);
    return state?.roundHistory || [];
  }

  /**
   * Get accusations
   */
  getAccusations(sessionId: string): Accusation[] {
    const state = this.debates.get(sessionId);
    return state?.accusations || [];
  }

  /**
   * Check if player has voted in current round
   */
  hasPlayerVoted(sessionId: string, playerId: string): boolean {
    const state = this.debates.get(sessionId);
    return state?.activeRound?.votes.has(playerId) || false;
  }

  // ============================================
  // Event Emission
  // ============================================

  private emitScenarioEvent(
    sessionId: string,
    type: 'choice_made' | 'consequence_revealed' | 'scenario_complete',
    playerId: string | undefined,
    data: Record<string, any>
  ): void {
    const event: ScenarioEvent = {
      sessionId,
      roomId: sessionId,
      type,
      playerId,
      data,
      timestamp: Date.now()
    };

    this.eventBus.emitScenarioEvent(event);
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clean up session
   */
  cleanupSession(sessionId: string): void {
    const state = this.debates.get(sessionId);
    if (state?.activeRound) {
      const timer = this.voteTimers.get(state.activeRound.id);
      if (timer) {
        clearTimeout(timer);
        this.voteTimers.delete(state.activeRound.id);
      }
    }

    this.debates.delete(sessionId);
  }

  /**
   * Get statistics
   */
  getStats(): {
    activeDebates: number;
    activeVotingRounds: number;
  } {
    let activeVotingRounds = 0;
    for (const state of this.debates.values()) {
      if (state.activeRound) activeVotingRounds++;
    }

    return {
      activeDebates: this.debates.size,
      activeVotingRounds
    };
  }
}
