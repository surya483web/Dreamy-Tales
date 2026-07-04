import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Users, 
  Loader2, 
  CheckCircle2, 
  Send, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  X, 
  Compass, 
  Tv, 
  Globe
} from "lucide-react";
import { StudioDetails } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ContactProps {
  details: StudioDetails;
}

export default function Contact({ details }: ContactProps) {
  // Modal state for Reservation Request Form
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    partnerName: "",
    eventType: "Wedding Ceremony",
    eventDate: "",
    phone: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eventTypes = [
    "Wedding Ceremony",
    "Pre-Wedding Shoot",
    "Cinematic Film Portfolio",
    "Candid Photography Shoot",
    "Engagement / Roka",
    "Maternity / Portraiture",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!formData.clientName || !formData.eventType || !formData.eventDate || !formData.phone || !formData.email || !formData.message) {
      setErrorMsg("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      let submissionSuccess = false;
      let msg = "";

      try {
        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const resData = await response.json();
          msg = resData.message;
          submissionSuccess = true;
        }
      } catch (e) {
        console.warn("Express server not available. Storing locally as fallback:", e);
      }

      if (!submissionSuccess) {
        // Fallback to storing inquiry locally in localStorage so that it is visible in the Admin Panel
        const savedInquiries = localStorage.getItem("studio_inquiries");
        let inquiries = [];
        if (savedInquiries) {
          try {
            inquiries = JSON.parse(savedInquiries);
          } catch (e) {}
        }
        
        const newInquiry = {
          id: `inq-${Date.now()}`,
          ...formData,
          status: "new",
          createdAt: new Date().toISOString(),
        };
        
        inquiries.unshift(newInquiry);
        localStorage.setItem("studio_inquiries", JSON.stringify(inquiries));
        msg = "Reservation request saved successfully to your browser storage!";
        submissionSuccess = true;
      }

      setSuccessMsg(msg || "Reservation request transmitted! Our lead producer will review and contact you shortly.");
      
      // Reset form
      setFormData({
        clientName: "",
        partnerName: "",
        eventType: "Wedding Ceremony",
        eventDate: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while submitting your reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 bg-[#0B0A08] text-white overflow-hidden border-t border-zinc-900">
      
      {/* Background Cinematic Lighting Details */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-zinc-900/50 via-transparent to-transparent blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Block exactly like the uploaded image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 md:mb-24">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#C5A880] font-semibold">
                RESERVE THE MEMORY
              </span>
              <div className="w-1.5 h-1.5 bg-[#C5A880] rounded-full shadow-[0_0_8px_#C5A880]" />
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-wide font-light leading-tight">
              Let's Co-Create Your <br />
              <span className="text-[#C5A880] font-medium bg-gradient-to-r from-amber-200 via-[#C5A880] to-amber-600 bg-clip-text text-transparent">
                Cinematic Legacy
              </span>
            </h2>

            <p className="text-zinc-400 font-sans text-xs sm:text-sm font-light leading-relaxed max-w-xl">
              Due to our high-fidelity custom narrative style, we document only a select group of weddings and high-profile events annually. Secure your reservation console to verify availability.
            </p>

            {/* Three outline badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded border border-zinc-800 bg-zinc-900/30">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">EXCLUSIVE BOOKINGS</span>
                  <span className="block text-[10px] text-zinc-500 font-light mt-0.5">Limited projects per year</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2.5 rounded border border-zinc-800 bg-zinc-900/30">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">CINEMATIC STORYTELLING</span>
                  <span className="block text-[10px] text-zinc-500 font-light mt-0.5">Crafted with emotion</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded border border-zinc-800 bg-zinc-900/30">
                <Lock className="w-4 h-4 text-[#C5A880]" />
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">PRIORITY AVAILABILITY</span>
                  <span className="block text-[10px] text-zinc-500 font-light mt-0.5">Secure your date early</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stunning cinema camera visual exactly matching the mockup */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/10 to-transparent rounded-lg blur-xl pointer-events-none" />
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?q=80&w=1200&auto=format&fit=crop"
                alt="Cinematic Camera Setup"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[3s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center space-x-2.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-[9px] tracking-wider text-zinc-300">LIVE FEED // 4K NARRATIVE RECORDING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Glow Blocks matching the uploaded design */}
        <div className="space-y-5 max-w-5xl mx-auto mb-16">
          
          {/* 1. Studio Coordinates (Blue themed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-xl border border-blue-900/30 hover:border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-[#0B0A08] to-[#0B0A08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500"
          >
            <div className="flex items-center space-x-5">
              <div className="relative w-14 h-14 rounded-xl border border-blue-950 bg-blue-950/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:bg-blue-950/50 group-hover:border-blue-500/40 transition-all duration-500 shrink-0">
                <MapPin className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-blue-400 font-bold">STUDIO COORDINATES</span>
                <p className="font-serif text-lg sm:text-xl text-white group-hover:text-blue-300 transition-colors mt-0.5 font-light">
                  {details.location}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Bespoke studio space
                </p>
              </div>
            </div>
            
            {/* Blue glowing map vector outline */}
            <div className="h-10 opacity-20 group-hover:opacity-40 transition-all duration-500 flex items-center pr-4">
              <Globe className="w-12 h-12 text-blue-400 animate-[spin_40s_linear_infinite]" />
            </div>
          </motion.div>

          {/* 2. Lead Creative Producer (Purple themed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-xl border border-purple-900/30 hover:border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-[#0B0A08] to-[#0B0A08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500"
          >
            <div className="flex items-center space-x-5">
              <div className="relative w-14 h-14 rounded-xl border border-purple-950 bg-purple-950/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:bg-purple-950/50 group-hover:border-purple-500/40 transition-all duration-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-purple-400 font-bold">LEAD CREATIVE PRODUCER</span>
                <p className="font-serif text-lg sm:text-xl text-white group-hover:text-purple-300 transition-colors mt-0.5 font-light">
                  {details.owner}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Director of Fine Art
                </p>
              </div>
            </div>
            
            {/* Director spotlight accent */}
            <div className="h-10 opacity-20 group-hover:opacity-40 transition-all duration-500 flex items-center pr-4">
              <Tv className="w-10 h-10 text-purple-400" />
            </div>
          </motion.div>

          {/* 3. Electronic Transmissions (Green themed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden rounded-xl border border-emerald-900/30 hover:border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#0B0A08] to-[#0B0A08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500"
          >
            <a href={`mailto:${details.email}`} className="flex items-center space-x-5 flex-grow">
              <div className="relative w-14 h-14 rounded-xl border border-emerald-950 bg-emerald-950/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:bg-emerald-950/50 group-hover:border-emerald-500/40 transition-all duration-500 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold">ELECTRONIC TRANSMISSIONS</span>
                <p className="font-serif text-lg sm:text-xl text-white group-hover:text-emerald-300 transition-colors mt-0.5 font-light break-all">
                  {details.email}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Average response: 4 Hours
                </p>
              </div>
            </a>
            
            {/* floating holographic lines */}
            <div className="h-10 opacity-20 group-hover:opacity-40 transition-all duration-500 flex items-center pr-4">
              <Compass className="w-10 h-10 text-emerald-400" />
            </div>
          </motion.div>

          {/* 4. Digital Narrative Index (Gold/Orange themed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative overflow-hidden rounded-xl border border-amber-900/30 hover:border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#0B0A08] to-[#0B0A08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500"
          >
            <a 
              href="https://www.instagram.com/dreamytalesstudio?igsh=bTA2NjRnZXdzMWMy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-5 flex-grow"
            >
              <div className="relative w-14 h-14 rounded-xl border border-amber-950 bg-amber-950/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:bg-amber-950/50 group-hover:border-amber-500/40 transition-all duration-500 shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-amber-400 font-bold">DIGITAL NARRATIVE INDEX</span>
                <p className="font-serif text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors mt-0.5 font-light">
                  {details.instagram}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Cinematic portfolio & updates
                </p>
              </div>
            </a>
            
            {/* film strip representation */}
            <div className="h-10 opacity-20 group-hover:opacity-40 transition-all duration-500 flex items-center pr-4">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
          </motion.div>

          {/* 5. Direct Voice Terminal (Red themed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative overflow-hidden rounded-xl border border-red-900/30 hover:border-red-500/30 bg-gradient-to-r from-red-950/20 via-[#0B0A08] to-[#0B0A08] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500"
          >
            <a href={`tel:${details.phone}`} className="flex items-center space-x-5 flex-grow">
              <div className="relative w-14 h-14 rounded-xl border border-red-950 bg-red-950/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:bg-red-950/50 group-hover:border-red-500/40 transition-all duration-500 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold">DIRECT VOICE TERMINAL</span>
                <p className="font-serif text-lg sm:text-xl text-white group-hover:text-red-300 transition-colors mt-0.5 font-light">
                  {details.phone}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Priority scheduling lines
                </p>
              </div>
            </a>
            
            {/* red soundwave effect */}
            <div className="h-10 opacity-20 group-hover:opacity-40 transition-all duration-500 flex items-center pr-4 space-x-0.5">
              <div className="w-[3px] h-6 bg-red-400 rounded-full animate-[pulse_1s_infinite]" />
              <div className="w-[3px] h-10 bg-red-400 rounded-full animate-[pulse_1.2s_infinite_0.2s]" />
              <div className="w-[3px] h-8 bg-red-400 rounded-full animate-[pulse_0.8s_infinite_0.4s]" />
              <div className="w-[3px] h-5 bg-red-400 rounded-full animate-[pulse_1.4s_infinite_0.1s]" />
              <div className="w-[3px] h-3 bg-red-400 rounded-full animate-[pulse_0.9s_infinite_0.5s]" />
            </div>
          </motion.div>

        </div>

        {/* Bottom Banner exactly matching the mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto rounded-xl border border-[#C5A880]/30 bg-[#151310] p-6 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] shrink-0 border border-[#C5A880]/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#C5A880] font-serif text-sm font-light">
                Your story deserves to be told like a masterpiece.
              </p>
              <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                Reserve your date now and let's create magic together.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#C5A880] hover:bg-white text-black font-semibold text-[10px] tracking-[0.2em] px-7 py-3.5 rounded uppercase transition-all duration-500 shadow-xl inline-flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>CHECK AVAILABILITY</span>
            <span className="font-sans text-xs">→</span>
          </button>
        </motion.div>

      </div>

      {/* Boutique Overlay Modal for Requesting Booking Availability */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Content Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-2xl bg-[#0F0E0C] border border-zinc-800 rounded-xl p-6 md:p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
                title="Close Form"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8 pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#C5A880] font-semibold">RESERVATION CONSOLE</span>
                  <div className="w-1 h-1 bg-[#C5A880] rounded-full" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">Request Booking Availability</h3>
                <p className="text-zinc-500 text-xs font-light mt-1">
                  Share your celebration coordinates below for an absolute proposal.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Your Full Name <span className="text-[#C5A880]">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Partner's Name
                    </label>
                    <input
                      type="text"
                      name="partnerName"
                      value={formData.partnerName}
                      onChange={handleInputChange}
                      placeholder="Enter partner name"
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Event Type & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Visual Package Category <span className="text-[#C5A880]">*</span>
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans cursor-pointer"
                      required
                    >
                      {eventTypes.map((t) => (
                        <option key={t} value={t} className="bg-zinc-950 text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Celebration Calendar Date <span className="text-[#C5A880]">*</span>
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Electronic Mail <span className="text-[#C5A880]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Mobile Number <span className="text-[#C5A880]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 99999 99999"
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                {/* Narrative Message */}
                <div className="space-y-1.5">
                  <label className="block text-zinc-400 font-sans text-[10px] uppercase tracking-widest font-semibold">
                    Narrative Details &amp; style dreams <span className="text-[#C5A880]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your celebration, venue coordinates, flow, and visual preferences..."
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A880] transition-all font-sans resize-none"
                    required
                  />
                </div>

                {/* Feedback Alerts */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 rounded text-xs font-sans font-medium"
                    >
                      {errorMsg}
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 rounded-lg text-xs flex items-start space-x-3.5 font-sans"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-emerald-200">Transmission Complete</p>
                        <p className="opacity-95 mt-1">{successMsg}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form CTA Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded bg-[#C5A880] hover:bg-white text-black font-semibold text-[10px] uppercase tracking-wider transition-all shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Proposal</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
