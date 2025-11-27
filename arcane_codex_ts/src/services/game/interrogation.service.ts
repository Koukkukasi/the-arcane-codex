/**
 * Interrogation Service
 * Handles the interrogation phase game logic
 * Players ask questions, receive answers, and gather clues
 */

import { EventBus, InterrogationEvent } from '../event.bus';
import { NotificationService } from '../notification.service';
import { gameLogger } from '../logger';

// ============================================
// Types
// ============================================

export interface Question {
  id: string;
  text: string;
  category: 'background' | 'alibi' | 'motive' | 'evidence' | 'relationship';
  difficulty: 'easy' | 'medium' | 'hard';
  suspectId: string;
  isAsked: boolean;
  askedBy?: string;
  askedAt?: number;
}

export interface Answer {
  questionId: string;
  text: string;
  truthfulness: 'truth' | 'lie' | 'partial';
  clueRevealed?: string;
  moodImpact: number; // -10 to +10
}

export interface Suspect {
  id: string;
  name: string;
  description: string;
  mood: number; // 0-100 (0 = hostile, 50 = neutral, 100 = cooperative)
  isGuilty: boolean;
  alibi: string;
  secrets: string[];
  knownClues: string[];
  questionsAvailable: Question[];
  questionsAsked: Question[];
}

export interface InterrogationState {
  sessionId: string;
  currentSuspect: Suspect | null;
  suspects: Map<string, Suspect>;
  cluesDiscovered: string[];
  questionsRemaining: number;
  maxQuestions: number;
  startedAt: number;
  completedAt?: number;
}

export interface AskQuestionResult {
  success: boolean;
  answer?: Answer;
  clueRevealed?: string;
  moodChange?: number;
  newMood?: number;
  questionsRemaining?: number;
  error?: string;
}

// ============================================
// Interrogation Service
// ============================================

export class InterrogationService {
  private static instance: InterrogationService;

  private eventBus: EventBus;
  private notificationService: NotificationService;

