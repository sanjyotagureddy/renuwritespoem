"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  updateAuthorProfile,
  addGalleryImage,
  deleteGalleryImage,
  updateGalleryOrder,
  updateGalleryImageCategory,
} from "@/app/admin/author-actions";
import { ArrowUp, ArrowDown, Trash2, Upload, Loader2, Sparkles, Image as ImageIcon, Plus } from "lucide-react";

type AuthorGalleryImage = {
  id: string;
  url: string | null;
  fileData: string | null;
  fileMime: string | null;
  width: number;
  height: number;
  caption?: string | null;
  category?: string | null;
  order: number;
};

type AuthorProfileWithGallery = {
  id: string;
  whyIWrite: string | null;
  writingJourney: string | null;
  inspiration: string | null;
  awards: string | null;
  publications: string | null;
  interviews: string | null;
  behindTheScenes: string | null;
  writingDesk: string | null;
  gallery: AuthorGalleryImage[];
};

type ListItem = {
  id: string;
  text: string;
  url: string;
};

const parseStringToList = (str: string | null): ListItem[] => {
  if (!str) return [];
  return str
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const rawUrlRegex = /(https?:\/\/[^\s]+)/;
      const match = line.match(rawUrlRegex);
      if (match) {
        const url = match[1];
        const text = line.replace(rawUrlRegex, "").trim();
        return { id: `item-${index}-${Math.random()}`, text, url };
      }
      return { id: `item-${index}-${Math.random()}`, text: line, url: "" };
    });
};

const listToString = (items: ListItem[]): string => {
  return items
    .map((item) => {
      const trimmedText = item.text.trim();
      const trimmedUrl = item.url.trim();
      if (trimmedUrl) {
        return `${trimmedText} ${trimmedUrl}`;
      }
      return trimmedText;
    })
    .join("\n");
};

