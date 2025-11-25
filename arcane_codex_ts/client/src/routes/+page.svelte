<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let titleRef: HTMLElement;
  let subtitleRef: HTMLElement;
  let buttonsRef: HTMLElement;
  let particleCanvas: HTMLCanvasElement;

  onMount(() => {
    // Title animation
    const tl = gsap.timeline();

    tl.from(titleRef, {
      y: -50,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
    .from(subtitleRef, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4')
    .from(buttonsRef.children, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'back.out(1.7)'
    }, '-=0.3');

    // Floating animation for title
    gsap.to(titleRef, {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Simple particle effect with canvas
    if (particleCanvas) {
      initParticles(particleCanvas);
    }
  });

  function initParticles(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#C9A227', '#E8C547', '#4A90A4'];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        p.y -= p.speedY;
        p.opacity -= 0.001;

        if (p.y < 0 || p.opacity <= 0) {
          p.y = canvas.height;
          p.opacity = Math.random() * 0.5 + 0.2;
          p.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
</script>

<svelte:head>
  <title>The Arcane Codex</title>
</svelte:head>

<main class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
  <!-- Particle Background -->
  <canvas
    bind:this={particleCanvas}
    class="particle-container"
  ></canvas>

  <!-- Decorative background elements -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,39,0.1)_0%,_transparent_70%)]"></div>

  <!-- Main Content -->
  <div class="relative z-10 text-center px-4">
    <!-- Title -->
    <h1
      bind:this={titleRef}
      class="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-gradient-gold mb-4 text-shadow-arcane"
    >
      The Arcane Codex
    </h1>

    <!-- Subtitle -->
    <p
      bind:this={subtitleRef}
      class="text-lg md:text-xl text-arcane-parchment-dim mb-12 font-body tracking-wide"
    >
      Unravel the mysteries. Shape your destiny.
    </p>

    <!-- Menu Buttons -->
    <div bind:this={buttonsRef} class="flex flex-col gap-4 w-72 mx-auto">
      <a
        href="/character/create"
        class="btn btn-lg bg-arcane-gold hover:bg-arcane-gold-light text-arcane-void font-heading tracking-wider arcane-glow"
      >
        New Adventure
      </a>

      <a
        href="/lobby"
        class="btn btn-lg btn-outline border-arcane-gold text-arcane-gold hover:bg-arcane-gold hover:text-arcane-void font-heading tracking-wider"
      >
        Multiplayer
      </a>

      <a
        href="/continue"
        class="btn btn-lg bg-arcane-surface hover:bg-arcane-elevated text-arcane-parchment font-heading tracking-wider border border-arcane-gold/30"
      >
        Continue Journey
      </a>

      <button
        class="btn btn-lg bg-transparent hover:bg-arcane-surface text-arcane-parchment-dim hover:text-arcane-parchment font-heading tracking-wider border border-arcane-surface hover:border-arcane-gold/30 mt-4"
      >
        Settings
      </button>
    </div>
  </div>

  <!-- Bottom decorative element -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
    <div class="flex items-center gap-4 text-arcane-gold/50">
      <div class="w-16 h-px bg-gradient-to-r from-transparent to-arcane-gold/50"></div>
      <span class="text-xs font-mono uppercase tracking-widest">Est. MMXXIV</span>
      <div class="w-16 h-px bg-gradient-to-l from-transparent to-arcane-gold/50"></div>
    </div>
  </div>
</main>
