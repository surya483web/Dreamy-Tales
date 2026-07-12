import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Camera, Heart, Sparkles, Shield, Users, Award } from "lucide-react";

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
      setCount(0);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1200; // Smoother and slightly slower count animation
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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
    { 
      value: weddingsVal, 
      label: "WEDDINGS DOCUMENTED", 
      sub: "Archiving grand rituals and intimate moments",
      icon: <Camera className="w-5 h-5 text-white/70" />
    },
    { 
      value: couplesVal, 
      label: "SMILING COUPLES", 
      sub: "Boundless love stories told beautifully",
      icon: <Heart className="w-5 h-5 text-white/70" />
    },
    { 
      value: eventsVal, 
      label: "EVENTS CELEBRATED", 
      sub: "Candid smiles captured across every occasion",
      icon: <Sparkles className="w-5 h-5 text-white/70" />
    },
  ];

  const valueProps = [
    {
      title: "Authentic Storytelling",
      desc: "We capture real emotions and unscripted moments that reflect your true story.",
      icon: <Camera className="w-6 h-6 text-zinc-800" />
    },
    {
      title: "Timeless Editing",
      desc: "Elegant, natural edits that stand the test of time and trends.",
      icon: <Sparkles className="w-6 h-6 text-zinc-800" />
    },
    {
      title: "Personalized Experience",
      desc: "A seamless, personalized journey tailored to your comfort.",
      icon: <Users className="w-6 h-6 text-zinc-800" />
    },
    {
      title: "Trusted By Many",
      desc: "Hundreds of families who trust us to document their most important days.",
      icon: <Shield className="w-6 h-6 text-zinc-800" />
    }
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
          <span className="font-sans text-[11px] md:text-xs uppercase tracking-[0.45em] text-zinc-500 mb-4 block font-semibold">
            OUR LEGACY
          </span>
          
          {/* Delicate Divider Line with Central Ornament (No Brown) */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-zinc-200" />
            <span className="text-zinc-400 text-xs select-none">✦</span>
            <div className="w-12 h-[1px] bg-zinc-200" />
          </div>

          <h2 className="font-serif text-3.5xl sm:text-4.5xl md:text-5.5xl text-luxury-black tracking-tight font-light leading-tight">
            The milestones of <span className="italic font-light text-zinc-800">storytelling</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-zinc-500 font-sans text-sm sm:text-base font-light leading-relaxed mt-6">
            Every frame we capture becomes a timeless memory. Over the years, we've documented love stories, celebrated moments, and built bonds that last far beyond the last shutter.
          </p>
        </div>

        {/* Stats Columns - Redesigned as Bold Contrast Blocks from the uploaded image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {milestones.map((mil, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center justify-center p-10 md:p-12 text-center bg-gradient-to-b from-[#18181B] to-[#09090B] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-zinc-800/60 group hover:scale-[1.02] hover:shadow-[0_24px_60px_rgba(0,0,0,0.85)] hover:border-zinc-700/80 transition-all duration-500"
            >
              {/* Icon slot */}
              <div className="mb-6 p-2 rounded-full bg-zinc-900 border border-zinc-800">
                {mil.icon}
              </div>

              {/* White Numerals */}
              <div className="font-serif text-5xl sm:text-6xl md:text-7xl text-white font-light tracking-tight select-none flex items-baseline">
                <Counter value={mil.value} />
                <span className="text-white text-3xl md:text-4xl font-light ml-0.5">+</span>
              </div>
              
              {/* Divider exactly matching the visual spacing */}
              <div className="w-10 h-[1px] bg-zinc-800 my-5 group-hover:bg-zinc-700 transition-colors duration-500" />

              {/* White uppercase title */}
              <h3 className="font-sans text-[10px] sm:text-xs text-white tracking-[0.2em] uppercase font-bold mb-2">
                {mil.label}
              </h3>
              
              {/* Muted description */}
              <p className="text-zinc-400 font-sans text-xs font-light tracking-wide max-w-[200px] mx-auto">
                {mil.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Memories Section: Left Story Content, Right Overlapping Polaroid & Film Strip collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-5xl mx-auto mt-28 items-center">
          
          {/* Left Text Block */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-serif text-3xl sm:text-4xl text-luxury-black font-light leading-tight tracking-tight uppercase">
              More than moments,<br />we create <span className="italic lowercase tracking-normal font-normal">memories.</span>
            </h3>
            <p className="text-zinc-600 font-sans text-sm sm:text-base font-light leading-relaxed">
              We believe photography is not just about pictures, it's about emotions, connections, and the little details that make your story unique.
            </p>
            
            {/* Divider Line & DTSTUDIO Team Signature (No Brown) */}
            <div className="flex flex-col gap-1.5 mt-8 pt-6 border-t border-zinc-200/80">
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-bold">
                Handcrafted Artistry
              </span>
              <span className="font-signature text-3.5xl text-zinc-900 select-none">
                The DTSTUDIO Team
              </span>
            </div>
          </div>

          {/* Right Collage Block (Polaroids + Cinematic CSS Film Strip) */}
          <div className="lg:col-span-6 relative h-[380px] sm:h-[420px] w-full flex items-center justify-center select-none pt-4">
            
            {/* Polaroid 1 (Left tilted, grayscale) */}
            <div className="absolute left-[6%] top-[8%] w-[42%] aspect-[3/4.2] bg-white border border-zinc-200/60 p-2.5 pb-8 shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-sm -rotate-[4deg] transition-all duration-500 hover:rotate-0 hover:scale-105 hover:z-30 z-20">
              <div className="w-full h-full overflow-hidden bg-zinc-100 rounded-xs">
                <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600" 
                  alt="Bride portrait" 
                  className="w-full h-full object-cover grayscale contrast-115 brightness-95"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Polaroid 2 (Right tilted, overlapping) */}
            <div className="absolute right-[6%] top-[2%] w-[44%] aspect-[3/4.2] bg-white border border-zinc-200/60 p-2.5 pb-8 shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-sm rotate-[3deg] transition-all duration-500 hover:rotate-0 hover:scale-105 hover:z-30 z-10">
              <div className="w-full h-full overflow-hidden bg-zinc-100 rounded-xs">
                <img 
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600" 
                  alt="Wedding couple" 
                  className="w-full h-full object-cover grayscale contrast-115"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Overlapping Cinematic Film Strip (Grayscale, Sprocket holes look) */}
            <div className="absolute -bottom-4 left-[2%] right-[2%] bg-zinc-950 rounded-lg p-1.5 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.35)] -rotate-[2.5deg] z-25 border border-zinc-800">
              {/* Top Sprocket Holes */}
              <div className="flex justify-between px-3 mb-2.5 select-none opacity-80">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-zinc-800 rounded-xs border border-zinc-900" />
                ))}
              </div>

              {/* Film Frames (Horizontal grayscale frames) */}
              <div className="grid grid-cols-3 gap-1.5 px-1.5">
                <div className="aspect-[3/2] overflow-hidden border border-zinc-900 bg-zinc-900 rounded-xs">
                  <img 
                    src="https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&q=80&w=400" 
                    alt="Ritual frame" 
                    className="w-full h-full object-cover grayscale contrast-125 saturate-0"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[3/2] overflow-hidden border border-zinc-900 bg-zinc-900 rounded-xs">
                  <img 
                    src="https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=400" 
                    alt="Temple scenery" 
                    className="w-full h-full object-cover grayscale contrast-125 saturate-0"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[3/2] overflow-hidden border border-zinc-900 bg-zinc-900 rounded-xs">
                  <img 
                    src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=400" 
                    alt="Candid emotions" 
                    className="w-full h-full object-cover grayscale contrast-125 saturate-0"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Bottom Sprocket Holes */}
              <div className="flex justify-between px-3 mt-2.5 select-none opacity-80">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-zinc-800 rounded-xs border border-zinc-900" />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Value Props Grid (Pristine Black & White block matching the bottom row of image) */}
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-[28px] p-8 md:p-12 max-w-5xl mx-auto mt-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {valueProps.map((prop, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-white border border-zinc-200 shadow-xs">
                  {prop.icon}
                </div>
                <h4 className="font-sans text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-zinc-900">
                  {prop.title}
                </h4>
                <p className="text-zinc-500 font-sans text-xs font-light leading-relaxed max-w-[210px]">
                  {prop.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Manifesto (Landscape couple background banner styled like final row) */}
        <div className="max-w-5xl mx-auto mt-28 relative rounded-[32px] overflow-hidden group border border-zinc-200/80 shadow-xl">
          <div className="absolute inset-0 bg-black/65 z-10 transition-colors duration-500 group-hover:bg-black/60" />
          <img 
            src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1400"
            alt="Palace backdrop wedding"
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-115 transition-transform duration-[4s] group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          <div className="relative z-20 py-20 px-8 sm:px-12 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
            <div className="max-w-xl">
              <span className="text-white/40 font-serif text-7xl leading-none select-none h-6 block mb-2 font-light">“</span>
              <h4 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-light tracking-wide leading-tight">
                We don't just take photos,<br className="hidden sm:inline" /> we preserve your <span className="italic text-zinc-200">legacy</span>.
              </h4>
              <p className="text-zinc-400 font-sans text-xs sm:text-sm font-light leading-relaxed mt-4">
                Your love story deserves to be told beautifully, honestly, and forever.
              </p>
            </div>
            
            <button 
              onClick={() => {
                const contactSection = document.getElementById("contact");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-6 py-3.5 bg-white text-black hover:bg-zinc-200 text-[10px] sm:text-xs font-semibold tracking-widest uppercase transition-all duration-300 rounded shrink-0 self-start md:self-center shadow-lg active:scale-95 cursor-pointer border border-white"
            >
              Let's Tell Your Story →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
