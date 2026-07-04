import React, { useState, useEffect } from "react";
import { Menu, X, Sliders } from "lucide-react";

interface HeaderProps {
  onAdminClick: () => void;
  isAdminMode: boolean;
}

export default function Header({ onAdminClick, isAdminMode }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about-us" },
    { name: "Films & Photos", href: "#portfolio" },
    { name: "Experience", href: "#experience" },
    { name: "Reserve", href: "#contact" },
    { name: "Story", href: "#story" },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-white/30 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
          : "bg-black/20 backdrop-blur-md border-b border-white/15 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" onClick={(e) => handleLinkClick(e, "#home")} className="flex items-center space-x-3 group">
          <div className={`w-10 h-10 border flex items-center justify-center rounded-full transition-colors duration-500 ${
            isScrolled ? "border-gold/60 group-hover:border-gold" : "border-gold/40 group-hover:border-gold"
          }`}>
            <span className={`font-serif text-sm tracking-widest transition-colors ${
              isScrolled ? "text-gold-dark group-hover:text-gold" : "text-gold group-hover:text-gold-light"
            }`}>DT</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-serif text-base md:text-lg tracking-widest transition-colors duration-300 font-medium ${
              isScrolled ? "text-luxury-black group-hover:text-gold" : "text-white group-hover:text-gold"
            }`}>
              DREAMY TALES
            </span>
            <span className={`font-sans text-[8px] md:text-[9px] tracking-[0.25em] -mt-1 uppercase font-medium ${
              isScrolled ? "text-gold-dark/80" : "text-gold/80"
            }`}>
              Studio & Films
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-300 relative py-1 group ${
                isScrolled ? "text-zinc-600 hover:text-luxury-black" : "text-white/80 hover:text-gold"
              }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-luxury-black" : "bg-gold"
              }`} />
            </a>
          ))}
          
          {/* Admin Control Trigger */}
          <button
            onClick={onAdminClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-xs uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              isAdminMode
                ? "bg-gold text-white border-gold font-semibold"
                : isScrolled
                  ? "bg-transparent text-gold-dark border-gold/30 hover:border-gold hover:bg-gold/5"
                  : "bg-transparent text-gold border-gold/30 hover:border-gold hover:bg-gold/5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAdminMode ? "Exit Panel" : "Admin Panel"}</span>
          </button>
        </nav>

        {/* Mobile Controls Trigger */}
        <div className="flex lg:hidden items-center space-x-4">
          <button
            onClick={onAdminClick}
            className={`p-2 rounded-full border ${
              isAdminMode 
                ? "bg-gold text-white border-gold" 
                : isScrolled 
                  ? "text-gold-dark border-gold/30" 
                  : "text-gold border-gold/20"
            }`}
            title="Admin Dashboard"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 transition-colors ${
              isScrolled ? "text-luxury-black hover:text-gold" : "text-white hover:text-gold"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full backdrop-blur-xl border-b py-6 px-8 flex flex-col space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-fade-in ${
          isScrolled 
            ? "bg-white/80 border-white/30" 
            : "bg-black/85 border-white/10"
        }`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`font-sans text-sm uppercase tracking-[0.2em] py-1 border-b transition-colors ${
                isScrolled 
                  ? "text-zinc-700 hover:text-luxury-black border-zinc-100" 
                  : "text-white/80 hover:text-gold border-white/5"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
