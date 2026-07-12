import React, { useState, useEffect } from "react";
import { Save, Info, User, Phone, Mail, MapPin, Award, CheckSquare } from "lucide-react";
import { StudioDetails } from "../../types";

interface DetailsSectionProps {
  initialDetails: StudioDetails;
  onSave: (details: StudioDetails) => void;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({ initialDetails, onSave }) => {
  const [details, setDetails] = useState<StudioDetails>(initialDetails);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setDetails(initialDetails);
  }, [initialDetails]);

  const handleChange = (field: keyof StudioDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(details);
    setIsSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Studio Info &amp; Details</h3>
          <p className="text-xs text-zinc-400">Configure your primary contact information and presentation metadata.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Studio Name */}
        <div className="space-y-1.5">
          <label htmlFor="studio-name" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Info className="w-3 h-3 text-gold" /> Studio Brand Name
          </label>
          <input
            id="studio-name"
            type="text"
            value={details.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Dreamy Tales Studio"
          />
        </div>

        {/* Owner */}
        <div className="space-y-1.5">
          <label htmlFor="studio-owner" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <User className="w-3 h-3 text-gold" /> Owner / Creative Director
          </label>
          <input
            id="studio-owner"
            type="text"
            value={details.owner}
            onChange={(e) => handleChange("owner", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Gyanu Verma"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="studio-phone" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Phone className="w-3 h-3 text-gold" /> Contact Phone Number
          </label>
          <input
            id="studio-phone"
            type="text"
            value={details.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="studio-email" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Mail className="w-3 h-3 text-gold" /> Studio Email Address
          </label>
          <input
            id="studio-email"
            type="email"
            value={details.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="dreamytalesstudio@gmail.com"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-1.5">
          <label htmlFor="studio-instagram" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <svg className="w-3 h-3 text-gold fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Instagram Handle
          </label>
          <input
            id="studio-instagram"
            type="text"
            value={details.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="@dreamytalesstudio"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label htmlFor="studio-location" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gold" /> Studio Base Location
          </label>
          <input
            id="studio-location"
            type="text"
            value={details.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="Greater Noida / Delhi NCR"
          />
        </div>

        {/* Experience */}
        <div className="space-y-1.5">
          <label htmlFor="studio-experience" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <Award className="w-3 h-3 text-gold" /> Creative Experience
          </label>
          <input
            id="studio-experience"
            type="text"
            value={details.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="5+ Years"
          />
        </div>

        {/* MSME Status */}
        <div className="space-y-1.5">
          <label htmlFor="studio-msme" className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-gold" /> MSME / Government Certification
          </label>
          <input
            id="studio-msme"
            type="text"
            value={details.msme}
            onChange={(e) => handleChange("msme", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="MSME Registered"
          />
        </div>
      </div>
    </form>
  );
};
