// === Quest Map System Implementation ===

// Detailed quest location maps
const questMaps = {
    'warehouse': {
        name: "Duke's Warehouse",
        type: 'building',
        floors: 2,
        rooms: [
            { id: 'entrance', name: 'Entrance Hall', x: 0.2, y: 0.7, width: 0.2, height: 0.15, type: 'entrance', floor: 1 },
            { id: 'storage1', name: 'Storage Room A', x: 0.45, y: 0.7, width: 0.15, height: 0.15, type: 'room', floor: 1 },
            { id: 'storage2', name: 'Storage Room B', x: 0.65, y: 0.7, width: 0.15, height: 0.15, type: 'room', floor: 1 },
            { id: 'loading', name: 'Loading Bay', x: 0.2, y: 0.5, width: 0.25, height: 0.15, type: 'room', floor: 1 },
            { id: 'office', name: "Duke's Office", x: 0.55, y: 0.3, width: 0.25, height: 0.15, type: 'quest', floor: 2 },
            { id: 'basement', name: 'Secret Basement', x: 0.45, y: 0.85, width: 0.2, height: 0.1, type: 'danger', floor: 0 },
            { id: 'stairs_up', name: 'Stairs Up', x: 0.8, y: 0.5, width: 0.1, height: 0.1, type: 'stairs', floor: 1 },
            { id: 'stairs_down', name: 'Stairs Down', x: 0.45, y: 0.5, width: 0.1, height: 0.1, type: 'stairs', floor: 1 }
        ],
        connections: [
            ['entrance', 'loading'],
            ['loading', 'storage1'],
            ['storage1', 'storage2'],
            ['storage1', 'stairs_down'],
            ['storage2', 'stairs_up'],
            ['stairs_down', 'basement'],
            ['stairs_up', 'office']
        ],
        enemies: [
            { room: 'storage1', count: 2, type: 'Guard' },
            { room: 'storage2', count: 1, type: 'Guard' },
            { room: 'basement', count: 3, type: 'Rat' },
            { room: 'office', count: 1, type: 'Elite Guard' }
        ],
        loot: [
            { room: 'office', type: 'Quest Item', icon: '📜' },
            { room: 'basement', type: 'Treasure Chest', icon: '📦' },
            { room: 'storage1', type: 'Supplies', icon: '🎒' }
        ],
        currentFloor: 1
    },
    'abandoned_mill': {
        name: 'Abandoned Mill',
        type: 'dungeon',
        floors: 2,
        rooms: [
            { id: 'entrance', name: 'Mill Entrance', x: 0.2, y: 0.7, width: 0.15, height: 0.2, type: 'entrance', floor: 1 },
            { id: 'mill_floor', name: 'Mill Floor', x: 0.4, y: 0.5, width: 0.3, height: 0.3, type: 'room', floor: 1 },
            { id: 'grain_storage', name: 'Grain Storage', x: 0.75, y: 0.6, width: 0.15, height: 0.2, type: 'room', floor: 1 },
            { id: 'upper_loft', name: 'Upper Loft', x: 0.45, y: 0.3, width: 0.2, height: 0.15, type: 'room', floor: 2 },
            { id: 'underground', name: 'Secret Tunnels', x: 0.4, y: 0.85, width: 0.3, height: 0.1, type: 'quest', floor: 0 },
            { id: 'hideout', name: 'Bandit Hideout', x: 0.75, y: 0.85, width: 0.15, height: 0.1, type: 'danger', floor: 0 }
        ],
        connections: [
            ['entrance', 'mill_floor'],
            ['mill_floor', 'grain_storage'],
            ['mill_floor', 'upper_loft'],
            ['mill_floor', 'underground'],
            ['underground', 'hideout']
        ],
        enemies: [
            { room: 'grain_storage', count: 3, type: 'Bandit' },
            { room: 'mill_floor', count: 2, type: 'Bandit' },
            { room: 'hideout', count: 4, type: 'Bandit' },
            { room: 'underground', count: 1, type: 'Bandit Leader' }
        ],
        loot: [
            { room: 'hideout', type: 'Stolen Goods', icon: '💰' },
            { room: 'underground', type: 'Quest Clue', icon: '📜' },
            { room: 'upper_loft', type: 'Old Map', icon: '🗺️' }
        ],
        currentFloor: 1
    },
    'lighthouse': {
        name: 'Haunted Lighthouse',
        type: 'dungeon',
        floors: 4,
        rooms: [
            { id: 'entrance', name: 'Lighthouse Base', x: 0.45, y: 0.8, width: 0.2, height: 0.15, type: 'entrance', floor: 1 },
            { id: 'keeper_room', name: "Keeper's Quarters", x: 0.25, y: 0.7, width: 0.15, height: 0.15, type: 'room', floor: 1 },
            { id: 'storage', name: 'Storage', x: 0.7, y: 0.7, width: 0.15, height: 0.15, type: 'room', floor: 1 },
            { id: 'spiral_1', name: 'Spiral Stairs L1', x: 0.5, y: 0.5, width: 0.1, height: 0.1, type: 'stairs', floor: 1 },
            { id: 'spiral_2', name: 'Spiral Stairs L2', x: 0.5, y: 0.5, width: 0.1, height: 0.1, type: 'stairs', floor: 2 },
            { id: 'spiral_3', name: 'Spiral Stairs L3', x: 0.5, y: 0.5, width: 0.1, height: 0.1, type: 'stairs', floor: 3 },
            { id: 'lamp_room', name: 'Lamp Room', x: 0.4, y: 0.4, width: 0.3, height: 0.3, type: 'quest', floor: 4 },
            { id: 'balcony', name: 'Observation Deck', x: 0.35, y: 0.2, width: 0.4, height: 0.15, type: 'danger', floor: 4 },
            { id: 'basement', name: 'Flooded Basement', x: 0.4, y: 0.85, width: 0.3, height: 0.1, type: 'danger', floor: 0 }
        ],
        connections: [
            ['entrance', 'keeper_room'],
            ['entrance', 'storage'],
            ['entrance', 'spiral_1'],
            ['spiral_1', 'spiral_2'],
            ['spiral_2', 'spiral_3'],
            ['spiral_3', 'lamp_room'],
            ['lamp_room', 'balcony'],
            ['entrance', 'basement']
        ],
        enemies: [
            { room: 'keeper_room', count: 2, type: 'Ghost' },
            { room: 'spiral_2', count: 1, type: 'Wraith' },
            { room: 'lamp_room', count: 1, type: 'Ghost Captain' },
            { room: 'balcony', count: 3, type: 'Spectral Sailor' },
            { room: 'basement', count: 4, type: 'Drowned' }
        ],
        loot: [
            { room: 'lamp_room', type: 'Lighthouse Crystal', icon: '💎' },
            { room: 'keeper_room', type: 'Old Journal', icon: '📖' },
            { room: 'basement', type: 'Sunken Treasure', icon: '📦' }
        ],
        currentFloor: 1
    }
};

