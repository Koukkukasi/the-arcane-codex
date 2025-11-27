/**
 * Scoring Service
 * Handles score calculation, leaderboards, and victory conditions
 */

import { NotificationService } from '../notification.service';
import { PlayerRepository } from '../../database/repositories/player.repository';
import { gameLogger } from '../logger';

// ============================================
// Types
// ============================================

export interface PlayerScore {
  playerId: string;
  playerName: string;
  baseScore: number;
  bonuses: ScoreBonus[];
  penalties: ScorePenalty[];
  totalScore: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBonus {
  type: string;
  description: string;
  points: number;
}

export interface ScorePenalty {
  type: string;
  description: string;
  points: number; // Negative value
}

export interface ScoreBreakdown {
  interrogation: number;
  cluesFound: number;
  correctAccusation: number;
  votingParticipation: number;
  teamwork: number;
  timeBonus: number;
  penalties: number;
}

export interface SessionScores {
  sessionId: string;
  players: Map<string, PlayerScore>;
  teamScore: number;
  outcome: 'victory' | 'defeat' | 'partial';
  achievementsUnlocked: Achievement[];
  startedAt: number;
  endedAt?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  playerId?: string; // If individual achievement
  unlockedAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  totalScore: number;
  gamesPlayed: number;
  wins: number;
  winRate: number;
}

export interface VictoryConditions {
  correctAccusation: boolean;
  allCluesFound: boolean;
  allSurvived: boolean;
  timeLimit?: number; // seconds
  customConditions?: { name: string; met: boolean }[];
}

// ============================================
// Score Configuration
// ============================================

const SCORE_CONFIG = {
  // Base scores
  CLUE_DISCOVERED: 100,
  QUESTION_ASKED: 10,
  CORRECT_ACCUSATION: 500,
  WRONG_ACCUSATION: -200,
  VOTE_CAST: 25,
  UNANIMOUS_VOTE_BONUS: 100,

  // Bonuses
  FIRST_CLUE_BONUS: 50,
  ALL_CLUES_BONUS: 300,
  UNDER_QUESTION_LIMIT_BONUS: 150,
  SPEED_BONUS_PER_MINUTE: 10,

  // Penalties
  NO_VOTE_PENALTY: -50,
  TIMEOUT_PENALTY: -100,

  // Team multipliers
  TEAM_WIN_MULTIPLIER: 1.5,
  TEAM_LOSS_MULTIPLIER: 0.5
};

// ============================================
// Pre-defined Achievements
// ============================================

const ACHIEVEMENTS = {
  FIRST_BLOOD: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Be the first to discover a clue',
    points: 50
  },
  SHERLOCK: {
    id: 'sherlock',
    name: 'Sherlock Holmes',
    description: 'Find all clues in a single game',
    points: 200
  },
  JUSTICE: {
    id: 'justice',
    name: 'Justice Served',
    description: 'Make the correct accusation',
    points: 300
  },
  SPEEDRUNNER: {
    id: 'speedrunner',
    name: 'Speed Runner',
    description: 'Complete the game in under 10 minutes',
    points: 150
  },
  EFFICIENT: {
    id: 'efficient',
    name: 'Efficient Investigator',
    description: 'Find all clues using fewer than half the available questions',
    points: 100
  },
  TEAM_PLAYER: {
    id: 'team_player',
    name: 'Team Player',
    description: 'Vote in every voting round',
    points: 75
  },
  UNANIMOUS: {
    id: 'unanimous',
    name: 'United We Stand',
    description: 'Achieve a unanimous vote in the final accusation',
    points: 100
  }
};

// ============================================
// Scoring Service
// ============================================

export class ScoringService {
  private static instance: ScoringService;

  private notificationService: NotificationService;
  private playerRepository: PlayerRepository;

