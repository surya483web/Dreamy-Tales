import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AboutSection, StudioDetails } from "../types";

interface AboutProps {
  about?: AboutSection;
  details?: StudioDetails;
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
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const safePhilosophySlides = about?.philosophySlides;

  const slides = safePhilosophySlides && safePhilosophySlides.length > 0 
    ? safePhilosophySlides 
    : [
        {
          id: "default-1",
          imageUrl: about?.photoUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200",
          title: "SIGNATURE WORK"
        }
      ];

  // Adjust current slide index if slides array shrinks or updates
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides, currentIndex]);

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

  const nextSlideRef = useRef(nextSlide);
  const prevSlideRef = useRef(prevSlide);

  useEffect(() => {
    nextSlideRef.current = nextSlide;
    prevSlideRef.current = prevSlide;
  });

  // Autoplay effect to naturally swipe slides with stable ref calling
  useEffect(() => {
    if (isDragging || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlideRef.current();
    }, 2000); // Transitions beautifully every 2 seconds
    return () => clearInterval(interval);
  }, [isDragging, slides.length]);

  // Support trackpad/mouse-wheel horizontal and vertical scrolling gestures
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (e: WheelEvent) => {
      const threshold = 15;
      // If we scroll horizontally or vertically on the track, slide images
      if (Math.abs(e.deltaX) > threshold) {
        e.preventDefault();
        if (isAnimatingRef.current) return;
        if (e.deltaX > 0) {
          nextSlideRef.current();
        } else {
          prevSlideRef.current();
        }
      } else if (Math.abs(e.deltaY) > threshold) {
        e.preventDefault();
        if (isAnimatingRef.current) return;
        if (e.deltaY > 0) {
          nextSlideRef.current();
        } else {
          prevSlideRef.current();
        }
      }
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      track.removeEventListener("wheel", handleWheel);
    };
  }, []);

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

  // Calculate standard translation to show exactly the single active slide with dragging offset
  const translateX = `calc(-${currentIndex * 100}% + ${currentDragOffset}px)`;

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
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-10">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-zinc-200/50 bg-zinc-50 aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] lg:h-[720px]">
          
          {/* ULTRA-LUXURY FADE CONTAINER */}
          <div 
            ref={trackRef}
            className="w-full h-full relative select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full overflow-hidden group/slide cursor-pointer"
                onClick={nextSlide}
              >
                <img
                  src={slides[currentIndex]?.imageUrl}
                  alt={slides[currentIndex]?.title}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out hover:scale-105 pointer-events-none"
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

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

        {/* Detailed Description Grid with Philosophy Background Image */}
        <div className="relative mt-16 rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl p-8 sm:p-12 md:p-16">
          {/* Background Image with elegant dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={about?.philosophyBgUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600"}
              alt="Core Philosophy Background"
              className="w-full h-full object-cover opacity-65 transition-transform duration-[4000ms] ease-out hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-black/95 via-luxury-black/85 to-luxury-black/70" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            <div className="md:col-span-4">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold font-bold block mb-3">
                The Glimpse
              </span>
              <p className="text-zinc-200 font-sans text-xs sm:text-sm leading-relaxed font-light">
                {about?.storyDescription}
              </p>
            </div>

            <div className="md:col-span-8">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold font-bold block mb-3">
                Core Philosophies
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-300 font-sans">
                {about?.storyParagraphs && about.storyParagraphs.map((para, i) => {
                  const parts = para.split(": ");
                  const heading = parts[0];
                  const text = parts[1] || "";
                  return (
                    <div key={i} className="space-y-2 border-l-2 border-gold/50 pl-4">
                      <h4 className="font-mono text-[9.5px] uppercase tracking-widest text-white font-semibold">
                        {heading}
                      </h4>
                      <p className="leading-relaxed text-zinc-300 font-light">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}
