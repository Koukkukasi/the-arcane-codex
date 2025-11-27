/**
 * AI Game Master Service
 * Powers the AI-driven game master for dynamic storytelling
 * Generates narratives, manages NPC dialogue, and creates mysteries
 */

import { getAIProvider, AIMessage, AICompletionResponse } from './ai.provider';
import { gameLogger } from '../logger';
import type { Suspect } from '../game/interrogation.service';

// ============================================
// Types
// ============================================

export interface ScenarioConfig {
  title: string;
  setting: string;
  era: string;
  theme: 'murder_mystery' | 'heist' | 'conspiracy' | 'supernatural';
  difficulty: 'easy' | 'medium' | 'hard';
  playerCount: number;
}

export interface GeneratedScenario {
  id: string;
  title: string;
  introduction: string;
  setting: string;
  backstory: string;
  suspects: GeneratedSuspect[];
  clues: GeneratedClue[];
  guiltyPartyId: string;
  timeline: TimelineEvent[];
  redHerrings: string[];
}

export interface GeneratedSuspect {
  id: string;
  name: string;
  description: string;
  backstory: string;
  motive: string;
  alibi: string;
  secrets: string[];
  personalityTraits: string[];
  relationship: string; // Relationship to victim
  isGuilty: boolean;
}

export interface GeneratedClue {
  id: string;
  name: string;
  description: string;
  location: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsTo: string; // Suspect ID or 'red_herring'
  revealedBy: string[]; // Question categories that might reveal this
}

export interface TimelineEvent {
  time: string;
  event: string;
  participants: string[];
  significance: 'crucial' | 'relevant' | 'background';
}

export interface DialogueRequest {
  suspectId: string;
  suspectName: string;
  suspectPersonality: string[];
  suspectSecrets: string[];
  suspectMood: number;
  questionCategory: string;
  questionText: string;
  isGuilty: boolean;
  previousAnswers: string[];
}

export interface DialogueResponse {
  text: string;
  truthfulness: 'truth' | 'lie' | 'partial';
  revealedClue?: string;
  moodImpact: number;
  tellSigns?: string[]; // Physical tells for lies
}

export interface NarrativeRequest {
  context: string;
  eventType: 'scene_description' | 'discovery' | 'revelation' | 'transition';
  mood: 'tense' | 'mysterious' | 'dramatic' | 'calm';
  characters?: string[];
  location?: string;
}

// ============================================
// Prompt Templates
// ============================================

const PROMPTS = {
  SCENARIO_GENERATION: `You are a master mystery writer creating an interactive detective scenario for a group game.

Create a compelling {theme} mystery set in {setting} during the {era}.
Difficulty: {difficulty}
Number of players: {playerCount}

Generate a complete mystery scenario with:
1. A captivating title and introduction
2. A detailed backstory explaining the crime/event
3. {suspectCount} suspects with names, descriptions, motives, and alibis
4. Multiple clues (at least {clueCount}) that players can discover
5. A timeline of events leading to the crime
6. Red herrings to mislead players
7. One guilty party

Format your response as valid JSON matching this structure:
{
  "title": "string",
  "introduction": "string (2-3 paragraphs setting the scene)",
  "backstory": "string (what really happened)",
  "suspects": [
    {
      "name": "string",
      "description": "string (physical appearance and demeanor)",
      "backstory": "string",
      "motive": "string",
      "alibi": "string",
      "secrets": ["string"],
      "personalityTraits": ["string"],
      "relationship": "string",
      "isGuilty": boolean
    }
  ],
  "clues": [
    {
      "name": "string",
      "description": "string",
      "location": "string",
      "difficulty": "easy|medium|hard",
      "pointsTo": "suspect_name or red_herring",
      "revealedBy": ["category"]
    }
  ],
  "timeline": [
    {
      "time": "string",
      "event": "string",
      "participants": ["string"],
      "significance": "crucial|relevant|background"
    }
  ],
  "redHerrings": ["string"],
  "guiltyPartyName": "string"
}`,

  SUSPECT_DIALOGUE: `You are role-playing as {name}, a suspect in a mystery investigation.

Character Profile:
- Description: {description}
- Personality: {personality}
- Current mood: {mood}/100 (0=hostile, 50=neutral, 100=cooperative)
- Is guilty: {isGuilty}
- Secrets they're hiding: {secrets}

The detective asks about "{category}": "{question}"

Previous context:
{previousContext}

Generate an in-character response. Consider:
1. If guilty, they may lie or deflect about certain topics
2. Their mood affects how cooperative they are
3. They may reveal hints if pressed correctly
4. Include subtle tells if they're lying

Respond in JSON format:
{
  "dialogue": "string (their spoken response, in character)",
  "truthfulness": "truth|lie|partial",
  "revealedClue": "string or null (if they accidentally reveal something)",
  "moodChange": number (-10 to +10),
  "tellSigns": ["string"] (physical tells if lying)
}`,

  NARRATIVE_GENERATION: `You are a skilled narrator for an interactive mystery game.

Context: {context}
Event Type: {eventType}
Mood: {mood}
Location: {location}
Characters present: {characters}

Generate immersive narrative text that:
1. Sets the atmosphere and tension
2. Engages players in the story
3. Provides sensory details (sights, sounds, smells)
4. Maintains the {mood} mood throughout
5. Is 2-3 paragraphs long

Write in second person ("You notice...", "You feel...") to immerse players in the scene.`,

  CLUE_ANALYSIS: `You are an analytical assistant helping detective players piece together clues.

Clues discovered:
{clueList}

Suspects:
{suspectList}

Based on these clues, provide a brief analytical summary that:
1. Highlights connections between clues and suspects
2. Points out contradictions in alibis
3. Suggests areas that need more investigation
4. Does NOT reveal the guilty party directly

Keep the tone helpful but mysterious. Let players draw their own conclusions.`
};

