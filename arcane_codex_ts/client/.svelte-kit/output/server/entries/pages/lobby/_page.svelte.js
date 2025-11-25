import { s as sanitize_props, a as spread_props, b as slot, d as attr_class, c as attr, k as bind_props, g as stringify, h as head, e as ensure_array_like } from "../../../chunks/index2.js";
import { d as derived, w as writable } from "../../../chunks/index.js";
import { U as Users, B as Button, a as Book_open, S as Sword, A as Avatar } from "../../../chunks/Avatar.js";
import { I as Icon, C as Card } from "../../../chunks/MagicCircle.svelte_svelte_type_style_lang.js";
import { h as escape_html } from "../../../chunks/context.js";
import { B as Badge } from "../../../chunks/Badge.js";
import "pixi.js";
import { A as Arrow_left } from "../../../chunks/arrow-left.js";
import { S as Skull } from "../../../chunks/skull.js";
function Check($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$renderer, spread_props([
    { name: "check" },
    $$sanitized_props,
    {
      /**
       * @component @name Check
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
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
function Copy($$renderer, $$props) {
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
      "rect",
      {
        "width": "14",
        "height": "14",
        "x": "8",
        "y": "8",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "path",
      {
        "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "copy" },
    $$sanitized_props,
    {
      /**
       * @component @name Copy
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHg9IjgiIHk9IjgiIHJ4PSIyIiByeT0iMiIgLz4KICA8cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/copy
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
function Crown($$renderer, $$props) {
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
        "d": "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"
      }
    ],
    ["path", { "d": "M5 21h14" }]
  ];
  Icon($$renderer, spread_props([
    { name: "crown" },
    $$sanitized_props,
    {
      /**
       * @component @name Crown
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuNTYyIDMuMjY2YS41LjUgMCAwIDEgLjg3NiAwTDE1LjM5IDguODdhMSAxIDAgMCAwIDEuNTE2LjI5NEwyMS4xODMgNS41YS41LjUgMCAwIDEgLjc5OC41MTlsLTIuODM0IDEwLjI0NmExIDEgMCAwIDEtLjk1Ni43MzRINS44MWExIDEgMCAwIDEtLjk1Ny0uNzM0TDIuMDIgNi4wMmEuNS41IDAgMCAxIC43OTgtLjUxOWw0LjI3NiAzLjY2NGExIDEgMCAwIDAgMS41MTYtLjI5NHoiIC8+CiAgPHBhdGggZD0iTTUgMjFoMTQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/crown
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
function Ghost($$renderer, $$props) {
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
    ["path", { "d": "M9 10h.01" }],
    ["path", { "d": "M15 10h.01" }],
    [
      "path",
      {
        "d": "M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "ghost" },
    $$sanitized_props,
    {
      /**
       * @component @name Ghost
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAxMGguMDEiIC8+CiAgPHBhdGggZD0iTTE1IDEwaC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMmE4IDggMCAwIDAtOCA4djEybDMtMyAyLjUgMi41TDEyIDE5bDIuNSAyLjVMMTcgMTlsMyAzVjEwYTggOCAwIDAgMC04LTh6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/ghost
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
function Heart($$renderer, $$props) {
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
        "d": "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "heart" },
    $$sanitized_props,
    {
      /**
       * @component @name Heart
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgMTRjMS40OS0xLjQ2IDMtMy4yMSAzLTUuNUE1LjUgNS41IDAgMCAwIDE2LjUgM2MtMS43NiAwLTMgLjUtNC41IDItMS41LTEuNS0yLjc0LTItNC41LTJBNS41IDUuNSAwIDAgMCAyIDguNWMwIDIuMyAxLjUgNC4wNSAzIDUuNWw3IDdaIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/heart
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
function Message_circle($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }]];
  Icon($$renderer, spread_props([
    { name: "message-circle" },
    $$sanitized_props,
    {
      /**
       * @component @name MessageCircle
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNy45IDIwQTkgOSAwIDEgMCA0IDE2LjFMMiAyMloiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/message-circle
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
function Send($$renderer, $$props) {
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
        "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
      }
    ],
    ["path", { "d": "m21.854 2.147-10.94 10.939" }]
  ];
  Icon($$renderer, spread_props([
    { name: "send" },
    $$sanitized_props,
    {
      /**
       * @component @name Send
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTQuNTM2IDIxLjY4NmEuNS41IDAgMCAwIC45MzctLjAyNGw2LjUtMTlhLjQ5Ni40OTYgMCAwIDAtLjYzNS0uNjM1bC0xOSA2LjVhLjUuNSAwIDAgMC0uMDI0LjkzN2w3LjkzIDMuMThhMiAyIDAgMCAxIDEuMTEyIDEuMTF6IiAvPgogIDxwYXRoIGQ9Im0yMS44NTQgMi4xNDctMTAuOTQgMTAuOTM5IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/send
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
function Settings($$renderer, $$props) {
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
        "d": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "settings" },
    $$sanitized_props,
    {
      /**
       * @component @name Settings
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIuMjIgMmgtLjQ0YTIgMiAwIDAgMC0yIDJ2LjE4YTIgMiAwIDAgMS0xIDEuNzNsLS40My4yNWEyIDIgMCAwIDEtMiAwbC0uMTUtLjA4YTIgMiAwIDAgMC0yLjczLjczbC0uMjIuMzhhMiAyIDAgMCAwIC43MyAyLjczbC4xNS4xYTIgMiAwIDAgMSAxIDEuNzJ2LjUxYTIgMiAwIDAgMS0xIDEuNzRsLS4xNS4wOWEyIDIgMCAwIDAtLjczIDIuNzNsLjIyLjM4YTIgMiAwIDAgMCAyLjczLjczbC4xNS0uMDhhMiAyIDAgMCAxIDIgMGwuNDMuMjVhMiAyIDAgMCAxIDEgMS43M1YyMGEyIDIgMCAwIDAgMiAyaC40NGEyIDIgMCAwIDAgMi0ydi0uMThhMiAyIDAgMCAxIDEtMS43M2wuNDMtLjI1YTIgMiAwIDAgMSAyIDBsLjE1LjA4YTIgMiAwIDAgMCAyLjczLS43M2wuMjItLjM5YTIgMiAwIDAgMC0uNzMtMi43M2wtLjE1LS4wOGEyIDIgMCAwIDEtMS0xLjc0di0uNWEyIDIgMCAwIDEgMS0xLjc0bC4xNS0uMDlhMiAyIDAgMCAwIC43My0yLjczbC0uMjItLjM4YTIgMiAwIDAgMC0yLjczLS43M2wtLjE1LjA4YTIgMiAwIDAgMS0yIDBsLS40My0uMjVhMiAyIDAgMCAxLTEtMS43M1Y0YTIgMiAwIDAgMC0yLTJ6IiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/settings
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
function Shield($$renderer, $$props) {
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
        "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "shield" },
    $$sanitized_props,
    {
      /**
       * @component @name Shield
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA4Ljk1YTEgMSAwIDAgMS0uNjctLjAxQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMSAxLTFjMiAwIDQuNS0xLjIgNi4yNC0yLjcyYTEuMTcgMS4xNyAwIDAgMSAxLjUyIDBDMTQuNTEgMy44MSAxNyA1IDE5IDVhMSAxIDAgMCAxIDEgMXoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/shield
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
function Wand_sparkles($$renderer, $$props) {
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
        "d": "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"
      }
    ],
    ["path", { "d": "m14 7 3 3" }],
    ["path", { "d": "M5 6v4" }],
    ["path", { "d": "M19 14v4" }],
    ["path", { "d": "M10 2v2" }],
    ["path", { "d": "M7 8H3" }],
    ["path", { "d": "M21 16h-4" }],
    ["path", { "d": "M11 3H9" }]
  ];
  Icon($$renderer, spread_props([
    { name: "wand-sparkles" },
    $$sanitized_props,
    {
      /**
       * @component @name WandSparkles
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEuNjQgMy42NC0xLjI4LTEuMjhhMS4yMSAxLjIxIDAgMCAwLTEuNzIgMEwyLjM2IDE4LjY0YTEuMjEgMS4yMSAwIDAgMCAwIDEuNzJsMS4yOCAxLjI4YTEuMiAxLjIgMCAwIDAgMS43MiAwTDIxLjY0IDUuMzZhMS4yIDEuMiAwIDAgMCAwLTEuNzIiIC8+CiAgPHBhdGggZD0ibTE0IDcgMyAzIiAvPgogIDxwYXRoIGQ9Ik01IDZ2NCIgLz4KICA8cGF0aCBkPSJNMTkgMTR2NCIgLz4KICA8cGF0aCBkPSJNMTAgMnYyIiAvPgogIDxwYXRoIGQ9Ik03IDhIMyIgLz4KICA8cGF0aCBkPSJNMjEgMTZoLTQiIC8+CiAgPHBhdGggZD0iTTExIDNIOSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/wand-sparkles
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
function X($$renderer, $$props) {
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
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$renderer, spread_props([
    { name: "x" },
    $$sanitized_props,
    {
      /**
       * @component @name X
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNiA2IDE4IiAvPgogIDxwYXRoIGQ9Im02IDYgMTIgMTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/x
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
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      title = "",
      size = "md",
      closable = true,
      onclose,
      children,
      footer
    } = $$props;
    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl"
    };
    if (open) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center backdrop-arcane"><div${attr_class(`bg-arcane-elevated border border-arcane-gold/30 rounded-lg shadow-arcane-lg w-full mx-4 ${stringify(sizeClasses[size])}`)} role="dialog" aria-modal="true"${attr("aria-labelledby", title ? "modal-title" : void 0)}>`);
      if (title || closable) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex items-center justify-between p-4 border-b border-arcane-gold/20">`);
        if (title) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<h3 id="modal-title" class="text-xl font-heading text-arcane-gold">${escape_html(title)}</h3>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div></div>`);
        }
        $$renderer2.push(`<!--]--> `);
        if (closable) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<button class="p-1 rounded-lg hover:bg-arcane-surface text-arcane-parchment-dim hover:text-arcane-gold transition-colors" aria-label="Close modal">`);
          X($$renderer2, { size: 20 });
          $$renderer2.push(`<!----></button>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="p-6">`);
      children($$renderer2);
      $$renderer2.push(`<!----></div> `);
      if (footer) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="p-4 border-t border-arcane-gold/20 flex justify-end gap-3">`);
        footer($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open });
  });
}
const initialState = {
  partyId: null,
  partyCode: null,
  players: [],
  messages: [],
  maxPlayers: 4,
  difficulty: "normal",
  isSearching: false,
  scenarioId: null
};
function createLobbyStore() {
  const { subscribe, set, update } = writable(initialState);
  return {
    subscribe,
    reset: () => set(initialState),
    setParty: (partyId, partyCode) => update((s) => ({ ...s, partyId, partyCode })),
    addPlayer: (player) => update((s) => ({
      ...s,
      players: [...s.players.filter((p) => p.id !== player.id), player]
    })),
    removePlayer: (playerId) => update((s) => ({
      ...s,
      players: s.players.filter((p) => p.id !== playerId)
    })),
    updatePlayer: (playerId, updates) => update((s) => ({
      ...s,
      players: s.players.map(
        (p) => p.id === playerId ? { ...p, ...updates } : p
      )
    })),
    setPlayers: (players) => update((s) => ({ ...s, players })),
    addMessage: (message) => update((s) => ({
      ...s,
      messages: [...s.messages, {
        ...message,
        id: Math.random().toString(36).slice(2),
        timestamp: /* @__PURE__ */ new Date()
      }]
    })),
    setDifficulty: (difficulty) => update((s) => ({ ...s, difficulty })),
    setSearching: (isSearching) => update((s) => ({ ...s, isSearching })),
    setScenario: (scenarioId) => update((s) => ({ ...s, scenarioId }))
  };
}
const lobby = createLobbyStore();
derived(
  lobby,
  ($lobby) => $lobby.players.length > 0 && $lobby.players.every((p) => p.isReady)
);
derived(lobby, ($lobby) => $lobby.players.length);
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let chatInput = "";
    let copied = false;
    let showSettingsModal = false;
    const mockPlayers = [
      {
        id: "1",
        name: "Aetherion",
        class: "mage",
        level: 12,
        isReady: true,
        isHost: true,
        status: "online"
      },
      {
        id: "2",
        name: "Shadowmere",
        class: "rogue",
        level: 8,
        isReady: false,
        isHost: false,
        status: "online"
      }
    ];
    const mockMessages = [
      {
        id: "1",
        playerId: "system",
        playerName: "System",
        content: "Party created. Share the code to invite others.",
        timestamp: /* @__PURE__ */ new Date(),
        type: "system"
      },
      {
        id: "2",
        playerId: "1",
        playerName: "Aetherion",
        content: "Ready when you are!",
        timestamp: /* @__PURE__ */ new Date(),
        type: "chat"
      }
    ];
    let players = mockPlayers;
    let messages = mockMessages;
    let partyCode = "ARCN-7X9K";
    let currentPlayerId = "1";
    const classIcons = {
      warrior: Sword,
      mage: Wand_sparkles,
      rogue: Ghost,
      healer: Heart,
      summoner: Book_open,
      berserker: Skull
    };
    const classColors = {
      warrior: "text-red-400",
      mage: "text-purple-400",
      rogue: "text-gray-400",
      healer: "text-green-400",
      summoner: "text-blue-400",
      berserker: "text-orange-400"
    };
    function copyPartyCode() {
      navigator.clipboard.writeText(partyCode);
      copied = true;
      setTimeout(() => copied = false, 2e3);
    }
    function toggleReady() {
      players = players.map((p) => p.id === currentPlayerId ? { ...p, isReady: !p.isReady } : p);
    }
    function startGame() {
      console.log("Starting game...");
    }
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    const isHost = currentPlayer?.isHost || false;
    const allReady = players.length > 0 && players.every((p) => p.isReady);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("1xhi2iz", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Multiplayer Lobby | The Arcane Codex</title>`);
        });
      });
      $$renderer3.push(`<main class="min-h-screen p-4 md:p-6 lg:p-8"><div class="flex items-center justify-between mb-6"><a href="/" class="btn btn-ghost text-arcane-parchment-dim hover:text-arcane-gold">`);
      Arrow_left($$renderer3, { size: 20 });
      $$renderer3.push(`<!----> <span class="ml-2 hidden sm:inline">Leave Party</span></a> <div class="text-center"><h1 class="text-2xl md:text-3xl font-display text-gradient-gold">Party Lobby</h1></div> <button class="btn btn-ghost text-arcane-parchment-dim hover:text-arcane-gold">`);
      Settings($$renderer3, { size: 20 });
      $$renderer3.push(`<!----></button></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"><div class="lg:col-span-2 space-y-6">`);
      Card($$renderer3, {
        variant: "bordered",
        padding: "md",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex flex-col sm:flex-row items-center justify-between gap-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-arcane-gold/10 flex items-center justify-center">`);
          Users($$renderer4, { size: 20, class: "text-arcane-gold" });
          $$renderer4.push(`<!----></div> <div><p class="text-xs text-arcane-parchment-dim font-mono">PARTY CODE</p> <p class="text-xl font-mono text-arcane-gold tracking-wider">ARCN-7X9K</p></div></div> `);
          Button($$renderer4, {
            variant: "outline",
            size: "sm",
            onclick: copyPartyCode,
            children: ($$renderer5) => {
              if (copied) {
                $$renderer5.push("<!--[-->");
                Check($$renderer5, { size: 16, class: "mr-2" });
                $$renderer5.push(`<!----> Copied!`);
              } else {
                $$renderer5.push("<!--[!-->");
                Copy($$renderer5, { size: 16, class: "mr-2" });
                $$renderer5.push(`<!----> Copy Code`);
              }
              $$renderer5.push(`<!--]-->`);
            }
          });
          $$renderer4.push(`<!----></div>`);
        }
      });
      $$renderer3.push(`<!----> <div><div class="flex items-center justify-between mb-3"><h2 class="font-heading text-lg text-arcane-parchment">Party Members</h2> `);
      Badge($$renderer3, {
        variant: "neutral",
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(players.length)} / 4`);
        }
      });
      $$renderer3.push(`<!----></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><!--[-->`);
      const each_array = ensure_array_like(players);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let player = each_array[$$index];
        const Icon2 = classIcons[player.class];
        Card($$renderer3, {
          variant: player.isReady ? "glow" : "default",
          padding: "md",
          class: "player-card",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-start gap-3">`);
            Avatar($$renderer4, {
              initials: player.name.slice(0, 2),
              size: "lg",
              status: player.status
            });
            $$renderer4.push(`<!----> <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h3 class="font-heading text-arcane-parchment truncate">${escape_html(player.name)}</h3> `);
            if (player.isHost) {
              $$renderer4.push("<!--[-->");
              Crown($$renderer4, { size: 14, class: "text-arcane-gold flex-shrink-0" });
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--></div> <div class="flex items-center gap-2 mt-1"><!---->`);
            Icon2($$renderer4, { size: 14, class: classColors[player.class] });
            $$renderer4.push(`<!----> <span class="text-sm text-arcane-parchment-dim capitalize">${escape_html(player.class)}</span> `);
            Badge($$renderer4, {
              variant: "neutral",
              size: "sm",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Lv.${escape_html(player.level)}`);
              }
            });
            $$renderer4.push(`<!----></div> <div class="mt-2">`);
            if (player.isReady) {
              $$renderer4.push("<!--[-->");
              Badge($$renderer4, {
                variant: "gold",
                size: "sm",
                children: ($$renderer5) => {
                  Shield($$renderer5, { size: 12, class: "mr-1" });
                  $$renderer5.push(`<!----> Ready`);
                }
              });
            } else {
              $$renderer4.push("<!--[!-->");
              Badge($$renderer4, {
                variant: "neutral",
                outline: true,
                size: "sm",
                children: ($$renderer5) => {
                  $$renderer5.push(`<!---->Not Ready`);
                }
              });
            }
            $$renderer4.push(`<!--]--></div></div></div>`);
          }
        });
      }
      $$renderer3.push(`<!--]--> <!--[-->`);
      const each_array_1 = ensure_array_like(Array(4 - players.length));
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        each_array_1[i];
        Card($$renderer3, {
          variant: "default",
          padding: "md",
          class: "player-card border-dashed opacity-50",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-center justify-center h-24 text-arcane-parchment-dim">`);
            Users($$renderer4, { size: 24, class: "mr-2" });
            $$renderer4.push(`<!----> <span class="font-body">Waiting for player...</span></div>`);
          }
        });
      }
      $$renderer3.push(`<!--]--></div></div> <div class="flex flex-col sm:flex-row gap-3">`);
      Button($$renderer3, {
        variant: currentPlayer?.isReady ? "secondary" : "primary",
        size: "lg",
        onclick: toggleReady,
        class: "flex-1",
        children: ($$renderer4) => {
          if (currentPlayer?.isReady) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<span>Cancel Ready</span>`);
          } else {
            $$renderer4.push("<!--[!-->");
            Shield($$renderer4, { size: 20, class: "mr-2" });
            $$renderer4.push(`<!----> <span>Ready Up</span>`);
          }
          $$renderer4.push(`<!--]-->`);
        }
      });
      $$renderer3.push(`<!----> `);
      if (isHost) {
        $$renderer3.push("<!--[-->");
        Button($$renderer3, {
          variant: "primary",
          size: "lg",
          disabled: !allReady || players.length < 1,
          onclick: startGame,
          class: "flex-1",
          children: ($$renderer4) => {
            Sword($$renderer4, { size: 20, class: "mr-2" });
            $$renderer4.push(`<!----> <span>Begin Adventure</span>`);
          }
        });
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></div> <div class="lg:col-span-1">`);
      Card($$renderer3, {
        variant: "elevated",
        padding: "none",
        class: "h-[500px] flex flex-col",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-4 border-b border-arcane-gold/20"><div class="flex items-center gap-2">`);
          Message_circle($$renderer4, { size: 18, class: "text-arcane-gold" });
          $$renderer4.push(`<!----> <h2 class="font-heading text-arcane-parchment">Party Chat</h2></div></div> <div class="flex-1 overflow-y-auto p-4 space-y-3"><!--[-->`);
          const each_array_2 = ensure_array_like(messages);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let message = each_array_2[$$index_2];
            $$renderer4.push(`<div class="flex flex-col">`);
            if (message.type === "system") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<p class="text-xs text-arcane-cyan text-center italic">${escape_html(message.content)}</p>`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<div class="flex items-start gap-2">`);
              Avatar($$renderer4, { initials: message.playerName.slice(0, 1), size: "sm" });
              $$renderer4.push(`<!----> <div class="flex-1 min-w-0"><div class="flex items-baseline gap-2"><span class="text-sm font-heading text-arcane-gold">${escape_html(message.playerName)}</span> <span class="text-xs text-arcane-parchment-dim">${escape_html(message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}</span></div> <p class="text-sm text-arcane-parchment break-words">${escape_html(message.content)}</p></div></div>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          }
          $$renderer4.push(`<!--]--></div> <div class="p-4 border-t border-arcane-gold/20"><div class="flex gap-2"><input type="text"${attr("value", chatInput)} placeholder="Type a message..." class="input input-sm flex-1 bg-arcane-surface border-arcane-gold/20 text-arcane-parchment placeholder:text-arcane-parchment-dim/50 focus:border-arcane-gold focus:outline-none"/> <button${attr("disabled", !chatInput.trim(), true)} class="btn btn-sm btn-square bg-arcane-gold hover:bg-arcane-gold-light text-arcane-void disabled:opacity-50">`);
          Send($$renderer4, { size: 16 });
          $$renderer4.push(`<!----></button></div></div>`);
        }
      });
      $$renderer3.push(`<!----></div></div></main> `);
      {
        let footer = function($$renderer4) {
          Button($$renderer4, {
            variant: "ghost",
            onclick: () => showSettingsModal = false,
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Close`);
            }
          });
        };
        Modal($$renderer3, {
          title: "Party Settings",
          size: "md",
          get open() {
            return showSettingsModal;
          },
          set open($$value) {
            showSettingsModal = $$value;
            $$settled = false;
          },
          footer,
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="space-y-4"><div><label class="label"><span class="label-text text-arcane-parchment">Difficulty</span></label> <div class="flex gap-2">`);
            Button($$renderer4, {
              variant: lobby ? "primary" : "ghost",
              size: "sm",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Normal`);
              }
            });
            $$renderer4.push(`<!----> `);
            Button($$renderer4, {
              variant: "ghost",
              size: "sm",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Hard`);
              }
            });
            $$renderer4.push(`<!----> `);
            Button($$renderer4, {
              variant: "ghost",
              size: "sm",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Nightmare`);
              }
            });
            $$renderer4.push(`<!----></div></div> <div><label class="label"><span class="label-text text-arcane-parchment">Max Players</span></label> <div class="flex gap-2"><!--[-->`);
            const each_array_3 = ensure_array_like([2, 3, 4]);
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let num = each_array_3[$$index_3];
              $$renderer4.push(`<button${attr_class(`btn btn-sm ${stringify(num === 4 ? "btn-primary" : "btn-ghost")}`)}>${escape_html(num)}</button>`);
            }
            $$renderer4.push(`<!--]--></div></div></div>`);
          },
          $$slots: { footer: true, default: true }
        });
      }
      $$renderer3.push(`<!---->`);
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
