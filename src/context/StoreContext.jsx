import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";

const StoreContext = createContext(null);
const BUCKET = "product-images";

// ---- DB row <-> UI shape ----------------------------------------------------
const toCategory = (row) => ({
  id: row.id,
  name: row.name,
  tagline: row.tagline || "",
  accent: row.accent || "blush",
});

const toProduct = (row) => {
  const images = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    price: Number(row.price).toFixed(2),
    stock: row.stock,
    quantity: row.quantity,
    description: row.description || "",
    images,
    image: images[0] || "",
    featured: Boolean(row.is_featured),
    featuredAt: row.featured_at,
    deletedAt: row.deleted_at,
  };
};

const friendlyError = (error, fallback) => {
  if (!error) return fallback;
  if (error.code === "23505") return "That name is already in use. Please choose a different name.";
  if (error.code === "42501" || /row-level security/i.test(error.message || "")) {
    return "You don't have permission to do that. Please sign in again.";
  }
  return error.message || fallback;
};

const pathFromUrl = (url) => {
  const marker = `/${BUCKET}/`;
  const i = String(url || "").indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
};

/** Resize + compress in the browser so uploads stay small and fast. */
async function compressImage(file, maxSize = 1600, quality = 0.85) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function StoreProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    const [cats, prods] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("products").select("*").order("created_at", { ascending: true }),
    ]);
    if (cats.error || prods.error) {
      setLoadError((cats.error || prods.error).message || "Could not load the catalog.");
    } else {
      setLoadError("");
      setCategories(cats.data.map(toCategory));
      setAllProducts(prods.data.map(toProduct));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Reload when someone signs in/out: admins can also see Trash.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(load, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const products = useMemo(() => allProducts.filter((p) => !p.deletedAt), [allProducts]);
  const trash = useMemo(
    () => allProducts.filter((p) => p.deletedAt).sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)),
    [allProducts],
  );
  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured).sort((a, b) => new Date(a.featuredAt || 0) - new Date(b.featuredAt || 0)),
    [products],
  );
  const featuredIds = useMemo(() => featuredProducts.map((p) => p.id), [featuredProducts]);

  const upsertLocal = (product) =>
    setAllProducts((prev) => (prev.some((p) => p.id === product.id) ? prev.map((p) => (p.id === product.id ? product : p)) : [...prev, product]));

  // ---- Categories ----
  const addCategory = useCallback(async ({ name, tagline, accent }) => {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), tagline: (tagline || "").trim(), accent })
      .select()
      .single();
    if (error) return { ok: false, message: friendlyError(error, "The category could not be added.") };
    setCategories((prev) => [...prev, toCategory(data)]);
    return { ok: true };
  }, []);

  const updateCategory = useCallback(async (id, { name, tagline, accent }) => {
    const { data, error } = await supabase
      .from("categories")
      .update({ name: name.trim(), tagline: (tagline || "").trim(), accent })
      .eq("id", id)
      .select()
      .single();
    if (error) return { ok: false, message: friendlyError(error, "The category could not be saved.") };
    setCategories((prev) => prev.map((c) => (c.id === id ? toCategory(data) : c)));
    return { ok: true };
  }, []);

  const deleteCategory = useCallback(
    async (id) => {
      const doomed = allProducts.filter((p) => p.categoryId === id).flatMap((p) => p.images);
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) return { ok: false, message: friendlyError(error, "The category could not be deleted.") };
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setAllProducts((prev) => prev.filter((p) => p.categoryId !== id));
      const paths = doomed.map(pathFromUrl).filter(Boolean);
      if (paths.length) supabase.storage.from(BUCKET).remove(paths).catch(() => {});
      return { ok: true };
    },
    [allProducts],
  );

  // ---- Images ----
  const uploadProductImage = useCallback(async (file) => {
    if (!file.type.startsWith("image/")) return { ok: false, message: "Please choose an image file." };
    if (file.size > 25 * 1024 * 1024) return { ok: false, message: "That image is too large (max 25 MB)." };
    const body = await compressImage(file);
    const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType: body.type || file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) return { ok: false, message: friendlyError(error, "The image could not be uploaded.") };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  }, []);

  const deleteImages = useCallback(async (urls) => {
    const paths = (urls || []).map(pathFromUrl).filter(Boolean);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths).catch(() => {});
  }, []);

  // ---- Products ----
  const payloadFrom = (p) => ({
    category_id: p.categoryId,
    name: p.name.trim(),
    description: (p.description || "").trim(),
    price: Number(p.price),
    stock: p.stock,
    quantity: Math.max(0, Math.floor(Number(p.quantity) || 0)),
    images: (p.images || []).filter(Boolean),
  });

  const addProduct = useCallback(async (product) => {
    const { data, error } = await supabase.from("products").insert(payloadFrom(product)).select().single();
    if (error) return { ok: false, message: friendlyError(error, "The product could not be added.") };
    upsertLocal(toProduct(data));
    return { ok: true };
  }, []);

  const updateProduct = useCallback(async (id, product) => {
    const { data, error } = await supabase.from("products").update(payloadFrom(product)).eq("id", id).select().single();
    if (error) return { ok: false, message: friendlyError(error, "The product could not be saved.") };
    upsertLocal(toProduct(data));
    return { ok: true };
  }, []);

  const patchProduct = useCallback(async (id, patch, fallback) => {
    const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single();
    if (error) return { ok: false, message: friendlyError(error, fallback) };
    upsertLocal(toProduct(data));
    return { ok: true };
  }, []);

  // Soft delete → Trash. Also un-features it.
  const deleteProduct = useCallback(
    (id) => patchProduct(id, { deleted_at: new Date().toISOString(), is_featured: false, featured_at: null }, "The product could not be moved to Trash."),
    [patchProduct],
  );

  const restoreProduct = useCallback(
    (id) => patchProduct(id, { deleted_at: null }, "The product could not be restored."),
    [patchProduct],
  );

  const permanentlyDelete = useCallback(
    async (id) => {
      const product = allProducts.find((p) => p.id === id);
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) return { ok: false, message: friendlyError(error, "The product could not be deleted.") };
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
      if (product) deleteImages(product.images);
      return { ok: true };
    },
    [allProducts, deleteImages],
  );

  // ---- Featured ----
  const setFeatured = useCallback(
    async (ids) => {
      const target = new Set(ids);
      const current = new Set(featuredIds);
      const toOff = [...current].filter((id) => !target.has(id));
      const toOn = [...target].filter((id) => !current.has(id));
      const now = new Date().toISOString();

      if (toOff.length) {
        const { error } = await supabase.from("products").update({ is_featured: false, featured_at: null }).in("id", toOff);
        if (error) return { ok: false, message: friendlyError(error, "Featured products could not be updated.") };
      }
      if (toOn.length) {
        const { error } = await supabase.from("products").update({ is_featured: true, featured_at: now }).in("id", toOn);
        if (error) return { ok: false, message: friendlyError(error, "Featured products could not be updated.") };
      }
      setAllProducts((prev) =>
        prev.map((p) =>
          toOff.includes(p.id) ? { ...p, featured: false, featuredAt: null } : toOn.includes(p.id) ? { ...p, featured: true, featuredAt: now } : p,
        ),
      );
      return { ok: true };
    },
    [featuredIds],
  );

  const value = {
    loading,
    loadError,
    reload: load,
    categories,
    products,
    trash,
    featuredIds,
    featuredProducts,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    permanentlyDelete,
    setFeatured,
    uploadProductImage,
    deleteImages,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
