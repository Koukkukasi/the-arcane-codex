/**
 * ========================================
 * INVENTORY OVERLAY SYSTEM
 * The Arcane Codex - Phase 3
 * ========================================
 */

class InventorySystem {
    constructor() {
        // DOM Elements
        this.overlay = document.getElementById('inventoryOverlay');
        this.backdrop = document.querySelector('.inventory-backdrop');
        this.closeBtn = document.querySelector('.inventory-close');
        this.inventoryGrid = document.querySelector('.inventory-grid');
        this.equipmentSlots = document.querySelectorAll('.equipment-slot');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.sortDropdown = document.getElementById('inventorySort');
        this.tooltip = document.getElementById('itemTooltip');
        this.contextMenu = document.getElementById('itemContextMenu');
        this.weightDisplay = {
            current: document.querySelector('.weight-current'),
            max: document.querySelector('.weight-max')
        };
        this.goldDisplay = document.querySelector('.gold-amount');

        // State
        this.isOpen = false;
        this.draggedItem = null;
        this.draggedFromSlot = null;
        this.currentFilter = 'all';
        this.currentSort = 'name';
        this.inventory = new Map();
        this.equipment = new Map();

        // Player stats
        this.playerStats = {
            weight: { current: 45, max: 150 },
            gold: 1247,
            stats: {
                attack: 124,
                defense: 87,
                magic: 156,
                speed: 92
            }
        };

        // Item database (sample data)
        this.itemDatabase = {
            'sword_001': {
                id: 'sword_001',
                name: 'Flaming Sword',
                type: 'weapon',
                subtype: 'sword',
                rarity: 'rare',
                icon: '../assets/items/sword_flame.png',
                stats: {
                    attack: 45,
                    fireDamage: 15
                },
                description: 'A legendary blade forged in the eternal flames of Mount Pyrax.',
                weight: 3.5,
                value: 2500,
                stackable: false,
                slot: 'weapon'
            },
            'potion_001': {
                id: 'potion_001',
                name: 'Health Potion',
                type: 'consumable',
                subtype: 'potion',
                rarity: 'common',
                icon: '../assets/items/potion_health.png',
                stats: {
                    healing: 50
                },
                description: 'Restores 50 health points instantly.',
                weight: 0.2,
                value: 50,
                stackable: true,
                maxStack: 99,
                usable: true
            },
            'armor_001': {
                id: 'armor_001',
                name: 'Dragon Scale Armor',
                type: 'armor',
                subtype: 'chest',
                rarity: 'legendary',
                icon: '../assets/items/armor_dragon.png',
                stats: {
                    defense: 65,
                    fireResist: 25
                },
                description: 'Crafted from the scales of an ancient dragon.',
                weight: 15,
                value: 8500,
                stackable: false,
                slot: 'armor'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeInventory();
        this.renderInventory();
        this.updateStats();
    }

    setupEventListeners() {
        // Open/Close events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.closeBtn.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', () => this.close());

        // Filter and sort
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });
        this.sortDropdown.addEventListener('change', (e) => this.setSortMethod(e.target.value));

        // Drag and drop
        this.setupDragAndDrop();

        // Context menu
        this.setupContextMenu();

        // Tooltip
        this.setupTooltips();

        // Prevent default context menu
        this.overlay.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyPress(e) {
        // Open inventory with 'I' key
        if ((e.key === 'i' || e.key === 'I') && !this.isOpen) {
            e.preventDefault();
            this.open();
        }
        // Close with ESC
        else if (e.key === 'Escape' && this.isOpen) {
            e.preventDefault();
            this.close();
        }
    }

    open() {
        if (this.isOpen) return;

        this.overlay.classList.add('active');
        this.overlay.setAttribute('aria-hidden', 'false');
        this.isOpen = true;

        // Pause game if needed
        if (window.gameManager) {
            window.gameManager.pause();
        }

        // Play open sound
        this.playSound('inventory_open');
    }

    close() {
        if (!this.isOpen) return;

        this.overlay.classList.remove('active');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.isOpen = false;

        // Resume game if needed
        if (window.gameManager) {
            window.gameManager.resume();
        }

        // Hide context menu and tooltip
        this.hideContextMenu();
        this.hideTooltip();

        // Play close sound
        this.playSound('inventory_close');
    }

    // ========================================
    // INVENTORY MANAGEMENT
    // ========================================

    initializeInventory() {
        // Add sample items
        this.addItem('sword_001', 1, 0);
        this.addItem('potion_001', 5, 1);
        this.addItem('armor_001', 1, 8);
    }

    addItem(itemId, quantity = 1, slotIndex = null) {
        const item = this.itemDatabase[itemId];
        if (!item) return false;

        // Find available slot if not specified
        if (slotIndex === null) {
            slotIndex = this.findAvailableSlot(itemId);
            if (slotIndex === -1) {
                this.showNotification('Inventory full!', 'error');
                return false;
            }
        }

        // Check weight capacity
        const totalWeight = item.weight * quantity;
        if (this.playerStats.weight.current + totalWeight > this.playerStats.weight.max) {
            this.showNotification('Too heavy to carry!', 'warning');
            return false;
        }

        // Add or update item in inventory
        const existingItem = this.inventory.get(slotIndex);
        if (existingItem && existingItem.id === itemId && item.stackable) {
            existingItem.quantity += quantity;
        } else {
            this.inventory.set(slotIndex, {
                id: itemId,
                quantity: quantity
            });
        }

        this.playerStats.weight.current += totalWeight;
        this.updateStats();
        this.renderInventory();
        return true;
    }

    removeItem(slotIndex, quantity = null) {
        const inventoryItem = this.inventory.get(slotIndex);
        if (!inventoryItem) return false;

        const item = this.itemDatabase[inventoryItem.id];
        const removeQuantity = quantity || inventoryItem.quantity;

        if (inventoryItem.quantity > removeQuantity) {
            inventoryItem.quantity -= removeQuantity;
        } else {
            this.inventory.delete(slotIndex);
        }

        this.playerStats.weight.current -= item.weight * removeQuantity;
        this.updateStats();
        this.renderInventory();
        return true;
    }

    findAvailableSlot(itemId) {
        const item = this.itemDatabase[itemId];

        // Check for stackable items first
        if (item.stackable) {
            for (let [slot, invItem] of this.inventory) {
                if (invItem.id === itemId && invItem.quantity < item.maxStack) {
                    return slot;
                }
            }
        }

        // Find empty slot
        for (let i = 0; i < 48; i++) {
            if (!this.inventory.has(i)) {
                return i;
            }
        }

        return -1;
    }

    // ========================================
    // EQUIPMENT MANAGEMENT
    // ========================================

    equipItem(itemId, slotIndex) {
        const item = this.itemDatabase[itemId];
        if (!item || !item.slot) return false;

        // Remove from inventory
        const inventoryItem = this.inventory.get(slotIndex);
        if (!inventoryItem) return false;

        // Unequip current item if exists
        const currentEquipped = this.equipment.get(item.slot);
        if (currentEquipped) {
            this.unequipItem(item.slot);
        }

        // Equip new item
        this.equipment.set(item.slot, {
            id: itemId,
            quantity: 1
        });

        // Remove from inventory
        if (inventoryItem.quantity > 1) {
            inventoryItem.quantity--;
        } else {
            this.inventory.delete(slotIndex);
        }

        // Update stats
        this.applyItemStats(item, true);
        this.updateStats();
        this.renderInventory();
        this.renderEquipment();

        this.showNotification(`Equipped ${item.name}`, 'success');
        this.playSound('equip');
        return true;
    }

    unequipItem(slot) {
        const equippedItem = this.equipment.get(slot);
        if (!equippedItem) return false;

        const item = this.itemDatabase[equippedItem.id];

        // Find available inventory slot
        const slotIndex = this.findAvailableSlot(equippedItem.id);
        if (slotIndex === -1) {
            this.showNotification('Inventory full!', 'error');
            return false;
        }

        // Remove from equipment
        this.equipment.delete(slot);

        // Add to inventory
        this.addItem(equippedItem.id, 1, slotIndex);

        // Update stats
        this.applyItemStats(item, false);
        this.updateStats();
        this.renderEquipment();

        this.showNotification(`Unequipped ${item.name}`, 'info');
        this.playSound('unequip');
        return true;
    }

    applyItemStats(item, equip) {
        const multiplier = equip ? 1 : -1;

        if (item.stats.attack) {
            this.playerStats.stats.attack += item.stats.attack * multiplier;
        }
        if (item.stats.defense) {
            this.playerStats.stats.defense += item.stats.defense * multiplier;
        }
        if (item.stats.magic) {
            this.playerStats.stats.magic += item.stats.magic * multiplier;
        }
        if (item.stats.speed) {
            this.playerStats.stats.speed += item.stats.speed * multiplier;
        }
    }

    // ========================================
    // RENDERING
    // ========================================

    renderInventory() {
        // Clear grid
        this.inventoryGrid.innerHTML = '';

        // Get filtered and sorted items
        const items = this.getFilteredAndSortedItems();

        // Render 48 slots
        for (let i = 0; i < 48; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slotId = i;

            const inventoryItem = this.inventory.get(i);
            if (inventoryItem && this.shouldShowItem(inventoryItem.id)) {
                const item = this.itemDatabase[inventoryItem.id];
                const itemEl = this.createItemElement(item, inventoryItem.quantity);
                slot.appendChild(itemEl);
            } else {
                slot.classList.add('empty');
            }

            this.inventoryGrid.appendChild(slot);
        }
    }

    renderEquipment() {
        this.equipmentSlots.forEach(slot => {
            const slotType = slot.dataset.slot;
            const equippedItem = this.equipment.get(slotType);

            // Clear slot
            const placeholder = slot.querySelector('.slot-placeholder');
            if (placeholder) {
                placeholder.style.display = equippedItem ? 'none' : 'flex';
            }

            // Remove existing item
            const existingItem = slot.querySelector('.item');
            if (existingItem) {
                existingItem.remove();
            }

            if (equippedItem) {
                const item = this.itemDatabase[equippedItem.id];
                const itemEl = this.createItemElement(item, 1);
                slot.appendChild(itemEl);
                slot.classList.add('equipped');
            } else {
                slot.classList.remove('equipped');
            }
        });

        // Update character stats display
        this.updateCharacterStats();
    }

    createItemElement(item, quantity) {
        const itemEl = document.createElement('div');
        itemEl.className = `item rarity-${item.rarity}`;
        itemEl.draggable = true;
        itemEl.dataset.itemId = item.id;

        // Create placeholder icon since we don't have actual images
        const icon = document.createElement('div');
        icon.className = 'item-icon';
        icon.style.width = '48px';
        icon.style.height = '48px';
        icon.style.background = `linear-gradient(135deg, var(--rarity-${item.rarity}), transparent)`;
        icon.style.borderRadius = '8px';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.fontSize = '24px';

        // Add icon based on type
        const typeIcons = {
            weapon: '⚔️',
            armor: '🛡️',
            consumable: '🧪',
            quest: '📜',
            accessory: '💍'
        };
        icon.textContent = typeIcons[item.type] || '📦';

        itemEl.appendChild(icon);

        if (quantity > 1) {
            const stack = document.createElement('span');
            stack.className = 'item-stack';
            stack.textContent = quantity;
            itemEl.appendChild(stack);
        }

        return itemEl;
    }

    shouldShowItem(itemId) {
        if (this.currentFilter === 'all') return true;

        const item = this.itemDatabase[itemId];
        const filterMap = {
            'weapons': 'weapon',
            'armor': 'armor',
            'consumables': 'consumable',
            'quest': 'quest'
        };

        return item.type === filterMap[this.currentFilter];
    }

    getFilteredAndSortedItems() {
        const items = Array.from(this.inventory.entries());

        // Filter
        const filtered = items.filter(([slot, invItem]) =>
            this.shouldShowItem(invItem.id)
        );

        // Sort
        filtered.sort((a, b) => {
            const itemA = this.itemDatabase[a[1].id];
            const itemB = this.itemDatabase[b[1].id];

            switch (this.currentSort) {
                case 'name':
                    return itemA.name.localeCompare(itemB.name);
                case 'type':
                    return itemA.type.localeCompare(itemB.type);
                case 'value':
                    return itemB.value - itemA.value;
                case 'rarity':
                    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                    return rarityOrder.indexOf(itemB.rarity) - rarityOrder.indexOf(itemA.rarity);
                case 'weight':
                    return itemB.weight - itemA.weight;
                default:
                    return 0;
            }
        });

        return filtered;
    }

    // ========================================
    // DRAG AND DROP
    // ========================================

    setupDragAndDrop() {
        // Inventory grid drag events
        this.inventoryGrid.addEventListener('dragstart', (e) => this.handleDragStart(e));
        this.inventoryGrid.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.inventoryGrid.addEventListener('drop', (e) => this.handleDrop(e));
        this.inventoryGrid.addEventListener('dragend', (e) => this.handleDragEnd(e));
        this.inventoryGrid.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.inventoryGrid.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Equipment slots drag events
        this.equipmentSlots.forEach(slot => {
            slot.addEventListener('dragstart', (e) => this.handleDragStart(e));
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleEquipDrop(e));
            slot.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        const item = e.target.closest('.item');
        if (!item) return;

        this.draggedItem = item;
        this.draggedFromSlot = item.parentElement;
        item.classList.add('dragging');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        const slot = e.target.closest('.inventory-slot, .equipment-slot');
        if (slot && slot !== this.draggedFromSlot) {
            slot.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const slot = e.target.closest('.inventory-slot, .equipment-slot');
        if (slot) {
            slot.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();

        const targetSlot = e.target.closest('.inventory-slot');
        if (!targetSlot || !this.draggedItem) return;

        targetSlot.classList.remove('drag-over');

        const fromSlotId = parseInt(this.draggedFromSlot.dataset.slotId);
        const toSlotId = parseInt(targetSlot.dataset.slotId);

        // Swap items in inventory
        this.swapInventoryItems(fromSlotId, toSlotId);
    }

    handleEquipDrop(e) {
        e.preventDefault();

        const targetSlot = e.target.closest('.equipment-slot');
        if (!targetSlot || !this.draggedItem) return;

        targetSlot.classList.remove('drag-over');

        const itemId = this.draggedItem.dataset.itemId;
        const fromSlotId = parseInt(this.draggedFromSlot.dataset.slotId);

        // Equip item
        this.equipItem(itemId, fromSlotId);
    }

    handleDragEnd(e) {
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
        }

        // Remove all drag-over classes
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        this.draggedItem = null;
        this.draggedFromSlot = null;
    }

    swapInventoryItems(fromSlot, toSlot) {
        const fromItem = this.inventory.get(fromSlot);
        const toItem = this.inventory.get(toSlot);

        if (fromItem) {
            this.inventory.set(toSlot, fromItem);
        } else {
            this.inventory.delete(toSlot);
        }

        if (toItem) {
            this.inventory.set(fromSlot, toItem);
        } else {
            this.inventory.delete(fromSlot);
        }

        this.renderInventory();
        this.playSound('item_move');
    }

    // ========================================
    // CONTEXT MENU
    // ========================================

    setupContextMenu() {
        this.inventoryGrid.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            const item = e.target.closest('.item');
            if (!item) {
                this.hideContextMenu();
                return;
            }

            this.showContextMenu(e.pageX, e.pageY, item);
        });

        // Context menu actions
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleContextAction(action);
            });
        });

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
    }

    showContextMenu(x, y, item) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('visible');
        this.contextMenu.setAttribute('aria-hidden', 'false');

        this.contextMenuTarget = item;

        // Show/hide relevant options based on item type
        const itemId = item.dataset.itemId;
        const itemData = this.itemDatabase[itemId];

        const useBtn = this.contextMenu.querySelector('[data-action="use"]');
        const equipBtn = this.contextMenu.querySelector('[data-action="equip"]');

        useBtn.style.display = itemData.usable ? 'flex' : 'none';
        equipBtn.style.display = itemData.slot ? 'flex' : 'none';
    }

    hideContextMenu() {
        this.contextMenu.classList.remove('visible');
        this.contextMenu.setAttribute('aria-hidden', 'true');
        this.contextMenuTarget = null;
    }

    handleContextAction(action) {
        if (!this.contextMenuTarget) return;

        const itemId = this.contextMenuTarget.dataset.itemId;
        const slotId = parseInt(this.contextMenuTarget.parentElement.dataset.slotId);

        switch (action) {
            case 'use':
                this.useItem(itemId, slotId);
                break;
            case 'equip':
                this.equipItem(itemId, slotId);
                break;
            case 'drop':
                this.dropItem(slotId);
                break;
            case 'examine':
                this.examineItem(itemId);
                break;
        }

        this.hideContextMenu();
    }

    useItem(itemId, slotId) {
        const item = this.itemDatabase[itemId];
        if (!item.usable) return;

        // Apply item effects
        if (item.stats.healing) {
            this.showNotification(`Used ${item.name} (+${item.stats.healing} HP)`, 'success');
            // Apply healing to player
            if (window.gameManager) {
                window.gameManager.healPlayer(item.stats.healing);
            }
        }

        // Remove one from stack
        this.removeItem(slotId, 1);
        this.playSound('item_use');
    }

    dropItem(slotId) {
        const inventoryItem = this.inventory.get(slotId);
        if (!inventoryItem) return;

        const item = this.itemDatabase[inventoryItem.id];

        // Confirm drop for valuable items
        if (item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary') {
            if (!confirm(`Are you sure you want to drop ${item.name}?`)) {
                return;
            }
        }

        this.removeItem(slotId);
        this.showNotification(`Dropped ${item.name}`, 'info');
        this.playSound('item_drop');
    }

    examineItem(itemId) {
        const item = this.itemDatabase[itemId];
        this.showNotification(item.description, 'info', 5000);
    }

    // ========================================
    // TOOLTIPS
    // ========================================

    setupTooltips() {
        this.inventoryGrid.addEventListener('mouseover', (e) => {
            const item = e.target.closest('.item');
            if (item) {
                this.showTooltip(item, e);
            }
        });

        this.inventoryGrid.addEventListener('mouseout', (e) => {
            const item = e.target.closest('.item');
            if (item) {
                this.hideTooltip();
            }
        });

        // Equipment tooltips
        this.equipmentSlots.forEach(slot => {
            slot.addEventListener('mouseover', (e) => {
                const item = slot.querySelector('.item');
                if (item) {
                    this.showTooltip(item, e);
                }
            });

            slot.addEventListener('mouseout', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(itemEl, event) {
        const itemId = itemEl.dataset.itemId;
        const item = this.itemDatabase[itemId];

        if (!item) return;

        // Update tooltip content
        this.tooltip.querySelector('.tooltip-name').textContent = item.name;

        const rarityEl = this.tooltip.querySelector('.tooltip-rarity');
        rarityEl.textContent = item.rarity;
        rarityEl.className = `tooltip-rarity ${item.rarity}`;

        this.tooltip.querySelector('.tooltip-type').textContent =
            `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${item.subtype || 'General'}`;

        // Stats
        const statsContainer = this.tooltip.querySelector('.tooltip-stats');
        statsContainer.innerHTML = '';

        if (item.stats) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                const statLine = document.createElement('div');
                statLine.className = 'stat-line';

                const statIcons = {
                    attack: '⚔️',
                    defense: '🛡️',
                    magic: '✨',
                    speed: '💨',
                    healing: '❤️',
                    fireDamage: '🔥',
                    fireResist: '🛡️'
                };

                statLine.innerHTML = `
                    <span class="stat-icon">${statIcons[stat] || '•'}</span>
                    <span class="stat-text">+${value} ${stat.charAt(0).toUpperCase() + stat.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                `;

                statsContainer.appendChild(statLine);
            });
        }

        this.tooltip.querySelector('.tooltip-description').textContent = item.description;
        this.tooltip.querySelector('.tooltip-weight').textContent = `Weight: ${item.weight} kg`;
        this.tooltip.querySelector('.tooltip-value').textContent = `Value: ${item.value.toLocaleString()} gold`;

        // Position tooltip
        const rect = itemEl.getBoundingClientRect();
        const tooltipWidth = 300;

        let x = rect.right + 10;
        let y = rect.top;

        // Adjust if tooltip would go off screen
        if (x + tooltipWidth > window.innerWidth) {
            x = rect.left - tooltipWidth - 10;
        }

        if (y + 200 > window.innerHeight) {
            y = window.innerHeight - 200;
        }

        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;

        this.tooltip.classList.add('visible');
        this.tooltip.setAttribute('aria-hidden', 'false');
    }

    hideTooltip() {
        this.tooltip.classList.remove('visible');
        this.tooltip.setAttribute('aria-hidden', 'true');
    }

    // ========================================
    // FILTERS AND SORTING
    // ========================================

    setFilter(filter) {
        this.currentFilter = filter;

        // Update button states
        this.filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        this.renderInventory();
        this.playSound('button_click');
    }

    setSortMethod(method) {
        this.currentSort = method;
        this.renderInventory();
        this.playSound('button_click');
    }

    // ========================================
    // UI UPDATES
    // ========================================

    updateStats() {
        this.weightDisplay.current.textContent = Math.round(this.playerStats.weight.current);
        this.weightDisplay.max.textContent = this.playerStats.weight.max;

        // Color code weight based on capacity
        const weightPercent = this.playerStats.weight.current / this.playerStats.weight.max;
        if (weightPercent > 0.9) {
            this.weightDisplay.current.style.color = 'var(--battle-primary)';
        } else if (weightPercent > 0.75) {
            this.weightDisplay.current.style.color = 'var(--divine-primary)';
        } else {
            this.weightDisplay.current.style.color = 'var(--ui-text-primary)';
        }

        this.goldDisplay.textContent = this.playerStats.gold.toLocaleString();
    }

    updateCharacterStats() {
        document.querySelectorAll('.character-stats .stat-value').forEach((el, index) => {
            const stats = ['attack', 'defense', 'magic', 'speed'];
            const statName = stats[index];
            if (statName) {
                el.textContent = this.playerStats.stats[statName];
            }
        });
    }

    // ========================================
    // NOTIFICATIONS
    // ========================================

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `inventory-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: var(--ui-bg-primary);
            border: 2px solid var(--${type === 'success' ? 'victory' : type === 'error' ? 'battle' : 'theme'}-primary);
            border-radius: 8px;
            color: var(--ui-text-primary);
            font-size: 14px;
            z-index: var(--z-notification);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // ========================================
    // SOUND EFFECTS
    // ========================================

    playSound(soundName) {
        // Integrate with game's sound system if available
        if (window.audioManager) {
            window.audioManager.playSound(soundName);
        }
    }
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.inventorySystem = new InventorySystem();
    });
} else {
    window.inventorySystem = new InventorySystem();
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);