  // Active interrogations per session
  private interrogations: Map<string, InterrogationState> = new Map();

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): InterrogationService {
    if (!InterrogationService.instance) {
      InterrogationService.instance = new InterrogationService();
    }
    return InterrogationService.instance;
  }

  // ============================================
  // Interrogation Lifecycle
  // ============================================

  /**
   * Start interrogation for a session
   */
  async startInterrogation(
    sessionId: string,
    suspects: Suspect[],
    maxQuestions: number = 10
  ): Promise<InterrogationState> {
    const suspectMap = new Map<string, Suspect>();
    suspects.forEach(s => suspectMap.set(s.id, s));

    const state: InterrogationState = {
      sessionId,
      currentSuspect: suspects[0] || null,
      suspects: suspectMap,
      cluesDiscovered: [],
      questionsRemaining: maxQuestions,
      maxQuestions,
      startedAt: Date.now()
    };

    this.interrogations.set(sessionId, state);

    // Emit event
    this.emitInterrogationEvent(sessionId, 'question_asked', '', {
      type: 'start',
      suspectsCount: suspects.length,
      maxQuestions
    });

    gameLogger.info({ sessionId, suspectsCount: suspects.length }, 'Interrogation started');

    return state;
  }

  /**
   * Get interrogation state
   */
  getInterrogationState(sessionId: string): InterrogationState | null {
    return this.interrogations.get(sessionId) || null;
  }

  /**
   * End interrogation
   */
  endInterrogation(sessionId: string): InterrogationState | null {
    const state = this.interrogations.get(sessionId);
    if (!state) return null;

    state.completedAt = Date.now();
    this.interrogations.delete(sessionId);

    gameLogger.info({ sessionId, cluesFound: state.cluesDiscovered.length }, 'Interrogation ended');

    return state;
  }

  // ============================================
  // Suspect Management
  // ============================================

  /**
   * Select a suspect to interrogate
   */
  selectSuspect(sessionId: string, suspectId: string): Suspect | null {
    const state = this.interrogations.get(sessionId);
    if (!state) return null;

    const suspect = state.suspects.get(suspectId);
    if (!suspect) return null;

    state.currentSuspect = suspect;

    this.emitInterrogationEvent(sessionId, 'question_asked', '', {
      type: 'suspect_selected',
      suspectId,
      suspectName: suspect.name
    });

    return suspect;
  }

  /**
   * Get current suspect
   */
  getCurrentSuspect(sessionId: string): Suspect | null {
    const state = this.interrogations.get(sessionId);
    return state?.currentSuspect || null;
  }

  /**
   * Get all suspects
   */
  getAllSuspects(sessionId: string): Suspect[] {
    const state = this.interrogations.get(sessionId);
    return state ? Array.from(state.suspects.values()) : [];
  }

  // ============================================
  // Question & Answer Logic
  // ============================================

  /**
   * Ask a question to the current suspect
   */
  async askQuestion(
    sessionId: string,
    playerId: string,
    questionId: string
  ): Promise<AskQuestionResult> {
    const state = this.interrogations.get(sessionId);
    if (!state) {
      return { success: false, error: 'No active interrogation' };
    }

    if (!state.currentSuspect) {
      return { success: false, error: 'No suspect selected' };
    }

    if (state.questionsRemaining <= 0) {
      return { success: false, error: 'No questions remaining' };
    }

    const suspect = state.currentSuspect;

    // Find the question
    const question = suspect.questionsAvailable.find(q => q.id === questionId);
    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    if (question.isAsked) {
      return { success: false, error: 'Question already asked' };
    }

    // Mark question as asked
    question.isAsked = true;
    question.askedBy = playerId;
    question.askedAt = Date.now();
    suspect.questionsAsked.push(question);

    // Generate answer based on suspect mood and question difficulty
    const answer = this.generateAnswer(suspect, question);

    // Apply mood change
    suspect.mood = Math.max(0, Math.min(100, suspect.mood + answer.moodImpact));

    // Decrement remaining questions
    state.questionsRemaining--;

    // Check for clue reveal
    if (answer.clueRevealed && !state.cluesDiscovered.includes(answer.clueRevealed)) {
      state.cluesDiscovered.push(answer.clueRevealed);

      // Notify player
      this.notificationService.notifyClueDiscovered(sessionId, playerId, answer.clueRevealed);
    }

    // Emit events
    this.emitInterrogationEvent(sessionId, 'question_asked', playerId, {
      questionId,
      questionText: question.text,
      category: question.category
    });

    this.emitInterrogationEvent(sessionId, 'answer_received', playerId, {
      questionId,
      answerText: answer.text,
      clueRevealed: answer.clueRevealed
    });

    if (answer.moodImpact !== 0) {
      this.emitInterrogationEvent(sessionId, 'mood_change', playerId, {
        suspectId: suspect.id,
        oldMood: suspect.mood - answer.moodImpact,
        newMood: suspect.mood,
        change: answer.moodImpact
      });
    }

    return {
      success: true,
      answer,
      clueRevealed: answer.clueRevealed,
      moodChange: answer.moodImpact,
      newMood: suspect.mood,
      questionsRemaining: state.questionsRemaining
    };
  }

  /**
   * Generate answer based on suspect state
   */
  private generateAnswer(suspect: Suspect, question: Question): Answer {
    // Determine truthfulness based on mood
    let truthfulness: 'truth' | 'lie' | 'partial';
    const moodRoll = Math.random() * 100;

    if (suspect.mood >= 70 || moodRoll < suspect.mood * 0.8) {
      truthfulness = 'truth';
    } else if (suspect.mood <= 30 || moodRoll > suspect.mood + 50) {
      truthfulness = 'lie';
    } else {
      truthfulness = 'partial';
    }

    // Guilty suspects lie more about certain categories
    if (suspect.isGuilty && ['alibi', 'motive'].includes(question.category)) {
      if (Math.random() > 0.3) {
        truthfulness = truthfulness === 'truth' ? 'partial' : 'lie';
      }
    }

    // Generate mood impact based on question difficulty
    let moodImpact = 0;
    switch (question.difficulty) {
      case 'easy':
        moodImpact = Math.floor(Math.random() * 5) + 1; // +1 to +5
        break;
      case 'medium':
        moodImpact = Math.floor(Math.random() * 11) - 5; // -5 to +5
        break;
      case 'hard':
        moodImpact = -Math.floor(Math.random() * 10) - 1; // -1 to -10
        break;
    }

    // Determine if clue is revealed
    let clueRevealed: string | undefined;
    if (truthfulness !== 'lie' && suspect.knownClues.length > 0) {
      const revealChance = question.difficulty === 'hard' ? 0.7 :
                          question.difficulty === 'medium' ? 0.4 : 0.2;

      if (Math.random() < revealChance) {
        const unrevealedClues = suspect.knownClues.filter(c =>
          !suspect.questionsAsked.some(q =>
            this.findAnswerForQuestion(suspect, q.id)?.clueRevealed === c
          )
        );

        if (unrevealedClues.length > 0) {
          clueRevealed = unrevealedClues[Math.floor(Math.random() * unrevealedClues.length)];
        }
      }
    }

    // Generate answer text (placeholder - would be AI-generated in production)
    const answerText = this.generateAnswerText(suspect, question, truthfulness, clueRevealed);

    return {
      questionId: question.id,
      text: answerText,
      truthfulness,
      clueRevealed,
      moodImpact
    };
  }

  /**
   * Find answer for a previously asked question
   */
  private findAnswerForQuestion(_suspect: Suspect, _questionId: string): Answer | undefined {
    // This would be stored in practice
    return undefined;
  }

  /**
   * Generate answer text (placeholder)
   */
  private generateAnswerText(
    suspect: Suspect,
    question: Question,
    truthfulness: 'truth' | 'lie' | 'partial',
    clueRevealed?: string
  ): string {
    const moodDesc = suspect.mood >= 70 ? 'cooperatively' :
                     suspect.mood <= 30 ? 'defensively' : 'cautiously';

    let response = `${suspect.name} responds ${moodDesc}: `;

    switch (truthfulness) {
      case 'truth':
        response += `"I'll tell you what I know about ${question.category}."`;
        break;
      case 'partial':
        response += `"I... I'm not sure I remember everything about that."`;
        break;
      case 'lie':
        response += `"I have no idea what you're talking about."`;
        break;
    }

    if (clueRevealed) {
      response += ` [Clue discovered: ${clueRevealed}]`;
    }

    return response;
  }

  // ============================================
  // Clue Management
  // ============================================

  /**
   * Get discovered clues
   */
  getDiscoveredClues(sessionId: string): string[] {
    const state = this.interrogations.get(sessionId);
    return state?.cluesDiscovered || [];
  }

  /**
   * Manually reveal a clue (e.g., from AI)
   */
  revealClue(sessionId: string, playerId: string, clue: string): boolean {
    const state = this.interrogations.get(sessionId);
    if (!state) return false;

    if (!state.cluesDiscovered.includes(clue)) {
      state.cluesDiscovered.push(clue);

      this.emitInterrogationEvent(sessionId, 'clue_revealed', playerId, { clue });
      this.notificationService.notifyClueDiscovered(sessionId, playerId, clue);

      return true;
    }

    return false;
  }

  // ============================================
  // Scoring
  // ============================================

  /**
   * Calculate interrogation score
   */
  calculateScore(sessionId: string): {
    cluesFound: number;
    totalClues: number;
    questionsUsed: number;
    efficiency: number;
    score: number;
  } {
    const state = this.interrogations.get(sessionId);
    if (!state) {
      return { cluesFound: 0, totalClues: 0, questionsUsed: 0, efficiency: 0, score: 0 };
    }

    const cluesFound = state.cluesDiscovered.length;

    // Count total available clues
    let totalClues = 0;
    for (const suspect of state.suspects.values()) {
      totalClues += suspect.knownClues.length;
    }

    const questionsUsed = state.maxQuestions - state.questionsRemaining;
    const efficiency = questionsUsed > 0 ? (cluesFound / questionsUsed) * 100 : 0;

    // Base score calculation
    const clueScore = cluesFound * 100;
    const efficiencyBonus = Math.floor(efficiency * 10);
    const unusedQuestionsBonus = state.questionsRemaining * 20;

    const score = clueScore + efficiencyBonus + unusedQuestionsBonus;

    return {
      cluesFound,
      totalClues,
      questionsUsed,
      efficiency: Math.round(efficiency * 100) / 100,
      score
    };
  }

  // ============================================
  // Event Emission
  // ============================================

  private emitInterrogationEvent(
    sessionId: string,
    type: 'question_asked' | 'answer_received' | 'clue_revealed' | 'mood_change',
    playerId: string,
    data: Record<string, any>
  ): void {
    const state = this.interrogations.get(sessionId);
    const roomId = state?.sessionId || sessionId;

    const event: InterrogationEvent = {
      sessionId,
      roomId,
      type,
      playerId,
      data,
      timestamp: Date.now()
    };

    this.eventBus.emitInterrogationEvent(event);
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clean up session
   */
  cleanupSession(sessionId: string): void {
    this.interrogations.delete(sessionId);
  }

  /**
   * Get statistics
   */
  getStats(): { activeInterrogations: number } {
    return {
      activeInterrogations: this.interrogations.size
    };
  }
}
