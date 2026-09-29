import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/";
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const whatsappUrl = whatsappNumber
  ? `https://wa.me/${whatsappNumber}`
  : "https://wa.me/?text=Hello%20BY.REMIE";
export default function Footer() {
 return <footer className="bg-[#352820] text-[#fbf8f4] mt-24"><div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid sm:grid-cols-3 gap-10"><div><p className="font-display text-2xl tracking-[.17em]">BY.REMIE</p><p className="text-sm text-white/60 mt-3 max-w-xs leading-relaxed">A curated lookbook of makeup and skincare. Discover your next beauty favorite.</p></div><div><p className="text-[11px] tracking-[.22em] uppercase text-white/50 mb-3">Explore</p><ul className="space-y-2 text-sm text-white/80"><li><Link to="/shop" className="hover:text-[#e7b6a3]">Shop all products</Link></li></ul></div><div><p className="text-[11px] tracking-[.22em] uppercase text-white/50 mb-3">Get in touch</p><div className="flex flex-col items-start gap-3"><a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex items-center gap-2 text-sm text-white/80 hover:text-[#e7b6a3]"><InstagramIcon className="w-4 h-4"/> Instagram</a><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-[#e7b6a3]"><MessageCircle className="w-4 h-4"/> WhatsApp</a></div><p className="mt-4 text-sm text-white/70 leading-relaxed">For inquiries or orders, send us a DM on Instagram or contact us via WhatsApp.</p></div></div><div className="border-t border-white/10 py-5 text-center text-xs text-white/40">BY.REMIE · Beauty, curated.</div></footer>;
}
