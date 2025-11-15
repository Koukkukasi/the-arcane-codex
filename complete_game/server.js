/**
 * THE ARCANE CODEX - Node.js/Express API Server
 *
 * Backend API server for The Arcane Codex game
 * Provides REST API endpoints for the frontend game client
 *
 * Features:
 * - CSRF token protection
 * - Game state management
 * - Scenario and quest endpoints
 * - Character and inventory management
 * - Static file serving
 * - Error handling middleware
 *
 * Usage:
 *   npm install
 *   npm start
 *
 * Or for development:
 *   npm run dev
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS for local development
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================

// CSRF tokens store (in production, use Redis or session storage)
const csrfTokens = new Set();

// Game state store (in production, use database)
let gameState = {
    currentScenario: null,
    playerState: null,
    party: [],
    inventory: [],
    quests: {
        active: [],
        completed: []
    }
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock scenario data
 */
function generateMockScenario() {
    return {
        id: 'scenario_001',
        title: 'The Cursed Warehouse',
        location: 'Valdria Docks',
        description: 'A mysterious warehouse on the docks has been abandoned for weeks. Local merchants report strange sounds and eerie lights emanating from within. Grimsby believes his daughter may be held captive here.',

        narrative: `You stand before the weathered doors of Warehouse 7. Salt-stained wood creaks in the ocean breeze. Through gaps in the planks, you glimpse flickering candlelight.

The padlock has been broken - recently. Someone else has been here.

From inside, you hear... chanting? No, weeping. A woman's voice, desperate and afraid.

Grimsby grips your arm. "That's her," he whispers. "That's Elara."`,

        currentQuestion: {
            id: 'q1_warehouse_entry',
            type: 'choice',
            prompt: 'How do you enter the warehouse?',

            choices: [
                {
                    id: 'kick_door',
                    text: 'KICK DOWN THE DOOR - Fast and loud',
                    skill_check: { type: 'strength', difficulty: 15 },
                    consequences: 'Alerts everyone inside, loses element of surprise',
                    divine_favor: { KORVAN: 5, VALDRIS: -5 }
                },
                {
                    id: 'pick_lock',
                    text: 'PICK THE LOCK - Silent approach',
                    skill_check: { type: 'lockpicking', difficulty: 12 },
                    consequences: 'Silent entry, maintains surprise advantage',
                    divine_favor: { KAITHA: 5, MORVANE: 5 }
                },
                {
                    id: 'search_window',
                    text: 'SEARCH FOR WINDOW - Scout first',
                    skill_check: { type: 'perception', difficulty: 10 },
                    consequences: 'Discover layout before entering',
                    divine_favor: { ATHENA: 5, MORVANE: 5 }
                },
                {
                    id: 'negotiate',
                    text: 'KNOCK AND NEGOTIATE - Peaceful approach',
                    skill_check: { type: 'persuasion', difficulty: 18 },
                    consequences: 'Attempt diplomatic resolution',
                    divine_favor: { VALDRIS: 5, SYLARA: 5, KORVAN: -5 }
                }
            ],

            // NPCs can suggest different approaches
            npc_suggestions: {
                grimsby: {
                    preferred: 'kick_door',
                    reason: '"My daughter is in there! We don\'t have time for subtlety!"'
                },
                renna: {
                    preferred: 'pick_lock',
                    reason: '"Loud entrances get you killed. Trust me, I know."'
                }
            }
        },

        atmosphere: {
            time_of_day: 'night',
            weather: 'foggy',
            lighting: 'dim candlelight from inside',
            sounds: ['ocean waves', 'creaking wood', 'distant chanting', 'woman weeping'],
            smell: 'salt, decay, incense'
        },

        objectives: [
            { id: 'rescue_elara', text: 'Find and rescue Grimsby\'s daughter Elara', status: 'active' },
            { id: 'investigate_cult', text: 'Discover who is behind the kidnapping', status: 'active' },
            { id: 'survive', text: 'Keep the party alive', status: 'active' }
        ],

        party_state: {
            trust: 50,
            tension: 'Grimsby is desperate and may act rashly'
        }
    };
}

/**
 * Generate mock game state
 */
