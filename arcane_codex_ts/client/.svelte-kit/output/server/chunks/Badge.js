import { d as attr_class, f as clsx } from "./index2.js";
function Badge($$renderer, $$props) {
  let {
    variant = "gold",
    size = "md",
    outline = false,
    class: className = "",
    children
  } = $$props;
  const baseClasses = "badge font-mono uppercase tracking-wider";
  const variantClasses = {
    gold: outline ? "badge-outline border-arcane-gold text-arcane-gold" : "bg-arcane-gold text-arcane-void",
    crimson: outline ? "badge-outline border-arcane-crimson text-arcane-crimson" : "bg-arcane-crimson text-arcane-parchment",
    cyan: outline ? "badge-outline border-arcane-cyan text-arcane-cyan" : "bg-arcane-cyan text-arcane-void",
    neutral: outline ? "badge-outline border-arcane-parchment-dim text-arcane-parchment-dim" : "bg-arcane-surface text-arcane-parchment"
  };
  const sizeClasses = {
    sm: "badge-sm text-xs",
    md: "text-xs",
    lg: "badge-lg text-sm"
  };
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  $$renderer.push(`<span${attr_class(clsx(classes))}>`);
  children($$renderer);
  $$renderer.push(`<!----></span>`);
}
export {
  Badge as B
};
