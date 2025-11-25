import { d as attr_class, f as clsx, s as sanitize_props, l as rest_props, m as attributes, e as ensure_array_like, n as element, b as slot, k as bind_props } from "./index2.js";
import { i as fallback } from "./context.js";
import "clsx";
import { w as writable } from "./index.js";
function Card($$renderer, $$props) {
  let {
    variant = "default",
    padding = "md",
    hoverable = false,
    class: className = "",
    children,
    header,
    footer
  } = $$props;
  const baseClasses = "rounded-lg transition-all duration-300";
  const variantClasses = {
    default: "bg-arcane-surface border border-arcane-gold/10",
    elevated: "bg-arcane-elevated shadow-lg border border-arcane-gold/20",
    bordered: "bg-arcane-surface border-2 border-arcane-gold/30",
    glow: "bg-arcane-surface border border-arcane-gold/30 shadow-arcane"
  };
  const paddingClasses = { none: "", sm: "p-3", md: "p-5", lg: "p-8" };
  const hoverClasses = hoverable ? "hover:border-arcane-gold/50 hover:shadow-arcane cursor-pointer" : "";
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;
  $$renderer.push(`<div${attr_class(clsx(classes))}>`);
  if (header) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="border-b border-arcane-gold/10 pb-4 mb-4">`);
    header($$renderer);
    $$renderer.push(`<!----></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--> `);
  children($$renderer);
  $$renderer.push(`<!----> `);
  if (footer) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="border-t border-arcane-gold/10 pt-4 mt-4">`);
    footer($$renderer);
    $$renderer.push(`<!----></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
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
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  $$renderer.component(($$renderer2) => {
    let name = fallback($$props["name"], void 0);
    let color = fallback($$props["color"], "currentColor");
    let size = fallback($$props["size"], 24);
    let strokeWidth = fallback($$props["strokeWidth"], 2);
    let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
    let iconNode = fallback($$props["iconNode"], () => [], true);
    const mergeClasses = (...classes) => classes.filter((className, index, array) => {
      return Boolean(className) && array.indexOf(className) === index;
    }).join(" ");
    $$renderer2.push(`<svg${attributes(
      {
        ...defaultAttributes,
        ...$$restProps,
        width: size,
        height: size,
        stroke: color,
        "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        class: clsx(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
      },
      void 0,
      void 0,
      void 0,
      3
    )}><!--[-->`);
    const each_array = ensure_array_like(iconNode);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [tag, attrs] = each_array[$$index];
      element($$renderer2, tag, () => {
        $$renderer2.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
      });
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></svg>`);
    bind_props($$props, {
      name,
      color,
      size,
      strokeWidth,
      absoluteStrokeWidth,
      iconNode
    });
  });
}
function createToastStore() {
  const { subscribe, update } = writable([]);
  return {
    subscribe,
    add(type, message, duration = 5e3) {
      const id = Math.random().toString(36).slice(2);
      const toast = { id, type, message, duration };
      update((toasts) => [...toasts, toast]);
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration);
      }
      return id;
    },
    remove(id) {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    info(message, duration) {
      return this.add("info", message, duration);
    },
    success(message, duration) {
      return this.add("success", message, duration);
    },
    warning(message, duration) {
      return this.add("warning", message, duration);
    },
    error(message, duration) {
      return this.add("error", message, duration);
    }
  };
}
createToastStore();
export {
  Card as C,
  Icon as I
};