function generateMockGameState() {
    return {
        player: {
            id: 'player_001',
            name: 'Aelric',
            class: 'Mage (Scholar)',
            level: 3,
            xp: 450,
            xp_to_next: 1000,

            stats: {
                hp: 45,
                hp_max: 60,
                stamina: 65,
                stamina_max: 80,
                mana: 85,
                mana_max: 100,
                gold: 127
            },

            skills: {
                strength: 8,
                archery: 6,
                arcana: 22,
                research: 18,
                lockpicking: 5,
                stealth: 7,
                sleight_of_hand: 4,
                persuasion: 14,
                intimidation: 6,
                deception: 10,
                perception: 16,
                survival: 7,
                medicine: 12
            },

            divine_favor: {
                VALDRIS: 15,
                KAITHA: 25,
                MORVANE: 5,
                SYLARA: 10,
                KORVAN: -10,
                ATHENA: 35,
                MERCUS: 8
            },

            status_effects: [
                { id: 'well_rested', name: 'Well Rested', duration: 5, bonus: '+10% to all checks' }
            ]
        },

        party: [
            {
                id: 'grimsby',
                name: 'Grimsby',
                title: 'Desperate Father',
                role: 'NPC Companion',

                hp: 42,
                hp_max: 60,
                level: 3,

                approval: 65,
                relationship: 'Trusting',

                fatal_flaw: 'desperate',
                hidden_agenda: 'Will sacrifice anything to save daughter',

                strengths: ['Local Knowledge', 'Warehouse Contacts', 'Lockpicking'],

                current_mood: 'anxious',

                divine_favor: {
                    VALDRIS: 30,
                    SYLARA: 20,
                    MERCUS: -10
                }
            },
            {
                id: 'renna',
                name: 'Renna',
                title: 'Vengeful Rogue',
                role: 'NPC Companion',

                hp: 55,
                hp_max: 55,
                level: 4,

                approval: 48,
                relationship: 'Wary',

                fatal_flaw: 'impulsive',
                hidden_agenda: 'Seeking revenge on Thieves Guild leader (her brother)',

                strengths: ['Stealth', 'Lockpicking', 'Guild Knowledge'],

                current_mood: 'focused',

                divine_favor: {
                    KAITHA: 40,
                    MORVANE: 25,
                    VALDRIS: -20
                }
            }
        ],

        inventory: [
            {
                id: 'staff_of_insight',
                name: 'Staff of Insight',
                type: 'weapon',
                rarity: 'rare',
                equipped: true,
                stats: { arcana: 3, research: 2 },
                description: 'A scholarly staff that hums with magical energy'
            },
            {
                id: 'scholars_robes',
                name: 'Scholar\'s Robes',
                type: 'armor',
                rarity: 'common',
                equipped: true,
                stats: { mana_max: 10 },
                description: 'Simple but practical robes for spellcasting'
            },
            {
                id: 'healing_potion',
                name: 'Healing Potion',
                type: 'consumable',
                quantity: 3,
                effect: 'Restore 30 HP',
                description: 'A ruby-red potion that restores vitality'
            },
            {
                id: 'mana_crystal',
                name: 'Mana Crystal',
                type: 'consumable',
                quantity: 2,
                effect: 'Restore 40 Mana',
                description: 'A crystallized source of magical energy'
            },
            {
                id: 'grimsbys_locket',
                name: 'Grimsby\'s Locket',
                type: 'quest_item',
                description: 'Contains a portrait of Elara. Grimsby gave it to you for luck.'
            },
            {
                id: 'old_map',
                name: 'Old Warehouse Map',
                type: 'document',
                description: 'A faded map of the Valdria docks district'
            }
        ],

        quests: {
            active: [
                {
                    id: 'rescue_elara',
                    title: 'The Disappeared',
                    giver: 'Grimsby',
                    description: 'Grimsby\'s daughter Elara has been kidnapped. Find her at the cursed warehouse.',
                    objectives: [
                        { id: 'locate_warehouse', text: 'Find the warehouse', completed: true },
                        { id: 'rescue_elara', text: 'Rescue Elara', completed: false },
                        { id: 'discover_culprit', text: 'Discover who is behind the kidnapping', completed: false }
                    ],
                    rewards: {
                        xp: 300,
                        gold: 100,
                        items: ['grimsby_family_heirloom'],
                        relationship: { grimsby: 25 }
                    }
                },
                {
                    id: 'guild_investigation',
                    title: 'Shadow Politics',
                    giver: 'Renna',
                    description: 'Renna suspects the Thieves Guild is involved. Investigate their operations.',
                    objectives: [
                        { id: 'gather_intel', text: 'Gather intelligence on Guild activities', completed: false }
                    ],
                    rewards: {
                        xp: 200,
                        relationship: { renna: 20 }
                    }
                }
            ],

            completed: [
                {
                    id: 'divine_interrogation',
                    title: 'The Divine Interrogation',
                    description: 'Successfully answered the questions of the Seven Gods',
                    rewards_claimed: true
                }
            ]
        },

        location: {
            current: 'valdria_docks',
            region: 'Valdria',
            description: 'The fog-shrouded docks of Valdria',
            available_travel: ['valdria_town_square', 'valdria_market', 'warehouse_district']
        },

        turn_count: 12,
        world_time: 'night',
        party_trust: 50
    };
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/csrf-token
 * Generate and return a CSRF token for secure form submissions
 */
app.get('/api/csrf-token', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.add(token);

    // Auto-cleanup old tokens (keep last 100)
    if (csrfTokens.size > 100) {
        const tokensArray = Array.from(csrfTokens);
        csrfTokens.delete(tokensArray[0]);
    }

    res.json({
        csrf_token: token,
        expires_in: 3600 // 1 hour
    });
});

