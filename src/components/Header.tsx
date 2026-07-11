import React, { useState, useEffect } from "react";
import { Menu, X, Sliders, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  onAdminClick: () => void;
  onTermsClick: () => void;
  isAdminMode: boolean;
  currentPath: string;
}

export default function Header({ onAdminClick, onTermsClick, isAdminMode, currentPath }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOverlayMenuOpen, setIsOverlayMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      // Permanently visible as requested
      setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Signature Work", href: "#story" },
    { name: "About Us", href: "#about-us" },
    { name: "Films & Photos", href: "#portfolio" },
    { name: "Experience", href: "#experience" },
    { name: "Reviews", href: "#praise" },
    { name: "Reserve", href: "#contact" },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Let the hash update naturally to support browser navigation/page change
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled || currentPath !== "home"
          ? "bg-white/80 backdrop-blur-xl border-b border-white/30 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
          : "bg-black/20 backdrop-blur-md border-b border-white/15 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Left Section: Brand Logo */}
        <a href="#home" onClick={(e) => handleLinkClick(e, "#home")} className="flex items-center space-x-3 group">
          <div className={`w-10 h-10 border flex items-center justify-center rounded-full transition-colors duration-500 ${
            isScrolled || currentPath !== "home" ? "border-black/60 group-hover:border-black" : "border-white/40 group-hover:border-white"
          }`}>
            <span className={`font-serif text-sm tracking-widest transition-colors ${
              isScrolled || currentPath !== "home" ? "text-black group-hover:text-zinc-600" : "text-white group-hover:text-zinc-300"
            }`}>DT</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-serif text-base md:text-lg tracking-widest transition-colors duration-300 font-medium ${
              isScrolled || currentPath !== "home" ? "text-luxury-black group-hover:text-black" : "text-white group-hover:text-zinc-200"
            }`}>
              DREAMY TALES
            </span>
            <span className={`font-sans text-[8px] md:text-[9px] tracking-[0.25em] -mt-1 uppercase font-semibold ${
              isScrolled || currentPath !== "home" ? "text-zinc-500/80" : "text-zinc-400/80"
            }`}>
              Studio & Films
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href.replace("#", "") || (link.href === "#home" && currentPath === "home");
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 relative py-1 group ${
                  isActive
                    ? "text-black font-bold"
                    : isScrolled || currentPath !== "home"
                      ? "text-zinc-600 hover:text-luxury-black"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-[1.5px] transition-all duration-300 ${
                  isActive 
                    ? "w-full bg-black" 
                    : `w-0 group-hover:w-full ${isScrolled || currentPath !== "home" ? "bg-luxury-black" : "bg-white"}`
                }`} />
              </a>
            );
          })}
          
          {/* T&C Trigger */}
          <button
            onClick={onTermsClick}
            className={`flex items-center space-x-1.5 px-3 py-2 border text-[10px] uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer rounded-sm ${
              isScrolled || currentPath !== "home"
                ? "border-zinc-300 text-zinc-600 hover:border-black hover:text-black hover:bg-zinc-50"
                : "border-white/30 text-white/80 hover:border-white hover:text-white hover:bg-white/10"
            }`}
          >
            <span>T&C</span>
          </button>
        </nav>

        {/* Mobile Controls Trigger */}
        <div className="flex lg:hidden items-center space-x-3">
          <button
            onClick={onTermsClick}
            className={`px-2 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-[0.12em] ${
              isScrolled || currentPath !== "home"
                ? "border-zinc-300 text-zinc-600 hover:text-black"
                : "border-white/20 text-white/80 hover:text-white"
            }`}
          >
            T&C
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 transition-colors ${
              isScrolled || currentPath !== "home" ? "text-luxury-black hover:text-black" : "text-white hover:text-zinc-200"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel (Traditional fallback) */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full backdrop-blur-xl border-b py-6 px-8 flex flex-col space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-fade-in ${
          isScrolled || currentPath !== "home"
            ? "bg-white/95 border-zinc-200" 
            : "bg-black/90 border-white/10"
        }`}>
          {navLinks.map((link) => {
            const isActive = currentPath === link.href.replace("#", "") || (link.href === "#home" && currentPath === "home");
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`font-sans text-sm uppercase tracking-[0.2em] py-1 border-b transition-colors ${
                  isActive
                    ? "text-black font-semibold border-black"
                    : isScrolled || currentPath !== "home"
                      ? "text-zinc-700 hover:text-luxury-black border-zinc-100" 
                      : "text-white/80 hover:text-white border-white/5"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      )}

      {/* LUXURY OVERLAY DRAWER NAV BAR */}
      <AnimatePresence>
        {isOverlayMenuOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden flex select-none">
            
            {/* Dark glass backdrop with fade out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsOverlayMenuOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            />

            {/* Sliding Drawer Body from Left */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-md h-full bg-[#0D0D0D] text-white flex flex-col p-8 sm:p-12 shadow-[24px_0_60px_rgba(0,0,0,0.8)] border-r border-zinc-900/50 z-50 overflow-y-auto"
            >
              {/* Top Drawer Header with Logo & Close Button */}
              <div className="flex items-center justify-between pb-8 border-b border-zinc-900">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 border border-white/30 flex items-center justify-center rounded-full">
                    <span className="font-serif text-xs tracking-widest text-white">DT</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-sm tracking-widest text-white font-medium">DREAMY TALES</span>
                    <span className="font-sans text-[7.5px] tracking-[0.2em] -mt-1 uppercase text-zinc-400 font-semibold">Studio & Films</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOverlayMenuOpen(false)}
                  className="p-2.5 rounded-full border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white bg-zinc-950 transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Majestic Scroll Link Container */}
              <nav className="flex flex-col space-y-2 py-10 my-auto">
                {navLinks.map((link, index) => {
                  const isActive = currentPath === link.href.replace("#", "") || (link.href === "#home" && currentPath === "home");
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1, duration: 0.4 }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setIsOverlayMenuOpen(false)}
                        className={`group flex items-baseline space-x-5 py-2.5 border-b border-zinc-900/60 hover:border-zinc-800 transition-all`}
                      >
                        <span className="font-mono text-[9px] text-zinc-600 tracking-wider font-semibold select-none">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={`font-serif text-2xl uppercase tracking-[0.1em] transition-all ${
                          isActive 
                            ? "text-white font-semibold pl-1" 
                            : "text-zinc-400 group-hover:text-white group-hover:pl-2"
                        }`}>
                          {link.name}
                        </span>
                      </a>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer Footer with Luxury Details */}
              <div className="mt-auto pt-8 border-t border-zinc-900 flex flex-col space-y-6">
                {/* Visual Location Info */}
                <div className="space-y-3 font-sans text-xs text-zinc-400 font-light leading-relaxed">
                  <div className="flex items-center space-x-2 text-zinc-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-mono uppercase tracking-wider text-[9px] font-semibold">Our Studio</span>
                  </div>
                  <p className="pl-5 select-text">Delhi NCR & Lucknow, India</p>
                </div>

                {/* Email, Phone details */}
                <div className="grid grid-cols-2 gap-4 font-sans text-xs text-zinc-400">
                  <a href="mailto:gyanuverma14@gmail.com" className="flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate font-light select-text">Contact Email</span>
                  </a>
                  <a href="tel:+917525868888" className="flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-light select-text">+91 75258 68888</span>
                  </a>
                </div>

                {/* Social links */}
                <div className="flex items-center space-x-4 pt-2">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Follow Our Work:</span>
                  <a
                    href="https://www.instagram.com/dreamytalesstudio?igsh=bTA2NjRnZXdzMWMy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-zinc-900 hover:border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
