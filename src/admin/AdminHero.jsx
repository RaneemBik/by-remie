import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useStore } from "../context/StoreContext";

export default function AdminHero() {
  const { heroSettings, saveHeroSettings } = useStore();
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState("default");
  const [videoUrls, setVideoUrls] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMode(heroSettings?.mode || "default");
    setVideoUrls(heroSettings?.videos || []);
  }, [heroSettings]);

  const uploadVideoFiles = async (files) => {
    const selected = Array.from(files || []).filter((file) => file && file.type.startsWith("video/"));
    if (!selected.length) {
      setMessage("Please choose a video file from your device.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const uploaded = [];
      for (const file of selected) {
        const safeName = (file.name || "hero-video").replace(/\s+/g, "-");
        const path = `site-hero/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type || "video/mp4",
        });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        if (data?.publicUrl) uploaded.push(data.publicUrl);
      }

      setVideoUrls((prev) => [...prev, ...uploaded.filter((url) => !prev.includes(url))]);
      setMessage(uploaded.length ? `${uploaded.length} video${uploaded.length > 1 ? "s" : ""} added.` : "No video was added.");
    } catch (error) {
      setMessage(error.message || "The video could not be uploaded.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeVideoUrl = (urlToRemove) => {
    setVideoUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const result = await saveHeroSettings({ mode, videos: videoUrls });
    setMessage(result.ok ? "Hero background updated." : result.message || "Could not save the hero settings.");
    setSaving(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    uploadVideoFiles(event.dataTransfer?.files);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <p className="text-[10px] tracking-[.22em] uppercase text-[#a77c67] mb-2">Brand settings</p>
      <h1 className="font-display text-3xl sm:text-4xl mb-6">Hero background</h1>

      <div className="bg-[#fbf8f4] border border-[#352820]/10 rounded-sm p-4 sm:p-5">
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/55 mb-2">Hero mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none"
            >
              <option value="default">Default static hero</option>
              <option value="video">Use background video</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/55 mb-2">Video files</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border border-dashed p-4 text-center transition-colors ${dragActive ? "border-[#a77c67] bg-[#f8efe9]" : "border-[#352820]/20 bg-white"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(event) => uploadVideoFiles(event.target.files)}
              />
              <p className="text-sm text-[#352820]/75">Drag and drop videos here</p>
              <p className="mt-2 text-xs text-[#352820]/55">MP4, MOV, WEBM and other supported video files</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 inline-flex items-center justify-center bg-[#352820] text-white text-[11px] tracking-[.18em] uppercase px-5 py-3 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Add from device"}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {videoUrls.length === 0 ? (
                <p className="text-sm text-[#352820]/55">No background videos added yet.</p>
              ) : (
                videoUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between gap-3 rounded-lg border border-[#352820]/10 bg-white px-3 py-2">
                    <span className="truncate text-sm text-[#352820]/75">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeVideoUrl(url)}
                      className="text-[10px] tracking-[.18em] uppercase text-[#a04d42] hover:text-[#7c372f]"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="mt-3 text-xs text-[#352820]/55">
              Choose videos directly from your device and remove them anytime. When video mode is enabled, the hero rotates through the selected clips.
            </p>
          </div>

          <div className="rounded-lg border border-[#352820]/10 bg-white/80 p-3">
            <p className="text-[10px] tracking-[.18em] uppercase text-[#352820]/55 mb-2">Preview</p>
            <div className="rounded-xl overflow-hidden border border-[#352820]/10 bg-[#201914] min-h-[180px] relative">
              {mode === "video" && videoUrls.length > 0 ? (
                <video src={videoUrls[0]} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(244,238,232,0.9)_30%,_rgba(236,213,203,0.82)_100%)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,12,10,0.45),rgba(17,12,10,0.18),rgba(17,12,10,0.42))]" />
              <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
                <div>
                  <p className="text-[10px] tracking-[.2em] uppercase text-white/80">Preview</p>
                  <h2 className="font-display text-2xl sm:text-3xl text-white mt-2">Where confidence meets pure beauty</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center bg-[#352820] text-white text-[11px] tracking-[.18em] uppercase px-6 py-3 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save hero"}
            </button>
            {message && <p className="text-sm text-[#352820]/70">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
