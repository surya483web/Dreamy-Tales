import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AboutSection, StudioDetails } from "../types";

interface AboutProps {
  about: AboutSection;
  details: StudioDetails;
}

export default function About({ about, details }: AboutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentDragOffset, setCurrentDragOffset] = useState(0);
  const hasDragged = useRef(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = about.philosophySlides && about.philosophySlides.length > 0 
    ? about.philosophySlides 
    : [
        {
          id: "default-1",
          imageUrl: about.photoUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200",
          title: "SIGNATURE WORK"
        }
      ];

  // Preload all images to avoid blank frames or flickering
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.imageUrl) {
        const img = new Image();
        img.src = slide.imageUrl;
      }
    });
  }, [slides]);

  const nextSlide = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 600);
  };

  const prevSlide = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 600);
  };

  // Autoplay effect to naturally swipe slides
  useEffect(() => {
    if (isDragging || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500); // Transitions beautifully every 5.5 seconds
    return () => clearInterval(interval);
  }, [currentIndex, isDragging, slides.length]);

  // Unified drag/touch handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentDragOffset(0);
    hasDragged.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX;
    setCurrentDragOffset(offset);
    if (Math.abs(offset) > 20) {
      hasDragged.current = true;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 60; // 60px swipe threshold
    if (currentDragOffset < -threshold) {
      nextSlide();
    } else if (currentDragOffset > threshold) {
      prevSlide();
    }

    setIsDragging(false);
    setCurrentDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only drag with left click
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Dynamic sizing matching screen size perfectly centered
  const slideWidth = isMobile ? Math.min(windowWidth - 48, 330) : 720;
  const gap = isMobile ? 16 : 36;

  // Calculate standard negative translation to perfectly center current active index on viewport with dragging offset
  const translateX = `calc(50vw - ${slideWidth / 2}px - ${currentIndex * (slideWidth + gap)}px + ${currentDragOffset}px)`;

  return (
    <section id="story" className="relative py-20 md:py-28 bg-white overflow-hidden border-t border-zinc-200/40">
      
      {/* Decorative architectural layout grids */}
      <div className="absolute top-12 left-12 w-32 h-32 border-l border-t border-zinc-200/50 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-32 h-32 border-r border-b border-zinc-200/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-10">
        <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.5em] text-gold-dark mb-3 block font-semibold text-center md:text-left">
          Our Philosophy
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-luxury-black tracking-wide font-normal leading-tight max-w-2xl text-center md:text-left">
          {about.storyHeadline}
        </h2>
      </div>

      {/* Outer wrapper to position mobile control overlays */}
      <div className="relative w-full overflow-hidden">
        
        {/* ULTRA-LUXURY SLIDING TRACK (Peeking Carousel) */}
        <div 
          className="w-full relative overflow-visible py-4 select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ touchAction: "pan-y" }}
        >
          <div 
            className={`flex ${isDragging ? "transition-none" : "transition-transform duration-[600ms] ease-in-out"}`}
            style={{ transform: translateX }}
          >
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={slide.id || idx}
                  onClick={(e) => {
                    if (hasDragged.current) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isAnimatingRef.current) return;
                    if (!isActive) {
                      isAnimatingRef.current = true;
                      setCurrentIndex(idx);
                      setTimeout(() => {
                        isAnimatingRef.current = false;
                      }, 600);
                    } else {
                      nextSlide();
                    }
                  }}
                  className="shrink-0 transition-all duration-[600ms] ease-in-out relative overflow-hidden rounded group/slide cursor-pointer"
                  style={{
                    width: `${slideWidth}px`,
                    marginRight: `${gap}px`,
                  }}
                >
                  {/* Image Frame */}
                  <div 
                    className={`relative w-full aspect-[3/2] overflow-hidden transition-all duration-[600ms] ease-in-out ${
                      isActive 
                        ? "scale-100 opacity-100 shadow-2xl" 
                        : "scale-[0.93] opacity-40 hover:opacity-60 blur-[0.5px] grayscale-[20%]"
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover/slide:scale-105 pointer-events-none"
                    />
                    
                    {/* Subtle dark radial overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                    {/* Elegant interactive swipe prompt visible on active slide hover */}
                    {isActive && (
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md text-luxury-black font-sans text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded shadow-xl flex items-center gap-2 transform translate-y-2 group-hover/slide:translate-y-0 transition-transform duration-300">
                          <span>TAP OR SWIPE TO NEXT</span>
                          <span className="font-light text-xs">&rarr;</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Mobile Touch Chevrons placed on top with z-50 */}
        {isMobile && (
          <>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-zinc-200/50 flex items-center justify-center text-luxury-black font-semibold active:scale-95 transition-transform cursor-pointer"
              aria-label="Previous Slide"
              style={{ touchAction: "manipulation" }}
            >
              <span className="text-sm font-sans">&larr;</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-zinc-200/50 flex items-center justify-center text-luxury-black font-semibold active:scale-95 transition-transform cursor-pointer"
              aria-label="Next Slide"
              style={{ touchAction: "manipulation" }}
            >
              <span className="text-sm font-sans">&rarr;</span>
            </button>
          </>
        )}

      </div> {/* End outer wrapper */}

      {/* Elegant Bullet Indicators matching image swiping requests */}
      <div className="flex justify-center items-center space-x-2.5 mt-4 mb-2 select-none">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (isAnimatingRef.current || idx === currentIndex) return;
              isAnimatingRef.current = true;
              setCurrentIndex(idx);
              setTimeout(() => {
                isAnimatingRef.current = false;
              }, 600);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
              idx === currentIndex 
                ? "w-8 bg-gold-dark" 
                : "w-2 bg-zinc-200 hover:bg-zinc-400"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* NAVIGATION & TEXT CAPTION ROW (Directly matching the style guidelines in image) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 border-b border-zinc-200/80">
          
          {/* Headline Title */}
          <div className="max-w-xl">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 block mb-2 font-medium">
              CURRENT CATALOG
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-luxury-black tracking-wide font-normal leading-tight uppercase">
              {slides[currentIndex]?.title || "SIGNATURE WORK"}
            </h3>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-8 select-none">
            <button 
              onClick={prevSlide}
              className="w-11 h-11 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-luxury-black hover:text-white hover:border-luxury-black transition-all duration-300 cursor-pointer group"
              aria-label="Previous Slide"
            >
              <span className="text-lg font-light transform group-hover:-translate-x-1 transition-transform">&larr;</span>
            </button>
            <button 
              onClick={nextSlide}
              className="w-11 h-11 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-luxury-black hover:text-white hover:border-luxury-black transition-all duration-300 cursor-pointer group"
              aria-label="Next Slide"
            >
              <span className="text-lg font-light transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </div>

        </div>

        {/* Detailed Description Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <div className="md:col-span-4">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold-dark font-semibold block mb-3">
              The Glimpse
            </span>
            <p className="text-zinc-500 font-sans text-xs sm:text-sm font-light leading-relaxed">
              {about.storyDescription}
            </p>
          </div>

          <div className="md:col-span-8">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold-dark font-semibold block mb-3">
              Core Philosophies
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-600 font-sans">
              {about.storyParagraphs && about.storyParagraphs.map((para, i) => {
                const parts = para.split(": ");
                const heading = parts[0];
                const text = parts[1] || "";
                return (
                  <div key={i} className="space-y-2 border-l border-zinc-200 pl-4">
                    <h4 className="font-mono text-[9px] uppercase tracking-widest text-luxury-black font-semibold">
                      {heading}
                    </h4>
                    <p className="leading-relaxed text-zinc-500 font-light">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
