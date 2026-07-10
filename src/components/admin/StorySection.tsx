import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Image as ImageIcon, AlertCircle, Upload, Check } from "lucide-react";
import { AboutSection, PhilosophySlide } from "../../types";
import { AdminMediaUpload } from "./AdminMediaUpload";
import { uploadToFirebaseStorage } from "../../lib/firebase";

interface StorySectionProps {
  initialAbout: AboutSection;
  onSave: (about: AboutSection) => void;
}

export const StorySection: React.FC<StorySectionProps> = ({ initialAbout, onSave }) => {
  const [about, setAbout] = useState<AboutSection>(initialAbout);
  const [newSlide, setNewSlide] = useState({ title: "", imageUrl: "" });
  const [isSaved, setIsSaved] = useState(true);

  // States for multi-file uploading of slides
  const [multiUploads, setMultiUploads] = useState<
    { id: string; name: string; progress: number; status: "uploading" | "done" | "error" }[]
  >([]);

  useEffect(() => {
    setAbout(initialAbout);
  }, [initialAbout]);

  const handleFieldChange = (field: keyof AboutSection, value: any) => {
    setAbout((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleAddSlide = () => {
    if (!newSlide.imageUrl) return;
    const slides = about.philosophySlides || [];
    const newSlideItem: PhilosophySlide = {
      id: `p-slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: (newSlide.title.trim() || "PHILOSOPHY MOMENT").toUpperCase(),
      imageUrl: newSlide.imageUrl,
    };

    const updatedSlides = [...slides, newSlideItem];
    setAbout((prev) => ({ ...prev, philosophySlides: updatedSlides }));
    setNewSlide({ title: "", imageUrl: "" });
    setIsSaved(false);
  };

  const handleRemoveSlide = (id: string) => {
    const slides = about.philosophySlides || [];
    const updatedSlides = slides.filter((slide) => slide.id !== id);
    setAbout((prev) => ({ ...prev, philosophySlides: updatedSlides }));
    setIsSaved(false);
  };

  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    // Add files to upload tracking state
    const newUploads = files.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}-${f.name}`,
      name: f.name,
      progress: 0,
      status: "uploading" as const,
    }));
    
    setMultiUploads((prev) => [...prev, ...newUploads]);

    await Promise.all(
      files.map(async (file, idx) => {
        const trackingId = newUploads[idx].id;
        try {
          const downloadUrl = await uploadToFirebaseStorage(file, (pct) => {
            setMultiUploads((prev) =>
              prev.map((up) => (up.id === trackingId ? { ...up, progress: pct } : up))
            );
          });

          // Successfully uploaded! Automatically add as a slide
          setMultiUploads((prev) =>
            prev.map((up) => (up.id === trackingId ? { ...up, status: "done" as const } : up))
          );

          // Format title from filename
          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const cleanTitle = baseName
            .replace(/[-_]/g, " ")
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
            .toUpperCase();

          const slideItem: PhilosophySlide = {
            id: `p-slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: cleanTitle,
            imageUrl: downloadUrl,
          };

          setAbout((prev) => {
            const slides = prev.philosophySlides || [];
            return { ...prev, philosophySlides: [...slides, slideItem] };
          });
          setIsSaved(false);
        } catch (err) {
          console.error(`Failed to upload ${file.name}`, err);
          setMultiUploads((prev) =>
            prev.map((up) => (up.id === trackingId ? { ...up, status: "error" as const } : up))
          );
        }
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(about);
    setIsSaved(true);
    // Clear completed uploads list
    setMultiUploads([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Story &amp; Philosophy Slides</h3>
          <p className="text-xs text-zinc-400">Edit your about text and the luxury sliding philosophy catalog.</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaved}
          className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            isSaved
              ? "bg-zinc-800 text-zinc-500 cursor-default"
              : "bg-gold hover:bg-gold-dark text-luxury-black font-semibold hover:text-white"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaved ? "Saved" : "Apply Changes"}
        </button>
      </div>

      {/* Copy & Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Story Headline */}
          <div className="space-y-1.5">
            <label htmlFor="story-headline" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Story Headline
            </label>
            <input
              id="story-headline"
              type="text"
              value={about.storyHeadline}
              onChange={(e) => handleFieldChange("storyHeadline", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="Stories That Feel Like Home"
            />
          </div>

          {/* Story Description */}
          <div className="space-y-1.5">
            <label htmlFor="story-desc" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Story Description / Introduction
            </label>
            <textarea
              id="story-desc"
              value={about.storyDescription}
              onChange={(e) => handleFieldChange("storyDescription", e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="Provide a detailed intro about the brand philosophy..."
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Thumbnail */}
          <AdminMediaUpload
            id="about-photo"
            label="Story Thumbnail Photo"
            value={about.photoUrl}
            onChange={(url) => handleFieldChange("photoUrl", url)}
            accept="image/*"
          />

          {/* Philosophy Bg */}
          <AdminMediaUpload
            id="philosophy-bg"
            label="Philosophy Section Background Image"
            value={about.philosophyBgUrl || ""}
            onChange={(url) => handleFieldChange("philosophyBgUrl", url)}
            accept="image/*"
          />
        </div>
      </div>

      {/* Philosophy Slides Sliding Catalog */}
      <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
        <div>
          <h4 className="font-serif text-base text-gold font-semibold">Philosophy Sliding Catalog</h4>
          <p className="text-[10px] text-zinc-400">
            💡 Each image added here appears in the sliding gallery of the "OUR PHILOSOPHY" section. Give each image a custom title! You can also select and upload multiple files in one go.
          </p>
        </div>

        {/* Add single slide */}
        <div className="bg-white/2 border border-white/5 p-4 rounded-lg">
          <h5 className="text-[10px] uppercase tracking-wider text-gold font-bold mb-3">Add Custom Slide</h5>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <label htmlFor="new-slide-title" className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">
                Custom Slide Title
              </label>
              <input
                id="new-slide-title"
                type="text"
                value={newSlide.title}
                onChange={(e) => setNewSlide((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="E.g. THE ROYAL PORTRAIT"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50 font-medium uppercase"
              />
            </div>
            <div className="md:col-span-6 space-y-1">
              <AdminMediaUpload
                id="new-slide-image"
                label="Slide Image"
                value={newSlide.imageUrl}
                onChange={(url) => setNewSlide((prev) => ({ ...prev, imageUrl: url }))}
                accept="image/*"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="button"
                id="add-slide-btn"
                onClick={handleAddSlide}
                disabled={!newSlide.imageUrl}
                className="w-full h-[38px] bg-gold hover:bg-gold-dark text-luxury-black font-bold uppercase text-[10px] tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" /> Insert
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Upload Section */}
        <div className="bg-white/2 border border-dashed border-white/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
          <Upload className="w-6 h-6 text-gold mb-1.5" />
          <h5 className="text-[11px] uppercase tracking-wider text-white font-bold">Fast Multiple Image Upload</h5>
          <p className="text-[9px] text-zinc-400 mb-3 max-w-md">
            Instantly upload multiple wedding photos. They will be uploaded to Firebase in parallel and appended automatically with formatted titles.
          </p>
          <label htmlFor="bulk-slides-upload" className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors">
            Select Multiple Photos
          </label>
          <input
            id="bulk-slides-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultiUpload}
            className="hidden"
          />
        </div>

        {/* Multi upload progress display */}
        {multiUploads.length > 0 && (
          <div className="bg-white/2 border border-white/5 rounded-lg p-3 space-y-2">
            <h5 className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Background Upload Pipeline</h5>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {multiUploads.map((up) => (
                <div key={up.id} className="flex items-center justify-between text-[10px] font-mono border-b border-white/5 pb-1">
                  <span className="truncate max-w-[200px] text-zinc-300">{up.name}</span>
                  <div className="flex items-center gap-2">
                    {up.status === "uploading" && (
                      <span className="text-gold animate-pulse">Uploading {up.progress}%</span>
                    )}
                    {up.status === "done" && (
                      <span className="text-green-400 flex items-center gap-0.5"><Check className="w-3.5 h-3.5" /> Ready</span>
                    )}
                    {up.status === "error" && (
                      <span className="text-red-400 flex items-center gap-0.5"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Slides Grid */}
        <div className="space-y-2 pt-2">
          <h5 className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
            Current Sliding Philosophy Catalog ({about.philosophySlides?.length || 0})
          </h5>
          {!about.philosophySlides || about.philosophySlides.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No slide images added yet. Click above to insert.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {about.philosophySlides.map((slide) => (
                <div key={slide.id} className="group relative border border-white/10 rounded-lg overflow-hidden bg-black/40 flex flex-col">
                  <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(slide.id)}
                        className="p-1.5 bg-black/60 hover:bg-red-600 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold truncate">
                      {slide.title}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono truncate select-all">
                      {slide.imageUrl}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Save & Publish Action Panel */}
        <div className="flex justify-end pt-6 border-t border-white/5 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaved}
            className={`px-6 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? "bg-zinc-800 text-zinc-500 cursor-default"
                : "bg-black text-white hover:bg-zinc-800"
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaved ? "All Philosophy Changes Saved & Published" : "Save & Publish Philosophy Slides"}
          </button>
        </div>
      </div>
    </div>
  );
};
