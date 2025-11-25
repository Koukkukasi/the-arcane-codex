import { h as head, e as ensure_array_like } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import { h as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { w as writable } from "../../../../chunks/index.js";
import { C as Card } from "../../../../chunks/MagicCircle.svelte_svelte_type_style_lang.js";
import { P as ProgressBar } from "../../../../chunks/ProgressBar.js";
import "pixi.js";
import { A as Arrow_left } from "../../../../chunks/arrow-left.js";
const initialState = {
  step: "interrogation",
  name: "",
  selectedClass: null,
  stats: {
    strength: 10,
    agility: 10,
    intelligence: 10,
    willpower: 10,
    charisma: 10,
    perception: 10
  },
  appearance: {
    portrait: "",
    background: ""
  },
  answers: /* @__PURE__ */ new Map()
};
function createCharacterStore() {
  const { subscribe, set, update } = writable(initialState);
  return {
    subscribe,
    reset: () => set(initialState),
    setStep: (step) => update((s) => ({ ...s, step })),
    setName: (name) => update((s) => ({ ...s, name })),
    selectClass: (cls) => update((s) => ({ ...s, selectedClass: cls })),
    updateStats: (stats) => update((s) => ({ ...s, stats: { ...s.stats, ...stats } })),
    addAnswer: (questionId, answer) => update((s) => {
      const answers = new Map(s.answers);
      answers.set(questionId, answer);
      return { ...s, answers };
    }),
    setAppearance: (appearance) => update((s) => ({ ...s, appearance: { ...s.appearance, ...appearance } }))
  };
}
createCharacterStore();
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentQuestion = 0;
    const questions = [
      {
        id: "conflict",
        text: "A stranger blocks your path, blade drawn. What is your first instinct?",
        answers: [
          {
            text: "Meet steel with steel. Honor demands no less.",
            weights: { warrior: 2, berserker: 1 }
          },
          {
            text: "Study them. Every movement reveals weakness.",
            weights: { rogue: 2, mage: 1 }
          },
          {
            text: "Words are sharper than swords. Negotiate.",
            weights: { healer: 1, summoner: 2 }
          },
          {
            text: "Call upon powers beyond their comprehension.",
            weights: { mage: 2, summoner: 1 }
          }
        ]
      },
      {
        id: "power",
        text: "What price would you pay for ultimate power?",
        answers: [
          {
            text: "My body. Let it be forged in flame and fury.",
            weights: { warrior: 2, berserker: 2 }
          },
          {
            text: "My sanity. Knowledge transcends mortal concerns.",
            weights: { mage: 2, summoner: 1 }
          },
          {
            text: "Nothing. Power taken is power corrupted.",
            weights: { healer: 2, rogue: 1 }
          },
          {
            text: "Everything. I have already lost all that mattered.",
            weights: { berserker: 2, summoner: 1 }
          }
        ]
      },
      {
        id: "ally",
        text: "Your companion lies wounded. The enemy approaches. You have moments.",
        answers: [
          {
            text: "Stand between them and death. Hold the line.",
            weights: { warrior: 2, healer: 1 }
          },
          {
            text: "Pour my essence into them. They must survive.",
            weights: { healer: 2, summoner: 1 }
          },
          {
            text: "Strike from shadow. End this before more blood spills.",
            weights: { rogue: 2, warrior: 1 }
          },
          {
            text: "Let the spirits feast on our enemies' fear.",
            weights: { summoner: 2, berserker: 1 }
          }
        ]
      },
      {
        id: "fear",
        text: "What do you fear most?",
        answers: [
          {
            text: "Being forgotten. A warrior's death means nothing without glory.",
            weights: { warrior: 2, berserker: 1 }
          },
          {
            text: "Ignorance. There is always more to know.",
            weights: { mage: 2, summoner: 1 }
          },
          {
            text: "Failure. Those who depend on me cannot afford my weakness.",
            weights: { healer: 2, rogue: 1 }
          },
          {
            text: "Nothing. I have seen the abyss, and it flinched first.",
            weights: { berserker: 2, rogue: 1 }
          }
        ]
      },
      {
        id: "artifact",
        text: "A forbidden artifact calls to you. It offers power at a terrible cost. You...",
        answers: [
          {
            text: "Destroy it. Some powers should remain sealed.",
            weights: { warrior: 1, healer: 2 }
          },
          {
            text: "Study it first. Understanding precedes judgment.",
            weights: { mage: 2, rogue: 1 }
          },
          {
            text: "Take it. Power is meant to be wielded.",
            weights: { summoner: 2, berserker: 1 }
          },
          {
            text: "Sell it. Let another bear the burden.",
            weights: { rogue: 2, summoner: 1 }
          }
        ]
      }
    ];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("tnp2w9", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Create Character | The Arcane Codex</title>`);
        });
      });
      $$renderer3.push(`<main class="min-h-screen p-4 md:p-8 flex flex-col"><div class="flex items-center justify-between mb-8"><a href="/" class="btn btn-ghost text-arcane-parchment-dim hover:text-arcane-gold">`);
      Arrow_left($$renderer3, { size: 20 });
      $$renderer3.push(`<!----> <span class="ml-2">Back</span></a> <div class="text-center"><h1 class="text-2xl md:text-3xl font-display text-gradient-gold">`);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`The Interrogation`);
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></h1></div> <div class="w-24">`);
      ProgressBar($$renderer3, {
        value: 25,
        variant: "gold",
        size: "sm"
      });
      $$renderer3.push(`<!----></div></div> <div class="flex-1 flex items-center justify-center">`);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="w-full max-w-2xl">`);
        Card($$renderer3, {
          variant: "elevated",
          padding: "lg",
          class: "arcane-panel",
          children: ($$renderer4) => {
            $$renderer4.push(`<p class="text-arcane-parchment-dim text-sm font-mono mb-2">Question ${escape_html(currentQuestion + 1)} of ${escape_html(questions.length)}</p> <h2 class="text-xl md:text-2xl font-heading text-arcane-parchment mb-8">${escape_html(questions[currentQuestion].text)}</h2> <div class="space-y-3"><!--[-->`);
            const each_array = ensure_array_like(questions[currentQuestion].answers);
            for (let i = 0, $$length = each_array.length; i < $$length; i++) {
              let answer = each_array[i];
              $$renderer4.push(`<button class="w-full text-left p-4 rounded-lg bg-arcane-surface border border-arcane-gold/10 hover:border-arcane-gold/50 hover:bg-arcane-elevated transition-all duration-300 text-arcane-parchment font-body">${escape_html(answer.text)}</button>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          }
        });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></main>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
