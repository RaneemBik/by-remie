export default function CategoryMarquee({ items }) {
  const sentence = "BY.REMIE — Where confidence meets pure beauty, refined elegance, and the art of feeling beautifully yourself.";
  const doubled = [sentence, sentence];

  return (
    <div className="overflow-hidden border-y border-[#352820]/10 bg-[#f4eee8]/70 py-3">
      <div className="marquee-track">
        {doubled.map((label, i) => (
          <span
            key={i}
            className="flex items-center gap-8 px-6 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#352820]/70 whitespace-nowrap"
          >
            {label}
            <span className="w-1.5 h-1.5 rounded-full bg-[#d7a89a]" />
          </span>
        ))}
      </div>
    </div>
  );
}
