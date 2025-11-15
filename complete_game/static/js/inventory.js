// ========================================
// INVENTORY SYSTEM - ENHANCED UX
// ========================================

class InventorySystem {
    constructor() {
        this.items = [];
        this.draggedItem = null;
        this.draggedSlot = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    initializeElements() {
        this.overlay = document.getElementById('inventory-overlay');
        this.grid = document.getElementById('inventory-grid');
        this.tooltip = document.getElementById('item-tooltip');
        this.contextMenu = document.getElementById('context-menu');
        this.searchBox = document.getElementById('search-box');
        this.sortDropdown = document.getElementById('sort-dropdown');
    }

    async init() {
        this.createInventorySlots();
        await this.loadInventory();
        console.log('✓ Inventory system initialized');
    }

    createInventorySlots() {
        this.grid.innerHTML = '';
        for (let i = 0; i < 48; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slotId = i;
            this.grid.appendChild(slot);
        }
    }

    // ========================================
    // API INTEGRATION
    // ========================================

    async loadInventory() {
        try {
            if (typeof gameUX !== 'undefined') {
                gameUX.showLoading('Loading inventory...');
            }

            const data = await apiCall('/api/inventory/all');

            this.items = data.items || [];

            // Update inventory grid
            this.renderInventory();

            // Update equipment slots
            this.updateEquipmentSlots(data.equipped || {});

            // Update stats display
            this.updateStats(data);

            if (typeof gameUX !== 'undefined') {
                gameUX.hideLoading();
            }

        } catch (error) {
            console.error('Failed to load inventory:', error);
            if (typeof gameUX !== 'undefined') {
                gameUX.hideLoading();
            }
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.showErrorToUser('Failed to load inventory');
            }
        }
    }

    updateStats(data) {
        // Update gold
        const goldEl = document.getElementById('gold-amount');
        if (goldEl && data.gold !== undefined) {
            goldEl.textContent = data.gold.toLocaleString();
        }

        // Update weight
        const weightAmountEl = document.getElementById('weight-amount');
        const weightFillEl = document.getElementById('weight-fill');
        if (weightAmountEl && weightFillEl && data.weight !== undefined) {
            const maxWeight = data.max_weight || 100;
            const currentWeight = data.weight || 0;
            const weightPercent = (currentWeight / maxWeight) * 100;

            weightAmountEl.textContent = `${currentWeight.toFixed(1)} / ${maxWeight}`;
            weightFillEl.style.width = `${Math.min(weightPercent, 100)}%`;

            // Color code weight bar
            if (weightPercent < 50) {
                weightFillEl.style.background = '#10B981';
            } else if (weightPercent < 75) {
                weightFillEl.style.background = '#F59E0B';
            } else if (weightPercent < 100) {
                weightFillEl.style.background = '#EF4444';
                weightFillEl.style.animation = 'pulse 2s ease-in-out infinite';
            } else {
                weightFillEl.style.background = '#DC2626';
                weightFillEl.style.animation = 'pulse 1s ease-in-out infinite';
            }
        }

        // Update slot count
        const slotCountEl = document.getElementById('slot-count');
        if (slotCountEl) {
            slotCountEl.textContent = `${this.items.length} / 48`;
        }

        // Update filter counts
        this.updateFilterCounts();
    }

