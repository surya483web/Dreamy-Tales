import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { ClientReview } from "../types";

interface ClientPraiseProps {
  reviews?: ClientReview[];
}

export default function ClientPraise({ reviews = [] }: ClientPraiseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Automatically reset activeIndex to a safe range if reviews list updates or shrinks
  React.useEffect(() => {
    if (reviews && reviews.length > 0 && activeIndex >= reviews.length) {
      setActiveIndex(0);
    }
  }, [reviews, activeIndex]);

  if (!reviews || reviews.length === 0) return null;

  // Use optional fallback to prevent undefined references if activeIndex is temporarily out of range
  const currentReview = reviews[activeIndex] || reviews[0];
  if (!currentReview) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  // Provide high quality fallbacks if image URLs are missing or empty
  const reviewImages = currentReview.images && currentReview.images.length > 0 
    ? currentReview.images 
    : [
        "https://images.unsplash.com/photo-1621616875450-79f22448040e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
      ];

  // We want to display up to 2 images side by side as in the screenshot
  const imageLeft = reviewImages[0];
  const imageRight = reviewImages[1] || reviewImages[0]; // fallback to first image if second is not provided

  return (
    <section id="praise" className="relative py-24 md:py-32 bg-white overflow-hidden border-t border-zinc-200/50">
      {/* Background elegant details */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 -z-10" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-zinc-100 rounded-full blur-2xl -z-10" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Editorial Section Heading */}
        <div className="text-center mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <span className="font-mono text-[9px] md:text-xs uppercase tracking-[0.5em] text-gold-dark font-semibold">
              KIND WORDS
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] tracking-wider uppercase font-light"
          >
            Client <span className="italic font-normal">Praise</span>
          </motion.h2>
          <div className="w-16 h-[1px] bg-gold/40 mx-auto mt-6" />
        </div>

        {/* Interactive Carousel Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              {/* Dual Portrait Images Layout from Screenshot */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl mb-12">
                <div className="aspect-[3/4] overflow-hidden rounded bg-zinc-100 shadow-lg border border-white/50 group relative">
                  <img
                    src={imageLeft}
                    alt={`${currentReview.clientName} portrait left`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded bg-zinc-100 shadow-lg border border-white/50 group relative">
                  <img
                    src={imageRight}
                    alt={`${currentReview.clientName} portrait right`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
                </div>
              </div>

              {/* Client Name Heading */}
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A1A1A] tracking-wide mb-8 text-center uppercase font-light">
                {currentReview.clientName}
              </h3>

              {/* Styled Testimonial Block */}
              <div className="max-w-2xl text-center">
                <p className="text-zinc-600 font-sans text-sm sm:text-base md:text-lg font-light leading-relaxed tracking-wide text-justify md:text-center whitespace-pre-line first-letter:text-3xl first-letter:font-serif first-letter:text-gold first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                  {currentReview.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Elegant Floating Carousel Controls */}
          <div className="flex justify-center items-center gap-12 mt-12 md:mt-16">
            <button
              onClick={handlePrev}
              className="group flex items-center gap-3 text-zinc-400 hover:text-gold text-xs uppercase tracking-[0.3em] font-medium transition-colors"
              aria-label="Previous Review"
              id="praise-prev-btn"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>PREV</span>
            </button>
            
            <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-400">
              <span className="text-gold font-bold">{activeIndex + 1}</span> / {reviews.length}
            </div>

            <button
              onClick={handleNext}
              className="group flex items-center gap-3 text-zinc-400 hover:text-gold text-xs uppercase tracking-[0.3em] font-medium transition-colors"
              aria-label="Next Review"
              id="praise-next-btn"
            >
              <span>NEXT</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
