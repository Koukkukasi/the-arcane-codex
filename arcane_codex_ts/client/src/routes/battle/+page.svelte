<script lang="ts">
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';
  import { battle, playerCombatants, enemyCombatants, type Combatant, type Ability, type BattleLog } from '$lib/stores/battle';
  import { Card, Badge, ProgressBar } from '$lib/components';
  import {
    Sword, Shield, Zap, Heart, Skull, Clock,
    Flame, Snowflake, Wind, Droplet, Star
  } from 'lucide-svelte';

  let battleLogRef: HTMLElement;

  // Mock battle data
  const mockPlayers: Combatant[] = [
    {
      id: 'p1',
      name: 'Aetherion',
      class: 'mage',
      isPlayer: true,
      isCurrentTurn: true,
      stats: { hp: 85, maxHp: 100, mana: 60, maxMana: 80, armor: 5 },
      statusEffects: [{ id: '1', name: 'Focus', icon: '🎯', duration: 2, type: 'buff' }],
      position: { x: 0, y: 0 }
    },
    {
      id: 'p2',
      name: 'Shadowmere',
      class: 'rogue',
      isPlayer: true,
      isCurrentTurn: false,
      stats: { hp: 65, maxHp: 80, mana: 40, maxMana: 50, armor: 8 },
      statusEffects: [],
      position: { x: 0, y: 1 }
    }
  ];

  const mockEnemies: Combatant[] = [
    {
      id: 'e1',
      name: 'Void Wraith',
      class: 'enemy',
      isPlayer: false,
      isCurrentTurn: false,
      stats: { hp: 120, maxHp: 150, mana: 0, maxMana: 0, armor: 10 },
      statusEffects: [{ id: '2', name: 'Darkness', icon: '🌑', duration: 3, type: 'buff' }],
      position: { x: 1, y: 0 }
    },
    {
      id: 'e2',
      name: 'Shadow Spawn',
      class: 'enemy',
      isPlayer: false,
      isCurrentTurn: false,
      stats: { hp: 40, maxHp: 60, mana: 0, maxMana: 0, armor: 3 },
      statusEffects: [],
      position: { x: 1, y: 1 }
    }
  ];

  const abilities: Ability[] = [
    { id: 'a1', name: 'Arcane Bolt', description: 'Launch a bolt of pure arcane energy', manaCost: 15, cooldown: 0, currentCooldown: 0, targetType: 'single', damageType: 'magical', icon: '⚡' },
    { id: 'a2', name: 'Frost Nova', description: 'Freeze nearby enemies', manaCost: 25, cooldown: 2, currentCooldown: 0, targetType: 'all_enemies', damageType: 'magical', icon: '❄️' },
    { id: 'a3', name: 'Mind Shield', description: 'Create a protective barrier', manaCost: 20, cooldown: 3, currentCooldown: 1, targetType: 'self', icon: '🛡️' },
    { id: 'a4', name: 'Reality Tear', description: 'Rip through the fabric of reality', manaCost: 40, cooldown: 4, currentCooldown: 0, targetType: 'area', damageType: 'true', icon: '🌀' }
  ];

  const mockLogs: BattleLog[] = [
    { id: '1', timestamp: new Date(), type: 'system', message: 'Battle begins!' },
    { id: '2', timestamp: new Date(), type: 'action', source: 'Void Wraith', message: 'Void Wraith summons Shadow Spawn' },
    { id: '3', timestamp: new Date(), type: 'damage', source: 'Aetherion', target: 'Void Wraith', amount: 24, message: 'Aetherion hits Void Wraith for 24 damage' }
  ];

  let players = $state<Combatant[]>(mockPlayers);
  let enemies = $state<Combatant[]>(mockEnemies);
  let logs = $state<BattleLog[]>(mockLogs);
  let selectedAbility = $state<Ability | null>(null);
  let selectedTarget = $state<string | null>(null);
  let turn = $state(1);
  let isPlayerTurn = $state(true);

  function selectAbility(ability: Ability) {
    if (ability.currentCooldown > 0) return;
    const currentPlayer = players.find(p => p.isCurrentTurn);
    if (currentPlayer && currentPlayer.stats.mana < ability.manaCost) return;

    selectedAbility = ability;
    selectedTarget = null;

    // Auto-select target for self abilities
    if (ability.targetType === 'self') {
      selectedTarget = currentPlayer?.id || null;
    }

    // Animate ability selection
    gsap.fromTo(`[data-ability="${ability.id}"]`,
      { scale: 0.95 },
      { scale: 1, duration: 0.2, ease: 'back.out(2)' }
    );
  }

  function selectTarget(targetId: string) {
    if (!selectedAbility) return;

    selectedTarget = targetId;

    // Animate target selection
    gsap.to(`[data-combatant="${targetId}"]`, {
      scale: 1.05,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });
  }

  function executeAction() {
    if (!selectedAbility || !selectedTarget) return;

    const currentPlayer = players.find(p => p.isCurrentTurn);
    if (!currentPlayer) return;

    // Deduct mana
    players = players.map(p =>
      p.id === currentPlayer.id
        ? { ...p, stats: { ...p.stats, mana: p.stats.mana - selectedAbility!.manaCost } }
        : p
    );

    // Calculate and apply damage
    const baseDamage = Math.floor(Math.random() * 20) + 15;
    const target = [...enemies, ...players].find(c => c.id === selectedTarget);

    if (target && !target.isPlayer) {
      enemies = enemies.map(e =>
        e.id === selectedTarget
          ? { ...e, stats: { ...e.stats, hp: Math.max(0, e.stats.hp - baseDamage) } }
          : e
      );

      // Add to battle log
      logs = [...logs, {
        id: Math.random().toString(36).slice(2),
        timestamp: new Date(),
        type: 'damage',
        source: currentPlayer.name,
        target: target.name,
        amount: baseDamage,
        message: `${currentPlayer.name} uses ${selectedAbility.name} on ${target.name} for ${baseDamage} damage!`
      }];

      // Animate damage
      gsap.to(`[data-combatant="${selectedTarget}"]`, {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }

    // Reset selection
    selectedAbility = null;
    selectedTarget = null;

    // Scroll battle log
    setTimeout(() => {
      if (battleLogRef) {
        battleLogRef.scrollTop = battleLogRef.scrollHeight;
      }
    }, 100);
  }

  function endTurn() {
    // Switch turns between players
    const currentIndex = players.findIndex(p => p.isCurrentTurn);
    players = players.map((p, i) => ({
      ...p,
      isCurrentTurn: i === (currentIndex + 1) % players.length
    }));

    if (currentIndex === players.length - 1) {
      // Enemy turn
      isPlayerTurn = false;
      simulateEnemyTurn();
    }
  }

  function simulateEnemyTurn() {
    // Simple enemy AI
    setTimeout(() => {
      const aliveEnemies = enemies.filter(e => e.stats.hp > 0);
      const alivePlayers = players.filter(p => p.stats.hp > 0);

      if (aliveEnemies.length > 0 && alivePlayers.length > 0) {
        const attacker = aliveEnemies[0];
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const damage = Math.floor(Math.random() * 15) + 10;

        players = players.map(p =>
          p.id === target.id
            ? { ...p, stats: { ...p.stats, hp: Math.max(0, p.stats.hp - damage) } }
            : p
        );

        logs = [...logs, {
          id: Math.random().toString(36).slice(2),
          timestamp: new Date(),
          type: 'damage',
          source: attacker.name,
          target: target.name,
          amount: damage,
          message: `${attacker.name} attacks ${target.name} for ${damage} damage!`
        }];

        gsap.to(`[data-combatant="${target.id}"]`, {
          x: -10,
          duration: 0.1,
          repeat: 3,
          yoyo: true
        });
      }

      turn++;
      isPlayerTurn = true;

      setTimeout(() => {
        if (battleLogRef) {
          battleLogRef.scrollTop = battleLogRef.scrollHeight;
        }
      }, 100);
    }, 1000);
  }

  const currentPlayer = $derived(players.find(p => p.isCurrentTurn));
  const canExecute = $derived(selectedAbility !== null && selectedTarget !== null);

  onMount(() => {
    // Entrance animations
    gsap.from('.player-unit', {
      x: -100,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    });

    gsap.from('.enemy-unit', {
      x: 100,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    });

    gsap.from('.ability-btn', {
      y: 50,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.3,
      ease: 'back.out(1.7)'
    });
  });
</script>

<svelte:head>
  <title>Battle | The Arcane Codex</title>
</svelte:head>

<main class="min-h-screen p-4 flex flex-col">
  <!-- Battle Header -->
  <div class="flex items-center justify-between mb-4">
    <Badge variant="gold" size="lg">Turn {turn}</Badge>
    <h1 class="text-xl font-display text-gradient-gold">Combat</h1>
    <Badge variant={isPlayerTurn ? 'cyan' : 'crimson'} size="lg">
      {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
    </Badge>
  </div>

  <!-- Battle Arena -->
  <div class="flex-1 grid grid-cols-2 gap-8 mb-4">
    <!-- Player Side -->
    <div class="flex flex-col justify-center gap-4">
      <h2 class="font-heading text-arcane-cyan text-center">Party</h2>
      {#each players as player}
        <div
          data-combatant={player.id}
          class="player-unit cursor-pointer transition-all duration-200"
          class:ring-2={selectedTarget === player.id}
          class:ring-arcane-cyan={selectedTarget === player.id}
          onclick={() => selectedAbility?.targetType === 'all_allies' || selectedAbility?.targetType === 'self' ? selectTarget(player.id) : null}
        >
          <Card
            variant={player.isCurrentTurn ? 'glow' : 'default'}
            padding="md"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-arcane-cyan/20 flex items-center justify-center text-2xl">
                {player.class === 'mage' ? '🧙' : '🗡️'}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-heading text-arcane-parchment">{player.name}</span>
                  {#if player.isCurrentTurn}
                    <Star size={14} class="text-arcane-gold animate-pulse" />
                  {/if}
                </div>
                <div class="space-y-1 mt-1">
                  <ProgressBar value={player.stats.hp} max={player.stats.maxHp} variant="health" size="sm" />
                  <ProgressBar value={player.stats.mana} max={player.stats.maxMana} variant="cyan" size="sm" />
                </div>
              </div>
              <div class="text-right text-xs font-mono">
                <p class="text-arcane-crimson">{player.stats.hp}/{player.stats.maxHp}</p>
                <p class="text-arcane-cyan">{player.stats.mana}/{player.stats.maxMana}</p>
              </div>
            </div>
            {#if player.statusEffects.length > 0}
              <div class="flex gap-1 mt-2">
                {#each player.statusEffects as effect}
                  <span class="text-sm" title={effect.name}>{effect.icon}</span>
                {/each}
              </div>
            {/if}
          </Card>
        </div>
      {/each}
    </div>

    <!-- Enemy Side -->
    <div class="flex flex-col justify-center gap-4">
      <h2 class="font-heading text-arcane-crimson text-center">Enemies</h2>
      {#each enemies as enemy}
        <button
          data-combatant={enemy.id}
          class="enemy-unit text-left transition-all duration-200"
          class:ring-2={selectedTarget === enemy.id}
          class:ring-arcane-crimson={selectedTarget === enemy.id}
          class:opacity-30={enemy.stats.hp <= 0}
          disabled={enemy.stats.hp <= 0 || !selectedAbility}
          onclick={() => selectTarget(enemy.id)}
        >
          <Card
            variant="bordered"
            padding="md"
            class="border-arcane-crimson/30"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-arcane-crimson/20 flex items-center justify-center text-2xl">
                {enemy.name.includes('Wraith') ? '👻' : '🦇'}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-heading text-arcane-parchment">{enemy.name}</span>
                  {#if enemy.stats.hp <= 0}
                    <Skull size={14} class="text-arcane-crimson" />
                  {/if}
                </div>
                <div class="mt-1">
                  <ProgressBar value={enemy.stats.hp} max={enemy.stats.maxHp} variant="crimson" size="sm" />
                </div>
              </div>
              <div class="text-right text-xs font-mono">
                <p class="text-arcane-crimson">{enemy.stats.hp}/{enemy.stats.maxHp}</p>
                <p class="text-arcane-parchment-dim">🛡️ {enemy.stats.armor}</p>
              </div>
            </div>
            {#if enemy.statusEffects.length > 0}
              <div class="flex gap-1 mt-2">
                {#each enemy.statusEffects as effect}
                  <span class="text-sm" title={effect.name}>{effect.icon}</span>
                {/each}
              </div>
            {/if}
          </Card>
        </button>
      {/each}
    </div>
  </div>

  <!-- Battle Log -->
  <Card variant="default" padding="sm" class="h-24 mb-4">
    <div bind:this={battleLogRef} class="h-full overflow-y-auto text-sm font-mono space-y-1">
      {#each logs as log}
        <p class={
          log.type === 'damage' ? 'text-arcane-crimson' :
          log.type === 'heal' ? 'text-green-400' :
          log.type === 'system' ? 'text-arcane-cyan' :
          'text-arcane-parchment-dim'
        }>
          {log.message}
        </p>
      {/each}
    </div>
  </Card>

  <!-- Ability Bar -->
  <div class="bg-arcane-elevated border-t border-arcane-gold/20 -mx-4 -mb-4 p-4">
    <div class="flex items-center gap-4">
      <!-- Abilities -->
      <div class="flex-1 flex gap-2 overflow-x-auto pb-2">
        {#each abilities as ability}
          <button
            data-ability={ability.id}
            disabled={!isPlayerTurn || ability.currentCooldown > 0 || (currentPlayer && currentPlayer.stats.mana < ability.manaCost)}
            onclick={() => selectAbility(ability)}
            class="ability-btn flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-200
              {selectedAbility?.id === ability.id ? 'border-arcane-gold bg-arcane-gold/20 scale-105' : 'border-arcane-gold/30 bg-arcane-surface'}
              {ability.currentCooldown > 0 ? 'opacity-50 grayscale' : ''}
              {currentPlayer && currentPlayer.stats.mana < ability.manaCost ? 'opacity-50' : ''}
              hover:border-arcane-gold/50 disabled:cursor-not-allowed"
            title="{ability.name}: {ability.description} ({ability.manaCost} mana)"
          >
            <span class="text-2xl">{ability.icon}</span>
            {#if ability.currentCooldown > 0}
              <div class="absolute inset-0 flex items-center justify-center bg-arcane-void/70 rounded-lg">
                <Clock size={16} class="text-arcane-parchment-dim" />
                <span class="text-xs ml-1">{ability.currentCooldown}</span>
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button
          disabled={!canExecute || !isPlayerTurn}
          onclick={executeAction}
          class="btn btn-lg bg-arcane-gold hover:bg-arcane-gold-light text-arcane-void disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap size={20} class="mr-2" />
          Execute
        </button>
        <button
          disabled={!isPlayerTurn}
          onclick={endTurn}
          class="btn btn-lg btn-outline border-arcane-gold text-arcane-gold hover:bg-arcane-gold hover:text-arcane-void disabled:opacity-50"
        >
          End Turn
        </button>
      </div>
    </div>

    <!-- Selected Ability Info -->
    {#if selectedAbility}
      <div class="mt-3 p-3 bg-arcane-surface rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{selectedAbility.icon}</span>
          <div>
            <h4 class="font-heading text-arcane-gold">{selectedAbility.name}</h4>
            <p class="text-sm text-arcane-parchment-dim">{selectedAbility.description}</p>
          </div>
          <div class="ml-auto text-right text-sm font-mono">
            <p class="text-arcane-cyan">{selectedAbility.manaCost} Mana</p>
            <p class="text-arcane-parchment-dim capitalize">{selectedAbility.targetType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>
