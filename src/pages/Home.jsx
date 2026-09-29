import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

export default function Home() {
  const { categories, products, featuredProducts } = useStore();
  const [productPage,setProductPage] = useState(1);
  const pageSize=6;
  const pageCount=Math.max(1,Math.ceil(products.length/pageSize));
  useEffect(()=>setProductPage(p=>Math.min(p,pageCount)),[pageCount]);
  return <div><Hero/>
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-8"><div><p className="text-[11px] tracking-[.24em] uppercase text-[#a77c67] mb-2">The collection</p><h2 className="font-display text-3xl md:text-4xl text-[#352820]">Explore the edit</h2><p className="text-sm text-[#65584f]/70 mt-2">Discover makeup and skincare selected for you.</p></div><Link to="/shop" className="shrink-0 inline-flex items-center gap-2 text-[11px] tracking-[.16em] uppercase text-[#352820] hover:text-[#a77c67]">View all products <ArrowRight className="w-4 h-4"/></Link></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">{products.slice((productPage-1)*pageSize,productPage*pageSize).map((p,i)=><ProductCard product={p} index={i} key={p.id}/>)}</div>
      {pageCount>1&&<div className="flex items-center justify-center gap-3 mt-8"><button disabled={productPage===1} onClick={()=>setProductPage(p=>p-1)} aria-label="Previous products" className="p-2 border border-[#352820]/20 rounded-full disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button><span className="text-xs tracking-widest uppercase text-[#65584f]/70">Page {productPage} of {pageCount}</span><button disabled={productPage===pageCount} onClick={()=>setProductPage(p=>p+1)} aria-label="Next products" className="p-2 border border-[#352820]/20 rounded-full disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button></div>}
      {products.length===0&&<p className="py-12 text-center text-sm text-[#65584f]/60">Products will appear here soon.</p>}
      <div className="text-center mt-10"><Link to="/shop" className="inline-flex items-center gap-2 border border-[#352820]/25 rounded-full px-7 py-3 text-[11px] tracking-[.18em] uppercase hover:bg-[#352820] hover:text-white transition-colors">View all products <ArrowRight className="w-4 h-4"/></Link></div>
    </section>
    {featuredProducts.length>0&&<section className="bg-[#f4eee8] py-16 md:py-20"><div className="max-w-6xl mx-auto px-5 md:px-8"><div className="mb-8"><p className="text-[11px] tracking-[.24em] uppercase text-[#a77c67] mb-2">Selected for you</p><h2 className="font-display text-3xl md:text-4xl text-[#352820]">Featured products</h2></div><div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">{featuredProducts.map((p,i)=><ProductCard product={p} index={i} key={p.id}/>)}</div></div></section>}
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-16"><p className="text-[11px] tracking-[.24em] uppercase text-[#a77c67] mb-2">Find your favorites</p><h2 className="font-display text-3xl md:text-4xl text-[#352820] mb-8">Shop by category</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{categories.map(c=>{const count=products.filter(p=>p.categoryId===c.id).length;return <Link key={c.id} to={`/category/${c.id}`} className="group bg-[#fbf8f4] rounded-sm p-5 sm:p-6 border border-[#352820]/10 hover:border-[#a77c67]/50 transition-colors"><h3 className="font-display text-xl sm:text-2xl text-[#352820] group-hover:text-[#a77c67]">{c.name}</h3><p className="text-sm text-[#65584f]/60 mt-1">{c.tagline}</p><p className="text-[10px] tracking-[.16em] uppercase text-[#65584f]/45 mt-4">{count} piece{count!==1?"s":""}</p></Link>})}</div></section>
  </div>;
}
