import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductArt from "../components/ProductArt";
import StockBadge from "../components/StockBadge";
import ProductCard from "../components/ProductCard";
import { InstagramIcon } from "../components/BrandIcons";
import { useStore } from "../context/StoreContext";

const instagramUrl = (import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/").split("?")[0].replace(/\/+$/, "");
const instagramUsername = (instagramUrl.match(/instagram\.com\/([^/?]+)/i) || [])[1] || "";
const instagramDmUrl = instagramUsername ? `https://ig.me/m/${instagramUsername}` : instagramUrl;
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export default function ProductDetail() {
  const { id } = useParams();
  const { products, categories, loading } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const product = products.find((p) => p.id === id);
  const initialSelectedVariants = useMemo(() => {
    const defaults = {};
    if (!product?.variants) return defaults;
    product.variants.forEach((group) => {
      const first = group.values?.[0]?.label;
      if (first) defaults[group.name] = first;
    });
    return defaults;
  }, [product]);
  const [selectedVariants, setSelectedVariants] = useState(initialSelectedVariants);

  useEffect(() => {
    setSelectedVariants(initialSelectedVariants);
  }, [initialSelectedVariants]);

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

  const variantGroups = Array.isArray(product.variants) ? product.variants : [];
  const defaultSelections = initialSelectedVariants;

  const variantImageList = useMemo(() => {
    const images = [];

    variantGroups.forEach((group) => {
      const selectedValue = selectedVariants[group.name] || group.values?.[0]?.label || "";
      const option = (group.values || []).find((value) => value.label === selectedValue);
      const optionImages = Array.isArray(option?.images) ? option.images.filter(Boolean) : option?.image ? [option.image] : [];

      optionImages.forEach((url) => {
        if (url && !images.includes(url)) images.push(url);
      });
    });

    return images.length ? images : (product.images?.length ? product.images : product.image ? [product.image] : []);
  }, [product.images, product.image, selectedVariants, variantGroups]);

  useEffect(() => {
    setImageIndex(0);
  }, [selectedVariants, product.id]);

  const displayImage = variantImageList[imageIndex] || variantImageList[0] || product.image || (product.images?.[0] || "");

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : "";
  const inquiryText = encodeURIComponent(`Hi! I’m interested in this product: ${product.name} - ${productUrl}`);
  const whatsappInquiryUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${inquiryText}`
    : `https://wa.me/?text=${inquiryText}`;

  const handleInstagramInquiry = () => {
    const url = `${instagramDmUrl}?text=${encodeURIComponent(`Hi! I want to ask about this product: ${product.name} - ${productUrl}`)}`;
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = url;
    }
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
            <ProductArt
              categoryId={product.categoryId}
              accent={category?.accent}
              image={displayImage}
            />
            {(variantImageList.length > 1) && <><button onClick={()=>setImageIndex(i=>(i-1+variantImageList.length)%variantImageList.length)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-2 shadow"><ChevronLeft className="w-4 h-4"/></button><button onClick={()=>setImageIndex(i=>(i+1)%variantImageList.length)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-2 shadow"><ChevronRight className="w-4 h-4"/></button><div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">{variantImageList.map((_,i)=><button key={i} onClick={()=>setImageIndex(i)} aria-label={`Show image ${i+1}`} className={`w-2 h-2 rounded-full ${i===imageIndex?"bg-[#352820]":"bg-white/80"}`}/>)}</div></>}
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

          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="mt-8 space-y-4">
              {product.variants.map((group, index) => (
                <div key={`${group.name || "variant"}-${index}`}>
                  <p className="text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">{group.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {(group.values || []).map((value, valueIndex) => {
                      const isSelected = (selectedVariants[group.name] || defaultSelections[group.name] || group.values?.[0]?.label) === value.label;
                      return (
                        <button
                          key={`${group.name}-${value.label}-${valueIndex}`}
                          type="button"
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [group.name]: value.label }))}
                          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors ${
                            isSelected ? "border-[#352820] bg-[#352820] text-white" : "border-ink-800/15 bg-[#fbf8f4] text-ink-800/75 hover:border-[#a77c67]"
                          }`}
                        >
                          {value.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

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
