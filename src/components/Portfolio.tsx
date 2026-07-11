import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PortfolioItem } from "../types";
import { Play, X, Volume2, VolumeX, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchSamaroGalleryClient } from "../lib/samaro";

interface PortfolioProps {
  items?: PortfolioItem[];
  onViewMore?: () => void;
}

export default function Portfolio({ items = [], onViewMore }: PortfolioProps) {
  const [allPortfolioItems, setAllPortfolioItems] = useState<PortfolioItem[]>(items);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isLightboxMuted, setIsLightboxMuted] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedExternal, setHasLoadedExternal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Keep local list in sync with admin updates while preserving loaded samaro items
    setAllPortfolioItems(prev => {
      const samaroItems = prev.filter(item => item.id.toString().startsWith("samaro-"));
      const existingUrls = new Set(items.map(i => i.mediaUrl));
      const filteredSamaro = samaroItems.filter(item => !existingUrls.has(item.mediaUrl));
      return [...items, ...filteredSamaro];
    });
  }, [items]);

  const safeItems = allPortfolioItems;
  const currentItem = selectedIdx !== null ? safeItems[selectedIdx] : null;

  useEffect(() => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.load();
    }
  }, [currentItem?.mediaUrl]);

  const loadSamaroGallery = async () => {
    setIsLoadingMore(true);
    setErrorMessage("");
    try {
      const itemsList = await fetchSamaroGalleryClient();
      // Prevent duplication of URLs
      const existingUrls = new Set(allPortfolioItems.map(item => item.mediaUrl));
      const uniqueNewItems = itemsList.filter((item: PortfolioItem) => !existingUrls.has(item.mediaUrl));
      
      setAllPortfolioItems(prev => [...prev, ...uniqueNewItems]);
      setHasLoadedExternal(true);
    } catch (err: any) {
      setErrorMessage("Could not load external gallery. Please check your internet connection.");
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleViewMoreClick = async () => {
    if (onViewMore) {
      onViewMore();
      return;
    }
    if (showAll) {
      setShowAll(false);
    } else {
      setShowAll(true);
      if (!hasLoadedExternal) {
        await loadSamaroGallery();
      }
    }
  };

  const categories = ["All", "Films", "Photography", "Pre-Wedding", "Candid"];

  // Filter items
  const filteredItems = safeItems.filter((item) => {
    if (!item) return false;
    if (activeFilter === "All") return true;
    const itemCategory = item.category || "";
    const itemMediaType = item.mediaType || "";
    if (activeFilter === "Films") return itemMediaType === "video" || itemCategory === "Films" || itemCategory === "Cinematic";
    if (activeFilter === "Photography") return itemMediaType === "image";
    return itemCategory.toLowerCase() === activeFilter.toLowerCase();
  });

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 6);

  const openLightbox = (item: PortfolioItem) => {
    const idx = safeItems.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      setSelectedIdx(idx);
    }
  };

  const closeLightbox = () => {
    setSelectedIdx(null);
  };

  const navigateLightbox = (direction: "next" | "prev") => {
    if (selectedIdx === null || safeItems.length === 0) return;
    let nextIdx = direction === "next" ? selectedIdx + 1 : selectedIdx - 1;
    if (nextIdx < 0) nextIdx = safeItems.length - 1;
    if (nextIdx >= safeItems.length) nextIdx = 0;
    setSelectedIdx(nextIdx);
  };

  // Keyboard navigation support for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "ArrowLeft") navigateLightbox("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, safeItems]);

  // Preload lightbox images for instant continuous display with zero delay
  useEffect(() => {
    if (selectedIdx === null || safeItems.length === 0) return;
    const offsets = [-2, -1, 1, 2, 3];
    offsets.forEach((offset) => {
      const idx = (selectedIdx + offset + safeItems.length) % safeItems.length;
      const item = safeItems[idx];
      if (item && item.mediaUrl && item.mediaType === "image") {
        const img = new Image();
        img.src = item.mediaUrl;
      }
    });
  }, [selectedIdx, safeItems]);

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

  const toggleLightboxMute = () => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.muted = !lightboxVideoRef.current.muted;
      setIsLightboxMuted(lightboxVideoRef.current.muted);
    }
  };

  return (
    <section id="portfolio" className="relative py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Elegant Luxury Section Header */}
        <div className="mb-20 text-center">
          <span className="font-sans text-[10.5px] md:text-xs uppercase tracking-[0.5em] text-black mb-3 block font-semibold">
            VISUAL CATALOGUE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-luxury-black tracking-wide font-light leading-tight">
            Films &amp; Photos
          </h2>
          <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
        </div>

        {/* Gallery Grid: 2-column Asymmetric Editorial Layout */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 md:gap-x-20 md:gap-y-28 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, idx) => {
              const isEvenColumn = idx % 2 === 1;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, ease: [0.215, 0.610, 0.355, 1] }}
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className={`group relative cursor-pointer flex flex-col transition-all duration-500 ease-out hover:-translate-y-2.5 ${
                    isEvenColumn ? "md:mt-24" : ""
                  }`}
                >
                  {/* Media Frame with Sharp Rectangular Edges */}
                  <div className="relative overflow-hidden aspect-[4/5] bg-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)] border border-black/5 transition-all duration-500 ease-out">
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full relative">
                        {item.thumbnail && !item.thumbnail.toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv|qt|3gp|avi|mkv|wmv|flv)$/) ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover grayscale contrast-[1.05] brightness-[1.01] transition-all duration-1000 group-hover:scale-[1.03] group-hover:contrast-[1.1]"
                          />
                        ) : (
                          <video
                            src={item.mediaUrl}
                            className="w-full h-full object-cover grayscale contrast-[1.05] brightness-[1.01] transition-all duration-1000 group-hover:scale-[1.03] group-hover:contrast-[1.1]"
                            preload="metadata"
                            muted
                            playsInline
                          />
                        )}
                        {/* Elegant Glassmorphic Play button */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                          <div className="w-14 h-14 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white scale-95 group-hover:scale-100 group-hover:bg-white group-hover:text-luxury-black transition-all duration-500">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale contrast-[1.05] brightness-[1.01] transition-all duration-1000 group-hover:scale-[1.03] group-hover:contrast-[1.1]"
                      />
                    )}
                  </div>

                  {/* Centered Typography: Clean Uppercase Luxury Brand spacing */}
                  <div className="text-center mt-6">
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Elegant Centered "View More" button with consistent typography and colors */}
        <div className="mt-16 text-center select-none">
          <button
            onClick={handleViewMoreClick}
            disabled={isLoadingMore}
            className="relative inline-flex min-w-[200px] px-8 py-3.5 border border-black hover:bg-black hover:text-white text-luxury-black font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-none cursor-pointer font-semibold items-center justify-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-luxury-black hover:text-white" />
                <span>Loading...</span>
              </>
            ) : showAll ? (
              "View Less"
            ) : (
              "View More"
            )}
          </button>
          {errorMessage && (
            <p className="text-red-500 font-sans text-xs mt-3">{errorMessage}</p>
          )}
        </div>
      </div>

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
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10 select-none cursor-pointer"
          >
            {/* Top Toolbar Controls */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white/80 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col">
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
            <div className="relative w-full max-w-5xl h-[60vh] md:h-[75vh] flex items-center justify-center select-none cursor-default">
              
              {/* Navigation Left */}
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
                className="absolute left-0 md:-left-16 p-3 rounded-full bg-black/60 hover:bg-zinc-800 text-white transition-all z-30 border border-black cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Main Media Core */}
              <div className="max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl flex items-center justify-center bg-luxury-black border border-white/5" onClick={(e) => e.stopPropagation()}>
                {currentItem.mediaType === "video" ? (
                  <video
                    ref={lightboxVideoRef}
                    src={currentItem.mediaUrl}
                    controls
                    autoPlay
                    muted={isLightboxMuted}
                    playsInline
                    className="max-w-full max-h-[60vh] md:max-h-[75vh] object-contain"
                  />
                ) : (
                  <img
                    src={currentItem.mediaUrl}
                    alt="Portfolio item"
                    className="max-w-full max-h-[60vh] md:max-h-[75vh] object-contain"
                  />
                )}
              </div>

              {/* Navigation Right */}
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
                className="absolute right-0 md:-right-16 p-3 rounded-full bg-black/60 hover:bg-zinc-800 text-white transition-all z-30 border border-black cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Carousel Indicator */}
            <div className="absolute bottom-6 font-mono text-[10px] tracking-widest text-white/40 cursor-default" onClick={(e) => e.stopPropagation()}>
              {selectedIdx !== null ? selectedIdx + 1 : 0} / {safeItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