// Quest Map Renderer class
class QuestMapRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentMap = null;
        this.hoveredRoom = null;
        this.scale = 1;
        this.modal = null;
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div id="quest-map-modal" class="quest-map-modal" style="display: none;">
                <div class="quest-map-backdrop"></div>
                <div class="quest-map-content">
                    <div class="quest-map-header">
                        <h2 id="quest-map-title">Location Map</h2>
                        <div class="floor-controls">
                            <button id="floor-down" class="floor-btn">▼</button>
                            <span id="floor-indicator">Floor 1</span>
                            <button id="floor-up" class="floor-btn">▲</button>
                        </div>
                        <button class="quest-map-close">×</button>
                    </div>
                    <div class="quest-map-canvas-container">
                        <canvas id="quest-map-canvas" width="800" height="600"></canvas>
                    </div>
                    <div class="quest-map-legend">
                        <div class="legend-item"><span class="room-type-icon entrance"></span> Entrance</div>
                        <div class="legend-item"><span class="room-type-icon quest"></span> Quest Objective</div>
                        <div class="legend-item"><span class="room-type-icon danger"></span> Danger Zone</div>
                        <div class="legend-item"><span class="enemy-icon">⚔️</span> Enemies</div>
                        <div class="legend-item"><span class="loot-icon">📦</span> Loot</div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('quest-map-modal');
        this.canvas = document.getElementById('quest-map-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Add modal styles
        this.addStyles();
    }

    addStyles() {
        const styles = `
            <style>
            .quest-map-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }

            .quest-map-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
            }

            .quest-map-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 900px;
                height: 80%;
                max-height: 700px;
                background: linear-gradient(135deg, #2A2416, #1A1612);
                border: 3px solid #8B7355;
                border-radius: 15px;
                box-shadow: 0 0 50px rgba(212, 175, 55, 0.3);
                display: flex;
                flex-direction: column;
            }

            .quest-map-header {
                padding: 20px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 2px solid #8B7355;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .quest-map-header h2 {
                margin: 0;
                color: #FFD700;
                font-family: 'Cinzel', serif;
                font-size: 24px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            }

            .floor-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .floor-btn {
                width: 30px;
                height: 30px;
                background: rgba(139, 115, 85, 0.5);
                border: 2px solid #8B7355;
                color: #FFD700;
                font-size: 16px;
                cursor: pointer;
                border-radius: 5px;
                transition: all 0.2s ease;
            }

            .floor-btn:hover {
                background: rgba(212, 175, 55, 0.3);
                transform: scale(1.1);
            }

            .floor-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            #floor-indicator {
                color: #FFD700;
                font-family: 'Cinzel', serif;
                font-weight: bold;
            }

            .quest-map-close {
                width: 40px;
                height: 40px;
                background: rgba(139, 115, 85, 0.5);
                border: 2px solid #8B7355;
                color: #FFD700;
                font-size: 24px;
                cursor: pointer;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .quest-map-close:hover {
                background: rgba(255, 0, 0, 0.3);
                transform: rotate(90deg) scale(1.1);
            }

            .quest-map-canvas-container {
                flex: 1;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                background:
                    radial-gradient(circle at center, rgba(0, 0, 0, 0.2), transparent),
                    repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(139, 115, 85, 0.05) 10px,
                        rgba(139, 115, 85, 0.05) 20px
                    );
            }

            #quest-map-canvas {
                width: 100%;
                height: 100%;
                max-width: 800px;
                max-height: 500px;
                border: 2px solid #8B7355;
                border-radius: 10px;
                box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
            }

            .quest-map-legend {
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 2px solid #8B7355;
                display: flex;
                justify-content: center;
                gap: 30px;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #D4AF37;
                font-size: 14px;
                font-family: 'Cinzel', serif;
            }

            .room-type-icon {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid;
                border-radius: 3px;
            }

            .room-type-icon.entrance {
                background: rgba(76, 175, 80, 0.5);
                border-color: #4CAF50;
            }

            .room-type-icon.quest {
                background: rgba(255, 215, 0, 0.5);
                border-color: #FFD700;
            }

            .room-type-icon.danger {
                background: rgba(255, 0, 0, 0.5);
                border-color: #FF0000;
            }

            .enemy-icon, .loot-icon {
                font-size: 20px;
            }
            </style>
        `;

        if (!document.getElementById('quest-map-styles')) {
            const styleEl = document.createElement('div');
            styleEl.id = 'quest-map-styles';
            styleEl.innerHTML = styles;
            document.head.appendChild(styleEl.firstChild);
        }
    }

    setupEventListeners() {
        // Close button
        document.querySelector('.quest-map-close').addEventListener('click', () => {
            this.close();
        });

        // Backdrop click
        document.querySelector('.quest-map-backdrop').addEventListener('click', () => {
            this.close();
        });

        // Floor controls
        document.getElementById('floor-up').addEventListener('click', () => {
            if (this.currentMap) {
                const maxFloor = this.currentMap.floors - 1;
                if (this.currentMap.currentFloor < maxFloor) {
                    this.currentMap.currentFloor++;
                    this.render();
                }
            }
        });

        document.getElementById('floor-down').addEventListener('click', () => {
            if (this.currentMap && this.currentMap.currentFloor > 0) {
                this.currentMap.currentFloor--;
                this.render();
            }
        });

        // Canvas hover
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const hoveredRoom = this.getRoomAt(x, y);
            if (hoveredRoom !== this.hoveredRoom) {
                this.hoveredRoom = hoveredRoom;
                this.render();
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredRoom = null;
            this.render();
        });
    }

    open(mapId) {
        const map = questMaps[mapId];
        if (!map) return;

        this.currentMap = map;
        this.currentMap.currentFloor = 1; // Reset to floor 1
        this.modal.style.display = 'block';

        // Update title
        document.getElementById('quest-map-title').textContent = map.name;

        // Render the map
        this.render();
    }

    close() {
        this.modal.style.display = 'none';
        this.currentMap = null;
        this.hoveredRoom = null;
    }

    render() {
        if (!this.currentMap) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw parchment background
        ctx.fillStyle = '#2A2416';
        ctx.fillRect(0, 0, width, height);

        // Add subtle grid
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            const y = (height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Update floor indicator
        const floorText = this.currentMap.currentFloor === 0 ? 'Basement' : `Floor ${this.currentMap.currentFloor}`;
        document.getElementById('floor-indicator').textContent = floorText;

        // Update floor buttons
        document.getElementById('floor-up').disabled = this.currentMap.currentFloor >= this.currentMap.floors - 1;
        document.getElementById('floor-down').disabled = this.currentMap.currentFloor <= 0;

        // Get rooms for current floor
        const currentRooms = this.currentMap.rooms.filter(room =>
            room.floor === undefined || room.floor === this.currentMap.currentFloor
        );

        // Draw connections first (behind rooms)
        this.drawConnections(ctx, width, height, currentRooms);

        // Draw rooms
        currentRooms.forEach(room => {
            this.drawRoom(ctx, room, width, height);
        });

        // Draw room contents (enemies, loot)
        currentRooms.forEach(room => {
            this.drawRoomContents(ctx, room, width, height);
        });
    }

    drawConnections(ctx, width, height, rooms) {
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        this.currentMap.connections.forEach(([fromId, toId]) => {
            const fromRoom = rooms.find(r => r.id === fromId);
            const toRoom = rooms.find(r => r.id === toId);

            if (fromRoom && toRoom) {
                ctx.beginPath();
                ctx.moveTo(
                    (fromRoom.x + (fromRoom.width || 0.15) / 2) * width,
                    (fromRoom.y + (fromRoom.height || 0.15) / 2) * height
                );
                ctx.lineTo(
                    (toRoom.x + (toRoom.width || 0.15) / 2) * width,
                    (toRoom.y + (toRoom.height || 0.15) / 2) * height
                );
                ctx.stroke();
            }
        });

        ctx.setLineDash([]);
    }

    drawRoom(ctx, room, width, height) {
        const x = room.x * width;
        const y = room.y * height;
        const w = (room.width || 0.15) * width;
        const h = (room.height || 0.15) * height;

        // Determine room color based on type
        let fillColor, strokeColor;
        switch(room.type) {
            case 'entrance':
                fillColor = 'rgba(76, 175, 80, 0.3)';
                strokeColor = '#4CAF50';
                break;
            case 'quest':
                fillColor = 'rgba(255, 215, 0, 0.3)';
                strokeColor = '#FFD700';
                break;
            case 'danger':
                fillColor = 'rgba(255, 0, 0, 0.3)';
                strokeColor = '#FF0000';
                break;
            case 'stairs':
                fillColor = 'rgba(139, 115, 85, 0.3)';
                strokeColor = '#8B7355';
                break;
            default:
                fillColor = 'rgba(139, 115, 85, 0.2)';
                strokeColor = '#8B7355';
        }

        // Highlight hovered room
        if (this.hoveredRoom === room) {
            fillColor = fillColor.replace('0.3', '0.5').replace('0.2', '0.4');
            ctx.shadowColor = strokeColor;
            ctx.shadowBlur = 10;
        }

        // Draw room rectangle
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;

        // Use roundRect if available, otherwise fallback
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 5);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);
        }

        ctx.shadowBlur = 0;

        // Draw room name
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Cinzel';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name, x + w/2, y + h/2);

        // Draw stairs icon if applicable
        if (room.type === 'stairs') {
            ctx.font = '16px serif';
            ctx.fillText('↕', x + w/2, y + h/2 + 15);
        }
    }

    drawRoomContents(ctx, room, width, height) {
        const x = room.x * width;
        const y = room.y * height;
        const w = (room.width || 0.15) * width;
        const h = (room.height || 0.15) * height;

        // Draw enemies
        const enemies = this.currentMap.enemies.filter(e => e.room === room.id);
        if (enemies.length > 0) {
            ctx.font = '14px serif';
            ctx.fillStyle = '#FF6B6B';
            ctx.textAlign = 'left';
            enemies.forEach((enemy, i) => {
                const text = `⚔️ ${enemy.count}x ${enemy.type}`;
                ctx.fillText(text, x + 5, y + h - 10 - (i * 15));
            });
        }

        // Draw loot
        const loot = this.currentMap.loot.filter(l => l.room === room.id);
        if (loot.length > 0) {
            ctx.font = '14px serif';
            ctx.textAlign = 'right';
            loot.forEach((item, i) => {
                const icon = item.icon || '📦';
                const text = `${icon} ${item.type}`;
                ctx.fillText(text, x + w - 5, y + 20 + (i * 15));
            });
        }
    }

    getRoomAt(x, y) {
        if (!this.currentMap) return null;

        const currentRooms = this.currentMap.rooms.filter(room =>
            room.floor === undefined || room.floor === this.currentMap.currentFloor
        );

        for (const room of currentRooms) {
            const rx = room.x;
            const ry = room.y;
            const rw = room.width || 0.15;
            const rh = room.height || 0.15;

            if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
                return room;
            }
        }
        return null;
    }
}

// Initialize and hook into world map
function initQuestMapSystem() {
    const questMapRenderer = new QuestMapRenderer();
    questMapRenderer.init();

    // Hook into fantasyMapSystem if it exists
    if (typeof fantasyMapSystem !== 'undefined') {
        const originalOnMouseDown = fantasyMapSystem.onMouseDown;
        fantasyMapSystem.onMouseDown = function(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width / this.scale - this.offsetX / rect.width;
            const y = (e.clientY - rect.top) / rect.height / this.scale - this.offsetY / rect.height;

            // Check if clicking on a quest location
            const clickedLocation = this.getLocationAt(x * rect.width, y * rect.height);
            if (clickedLocation && clickedLocation.type === 'quest') {
                // Open quest map for this location
                if (questMaps[clickedLocation.id]) {
                    questMapRenderer.open(clickedLocation.id);
                    return;
                }
            }

            // Call original function
            if (originalOnMouseDown) {
                originalOnMouseDown.call(this, e);
            }
        };
    }

    // Add global reference for debugging
    window.questMapRenderer = questMapRenderer;
    window.questMaps = questMaps;

    console.log('[Quest Map System] Initialized - Click on quest markers to view detailed maps');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuestMapSystem);
} else {
    initQuestMapSystem();
}