/**
 * POST /api/csrf-token
 * Alternative POST endpoint for CSRF token (some frameworks prefer POST)
 */
app.post('/api/csrf-token', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.add(token);

    if (csrfTokens.size > 100) {
        const tokensArray = Array.from(csrfTokens);
        csrfTokens.delete(tokensArray[0]);
    }

    res.json({
        csrf_token: token,
        expires_in: 3600
    });
});

/**
 * GET /api/current_scenario
 * Load current quest/scenario data with narrative, choices, and context
 */
app.get('/api/current_scenario', async (req, res) => {
    try {
        // In production, fetch from database
        const scenario = generateMockScenario();

        gameState.currentScenario = scenario;

        res.json({
            success: true,
            scenario: scenario,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ERROR] Failed to load scenario:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load scenario',
            message: error.message
        });
    }
});

/**
 * GET /api/game_state
 * Load complete game state including player, party, inventory, quests
 */
app.get('/api/game_state', async (req, res) => {
    try {
        // In production, fetch from database
        const state = generateMockGameState();

        gameState.playerState = state.player;
        gameState.party = state.party;
        gameState.inventory = state.inventory;
        gameState.quests = state.quests;

        res.json({
            success: true,
            game_state: state,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ERROR] Failed to load game state:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load game state',
            message: error.message
        });
    }
});

/**
 * POST /api/make_choice
 * Submit player's choice for current scenario
 */
app.post('/api/make_choice', async (req, res) => {
    try {
        const { choice_id, player_id } = req.body;

        if (!choice_id) {
            return res.status(400).json({
                success: false,
                error: 'Missing choice_id'
            });
        }

        // In production: process choice, update game state, generate consequences

        // Mock response
        res.json({
            success: true,
            choice_id: choice_id,
            result: {
                skill_check: {
                    type: 'perception',
                    roll: 14,
                    difficulty: 10,
                    success: true,
                    bonus: 3
                },
                narrative: 'You carefully search the perimeter and discover a small window at the rear of the warehouse. Through it, you see three robed figures surrounding a terrified young woman - Elara.',
                consequences: [
                    'Party maintains element of surprise',
                    'You now know the layout: 3 cultists, 1 prisoner, ritual circle in center'
                ],
                divine_favor_changes: {
                    ATHENA: 5,
                    MORVANE: 5
                },
                npc_reactions: {
                    grimsby: 'Grimsby nods grimly. "Good thinking. Now we know what we\'re up against."',
                    renna: 'Renna smirks. "Smart. I like it."'
                },
                approval_changes: {
                    renna: 3
                }
            },
            next_scenario_id: 'scenario_002',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ERROR] Failed to process choice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process choice',
            message: error.message
        });
    }
});

/**
 * GET /api/character/stats
 * Get character statistics
 */
