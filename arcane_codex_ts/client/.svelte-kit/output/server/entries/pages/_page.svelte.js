import { h as head } from "../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>The Arcane Codex</title>`);
      });
    });
    $$renderer2.push(`<main class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"><canvas class="particle-container"></canvas> <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,162,39,0.1)_0%,_transparent_70%)]"></div> <div class="relative z-10 text-center px-4"><h1 class="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-gradient-gold mb-4 text-shadow-arcane">The Arcane Codex</h1> <p class="text-lg md:text-xl text-arcane-parchment-dim mb-12 font-body tracking-wide">Unravel the mysteries. Shape your destiny.</p> <div class="flex flex-col gap-4 w-72 mx-auto"><a href="/character/create" class="btn btn-lg bg-arcane-gold hover:bg-arcane-gold-light text-arcane-void font-heading tracking-wider arcane-glow">New Adventure</a> <a href="/lobby" class="btn btn-lg btn-outline border-arcane-gold text-arcane-gold hover:bg-arcane-gold hover:text-arcane-void font-heading tracking-wider">Multiplayer</a> <a href="/continue" class="btn btn-lg bg-arcane-surface hover:bg-arcane-elevated text-arcane-parchment font-heading tracking-wider border border-arcane-gold/30">Continue Journey</a> <button class="btn btn-lg bg-transparent hover:bg-arcane-surface text-arcane-parchment-dim hover:text-arcane-parchment font-heading tracking-wider border border-arcane-surface hover:border-arcane-gold/30 mt-4">Settings</button></div></div> <div class="absolute bottom-8 left-1/2 -translate-x-1/2"><div class="flex items-center gap-4 text-arcane-gold/50"><div class="w-16 h-px bg-gradient-to-r from-transparent to-arcane-gold/50"></div> <span class="text-xs font-mono uppercase tracking-widest">Est. MMXXIV</span> <div class="w-16 h-px bg-gradient-to-l from-transparent to-arcane-gold/50"></div></div></div></main>`);
  });
}
export {
  _page as default
};
