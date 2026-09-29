import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { useStore } from "../context/StoreContext";
import ProductArt from "../components/ProductArt";

const STOCK_OPTIONS = [
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Sold out" },
];

export default function AdminProductForm({ product, onClose }) {
  const { categories, products, addProduct, updateProduct, uploadProductImage, deleteImages } = useStore();
  const isEdit = Boolean(product);
  const sessionUploads = useRef([]); // images uploaded during this edit session (cleaned up on cancel)
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(
    product || {
      name: "",
      categoryId: categories[0]?.id || "",
      price: "",
      stock: "in",
      quantity: 10,
      description: "",
      image: "",
      images: [],
    }
  );

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const images = form.images?.length ? form.images : form.image ? [form.image] : [];

  const handleImage = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setError("");
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const result = await uploadProductImage(file);
      if (result.ok) {
        uploaded.push(result.url);
        sessionUploads.current.push(result.url);
      } else {
        setError(result.message);
      }
    }
    if (uploaded.length) update({ images: [...images, ...uploaded], image: images[0] || uploaded[0] });
    setUploading(false);
  };

  const removeImage = (index) => {
    const url = images[index];
    const next = images.filter((_, i) => i !== index);
    // Images uploaded in this session and never saved can be deleted right away.
    if (sessionUploads.current.includes(url)) {
      sessionUploads.current = sessionUploads.current.filter((u) => u !== url);
      deleteImages([url]);
    }
    update({ images: next, image: next[0] || "", imageIndex: 0 });
  };

  const handleCancel = () => {
    if (sessionUploads.current.length) deleteImages(sessionUploads.current);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId || uploading) return;
    setError("");
    const duplicate = products.some((p) => p.id !== product?.id && p.name.trim().toLocaleLowerCase() === form.name.trim().toLocaleLowerCase());
    if (duplicate) {
      setError("This product has already been added. Please use a different name.");
      return;
    }
    setSaving(true);
    const payload = { ...form, images };
    const result = isEdit ? await updateProduct(product.id, payload) : await addProduct(payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    // Images the admin removed from an existing product are no longer needed in storage.
    if (isEdit) {
      const removed = (product.images || []).filter((url) => !images.includes(url));
      if (removed.length) deleteImages(removed);
    }
    onClose();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl w-full">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-[12px] tracking-widest2 uppercase text-ink-800/50 hover:text-blush-500 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to products
      </button>

      <h1 className="font-display text-3xl text-ink-900 mb-8">
        {isEdit ? `Edit ${product.name}` : "Add a product"}
      </h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-[240px_minmax(0,1fr)] gap-6 md:gap-8">
        <div>
          <div className="aspect-square rounded-sm overflow-hidden border border-ink-800/10 mb-3 relative">
            <ProductArt categoryId={form.categoryId} accent={categories.find((c) => c.id === form.categoryId)?.accent} image={images[form.imageIndex || 0] || form.image} />
            {(form.images?.length || (form.image ? 1 : 0)) > 1 && <><button type="button" onClick={()=>update({ imageIndex: ((form.imageIndex||0)-1+(form.images?.length||1))%(form.images?.length||1) })} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5" aria-label="Previous image">‹</button><button type="button" onClick={()=>update({ imageIndex: ((form.imageIndex||0)+1)%(form.images?.length||1) })} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5" aria-label="Next image">›</button></>}
          </div>
          <label className="flex items-center justify-center gap-2 text-[12px] tracking-widest2 uppercase border border-ink-800/15 rounded-sm py-2.5 cursor-pointer hover:border-blush-400 transition-colors"><ImagePlus className="w-4 h-4" /> {uploading ? "Uploading…" : "Add images"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple disabled={uploading} className="hidden" onChange={handleImage} /></label>
          <p className="text-xs text-ink-800/45 mt-2">Photos are resized and saved to your store. The first image is the cover.</p>
          <div className="grid grid-cols-4 gap-2 mt-3">{images.map((image, i) => <div key={image} className={`relative aspect-square border rounded-sm overflow-hidden ${i === (form.imageIndex || 0) ? "border-blush-500" : "border-ink-800/10"}`}><button type="button" className="w-full h-full" onClick={() => update({ imageIndex: i })}><img src={image} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" /></button><button type="button" aria-label={`Remove image ${i + 1}`} onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5"><X className="w-3 h-3" /></button></div>)}</div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
              Product name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
              placeholder="e.g. Effortless Glow Serum"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
                Category
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => update({ categoryId: e.target.value })}
                className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
                Price (USD)
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
                className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
                Stock status
              </label>
              <select
                value={form.stock}
                onChange={(e) => update({ stock: e.target.value })}
                className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
              >
                {STOCK_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
                Quantity remaining
              </label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => update({ quantity: Number(e.target.value) })}
                className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-widest2 uppercase text-ink-800/50 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              className="w-full border border-ink-800/15 rounded-sm px-4 py-2.5 bg-cream-50 focus:border-blush-400 resize-none"
              placeholder="What makes this piece worth featuring…"
            />
          </div>

          {error && <p className="text-sm text-[#a04d42] bg-[#fbf3ef] border border-[#d4b4a7] rounded px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-ink-900 text-cream-50 text-[12px] tracking-widest2 uppercase px-6 py-3 rounded-full hover:bg-blush-500 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-[12px] tracking-widest2 uppercase text-ink-800/50 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
