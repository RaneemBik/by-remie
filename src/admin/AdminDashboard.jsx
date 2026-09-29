import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, AlertTriangle, XCircle, Tags } from "lucide-react";
import { useStore } from "../context/StoreContext";
import StockBadge from "../components/StockBadge";

export default function AdminDashboard() {
  const { products, categories, trash } = useStore();
  const lowStock = products.filter((p) => p.stock === "low");
  const soldOut = products.filter((p) => p.stock === "out");

  const stats = [
    { label: "Total products", value: products.length, icon: Package },
    { label: "Categories", value: categories.length, icon: Tags },
    { label: "Low stock", value: lowStock.length, icon: AlertTriangle },
    { label: "In trash", value: trash.length, icon: XCircle },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <p className="text-[10px] tracking-[.22em] uppercase text-[#a77c67] mb-1">Overview</p>
      <h1 className="font-display text-3xl sm:text-4xl mb-7">Your catalog</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="bg-[#fbf8f4] border border-[#352820]/10 rounded-sm p-4 sm:p-5"
          >
            <s.icon className="w-4 h-4 text-[#a77c67] mb-3" />
            <p className="font-display text-3xl">{s.value}</p>
            <p className="text-xs text-[#352820]/50 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <section className="bg-[#fbf8f4] border border-[#352820]/10 rounded-sm p-4 sm:p-5">
          <h2 className="font-display text-xl mb-4">Needs attention</h2>
          {lowStock.length + soldOut.length === 0 ? (
            <p className="text-sm text-[#352820]/50">Everything is well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {[...lowStock, ...soldOut].slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm truncate">{p.name}</span>
                  <StockBadge stock={p.stock} quantity={p.quantity} />
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/products"
            className="inline-block mt-5 text-[11px] tracking-[.16em] uppercase text-[#a77c67]"
          >
            Manage products →
          </Link>
        </section>

        <section className="bg-[#fbf8f4] border border-[#352820]/10 rounded-sm p-4 sm:p-5">
          <h2 className="font-display text-xl mb-4">Categories</h2>
          <ul className="space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3">
                <span className="text-sm">{c.name}</span>
                <span className="text-xs text-[#352820]/45">
                  {products.filter((p) => p.categoryId === c.id).length} items
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/admin/categories"
            className="inline-block mt-5 text-[11px] tracking-[.16em] uppercase text-[#a77c67]"
          >
            Manage categories →
          </Link>
        </section>
      </div>
    </div>
  );
}

