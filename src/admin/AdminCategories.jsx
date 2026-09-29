import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useStore } from "../context/StoreContext";

const ACCENTS = ["blush", "gold", "sage"];

export default function AdminCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } =
    useStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", tagline: "", accent: "blush" });

  const resetForm = () => setForm({ name: "", tagline: "", accent: "blush" });

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, tagline: c.tagline, accent: c.accent });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const result = await addCategory(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError("");
    resetForm();
    setAdding(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const result = await updateCategory(editingId, form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError("");
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-widest2 uppercase text-blush-500 mb-1">
            Manage
          </p>
          <h1 className="font-display text-3xl text-ink-900">Categories</h1>
        </div>
        {!adding && (
          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setAdding(true);
            }}
            className="flex items-center gap-2 bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-5 py-3 rounded-full hover:bg-blush-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add category
          </button>
        )}
      </div>

      {error && <p className="text-sm text-[#a04d42] mb-4">{error}</p>}

      {adding && (
        <form
          onSubmit={handleAdd}
          className="bg-cream-50 border border-blush-300 rounded-sm p-5 mb-6 space-y-4"
        >
          <CategoryFields form={form} setForm={setForm} />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-5 py-2.5 rounded-full"
            >
              Save category
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-[12px] tracking-widest2 uppercase text-ink-800/50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          if (editingId === c.id) {
            return (
              <form
                key={c.id}
                onSubmit={handleUpdate}
                className="bg-cream-50 border border-blush-300 rounded-sm p-5 space-y-4"
              >
                <CategoryFields form={form} setForm={setForm} />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-5 py-2.5 rounded-full"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1.5 text-[12px] tracking-widest2 uppercase text-ink-800/50"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </form>
            );
          }
          return (
            <div
              key={c.id}
              className="bg-cream-50 border border-ink-800/10 rounded-sm p-5 flex items-center justify-between"
            >
              <div>
                <h3 className="font-display text-xl text-ink-900">{c.name}</h3>
                <p className="text-sm text-ink-800/50">{c.tagline}</p>
                <p className="text-[11px] tracking-widest2 uppercase text-ink-800/35 mt-1">
                  {count} item{count !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(c)}
                  className="p-2 rounded-sm hover:bg-cream-100 text-ink-800/60"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(c)}
                  className="p-2 rounded-sm hover:bg-cream-100 text-blush-500"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && !adding && (
          <p className="text-ink-800/40 text-center py-10">
            No categories yet — add your first one.
          </p>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 px-5">
          <div className="bg-cream-50 rounded-sm p-6 max-w-sm w-full">
            <h3 className="font-display text-xl text-ink-900 mb-2">
              Remove {confirmDelete.name}?
            </h3>
            <p className="text-sm text-ink-800/55 mb-6">
              Products in this category will be removed from the catalog too.
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
                  const result = await deleteCategory(confirmDelete.id);
                  setError(result.ok ? "" : result.message);
                  setConfirmDelete(null);
                }}
                className="text-sm bg-blush-500 text-cream-50 px-4 py-2 rounded-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryFields({ form, setForm }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
            placeholder="e.g. Skincare"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
            Tagline
          </label>
          <input
            value={form.tagline}
            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
            className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
            placeholder="Short description"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
          Accent
        </label>
        <div className="flex gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setForm((f) => ({ ...f, accent: a }))}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                form.accent === a ? "scale-110 border-ink-900" : "border-transparent"
              } ${
                a === "blush" ? "bg-blush-300" : a === "gold" ? "bg-gold-400" : "bg-sage-400"
              }`}
              aria-label={a}
            />
          ))}
        </div>
      </div>
    </>
  );
}