    updateFilterCounts() {
        const typeCounts = this.items.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {});

        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.dataset.filter;
            const count = filter === 'all' ? this.items.length : (typeCounts[filter] || 0);
            const countSpan = btn.querySelector('.filter-count');
            if (countSpan) countSpan.textContent = count;
        });
    }

    updateEquipmentSlots(equipped) {
        // Update each equipment slot with equipped items
        Object.entries(equipped).forEach(([slot, item]) => {
            const slotEl = document.querySelector(`[data-slot="${slot}"] .slot-item`);
            if (slotEl && item) {
                slotEl.innerHTML = `
                    <div class="item-icon">${item.icon || '⚔️'}</div>
                    <div class="item-rarity-border rarity-${item.rarity || 'common'}"></div>
                `;
                slotEl.classList.add('equipped');
                slotEl.classList.remove('empty');
                slotEl.dataset.itemId = item.id;
            }
        });
    }

    // ========================================
    // RENDERING
    // ========================================

    renderInventory() {
        const slots = this.grid.querySelectorAll('.inventory-slot');

        this.items.forEach((item, index) => {
            if (slots[index]) {
                const slot = slots[index];
                slot.innerHTML = `
                    <div class="grid-item"
                         draggable="true"
                         data-item-id="${item.id}"
                         data-slot-index="${index}">
                        <div class="item-icon">${item.icon}</div>
                        ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
                        <div class="item-rarity-border rarity-${item.rarity}"></div>
                    </div>
                `;

                const gridItem = slot.querySelector('.grid-item');
                this.attachItemListeners(gridItem, item);
            }
        });

        // Clear remaining slots
        for (let i = this.items.length; i < slots.length; i++) {
            slots[i].innerHTML = '';
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    attachEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // Search box
        if (this.searchBox) {
            this.searchBox.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Sort dropdown
        if (this.sortDropdown) {
            this.sortDropdown.addEventListener('change', (e) => this.handleSort(e));
        }

        // Close on backdrop
        const backdrop = document.querySelector('.overlay-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.close());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Close context menu on outside click
        document.addEventListener('click', () => {
            if (this.contextMenu) {
                this.contextMenu.classList.remove('visible');
            }
        });

        // Equipment slots
        document.querySelectorAll('.slot-item').forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleEquipmentDrop(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    attachItemListeners(element, item) {
        // Hover for tooltip
        element.addEventListener('mouseenter', (e) => this.showTooltip(e, item));
        element.addEventListener('mouseleave', () => this.hideTooltip());

        // Drag and drop
        element.addEventListener('dragstart', (e) => this.handleDragStart(e));
        element.addEventListener('dragend', (e) => this.handleDragEnd(e));

        // Right-click context menu
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, item);
        });

        // Double-click to use/equip
        element.addEventListener('dblclick', () => this.handleDoubleClick(item));

        // Click for details panel
        element.addEventListener('click', (e) => {
            if (e.button === 0) {
                this.showItemDetails(item);
            }
        });
    }

    // ========================================
    // DRAG AND DROP
    // ========================================

    handleDragStart(e) {
        const item = this.getItemById(parseInt(e.target.dataset.itemId));
        const slotIndex = parseInt(e.target.dataset.slotIndex);

        this.draggedItem = item;
        this.draggedSlot = slotIndex;

        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);

        // Highlight valid drop zones
        this.highlightDropZones(item);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.clearDropZones();
        this.draggedItem = null;
        this.draggedSlot = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!e.currentTarget.classList.contains('drop-target')) {
            e.currentTarget.classList.add('drop-target');
        }
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drop-target');
    }

    async handleEquipmentDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drop-target');

        if (this.draggedItem) {
            const slotType = e.currentTarget.dataset.slotType;
            await this.equipItem(this.draggedItem.id, slotType);
        }
    }

    highlightDropZones(item) {
        const validSlots = document.querySelectorAll(`[data-slot-type="${this.getEquipmentSlot(item.type)}"]`);
        validSlots.forEach(slot => slot.classList.add('drop-target'));
    }

    clearDropZones() {
        document.querySelectorAll('.drop-target').forEach(slot => {
            slot.classList.remove('drop-target');
        });
    }

    getEquipmentSlot(itemType) {
        const slotMap = {
            'weapon': 'main-hand',
            'armor': 'armor',
            'helmet': 'helmet',
            'gloves': 'gloves',
            'boots': 'boots',
            'accessory': 'accessory'
        };
        return slotMap[itemType] || null;
    }

    // ========================================
    // TOOLTIP
    // ========================================

    showTooltip(e, item) {
        if (!this.tooltip) return;

        // Update tooltip content
        this.tooltip.querySelector('.tooltip-name').textContent = item.name;
        this.tooltip.querySelector('.tooltip-type').textContent = `${item.type} • ${item.rarity}`;

        const rarityBadge = this.tooltip.querySelector('.tooltip-rarity');
        rarityBadge.textContent = item.rarity.toUpperCase();
        rarityBadge.style.background = `var(--rarity-${item.rarity})`;
        rarityBadge.style.color = 'white';

        // Update stats if available
        if (item.stats) {
            const statsContainer = this.tooltip.querySelector('.tooltip-stats');
            statsContainer.innerHTML = Object.entries(item.stats).map(([key, value]) => `
                <div class="tooltip-stat">
                    <span>${key}:</span>
                    <span style="color: var(--gold-bright);">${value}</span>
                </div>
            `).join('');
        }

        // Update description
        const descEl = this.tooltip.querySelector('.tooltip-description');
        if (descEl && item.description) {
            descEl.textContent = item.description;
        }

        // Position tooltip
        const rect = e.target.getBoundingClientRect();
        this.tooltip.style.left = `${rect.right + 10}px`;
        this.tooltip.style.top = `${rect.top}px`;

        // Adjust if off-screen
        setTimeout(() => {
            const tooltipRect = this.tooltip.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth) {
                this.tooltip.style.left = `${rect.left - tooltipRect.width - 10}px`;
            }
            if (tooltipRect.bottom > window.innerHeight) {
                this.tooltip.style.top = `${window.innerHeight - tooltipRect.height - 10}px`;
            }
        }, 0);

        this.tooltip.classList.add('visible');
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('visible');
        }
    }

    // ========================================
    // CONTEXT MENU
    // ========================================

    showContextMenu(e, item) {
        if (!this.contextMenu) return;

        const menu = this.contextMenu;

        // Position menu
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;

        // Update menu items based on item type
        const equipAction = menu.querySelector('[data-action="equip"]');
        const useAction = menu.querySelector('[data-action="use"]');

        if (item.type === 'consumable') {
            if (equipAction) equipAction.classList.add('disabled');
            if (useAction) useAction.classList.remove('disabled');
        } else if (['weapon', 'armor', 'accessory', 'helmet', 'gloves', 'boots'].includes(item.type)) {
            if (equipAction) equipAction.classList.remove('disabled');
            if (useAction) useAction.classList.add('disabled');
        } else {
            if (equipAction) equipAction.classList.add('disabled');
            if (useAction) useAction.classList.add('disabled');
        }

        menu.classList.add('visible');

        // Attach click handlers
        menu.querySelectorAll('.context-menu-item:not(.disabled)').forEach(menuItem => {
            menuItem.onclick = (e) => {
                e.stopPropagation();
                this.handleContextAction(menuItem.dataset.action, item);
                menu.classList.remove('visible');
            };
        });
    }

    async handleContextAction(action, item) {
        console.log(`Context action: ${action} on ${item.name}`);

        switch (action) {
            case 'equip':
                await this.equipItem(item.id);
                break;
            case 'use':
                await this.useItem(item.id);
                break;
            case 'examine':
                this.examineItem(item);
                break;
            case 'drop':
                await this.dropItem(item.id);
                break;
            case 'destroy':
                await this.destroyItem(item.id);
                break;
        }
    }

    // ========================================
    // ITEM ACTIONS
    // ========================================

    handleDoubleClick(item) {
        if (item.type === 'consumable') {
            this.useItem(item.id);
        } else if (['weapon', 'armor', 'accessory', 'helmet', 'gloves', 'boots'].includes(item.type)) {
            this.equipItem(item.id);
        }
    }

    async equipItem(itemId, slot = null) {
        try {
            const result = await apiCall('/api/inventory/equip', {
                method: 'POST',
                body: JSON.stringify({ item_id: itemId, slot: slot })
            });

            if (result.success) {
                await this.loadInventory();
                this.showNotification(`Item equipped!`, 'success');
            } else {
                this.showNotification(result.error || 'Failed to equip item', 'error');
            }
        } catch (error) {
            console.error('Failed to equip item:', error);
            this.showNotification('Failed to equip item', 'error');
        }
    }

    async useItem(itemId) {
        try {
            const result = await apiCall('/api/inventory/use', {
                method: 'POST',
                body: JSON.stringify({ item_id: itemId })
            });

            if (result.success) {
                await this.loadInventory();
                this.showNotification(`Item used!`, 'success');
            } else {
                this.showNotification(result.error || 'Failed to use item', 'error');
            }
        } catch (error) {
            console.error('Failed to use item:', error);
            this.showNotification('Failed to use item', 'error');
        }
    }

    examineItem(item) {
        this.showItemDetails(item);
        this.showNotification(`Examining ${item.name}...`, 'info');
    }

    async dropItem(itemId) {
        if (confirm(`Drop this item?`)) {
            try {
                const result = await apiCall('/api/inventory/drop', {
                    method: 'POST',
                    body: JSON.stringify({ item_id: itemId })
                });

                if (result.success) {
                    await this.loadInventory();
                    this.showNotification(`Item dropped`, 'warning');
                } else {
                    this.showNotification(result.error || 'Failed to drop item', 'error');
                }
            } catch (error) {
                console.error('Failed to drop item:', error);
                this.showNotification('Failed to drop item', 'error');
            }
        }
    }

    async destroyItem(itemId) {
        if (confirm(`Permanently destroy this item? This cannot be undone.`)) {
            try {
                const result = await apiCall('/api/inventory/destroy', {
                    method: 'POST',
                    body: JSON.stringify({ item_id: itemId })
                });

                if (result.success) {
                    await this.loadInventory();
                    this.showNotification(`Item destroyed`, 'error');
                } else {
                    this.showNotification(result.error || 'Failed to destroy item', 'error');
                }
            } catch (error) {
                console.error('Failed to destroy item:', error);
                this.showNotification('Failed to destroy item', 'error');
            }
        }
    }

    // ========================================
    // FILTERING AND SORTING
    // ========================================

    handleFilterClick(e) {
        const filter = e.currentTarget.dataset.filter;

        // Update active state
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Filter items
        const slots = this.grid.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            if (filter === 'all') {
                slot.classList.remove('hidden');
            } else {
                const item = this.items[index];
                if (item && item.type === filter) {
                    slot.classList.remove('hidden');
                } else {
                    slot.classList.add('hidden');
                }
            }
        });
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const slots = this.grid.querySelectorAll('.inventory-slot');

        slots.forEach((slot, index) => {
            const item = this.items[index];
            if (item) {
                if (item.name.toLowerCase().includes(query)) {
                    slot.classList.remove('hidden');
                } else {
                    slot.classList.add('hidden');
                }
            } else {
                slot.classList.add('hidden');
            }
        });
    }

    handleSort(e) {
        const sortBy = e.target.value;

        this.items.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rarity':
                    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, divine: 5 };
                    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'value':
                    return (b.value || 0) - (a.value || 0);
                default:
                    return 0;
            }
        });

        this.renderInventory();
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    showItemDetails(item) {
        const detailsContent = document.querySelector('.details-content');
        if (detailsContent) {
            detailsContent.innerHTML = `
                <div class="details-item-name">${item.icon} ${item.name}</div>
                <div class="tooltip-rarity" style="background: var(--rarity-${item.rarity}); color: white; display: inline-block; padding: 4px 10px; border-radius: 4px; margin: 8px 0;">${item.rarity.toUpperCase()}</div>
                <div class="details-item-description">Type: ${item.type} | Value: ${item.value || 0} gold</div>
                ${item.quantity > 1 ? `<div style="margin-top: 8px;">Quantity: ${item.quantity}</div>` : ''}
                ${item.description ? `<div style="margin-top: 12px; font-style: italic;">${item.description}</div>` : ''}
            `;
        }
    }

    getItemById(id) {
        return this.items.find(item => item.id === id);
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Use gameUX notification if available
        if (typeof gameUX !== 'undefined' && gameUX.showNotification) {
            gameUX.showNotification(message, type);
        } else if (typeof ErrorHandler !== 'undefined') {
            if (type === 'success') {
                ErrorHandler.showSuccessToUser(message);
            } else if (type === 'error') {
                ErrorHandler.showErrorToUser(message);
            }
        }
    }

    handleKeyboard(e) {
        // I key to toggle inventory
        if (e.key.toLowerCase() === 'i' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            this.toggle();
        }

        // ESC to close
        if (e.key === 'Escape') {
            if (this.overlay && this.overlay.classList.contains('active')) {
                this.close();
            }
        }
    }

    // ========================================
    // PUBLIC API
    // ========================================

    open() {
        if (this.overlay) {
            this.overlay.classList.add('active');
            this.loadInventory();
        }
    }

    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }

    toggle() {
        if (this.overlay) {
            this.overlay.classList.toggle('active');
            if (this.overlay.classList.contains('active')) {
                this.loadInventory();
            }
        }
    }
}

// Initialize inventory system when DOM is ready
let inventorySystem = null;

document.addEventListener('DOMContentLoaded', () => {
    inventorySystem = new InventorySystem();
    inventorySystem.init();
    console.log('✓ Inventory system ready - Press I to open');
});

// Make globally accessible
window.InventorySystem = InventorySystem;
window.inventorySystem = inventorySystem;
