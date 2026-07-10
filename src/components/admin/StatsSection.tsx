import React, { useState, useEffect } from "react";
import { Save, Award, Users, Camera } from "lucide-react";
import { AdminMediaUpload } from "./AdminMediaUpload";

interface StatsType {
  weddings: number;
  couples: number;
  events: number;
  backgroundUrl?: string;
}

interface StatsSectionProps {
  initialStats: StatsType;
  onSave: (stats: StatsType) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ initialStats, onSave }) => {
  const [stats, setStats] = useState<StatsType>(initialStats);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const handleNumChange = (field: keyof Omit<StatsType, "backgroundUrl">, val: string) => {
    const parsed = parseInt(val, 10);
    setStats((prev) => ({ ...prev, [field]: isNaN(parsed) ? 0 : parsed }));
    setIsSaved(false);
  };

  const handleBgChange = (url: string) => {
    setStats((prev) => ({ ...prev, backgroundUrl: url }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(stats);
    setIsSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Vows &amp; Legacy Stats</h3>
          <p className="text-xs text-zinc-400">Edit the counters displayed in the stats section and upload a rich backdrop image.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weddings Done */}
        <div className="space-y-1.5 bg-white/2 border border-white/5 p-4 rounded-lg">
          <label htmlFor="stats-weddings" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-gold" /> Weddings Completed
          </label>
          <input
            id="stats-weddings"
            type="number"
            min="0"
            value={stats.weddings}
            onChange={(e) => handleNumChange("weddings", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors font-mono"
          />
        </div>

        {/* Happy Couples */}
        <div className="space-y-1.5 bg-white/2 border border-white/5 p-4 rounded-lg">
          <label htmlFor="stats-couples" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-gold" /> Happy Couples
          </label>
          <input
            id="stats-couples"
            type="number"
            min="0"
            value={stats.couples}
            onChange={(e) => handleNumChange("couples", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors font-mono"
          />
        </div>

        {/* Major Events */}
        <div className="space-y-1.5 bg-white/2 border border-white/5 p-4 rounded-lg">
          <label htmlFor="stats-events" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-gold" /> Major Events Shot
          </label>
          <input
            id="stats-events"
            type="number"
            min="0"
            value={stats.events}
            onChange={(e) => handleNumChange("events", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors font-mono"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <AdminMediaUpload
          id="stats-bg"
          label="Stats Background backdrop image"
          value={stats.backgroundUrl || ""}
          onChange={handleBgChange}
          accept="image/*"
        />
      </div>
    </form>
  );
};
