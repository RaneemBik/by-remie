import { Droplet, Sparkles, Flower2, Wind } from "lucide-react";
import { useStore } from "../context/StoreContext";

function iconFor(name = "") {
  const n = name.toLowerCase();
  if (/lip/.test(n)) return Flower2;
  if (/make|cosmetic|color|colour/.test(n)) return Sparkles;
  if (/fragrance|perfume|mist|scent/.test(n)) return Wind;
  return Droplet;
}

const GRADIENTS = {
  blush: "from-blush-100 via-blush-50 to-cream-50",
  gold: "from-cream-200 via-blush-50 to-cream-50",
  sage: "from-cream-100 via-blush-50 to-cream-50",
};

export default function ProductArt({ categoryId, accent = "blush", image, className = "" }) {
  const { categories } = useStore();
  if (image) {
    return (
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  const Icon = iconFor(categories.find((c) => c.id === categoryId)?.name);
  const gradient = GRADIENTS[accent] || GRADIENTS.blush;

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden ${className}`}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/40 blur-xl" />
      <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-blush-200/30 blur-2xl" />
      <Icon className="w-10 h-10 text-ink-800/25 relative" strokeWidth={1.2} />
    </div>
  );
}
