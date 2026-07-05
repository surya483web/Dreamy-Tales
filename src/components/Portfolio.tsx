import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PortfolioItem } from "../types";
import { Play, X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

interface PortfolioProps {
  items?: PortfolioItem[];
}

export default function Portfolio({ items = [] }: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLightboxMuted, setIsLightboxMuted] = useState(false);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);

  const safeItems = items || [];
  const currentItem = selectedIdx !== null ? safeItems[selectedIdx] : null;

  useEffect(() => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.load();
    }
  }, [currentItem?.mediaUrl]);

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
          <span className="font-sans text-[10.5px] md:text-xs uppercase tracking-[0.5em] text-gold-dark mb-3 block font-semibold">
            VISUAL CATALOGUE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-luxury-black tracking-wide font-light leading-tight">
            Films &amp; Photos
          </h2>
          <div className="w-12 h-[1px] bg-gold-dark/40 mx-auto mt-6" />
        </div>

        {/* Gallery Grid: 2-column Asymmetric Editorial Layout */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 md:gap-x-20 md:gap-y-28 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
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
                  className={`group relative cursor-pointer flex flex-col ${
                    isEvenColumn ? "md:mt-24" : ""
                  }`}
                >
                  {/* Media Frame with Sharp Rectangular Edges */}
                  <div className="relative overflow-hidden aspect-[4/5] bg-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-black/5">
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full relative">
                        <img
                          src={item.thumbnail || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800"}
                          alt={item.title}
                          className="w-full h-full object-cover grayscale contrast-[1.05] brightness-[1.01] transition-all duration-1000 group-hover:scale-[1.03] group-hover:contrast-[1.1]"
                        />
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
                    <h3 className="text-luxury-black font-sans text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] font-light leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal System */}
      <AnimatePresence>
        {currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10"
          >
            {/* Top Toolbar Controls */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white/80 z-50">
              <div className="flex flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
                  {currentItem.mediaType === "video" ? "Cinematic Film" : "Photograph"}
                </span>
                <span className="font-serif text-xl mt-1 text-white">{currentItem.title}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                {currentItem.mediaType === "video" && (
                  <button
                    onClick={toggleLightboxMute}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-gold hover:text-luxury-black transition-all"
                    title="Toggle Audio"
                  >
                    {isLightboxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={closeLightbox}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-gold hover:text-luxury-black transition-all"
                  title="Close Lightbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Stage Media */}
            <div className="relative w-full max-w-5xl h-[60vh] md:h-[75vh] flex items-center justify-center select-none">
              
              {/* Navigation Left */}
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-0 md:-left-16 p-3 rounded-full bg-white/5 hover:bg-gold hover:text-luxury-black text-white transition-all z-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Main Media Core */}
              <div className="max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl flex items-center justify-center bg-luxury-black border border-white/5">
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
                    alt={currentItem.title}
                    className="max-w-full max-h-[60vh] md:max-h-[75vh] object-contain"
                  />
                )}
              </div>

              {/* Navigation Right */}
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-0 md:-right-16 p-3 rounded-full bg-white/5 hover:bg-gold hover:text-luxury-black text-white transition-all z-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Carousel Indicator */}
            <div className="absolute bottom-6 font-mono text-[10px] tracking-widest text-white/40">
              {selectedIdx !== null ? selectedIdx + 1 : 0} / {safeItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
