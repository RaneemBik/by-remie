import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
const PAGE_SIZE=9;
export default function ShopAll() {
  const { categories, products } = useStore(); const [params,setParams]=useSearchParams();
  const activeCat=params.get("category")||"all"; const [query,setQuery]=useState(""); const [page,setPage]=useState(1);
  const filtered=useMemo(()=>products.filter(p=>(activeCat==="all"||p.categoryId===activeCat)&&p.name.toLowerCase().includes(query.toLowerCase())),[products,activeCat,query]);
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)); const current=Math.min(page,pages);
  useEffect(()=>setPage(1),[activeCat,query]);
  return <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16"><p className="text-[11px] tracking-[.24em] uppercase text-[#a77c67] mb-2">The full catalog</p><h1 className="font-display text-4xl md:text-5xl text-[#352820] mb-3">Shop the edit</h1>
    <p className="text-sm text-[#65584f]/70 mb-8">For inquiries or orders, send us a DM on Instagram or contact us via WhatsApp.</p>
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-9"><div className="flex flex-wrap gap-2"><button onClick={()=>setParams({})} className={`text-[11px] tracking-[.14em] uppercase px-4 py-2 rounded-full border ${activeCat==="all"?"bg-[#352820] text-white border-[#352820]":"border-[#352820]/20 text-[#352820]/70 hover:border-[#a77c67]"}`}>All</button>{categories.map(c=><button key={c.id} onClick={()=>setParams({category:c.id})} className={`text-[11px] tracking-[.14em] uppercase px-4 py-2 rounded-full border ${activeCat===c.id?"bg-[#352820] text-white border-[#352820]":"border-[#352820]/20 text-[#352820]/70 hover:border-[#a77c67]"}`}>{c.name}</button>)}</div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products…" className="md:ml-auto w-full md:w-56 bg-transparent border-b border-[#352820]/20 py-2 text-sm placeholder:text-[#352820]/35 focus:border-[#a77c67]"/></div>
    {filtered.length===0?<p className="text-[#65584f]/60 py-16 text-center">Nothing matches yet — try a different search or category.</p>:<><div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">{filtered.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE).map((p,i)=><ProductCard product={p} index={i} key={p.id}/>)}</div><div className="flex items-center justify-center gap-3 mt-12"><button disabled={current===1} onClick={()=>setPage(p=>p-1)} aria-label="Previous page" className="p-2 rounded-full border border-[#352820]/20 disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button><span className="text-xs tracking-widest uppercase text-[#65584f]/70">Page {current} of {pages}</span><button disabled={current===pages} onClick={()=>setPage(p=>p+1)} aria-label="Next page" className="p-2 rounded-full border border-[#352820]/20 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button></div></>}
  </div>;
}