// ============================================
// AI Game Master Service
// ============================================

export class AIGameMasterService {
  private static instance: AIGameMasterService;

  // Cache generated scenarios
  private scenarioCache: Map<string, GeneratedScenario> = new Map();

  private constructor() {}

  static getInstance(): AIGameMasterService {
    if (!AIGameMasterService.instance) {
      AIGameMasterService.instance = new AIGameMasterService();
    }
    return AIGameMasterService.instance;
  }

  // ============================================
  // Scenario Generation
  // ============================================

  /**
   * Generate a complete mystery scenario
   */
  async generateScenario(config: ScenarioConfig): Promise<GeneratedScenario> {
    const provider = getAIProvider();

    const suspectCount = Math.max(3, Math.min(6, config.playerCount + 2));
    const clueCount = suspectCount * 2 + 3;

    const prompt = PROMPTS.SCENARIO_GENERATION
      .replace('{theme}', config.theme)
      .replace('{setting}', config.setting)
      .replace('{era}', config.era)
      .replace('{difficulty}', config.difficulty)
      .replace('{playerCount}', config.playerCount.toString())
      .replace('{suspectCount}', suspectCount.toString())
      .replace('{clueCount}', clueCount.toString());

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a creative mystery writer. Always respond with valid JSON matching the requested structure.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await provider.complete({
        messages,
        maxTokens: 4096,
        temperature: 0.8
      });

      const scenario = this.parseScenarioResponse(response, config);
      this.scenarioCache.set(scenario.id, scenario);

      gameLogger.info({ scenarioId: scenario.id, title: scenario.title }, 'Scenario generated');

      return scenario;
    } catch (error) {
      gameLogger.error({ error }, 'Failed to generate scenario');
      throw error;
    }
  }

  /**
   * Parse AI response into scenario structure
   */
  private parseScenarioResponse(response: AICompletionResponse, config: ScenarioConfig): GeneratedScenario {
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const data = JSON.parse(jsonStr);
      const scenarioId = `scenario_${Date.now()}`;

      // Map suspects with IDs
      const suspects: GeneratedSuspect[] = data.suspects.map((s: any, idx: number) => ({
        id: `suspect_${idx}`,
        name: s.name,
        description: s.description,
        backstory: s.backstory,
        motive: s.motive,
        alibi: s.alibi,
        secrets: s.secrets || [],
        personalityTraits: s.personalityTraits || [],
        relationship: s.relationship,
        isGuilty: s.isGuilty || false
      }));

      // Find guilty party
      const guiltyParty = suspects.find(s => s.isGuilty) ||
        suspects.find(s => s.name === data.guiltyPartyName);

      if (guiltyParty) {
        guiltyParty.isGuilty = true;
      }

      // Map clues with IDs
      const clues: GeneratedClue[] = data.clues.map((c: any, idx: number) => ({
        id: `clue_${idx}`,
        name: c.name,
        description: c.description,
        location: c.location,
        difficulty: c.difficulty || 'medium',
        pointsTo: this.mapClueTarget(c.pointsTo, suspects),
        revealedBy: c.revealedBy || ['evidence']
      }));

      return {
        id: scenarioId,
        title: data.title || config.title,
        introduction: data.introduction,
        setting: config.setting,
        backstory: data.backstory,
        suspects,
        clues,
        guiltyPartyId: guiltyParty?.id || suspects[0]?.id,
        timeline: data.timeline || [],
        redHerrings: data.redHerrings || []
      };
    } catch (error) {
      gameLogger.error({ error, response: response.content }, 'Failed to parse scenario response');
      throw new Error('Failed to parse AI scenario response');
    }
  }

  private mapClueTarget(target: string, suspects: GeneratedSuspect[]): string {
    if (target === 'red_herring') return 'red_herring';

    const suspect = suspects.find(s =>
      s.name.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(s.name.toLowerCase())
    );

    return suspect?.id || 'red_herring';
  }

  // ============================================
  // NPC Dialogue
  // ============================================

  /**
   * Generate suspect dialogue response
   */
  async generateDialogue(request: DialogueRequest): Promise<DialogueResponse> {
    const provider = getAIProvider();

    const moodDescription = request.suspectMood >= 70 ? 'cooperative and willing to help' :
                           request.suspectMood <= 30 ? 'hostile and defensive' : 'cautious and guarded';

    const prompt = PROMPTS.SUSPECT_DIALOGUE
      .replace('{name}', request.suspectName)
      .replace('{description}', request.suspectPersonality.join(', '))
      .replace('{personality}', request.suspectPersonality.join(', '))
      .replace('{mood}', request.suspectMood.toString())
      .replace('{isGuilty}', request.isGuilty ? 'yes - they committed the crime' : 'no - they are innocent')
      .replace('{secrets}', request.suspectSecrets.join('; '))
      .replace('{category}', request.questionCategory)
      .replace('{question}', request.questionText)
      .replace('{previousContext}', request.previousAnswers.slice(-3).join('\n') || 'This is the first question.');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an actor playing ${request.suspectName}, a ${moodDescription} suspect. Stay in character. Respond only with valid JSON.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await provider.complete({
        messages,
        maxTokens: 512,
        temperature: 0.7
      });

      return this.parseDialogueResponse(response);
    } catch (error) {
      gameLogger.error({ error }, 'Failed to generate dialogue');

      // Return fallback response
      return {
        text: `${request.suspectName} seems reluctant to answer and shifts uncomfortably.`,
        truthfulness: 'partial',
        moodImpact: -2
      };
    }
  }

  private parseDialogueResponse(response: AICompletionResponse): DialogueResponse {
    try {
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const data = JSON.parse(jsonStr);

      return {
        text: data.dialogue || data.text || response.content,
        truthfulness: data.truthfulness || 'partial',
        revealedClue: data.revealedClue || undefined,
        moodImpact: typeof data.moodChange === 'number' ? data.moodChange : 0,
        tellSigns: data.tellSigns
      };
    } catch {
      // If JSON parsing fails, use raw text
      return {
        text: response.content,
        truthfulness: 'partial',
        moodImpact: 0
      };
    }
  }

  // ============================================
  // Narrative Generation
  // ============================================

  /**
   * Generate narrative text for game events
   */
  async generateNarrative(request: NarrativeRequest): Promise<string> {
    const provider = getAIProvider();

    const prompt = PROMPTS.NARRATIVE_GENERATION
      .replace('{context}', request.context)
      .replace('{eventType}', request.eventType)
      .replace('{mood}', request.mood)
      .replace('{location}', request.location || 'the current location')
      .replace('{characters}', request.characters?.join(', ') || 'no one else');

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a skilled mystery narrator. Create atmospheric, engaging prose that draws players into the story.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await provider.complete({
        messages,
        maxTokens: 512,
        temperature: 0.8
      });

      return response.content;
    } catch (error) {
      gameLogger.error({ error }, 'Failed to generate narrative');
      return this.getFallbackNarrative(request);
    }
  }

  private getFallbackNarrative(request: NarrativeRequest): string {
    const narratives = {
      scene_description: 'You survey the scene, taking in every detail that might prove important to the investigation.',
      discovery: 'Something catches your eye - a detail that could change everything.',
      revelation: 'A piece of the puzzle falls into place, bringing new clarity to the mystery.',
      transition: 'The investigation continues, each step bringing you closer to the truth.'
    };

    return narratives[request.eventType] || 'The mystery deepens.';
  }

  // ============================================
  // Clue Analysis
  // ============================================

  /**
   * Generate analytical hints for players
   */
  async analyzeClues(
    clues: GeneratedClue[],
    suspects: Suspect[]
  ): Promise<string> {
    const provider = getAIProvider();

    const clueList = clues.map(c => `- ${c.name}: ${c.description}`).join('\n');
    const suspectList = suspects.map(s => `- ${s.name}: ${s.alibi}`).join('\n');

    const prompt = PROMPTS.CLUE_ANALYSIS
      .replace('{clueList}', clueList)
      .replace('{suspectList}', suspectList);

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful detective assistant. Provide analysis without revealing the solution.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    try {
      const response = await provider.complete({
        messages,
        maxTokens: 512,
        temperature: 0.5
      });

      return response.content;
    } catch (error) {
      gameLogger.error({ error }, 'Failed to analyze clues');
      return 'The evidence is complex. Consider reviewing the timeline and alibis more carefully.';
    }
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Convert generated suspect to game suspect format
   */
  convertToGameSuspect(generated: GeneratedSuspect): Suspect {
    return {
      id: generated.id,
      name: generated.name,
      description: generated.description,
      mood: 50, // Start neutral
      isGuilty: generated.isGuilty,
      alibi: generated.alibi,
      secrets: generated.secrets,
      knownClues: [], // To be populated during game
      questionsAvailable: [], // To be generated separately
      questionsAsked: []
    };
  }

  /**
   * Get cached scenario
   */
  getCachedScenario(scenarioId: string): GeneratedScenario | undefined {
    return this.scenarioCache.get(scenarioId);
  }

  /**
   * Clear scenario cache
   */
  clearCache(): void {
    this.scenarioCache.clear();
  }
}
