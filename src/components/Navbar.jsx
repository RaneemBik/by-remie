import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
import { useStore } from "../context/StoreContext";

const instagramUrl = (import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/").split("?")[0].replace(/\/+$/, "");
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const whatsappUrl = whatsappNumber
  ? `https://wa.me/${whatsappNumber}`
  : "https://wa.me/?text=Hello%20BY.REMIE";
export default function Navbar() {
  const { categories } = useStore();
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => `text-[11px] tracking-[.2em] uppercase transition-colors ${isActive ? "text-[#a77c67]" : "text-[#352820]/80 hover:text-[#a77c67]"}`;
  return <header className="sticky top-0 z-40 bg-[#fbf8f4]/95 backdrop-blur border-b border-[#352820]/10">
    <div className="max-w-6xl mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between">
      <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="w-5 h-5"/></button>
      <Link to="/" className="font-display text-2xl sm:text-[27px] tracking-[.17em] text-[#352820]">BY.REMIE</Link>
      <nav className="hidden md:flex items-center gap-8"><NavLink to="/" end className={linkClass}>Home</NavLink><NavLink to="/shop" className={linkClass}>Shop</NavLink></nav>
      <div className="flex items-center gap-4"><a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#352820]/70 hover:text-[#a77c67]"><InstagramIcon className="w-[18px] h-[18px]"/></a><a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-[#352820]/70 hover:text-[#a77c67]"><MessageCircle className="w-[18px] h-[18px]"/></a></div>
    </div>
    {open && <div className="md:hidden fixed inset-0 z-50 bg-[#fbf8f4] flex flex-col"><div className="h-[72px] flex items-center justify-between px-5 border-b border-[#352820]/10"><span className="font-display text-2xl tracking-[.17em]">BY.REMIE</span><button aria-label="Close menu" onClick={()=>setOpen(false)}><X className="w-5 h-5"/></button></div><nav className="flex flex-col gap-7 p-8"><NavLink onClick={()=>setOpen(false)} to="/" end className={linkClass}>Home</NavLink><NavLink onClick={()=>setOpen(false)} to="/shop" className={linkClass}>Shop</NavLink><div className="flex gap-5 pt-4"><a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon className="w-5 h-5"/></a><a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle className="w-5 h-5"/></a></div></nav></div>}
  </header>;
}
