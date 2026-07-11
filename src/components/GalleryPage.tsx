import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PortfolioItem } from "../types";
import { fetchSamaroGalleryClient } from "../lib/samaro";
import { 
  ArrowLeft, 
  Play, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Grid
} from "lucide-react";

interface GalleryPageProps {
  portfolioItems: PortfolioItem[];
  brandName: string;
  onBack: () => void;
}

export default function GalleryPage({ portfolioItems = [], brandName, onBack }: GalleryPageProps) {
  const [allPhotos, setAllPhotos] = useState<PortfolioItem[]>(portfolioItems);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLightboxMuted, setIsLightboxMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fetch external Samaro items
    const fetchSamaroPhotos = async () => {
      try {
        setIsLoading(true);
        const itemsList = await fetchSamaroGalleryClient();
        
        // Merge static portfolio items and dynamic Samaro items while preventing duplicate urls
        const existingUrls = new Set(portfolioItems.map(item => item.mediaUrl));
        const uniqueSamaro = itemsList.filter((item: PortfolioItem) => !existingUrls.has(item.mediaUrl));
        setAllPhotos([...portfolioItems, ...uniqueSamaro]);
      } catch (err) {
        console.error("Failed to load samaro gallery:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSamaroPhotos();
  }, [portfolioItems]);

  const categories = ["All", "Films", "Photography", "Pre-Wedding", "Candid"];

  // Filter logic matching portfolio standard
  const filteredPhotos = allPhotos.filter((item) => {
    if (!item) return false;
    if (activeFilter === "All") return true;
    const itemCategory = item.category || "";
    const itemMediaType = item.mediaType || "";
    if (activeFilter === "Films") return itemMediaType === "video" || itemCategory === "Films" || itemCategory === "Cinematic";
    if (activeFilter === "Photography") return itemMediaType === "image";
    return itemCategory.toLowerCase() === activeFilter.toLowerCase();
  });

  // Support Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "ArrowLeft") navigateLightbox("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, allPhotos]);

  // Preload lightbox images for instant continuous display with zero delay
  useEffect(() => {
    if (selectedIdx === null || filteredPhotos.length === 0) return;
    const offsets = [-2, -1, 1, 2, 3];
    offsets.forEach((offset) => {
      const idx = (selectedIdx + offset + filteredPhotos.length) % filteredPhotos.length;
      const item = filteredPhotos[idx];
      if (item && item.mediaUrl && item.mediaType === "image") {
        const img = new Image();
        img.src = item.mediaUrl;
      }
    });
  }, [selectedIdx, filteredPhotos]);

  // Swipe & mousewheel continuous scrolling helpers
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastWheelTime = useRef(0);

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        navigateLightbox("next");
      } else {
        navigateLightbox("prev");
      }
    }
  };

  const handleLightboxWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    // Throttle scroll wheel so user can continuously navigate cleanly without jerky skipping
    if (now - lastWheelTime.current < 250) return;
    
    if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
      lastWheelTime.current = now;
      if (e.deltaY > 0 || e.deltaX > 0) {
        navigateLightbox("next");
      } else {
        navigateLightbox("prev");
      }
    }
  };

  const openLightbox = (item: PortfolioItem) => {
    const idx = filteredPhotos.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      setSelectedIdx(idx);
    }
  };

  const closeLightbox = () => {
    setSelectedIdx(null);
  };

  const navigateLightbox = (direction: "next" | "prev") => {
    if (selectedIdx === null || filteredPhotos.length === 0) return;
    let nextIdx = direction === "next" ? selectedIdx + 1 : selectedIdx - 1;
    if (nextIdx < 0) nextIdx = filteredPhotos.length - 1;
    if (nextIdx >= filteredPhotos.length) nextIdx = 0;
    setSelectedIdx(nextIdx);
  };

  const toggleLightboxMute = () => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.muted = !lightboxVideoRef.current.muted;
      setIsLightboxMuted(lightboxVideoRef.current.muted);
    }
  };

  const currentItem = selectedIdx !== null ? filteredPhotos[selectedIdx] : null;

  return (
    <div className="min-h-screen bg-white text-luxury-charcoal antialiased flex flex-col">
      {/* Dynamic Luxurious Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-6 py-5 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2.5 text-xs tracking-[0.25em] uppercase font-sans text-luxury-black hover:text-zinc-500 transition-colors group cursor-pointer font-medium"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Home</span>
          </button>

          <span className="font-serif text-lg sm:text-2xl tracking-[0.25em] font-light uppercase text-luxury-black">
            {brandName || "DTSTUDIO"}
          </span>

          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-sans text-zinc-400">
            <Grid className="w-3.5 h-3.5 text-luxury-black" />
            <span className="hidden sm:inline">Gallery View</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16 w-full">
        {/* Intro Section */}
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.6em] text-zinc-500 font-semibold block mb-3">
            IMMERSIVE SHOWCASE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-luxury-black font-light tracking-wide leading-tight">
            Complete Archive
          </h1>
          <div className="w-12 h-[1px] bg-black/25 mx-auto mt-6" />
        </div>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10 mb-16 border-b border-zinc-100 pb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveFilter(category);
                setSelectedIdx(null);
              }}
              className={`font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase pb-2 transition-all duration-300 relative cursor-pointer font-medium ${
                activeFilter === category
                  ? "text-black font-semibold"
                  : "text-zinc-400 hover:text-black"
              }`}
            >
              {category}
              {activeFilter === category && (
                <motion.div
                  layoutId="gallery-active-pill"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 select-none">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-4" />
            <span className="font-serif text-sm uppercase tracking-[0.2em] text-zinc-500">
              Assembling dynamic assets...
            </span>
          </div>
        )}

        {/* Grid System with elegant animations */}
        {!isLoading && (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((item, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.03, 0.3) }}
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className="group relative cursor-pointer flex flex-col bg-white overflow-hidden border border-black/5"
                >
                  {/* Photo Frame */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-zinc-50 shadow-sm">
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full relative">
                        {item.thumbnail && !item.thumbnail.toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv|qt|3gp|avi|mkv|wmv|flv)$/) ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover grayscale contrast-[1.03] brightness-[1.01] transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <video
                            src={item.mediaUrl}
                            className="w-full h-full object-cover grayscale contrast-[1.03] brightness-[1.01] transition-transform duration-700 group-hover:scale-105"
                            preload="metadata"
                            muted
                            playsInline
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 group-hover:bg-white group-hover:text-luxury-black transition-all duration-300">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale contrast-[1.03] brightness-[1.01] transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    {/* Hover luxurious overlay detail */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Clean Label Typography */}
                  <div className="pt-4 pb-2 px-1 text-center sm:text-left">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 block mb-1 font-sans">
                      {item.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty Filter State */}
        {!isLoading && filteredPhotos.length === 0 && (
          <div className="text-center py-24 select-none">
            <p className="font-serif text-lg text-zinc-400 italic">No media items curated in this category.</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal System */}
      <AnimatePresence>
        {currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={handleLightboxWheel}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10 select-none cursor-pointer"
          >
            {/* Top Toolbar Controls */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white/80 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col text-left">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                  {currentItem.mediaType === "video" ? "Cinematic Film" : "Photograph"}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {currentItem.mediaType === "video" && (
                   <button
                     onClick={(e) => { e.stopPropagation(); toggleLightboxMute(); }}
                     className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all border border-zinc-700 cursor-pointer"
                     title="Toggle Audio"
                   >
                     {isLightboxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                   </button>
                 )}
                <button
                  onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                  className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all border border-white/20 cursor-pointer shadow-xl"
                  title="Close Lightbox"
                >
                  <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase">CLOSE</span>
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Main Stage Media */}
            <div className="relative w-full max-w-5xl h-[65vh] md:h-[78vh] flex items-center justify-center cursor-default">
              {/* Navigation Left */}
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
                className="absolute left-0 md:-left-16 p-3 rounded-full bg-black/60 hover:bg-zinc-800 text-white transition-all z-30 border border-zinc-800 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Main Media Core */}
              <div className="max-w-full max-h-full rounded overflow-hidden shadow-2xl flex items-center justify-center bg-black border border-white/5" onClick={(e) => e.stopPropagation()}>
                {currentItem.mediaType === "video" ? (
                  <video
                    ref={lightboxVideoRef}
                    src={currentItem.mediaUrl}
                    controls
                    autoPlay
                    muted={isLightboxMuted}
                    playsInline
                    className="max-w-full max-h-[65vh] md:max-h-[78vh] object-contain"
                  />
                ) : (
                  <img
                    src={currentItem.mediaUrl}
                    alt={currentItem.title}
                    className="max-w-full max-h-[65vh] md:max-h-[78vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Navigation Right */}
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
                className="absolute right-0 md:-right-16 p-3 rounded-full bg-black/60 hover:bg-zinc-800 text-white transition-all z-30 border border-zinc-800 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Carousel Indicator */}
            <div className="absolute bottom-6 font-mono text-[10px] tracking-widest text-white/40 cursor-default" onClick={(e) => e.stopPropagation()}>
              {selectedIdx !== null ? selectedIdx + 1 : 0} / {filteredPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
