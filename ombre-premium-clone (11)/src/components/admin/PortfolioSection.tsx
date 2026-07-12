import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Search, Film, Image as ImageIcon, Check, Video } from "lucide-react";
import { PortfolioItem } from "../../types";
import { AdminMediaUpload } from "./AdminMediaUpload";

interface PortfolioSectionProps {
  initialPortfolio: PortfolioItem[];
  onSave: (portfolio: PortfolioItem[]) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ initialPortfolio, onSave }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolio);
  const [isSaved, setIsSaved] = useState(true);

  // New item form state
  const [newItem, setNewItem] = useState<{
    title: string;
    category: PortfolioItem["category"];
    mediaType: PortfolioItem["mediaType"];
    mediaUrl: string;
    thumbnail: string;
  }>({
    title: "",
    category: "Cinematic",
    mediaType: "video",
    mediaUrl: "",
    thumbnail: "",
  });

  // Search and filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    setPortfolio(initialPortfolio);
  }, [initialPortfolio]);

  const handleAddAsset = () => {
    if (!newItem.mediaUrl) return;

    let finalTitle = newItem.title.trim();
    if (!finalTitle) {
      // Auto derive title from url filename
      try {
        const urlStr = newItem.mediaUrl;
        const lastSlash = urlStr.lastIndexOf("/");
        const lastPart = lastSlash !== -1 ? urlStr.substring(lastSlash + 1) : urlStr;
        const extIndex = lastPart.lastIndexOf(".");
        let rawName = extIndex !== -1 ? lastPart.substring(0, extIndex) : lastPart;
        rawName = rawName.replace(/[^a-zA-Z0-9]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
        finalTitle = rawName
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
          .toUpperCase();
      } catch {
        finalTitle = "CINEMATIC SHOWCASE";
      }
    }

    const item: PortfolioItem = {
      id: `p-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: finalTitle.toUpperCase(),
      category: newItem.category,
      mediaType: newItem.mediaType,
      mediaUrl: newItem.mediaUrl,
      thumbnail: newItem.mediaType === "video" && newItem.thumbnail ? newItem.thumbnail : undefined,
    };

    setPortfolio((prev) => [item, ...prev]);
    setNewItem({
      title: "",
      category: "Cinematic",
      mediaType: "video",
      mediaUrl: "",
      thumbnail: "",
    });
    setIsSaved(false);
  };

  const handleRemoveAsset = (id: string) => {
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(portfolio);
    setIsSaved(true);
  };

  // Filter portfolio list
  const filteredPortfolio = portfolio.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Cinematography &amp; Portfolio</h3>
          <p className="text-xs text-zinc-400">Add, remove, and manage your beautiful photographs and cinematic films.</p>
        </div>
        <button
          onClick={handleSave}
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

      {/* Asset Addition Form */}
      <div className="bg-white/2 border border-white/5 p-5 rounded-lg space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add New Master Asset
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label htmlFor="portfolio-title" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Asset Title
              </label>
              <input
                id="portfolio-title"
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="E.g. AESTHETIC DELHI SAGA"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 font-medium uppercase"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label htmlFor="portfolio-category" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Artistic Category
              </label>
              <select
                id="portfolio-category"
                value={newItem.category}
                onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value as PortfolioItem["category"] }))}
                className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
              >
                <option value="Cinematic">Cinematic Film</option>
                <option value="Films">Films &amp; Teasers</option>
                <option value="Photography">Photography Masterclass</option>
                <option value="Pre-Wedding">Pre-Wedding Stories</option>
                <option value="Candid">Candid Moments</option>
              </select>
            </div>

            {/* Media Type Toggle */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">Media Type</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="type-video-btn"
                  onClick={() => setNewItem((prev) => ({ ...prev, mediaType: "video" }))}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                    newItem.mediaType === "video"
                      ? "bg-gold/10 border-gold text-gold"
                      : "bg-white/2 border-white/10 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Video Asset
                </button>
                <button
                  type="button"
                  id="type-image-btn"
                  onClick={() => setNewItem((prev) => ({ ...prev, mediaType: "image" }))}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                    newItem.mediaType === "image"
                      ? "bg-gold/10 border-gold text-gold"
                      : "bg-white/2 border-white/10 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> High-Res Photo
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Primary Media Link / Upload */}
            <AdminMediaUpload
              id="portfolio-primary-media"
              label={newItem.mediaType === "video" ? "Master Video Asset File" : "Master Photo Asset File"}
              value={newItem.mediaUrl}
              onChange={(url) => {
                const isUrlVideo = url.toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv|qt|3gp|avi|mkv|wmv|flv)$/) || url.includes("/videos/") || url.includes("video");
                const detectedType = isUrlVideo ? "video" : "image";
                setNewItem((prev) => ({
                  ...prev,
                  mediaUrl: url,
                  mediaType: detectedType,
                  category: prev.category === "Cinematic" || prev.category === "Films" || prev.category === "Photography" || prev.category === "Pre-Wedding" || prev.category === "Candid"
                    ? (detectedType === "video" 
                       ? (prev.category === "Photography" ? "Cinematic" : prev.category) 
                       : (prev.category === "Cinematic" || prev.category === "Films" ? "Photography" : prev.category))
                    : (detectedType === "video" ? "Cinematic" : "Photography")
                }));
              }}
              accept="image/*,video/*"
              placeholder="E.g. direct mp4 or jpg/png URL, or upload file"
            />

            {/* Optional Thumbnail / Video Poster (Video only) */}
            {newItem.mediaType === "video" && (
              <AdminMediaUpload
                id="portfolio-thumbnail-media"
                label="Video Cover Poster / Thumbnail (Optional Image)"
                value={newItem.thumbnail}
                onChange={(url) => setNewItem((prev) => ({ ...prev, thumbnail: url }))}
                accept="image/*"
                placeholder="E.g. direct jpg URL for cover poster"
              />
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            id="confirm-portfolio-btn"
            disabled={!newItem.mediaUrl}
            onClick={handleAddAsset}
            className="px-6 py-2 bg-gold hover:bg-gold-dark text-luxury-black font-bold uppercase text-[10px] tracking-wider rounded transition-all cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
          >
            Add Showcase Asset
          </button>
        </div>
      </div>

      {/* Asset Explorer List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Showcase Assets Catalog ({portfolio.length})
          </h4>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60 min-w-[150px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-white/5 border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
            </div>
            {/* Category Filter dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50"
            >
              <option value="All">All Categories</option>
              <option value="Cinematic">Cinematic</option>
              <option value="Films">Films &amp; Teasers</option>
              <option value="Photography">Photography</option>
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Candid">Candid</option>
            </select>
          </div>
        </div>

        {/* Gallery / Table Listing */}
        {filteredPortfolio.length === 0 ? (
          <div className="text-center py-8 border border-white/5 bg-white/2 rounded-lg text-zinc-500 text-xs italic">
            No portfolio items found matching your filter criteria.
          </div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto border border-white/5 rounded-lg bg-white/1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="p-3">Asset Preview</th>
                  <th className="p-3">Title &amp; Type</th>
                  <th className="p-3">Artistic Category</th>
                  <th className="p-3">Storage Link</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredPortfolio.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-3">
                      <div className="w-12 h-12 rounded bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                        {item.mediaType === "video" ? (
                          <div className="relative w-full h-full">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <Video className="w-5 h-5 text-gold mx-auto mt-3.5" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[7px] bg-gold/90 text-luxury-black font-extrabold px-1 rounded uppercase tracking-wider">Video</span>
                            </div>
                          </div>
                        ) : (
                          <img src={item.mediaUrl} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-serif text-white text-[11px] font-semibold tracking-wide uppercase truncate max-w-[150px]">
                        {item.title}
                      </div>
                      <div className="text-[9px] text-zinc-500 uppercase mt-0.5 flex items-center gap-1">
                        {item.mediaType === "video" ? <Film className="w-3 h-3 text-gold" /> : <ImageIcon className="w-3 h-3 text-gold" />}
                        {item.mediaType}
                      </div>
                    </td>
                    <td className="p-3 text-zinc-300">
                      <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[9px] font-sans text-gold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-zinc-500 truncate max-w-[180px] select-all">
                      {item.mediaUrl}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(item.id)}
                        className="p-1.5 bg-zinc-900/50 hover:bg-red-950/40 hover:text-red-400 border border-white/5 rounded text-zinc-400 transition-all cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