  // Active session scores
  private sessionScores: Map<string, SessionScores> = new Map();

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.playerRepository = new PlayerRepository();
  }

  static getInstance(): ScoringService {
    if (!ScoringService.instance) {
      ScoringService.instance = new ScoringService();
    }
    return ScoringService.instance;
  }

  // ============================================
  // Session Score Management
  // ============================================

  /**
   * Initialize scoring for a session
   */
  initializeSession(sessionId: string, playerIds: { id: string; name: string }[]): SessionScores {
    const players = new Map<string, PlayerScore>();

    for (const { id, name } of playerIds) {
      players.set(id, {
        playerId: id,
        playerName: name,
        baseScore: 0,
        bonuses: [],
        penalties: [],
        totalScore: 0,
        breakdown: {
          interrogation: 0,
          cluesFound: 0,
          correctAccusation: 0,
          votingParticipation: 0,
          teamwork: 0,
          timeBonus: 0,
          penalties: 0
        }
      });
    }

    const scores: SessionScores = {
      sessionId,
      players,
      teamScore: 0,
      outcome: 'partial',
      achievementsUnlocked: [],
      startedAt: Date.now()
    };

    this.sessionScores.set(sessionId, scores);
    gameLogger.info({ sessionId, playerCount: playerIds.length }, 'Scoring initialized');

    return scores;
  }

  /**
   * Get session scores
   */
  getSessionScores(sessionId: string): SessionScores | null {
    return this.sessionScores.get(sessionId) || null;
  }

  /**
   * Get player score
   */
  getPlayerScore(sessionId: string, playerId: string): PlayerScore | null {
    const session = this.sessionScores.get(sessionId);
    return session?.players.get(playerId) || null;
  }

  // ============================================
  // Score Award Methods
  // ============================================

  /**
   * Award points for discovering a clue
   */
  awardCluePoints(
    sessionId: string,
    playerId: string,
    clueName: string,
    isFirst: boolean = false
  ): number {
    const session = this.sessionScores.get(sessionId);
    const player = session?.players.get(playerId);
    if (!session || !player) return 0;

    let points = SCORE_CONFIG.CLUE_DISCOVERED;
    player.breakdown.cluesFound += points;

    if (isFirst) {
      const bonus: ScoreBonus = {
        type: 'first_clue',
        description: 'First clue discovered',
        points: SCORE_CONFIG.FIRST_CLUE_BONUS
      };
      player.bonuses.push(bonus);
      points += bonus.points;

      // Check for First Blood achievement
      this.checkAndAwardAchievement(sessionId, playerId, 'FIRST_BLOOD');
    }

    this.updatePlayerTotal(player);
    this.updateTeamScore(session);

    gameLogger.debug({ sessionId, playerId, clueName, points }, 'Clue points awarded');

    return points;
  }

  /**
   * Award points for asking a question
   */
  awardQuestionPoints(sessionId: string, playerId: string): number {
    const session = this.sessionScores.get(sessionId);
    const player = session?.players.get(playerId);
    if (!session || !player) return 0;

    const points = SCORE_CONFIG.QUESTION_ASKED;
    player.breakdown.interrogation += points;

    this.updatePlayerTotal(player);

    return points;
  }

  /**
   * Award points for correct accusation
   */
  awardCorrectAccusation(sessionId: string, playerId: string): number {
    const session = this.sessionScores.get(sessionId);
    const player = session?.players.get(playerId);
    if (!session || !player) return 0;

    const points = SCORE_CONFIG.CORRECT_ACCUSATION;
    player.breakdown.correctAccusation += points;

    this.updatePlayerTotal(player);
    this.updateTeamScore(session);

    // Award Justice achievement
    this.checkAndAwardAchievement(sessionId, playerId, 'JUSTICE');

    gameLogger.info({ sessionId, playerId, points }, 'Correct accusation points awarded');

    return points;
  }

  /**
   * Apply penalty for wrong accusation
   */
  applyWrongAccusationPenalty(sessionId: string, playerId: string): number {
    const session = this.sessionScores.get(sessionId);
    const player = session?.players.get(playerId);
    if (!session || !player) return 0;

    const penalty: ScorePenalty = {
      type: 'wrong_accusation',
      description: 'Incorrect accusation',
      points: SCORE_CONFIG.WRONG_ACCUSATION
    };
    player.penalties.push(penalty);
    player.breakdown.penalties += penalty.points;

    this.updatePlayerTotal(player);
    this.updateTeamScore(session);

    return penalty.points;
  }

  /**
   * Award points for voting
   */
  awardVotePoints(sessionId: string, playerId: string): number {
    const session = this.sessionScores.get(sessionId);
    const player = session?.players.get(playerId);
    if (!session || !player) return 0;

    const points = SCORE_CONFIG.VOTE_CAST;
    player.breakdown.votingParticipation += points;

    this.updatePlayerTotal(player);

    return points;
  }

  /**
   * Award bonus for unanimous vote
   */
  awardUnanimousVoteBonus(sessionId: string): void {
    const session = this.sessionScores.get(sessionId);
    if (!session) return;

    for (const player of session.players.values()) {
      const bonus: ScoreBonus = {
        type: 'unanimous_vote',
        description: 'Team unanimous vote',
        points: SCORE_CONFIG.UNANIMOUS_VOTE_BONUS
      };
      player.bonuses.push(bonus);
      player.breakdown.teamwork += bonus.points;
      this.updatePlayerTotal(player);
    }

    this.updateTeamScore(session);

    // Award achievement
    this.checkAndAwardTeamAchievement(sessionId, 'UNANIMOUS');
  }

  /**
   * Apply penalty for not voting
   */
  applyNoVotePenalty(sessionId: string, playerId: string): void {
    const session = this.sessionScores.get(sessionId);
    const player = session?.players.get(playerId);
    if (!session || !player) return;

    const penalty: ScorePenalty = {
      type: 'no_vote',
      description: 'Did not vote',
      points: SCORE_CONFIG.NO_VOTE_PENALTY
    };
    player.penalties.push(penalty);
    player.breakdown.penalties += penalty.points;

    this.updatePlayerTotal(player);
  }

  // ============================================
  // Final Score Calculation
  // ============================================

  /**
   * Calculate final scores for session end
   */
  calculateFinalScores(
    sessionId: string,
    conditions: VictoryConditions,
    durationSeconds: number
  ): SessionScores | null {
    const session = this.sessionScores.get(sessionId);
    if (!session) return null;

    session.endedAt = Date.now();

    // Determine outcome
    if (conditions.correctAccusation) {
      session.outcome = 'victory';
    } else {
      session.outcome = conditions.allCluesFound ? 'partial' : 'defeat';
    }

    // Apply time bonus
    if (conditions.timeLimit && durationSeconds < conditions.timeLimit) {
      const minutesSaved = Math.floor((conditions.timeLimit - durationSeconds) / 60);
      const timeBonus = minutesSaved * SCORE_CONFIG.SPEED_BONUS_PER_MINUTE;

      for (const player of session.players.values()) {
        player.breakdown.timeBonus += timeBonus;
        player.bonuses.push({
          type: 'time_bonus',
          description: `Finished ${minutesSaved} minutes early`,
          points: timeBonus
        });
        this.updatePlayerTotal(player);
      }
    }

    // Apply outcome multiplier
    const multiplier = session.outcome === 'victory' ?
      SCORE_CONFIG.TEAM_WIN_MULTIPLIER :
      session.outcome === 'defeat' ?
        SCORE_CONFIG.TEAM_LOSS_MULTIPLIER : 1;

    for (const player of session.players.values()) {
      player.totalScore = Math.round(player.totalScore * multiplier);
    }

    this.updateTeamScore(session);

    // Check achievements
    this.checkEndGameAchievements(sessionId, conditions, durationSeconds);

    gameLogger.info({
      sessionId,
      outcome: session.outcome,
      teamScore: session.teamScore
    }, 'Final scores calculated');

    return session;
  }

  // ============================================
  // Achievements
  // ============================================

  /**
   * Check and award individual achievement
   */
  private checkAndAwardAchievement(
    sessionId: string,
    playerId: string,
    achievementKey: keyof typeof ACHIEVEMENTS
  ): boolean {
    const session = this.sessionScores.get(sessionId);
    if (!session) return false;

    const achievementDef = ACHIEVEMENTS[achievementKey];

    // Check if already awarded
    if (session.achievementsUnlocked.some(a => a.id === achievementDef.id && a.playerId === playerId)) {
      return false;
    }

    const achievement: Achievement = {
      ...achievementDef,
      playerId,
      unlockedAt: Date.now()
    };

    session.achievementsUnlocked.push(achievement);

    // Add bonus points
    const player = session.players.get(playerId);
    if (player) {
      player.bonuses.push({
        type: 'achievement',
        description: `Achievement: ${achievement.name}`,
        points: achievement.points
      });
      this.updatePlayerTotal(player);
    }

    // Notify player
    this.notificationService.achievement({
      sessionId,
      playerId,
      achievementId: achievement.id,
      title: achievement.name,
      description: achievement.description,
      points: achievement.points
    });

    gameLogger.info({ sessionId, playerId, achievement: achievement.name }, 'Achievement unlocked');

    return true;
  }

  /**
   * Check and award team achievement
   */
  private checkAndAwardTeamAchievement(
    sessionId: string,
    achievementKey: keyof typeof ACHIEVEMENTS
  ): boolean {
    const session = this.sessionScores.get(sessionId);
    if (!session) return false;

    const achievementDef = ACHIEVEMENTS[achievementKey];

    // Check if already awarded
    if (session.achievementsUnlocked.some(a => a.id === achievementDef.id && !a.playerId)) {
      return false;
    }

    const achievement: Achievement = {
      ...achievementDef,
      unlockedAt: Date.now()
    };

    session.achievementsUnlocked.push(achievement);

    // Award to all players
    for (const player of session.players.values()) {
      player.bonuses.push({
        type: 'achievement',
        description: `Team Achievement: ${achievement.name}`,
        points: achievement.points
      });
      this.updatePlayerTotal(player);

      this.notificationService.achievement({
        sessionId,
        playerId: player.playerId,
        achievementId: achievement.id,
        title: achievement.name,
        description: achievement.description,
        points: achievement.points
      });
    }

    return true;
  }

  /**
   * Check end game achievements
   */
  private checkEndGameAchievements(
    sessionId: string,
    conditions: VictoryConditions,
    durationSeconds: number
  ): void {
    const session = this.sessionScores.get(sessionId);
    if (!session) return;

    // Sherlock - all clues found
    if (conditions.allCluesFound) {
      this.checkAndAwardTeamAchievement(sessionId, 'SHERLOCK');
    }

    // Speedrunner - under 10 minutes
    if (durationSeconds < 600 && session.outcome === 'victory') {
      this.checkAndAwardTeamAchievement(sessionId, 'SPEEDRUNNER');
    }
  }

  // ============================================
  // Leaderboard
  // ============================================

  /**
   * Get global leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const topPlayers = await this.playerRepository.getLeaderboard(limit);

      return topPlayers.map((player, index) => {
        const totalGames = player.victories + player.defeats;
        return {
          rank: index + 1,
          playerId: player.player_id,
          playerName: player.username,
          totalScore: player.victories * 1000, // Simplified scoring
          gamesPlayed: totalGames,
          wins: player.victories,
          winRate: totalGames > 0 ? (player.victories / totalGames) * 100 : 0
        };
      });
    } catch (error) {
      gameLogger.error({ error }, 'Failed to get leaderboard');
      return [];
    }
  }

  /**
   * Update player stats in database
   */
  async updatePlayerStats(sessionId: string): Promise<void> {
    const session = this.sessionScores.get(sessionId);
    if (!session || !session.endedAt) return;

    const durationMinutes = Math.round((session.endedAt - session.startedAt) / 60000);
    const isVictory = session.outcome === 'victory';

    for (const player of session.players.values()) {
      try {
        await this.playerRepository.updatePlayerStats(player.playerId, {
          sessions: 1,
          playtimeMinutes: durationMinutes,
          victories: isVictory ? 1 : 0,
          defeats: isVictory ? 0 : 1
        });
      } catch (error) {
        gameLogger.error({ error, playerId: player.playerId }, 'Failed to update player stats');
      }
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Update player total score
   */
  private updatePlayerTotal(player: PlayerScore): void {
    const bonusTotal = player.bonuses.reduce((sum, b) => sum + b.points, 0);
    const penaltyTotal = player.penalties.reduce((sum, p) => sum + p.points, 0);

    player.baseScore =
      player.breakdown.interrogation +
      player.breakdown.cluesFound +
      player.breakdown.correctAccusation +
      player.breakdown.votingParticipation;

    player.totalScore = player.baseScore + bonusTotal + penaltyTotal +
      player.breakdown.timeBonus + player.breakdown.teamwork;
  }

  /**
   * Update team score
   */
  private updateTeamScore(session: SessionScores): void {
    session.teamScore = 0;
    for (const player of session.players.values()) {
      session.teamScore += player.totalScore;
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clean up session scores
   */
  cleanupSession(sessionId: string): void {
    this.sessionScores.delete(sessionId);
  }

  /**
   * Get statistics
   */
  getStats(): { activeSessions: number } {
    return {
      activeSessions: this.sessionScores.size
    };
  }
}
