import { s as sanitize_props, a as spread_props, b as slot, h as head, e as ensure_array_like, c as attr, d as attr_class, g as stringify } from "../../../chunks/index2.js";
import { a as Book_open, A as Avatar, S as Sword, B as Button, U as Users } from "../../../chunks/Avatar.js";
import { I as Icon, C as Card } from "../../../chunks/MagicCircle.svelte_svelte_type_style_lang.js";
import { B as Badge } from "../../../chunks/Badge.js";
import "pixi.js";
import { C as Clock } from "../../../chunks/clock.js";
import { h as escape_html } from "../../../chunks/context.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function Chevron_right($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.511.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
  Icon($$renderer, spread_props([
    { name: "chevron-right" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronRight
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtOSAxOCA2LTYtNi02IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/chevron-right
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Message_square($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.511.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "message-square" },
    $$sanitized_props,
    {
      /**
       * @component @name MessageSquare
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTVhMiAyIDAgMCAxLTIgMkg3bC00IDRWNWEyIDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/message-square
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Sparkles($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.511.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
      }
    ],
    ["path", { "d": "M20 3v4" }],
    ["path", { "d": "M22 5h-4" }],
    ["path", { "d": "M4 17v2" }],
    ["path", { "d": "M5 18H3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "sparkles" },
    $$sanitized_props,
    {
      /**
       * @component @name Sparkles
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOS45MzcgMTUuNUEyIDIgMCAwIDAgOC41IDE0LjA2M2wtNi4xMzUtMS41ODJhLjUuNSAwIDAgMSAwLS45NjJMOC41IDkuOTM2QTIgMiAwIDAgMCA5LjkzNyA4LjVsMS41ODItNi4xMzVhLjUuNSAwIDAgMSAuOTYzIDBMMTQuMDYzIDguNUEyIDIgMCAwIDAgMTUuNSA5LjkzN2w2LjEzNSAxLjU4MWEuNS41IDAgMCAxIDAgLjk2NEwxNS41IDE0LjA2M2EyIDIgMCAwIDAtMS40MzcgMS40MzdsLTEuNTgyIDYuMTM1YS41LjUgMCAwIDEtLjk2MyAweiIgLz4KICA8cGF0aCBkPSJNMjAgM3Y0IiAvPgogIDxwYXRoIGQ9Ik0yMiA1aC00IiAvPgogIDxwYXRoIGQ9Ik00IDE3djIiIC8+CiAgPHBhdGggZD0iTTUgMThIMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/sparkles
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentSegment = {
      setting: "The Whispering Crypts",
      narrative: `The ancient stone doors grind open, releasing centuries of stale air. Before you stretches a corridor of impossible length, its walls adorned with faded murals depicting the fall of an empire whose name has been lost to time.

Phosphorescent fungi cling to the ceiling, casting an ethereal blue glow that dances with shadows. At the far end, you can barely make out a massive archway, beyond which something pulses with a sickly golden light.

Your footsteps echo unnaturally—each sound seems to return to you distorted, as if the crypt itself is whispering secrets in a language older than words.

*What does your party do?*`,
      choices: [
        {
          id: "c1",
          text: "Proceed cautiously, weapons ready. The light ahead may be a trap.",
          type: "action",
          votes: 2
        },
        {
          id: "c2",
          text: "Examine the murals closely. Their story may hold clues about what awaits.",
          type: "investigate",
          votes: 1
        },
        {
          id: "c3",
          text: "Send a familiar or scout ahead to assess the danger.",
          type: "action",
          votes: 0
        },
        {
          id: "c4",
          text: "Call out. If something dwells here, better to meet it on your terms.",
          type: "dialogue",
          votes: 0
        }
      ]
    };
    let partyMembers = [
      { id: "p1", name: "Aetherion", class: "mage", vote: "c1" },
      { id: "p2", name: "Shadowmere", class: "rogue", vote: "c1" },
      { id: "p3", name: "Grimholt", class: "warrior", vote: "c2" },
      { id: "p4", name: "You", class: "healer", vote: void 0 }
    ];
    let selectedChoice = null;
    let votingTimeLeft = 45;
    const choiceIcons = {
      action: Sword,
      dialogue: Message_square,
      investigate: Book_open,
      combat: Sword
    };
    function confirmChoice() {
      return;
    }
    const winningChoice = currentSegment.choices.reduce((a, b) => (a.votes || 0) > (b.votes || 0) ? a : b);
    head("1y9rctv", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Scenario | The Arcane Codex</title>`);
      });
    });
    $$renderer2.push(`<main class="min-h-screen flex flex-col"><div class="bg-arcane-elevated border-b border-arcane-gold/20 p-4"><div class="max-w-5xl mx-auto flex items-center justify-between"><div class="flex items-center gap-3">`);
    Book_open($$renderer2, { size: 20, class: "text-arcane-gold" });
    $$renderer2.push(`<!----> <div><p class="text-xs text-arcane-parchment-dim font-mono">CHAPTER I</p> <h1 class="font-heading text-arcane-gold">${escape_html(currentSegment.setting)}</h1></div></div> <div class="flex items-center gap-4"><div class="flex items-center gap-2 text-sm">`);
    Clock($$renderer2, { size: 16, class: "text-arcane-gold" });
    $$renderer2.push(`<!----> <span class="font-mono text-arcane-parchment">${escape_html(votingTimeLeft)}s</span></div> <div class="flex -space-x-2"><!--[-->`);
    const each_array = ensure_array_like(partyMembers);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let member = each_array[$$index];
      Avatar($$renderer2, {
        initials: member.name.slice(0, 1),
        size: "sm",
        status: member.vote ? "online" : "away"
      });
    }
    $$renderer2.push(`<!--]--></div></div></div></div> <div class="flex-1 overflow-y-auto"><div class="max-w-5xl mx-auto p-4 md:p-8"><div>`);
    Card($$renderer2, {
      variant: "elevated",
      padding: "lg",
      class: "mb-8 arcane-panel",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="prose prose-invert prose-gold max-w-none svelte-1y9rctv"><!--[-->`);
        const each_array_1 = ensure_array_like(currentSegment.narrative.split("\n\n"));
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let paragraph = each_array_1[$$index_1];
          $$renderer3.push(`<p class="text-arcane-parchment font-body leading-relaxed whitespace-pre-wrap">${html(paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-arcane-gold">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-arcane-parchment-dim">$1</em>'))}</p>`);
        }
        $$renderer3.push(`<!--]--></div> `);
        {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    $$renderer2.push(`<!----></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-3"><div class="flex items-center justify-between mb-4"><h2 class="font-heading text-arcane-parchment">What will you do?</h2> <p class="text-sm text-arcane-parchment-dim">${escape_html(partyMembers.filter((p) => p.vote).length)}/${escape_html(partyMembers.length)} voted</p></div> <!--[-->`);
      const each_array_2 = ensure_array_like(currentSegment.choices);
      for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
        let choice = each_array_2[$$index_3];
        const Icon2 = choiceIcons[choice.type];
        const isSelected = selectedChoice === choice.id;
        const isWinning = choice.id === winningChoice.id && (choice.votes || 0) > 0;
        $$renderer2.push(`<button${attr("data-choice", choice.id)} class="choice-card w-full text-left transition-all duration-200">`);
        Card($$renderer2, {
          variant: isSelected ? "glow" : "bordered",
          padding: "md",
          class: isSelected ? "ring-2 ring-arcane-gold" : isWinning ? "border-arcane-gold/50" : "",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex items-start gap-4"><div${attr_class(`w-10 h-10 rounded-lg flex items-center justify-center ${stringify(isSelected ? "bg-arcane-gold text-arcane-void" : "bg-arcane-surface text-arcane-gold")}`)}><!---->`);
            Icon2($$renderer3, { size: 20 });
            $$renderer3.push(`<!----></div> <div class="flex-1"><p class="text-arcane-parchment font-body">${escape_html(choice.text)}</p> `);
            if ((choice.votes || 0) > 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="flex items-center gap-2 mt-2"><div class="flex -space-x-1"><!--[-->`);
              const each_array_3 = ensure_array_like(partyMembers.filter((p) => p.vote === choice.id));
              for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
                let voter = each_array_3[$$index_2];
                Avatar($$renderer3, { initials: voter.name.slice(0, 1), size: "sm" });
              }
              $$renderer3.push(`<!--]--></div> `);
              Badge($$renderer3, {
                variant: isWinning ? "gold" : "neutral",
                size: "sm",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(choice.votes)} ${escape_html(choice.votes === 1 ? "vote" : "votes")}`);
                }
              });
              $$renderer3.push(`<!----></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div> `);
            Chevron_right($$renderer3, {
              size: 20,
              class: `text-arcane-parchment-dim ${stringify(isSelected ? "text-arcane-gold" : "")}`
            });
            $$renderer3.push(`<!----></div>`);
          }
        });
        $$renderer2.push(`<!----></button>`);
      }
      $$renderer2.push(`<!--]--> <div class="flex justify-end mt-6">`);
      Button($$renderer2, {
        variant: "primary",
        size: "lg",
        disabled: !selectedChoice,
        onclick: confirmChoice,
        children: ($$renderer3) => {
          Sparkles($$renderer3, { size: 18, class: "mr-2" });
          $$renderer3.push(`<!----> Confirm Choice`);
        }
      });
      $$renderer2.push(`<!----></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-arcane-elevated border-t border-arcane-gold/20 p-3"><div class="max-w-5xl mx-auto flex items-center justify-between"><div class="flex gap-4"><!--[-->`);
    const each_array_4 = ensure_array_like(partyMembers);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let member = each_array_4[$$index_4];
      $$renderer2.push(`<div class="flex items-center gap-2 text-sm">`);
      Avatar($$renderer2, { initials: member.name.slice(0, 1), size: "sm" });
      $$renderer2.push(`<!----> <div><p class="font-heading text-arcane-parchment text-xs">${escape_html(member.name)}</p> <p class="text-arcane-parchment-dim text-xs capitalize">${escape_html(member.class)}</p></div> `);
      if (member.vote) {
        $$renderer2.push("<!--[-->");
        Badge($$renderer2, {
          variant: "gold",
          size: "sm",
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->Voted`);
          }
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex items-center gap-2">`);
    Users($$renderer2, { size: 16, class: "text-arcane-parchment-dim" });
    $$renderer2.push(`<!----> <span class="text-sm text-arcane-parchment-dim">${escape_html(partyMembers.length)} adventurers</span></div></div></div></main>`);
  });
}
export {
  _page as default
};
