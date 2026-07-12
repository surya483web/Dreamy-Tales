import React from "react";
import { motion } from "motion/react";
import { Instagram, Star, Heart } from "lucide-react";
import { AboutSection, StudioDetails } from "../types";

interface AboutUsProps {
  about?: AboutSection;
  details?: StudioDetails;
}

export default function AboutUs({ about, details }: AboutUsProps) {
  const photoUrl = about?.photoUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200";
  const name = details?.name || "DTSTUDIO";
  const msme = details?.msme || "MSME";
  const experience = details?.experience || "5+ Years";
  const storyHeadline = about?.storyHeadline || "";
  const storyDescription = about?.storyDescription || "";
  const owner = details?.owner || "Gyanu Verma";

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
      },
    },
  };

  return (
    <section id="about-us" className="relative py-28 md:py-36 bg-white overflow-hidden border-b border-zinc-200/40">
      {/* Background Architectural Watermarks & Subtle Luxury Ornaments */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-zinc-100/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-zinc-100 rounded-full blur-2xl pointer-events-none" />

      {/* Subtle layout gridlines */}
      <div className="absolute top-0 left-1/3 w-[1px] h-full bg-zinc-200/20 pointer-events-none hidden lg:block" />
      <div className="absolute top-0 right-1/3 w-[1px] h-full bg-zinc-200/20 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Massive Editorial Portrait Image Showcase */}
          <div className="lg:col-span-5 relative flex justify-center w-full">
            
            {/* Elegant outer frame shadow border */}
            <div className="absolute -inset-4 border border-zinc-200 rounded-[36px] pointer-events-none translate-x-2 translate-y-2 z-0 hidden sm:block" />

            {/* Huge high-fashion vertical image block */}
            <div className="relative w-full aspect-[2/3] max-h-[720px] overflow-hidden rounded-[32px] bg-zinc-100 shadow-[0_24px_50px_rgba(0,0,0,0.08)] border border-black/5 z-10 group">
              <img
                src={photoUrl}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
              />
              
              {/* Shimmer glaze */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            </div>

            {/* Premium boutique floating label */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-[#0D0D0D] border border-zinc-850 text-white py-4 px-6 rounded shadow-2xl flex flex-col justify-center items-center z-20 select-none">
              <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-400 uppercase font-semibold">
                {msme}
              </span>
              <span className="font-serif text-lg md:text-xl font-light tracking-widest mt-1 text-white">
                {experience}
              </span>
            </div>
          </div>

          {/* Right Column: Narrative Block */}
          <div className="lg:col-span-7 space-y-10">
            {/* Elegant section tag */}
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-black" />
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.5em] text-black font-semibold">
                Creative Vision
              </span>
            </div>

            {/* Redesigned Minimalist Serif Heading */}
            <h2 className="font-serif text-3.5xl sm:text-4.5xl md:text-5.5xl lg:text-6.5xl text-[#1A1A1A] tracking-wide leading-tight font-light uppercase">
              About the <br />
              <span className="text-black italic font-normal font-serif lowercase tracking-normal">studio</span>
            </h2>

            <div className="w-16 h-[1px] bg-zinc-200" />

            {/* Custom Narrative Body */}
            <div className="space-y-6">
              <p className="text-luxury-black font-sans text-base sm:text-lg md:text-xl font-light tracking-wide leading-relaxed">
                {storyHeadline} — {name} is a high-fashion, boutique photography &amp; film studio crafted for couples who cherish absolute visual poetry.
              </p>
              
              <p className="text-zinc-500 font-sans text-sm sm:text-base font-light leading-relaxed whitespace-pre-line">
                {storyDescription} Under the creative direction of Gyanu Verma and backed by {experience} of excellence, we specialize in luxury wedding storytelling that feels deeply intimate, authentic, and cinematic. We bypass forced poses to preserve the raw, unscripted chemistry that makes your tale unique.
              </p>

              <p className="text-zinc-400 font-sans text-sm sm:text-base font-light leading-relaxed">
                Every frame we capture is treated as a unique canvas of light and shadows, combining architectural discipline with raw human sentiment. We believe that true wedding luxury lies in the details—the soft rustle of silk, the quiet exchange of a glance before the crowd gathers, and the unfiltered emotional depth of your closest relationships. By maintaining a quiet, non-obtrusive presence, we allow your day to unfold organically while crafting a high-end visual legacy that will be treasured for generations.
              </p>
            </div>

            {/* Founder approval & stamp of luxury */}
            <div className="flex items-center gap-6 pt-2 border-t border-zinc-200/50 max-w-md">
              <div>
                <span className="block font-serif text-lg tracking-wide text-[#1A1A1A] font-medium uppercase">
                  {owner}
                </span>
                <span className="block text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-400 font-bold mt-0.5">
                  Founder &amp; Lead Curator
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center p-2 bg-zinc-50 select-none ml-auto">
                <Star className="w-4 h-4 text-black fill-black/5" />
              </div>
            </div>

            {/* Instagram Link Button */}
            <div className="pt-2">
              <a
                href="https://www.instagram.com/dreamytalesstudio?igsh=bTA2NjRnZXdzMWMy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-6 py-3.5 bg-black hover:bg-zinc-900 text-white rounded text-xs uppercase tracking-[0.2em] font-medium transition-all duration-500 shadow-xl group"
                id="about-us-instagram-btn"
              >
                <Instagram className="w-4 h-4 text-white group-hover:text-zinc-300 transition-colors" />
                <span>Explore Our Instagram</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
