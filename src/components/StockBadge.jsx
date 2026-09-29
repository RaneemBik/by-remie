const CONFIG = {
  in: { label: "In stock", dot: "bg-sage-500", text: "text-sage-500" },
  low: { label: "Low stock", dot: "bg-gold-500", text: "text-gold-500" },
  out: { label: "Sold out", dot: "bg-ink-800/40", text: "text-ink-800/50" },
};

export default function StockBadge({ stock, quantity, size = "sm" }) {
  const c = CONFIG[stock] || CONFIG.in;
  const showQty = stock === "low" && typeof quantity === "number";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        size === "sm" ? "text-[11px]" : "text-xs"
      } font-body ${c.text} tracking-wide`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
      {showQty ? ` · ${quantity} left` : ""}
    </span>
  );
}
