import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

export default function CategoryPage() {
  const { id } = useParams();
  const { categories, products, loading } = useStore();
  const category = categories.find((c) => c.id === id);
  const items = products.filter((p) => p.categoryId === id);

  if (loading) return <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center text-sm text-ink-800/50">Loading…</div>;

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 text-center">
        <p className="text-ink-800/60">This category doesn't exist.</p>
        <Link to="/shop" className="text-blush-500 underline text-sm">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
      <p className="text-[11px] tracking-widest2 uppercase text-blush-500 mb-2">
        Category
      </p>
      <h1 className="font-display text-4xl text-ink-900">{category.name}</h1>
      <p className="text-ink-800/55 mt-2 mb-10">{category.tagline}</p>

      {items.length === 0 ? (
        <p className="text-ink-800/50 py-16 text-center">
          No pieces in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {items.map((p, i) => (
            <ProductCard product={p} index={i} key={p.id} />
          ))}
        </div>
      )}
    </div>
  );
}
