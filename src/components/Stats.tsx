import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";

interface StatsProps {
  stats?: {
    weddings?: number;
    couples?: number;
    events?: number;
    backgroundUrl?: string;
  };
}

interface CounterProps {
  value: number;
}

// Custom decelerating counter hook for a beautiful slow counting effect
function Counter({ value }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  useEffect(() => {
    if (!isInView) {
      // Reset the count to 0 when it goes out of view, so it animates again on next scroll in
      setCount(0);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 300; // 0.3 seconds super fast count effect on every scroll in
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Decelerating ease out function
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const currentCount = Math.floor(easedProgress * end);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, isInView]);

  return <span ref={ref}>{count}</span>;
}

export default function Stats({ stats }: StatsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const weddingsVal = stats?.weddings ?? 100;
  const couplesVal = stats?.couples ?? 150;
  const eventsVal = stats?.events ?? 200;

  const milestones = [
    { value: weddingsVal, label: "WEDDINGS DOCUMENTED", sub: "Archiving grand rituals" },
    { value: couplesVal, label: "SMILING COUPLES", sub: "Boundless love stories" },
    { value: eventsVal, label: "EVENTS CELEBRATED", sub: "Candid smiles captured" },
  ];

  return (
    <section 
      ref={sectionRef}
      id="experience" 
      className="relative py-24 md:py-32 bg-white overflow-hidden border-b border-zinc-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Block exactly like the uploaded image */}
        <div className="max-w-3xl mx-auto mb-16 md:mb-20 text-center">
          <motion.span 
            initial={{ opacity: 1, y: 0 }}
            className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] text-black mb-4 block font-semibold"
          >
            OUR LEGACY
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-luxury-black tracking-wide font-light"
          >
            The milestones of storytelling
          </motion.h2>
        </div>

        {/* Stats Columns - Redesigned as Bold Contrast Blocks from the uploaded image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {milestones.map((mil, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 1, y: 0 }}
              className="relative flex flex-col items-center justify-center p-10 md:p-12 text-center bg-gradient-to-b from-[#18181B] to-[#09090B] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-zinc-800/60 group hover:scale-[1.02] hover:shadow-[0_24px_60px_rgba(0,0,0,0.85)] hover:border-zinc-700/80 transition-all duration-500"
            >
              {/* White Numerals */}
              <div className="font-serif text-5xl sm:text-6xl md:text-7xl text-white font-light tracking-tight select-none flex items-baseline">
                <Counter value={mil.value} />
                <span className="text-white text-3xl md:text-4xl font-light ml-0.5">+</span>
              </div>
              
              {/* Divider exactly matching the visual spacing */}
              <div className="w-12 h-[1px] bg-zinc-800 my-5 group-hover:bg-zinc-700 transition-colors duration-500" />

              {/* White uppercase title */}
              <h3 className="font-sans text-[10px] sm:text-xs text-white tracking-[0.2em] uppercase font-bold mb-2">
                {mil.label}
              </h3>
              
              {/* Muted description */}
              <p className="text-zinc-500 font-sans text-xs font-light tracking-wide">
                {mil.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
