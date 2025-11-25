<script lang="ts">
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';
  import { Button, Card, Badge, Avatar } from '$lib/components';
  import { BookOpen, Users, Sword, MessageSquare, ChevronRight, Sparkles, Clock } from 'lucide-svelte';

  interface Choice {
    id: string;
    text: string;
    type: 'action' | 'dialogue' | 'investigate' | 'combat';
    consequence?: string;
    votes?: number;
  }

  interface StorySegment {
    id: string;
    narrative: string;
    setting?: string;
    choices: Choice[];
    isAIGenerating?: boolean;
  }

  interface PartyMember {
    id: string;
    name: string;
    class: string;
    vote?: string;
  }

  let containerRef: HTMLElement;
  let narrativeRef: HTMLElement;

  // Mock data
  let currentSegment = $state<StorySegment>({
    id: '1',
    setting: 'The Whispering Crypts',
    narrative: `The ancient stone doors grind open, releasing centuries of stale air. Before you stretches a corridor of impossible length, its walls adorned with faded murals depicting the fall of an empire whose name has been lost to time.

Phosphorescent fungi cling to the ceiling, casting an ethereal blue glow that dances with shadows. At the far end, you can barely make out a massive archway, beyond which something pulses with a sickly golden light.

Your footsteps echo unnaturally—each sound seems to return to you distorted, as if the crypt itself is whispering secrets in a language older than words.

*What does your party do?*`,
    choices: [
      { id: 'c1', text: 'Proceed cautiously, weapons ready. The light ahead may be a trap.', type: 'action', votes: 2 },
      { id: 'c2', text: 'Examine the murals closely. Their story may hold clues about what awaits.', type: 'investigate', votes: 1 },
      { id: 'c3', text: 'Send a familiar or scout ahead to assess the danger.', type: 'action', votes: 0 },
      { id: 'c4', text: 'Call out. If something dwells here, better to meet it on your terms.', type: 'dialogue', votes: 0 }
    ],
    isAIGenerating: false
  });

  let partyMembers = $state<PartyMember[]>([
    { id: 'p1', name: 'Aetherion', class: 'mage', vote: 'c1' },
    { id: 'p2', name: 'Shadowmere', class: 'rogue', vote: 'c1' },
    { id: 'p3', name: 'Grimholt', class: 'warrior', vote: 'c2' },
    { id: 'p4', name: 'You', class: 'healer', vote: undefined }
  ]);

  let selectedChoice = $state<string | null>(null);
  let isGenerating = $state(false);
  let votingTimeLeft = $state(45);
  let historyExpanded = $state(false);

  const previousSegments: StorySegment[] = [
    {
      id: '0',
      setting: 'The Village of Ashenmoor',
      narrative: 'Your journey began in the plague-touched village of Ashenmoor...',
      choices: []
    }
  ];

  const choiceIcons = {
    action: Sword,
    dialogue: MessageSquare,
    investigate: BookOpen,
    combat: Sword
  };

  function selectChoice(choiceId: string) {
    selectedChoice = choiceId;
    partyMembers = partyMembers.map(p =>
      p.id === 'p4' ? { ...p, vote: choiceId } : p
    );

    // Update vote counts
    currentSegment = {
      ...currentSegment,
      choices: currentSegment.choices.map(c => ({
        ...c,
        votes: partyMembers.filter(p => p.vote === c.id).length
      }))
    };

    // Animate selection
    gsap.to(`[data-choice="${choiceId}"]`, {
      scale: 1.02,
      duration: 0.2,
      ease: 'back.out(2)'
    });
  }

  function confirmChoice() {
    if (!selectedChoice) return;

    isGenerating = true;

    // Simulate AI generating next segment
    setTimeout(() => {
      // Animate out current narrative
      gsap.to(narrativeRef, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          // Update to new segment
          currentSegment = {
            id: '2',
            setting: 'The Hall of Echoes',
            narrative: `Acting on your collective decision, the party advances toward the pulsing light. The murals seem to shift as you pass, their painted eyes following your movement.

As you near the archway, the whispers coalesce into coherent words—fragments of warning in the old tongue. Aetherion's eyes widen with recognition.

"It's a ward," the mage breathes. "This entire corridor is a containment circle. Whatever lies beyond... it was meant to stay there."

But it is too late. The golden light flares, and the archway reveals not a chamber, but a tear in reality itself. Through it, you glimpse impossible geometries and a presence that defies comprehension.

**A voice thunders in your minds:**
*"At last... new vessels to carry my message to the waking world."*

Roll for Will saves.`,
            choices: [
              { id: 'c5', text: 'Steel your mind against the intrusion. You will not be puppets.', type: 'action', votes: 0 },
              { id: 'c6', text: 'Attempt to close the rift with combined magical force.', type: 'action', votes: 0 },
              { id: 'c7', text: 'Speak to the entity. Perhaps it can be reasoned with.', type: 'dialogue', votes: 0 },
              { id: 'c8', text: 'Flee back through the corridor before the ward fully collapses.', type: 'action', votes: 0 }
            ],
            isAIGenerating: false
          };

          // Reset state
          selectedChoice = null;
          partyMembers = partyMembers.map(p => ({ ...p, vote: undefined }));
          isGenerating = false;

          // Animate in new narrative
          gsap.fromTo(narrativeRef,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
          );
        }
      });
    }, 2000);
  }

  onMount(() => {
    gsap.from(containerRef, {
      opacity: 0,
      duration: 0.5
    });

    gsap.from(narrativeRef, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out'
    });

    gsap.from('.choice-card', {
      opacity: 0,
      x: 30,
      duration: 0.4,
      stagger: 0.1,
      delay: 0.5,
      ease: 'power2.out'
    });

    // Voting countdown
    const timer = setInterval(() => {
      if (votingTimeLeft > 0) {
        votingTimeLeft--;
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  const winningChoice = $derived(
    currentSegment.choices.reduce((a, b) => (a.votes || 0) > (b.votes || 0) ? a : b)
  );
</script>

<svelte:head>
  <title>Scenario | The Arcane Codex</title>
</svelte:head>

<main bind:this={containerRef} class="min-h-screen flex flex-col">
  <!-- Header -->
  <div class="bg-arcane-elevated border-b border-arcane-gold/20 p-4">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <BookOpen size={20} class="text-arcane-gold" />
        <div>
          <p class="text-xs text-arcane-parchment-dim font-mono">CHAPTER I</p>
          <h1 class="font-heading text-arcane-gold">{currentSegment.setting}</h1>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <Clock size={16} class="text-arcane-gold" />
          <span class="font-mono text-arcane-parchment">{votingTimeLeft}s</span>
        </div>

        <div class="flex -space-x-2">
          {#each partyMembers as member}
            <Avatar
              initials={member.name.slice(0, 1)}
              size="sm"
              status={member.vote ? 'online' : 'away'}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-y-auto">
    <div class="max-w-5xl mx-auto p-4 md:p-8">
      <!-- Narrative -->
      <div bind:this={narrativeRef}>
      <Card
        variant="elevated"
        padding="lg"
        class="mb-8 arcane-panel"
      >
        <div class="prose prose-invert prose-gold max-w-none">
          {#each currentSegment.narrative.split('\n\n') as paragraph}
            <p class="text-arcane-parchment font-body leading-relaxed whitespace-pre-wrap">
              {@html paragraph
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-arcane-gold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="text-arcane-parchment-dim">$1</em>')}
            </p>
          {/each}
        </div>

        {#if isGenerating}
          <div class="mt-6 flex items-center justify-center gap-3 text-arcane-gold">
            <Sparkles size={20} class="animate-pulse" />
            <span class="font-body">The Arcane Codex is weaving reality...</span>
          </div>
        {/if}
      </Card>
      </div>

      <!-- Choices -->
      {#if !isGenerating}
        <div class="space-y-3">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-heading text-arcane-parchment">What will you do?</h2>
            <p class="text-sm text-arcane-parchment-dim">
              {partyMembers.filter(p => p.vote).length}/{partyMembers.length} voted
            </p>
          </div>

          {#each currentSegment.choices as choice}
            {@const Icon = choiceIcons[choice.type]}
            {@const isSelected = selectedChoice === choice.id}
            {@const isWinning = choice.id === winningChoice.id && (choice.votes || 0) > 0}
            <button
              data-choice={choice.id}
              onclick={() => selectChoice(choice.id)}
              class="choice-card w-full text-left transition-all duration-200"
            >
              <Card
                variant={isSelected ? 'glow' : 'bordered'}
                padding="md"
                class={isSelected ? 'ring-2 ring-arcane-gold' : isWinning ? 'border-arcane-gold/50' : ''}
              >
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center
                    {isSelected ? 'bg-arcane-gold text-arcane-void' : 'bg-arcane-surface text-arcane-gold'}">
                    <Icon size={20} />
                  </div>

                  <div class="flex-1">
                    <p class="text-arcane-parchment font-body">{choice.text}</p>

                    {#if (choice.votes || 0) > 0}
                      <div class="flex items-center gap-2 mt-2">
                        <div class="flex -space-x-1">
                          {#each partyMembers.filter(p => p.vote === choice.id) as voter}
                            <Avatar
                              initials={voter.name.slice(0, 1)}
                              size="sm"
                            />
                          {/each}
                        </div>
                        <Badge variant={isWinning ? 'gold' : 'neutral'} size="sm">
                          {choice.votes} {choice.votes === 1 ? 'vote' : 'votes'}
                        </Badge>
                      </div>
                    {/if}
                  </div>

                  <ChevronRight
                    size={20}
                    class="text-arcane-parchment-dim {isSelected ? 'text-arcane-gold' : ''}"
                  />
                </div>
              </Card>
            </button>
          {/each}

          <!-- Confirm Button -->
          <div class="flex justify-end mt-6">
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedChoice}
              onclick={confirmChoice}
            >
              <Sparkles size={18} class="mr-2" />
              Confirm Choice
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Party Status Bar -->
  <div class="bg-arcane-elevated border-t border-arcane-gold/20 p-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex gap-4">
        {#each partyMembers as member}
          <div class="flex items-center gap-2 text-sm">
            <Avatar initials={member.name.slice(0, 1)} size="sm" />
            <div>
              <p class="font-heading text-arcane-parchment text-xs">{member.name}</p>
              <p class="text-arcane-parchment-dim text-xs capitalize">{member.class}</p>
            </div>
            {#if member.vote}
              <Badge variant="gold" size="sm">Voted</Badge>
            {/if}
          </div>
        {/each}
      </div>

      <div class="flex items-center gap-2">
        <Users size={16} class="text-arcane-parchment-dim" />
        <span class="text-sm text-arcane-parchment-dim">
          {partyMembers.length} adventurers
        </span>
      </div>
    </div>
  </div>
</main>

<style>
  .prose-gold :global(strong) {
    color: #C9A227;
  }
</style>
