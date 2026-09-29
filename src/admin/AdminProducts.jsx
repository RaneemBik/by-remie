import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import StockBadge from "../components/StockBadge";
import ProductArt from "../components/ProductArt";
import AdminProductForm from "./AdminProductForm";

export default function AdminProducts() {
  const { products, categories, deleteProduct } = useStore();
  const [editing, setEditing] = useState(null); // product object or "new" or null
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  useEffect(() => setPage((p) => Math.min(p, pageCount)), [pageCount]);
  const visibleProducts = products.slice((page - 1) * pageSize, page * pageSize);

  const categoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "Uncategorized";

  if (editing) {
    return (
      <AdminProductForm
        product={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-widest2 uppercase text-blush-500 mb-1">
            Manage
          </p>
          <h1 className="font-display text-3xl text-ink-900">Products</h1>
        </div>
        <button
          onClick={() => setEditing("new")}
          disabled={categories.length === 0}
          className="flex items-center gap-2 bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-5 py-3 rounded-full hover:bg-blush-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {notice && <p className="text-sm text-[#a04d42] mb-4">{notice}</p>}

      {categories.length === 0 && (
        <p className="text-sm text-gold-500 mb-6">
          Add a category first before creating products.
        </p>
      )}

      <div className="bg-cream-50 border border-ink-800/10 rounded-sm overflow-hidden">
        <div className="md:hidden divide-y divide-ink-800/10">{visibleProducts.map(p=><div key={p.id} className="p-3 flex items-center gap-3"><div className="w-14 h-14 shrink-0 rounded-sm overflow-hidden"><ProductArt categoryId={p.categoryId} accent={categories.find(c=>c.id===p.categoryId)?.accent} image={p.image}/></div><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-ink-800/50">{categoryName(p.categoryId)} · ${p.price}</p><div className="mt-1"><StockBadge stock={p.stock} quantity={p.quantity}/></div></div><div className="flex gap-1"><button onClick={()=>setEditing(p)} aria-label="Edit" className="p-2"><Pencil className="w-4 h-4"/></button><button onClick={()=>setConfirmDelete(p)} aria-label="Move to trash" className="p-2 text-blush-500"><Trash2 className="w-4 h-4"/></button></div></div>)}</div>
        <table className="hidden md:table w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800/10 text-left text-[11px] tracking-widest2 uppercase text-ink-800/40">
              <th className="p-4 font-normal">Product</th>
              <th className="p-4 font-normal">Category</th>
              <th className="p-4 font-normal">Price</th>
              <th className="p-4 font-normal">Stock</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((p) => (
              <tr key={p.id} className="border-b border-ink-800/5 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0">
                      <ProductArt
                        categoryId={p.categoryId}
                        accent={categories.find((c) => c.id === p.categoryId)?.accent}
                        image={p.image}
                      />
                    </div>
                    <span className="text-ink-800/85">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-ink-800/60">{categoryName(p.categoryId)}</td>
                <td className="p-4 text-ink-800/60">${p.price}</td>
                <td className="p-4">
                  <StockBadge stock={p.stock} quantity={p.quantity} />
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="p-2 rounded-sm hover:bg-cream-100 text-ink-800/60"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p)}
                      className="p-2 rounded-sm hover:bg-cream-100 text-blush-500"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-ink-800/40">
                  No products yet — add your first piece.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {products.length > pageSize && <div className="flex items-center justify-center gap-3 py-4"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} aria-label="Previous page" className="p-2 border rounded-full disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button><span className="text-xs text-ink-800/60">Page {page} of {pageCount}</span><button disabled={page===pageCount} onClick={()=>setPage(p=>p+1)} aria-label="Next page" className="p-2 border rounded-full disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button></div>}

      {confirmDelete && (
        <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 px-5">
          <div className="bg-cream-50 rounded-sm p-6 max-w-sm w-full">
            <h3 className="font-display text-xl text-ink-900 mb-2">
              Remove {confirmDelete.name}?
            </h3>
            <p className="text-sm text-ink-800/55 mb-6">
              This moves the product to Trash. You can restore it or permanently delete it later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-sm text-ink-800/60 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const result = await deleteProduct(confirmDelete.id);
                  if (!result.ok) setNotice(result.message);
                  setConfirmDelete(null);
                }}
                className="text-sm bg-blush-500 text-cream-50 px-4 py-2 rounded-full"
              >
                Move to trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
