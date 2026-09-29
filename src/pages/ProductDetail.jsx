import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useState } from "react";
import ProductArt from "../components/ProductArt";
import StockBadge from "../components/StockBadge";
import ProductCard from "../components/ProductCard";
import { InstagramIcon } from "../components/BrandIcons";
import { useStore } from "../context/StoreContext";

const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/";
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export default function ProductDetail() {
  const { id } = useParams();
  const { products, categories, loading } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const product = products.find((p) => p.id === id);

  if (loading) return <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center text-sm text-ink-800/50">Loading…</div>;

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center">
        <p className="text-ink-800/60">This piece isn't in the catalog.</p>
        <Link to="/shop" className="text-blush-500 underline text-sm">
          Back to shop
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : "";
  const inquiryText = encodeURIComponent(`Hi! I’m interested in this product: ${product.name} - ${productUrl}`);
  const whatsappInquiryUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${inquiryText}`
    : `https://wa.me/?text=${inquiryText}`;

  const handleInstagramInquiry = () => {
    if (!productUrl) return;

    const appUrl = `instagram://share?text=${inquiryText}`;
    const popup = window.open(appUrl, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.href = appUrl;
      return;
    }

    setTimeout(() => {
      window.open(instagramUrl, "_blank", "noopener,noreferrer");
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-[12px] tracking-widest2 uppercase text-ink-800/50 hover:text-blush-500 mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="aspect-[4/5] rounded-sm overflow-hidden"
        >
          <div className="relative w-full h-full">
            <ProductArt categoryId={product.categoryId} accent={category?.accent} image={(product.images?.length ? product.images : product.image ? [product.image] : [])[imageIndex] || product.image} />
            {(product.images?.length || 0) > 1 && <><button onClick={()=>setImageIndex(i=>(i-1+product.images.length)%product.images.length)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-2 shadow"><ChevronLeft className="w-4 h-4"/></button><button onClick={()=>setImageIndex(i=>(i+1)%product.images.length)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-2 shadow"><ChevronRight className="w-4 h-4"/></button><div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">{product.images.map((_,i)=><button key={i} onClick={()=>setImageIndex(i)} aria-label={`Show image ${i+1}`} className={`w-2 h-2 rounded-full ${i===imageIndex?"bg-[#352820]":"bg-white/80"}`}/>)}</div></>}
          </div>
        </motion.div>

        <div>
          <p className="text-[11px] tracking-widest2 uppercase text-blush-500 mb-2">
            {category?.name}
          </p>
          <h1 className="font-display text-4xl text-ink-900 mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg text-ink-800/80">${product.price}</span>
            <StockBadge stock={product.stock} quantity={product.quantity} size="md" />
          </div>
          <p className="text-ink-800/65 leading-relaxed max-w-md">
            {product.description}
          </p>

          <div className="mt-8 pt-8 border-t border-ink-800/10">
            <p className="text-sm text-ink-800/50 mb-4">
              This catalog is for browsing — to ask about this piece, reach
              out directly.
            </p>

            <div className="flex flex-col items-start gap-3">
              <button
                type="button"
                onClick={handleInstagramInquiry}
                className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-6 py-3 rounded-full hover:bg-blush-500 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" /> Ask About This Via Instagram
              </button>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-6 py-3 rounded-full hover:bg-blush-500 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Ask About This Via Whatsapp
              </a>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-2xl text-ink-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {related.map((p, i) => (
              <ProductCard product={p} index={i} key={p.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