function InteractiveListManager({
  title,
  items,
  setItems,
  placeholderText,
  placeholderUrl = "https://example.com/link",
  type,
}: {
  title: string;
  items: ListItem[];
  setItems: React.Dispatch<React.SetStateAction<ListItem[]>>;
  placeholderText: string;
  placeholderUrl?: string;
  type: "awards" | "publications" | "interviews";
}) {
  const [newItemText, setNewItemText] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ListItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      text: newItemText.trim(),
      url: newItemUrl.trim(),
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemText("");
    setNewItemUrl("");
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setItems(updated);
  };

  const getItemIcon = (text: string, url: string) => {
    const lowerText = text.toLowerCase();
    const lowerUrl = url.toLowerCase();
    
    if (type === "awards") {
      if (
        lowerText.includes("1st") ||
        lowerText.includes("first") ||
        lowerText.includes("winner") ||
        lowerText.includes("champion")
      ) {
        return "🥇";
      }
      if (
        lowerText.includes("2nd") ||
        lowerText.includes("second") ||
        lowerText.includes("runner")
      ) {
        return "🥈";
      }
      if (lowerText.includes("3rd") || lowerText.includes("third")) {
        return "🥉";
      }
      return "🏆";
    }

    if (type === "publications") {
      if (lowerText.includes("book") || lowerText.includes("novel")) {
        return "📚";
      }
      if (
        lowerText.includes("newspaper") ||
        lowerText.includes("news") ||
        lowerText.includes("journal") ||
        lowerText.includes("column")
      ) {
        return "📰";
      }
      return "📖";
    }

    // interviews
    if (
      lowerText.includes("video") ||
      lowerText.includes("youtube") ||
      lowerText.includes("watch") ||
      lowerUrl.includes("youtube") ||
      lowerUrl.includes("youtu.be")
    ) {
      return "🎥";
    }
    if (
      lowerText.includes("podcast") ||
      lowerText.includes("audio") ||
      lowerText.includes("listen") ||
      lowerUrl.includes("spotify") ||
      lowerUrl.includes("soundcloud")
    ) {
      return "🎙️";
    }
    return "💬";
  };

  return (
    <div className="space-y-4 border border-white/10 bg-white/[0.01] rounded-xl p-4 flex flex-col h-full min-h-[360px] justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold">{title}</h3>
          <span className="text-[10px] text-white/40">{items.length} items</span>
        </div>

        {/* Add New Item fields */}
        <div className="space-y-2 bg-black/25 p-3 rounded-lg border border-white/5">
          <div className="space-y-1">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={placeholderText}
              className="w-full rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              placeholder={placeholderUrl}
              className="flex-1 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center justify-center rounded-md bg-white px-3 text-black hover:bg-white/90 font-semibold cursor-pointer"
              title="Add Item"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List items scroll section */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="text-[11px] text-white/30 italic text-center py-8">No entries added.</p>
          ) : (
            items.map((item, idx) => {
              const icon = getItemIcon(item.text, item.url);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-2 bg-white/[0.02] border border-white/5 hover:border-white/10 p-2.5 rounded-lg transition-colors group"
                >
                  <span className="text-base select-none shrink-0 pt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/90 font-semibold truncate">{item.text}</p>
                    {item.url && (
                      <p className="text-[10px] text-amber-400/80 truncate mt-0.5">{item.url}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, "up")}
                      className="p-1 rounded hover:bg-white/5 text-white/60 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMoveItem(idx, "down")}
                      className="p-1 rounded hover:bg-white/5 text-white/60 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 rounded hover:bg-rose-500/10 text-rose-400 cursor-pointer ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthorAdminClient({
  initialProfile,
}: {
  initialProfile: AuthorProfileWithGallery;
}) {
  const [activeTab, setActiveTab] = useState<"sections" | "gallery">("sections");
  const [profile, setProfile] = useState<AuthorProfileWithGallery>(initialProfile);
  
  // States for text form saving
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States for list managers
  const [awardsList, setAwardsList] = useState<ListItem[]>(() => parseStringToList(initialProfile.awards));
  const [publicationsList, setPublicationsList] = useState<ListItem[]>(() => parseStringToList(initialProfile.publications));
  const [interviewsList, setInterviewsList] = useState<ListItem[]>(() => parseStringToList(initialProfile.interviews));

  // States for gallery operations
  const GALLERY_CATEGORIES = [
    "Professional photos",
    "Book launches",
    "Writing desk",
    "Coffee moments",
    "Travel",
    "Reader meetups",
    "Signing books",
    "Events"
  ];
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<AuthorGalleryImage[]>(initialProfile.gallery);
  const [captionText, setCaptionText] = useState("");
  const [uploadCategory, setUploadCategory] = useState<string>("Uncategorized");

  const getImgSrc = (img: AuthorGalleryImage) => {
    if (img.url) return img.url;
    if (img.fileData && img.fileMime) {
      return `data:${img.fileMime};base64,${img.fileData}`;
    }
    return "/placeholder.jpg";
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus(null);

    const formData = new FormData(e.currentTarget);
    // Inject the serialized interactive list manager states
    formData.set("awards", listToString(awardsList));
    formData.set("publications", listToString(publicationsList));
    formData.set("interviews", listToString(interviewsList));

    startTransition(async () => {
      try {
        const updated = await updateAuthorProfile(formData);
        setProfile((prev) => ({
          ...prev,
          whyIWrite: updated.whyIWrite,
          writingJourney: updated.writingJourney,
          inspiration: updated.inspiration,
          awards: updated.awards,
          publications: updated.publications,
          interviews: updated.interviews,
          behindTheScenes: updated.behindTheScenes,
          writingDesk: updated.writingDesk,
        }));
        setSaveStatus({ type: "success", message: "Author profile saved successfully!" });
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (err) {
        setSaveStatus({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to update profile.",
        });
      }
    });
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { width, height } = await getImageDimensions(file);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("width", String(width));
        formData.append("height", String(height));
        formData.append("caption", captionText);
        if (uploadCategory !== "Uncategorized") {
          formData.append("category", uploadCategory);
        }

        const newImage = await addGalleryImage(formData);
        
        setGallery((prev) => {
          const updated = [...prev, newImage as AuthorGalleryImage];
          return updated.sort((a, b) => a.order - b.order);
        });
      }
      setCaptionText("");
      setUploadCategory("Uncategorized");
      e.target.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image(s).");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteGalleryImage(id);
      setGallery((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete image.");
    }
  };

  const handleMoveImage = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= gallery.length) return;

    const updated = [...gallery];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;

    setGallery(updated);

    try {
      const orderIds = updated.map((img) => img.id);
      await updateGalleryOrder(orderIds);
    } catch {
      alert("Failed to update display order on the server.");
      setGallery(gallery);
    }
  };

  const handleCategoryChange = async (id: string, newCategory: string) => {
    const finalCategory = newCategory === "Uncategorized" ? null : newCategory;
    try {
      await updateGalleryImageCategory(id, finalCategory);
      setGallery((prev) =>
        prev.map((img) => (img.id === id ? { ...img, category: finalCategory } : img))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update category.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`px-4 py-2.5 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "sections"
              ? "border-amber-400 text-amber-300"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Story Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2.5 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "gallery"
              ? "border-amber-400 text-amber-300"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Photo Gallery ({gallery.length})
        </button>
      </div>

      {/* Tabs panels */}
      {activeTab === "sections" && (
        <form onSubmit={handleProfileSave} className="space-y-6 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Why I Write */}
            <div className="space-y-1.5">
              <label htmlFor="whyIWrite" className="block text-xs uppercase tracking-wider text-white/50 font-bold">
                Why I Write (Intro Callout)
              </label>
              <textarea
                id="whyIWrite"
                name="whyIWrite"
                rows={3}
                defaultValue={profile.whyIWrite || ""}
                placeholder="Large quotation box content..."
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35 font-[family-name:var(--font-inter)]"
              />
            </div>

            {/* Journey & Inspiration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="writingJourney" className="block text-xs uppercase tracking-wider text-white/50 font-bold">
                  My Writing Journey
                </label>
                <textarea
                  id="writingJourney"
                  name="writingJourney"
                  rows={6}
                  defaultValue={profile.writingJourney || ""}
                  placeholder="Split paragraphs with a double newline (Enter twice)..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35 font-[family-name:var(--font-inter)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="inspiration" className="block text-xs uppercase tracking-wider text-white/50 font-bold">
                  My Inspiration
                </label>
                <textarea
                  id="inspiration"
                  name="inspiration"
                  rows={6}
                  defaultValue={profile.inspiration || ""}
                  placeholder="Split paragraphs with a double newline..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35 font-[family-name:var(--font-inter)]"
                />
              </div>
            </div>

            {/* Behind the Scenes & Writing Desk split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="behindScenes" className="block text-xs uppercase tracking-wider text-white/50 font-bold">
                  Behind the Scenes
                </label>
                <textarea
                  id="behindScenes"
                  name="behindTheScenes"
                  rows={6}
                  defaultValue={profile.behindTheScenes || ""}
                  placeholder="Tell readers about daily routines or drafts..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35 font-[family-name:var(--font-inter)]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="writingDesk" className="block text-xs uppercase tracking-wider text-white/50 font-bold">
                  The Writing Desk
                </label>
                <textarea
                  id="writingDesk"
                  name="writingDesk"
                  rows={6}
                  defaultValue={profile.writingDesk || ""}
                  placeholder="Describe the environment, tools, notebooks..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35 font-[family-name:var(--font-inter)]"
                />
              </div>
            </div>

            {/* Interactive Lists: Awards, Publications & Interviews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <InteractiveListManager
                title="Awards Manager"
                items={awardsList}
                setItems={setAwardsList}
                placeholderText="e.g. 1st Place, State Poetry Slam"
                placeholderUrl="https://news-outlet.com/award-announcement"
                type="awards"
              />

              <InteractiveListManager
                title="Publications Manager"
                items={publicationsList}
                setItems={setPublicationsList}
                placeholderText="e.g. Whispers of Wind Anthology"
                placeholderUrl="https://bookshop.org/books/whispers-of-wind"
                type="publications"
              />

              <InteractiveListManager
                title="Interviews Manager"
                items={interviewsList}
                setItems={setInterviewsList}
                placeholderText="e.g. Renu's talk show on Poetry Cafe"
                placeholderUrl="https://youtube.com/watch?v=video-id"
                type="interviews"
              />
            </div>

          </div>

          {/* Feedback messages */}
          {saveStatus && (
            <div
              className={`rounded-lg border px-4 py-3 text-xs font-semibold ${
                saveStatus.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-rose-500/20 bg-rose-500/5 text-rose-400"
              }`}
            >
              {saveStatus.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs tracking-wider text-black font-semibold uppercase hover:bg-white/90 disabled:opacity-50 transition-all cursor-pointer font-[family-name:var(--font-inter)]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "gallery" && (
        <div className="space-y-8">
          
          {/* Multi uploader and caption form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 font-bold">
                <ImageIcon className="h-4 w-4 text-amber-400" />
                Upload New Gallery Photos
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-[family-name:var(--font-inter)]">
                Upload up to 5MB JPG, PNG, or WebP files. Portrait and landscape structures auto-collate seamlessly into balanced columns on the public page.
              </p>
              
              <div className="space-y-1.5 pt-2">
                <label htmlFor="caption" className="block text-[10px] uppercase tracking-wider text-white/40">
                  Optional Image Caption
                </label>
                <input
                  id="caption"
                  type="text"
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="e.g. Reading at poetry sanctuary..."
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label htmlFor="uploadCategory" className="block text-[10px] uppercase tracking-wider text-white/40">
                  Image Category / Album
                </label>
                <select
                  id="uploadCategory"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full max-w-[280px] rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white outline-none transition-colors focus:border-white/35 font-[family-name:var(--font-inter)] cursor-pointer"
                >
                  <option value="Uncategorized" className="bg-neutral-900 text-white">Uncategorized (No category)</option>
                  {GALLERY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-neutral-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drop file target */}
            <div className="md:col-span-7 flex flex-col items-center justify-center border-2 border-dashed border-white/15 rounded-xl p-8 hover:border-white/35 hover:bg-white/[0.01] transition-all relative">
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
                  <p className="text-xs text-white/60">Uploading image, extracting dimensions...</p>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-3 cursor-pointer w-full text-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-400 hover:text-amber-300">Choose images to upload</span>
                    <p className="text-[10px] text-white/30 mt-1">Accepts multiple files</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {uploadError && (
              <div className="col-span-12 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-xs font-semibold text-rose-400">
                {uploadError}
              </div>
            )}
          </div>

          {/* Collated image list */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-white/40 font-bold">
              Gallery Images Arrangement ({gallery.length})
            </h3>

            {gallery.length === 0 ? (
              <div className="rounded-2xl border border-white/10 border-dashed p-12 text-center text-white/30 font-[family-name:var(--font-inter)] text-sm">
                No images added to the Author Profile yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gallery.map((img, idx) => {
                  const isPortrait = img.height > img.width;
                  return (
                    <div
                      key={img.id}
                      className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-4 rounded-xl relative group"
                    >
                      {/* Thumbnail wrapper */}
                      <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-white/5 bg-neutral-900 flex items-center justify-center">
                        <Image
                          src={getImgSrc(img)}
                          alt={img.caption || "Thumbnail"}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info & Caption */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] text-white/50">
                            {img.width} × {img.height}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border ${
                            isPortrait 
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}>
                            {isPortrait ? "Portrait" : "Landscape"}
                          </span>
                          {img.category && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-400 font-semibold">
                              {img.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/80 font-medium truncate font-[family-name:var(--font-inter)] mb-1">
                          {img.caption || <span className="italic text-white/20">No caption</span>}
                        </p>
                        <div className="pt-0.5">
                          <select
                            value={img.category || "Uncategorized"}
                            onChange={(e) => handleCategoryChange(img.id, e.target.value)}
                            className="rounded bg-neutral-900 border border-white/10 px-2 py-1 text-[10px] text-white/70 hover:text-white hover:border-white/20 focus:border-amber-400 outline-none w-full max-w-[160px] cursor-pointer font-[family-name:var(--font-inter)]"
                          >
                            <option value="Uncategorized" className="bg-neutral-900 text-white">Uncategorized</option>
                            {GALLERY_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} className="bg-neutral-900 text-white">
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Reordering and Actions controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, "up")}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 cursor-pointer"
                          aria-label="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === gallery.length - 1}
                          onClick={() => handleMoveImage(idx, "down")}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 cursor-pointer"
                          aria-label="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-500/10 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-2"
                          aria-label="Delete Image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
