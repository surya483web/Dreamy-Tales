import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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

  const primaryImage = reviewImages[0];

  // For dropcap effect: separate first letter of review text
  const reviewText = currentReview.text || "";
  const firstChar = reviewText.charAt(0);
  const restOfText = reviewText.slice(1);

  return (
    <section 
      id="praise" 
      className="relative py-24 md:py-32 bg-[#FAF9F5] overflow-hidden border-t border-zinc-200/40 select-none"
    >
      {/* Background soft ambient luxury glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1020px] mx-auto px-6 relative z-10">
        {/* Editorial Section Heading */}
        <div className="text-center mb-14 md:mb-16">
          <div className="mb-3">
            <span className="font-sans text-[11px] md:text-xs uppercase tracking-[0.45em] text-zinc-400 font-medium">
              KIND WORDS
            </span>
          </div>
          
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-900 tracking-[0.08em] uppercase font-light">
            CLIENT <span className="italic font-light lowercase" style={{ fontVariant: "normal" }}>reviews</span>
          </h2>

          {/* Decorative Divider (flourish matching the black & white reference) */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-14 h-[1px] bg-zinc-200"></div>
            <span className="text-zinc-400 text-sm select-none">✥</span>
            <div className="w-14 h-[1px] bg-zinc-200"></div>
          </div>
        </div>

        {/* Carousel Card Wrapper */}
        <div className="relative mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border border-zinc-100 rounded-2xl md:rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-6 sm:p-10 md:p-14 md:px-16 flex flex-col md:flex-row gap-10 md:gap-14 items-center"
            >
              {/* Left Column: Text Testimonial Content */}
              <div className="flex-1 flex flex-col justify-center w-full">
                {/* Quotes */}
                <div className="text-zinc-300 font-serif text-[72px] md:text-[80px] leading-none mb-2 select-none h-12">
                  “
                </div>

                {/* Client Name Heading */}
                <h3 className="font-serif text-2xl sm:text-3xl md:text-[32px] text-neutral-800 leading-tight mb-4 font-light tracking-wide">
                  {currentReview.clientName}
                </h3>

                {/* Category Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-[1px] bg-zinc-300"></div>
                  <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                    PORTRAIT OF LOVE
                  </span>
                </div>

                {/* Styled Testimonial Body with Dropcap */}
                <div className="text-zinc-600 font-sans text-[14px] md:text-[15px] leading-[1.8] text-justify tracking-wide whitespace-pre-line">
                  {firstChar && (
                    <span className="font-serif text-[52px] md:text-[60px] text-zinc-400 float-left mr-3 mt-1 leading-[0.85] font-light">
                      {firstChar}
                    </span>
                  )}
                  {restOfText}
                </div>

                {/* Handwritten Signature and Gold Heart */}
                <div className="mt-8 flex items-center gap-3.5">
                  <span className="font-signature text-3xl md:text-[38px] text-zinc-800 leading-none select-none pt-2">
                    {currentReview.clientName}
                  </span>
                  <span className="text-zinc-400 text-xl select-none leading-none">♡</span>
                </div>
              </div>

              {/* Right Column: Stunning Portrait Image */}
              <div className="w-full md:w-[44%] aspect-[3/4.2] overflow-hidden rounded-[12px] bg-zinc-50 border border-black/[0.03] group relative shrink-0">
                <img
                  src={primaryImage}
                  alt={`${currentReview.clientName} portrait`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out md:group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/[0.02] mix-blend-multiply pointer-events-none" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Area */}
        <div className="mt-8 md:mt-12 flex flex-col items-center">
          {/* Pagination dots (matching image) */}
          <div className="flex justify-center gap-2.5 mb-10">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? "bg-zinc-900 scale-125" 
                    : "bg-zinc-200 hover:bg-zinc-300 cursor-pointer"
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Control Buttons (Prev button, Slide indicator, Next button) */}
          <div className="flex items-center justify-between w-full max-w-[420px] px-2">
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-neutral-800 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all flex items-center gap-2 rounded-[4px] cursor-pointer shadow-sm hover:border-zinc-300"
              aria-label="Previous Review"
              id="praise-prev-btn"
            >
              <span>← &nbsp; PREV</span>
            </button>
            
            {/* Index Counter */}
            <div className="font-serif text-[15px] tracking-[0.1em] text-neutral-700 italic select-none">
              {activeIndex + 1} &nbsp;/&nbsp; {reviews.length}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] uppercase tracking-[0.2em] font-semibold transition-all flex items-center gap-2 rounded-[4px] cursor-pointer shadow-md hover:shadow-lg"
              aria-label="Next Review"
              id="praise-next-btn"
            >
              <span>NEXT &nbsp; →</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
