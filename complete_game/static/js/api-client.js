// API Client - HTTP requests and CSRF handling
// Auto-generated from monolithic HTML - duplicates removed


// apiCall
        async function apiCall(endpoint, options = {}) {
            try {
                const response = await fetchWithCSRF(endpoint, options);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`API Error [${endpoint}]:`, error);
                throw error;
            }
        }

// fetchCSRFToken
        async function fetchCSRFToken() {
            try {
                const response = await fetch('/api/csrf-token');
                const data = await response.json();
                csrfToken = data.csrf_token;
                console.log('[Security] CSRF token fetched successfully');
            } catch (error) {
                console.error('[Security] Failed to fetch CSRF token:', error);
            }
        }

// fetchWithCSRF
        function fetchWithCSRF(url, options = {}) {
            if (!options.headers) {
                options.headers = {};
            }
            if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
                options.headers['X-CSRFToken'] = csrfToken;
            }
            return fetch(url, options);
        }

// getItemIcon
        function getItemIcon(itemType) {
            const icons = {
                'weapon': '⚔️',
                'armor': '🛡️',
                'potion': '🧪',
                'scroll': '📜',
                'food': '🍖',
                'quest': '📋',
                'treasure': '💎',
                'default': '📦'
            };
            return icons[itemType] || icons.default;
        }

// loadInventoryData
        async function loadInventoryData() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/inventory');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    items: [
                        { name: 'Potion of Healing', quantity: 3, rarity: 'common' },
                        { name: 'Ancient Scroll', quantity: 1, rarity: 'rare' }
                    ],
                    gold: 150
                };

                updateInventoryDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load inventory:', error);
                throw error;
            }
        }

// loadNPCData
        async function loadNPCData() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/npcs');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    npcs: [
                        { name: 'Grimsby', approval: 75, hp: { current: 30, max: 40 } },
                        { name: 'Renna', approval: 50, hp: { current: 25, max: 35 } }
                    ]
                };

                updateNPCDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load NPC data:', error);
                throw error;
            }
        }

// loadPartyTrust
        async function loadPartyTrust() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/party/trust');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    trust: 65,
                    tier: 'Professional'
                };

                updateTrustDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load party trust:', error);
                throw error;
            }
        }

// loadQuestData
        async function loadQuestData() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/quests');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    quests: [
                        {
                            title: "The Warehouse Heist",
                            status: 'active',
                            objectives: [
                                { text: 'Infiltrate warehouse', completed: false },
                                { text: 'Find medicine', completed: false }
                            ]
                        }
                    ]
                };

                updateQuestDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load quest data:', error);
                throw error;
            }
        }