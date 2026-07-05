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
import { getLocalInquiries, saveLocalInquiries } from "../lib/storage";

interface ContactProps {
  details?: StudioDetails;
  isModalOpen?: boolean;
  setIsModalOpen?: (open: boolean) => void;
}

export default function Contact({ details, isModalOpen: controlledModalOpen, setIsModalOpen: setControlledModalOpen }: ContactProps) {
  // Modal state for Reservation Request Form with optional control from parent
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isModalOpen = controlledModalOpen !== undefined ? controlledModalOpen : localModalOpen;
  const setIsModalOpen = setControlledModalOpen !== undefined ? setControlledModalOpen : setLocalModalOpen;

  const locationVal = details?.location || "Delhi / NCR";
  const ownerVal = details?.owner || "Gyanu Verma";
  const emailVal = details?.email || "dreamytalesstudio@gmail.com";
  const instagramVal = details?.instagram || "@dreamytalesstudio";
  const phoneVal = details?.phone || "+91 9717013233";

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
        // Fallback to storing inquiry locally in IndexedDB so that it is visible in the Admin Panel
        const inquiries = (await getLocalInquiries()) || [];
        
        const newInquiry = {
          id: `inq-${Date.now()}`,
          ...formData,
          status: "new",
          createdAt: new Date().toISOString(),
        };
        
        inquiries.unshift(newInquiry);
        await saveLocalInquiries(inquiries);
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
    <section id="contact" className="relative py-28 md:py-36 bg-white text-luxury-black overflow-hidden border-t border-[#EAE3DB]">
      
      {/* Background Cinematic Lighting Details */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#C5A880]/15 via-transparent to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#D9C4A9]/10 via-transparent to-transparent blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Block with high premium contrast */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 md:mb-24">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#8E724F] font-semibold">
                RESERVE THE MEMORY
              </span>
              <div className="w-1.5 h-1.5 bg-[#8E724F] rounded-full" />
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-luxury-black tracking-wide font-light leading-tight">
              Let's Co-Create Your <br />
              <span className="text-[#8E724F] font-medium bg-gradient-to-r from-[#A3865E] via-[#8E724F] to-[#715A3D] bg-clip-text text-transparent">
                Cinematic Legacy
              </span>
            </h2>

            <p className="text-zinc-600 font-sans text-xs sm:text-sm font-light leading-relaxed max-w-xl">
              Due to our high-fidelity custom narrative style, we document only a select group of weddings and high-profile events annually. Secure your reservation console to verify availability.
            </p>
          </div>

          {/* Right Column: Stunning cinema camera visual with premium light borders */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#C5A880]/10 to-transparent rounded-lg blur-xl pointer-events-none" />
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#E6DCD3] bg-white shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?q=80&w=1200&auto=format&fit=crop"
                alt="Cinematic Camera Setup"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-[3s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 flex items-center space-x-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded border border-[#E6DCD3] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#8E724F] animate-pulse" />
                <span className="font-mono text-[9px] tracking-wider text-[#8E724F] font-semibold">LIVE FEED // 4K NARRATIVE RECORDING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Coordinate Blocks - purely White & Light Brown premium design */}
        <div className="space-y-5 max-w-5xl mx-auto mb-16">
          
          {/* 1. Studio Coordinates (Light Brown / Cream) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl border border-[#E8DFD5] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-[0_4px_20px_rgba(142,114,79,0.03)] hover:shadow-[0_12px_32px_rgba(142,114,79,0.07)] hover:border-[#8E724F]/40"
          >
            <div className="flex items-center space-x-5">
              <div className="relative w-14 h-14 rounded-xl border border-[#EBDCCF] bg-[#FAF6F2] flex items-center justify-center text-[#8E724F] shadow-sm shrink-0">
                <MapPin className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#8E724F] rounded-full" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-[#8E724F] font-bold">STUDIO COORDINATES</span>
                <p className="font-serif text-lg sm:text-xl text-luxury-black group-hover:text-[#8E724F] transition-colors mt-0.5 font-light">
                  {locationVal}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Bespoke studio space
                </p>
              </div>
            </div>
            
            {/* Elegant light-brown spinning element */}
            <div className="h-10 opacity-30 group-hover:opacity-55 transition-all duration-500 flex items-center pr-4">
              <Globe className="w-10 h-10 text-[#8E724F] animate-[spin_50s_linear_infinite]" />
            </div>
          </motion.div>

          {/* 2. Lead Creative Producer (Light Brown / Cream) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-[#E8DFD5] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-[0_4px_20px_rgba(142,114,79,0.03)] hover:shadow-[0_12px_32px_rgba(142,114,79,0.07)] hover:border-[#8E724F]/40"
          >
            <div className="flex items-center space-x-5">
              <div className="relative w-14 h-14 rounded-xl border border-[#EBDCCF] bg-[#FAF6F2] flex items-center justify-center text-[#8E724F] shadow-sm shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-[#8E724F] font-bold">LEAD CREATIVE PRODUCER</span>
                <p className="font-serif text-lg sm:text-xl text-luxury-black group-hover:text-[#8E724F] transition-colors mt-0.5 font-light">
                  {ownerVal}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Director of Fine Art
                </p>
              </div>
            </div>
            
            <div className="h-10 opacity-30 group-hover:opacity-55 transition-all duration-500 flex items-center pr-4">
              <Tv className="w-9 h-9 text-[#8E724F]" />
            </div>
          </motion.div>

          {/* 3. Electronic Transmissions (Light Brown / Cream) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-[#E8DFD5] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-[0_4px_20px_rgba(142,114,79,0.03)] hover:shadow-[0_12px_32px_rgba(142,114,79,0.07)] hover:border-[#8E724F]/40"
          >
            <a href={`mailto:${emailVal}`} className="flex items-center space-x-5 flex-grow">
              <div className="relative w-14 h-14 rounded-xl border border-[#EBDCCF] bg-[#FAF6F2] flex items-center justify-center text-[#8E724F] shadow-sm shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-[#8E724F] font-bold">ELECTRONIC TRANSMISSIONS</span>
                <p className="font-serif text-lg sm:text-xl text-luxury-black group-hover:text-[#8E724F] transition-colors mt-0.5 font-light break-all">
                  {emailVal}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Average response: 4 Hours
                </p>
              </div>
            </a>
            
            <div className="h-10 opacity-30 group-hover:opacity-55 transition-all duration-500 flex items-center pr-4">
              <Compass className="w-9 h-9 text-[#8E724F]" />
            </div>
          </motion.div>

          {/* 4. Digital Narrative Index (Light Brown / Cream) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-[#E8DFD5] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-[0_4px_20px_rgba(142,114,79,0.03)] hover:shadow-[0_12px_32px_rgba(142,114,79,0.07)] hover:border-[#8E724F]/40"
          >
            <a 
              href="https://www.instagram.com/dreamytalesstudio?igsh=bTA2NjRnZXdzMWMy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-5 flex-grow"
            >
              <div className="relative w-14 h-14 rounded-xl border border-[#EBDCCF] bg-[#FAF6F2] flex items-center justify-center text-[#8E724F] shadow-sm shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-[#8E724F] font-bold">DIGITAL NARRATIVE INDEX</span>
                <p className="font-serif text-lg sm:text-xl text-luxury-black group-hover:text-[#8E724F] transition-colors mt-0.5 font-light">
                  {instagramVal}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Cinematic portfolio & updates
                </p>
              </div>
            </a>
            
            <div className="h-10 opacity-30 group-hover:opacity-55 transition-all duration-500 flex items-center pr-4">
              <Sparkles className="w-9 h-9 text-[#8E724F]" />
            </div>
          </motion.div>

          {/* 5. Direct Voice Terminal (Light Brown / Cream) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-[#E8DFD5] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-[0_4px_20px_rgba(142,114,79,0.03)] hover:shadow-[0_12px_32px_rgba(142,114,79,0.07)] hover:border-[#8E724F]/40"
          >
            <a href={`tel:${phoneVal}`} className="flex items-center space-x-5 flex-grow">
              <div className="relative w-14 h-14 rounded-xl border border-[#EBDCCF] bg-[#FAF6F2] flex items-center justify-center text-[#8E724F] shadow-sm shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-[#8E724F] font-bold">DIRECT VOICE TERMINAL</span>
                <p className="font-serif text-lg sm:text-xl text-luxury-black group-hover:text-[#8E724F] transition-colors mt-0.5 font-light">
                  {phoneVal}
                </p>
                <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                  Priority scheduling lines
                </p>
              </div>
            </a>
            
            {/* Elegant light-brown signal indicator */}
            <div className="h-10 opacity-30 group-hover:opacity-60 transition-all duration-500 flex items-center pr-4 space-x-0.5">
              <div className="w-[3px] h-6 bg-[#8E724F] rounded-full" />
              <div className="w-[3px] h-9 bg-[#8E724F] rounded-full" />
              <div className="w-[3px] h-7 bg-[#8E724F] rounded-full" />
              <div className="w-[3px] h-4 bg-[#8E724F] rounded-full" />
            </div>
          </motion.div>

        </div>

        {/* Bottom Banner inside light card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto rounded-2xl border border-[#E6DCD3] bg-white p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_12px_45px_rgba(142,114,79,0.05)]"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded bg-[#FAF6F2] flex items-center justify-center text-[#8E724F] shrink-0 border border-[#E1D4C6]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#8E724F] font-serif text-sm font-semibold">
                Your story deserves to be told like a masterpiece.
              </p>
              <p className="text-zinc-500 font-sans text-xs font-light mt-0.5">
                Reserve your date now and let's create magic together.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#8E724F] hover:bg-[#715A3D] text-white font-semibold text-[10px] tracking-[0.2em] px-7 py-3.5 rounded uppercase transition-all duration-500 shadow-md inline-flex items-center space-x-2 shrink-0 cursor-pointer"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-2xl bg-white border border-[#E6DCD3] rounded-2xl p-6 md:p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-luxury-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                title="Close Form"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8 pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8E724F] font-semibold">RESERVATION CONSOLE</span>
                  <div className="w-1 h-1 bg-[#8E724F] rounded-full" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-luxury-black font-light tracking-wide">Request Booking Availability</h3>
                <p className="text-zinc-500 text-xs font-light mt-1">
                  Share your celebration coordinates below for an absolute proposal.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Your Full Name <span className="text-[#8E724F]">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Partner's Name
                    </label>
                    <input
                      type="text"
                      name="partnerName"
                      value={formData.partnerName}
                      onChange={handleInputChange}
                      placeholder="Enter partner name"
                      className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Event Type & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Visual Package Category <span className="text-[#8E724F]">*</span>
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans cursor-pointer"
                      required
                    >
                      {eventTypes.map((t) => (
                        <option key={t} value={t} className="bg-white text-luxury-black">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Celebration Calendar Date <span className="text-[#8E724F]">*</span>
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Electronic Mail <span className="text-[#8E724F]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                      Mobile Number <span className="text-[#8E724F]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 99999 99999"
                      className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                {/* Narrative Message */}
                <div className="space-y-1.5">
                  <label className="block text-zinc-700 font-sans text-[10px] uppercase tracking-widest font-semibold">
                    Narrative Details &amp; style dreams <span className="text-[#8E724F]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your celebration, venue coordinates, flow, and visual preferences..."
                    className="w-full bg-[#FDFBF9] border border-[#E1D4C6] hover:border-[#C5A880] rounded px-4 py-3 text-xs text-luxury-black focus:outline-none focus:border-[#8E724F] focus:ring-1 focus:ring-[#8E724F] transition-all font-sans resize-none"
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
                      className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-sans font-medium"
                    >
                      {errorMsg}
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs flex items-start space-x-3.5 font-sans"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-emerald-900">Transmission Complete</p>
                        <p className="opacity-95 mt-1 text-emerald-800">{successMsg}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form CTA Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-[#E6DCD3]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded border border-[#E6DCD3] hover:bg-zinc-50 text-zinc-700 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded bg-[#8E724F] hover:bg-[#715A3D] text-white font-semibold text-[10px] uppercase tracking-wider transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
