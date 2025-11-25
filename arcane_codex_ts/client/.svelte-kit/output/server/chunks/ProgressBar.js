import { d as attr_class, j as attr_style, g as stringify } from "./index2.js";
import { h as escape_html } from "./context.js";
function ProgressBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value,
      max = 100,
      variant = "gold",
      size = "md",
      showLabel = false,
      animated = true,
      class: className = ""
    } = $$props;
    let displayValue = 0;
    const percentage = Math.min(100, Math.max(0, value / max * 100));
    const variantClasses = {
      gold: "bg-arcane-gold",
      crimson: "bg-arcane-crimson",
      cyan: "bg-arcane-cyan",
      health: "bg-gradient-to-r from-arcane-crimson-dark to-arcane-crimson",
      mana: "bg-gradient-to-r from-arcane-cyan-dark to-arcane-cyan"
    };
    const sizeClasses = { sm: "h-1", md: "h-2", lg: "h-4" };
    $$renderer2.push(`<div${attr_class(`w-full ${stringify(className)}`)}>`);
    if (showLabel) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-between mb-1 text-sm font-mono text-arcane-parchment-dim"><span>${escape_html(displayValue)}</span> <span>${escape_html(max)}</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`w-full bg-arcane-surface rounded-full overflow-hidden ${stringify(sizeClasses[size])}`)}><div${attr_class(`h-full rounded-full transition-all ${stringify(variantClasses[variant])}`)}${attr_style(`width: ${stringify(animated ? "0%" : `${percentage}%`)}`)}></div></div></div>`);
  });
}
export {
  ProgressBar as P
};
