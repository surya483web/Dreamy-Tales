import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { HeroSection } from "../types";

interface HeroProps {
  data: HeroSection;
}

export default function Hero({ data }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [data.videoUrl]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const scrollDown = () => {
    const nextSection = document.querySelector("#about-us");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToReserve = () => {
    const reserveSection = document.querySelector("#contact");
    if (reserveSection) {
      reserveSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={data.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="h-full w-full object-cover scale-105 filter brightness-95"
        />
        {/* Cinematic Premium Light Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-black/35 z-10" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-20 h-full w-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-4xl"
        >
          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl text-luxury-black tracking-widest font-normal uppercase select-none leading-none drop-shadow-sm">
            {data.headline.split(" ").map((word, i) => (
              <span key={i} className="inline-block mx-2">
                {word}
              </span>
            ))}
          </h1>

          {/* Golden Divider */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-8" />

          {/* Subtitle */}
          <p className="font-serif text-lg md:text-2xl text-gold-dark italic tracking-wide max-w-2xl mx-auto font-light leading-relaxed mb-8">
            "{data.subHeadline}"
          </p>

          {/* Reserve CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={scrollToReserve}
              className="px-8 py-4 bg-luxury-black hover:bg-gold text-white font-semibold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-xl rounded-sm hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              Reserve Your Date
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Ambient Audio Toggle */}
      <div className="absolute bottom-12 left-6 md:left-12 z-30">
        <button
          onClick={toggleMute}
          className="flex items-center space-x-3 bg-white/70 backdrop-blur-md border border-gold/30 hover:border-gold hover:bg-gold/10 text-gold-dark hover:text-luxury-black px-4 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Play Sound</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-gold-dark" />
              <span className="hidden md:inline font-medium">Mute Audio</span>
            </>
          )}
        </button>
      </div>

      {/* Luxury Scroll Mouse Indicator */}
      <div className="absolute bottom-12 right-6 md:right-12 z-30">
        <button
          onClick={scrollDown}
          className="group flex flex-col items-center text-luxury-black/60 hover:text-gold transition-colors duration-300"
        >
          <span className="font-sans text-[9px] uppercase tracking-[0.25em] mb-2 rotate-90 origin-right translate-x-2 translate-y-3 opacity-80 group-hover:opacity-100">
            Scroll
          </span>
          <div className="w-6 h-10 border border-luxury-black/20 rounded-full flex items-start justify-center p-1 group-hover:border-gold transition-colors">
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 bg-gold rounded-full"
            />
          </div>
        </button>
      </div>
    </section>
  );
}
