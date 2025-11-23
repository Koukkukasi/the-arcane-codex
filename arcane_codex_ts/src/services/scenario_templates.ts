/**
 * Scenario Template Service
 * Provides fallback scenario generation using pre-written templates
 * when AI generation is unavailable or fails.
 */

import {
  ScenarioRequest,
  ScenarioResponse,
  ScenarioType,
  ScenarioTemplate,
  ScenarioChoice,
  Consequence,
  ConsequenceType,
  AsymmetricInfo,
  HiddenKnowledge,
  Clue
} from '../types/ai_gm';

/**
 * Service for managing and generating scenarios from templates
 */
export class ScenarioTemplateService {
  private static instance: ScenarioTemplateService;
  private templates: Map<ScenarioType, ScenarioTemplate[]>;
  private templateVariables: Map<string, () => string>;

  private constructor() {
    this.templates = new Map();
    this.templateVariables = new Map();
    this.initializeTemplates();
    this.initializeVariableGenerators();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ScenarioTemplateService {
    if (!ScenarioTemplateService.instance) {
      ScenarioTemplateService.instance = new ScenarioTemplateService();
    }
    return ScenarioTemplateService.instance;
  }

  /**
   * Generate a scenario from templates based on the request
   */
  public async generateFromTemplate(request: ScenarioRequest): Promise<ScenarioResponse> {
    const type = request.desiredType || this.selectScenarioType(request);
    const template = this.selectTemplate(type, request);

    if (!template) {
      throw new Error(`No suitable template found for type ${type}`);
    }

    return this.instantiateTemplate(template, request);
  }

  /**
   * Initialize all scenario templates
   */
  private initializeTemplates(): void {
    // DIVINE_INTERROGATION Templates
    this.addTemplate({
      id: 'divine_test_1',
      type: ScenarioType.DIVINE_INTERROGATION,
      title: 'The Voice of {GOD_NAME}',
      narrativeTemplate: 'As you traverse the {LOCATION}, a sudden {WEATHER} envelops your party. The very air shimmers with divine energy as the voice of {GOD_NAME} echoes through your minds. "Mortals," the deity intones, "you stand at a crossroads of fate. {DIVINE_MESSAGE}" The god presents you with a test that will determine not just your worthiness, but the fate of {AFFECTED_ENTITY}.',
      variables: [
        { name: 'GOD_NAME', type: 'STRING', options: ['Valdris', 'Kaitha', 'Morvane', 'Sylara'] },
        { name: 'LOCATION', type: 'LOCATION', generator: 'generateLocation' },
        { name: 'WEATHER', type: 'STRING', options: ['golden mist', 'silver storm', 'divine radiance', 'ethereal darkness'] },
        { name: 'DIVINE_MESSAGE', type: 'STRING', generator: 'generateDivineMessage' },
        { name: 'AFFECTED_ENTITY', type: 'STRING', options: ['the nearby village', 'an innocent soul', 'the kingdom', 'your own souls'] }
      ],
      choiceTemplates: [
        {
          id: 'accept_challenge',
          textTemplate: 'Accept the divine challenge with humility and determination',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Divine favor increases', effects: ['favor+10'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'The god remembers your courage', effects: ['reputation+5'] }
          ]
        },
        {
          id: 'question_motives',
          textTemplate: 'Question the deity\'s motives and demand clarification',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The god is intrigued by your boldness', effects: ['favor-5'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Hidden knowledge is revealed', effects: ['knowledge+1'] }
          ]
        },
        {
          id: 'seek_compromise',
          textTemplate: 'Attempt to negotiate alternative terms with the deity',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'A test of wit begins', effects: ['skillcheck:diplomacy'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'The cosmic balance shifts', effects: ['worldevent'] }
          ]
        }
      ],
      minimumPlayers: 1,
      maximumPlayers: 6,
      difficultyRange: { min: 3, max: 8 },
      tags: ['divine', 'test', 'favor']
    });

    this.addTemplate({
      id: 'divine_judgment_1',
      type: ScenarioType.DIVINE_INTERROGATION,
      title: 'Judgment of the Pantheon',
      narrativeTemplate: 'The ground beneath you cracks and splits, revealing a divine amphitheater. You are suddenly transported before a council of {NUM_GODS} gods. Each deity examines your past deeds with cosmic scrutiny. {LEAD_GOD} speaks first: "You have interfered with divine plans. Justify your actions regarding {PAST_EVENT}, or face eternal consequences."',
      variables: [
        { name: 'NUM_GODS', type: 'NUMBER', options: [3, 5, 7] },
        { name: 'LEAD_GOD', type: 'STRING', options: ['Valdris the Just', 'Morvane the Wise', 'Korvan the Fierce'] },
        { name: 'PAST_EVENT', type: 'STRING', generator: 'generatePastEvent' }
      ],
      choiceTemplates: [
        {
          id: 'defend_actions',
          textTemplate: 'Passionately defend your actions as necessary for the greater good',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The gods deliberate', effects: ['tension+1'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Divine verdict pending', effects: ['quest:prove_worth'] }
          ]
        },
        {
          id: 'admit_mistakes',
          textTemplate: 'Humbly admit your mistakes and seek redemption',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Mercy is considered', effects: ['favor+5'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'A path to redemption opens', effects: ['quest:redemption'] }
          ]
        },
        {
          id: 'challenge_authority',
          textTemplate: 'Challenge the gods\' right to judge mortal affairs',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Divine wrath stirs', effects: ['favor-15'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'The heavens shake with anger', effects: ['worldevent:divine_anger'] }
          ]
        },
        {
          id: 'invoke_rival_god',
          textTemplate: 'Invoke the protection of a rival deity',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Divine politics emerge', effects: ['faction:split'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'You become a pawn in celestial games', effects: ['curse:divine_mark'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 6,
      difficultyRange: { min: 5, max: 9 },
      tags: ['divine', 'judgment', 'pantheon', 'trial']
    });

    // MORAL_DILEMMA Templates
    this.addTemplate({
      id: 'moral_village_1',
      type: ScenarioType.MORAL_DILEMMA,
      title: 'The Plague Village',
      narrativeTemplate: 'You arrive at {VILLAGE_NAME} to find it gripped by a mysterious plague. The village elder reveals that {SICK_COUNT} villagers are infected, including {IMPORTANT_PERSON}. A traveling merchant offers you a cure, but only enough for half the sick. Meanwhile, you discover evidence that {GUILTY_PARTY} deliberately caused the plague for {EVIL_MOTIVE}. Time is running out.',
      variables: [
        { name: 'VILLAGE_NAME', type: 'STRING', generator: 'generateVillageName' },
        { name: 'SICK_COUNT', type: 'NUMBER', options: [20, 30, 50] },
        { name: 'IMPORTANT_PERSON', type: 'STRING', options: ['the elder\'s child', 'the village healer', 'a pregnant woman', 'your guide\'s family'] },
        { name: 'GUILTY_PARTY', type: 'STRING', options: ['the merchant', 'a rival village', 'a cult', 'the local lord'] },
        { name: 'EVIL_MOTIVE', type: 'STRING', options: ['profit', 'revenge', 'a dark ritual', 'political control'] }
      ],
      choiceTemplates: [
        {
          id: 'save_important',
          textTemplate: 'Use the cure to save the most important/useful villagers',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Half the village dies', effects: ['reputation-10'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Survivors remember your pragmatism', effects: ['ally:survivors'] }
          ]
        },
        {
          id: 'save_random',
          textTemplate: 'Distribute the cure randomly to be fair',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Fate decides who lives', effects: ['karma+5'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Chaos ensues over selection', effects: ['conflict'] }
          ]
        },
        {
          id: 'seek_more',
          textTemplate: 'Force the merchant to reveal where to get more cure',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Confrontation escalates', effects: ['combat:possible'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'A dangerous quest revealed', effects: ['quest:cure_source'] }
          ]
        },
        {
          id: 'punish_guilty',
          textTemplate: 'Ignore the sick and pursue those responsible',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'More villagers die during pursuit', effects: ['reputation-20'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Justice or revenge?', effects: ['alignment:shift'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 5,
      difficultyRange: { min: 4, max: 7 },
      tags: ['moral', 'plague', 'village', 'choice']
    });

    this.addTemplate({
      id: 'moral_war_1',
      type: ScenarioType.MORAL_DILEMMA,
      title: 'The Prisoner Exchange',
      narrativeTemplate: 'At the war-torn border between {FACTION_1} and {FACTION_2}, you\'re asked to mediate a prisoner exchange. {FACTION_1} holds {PRISONER_1}, while {FACTION_2} has captured {PRISONER_2}. You discover that {DARK_SECRET}. Both sides trust you, but each secretly asks you to sabotage the exchange for their benefit.',
      variables: [
        { name: 'FACTION_1', type: 'STRING', generator: 'generateFactionName' },
        { name: 'FACTION_2', type: 'STRING', generator: 'generateFactionName' },
        { name: 'PRISONER_1', type: 'STRING', options: ['a noble\'s heir', 'a military genius', 'a peace advocate', 'a spy master'] },
        { name: 'PRISONER_2', type: 'STRING', options: ['innocent civilians', 'child soldiers', 'a renowned healer', 'religious pilgrims'] },
        { name: 'DARK_SECRET', type: 'STRING', options: [
          'one prisoner knows the location of a doomsday weapon',
          'the exchange is a trap by both sides',
          'one prisoner is actually a shapeshifter',
          'the real prisoners are already dead'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'honor_exchange',
          textTemplate: 'Facilitate the exchange honestly as agreed',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The exchange proceeds', effects: ['reputation+10'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Both sides respect your honor', effects: ['faction:both+'] }
          ]
        },
        {
          id: 'reveal_secret',
          textTemplate: 'Reveal the dark secret to both parties',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Chaos erupts', effects: ['combat:likely'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'War escalates', effects: ['worldevent:war_escalation'] }
          ]
        },
        {
          id: 'favor_one',
          textTemplate: 'Secretly help one faction as requested',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Betrayal succeeds', effects: ['faction:one+', 'faction:other-'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'The truth will eventually surface', effects: ['future:betrayal_revealed'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 6,
      difficultyRange: { min: 5, max: 8 },
      tags: ['moral', 'war', 'diplomacy', 'betrayal']
    });

    // BETRAYAL Templates
    this.addTemplate({
      id: 'betrayal_ally_1',
      type: ScenarioType.BETRAYAL,
      title: 'The Trusted Guide\'s Deception',
      narrativeTemplate: 'Your trusted guide {GUIDE_NAME}, who has led you through {LOCATION} for {TIME_PERIOD}, suddenly signals to hidden figures in the shadows. "I\'m sorry," they say, "but {BETRAYAL_REASON}." Armed {ENEMY_TYPE} emerge from concealment, surrounding your party. The guide holds {IMPORTANT_ITEM} that belongs to you.',
      variables: [
        { name: 'GUIDE_NAME', type: 'NPC_NAME', generator: 'generateNPCName' },
        { name: 'LOCATION', type: 'LOCATION', generator: 'generateLocation' },
        { name: 'TIME_PERIOD', type: 'STRING', options: ['days', 'weeks', 'months'] },
        { name: 'BETRAYAL_REASON', type: 'STRING', options: [
          'they have my family',
          'the gold was too good to refuse',
          'you killed my brother in that last battle',
          'I\'ve been working for them all along'
        ] },
        { name: 'ENEMY_TYPE', type: 'STRING', options: ['bandits', 'cultists', 'soldiers', 'assassins'] },
        { name: 'IMPORTANT_ITEM', type: 'ITEM', options: ['your map', 'the artifact', 'your supplies', 'the key'] }
      ],
      choiceTemplates: [
        {
          id: 'fight_all',
          textTemplate: 'Fight both the guide and the ambushers',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Battle erupts', effects: ['combat:difficult'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Trust issues develop', effects: ['party:paranoia'] }
          ]
        },
        {
          id: 'appeal_guide',
          textTemplate: 'Appeal to your shared history with the guide',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The guide wavers', effects: ['skillcheck:persuasion'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Possible double-cross', effects: ['ally:conditional'] }
          ]
        },
        {
          id: 'negotiate_enemies',
          textTemplate: 'Negotiate with the ambushers directly',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Terms are discussed', effects: ['resource:loss'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Deal with devils', effects: ['obligation:debt'] }
          ]
        },
        {
          id: 'create_chaos',
          textTemplate: 'Create a distraction to divide your enemies',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Confusion spreads', effects: ['skillcheck:deception'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Some escape, some don\'t', effects: ['party:split'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 5,
      difficultyRange: { min: 4, max: 8 },
      tags: ['betrayal', 'combat', 'trust', 'ambush']
    });

    this.addTemplate({
      id: 'betrayal_revelation_1',
      type: ScenarioType.BETRAYAL,
      title: 'The Double Agent',
      narrativeTemplate: 'During a crucial meeting with {FACTION_LEADER}, one of your party members, {PARTY_MEMBER}, steps forward. "I must confess," they announce, "I\'ve been {SECRET_ROLE} all along. {REVELATION_DETAIL}" The room erupts in tension as {FACTION_LEADER} smiles knowingly. Guards move to surround you.',
      variables: [
        { name: 'FACTION_LEADER', type: 'NPC_NAME', generator: 'generateLeaderName' },
        { name: 'PARTY_MEMBER', type: 'PLAYER_NAME', generator: 'selectRandomPlayer' },
        { name: 'SECRET_ROLE', type: 'STRING', options: [
          'a spy for the enemy',
          'an assassin with a contract',
          'a cultist gathering information',
          'a noble seeking revenge'
        ] },
        { name: 'REVELATION_DETAIL', type: 'STRING', options: [
          'Every move you\'ve made has been reported.',
          'The artifact we seek will destroy you all.',
          'Your loved ones are already in custody.',
          'This was all an elaborate trap.'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'immediate_attack',
          textTemplate: 'Attack the traitor immediately',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Violence explodes', effects: ['combat:party_split'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Party bonds shatter', effects: ['party:permanent_split'] }
          ]
        },
        {
          id: 'demand_explanation',
          textTemplate: 'Demand a full explanation before acting',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Shocking truths emerge', effects: ['knowledge:revelation'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Everything you knew is questioned', effects: ['quest:reevaluate'] }
          ]
        },
        {
          id: 'fake_alliance',
          textTemplate: 'Pretend to join the betrayer\'s side',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'A dangerous game begins', effects: ['skillcheck:deception'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Living a lie', effects: ['stress:increase'] }
          ]
        }
      ],
      minimumPlayers: 3,
      maximumPlayers: 6,
      difficultyRange: { min: 6, max: 9 },
      tags: ['betrayal', 'party', 'revelation', 'drama']
    });

    // DISCOVERY Templates
    this.addTemplate({
      id: 'discovery_artifact_1',
      type: ScenarioType.DISCOVERY,
      title: 'The Forbidden Artifact',
      narrativeTemplate: 'In the depths of {LOCATION}, you discover {ARTIFACT_NAME}, an artifact thought lost for {TIME_PERIOD}. As you approach, it {ARTIFACT_REACTION}. Ancient inscriptions warn that {WARNING_TEXT}. You sense immense power within, but also terrible danger.',
      variables: [
        { name: 'LOCATION', type: 'LOCATION', generator: 'generateDungeonLocation' },
        { name: 'ARTIFACT_NAME', type: 'STRING', generator: 'generateArtifactName' },
        { name: 'TIME_PERIOD', type: 'STRING', options: ['centuries', 'millennia', 'eons', 'since the dawn of time'] },
        { name: 'ARTIFACT_REACTION', type: 'STRING', options: [
          'pulses with otherworldly energy',
          'whispers in forgotten tongues',
          'shows visions of possible futures',
          'resonates with your very soul'
        ] },
        { name: 'WARNING_TEXT', type: 'STRING', options: [
          'those who wield it are forever changed',
          'it has destroyed every previous owner',
          'it attracts unspeakable horrors',
          'it demands a terrible price'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'claim_artifact',
          textTemplate: 'Claim the artifact despite the warnings',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Power courses through you', effects: ['power:gain', 'curse:risk'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'The artifact\'s influence grows', effects: ['corruption:slow'] }
          ]
        },
        {
          id: 'study_first',
          textTemplate: 'Study the artifact carefully before deciding',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Hidden knowledge revealed', effects: ['knowledge:ancient'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Others learn of your discovery', effects: ['attention:unwanted'] }
          ]
        },
        {
          id: 'destroy_artifact',
          textTemplate: 'Attempt to destroy the dangerous artifact',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The artifact resists', effects: ['explosion:magical'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'Ancient powers awaken', effects: ['worldevent:awakening'] }
          ]
        },
        {
          id: 'seal_away',
          textTemplate: 'Seal the artifact where none can find it',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The sealing ritual begins', effects: ['resource:components'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'The burden of secrecy', effects: ['quest:guardian'] }
          ]
        }
      ],
      minimumPlayers: 1,
      maximumPlayers: 6,
      difficultyRange: { min: 5, max: 9 },
      tags: ['discovery', 'artifact', 'power', 'danger']
    });

    this.addTemplate({
      id: 'discovery_truth_1',
      type: ScenarioType.DISCOVERY,
      title: 'The Hidden History',
      narrativeTemplate: 'In {LOCATION}, you uncover documents that reveal {SHOCKING_TRUTH}. This information contradicts everything you\'ve been told about {ESTABLISHED_BELIEF}. The evidence is undeniable, and you realize that {IMPLICATIONS}. Others would kill to keep this secret.',
      variables: [
        { name: 'LOCATION', type: 'LOCATION', options: ['ancient library', 'hidden vault', 'secret chamber', 'forgotten temple'] },
        { name: 'SHOCKING_TRUTH', type: 'STRING', options: [
          'the gods are not what they seem',
          'the kingdom was built on genocide',
          'your mentor orchestrated everything',
          'the enemy was right all along'
        ] },
        { name: 'ESTABLISHED_BELIEF', type: 'STRING', options: [
          'the founding of the realm',
          'the nature of divine magic',
          'the great war',
          'the royal bloodline'
        ] },
        { name: 'IMPLICATIONS', type: 'STRING', options: [
          'everything you\'ve fought for is a lie',
          'powerful people will stop at nothing to silence you',
          'the world itself might be in danger',
          'you must choose between truth and peace'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'reveal_truth',
          textTemplate: 'Reveal the truth to the world',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Shockwaves spread', effects: ['reputation:controversial'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'Society begins to fracture', effects: ['worldevent:revelation'] }
          ]
        },
        {
          id: 'use_blackmail',
          textTemplate: 'Use the information as leverage',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Power shifts to you', effects: ['influence:major'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Dangerous enemies made', effects: ['enemy:powerful'] }
          ]
        },
        {
          id: 'destroy_evidence',
          textTemplate: 'Destroy the evidence to preserve peace',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The burden of knowledge', effects: ['stress:guilt'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Others search for copies', effects: ['quest:cover_up'] }
          ]
        }
      ],
      minimumPlayers: 1,
      maximumPlayers: 4,
      difficultyRange: { min: 4, max: 7 },
      tags: ['discovery', 'truth', 'conspiracy', 'knowledge']
    });

    // COMBAT_CHOICE Templates
    this.addTemplate({
      id: 'combat_tactical_1',
      type: ScenarioType.COMBAT_CHOICE,
      title: 'The Impossible Odds',
      narrativeTemplate: 'Your party is surrounded by {ENEMY_COUNT} {ENEMY_TYPE} in {LOCATION}. Their leader, {ENEMY_LEADER}, calls out: "{TAUNT}" You notice {ENVIRONMENTAL_ADVANTAGE} that could turn the tide, but also spot {ESCAPE_ROUTE}. Time is running out as {TIME_PRESSURE}.',
      variables: [
        { name: 'ENEMY_COUNT', type: 'NUMBER', options: [20, 30, 50] },
        { name: 'ENEMY_TYPE', type: 'STRING', options: ['soldiers', 'bandits', 'cultists', 'monsters'] },
        { name: 'LOCATION', type: 'LOCATION', generator: 'generateBattlefield' },
        { name: 'ENEMY_LEADER', type: 'NPC_NAME', generator: 'generateEnemyLeader' },
        { name: 'TAUNT', type: 'STRING', options: [
          'Surrender and we might let some of you live!',
          'Your gods have abandoned you!',
          'This is revenge for what you did!',
          'The artifact will be ours!'
        ] },
        { name: 'ENVIRONMENTAL_ADVANTAGE', type: 'STRING', options: [
          'a crumbling pillar that could crush many enemies',
          'explosive barrels nearby',
          'a narrow chokepoint',
          'high ground you could reach'
        ] },
        { name: 'ESCAPE_ROUTE', type: 'STRING', options: [
          'a hidden passage',
          'a river with strong current',
          'dense forest coverage',
          'ancient teleportation circle'
        ] },
        { name: 'TIME_PRESSURE', type: 'STRING', options: [
          'reinforcements approach',
          'the building is collapsing',
          'poison gas fills the air',
          'a ritual nears completion'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'use_environment',
          textTemplate: 'Use the environmental advantage tactically',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The environment shifts dramatically', effects: ['combat:advantage'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Collateral damage occurs', effects: ['reputation:depends'] }
          ]
        },
        {
          id: 'heroic_stand',
          textTemplate: 'Make a heroic last stand',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Epic battle ensues', effects: ['combat:heroic'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Songs will be sung', effects: ['reputation:legendary'] }
          ]
        },
        {
          id: 'strategic_retreat',
          textTemplate: 'Execute a fighting retreat using the escape route',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Tactical withdrawal begins', effects: ['combat:retreat'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'The enemy pursues', effects: ['chase:begins'] }
          ]
        },
        {
          id: 'divide_conquer',
          textTemplate: 'Split the party to divide enemy forces',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'The party splits up', effects: ['party:divided'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Multiple battles occur', effects: ['combat:multiple'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 6,
      difficultyRange: { min: 6, max: 10 },
      tags: ['combat', 'tactics', 'survival', 'choice']
    });

    this.addTemplate({
      id: 'combat_siege_1',
      type: ScenarioType.COMBAT_CHOICE,
      title: 'Defenders of {LOCATION_NAME}',
      narrativeTemplate: 'The {LOCATION_TYPE} of {LOCATION_NAME} is under siege by {ATTACKER_FORCE}. You have {TIME_UNTIL} until the walls are breached. The defender\'s leader begs for your help, revealing that {CRITICAL_INFO}. You must decide how to use your party\'s unique skills in the defense.',
      variables: [
        { name: 'LOCATION_TYPE', type: 'STRING', options: ['fortress', 'town', 'temple', 'outpost'] },
        { name: 'LOCATION_NAME', type: 'STRING', generator: 'generateLocationName' },
        { name: 'ATTACKER_FORCE', type: 'STRING', options: ['an orc horde', 'rebel forces', 'undead legion', 'foreign army'] },
        { name: 'TIME_UNTIL', type: 'STRING', options: ['hours', 'one day', 'three days', 'a week'] },
        { name: 'CRITICAL_INFO', type: 'STRING', options: [
          'innocent refugees hide within',
          'a secret weapon lies in the vault',
          'the enemy seeks a hidden prisoner',
          'this is a distraction for something worse'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'lead_defense',
          textTemplate: 'Take command of the defenses',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Morale improves', effects: ['leadership:test'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Responsibility weighs heavy', effects: ['burden:command'] }
          ]
        },
        {
          id: 'sabotage_attackers',
          textTemplate: 'Sneak out to sabotage the attacking force',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Stealth mission begins', effects: ['skillcheck:stealth'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'The siege changes', effects: ['combat:altered'] }
          ]
        },
        {
          id: 'negotiate_terms',
          textTemplate: 'Attempt to negotiate with the attackers',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Parley called', effects: ['diplomacy:critical'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'Terms have consequences', effects: ['politics:shift'] }
          ]
        }
      ],
      minimumPlayers: 3,
      maximumPlayers: 6,
      difficultyRange: { min: 5, max: 9 },
      tags: ['combat', 'siege', 'defense', 'leadership']
    });

    // NEGOTIATION Templates
    this.addTemplate({
      id: 'negotiation_trade_1',
      type: ScenarioType.NEGOTIATION,
      title: 'The Merchant Prince\'s Bargain',
      narrativeTemplate: 'The notorious merchant prince {MERCHANT_NAME} controls access to {CRITICAL_RESOURCE}. They offer you a deal: "{OFFER_DETAIL}" However, you know that {HIDDEN_CATCH}. Other interested parties include {COMPETITOR}, who has secretly approached you with a counter-offer.',
      variables: [
        { name: 'MERCHANT_NAME', type: 'NPC_NAME', generator: 'generateMerchantName' },
        { name: 'CRITICAL_RESOURCE', type: 'STRING', options: [
          'the only cure for the plague',
          'weapons to defend the realm',
          'food for the starving city',
          'information about the enemy'
        ] },
        { name: 'OFFER_DETAIL', type: 'STRING', options: [
          'Complete a dangerous task and I\'ll provide what you need',
          'Betray your allies and gain unlimited access',
          'Pay an impossible price or watch innocents suffer',
          'Marry into my family and seal our alliance'
        ] },
        { name: 'HIDDEN_CATCH', type: 'STRING', options: [
          'the goods are stolen',
          'accepting means supporting slavery',
          'the merchant plans betrayal',
          'this will start a trade war'
        ] },
        { name: 'COMPETITOR', type: 'STRING', options: ['rival guild', 'black market', 'noble house', 'foreign power'] }
      ],
      choiceTemplates: [
        {
          id: 'accept_deal',
          textTemplate: 'Accept the merchant\'s terms',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Deal struck', effects: ['resource:gained'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Obligations bind you', effects: ['debt:merchant'] }
          ]
        },
        {
          id: 'counter_offer',
          textTemplate: 'Make a bold counter-proposal',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Negotiations intensify', effects: ['skillcheck:negotiation'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Power dynamics shift', effects: ['influence:test'] }
          ]
        },
        {
          id: 'take_competitor',
          textTemplate: 'Accept the competitor\'s secret offer',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Allegiances shift', effects: ['faction:change'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Merchant becomes enemy', effects: ['enemy:merchant'] }
          ]
        },
        {
          id: 'expose_corruption',
          textTemplate: 'Expose the merchant\'s corrupt practices',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Scandal erupts', effects: ['reputation:whistleblower'] },
            { type: ConsequenceType.WORLD_STATE, descriptionTemplate: 'Trade networks disrupted', effects: ['economy:chaos'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 5,
      difficultyRange: { min: 4, max: 7 },
      tags: ['negotiation', 'trade', 'politics', 'economics']
    });

    this.addTemplate({
      id: 'negotiation_hostage_1',
      type: ScenarioType.NEGOTIATION,
      title: 'The Hostage Crisis',
      narrativeTemplate: '{HOSTAGE_TAKER} has taken {HOSTAGE_COUNT} hostages in {LOCATION}, including {IMPORTANT_HOSTAGE}. They demand {DEMAND} within {TIME_LIMIT}. You\'ve been chosen as negotiator. Unknown to the hostage-taker, {SECRET_FACTOR}.',
      variables: [
        { name: 'HOSTAGE_TAKER', type: 'STRING', options: ['desperate rebels', 'a mad wizard', 'corrupt guards', 'a heartbroken parent'] },
        { name: 'HOSTAGE_COUNT', type: 'NUMBER', options: [5, 12, 20] },
        { name: 'LOCATION', type: 'LOCATION', options: ['the temple', 'the courthouse', 'the school', 'the embassy'] },
        { name: 'IMPORTANT_HOSTAGE', type: 'STRING', options: [
          'the duke\'s child',
          'a famous healer',
          'your ally',
          'someone with a dark secret'
        ] },
        { name: 'DEMAND', type: 'STRING', options: [
          'release of prisoners',
          'massive gold payment',
          'public confession of crimes',
          'safe passage out of the realm'
        ] },
        { name: 'TIME_LIMIT', type: 'STRING', options: ['one hour', 'sunset', 'dawn', 'high noon'] },
        { name: 'SECRET_FACTOR', type: 'STRING', options: [
          'one hostage is an assassin',
          'the building is rigged to collapse',
          'the authorities plan to storm in',
          'the hostage-taker is dying'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'meet_demands',
          textTemplate: 'Agree to meet their demands fully',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Hostages released', effects: ['reputation:mixed'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Precedent set', effects: ['future:more_hostages'] }
          ]
        },
        {
          id: 'stall_time',
          textTemplate: 'Stall for time while planning something',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Tension rises', effects: ['skillcheck:deception'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Opportunity or disaster', effects: ['risk:high'] }
          ]
        },
        {
          id: 'partial_deal',
          textTemplate: 'Negotiate a compromise solution',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Complex negotiations', effects: ['skillcheck:diplomacy'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Not everyone satisfied', effects: ['outcome:mixed'] }
          ]
        },
        {
          id: 'use_secret',
          textTemplate: 'Exploit the secret factor',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Situation volatile', effects: ['chaos:likely'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Unpredictable results', effects: ['outcome:varies'] }
          ]
        }
      ],
      minimumPlayers: 1,
      maximumPlayers: 4,
      difficultyRange: { min: 5, max: 8 },
      tags: ['negotiation', 'hostage', 'crisis', 'diplomacy']
    });

    // INVESTIGATION Templates
    this.addTemplate({
      id: 'investigation_murder_1',
      type: ScenarioType.INVESTIGATION,
      title: 'Murder at {LOCATION_NAME}',
      narrativeTemplate: 'You arrive at {LOCATION_TYPE} to find {VICTIM_NAME}, {VICTIM_ROLE}, dead under mysterious circumstances. The death appears to be {DEATH_METHOD}, but {SUSPICIOUS_DETAIL}. Three suspects are present: {SUSPECT_1}, {SUSPECT_2}, and {SUSPECT_3}. You have {TIME_CONSTRAINT} before {COMPLICATION}.',
      variables: [
        { name: 'LOCATION_TYPE', type: 'STRING', options: ['the manor', 'the monastery', 'the ship', 'the embassy'] },
        { name: 'LOCATION_NAME', type: 'STRING', generator: 'generateLocationName' },
        { name: 'VICTIM_NAME', type: 'NPC_NAME', generator: 'generateNPCName' },
        { name: 'VICTIM_ROLE', type: 'STRING', options: ['the ambassador', 'a wealthy merchant', 'the high priest', 'a spy master'] },
        { name: 'DEATH_METHOD', type: 'STRING', options: ['poison', 'stabbing', 'magic', 'strangulation'] },
        { name: 'SUSPICIOUS_DETAIL', type: 'STRING', options: [
          'the wounds don\'t match the weapon',
          'there are no signs of struggle',
          'the body was clearly moved',
          'multiple causes of death present'
        ] },
        { name: 'SUSPECT_1', type: 'STRING', options: ['the jealous spouse', 'the ambitious heir', 'the bitter rival', 'the secret lover'] },
        { name: 'SUSPECT_2', type: 'STRING', options: ['the loyal servant', 'the business partner', 'the estranged child', 'the mysterious guest'] },
        { name: 'SUSPECT_3', type: 'STRING', options: ['the local noble', 'the foreign dignitary', 'the court wizard', 'the captain of guards'] },
        { name: 'TIME_CONSTRAINT', type: 'STRING', options: ['dawn', 'the magistrate arrives', 'the ship sails', 'the festival begins'] },
        { name: 'COMPLICATION', type: 'STRING', options: [
          'the suspects scatter',
          'evidence will be destroyed',
          'war might break out',
          'more deaths will occur'
        ] }
      ],
      choiceTemplates: [
        {
          id: 'examine_body',
          textTemplate: 'Thoroughly examine the body and crime scene',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Clues discovered', effects: ['clue:physical'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Killer alerted', effects: ['pressure:increased'] }
          ]
        },
        {
          id: 'interrogate_suspects',
          textTemplate: 'Interrogate all suspects separately',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Stories conflict', effects: ['clue:testimonial'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Alliances form', effects: ['suspects:conspiring'] }
          ]
        },
        {
          id: 'search_belongings',
          textTemplate: 'Search everyone\'s belongings and rooms',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Evidence found', effects: ['clue:documentary'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Trust erodes', effects: ['cooperation:reduced'] }
          ]
        },
        {
          id: 'use_magic',
          textTemplate: 'Use divination magic to reveal the truth',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Visions appear', effects: ['clue:magical'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Magical consequences', effects: ['attention:otherworldly'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 5,
      difficultyRange: { min: 3, max: 7 },
      tags: ['investigation', 'murder', 'mystery', 'clues']
    });

    this.addTemplate({
      id: 'investigation_conspiracy_1',
      type: ScenarioType.INVESTIGATION,
      title: 'The Shadow Council',
      narrativeTemplate: 'Strange events in {CITY_NAME} lead you to evidence of a secret organization called {ORG_NAME}. Their symbol appears at {INCIDENT_COUNT} recent incidents. A dying member whispers: "{DYING_WORDS}" You realize {REVELATION} and must uncover the truth before {DEADLINE}.',
      variables: [
        { name: 'CITY_NAME', type: 'STRING', generator: 'generateCityName' },
        { name: 'ORG_NAME', type: 'STRING', options: ['The Shadow Council', 'The Silent Hand', 'The Crimson Circle', 'The Order of Ash'] },
        { name: 'INCIDENT_COUNT', type: 'NUMBER', options: [3, 5, 7] },
        { name: 'DYING_WORDS', type: 'STRING', options: [
          'They walk among the highest...',
          'The festival... stop the ritual...',
          'Trust no one in purple...',
          'The keys... seven keys...'
        ] },
        { name: 'REVELATION', type: 'STRING', options: [
          'prominent citizens are involved',
          'this connects to your past',
          'the government is compromised',
          'an apocalyptic plan unfolds'
        ] },
        { name: 'DEADLINE', type: 'STRING', options: ['the new moon', 'the coronation', 'the peace summit', 'the holy day'] }
      ],
      choiceTemplates: [
        {
          id: 'infiltrate',
          textTemplate: 'Infiltrate the organization as new recruits',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Deep cover begins', effects: ['danger:extreme'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Double life stress', effects: ['paranoia:increase'] }
          ]
        },
        {
          id: 'follow_leads',
          textTemplate: 'Methodically follow every lead',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Trail grows warm', effects: ['progress:steady'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'They notice you', effects: ['hunted:true'] }
          ]
        },
        {
          id: 'alert_authorities',
          textTemplate: 'Report findings to authorities',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Official investigation', effects: ['support:maybe'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Corruption revealed', effects: ['trust:questioned'] }
          ]
        },
        {
          id: 'confront_suspect',
          textTemplate: 'Directly confront a suspected member',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Dangerous gambit', effects: ['confrontation:risky'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Cards on table', effects: ['escalation:rapid'] }
          ]
        }
      ],
      minimumPlayers: 2,
      maximumPlayers: 6,
      difficultyRange: { min: 5, max: 9 },
      tags: ['investigation', 'conspiracy', 'infiltration', 'mystery']
    });

    // Additional mixed-type templates for variety
    this.addTemplate({
      id: 'mixed_heist_1',
      type: ScenarioType.INVESTIGATION,
      title: 'The Impossible Heist',
      narrativeTemplate: 'You must steal {TARGET_ITEM} from {SECURE_LOCATION} owned by {OWNER_NAME}. The security includes {SECURITY_1}, {SECURITY_2}, and {SECURITY_3}. However, {COMPLICATION_DETAIL}. You have {PREP_TIME} to prepare.',
      variables: [
        { name: 'TARGET_ITEM', type: 'ITEM', options: [
          'the Crown of Whispers',
          'evidence of treason',
          'the antidote',
          'the legendary map'
        ] },
        { name: 'SECURE_LOCATION', type: 'STRING', options: ['the royal vault', 'the wizard\'s tower', 'the temple sanctum', 'the fortress'] },
        { name: 'OWNER_NAME', type: 'NPC_NAME', generator: 'generateNobleName' },
        { name: 'SECURITY_1', type: 'STRING', options: ['magical wards', 'elite guards', 'deadly traps', 'surveillance crystals'] },
        { name: 'SECURITY_2', type: 'STRING', options: ['trained beasts', 'poison gas', 'alarm systems', 'illusions'] },
        { name: 'SECURITY_3', type: 'STRING', options: ['a dragon', 'time locks', 'divine protection', 'shapeshifters'] },
        { name: 'COMPLICATION_DETAIL', type: 'STRING', options: [
          'another group plans to rob it the same night',
          'one of you is secretly working for the owner',
          'the item is cursed',
          'it\'s a trap'
        ] },
        { name: 'PREP_TIME', type: 'STRING', options: ['three days', 'one week', 'until the full moon', 'twenty-four hours'] }
      ],
      choiceTemplates: [
        {
          id: 'stealth_approach',
          textTemplate: 'Execute a pure stealth infiltration',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Silent entry attempted', effects: ['skillcheck:stealth_all'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'No evidence left', effects: ['trace:none'] }
          ]
        },
        {
          id: 'deception_approach',
          textTemplate: 'Use disguises and deception to get inside',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Con game begins', effects: ['skillcheck:deception'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Identities at risk', effects: ['cover:fragile'] }
          ]
        },
        {
          id: 'force_approach',
          textTemplate: 'Create a distraction and use force',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Chaos erupts', effects: ['combat:likely'] },
            { type: ConsequenceType.LONG_TERM, descriptionTemplate: 'Wanted criminals', effects: ['wanted:high'] }
          ]
        },
        {
          id: 'inside_help',
          textTemplate: 'Recruit inside help from staff',
          consequenceTemplates: [
            { type: ConsequenceType.IMMEDIATE, descriptionTemplate: 'Insider recruited', effects: ['access:improved'] },
            { type: ConsequenceType.SHORT_TERM, descriptionTemplate: 'Loyalty uncertain', effects: ['betrayal:possible'] }
          ]
        }
      ],
      minimumPlayers: 3,
      maximumPlayers: 5,
      difficultyRange: { min: 6, max: 9 },
      tags: ['heist', 'investigation', 'stealth', 'planning']
    });
  }

  /**
   * Initialize variable generators
   */
  private initializeVariableGenerators(): void {
    this.templateVariables.set('generateLocation', () => {
      const locations = [
        'the Ancient Crossroads', 'the Whispering Woods', 'the Crystal Caverns',
        'the Sunken Temple', 'the Floating Markets', 'the Bone Bridge',
        'the Singing Stones', 'the Mirror Lake', 'the Ash Fields'
      ];
      return locations[Math.floor(Math.random() * locations.length)];
    });

    this.templateVariables.set('generateVillageName', () => {
      const prefixes = ['North', 'South', 'East', 'West', 'Upper', 'Lower', 'Old', 'New'];
      const suffixes = ['haven', 'ford', 'mill', 'creek', 'hollow', 'ridge', 'vale', 'shire'];
      return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    });

    this.templateVariables.set('generateNPCName', () => {
      const firstNames = ['Marcus', 'Elena', 'Theron', 'Lysa', 'Gareth', 'Mira', 'Aldric', 'Sera'];
      const lastNames = ['Stormwind', 'Ironforge', 'Goldleaf', 'Darkwater', 'Brightblade', 'Moonwhisper'];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    });

    this.templateVariables.set('generateDivineMessage', () => {
      const messages = [
        'Your actions have disturbed the cosmic balance',
        'The time has come to prove your true nature',
        'Choose now between power and wisdom',
        'Your fate and that of many hangs in the balance',
        'The sins of the past demand reckoning'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    });

    this.templateVariables.set('generatePastEvent', () => {
      const events = [
        'the destruction of the Sacred Grove',
        'the theft of the Divine Artifact',
        'the breaking of the Ancient Pact',
        'the slaying of the Chosen One',
        'the release of the Sealed Evil'
      ];
      return events[Math.floor(Math.random() * events.length)];
    });

    this.templateVariables.set('generateFactionName', () => {
      const factions = [
        'the Iron Crown', 'the Free Cities', 'the Shadow Guild',
        'the Holy Order', 'the Merchant Alliance', 'the Wildlands Tribes'
      ];
      return factions[Math.floor(Math.random() * factions.length)];
    });

    this.templateVariables.set('generateArtifactName', () => {
      const artifacts = [
        'the Scepter of Binding', 'the Void Heart', 'the Crown of Madness',
        'the Eternal Flame', 'the Soul Mirror', 'the Book of Names'
      ];
      return artifacts[Math.floor(Math.random() * artifacts.length)];
    });

    this.templateVariables.set('generateDungeonLocation', () => {
      const dungeons = [
        'the Forgotten Crypt', 'the Sunken Palace', 'the Tower of Echoes',
        'the Maze of Mirrors', 'the Pit of Despair', 'the Hall of Heroes'
      ];
      return dungeons[Math.floor(Math.random() * dungeons.length)];
    });

    this.templateVariables.set('generateBattlefield', () => {
      const battlefields = [
        'the narrow canyon', 'the burning village', 'the ancient ruins',
        'the frozen lake', 'the dark forest', 'the mountain pass'
      ];
      return battlefields[Math.floor(Math.random() * battlefields.length)];
    });

    this.templateVariables.set('generateEnemyLeader', () => {
      const titles = ['Captain', 'Warlord', 'High Priest', 'Master', 'Lord', 'Champion'];
      const names = ['Blackthorn', 'Bloodfist', 'Darkbane', 'Ironjaw', 'Skullcrusher'];
      return `${titles[Math.floor(Math.random() * titles.length)]} ${names[Math.floor(Math.random() * names.length)]}`;
    });

    this.templateVariables.set('generateLocationName', () => {
      const names = ['Hartshire', 'Goldmere', 'Ironhold', 'Whitekeep', 'Greendale', 'Redwater'];
      return names[Math.floor(Math.random() * names.length)];
    });

    this.templateVariables.set('generateMerchantName', () => {
      const names = ['Silas Goldhand', 'Lady Corvina', 'Master Zhang', 'Duchess Velmont', 'Baron Richter'];
      return names[Math.floor(Math.random() * names.length)];
    });

    this.templateVariables.set('generateCityName', () => {
      const cities = ['Arcanum', 'Valoris', 'Shadowmere', 'Crystalfall', 'Ironforge', 'Moonhaven'];
      return cities[Math.floor(Math.random() * cities.length)];
    });

    this.templateVariables.set('generateLeaderName', () => {
      const leaders = ['Duke Aldwin', 'Countess Morwyn', 'Lord Commander Drake', 'High Priestess Selene'];
      return leaders[Math.floor(Math.random() * leaders.length)];
    });

    this.templateVariables.set('generateNobleName', () => {
      const nobles = ['Lord Blackstone', 'Lady Winterrose', 'Count Ravencrest', 'Duchess Silverwind'];
      return nobles[Math.floor(Math.random() * nobles.length)];
    });

    this.templateVariables.set('selectRandomPlayer', () => {
      // This would be replaced with actual player selection in runtime
      return 'a party member';
    });
  }

  /**
   * Add a template to the collection
   */
  private addTemplate(template: ScenarioTemplate): void {
    if (!this.templates.has(template.type)) {
      this.templates.set(template.type, []);
    }
    this.templates.get(template.type)!.push(template);
  }

  /**
   * Select appropriate scenario type based on context
   */
  private selectScenarioType(request: ScenarioRequest): ScenarioType {
    // Analyze context to determine best scenario type
    const context = request.context;

    // Simple heuristic-based selection
    if (context.partyState.activeQuests.some(q => q.priority === 'MAIN')) {
      // If there's a main quest, favor investigation or discovery
      return Math.random() > 0.5 ? ScenarioType.INVESTIGATION : ScenarioType.DISCOVERY;
    }

    if (context.worldState.majorEvents.some(e => e.type === 'WAR')) {
      // During war, favor combat or negotiation
      return Math.random() > 0.5 ? ScenarioType.COMBAT_CHOICE : ScenarioType.NEGOTIATION;
    }

    // Random selection weighted by variety
    const types = Object.values(ScenarioType);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Select a template matching the request criteria
   */
  private selectTemplate(type: ScenarioType, request: ScenarioRequest): ScenarioTemplate | null {
    const typeTemplates = this.templates.get(type) || [];

    // Filter by player count and difficulty
    const validTemplates = typeTemplates.filter(t => {
      const playerCount = request.context.partyComposition.partySize;
      const difficulty = request.difficulty;

      return playerCount >= t.minimumPlayers &&
             playerCount <= t.maximumPlayers &&
             difficulty >= t.difficultyRange.min &&
             difficulty <= t.difficultyRange.max;
    });

    if (validTemplates.length === 0) {
      // Fallback to any template of the type
      return typeTemplates[Math.floor(Math.random() * typeTemplates.length)] || null;
    }

    // Random selection from valid templates
    return validTemplates[Math.floor(Math.random() * validTemplates.length)];
  }

  /**
   * Instantiate a template with actual values
   */
  private instantiateTemplate(template: ScenarioTemplate, request: ScenarioRequest): ScenarioResponse {
    // Generate variable values
    const variables = new Map<string, any>();

    for (const variable of template.variables) {
      if (variable.generator && this.templateVariables.has(variable.generator)) {
        variables.set(variable.name, this.templateVariables.get(variable.generator)!());
      } else if (variable.options) {
        variables.set(variable.name, variable.options[Math.floor(Math.random() * variable.options.length)]);
      } else if (variable.type === 'PLAYER_NAME') {
        const playerNames = request.context.playerHistories.map(h => h.playerName);
        variables.set(variable.name, playerNames[Math.floor(Math.random() * playerNames.length)]);
      } else {
        variables.set(variable.name, 'unknown');
      }
    }

    // Replace variables in narrative
    let narrative = template.narrativeTemplate;
    for (const [key, value] of variables) {
      narrative = narrative.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    // Create choices from templates
    const choices: ScenarioChoice[] = template.choiceTemplates.map(ct => ({
      id: `${template.id}_${ct.id}`,
      text: this.replaceVariables(ct.textTemplate, variables),
      hiddenConsequences: this.createConsequences(ct.consequenceTemplates, variables),
      visibility: 'ALL'
    }));

    // Create asymmetric info for each player
    const asymmetricInfo: AsymmetricInfo[] = request.context.playerHistories.map(player => ({
      playerId: player.playerId,
      hiddenKnowledge: this.generateHiddenKnowledge(template, player),
      privateClues: this.generateClues(template, player),
      availableDeductions: [],
      privateObjectives: this.generatePrivateObjectives(template, player)
    }));

    return {
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      title: this.replaceVariables(template.title, variables),
      narrative,
      choices,
      hiddenConsequences: [],
      asymmetricInfo,
      timeLimit: request.timeLimit,
      gmNotes: `Generated from template: ${template.id}`
    };
  }

  /**
   * Replace variables in text
   */
  private replaceVariables(text: string, variables: Map<string, any>): string {
    let result = text;
    for (const [key, value] of variables) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Create consequences from templates
   */
  private createConsequences(templates: any[], variables: Map<string, any>): Consequence[] {
    return templates.map(t => ({
      id: `consequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: t.type,
      description: this.replaceVariables(t.descriptionTemplate, variables),
      revealConditions: [{ type: 'IMMEDIATE' }],
      target: 'PARTY',
      severity: 'MODERATE'
    }));
  }

  /**
   * Generate hidden knowledge for a player
   */
  private generateHiddenKnowledge(_template: ScenarioTemplate, _player: any): HiddenKnowledge[] {
    // Generate based on player class and history
    const knowledge: HiddenKnowledge[] = [];

    if (Math.random() > 0.5) {
      knowledge.push({
        id: `knowledge_${Date.now()}`,
        type: 'OBSERVATION',
        content: 'You notice something others might miss...',
        source: 'Your training',
        reliability: 80,
        canShare: true
      });
    }

    return knowledge;
  }

  /**
   * Generate clues for a player
   */
  private generateClues(template: ScenarioTemplate, _player: any): Clue[] {
    // Generate based on scenario type
    if (template.type === ScenarioType.INVESTIGATION) {
      return [{
        id: `clue_${Date.now()}`,
        description: 'A detail catches your trained eye',
        category: 'PHYSICAL',
        requiredToProgress: false
      }];
    }
    return [];
  }

  /**
   * Generate private objectives
   */
  private generatePrivateObjectives(_template: ScenarioTemplate, _player: any): any[] {
    // Generate based on player goals and scenario
    if (Math.random() > 0.7) {
      return [{
        id: `objective_${Date.now()}`,
        description: 'Achieve a personal goal during this encounter',
        reward: 'Special favor or item',
        deadline: undefined
      }];
    }
    return [];
  }

  /**
   * Get all templates of a specific type
   */
  public getTemplatesByType(type: ScenarioType): ScenarioTemplate[] {
    return this.templates.get(type) || [];
  }

  /**
   * Get total template count
   */
  public getTemplateCount(): number {
    let count = 0;
    for (const templates of this.templates.values()) {
      count += templates.length;
    }
    return count;
  }

  /**
   * Get template statistics
   */
  public getTemplateStats(): Map<ScenarioType, number> {
    const stats = new Map<ScenarioType, number>();
    for (const [type, templates] of this.templates) {
      stats.set(type, templates.length);
    }
    return stats;
  }
}