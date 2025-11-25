<script lang="ts">
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { characterCreation, availableClasses, type CharacterClass } from '$lib/stores/character';
  import { Button, Card, Input, Badge, ProgressBar } from '$lib/components';
  import { ArrowLeft, ArrowRight, Sword, Wand2, Ghost, Heart, BookOpen, Skull } from 'lucide-svelte';

  let currentStep = $state<'interrogation' | 'class-select' | 'customize' | 'confirm'>('interrogation');
  let selectedClass = $state<CharacterClass | null>(null);
  let characterName = $state('');
  let currentQuestion = $state(0);
  let containerRef: HTMLElement;

  // Interrogation questions for determining suggested class
  const questions = [
    {
      id: 'conflict',
      text: 'A stranger blocks your path, blade drawn. What is your first instinct?',
      answers: [
        { text: 'Meet steel with steel. Honor demands no less.', weights: { warrior: 2, berserker: 1 } },
        { text: 'Study them. Every movement reveals weakness.', weights: { rogue: 2, mage: 1 } },
        { text: 'Words are sharper than swords. Negotiate.', weights: { healer: 1, summoner: 2 } },
        { text: 'Call upon powers beyond their comprehension.', weights: { mage: 2, summoner: 1 } }
      ]
    },
    {
      id: 'power',
      text: 'What price would you pay for ultimate power?',
      answers: [
        { text: 'My body. Let it be forged in flame and fury.', weights: { warrior: 2, berserker: 2 } },
        { text: 'My sanity. Knowledge transcends mortal concerns.', weights: { mage: 2, summoner: 1 } },
        { text: 'Nothing. Power taken is power corrupted.', weights: { healer: 2, rogue: 1 } },
        { text: 'Everything. I have already lost all that mattered.', weights: { berserker: 2, summoner: 1 } }
      ]
    },
    {
      id: 'ally',
      text: 'Your companion lies wounded. The enemy approaches. You have moments.',
      answers: [
        { text: 'Stand between them and death. Hold the line.', weights: { warrior: 2, healer: 1 } },
        { text: 'Pour my essence into them. They must survive.', weights: { healer: 2, summoner: 1 } },
        { text: 'Strike from shadow. End this before more blood spills.', weights: { rogue: 2, warrior: 1 } },
        { text: 'Let the spirits feast on our enemies\' fear.', weights: { summoner: 2, berserker: 1 } }
      ]
    },
    {
      id: 'fear',
      text: 'What do you fear most?',
      answers: [
        { text: 'Being forgotten. A warrior\'s death means nothing without glory.', weights: { warrior: 2, berserker: 1 } },
        { text: 'Ignorance. There is always more to know.', weights: { mage: 2, summoner: 1 } },
        { text: 'Failure. Those who depend on me cannot afford my weakness.', weights: { healer: 2, rogue: 1 } },
        { text: 'Nothing. I have seen the abyss, and it flinched first.', weights: { berserker: 2, rogue: 1 } }
      ]
    },
    {
      id: 'artifact',
      text: 'A forbidden artifact calls to you. It offers power at a terrible cost. You...',
      answers: [
        { text: 'Destroy it. Some powers should remain sealed.', weights: { warrior: 1, healer: 2 } },
        { text: 'Study it first. Understanding precedes judgment.', weights: { mage: 2, rogue: 1 } },
        { text: 'Take it. Power is meant to be wielded.', weights: { summoner: 2, berserker: 1 } },
        { text: 'Sell it. Let another bear the burden.', weights: { rogue: 2, summoner: 1 } }
      ]
    }
  ];

  let answers = $state<{ questionId: string; answerIndex: number }[]>([]);

  const classIcons = {
    warrior: Sword,
    mage: Wand2,
    rogue: Ghost,
    healer: Heart,
    summoner: BookOpen,
    berserker: Skull
  };

  function calculateSuggestedClass(): CharacterClass | null {
    const scores: Record<string, number> = {
      warrior: 0,
      mage: 0,
      rogue: 0,
      healer: 0,
      summoner: 0,
      berserker: 0
    };

    answers.forEach(({ questionId, answerIndex }) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const weights = question.answers[answerIndex].weights;
        Object.entries(weights).forEach(([cls, weight]) => {
          scores[cls] = (scores[cls] || 0) + weight;
        });
      }
    });

    const topClass = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return availableClasses.find(c => c.id === topClass[0]) || null;
  }

  function selectAnswer(questionId: string, answerIndex: number) {
    answers = [...answers.filter(a => a.questionId !== questionId), { questionId, answerIndex }];

    if (currentQuestion < questions.length - 1) {
      gsap.to(containerRef, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        onComplete: () => {
          currentQuestion++;
          gsap.fromTo(containerRef,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.3 }
          );
        }
      });
    } else {
      // All questions answered, show class select
      const suggested = calculateSuggestedClass();
      if (suggested) {
        selectedClass = suggested;
      }
      transitionToStep('class-select');
    }
  }

  function transitionToStep(step: typeof currentStep) {
    gsap.to(containerRef, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        currentStep = step;
        gsap.fromTo(containerRef,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });
  }

  function selectClass(cls: CharacterClass) {
    selectedClass = cls;
    gsap.to(`[data-class="${cls.id}"]`, {
      scale: 1.05,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });
  }

  function confirmClass() {
    if (selectedClass) {
      characterCreation.selectClass(selectedClass);
      transitionToStep('customize');
    }
  }

  function confirmCharacter() {
    if (characterName && selectedClass) {
      characterCreation.setName(characterName);
      // Navigate to lobby or game
      goto('/lobby');
    }
  }

  onMount(() => {
    gsap.from(containerRef, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
</script>

<svelte:head>
  <title>Create Character | The Arcane Codex</title>
</svelte:head>

<main class="min-h-screen p-4 md:p-8 flex flex-col">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <a href="/" class="btn btn-ghost text-arcane-parchment-dim hover:text-arcane-gold">
      <ArrowLeft size={20} />
      <span class="ml-2">Back</span>
    </a>

    <div class="text-center">
      <h1 class="text-2xl md:text-3xl font-display text-gradient-gold">
        {#if currentStep === 'interrogation'}The Interrogation{/if}
        {#if currentStep === 'class-select'}Choose Your Path{/if}
        {#if currentStep === 'customize'}Name Your Character{/if}
        {#if currentStep === 'confirm'}Confirm Creation{/if}
      </h1>
    </div>

    <div class="w-24">
      <!-- Progress indicator -->
      <ProgressBar
        value={
          currentStep === 'interrogation' ? 25 :
          currentStep === 'class-select' ? 50 :
          currentStep === 'customize' ? 75 : 100
        }
        variant="gold"
        size="sm"
      />
    </div>
  </div>

  <!-- Content -->
  <div bind:this={containerRef} class="flex-1 flex items-center justify-center">
    {#if currentStep === 'interrogation'}
      <!-- Interrogation Questions -->
      <div class="w-full max-w-2xl">
        <Card variant="elevated" padding="lg" class="arcane-panel">
          <p class="text-arcane-parchment-dim text-sm font-mono mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>

          <h2 class="text-xl md:text-2xl font-heading text-arcane-parchment mb-8">
            {questions[currentQuestion].text}
          </h2>

          <div class="space-y-3">
            {#each questions[currentQuestion].answers as answer, i}
              <button
                onclick={() => selectAnswer(questions[currentQuestion].id, i)}
                class="w-full text-left p-4 rounded-lg bg-arcane-surface border border-arcane-gold/10 hover:border-arcane-gold/50 hover:bg-arcane-elevated transition-all duration-300 text-arcane-parchment font-body"
              >
                {answer.text}
              </button>
            {/each}
          </div>
        </Card>
      </div>
    {/if}

    {#if currentStep === 'class-select'}
      <!-- Class Selection -->
      <div class="w-full max-w-5xl">
        {#if selectedClass}
          <div class="text-center mb-6">
            <p class="text-arcane-parchment-dim font-body">
              Based on your answers, we suggest:
            </p>
            <Badge variant="gold" size="lg" class="mt-2">{selectedClass.name}</Badge>
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each availableClasses as cls}
            {@const Icon = classIcons[cls.id as keyof typeof classIcons]}
            <button
              data-class={cls.id}
              onclick={() => selectClass(cls)}
              class="text-left"
            >
              <Card
                variant={selectedClass?.id === cls.id ? 'glow' : 'bordered'}
                padding="md"
                hoverable
                class={selectedClass?.id === cls.id ? 'ring-2 ring-arcane-gold' : ''}
              >
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-lg bg-arcane-gold/10 flex items-center justify-center text-arcane-gold">
                    <Icon size={24} />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-heading text-lg text-arcane-gold">{cls.name}</h3>
                    <p class="text-sm text-arcane-parchment-dim mt-1">{cls.description}</p>

                    <div class="flex gap-2 mt-3">
                      {#each cls.primaryStats as stat}
                        <Badge variant="neutral" size="sm">{stat}</Badge>
                      {/each}
                    </div>
                  </div>
                </div>

                {#if selectedClass?.id === cls.id}
                  <div class="mt-4 pt-4 border-t border-arcane-gold/20">
                    <p class="text-sm text-arcane-parchment-dim italic">{cls.lore}</p>
                    <div class="mt-3">
                      <p class="text-xs text-arcane-gold font-mono mb-2">ABILITIES</p>
                      <div class="flex flex-wrap gap-2">
                        {#each cls.abilities as ability}
                          <Badge variant="cyan" outline size="sm">{ability}</Badge>
                        {/each}
                      </div>
                    </div>
                  </div>
                {/if}
              </Card>
            </button>
          {/each}
        </div>

        <div class="flex justify-center mt-8">
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedClass}
            onclick={confirmClass}
          >
            <span>Continue with {selectedClass?.name || 'Selection'}</span>
            <ArrowRight size={20} class="ml-2" />
          </Button>
        </div>
      </div>
    {/if}

    {#if currentStep === 'customize'}
      <!-- Character Name -->
      <div class="w-full max-w-md">
        <Card variant="elevated" padding="lg" class="arcane-panel">
          <div class="text-center mb-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-arcane-gold/10 flex items-center justify-center text-arcane-gold mb-4">
              {#if selectedClass}
                {@const Icon = classIcons[selectedClass.id as keyof typeof classIcons]}
                <Icon size={40} />
              {/if}
            </div>
            <Badge variant="gold">{selectedClass?.name}</Badge>
          </div>

          <Input
            label="What shall you be called?"
            placeholder="Enter your name..."
            bind:value={characterName}
          />

          <p class="text-xs text-arcane-parchment-dim mt-4 text-center">
            Choose wisely. Your name will echo through the halls of the Codex.
          </p>

          <div class="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onclick={() => transitionToStep('class-select')}
              class="flex-1"
            >
              <ArrowLeft size={16} class="mr-2" />
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!characterName || characterName.length < 2}
              onclick={confirmCharacter}
              class="flex-1"
            >
              Begin Journey
              <ArrowRight size={16} class="ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    {/if}
  </div>
</main>
