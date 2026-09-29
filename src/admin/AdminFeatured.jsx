import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useStore } from "../context/StoreContext";

const PAGE_SIZE = 8;

export default function AdminFeatured() {
  const { products, featuredIds, setFeatured } = useStore();
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(Math.max(1, featuredIds.length || 4));

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setLimit((current) => Math.max(1, Math.min(current, products.length || 1)));
  }, [products.length]);

  const save = async (ids) => {
    const result = await setFeatured(ids);
    setError(result.ok ? "" : result.message);
  };

  const toggleFeatured = (id) => {
    const next = featuredIds.includes(id)
      ? featuredIds.filter((item) => item !== id)
      : [...featuredIds, id];

    save(next);
  };

  const handleLimitChange = (nextLimit) => {
    const safeLimit = Number(nextLimit);
    setLimit(safeLimit);
    if (featuredIds.length > safeLimit) save(featuredIds.slice(0, safeLimit));
  };

  const visibleProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-widest2 uppercase text-blush-500 mb-1">
            Manage
          </p>
          <h1 className="font-display text-3xl text-ink-900">Featured products</h1>
        </div>

        <label className="flex items-center gap-2 text-xs text-[#352820]/70">
          Maximum shown
          <select
            value={limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="border border-[#352820]/20 bg-white rounded px-2 py-1.5"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-[#a04d42] mb-4">{error}</p>}

      <section className="bg-[#fbf8f4] border border-[#352820]/10 rounded-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-[#a77c67]" />
          <h2 className="font-display text-2xl">Homepage spotlight</h2>
        </div>
        <p className="text-xs text-[#352820]/55 mb-5">
          Choose which products appear in the homepage’s featured section.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleProducts.map((product) => {
            const isFeatured = featuredIds.includes(product.id);
            const disabled = !isFeatured && featuredIds.length >= limit;

            return (
              <label
                key={product.id}
                className="flex items-center gap-3 border border-[#352820]/10 rounded p-3 text-sm min-w-0 bg-white/40"
              >
                <input
                  type="checkbox"
                  checked={isFeatured}
                  disabled={disabled}
                  onChange={() => toggleFeatured(product.id)}
                  className="accent-[#a77c67]"
                />
                <span className="truncate flex-1">{product.name}</span>
                <span className="text-[10px] text-[#352820]/40">
                  {isFeatured ? "Featured" : ""}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-[#352820]/10">
          <p className="text-xs text-[#352820]/50">
            Selected: {featuredIds.length} / {limit}
          </p>

          {products.length > PAGE_SIZE && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                aria-label="Previous featured products page"
                className="p-2 border rounded-full disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#352820]/60">
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
                aria-label="Next featured products page"
                className="p-2 border rounded-full disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