app.get('/api/character/stats', async (req, res) => {
    try {
        const state = gameState.playerState || generateMockGameState().player;

        res.json({
            success: true,
            stats: {
                name: state.name,
                class: state.class,
                level: state.level,
                xp: state.xp,
                xp_to_next: state.xp_to_next,
                hp: state.stats.hp,
                hp_max: state.stats.hp_max,
                stamina: state.stats.stamina,
                stamina_max: state.stats.stamina_max,
                mana: state.stats.mana,
                mana_max: state.stats.mana_max,
                gold: state.stats.gold,
                skills: state.skills
            }
        });
    } catch (error) {
        console.error('[ERROR] Failed to load character stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load character stats',
            message: error.message
        });
    }
});

/**
 * GET /api/character/divine_favor
 * Get divine favor values for all gods
 */
app.get('/api/character/divine_favor', async (req, res) => {
    try {
        const state = gameState.playerState || generateMockGameState().player;

        res.json({
            success: true,
            divine_favor: state.divine_favor
        });
    } catch (error) {
        console.error('[ERROR] Failed to load divine favor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load divine favor',
            message: error.message
        });
    }
});

/**
 * GET /api/inventory/all
 * Get all inventory items
 */
app.get('/api/inventory/all', async (req, res) => {
    try {
        const inventory = gameState.inventory || generateMockGameState().inventory;

        res.json({
            success: true,
            inventory: inventory,
            count: inventory.length
        });
    } catch (error) {
        console.error('[ERROR] Failed to load inventory:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load inventory',
            message: error.message
        });
    }
});

/**
 * GET /api/quests/active
 * Get active quests
 */
app.get('/api/quests/active', async (req, res) => {
    try {
        const quests = gameState.quests?.active || generateMockGameState().quests.active;

        res.json({
            success: true,
            quests: quests,
            count: quests.length
        });
    } catch (error) {
        console.error('[ERROR] Failed to load active quests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load active quests',
            message: error.message
        });
    }
});

/**
 * GET /api/quests/completed
 * Get completed quests
 */
app.get('/api/quests/completed', async (req, res) => {
    try {
        const quests = gameState.quests?.completed || generateMockGameState().quests.completed;

        res.json({
            success: true,
            quests: quests,
            count: quests.length
        });
    } catch (error) {
        console.error('[ERROR] Failed to load completed quests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load completed quests',
            message: error.message
        });
    }
});

/**
 * GET /api/party
 * Get party information (NPCs and companions)
 */
app.get('/api/party', async (req, res) => {
    try {
        const party = gameState.party || generateMockGameState().party;

        res.json({
            success: true,
            party: party,
            count: party.length,
            party_trust: gameState.party_trust || 50
        });
    } catch (error) {
        console.error('[ERROR] Failed to load party:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load party',
            message: error.message
        });
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// Serve static files from the 'static' directory
app.use(express.static(path.join(__dirname, 'static')));

// Serve the main game UI at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'arcane_codex_scenario_ui_enhanced.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        available_endpoints: [
            'GET /api/csrf-token',
            'POST /api/csrf-token',
            'GET /api/current_scenario',
            'GET /api/game_state',
            'POST /api/make_choice',
            'GET /api/character/stats',
            'GET /api/character/divine_favor',
            'GET /api/inventory/all',
            'GET /api/quests/active',
            'GET /api/quests/completed',
            'GET /api/party',
            'GET /health'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('[SERVER] SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('[SERVER] HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n[SERVER] SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('[SERVER] HTTP server closed');
        process.exit(0);
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('  THE ARCANE CODEX - API Server');
    console.log('='.repeat(70));
    console.log('\n  Status: Running');
    console.log(`  Port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log('\n  API Endpoints:');
    console.log('    POST /api/csrf-token          - Get CSRF token');
    console.log('    GET  /api/current_scenario    - Load current scenario');
    console.log('    GET  /api/game_state          - Load game state');
    console.log('    POST /api/make_choice         - Submit player choice');
    console.log('    GET  /api/character/stats     - Get character stats');
    console.log('    GET  /api/character/divine_favor - Get divine favor');
    console.log('    GET  /api/inventory/all       - Get inventory');
    console.log('    GET  /api/quests/active       - Get active quests');
    console.log('    GET  /api/quests/completed    - Get completed quests');
    console.log('    GET  /api/party               - Get party info');
    console.log('    GET  /health                  - Health check');
    console.log('\n  Frontend:');
    console.log(`    http://localhost:${PORT}/`);
    console.log('\n' + '='.repeat(70));
    console.log('  Press Ctrl+C to stop\n');
});

module.exports = app;
