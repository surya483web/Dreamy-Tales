import React, { useState, useEffect } from "react";
import { Save, Tv, Type, AlignLeft } from "lucide-react";
import { HeroSection as HeroType } from "../../types";
import { AdminMediaUpload } from "./AdminMediaUpload";

interface HeroSectionProps {
  initialHero: HeroType;
  onSave: (hero: HeroType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ initialHero, onSave }) => {
  const [hero, setHero] = useState<HeroType>(initialHero);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setHero(initialHero);
  }, [initialHero]);

  const handleChange = (field: keyof HeroType, value: string) => {
    setHero((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(hero);
    setIsSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Hero Visual Showcase</h3>
          <p className="text-xs text-zinc-400">Configure your prominent top landing visual elements and display copy.</p>
        </div>
        <button
          type="submit"
          disabled={isSaved}
          className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            isSaved
              ? "bg-zinc-800 text-zinc-500 cursor-default"
              : "bg-gold hover:bg-gold-dark text-luxury-black font-semibold hover:text-white"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaved ? "Saved" : "Apply Changes"}
        </button>
      </div>

      <div className="space-y-5">
        {/* Headline */}
        <div className="space-y-1.5">
          <label htmlFor="hero-headline" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Type className="w-3 h-3 text-gold" /> Cinematic Headline
          </label>
          <input
            id="hero-headline"
            type="text"
            value={hero.headline}
            onChange={(e) => handleChange("headline", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="DT Dreamy Tales Studio"
          />
        </div>

        {/* Sub Headline */}
        <div className="space-y-1.5">
          <label htmlFor="hero-subHeadline" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <AlignLeft className="w-3 h-3 text-gold" /> Subtitle / Catchphrase
          </label>
          <input
            id="hero-subHeadline"
            type="text"
            value={hero.subHeadline}
            onChange={(e) => handleChange("subHeadline", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Capturing Your Moments, Creating Timeless Stories"
          />
        </div>

        {/* Hero Video Upload */}
        <AdminMediaUpload
          id="hero-video"
          label="Hero Background Cinematic Video"
          value={hero.videoUrl}
          onChange={(url) => handleChange("videoUrl", url)}
          accept="video/*"
          placeholder="E.g. direct mp4 URL"
        />
      </div>
    </form>
  );
};
