<script lang="ts">
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';
  import { lobby, partyReady, playerCount, type Player, type ChatMessage } from '$lib/stores/lobby';
  import { Button, Card, Input, Badge, Avatar, Modal } from '$lib/components';
  import {
    ArrowLeft, Users, MessageCircle, Settings, Copy, Check,
    Sword, Wand2, Ghost, Heart, BookOpen, Skull, Crown, Send, Shield
  } from 'lucide-svelte';

  let chatInput = $state('');
  let chatContainerRef: HTMLElement;
  let copied = $state(false);
  let showSettingsModal = $state(false);
  let containerRef: HTMLElement;

  // Mock data for demonstration
  const mockPlayers: Player[] = [
    { id: '1', name: 'Aetherion', class: 'mage', level: 12, isReady: true, isHost: true, status: 'online' },
    { id: '2', name: 'Shadowmere', class: 'rogue', level: 8, isReady: false, isHost: false, status: 'online' }
  ];

  const mockMessages: ChatMessage[] = [
    { id: '1', playerId: 'system', playerName: 'System', content: 'Party created. Share the code to invite others.', timestamp: new Date(), type: 'system' },
    { id: '2', playerId: '1', playerName: 'Aetherion', content: 'Ready when you are!', timestamp: new Date(), type: 'chat' }
  ];

  let players = $state<Player[]>(mockPlayers);
  let messages = $state<ChatMessage[]>(mockMessages);
  let partyCode = $state('ARCN-7X9K');
  let currentPlayerId = $state('1'); // Mock current player

  const classIcons: Record<string, typeof Sword> = {
    warrior: Sword,
    mage: Wand2,
    rogue: Ghost,
    healer: Heart,
    summoner: BookOpen,
    berserker: Skull
  };

  const classColors: Record<string, string> = {
    warrior: 'text-red-400',
    mage: 'text-purple-400',
    rogue: 'text-gray-400',
    healer: 'text-green-400',
    summoner: 'text-blue-400',
    berserker: 'text-orange-400'
  };

  function copyPartyCode() {
    navigator.clipboard.writeText(partyCode);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function sendMessage() {
    if (!chatInput.trim()) return;

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    messages = [...messages, {
      id: Math.random().toString(36).slice(2),
      playerId: currentPlayerId,
      playerName: currentPlayer?.name || 'Unknown',
      content: chatInput,
      timestamp: new Date(),
      type: 'chat'
    }];

    chatInput = '';

    // Scroll to bottom
    setTimeout(() => {
      if (chatContainerRef) {
        chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
      }
    }, 50);
  }

  function toggleReady() {
    players = players.map(p =>
      p.id === currentPlayerId ? { ...p, isReady: !p.isReady } : p
    );
  }

  function startGame() {
    // Navigate to game/scenario
    console.log('Starting game...');
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  onMount(() => {
    gsap.from(containerRef, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    });

    // Animate player cards
    gsap.from('.player-card', {
      opacity: 0,
      x: -20,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    });
  });

  const currentPlayer = $derived(players.find(p => p.id === currentPlayerId));
  const isHost = $derived(currentPlayer?.isHost || false);
  const allReady = $derived(players.length > 0 && players.every(p => p.isReady));
</script>

<svelte:head>
  <title>Multiplayer Lobby | The Arcane Codex</title>
</svelte:head>

<main bind:this={containerRef} class="min-h-screen p-4 md:p-6 lg:p-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <a href="/" class="btn btn-ghost text-arcane-parchment-dim hover:text-arcane-gold">
      <ArrowLeft size={20} />
      <span class="ml-2 hidden sm:inline">Leave Party</span>
    </a>

    <div class="text-center">
      <h1 class="text-2xl md:text-3xl font-display text-gradient-gold">
        Party Lobby
      </h1>
    </div>

    <button
      onclick={() => showSettingsModal = true}
      class="btn btn-ghost text-arcane-parchment-dim hover:text-arcane-gold"
    >
      <Settings size={20} />
    </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
    <!-- Left Column: Party Info & Players -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Party Code Card -->
      <Card variant="bordered" padding="md">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-arcane-gold/10 flex items-center justify-center">
              <Users size={20} class="text-arcane-gold" />
            </div>
            <div>
              <p class="text-xs text-arcane-parchment-dim font-mono">PARTY CODE</p>
              <p class="text-xl font-mono text-arcane-gold tracking-wider">{partyCode}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onclick={copyPartyCode}
          >
            {#if copied}
              <Check size={16} class="mr-2" />
              Copied!
            {:else}
              <Copy size={16} class="mr-2" />
              Copy Code
            {/if}
          </Button>
        </div>
      </Card>

      <!-- Players List -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-heading text-lg text-arcane-parchment">
            Party Members
          </h2>
          <Badge variant="neutral">{players.length} / 4</Badge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each players as player}
            {@const Icon = classIcons[player.class]}
            <Card
              variant={player.isReady ? 'glow' : 'default'}
              padding="md"
              class="player-card"
            >
              <div class="flex items-start gap-3">
                <Avatar
                  initials={player.name.slice(0, 2)}
                  size="lg"
                  status={player.status}
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-heading text-arcane-parchment truncate">
                      {player.name}
                    </h3>
                    {#if player.isHost}
                      <Crown size={14} class="text-arcane-gold flex-shrink-0" />
                    {/if}
                  </div>

                  <div class="flex items-center gap-2 mt-1">
                    <Icon size={14} class={classColors[player.class]} />
                    <span class="text-sm text-arcane-parchment-dim capitalize">
                      {player.class}
                    </span>
                    <Badge variant="neutral" size="sm">Lv.{player.level}</Badge>
                  </div>

                  <div class="mt-2">
                    {#if player.isReady}
                      <Badge variant="gold" size="sm">
                        <Shield size={12} class="mr-1" />
                        Ready
                      </Badge>
                    {:else}
                      <Badge variant="neutral" outline size="sm">Not Ready</Badge>
                    {/if}
                  </div>
                </div>
              </div>
            </Card>
          {/each}

          <!-- Empty Slots -->
          {#each Array(4 - players.length) as _, i}
            <Card variant="default" padding="md" class="player-card border-dashed opacity-50">
              <div class="flex items-center justify-center h-24 text-arcane-parchment-dim">
                <Users size={24} class="mr-2" />
                <span class="font-body">Waiting for player...</span>
              </div>
            </Card>
          {/each}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <Button
          variant={currentPlayer?.isReady ? 'secondary' : 'primary'}
          size="lg"
          onclick={toggleReady}
          class="flex-1"
        >
          {#if currentPlayer?.isReady}
            <span>Cancel Ready</span>
          {:else}
            <Shield size={20} class="mr-2" />
            <span>Ready Up</span>
          {/if}
        </Button>

        {#if isHost}
          <Button
            variant="primary"
            size="lg"
            disabled={!allReady || players.length < 1}
            onclick={startGame}
            class="flex-1"
          >
            <Sword size={20} class="mr-2" />
            <span>Begin Adventure</span>
          </Button>
        {/if}
      </div>
    </div>

    <!-- Right Column: Chat -->
    <div class="lg:col-span-1">
      <Card variant="elevated" padding="none" class="h-[500px] flex flex-col">
        <!-- Chat Header -->
        <div class="p-4 border-b border-arcane-gold/20">
          <div class="flex items-center gap-2">
            <MessageCircle size={18} class="text-arcane-gold" />
            <h2 class="font-heading text-arcane-parchment">Party Chat</h2>
          </div>
        </div>

        <!-- Messages -->
        <div
          bind:this={chatContainerRef}
          class="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {#each messages as message}
            <div class="flex flex-col">
              {#if message.type === 'system'}
                <p class="text-xs text-arcane-cyan text-center italic">
                  {message.content}
                </p>
              {:else}
                <div class="flex items-start gap-2">
                  <Avatar
                    initials={message.playerName.slice(0, 1)}
                    size="sm"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline gap-2">
                      <span class="text-sm font-heading text-arcane-gold">
                        {message.playerName}
                      </span>
                      <span class="text-xs text-arcane-parchment-dim">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p class="text-sm text-arcane-parchment break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Chat Input -->
        <div class="p-4 border-t border-arcane-gold/20">
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={chatInput}
              onkeypress={handleKeyPress}
              placeholder="Type a message..."
              class="input input-sm flex-1 bg-arcane-surface border-arcane-gold/20 text-arcane-parchment placeholder:text-arcane-parchment-dim/50 focus:border-arcane-gold focus:outline-none"
            />
            <button
              onclick={sendMessage}
              disabled={!chatInput.trim()}
              class="btn btn-sm btn-square bg-arcane-gold hover:bg-arcane-gold-light text-arcane-void disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</main>

<!-- Settings Modal -->
<Modal bind:open={showSettingsModal} title="Party Settings" size="md">
  <div class="space-y-4">
    <div>
      <label class="label">
        <span class="label-text text-arcane-parchment">Difficulty</span>
      </label>
      <div class="flex gap-2">
        <Button variant={lobby ? 'primary' : 'ghost'} size="sm">Normal</Button>
        <Button variant="ghost" size="sm">Hard</Button>
        <Button variant="ghost" size="sm">Nightmare</Button>
      </div>
    </div>

    <div>
      <label class="label">
        <span class="label-text text-arcane-parchment">Max Players</span>
      </label>
      <div class="flex gap-2">
        {#each [2, 3, 4] as num}
          <button
            class="btn btn-sm {num === 4 ? 'btn-primary' : 'btn-ghost'}"
          >
            {num}
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="ghost" onclick={() => showSettingsModal = false}>Close</Button>
  {/snippet}
</Modal>
