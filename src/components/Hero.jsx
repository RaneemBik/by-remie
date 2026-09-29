import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(244,238,232,0.9)_30%,_rgba(236,213,203,0.82)_100%)]"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-[#f5d4d8]/60 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#f4d8c6]/60 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-[#f7e8ec]/70 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.48),rgba(255,255,255,0.08),rgba(255,255,255,0.22))]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 min-h-[560px] md:min-h-[640px] flex items-center justify-center text-center py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] sm:text-xs tracking-[.32em] uppercase text-[#a77c67] flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> New season edit
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.06] text-[#352820] mt-7 drop-shadow-[0_8px_26px_rgba(255,255,255,0.6)]">
            Where confidence
            <br />
            <span className="italic font-normal">meets pure beauty</span>
          </h1>
          <p className="text-[#65584f]/80 mt-7 max-w-xl mx-auto leading-8 text-sm sm:text-base">
            A curated lookbook of our makeup and skincare pieces — browse by category,
            see what's in stock, and reach out about anything that catches your eye.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 mt-9 bg-[#352820] text-white text-[11px] tracking-[.22em] uppercase px-8 py-4 rounded-full hover:bg-[#a77c67] transition-colors shadow-[0_14px_28px_rgba(53,40,32,0.18)]"
          >
            Browse the catalog <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden border-y border-[#352820]/10 bg-white/20 backdrop-blur-[2px] mt-8 md:mt-10">
        <div className="marquee-track gap-12 py-8 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#352820]/70 whitespace-nowrap">
          {[0, 1].map((item) => (
            <span key={item} className="flex items-center gap-6">
              <span>BY.REMIE</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d7a89a]" />
              <span>Where confidence meets pure beauty</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d7a89a]" />
              <span>Timeless elegance</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d7a89a]" />
              <span>Effortless luxury</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d7a89a]" />
              <span>Modern sophistication</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d7a89a]" />
              <span>Curated beauty essentials for every moment</span>
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
