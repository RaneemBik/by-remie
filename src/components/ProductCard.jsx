import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProductArt from "./ProductArt";
import StockBadge from "./StockBadge";
import { InstagramIcon } from "./BrandIcons";
import { useStore } from "../context/StoreContext";

const instagramUrl = (import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/").split("?")[0].replace(/\/+$/, "");
const instagramUsername = (instagramUrl.match(/instagram\.com\/([^/?]+)/i) || [])[1] || "";
const instagramDmUrl = instagramUsername ? `https://ig.me/m/${instagramUsername}` : instagramUrl;
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export default function ProductCard({ product, index = 0 }) {
  const { categories } = useStore();
  const category = categories.find((c) => c.id === product.categoryId);
  const soldOut = product.stock === "out";
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const [imageIndex, setImageIndex] = useState(0);

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : "";
  const encodedMessage = encodeURIComponent(`Hi! I found this product on BY.REMIE: ${product.name} - ${productUrl}`);
  const whatsappShareUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`;

  const handleInstagramShare = () => {
    if (!instagramUsername) return;
    const url = `${instagramDmUrl}?text=${encodeURIComponent(`Hi! I want to ask about this product: ${product.name} - ${productUrl}`)}`;
    const popup = window.open(url, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.href = url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}
    >
      <div className="group">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-100">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <motion.div className="w-full h-full" whileHover={{ scale: 1.04 }} transition={{ duration: 0.5, ease: "easeOut" }}>
              <ProductArt categoryId={product.categoryId} accent={category?.accent} image={images[imageIndex] || product.image} />
            </motion.div>
          </Link>
          {images.length>1 && <><button type="button" aria-label="Previous product image" onClick={()=>setImageIndex(i=>(i-1+images.length)%images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 shadow-sm"><ChevronLeft className="w-4 h-4"/></button><button type="button" aria-label="Next product image" onClick={()=>setImageIndex(i=>(i+1)%images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 shadow-sm"><ChevronRight className="w-4 h-4"/></button><div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">{images.map((_,i)=><button key={i} type="button" aria-label={`Show image ${i+1}`} onClick={()=>setImageIndex(i)} className={`w-1.5 h-1.5 rounded-full ${i===imageIndex?"bg-[#352820]":"bg-white/80"}`}/>)}</div></>}
          {soldOut && <div className="absolute inset-0 bg-cream-50/55 flex items-center justify-center pointer-events-none"><span className="text-[11px] tracking-widest2 uppercase text-ink-800/70 bg-cream-50 px-3 py-1.5 rounded-full">Sold out</span></div>}
          {product.stock === "low" && <span className="absolute top-3 left-3 text-[10px] tracking-widest2 uppercase bg-gold-500 text-cream-50 px-2.5 py-1 rounded-full">Low stock</span>}
        </div>
        <Link to={`/product/${product.id}`} className="block mt-3 space-y-1">
          <p className="text-[11px] tracking-widest2 uppercase text-ink-800/40">{category?.name}</p>
          <h3 className="font-display text-xl text-ink-900 leading-tight group-hover:text-blush-500 transition-colors">{product.name}</h3>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-sm text-ink-800/70">${product.price}</span>
            <StockBadge stock={product.stock} quantity={product.quantity} />
          </div>
        </Link>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label={`Share ${product.name} on Instagram`}
            onClick={handleInstagramShare}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#352820]/15 bg-white text-[#352820]/70 transition hover:border-[#a77c67]/40 hover:text-[#a77c67]"
          >
            <InstagramIcon className="h-4 w-4" />
          </button>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share ${product.name} on WhatsApp`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#352820]/15 bg-white text-[#352820]/70 transition hover:border-[#a77c67]/40 hover:text-[#a77c67]"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
