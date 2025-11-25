import { s as sanitize_props, a as spread_props, b as slot, h as head, e as ensure_array_like, c as attr, d as attr_class, f as clsx, g as stringify } from "../../../chunks/index2.js";
import { d as derived, w as writable } from "../../../chunks/index.js";
import { I as Icon, C as Card } from "../../../chunks/MagicCircle.svelte_svelte_type_style_lang.js";
import { P as ProgressBar } from "../../../chunks/ProgressBar.js";
import { B as Badge } from "../../../chunks/Badge.js";
import "pixi.js";
import { S as Skull } from "../../../chunks/skull.js";
import { C as Clock } from "../../../chunks/clock.js";
import { h as escape_html } from "../../../chunks/context.js";
const initialState = {
  isActive: false,
  turn: 0,
  phase: "player_turn",
  combatants: [],
  selectedAbility: null,
  selectedTarget: null,
  battleLog: [],
  turnOrder: []
};
function createBattleStore() {
  const { subscribe, set, update } = writable(initialState);
  return {
    subscribe,
    reset: () => set(initialState),
    startBattle: (combatants) => update((s) => ({
      ...s,
      isActive: true,
      turn: 1,
      phase: "player_turn",
      combatants,
      turnOrder: combatants.map((c) => c.id),
      battleLog: [{
        id: "1",
        timestamp: /* @__PURE__ */ new Date(),
        type: "system",
        message: "Battle has begun!"
      }]
    })),
    selectAbility: (ability) => update((s) => ({ ...s, selectedAbility: ability, selectedTarget: null })),
    selectTarget: (targetId) => update((s) => ({ ...s, selectedTarget: targetId })),
    addLog: (log) => update((s) => ({
      ...s,
      battleLog: [...s.battleLog, {
        ...log,
        id: Math.random().toString(36).slice(2),
        timestamp: /* @__PURE__ */ new Date()
      }]
    })),
    updateCombatant: (id, updates) => update((s) => ({
      ...s,
      combatants: s.combatants.map(
        (c) => c.id === id ? { ...c, ...updates } : c
      )
    })),
    damageCombatant: (id, amount) => update((s) => ({
      ...s,
      combatants: s.combatants.map(
        (c) => c.id === id ? {
          ...c,
          stats: {
            ...c.stats,
            hp: Math.max(0, c.stats.hp - amount)
          }
        } : c
      )
    })),
    healCombatant: (id, amount) => update((s) => ({
      ...s,
      combatants: s.combatants.map(
        (c) => c.id === id ? {
          ...c,
          stats: {
            ...c.stats,
            hp: Math.min(c.stats.maxHp, c.stats.hp + amount)
          }
        } : c
      )
    })),
    nextTurn: () => update((s) => ({
      ...s,
      turn: s.turn + 1,
      selectedAbility: null,
      selectedTarget: null
    })),
    setPhase: (phase) => update((s) => ({ ...s, phase }))
  };
}
const battle = createBattleStore();
derived(
  battle,
  ($battle) => $battle.combatants.filter((c) => c.isPlayer)
);
derived(
  battle,
  ($battle) => $battle.combatants.filter((c) => !c.isPlayer)
);
derived(
  battle,
  ($battle) => $battle.combatants.find((c) => c.isCurrentTurn)
);
function Star($$renderer, $$props) {
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
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "star" },
    $$sanitized_props,
    {
      /**
       * @component @name Star
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuNTI1IDIuMjk1YS41My41MyAwIDAgMSAuOTUgMGwyLjMxIDQuNjc5YTIuMTIzIDIuMTIzIDAgMCAwIDEuNTk1IDEuMTZsNS4xNjYuNzU2YS41My41MyAwIDAgMSAuMjk0LjkwNGwtMy43MzYgMy42MzhhMi4xMjMgMi4xMjMgMCAwIDAtLjYxMSAxLjg3OGwuODgyIDUuMTRhLjUzLjUzIDAgMCAxLS43NzEuNTZsLTQuNjE4LTIuNDI4YTIuMTIyIDIuMTIyIDAgMCAwLTEuOTczIDBMNi4zOTYgMjEuMDFhLjUzLjUzIDAgMCAxLS43Ny0uNTZsLjg4MS01LjEzOWEyLjEyMiAyLjEyMiAwIDAgMC0uNjExLTEuODc5TDIuMTYgOS43OTVhLjUzLjUzIDAgMCAxIC4yOTQtLjkwNmw1LjE2NS0uNzU1YTIuMTIyIDIuMTIyIDAgMCAwIDEuNTk3LTEuMTZ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/star
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
function Zap($$renderer, $$props) {
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
        "d": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "zap" },
    $$sanitized_props,
    {
      /**
       * @component @name Zap
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNCAxNGExIDEgMCAwIDEtLjc4LTEuNjNsOS45LTEwLjJhLjUuNSAwIDAgMSAuODYuNDZsLTEuOTIgNi4wMkExIDEgMCAwIDAgMTMgMTBoN2ExIDEgMCAwIDEgLjc4IDEuNjNsLTkuOSAxMC4yYS41LjUgMCAwIDEtLjg2LS40NmwxLjkyLTYuMDJBMSAxIDAgMCAwIDExIDE0eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/zap
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
    const mockPlayers = [
      {
        id: "p1",
        name: "Aetherion",
        class: "mage",
        isPlayer: true,
        isCurrentTurn: true,
        stats: { hp: 85, maxHp: 100, mana: 60, maxMana: 80, armor: 5 },
        statusEffects: [
          {
            id: "1",
            name: "Focus",
            icon: "🎯",
            duration: 2,
            type: "buff"
          }
        ],
        position: { x: 0, y: 0 }
      },
      {
        id: "p2",
        name: "Shadowmere",
        class: "rogue",
        isPlayer: true,
        isCurrentTurn: false,
        stats: { hp: 65, maxHp: 80, mana: 40, maxMana: 50, armor: 8 },
        statusEffects: [],
        position: { x: 0, y: 1 }
      }
    ];
    const mockEnemies = [
      {
        id: "e1",
        name: "Void Wraith",
        class: "enemy",
        isPlayer: false,
        isCurrentTurn: false,
        stats: { hp: 120, maxHp: 150, mana: 0, maxMana: 0, armor: 10 },
        statusEffects: [
          {
            id: "2",
            name: "Darkness",
            icon: "🌑",
            duration: 3,
            type: "buff"
          }
        ],
        position: { x: 1, y: 0 }
      },
      {
        id: "e2",
        name: "Shadow Spawn",
        class: "enemy",
        isPlayer: false,
        isCurrentTurn: false,
        stats: { hp: 40, maxHp: 60, mana: 0, maxMana: 0, armor: 3 },
        statusEffects: [],
        position: { x: 1, y: 1 }
      }
    ];
    const abilities = [
      {
        id: "a1",
        name: "Arcane Bolt",
        description: "Launch a bolt of pure arcane energy",
        manaCost: 15,
        cooldown: 0,
        currentCooldown: 0,
        targetType: "single",
        damageType: "magical",
        icon: "⚡"
      },
      {
        id: "a2",
        name: "Frost Nova",
        description: "Freeze nearby enemies",
        manaCost: 25,
        cooldown: 2,
        currentCooldown: 0,
        targetType: "all_enemies",
        damageType: "magical",
        icon: "❄️"
      },
      {
        id: "a3",
        name: "Mind Shield",
        description: "Create a protective barrier",
        manaCost: 20,
        cooldown: 3,
        currentCooldown: 1,
        targetType: "self",
        icon: "🛡️"
      },
      {
        id: "a4",
        name: "Reality Tear",
        description: "Rip through the fabric of reality",
        manaCost: 40,
        cooldown: 4,
        currentCooldown: 0,
        targetType: "area",
        damageType: "true",
        icon: "🌀"
      }
    ];
    const mockLogs = [
      {
        id: "1",
        timestamp: /* @__PURE__ */ new Date(),
        type: "system",
        message: "Battle begins!"
      },
      {
        id: "2",
        timestamp: /* @__PURE__ */ new Date(),
        type: "action",
        source: "Void Wraith",
        message: "Void Wraith summons Shadow Spawn"
      },
      {
        id: "3",
        timestamp: /* @__PURE__ */ new Date(),
        type: "damage",
        source: "Aetherion",
        target: "Void Wraith",
        amount: 24,
        message: "Aetherion hits Void Wraith for 24 damage"
      }
    ];
    let players = mockPlayers;
    let enemies = mockEnemies;
    let logs = mockLogs;
    let selectedAbility = null;
    let selectedTarget = null;
    let turn = 1;
    const currentPlayer = players.find((p) => p.isCurrentTurn);
    head("igdd9v", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Battle | The Arcane Codex</title>`);
      });
    });
    $$renderer2.push(`<main class="min-h-screen p-4 flex flex-col"><div class="flex items-center justify-between mb-4">`);
    Badge($$renderer2, {
      variant: "gold",
      size: "lg",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Turn ${escape_html(turn)}`);
      }
    });
    $$renderer2.push(`<!----> <h1 class="text-xl font-display text-gradient-gold">Combat</h1> `);
    Badge($$renderer2, {
      variant: "cyan",
      size: "lg",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html("Your Turn")}`);
      }
    });
    $$renderer2.push(`<!----></div> <div class="flex-1 grid grid-cols-2 gap-8 mb-4"><div class="flex flex-col justify-center gap-4"><h2 class="font-heading text-arcane-cyan text-center">Party</h2> <!--[-->`);
    const each_array = ensure_array_like(players);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let player = each_array[$$index_1];
      $$renderer2.push(`<div${attr("data-combatant", player.id)}${attr_class("player-unit cursor-pointer transition-all duration-200", void 0, {
        "ring-2": selectedTarget === player.id,
        "ring-arcane-cyan": selectedTarget === player.id
      })}>`);
      Card($$renderer2, {
        variant: player.isCurrentTurn ? "glow" : "default",
        padding: "md",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-3"><div class="w-12 h-12 rounded-lg bg-arcane-cyan/20 flex items-center justify-center text-2xl">${escape_html(player.class === "mage" ? "🧙" : "🗡️")}</div> <div class="flex-1"><div class="flex items-center gap-2"><span class="font-heading text-arcane-parchment">${escape_html(player.name)}</span> `);
          if (player.isCurrentTurn) {
            $$renderer3.push("<!--[-->");
            Star($$renderer3, { size: 14, class: "text-arcane-gold animate-pulse" });
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="space-y-1 mt-1">`);
          ProgressBar($$renderer3, {
            value: player.stats.hp,
            max: player.stats.maxHp,
            variant: "health",
            size: "sm"
          });
          $$renderer3.push(`<!----> `);
          ProgressBar($$renderer3, {
            value: player.stats.mana,
            max: player.stats.maxMana,
            variant: "cyan",
            size: "sm"
          });
          $$renderer3.push(`<!----></div></div> <div class="text-right text-xs font-mono"><p class="text-arcane-crimson">${escape_html(player.stats.hp)}/${escape_html(player.stats.maxHp)}</p> <p class="text-arcane-cyan">${escape_html(player.stats.mana)}/${escape_html(player.stats.maxMana)}</p></div></div> `);
          if (player.statusEffects.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex gap-1 mt-2"><!--[-->`);
            const each_array_1 = ensure_array_like(player.statusEffects);
            for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
              let effect = each_array_1[$$index];
              $$renderer3.push(`<span class="text-sm"${attr("title", effect.name)}>${escape_html(effect.icon)}</span>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex flex-col justify-center gap-4"><h2 class="font-heading text-arcane-crimson text-center">Enemies</h2> <!--[-->`);
    const each_array_2 = ensure_array_like(enemies);
    for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
      let enemy = each_array_2[$$index_3];
      $$renderer2.push(`<button${attr("data-combatant", enemy.id)}${attr_class("enemy-unit text-left transition-all duration-200", void 0, {
        "ring-2": selectedTarget === enemy.id,
        "ring-arcane-crimson": selectedTarget === enemy.id,
        "opacity-30": enemy.stats.hp <= 0
      })}${attr("disabled", enemy.stats.hp <= 0 || !selectedAbility, true)}>`);
      Card($$renderer2, {
        variant: "bordered",
        padding: "md",
        class: "border-arcane-crimson/30",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center gap-3"><div class="w-12 h-12 rounded-lg bg-arcane-crimson/20 flex items-center justify-center text-2xl">${escape_html(enemy.name.includes("Wraith") ? "👻" : "🦇")}</div> <div class="flex-1"><div class="flex items-center gap-2"><span class="font-heading text-arcane-parchment">${escape_html(enemy.name)}</span> `);
          if (enemy.stats.hp <= 0) {
            $$renderer3.push("<!--[-->");
            Skull($$renderer3, { size: 14, class: "text-arcane-crimson" });
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div> <div class="mt-1">`);
          ProgressBar($$renderer3, {
            value: enemy.stats.hp,
            max: enemy.stats.maxHp,
            variant: "crimson",
            size: "sm"
          });
          $$renderer3.push(`<!----></div></div> <div class="text-right text-xs font-mono"><p class="text-arcane-crimson">${escape_html(enemy.stats.hp)}/${escape_html(enemy.stats.maxHp)}</p> <p class="text-arcane-parchment-dim">🛡️ ${escape_html(enemy.stats.armor)}</p></div></div> `);
          if (enemy.statusEffects.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex gap-1 mt-2"><!--[-->`);
            const each_array_3 = ensure_array_like(enemy.statusEffects);
            for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
              let effect = each_array_3[$$index_2];
              $$renderer3.push(`<span class="text-sm"${attr("title", effect.name)}>${escape_html(effect.icon)}</span>`);
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
      });
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    Card($$renderer2, {
      variant: "default",
      padding: "sm",
      class: "h-24 mb-4",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="h-full overflow-y-auto text-sm font-mono space-y-1"><!--[-->`);
        const each_array_4 = ensure_array_like(logs);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let log = each_array_4[$$index_4];
          $$renderer3.push(`<p${attr_class(clsx(log.type === "damage" ? "text-arcane-crimson" : log.type === "heal" ? "text-green-400" : log.type === "system" ? "text-arcane-cyan" : "text-arcane-parchment-dim"))}>${escape_html(log.message)}</p>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      }
    });
    $$renderer2.push(`<!----> <div class="bg-arcane-elevated border-t border-arcane-gold/20 -mx-4 -mb-4 p-4"><div class="flex items-center gap-4"><div class="flex-1 flex gap-2 overflow-x-auto pb-2"><!--[-->`);
    const each_array_5 = ensure_array_like(abilities);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let ability = each_array_5[$$index_5];
      $$renderer2.push(`<button${attr("data-ability", ability.id)}${attr("disabled", ability.currentCooldown > 0 || currentPlayer && currentPlayer.stats.mana < ability.manaCost, true)}${attr_class(`ability-btn flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-200 ${stringify(selectedAbility?.id === ability.id ? "border-arcane-gold bg-arcane-gold/20 scale-105" : "border-arcane-gold/30 bg-arcane-surface")} ${stringify(ability.currentCooldown > 0 ? "opacity-50 grayscale" : "")} ${stringify(currentPlayer && currentPlayer.stats.mana < ability.manaCost ? "opacity-50" : "")} hover:border-arcane-gold/50 disabled:cursor-not-allowed`)}${attr("title", `${stringify(ability.name)}: ${stringify(ability.description)} (${stringify(ability.manaCost)} mana)`)}><span class="text-2xl">${escape_html(ability.icon)}</span> `);
      if (ability.currentCooldown > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center bg-arcane-void/70 rounded-lg">`);
        Clock($$renderer2, { size: 16, class: "text-arcane-parchment-dim" });
        $$renderer2.push(`<!----> <span class="text-xs ml-1">${escape_html(ability.currentCooldown)}</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex gap-2"><button${attr("disabled", true, true)} class="btn btn-lg bg-arcane-gold hover:bg-arcane-gold-light text-arcane-void disabled:opacity-50 disabled:cursor-not-allowed">`);
    Zap($$renderer2, { size: 20, class: "mr-2" });
    $$renderer2.push(`<!----> Execute</button> <button${attr("disabled", false, true)} class="btn btn-lg btn-outline border-arcane-gold text-arcane-gold hover:bg-arcane-gold hover:text-arcane-void disabled:opacity-50">End Turn</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></main>`);
  });
}
export {
  _page as default
};
