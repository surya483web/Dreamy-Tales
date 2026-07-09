import React, { useState, useEffect, useRef } from "react";
import { StudioContent } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import About from "./components/About";
import Portfolio from "./components/Portfolio";
import Stats from "./components/Stats";
import ClientPraise from "./components/ClientPraise";
import Contact from "./components/Contact";
import AdminPanel from "./components/AdminPanel";
import GalleryPage from "./components/GalleryPage";
import { Loader2 } from "lucide-react";
import { defaultContent } from "./defaultContent";
import { getLocalContent, saveLocalContent } from "./lib/storage";
import { motion, AnimatePresence } from "motion/react";
import CardStackSection from "./components/CardStackSection";
import TermsModal from "./components/TermsModal";

export default function App() {
  const [content, setContent] = useState<StudioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Load Content with server API and local fallback strategy for Netlify static hosting
  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/content");
      if (response.ok) {
        const data = await response.json();
        // Sync with local storage safely
        await saveLocalContent(data);
        setContent(data);
      } else {
        // Fallback to client local storage or default configuration
        await loadLocalFallback();
      }
    } catch (err: any) {
      console.warn("Unable to load config from server. Falling back to local storage (ideal for static hosts like Netlify):", err);
      await loadLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalFallback = async () => {
    try {
      const saved = await getLocalContent();
      if (saved) {
        setContent(saved);
        return;
      }
    } catch (storageErr) {
      console.warn("Failed to read from local storage:", storageErr);
    }
    // Set absolute defaults
    setContent(defaultContent);
    await saveLocalContent(defaultContent);
  };

  const [currentPath, setCurrentPath] = useState<string>("home");
  const [currentPage, setCurrentPage] = useState<"home" | "gallery">(() => {
    return window.location.pathname === "/gallery" || window.location.hash === "#gallery" ? "gallery" : "home";
  });

  const navigateTo = (page: "home" | "gallery") => {
    setCurrentPage(page);
    if (page === "gallery") {
      window.history.pushState(null, "", "/gallery");
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.history.pushState(null, "", "/");
      // Scroll to portfolio section if we returned
      setTimeout(() => {
        const element = document.getElementById("portfolio");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/gallery" || window.location.hash === "#gallery") {
        setCurrentPage("gallery");
      } else {
        setCurrentPage("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Listen for secret path or hash /DTSTUDIO to open admin panel
  useEffect(() => {
    const checkDTStudioPath = () => {
      const isDTStudio = window.location.pathname.toLowerCase() === "/dtstudio" || 
                        window.location.hash.toLowerCase() === "#dtstudio";
      if (isDTStudio) {
        setIsAdminOpen(true);
      }
    };
    checkDTStudioPath();
    window.addEventListener("popstate", checkDTStudioPath);
    window.addEventListener("hashchange", checkDTStudioPath);
    return () => {
      window.removeEventListener("popstate", checkDTStudioPath);
      window.removeEventListener("hashchange", checkDTStudioPath);
    };
  }, []);

  useEffect(() => {
    loadContent();
  }, []);

  // Intersection Observer to track scroll position and update active header link
  useEffect(() => {
    if (loading || !content) return;

    const sections = ["home", "about-us", "story", "portfolio", "experience", "praise", "contact"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -40% 0px", // Trigger when section occupies the active visual area
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setCurrentPath(id);
          // Silently update hash in URL without jumping
          window.history.replaceState(null, "", `#${id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Handle initial hash routing on page load / manual navigation
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash) {
      setTimeout(() => {
        const element = document.getElementById(initialHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [loading, content]);

  // Save changes with fallback persistence
  const handleSaveContent = async (newContent: StudioContent): Promise<boolean> => {
    try {
      // Optimistically update state first
      setContent(newContent);
      
      await saveLocalContent(newContent);

      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          setContent(resData.content);
          await saveLocalContent(resData.content);
        }
      }
      return true; // Return true as content was successfully updated locally & visually
    } catch (err) {
      console.warn("Server side persist failed, but layout is saved locally in browser:", err);
      return true; // Return true to indicate successful fallback persistence
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-black">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-black" />
        <span className="font-serif text-sm uppercase tracking-[0.25em]">Archiving memories...</span>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center px-6 text-center">
        <h2 className="font-serif text-2xl text-luxury-black mb-3">Service Temporarily Unavailable</h2>
        <p className="text-zinc-500 font-sans text-xs max-w-md leading-relaxed mb-6">
          {error || "An unexpected error occurred while loading content layout files."}
        </p>
        <button
          onClick={loadContent}
          className="px-6 py-2.5 rounded bg-black hover:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-[0.15em] transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentPage === "gallery" ? (
        <motion.div
          key="gallery"
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <GalleryPage
            portfolioItems={content.portfolio}
            brandName={content.details.name}
            onBack={() => navigateTo("home")}
          />
        </motion.div>
      ) : isAdminOpen ? (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full min-h-screen bg-zinc-50"
        >
          <AdminPanel
            currentContent={content}
            onSaveContent={handleSaveContent}
            onClose={() => setIsAdminOpen(false)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="home"
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0B0B0B] min-h-screen relative text-luxury-charcoal antialiased"
        >
          {/* 1. Sticky Navigation Header */}
          <Header
            onAdminClick={() => setIsAdminOpen(!isAdminOpen)}
            onTermsClick={() => setIsTermsOpen(true)}
            isAdminMode={isAdminOpen}
            currentPath={currentPath}
          />

          {/* Sequential Scrollable Layout with Premium Viewport Entrance Reveals */}
          <main className="relative overflow-visible bg-[#0B0B0B] pb-[4vh]">
            {/* Section 1: Home (Hero) */}
            <CardStackSection id="home" zIndex={10}>
              <Hero data={content.hero} onReserveClick={() => setIsReserveModalOpen(true)} isAdminMode={isAdminOpen} />
            </CardStackSection>

            {/* Section 2: Story */}
            <CardStackSection id="story" zIndex={20}>
              <About about={content.about} details={content.details} />
            </CardStackSection>

            {/* Section 3: About Us */}
            <CardStackSection id="about-us" zIndex={30}>
              <AboutUs about={content.about} details={content.details} />
            </CardStackSection>

            {/* Section 4: Portfolio */}
            <CardStackSection id="portfolio" zIndex={40}>
              <Portfolio items={content.portfolio} onViewMore={() => navigateTo("gallery")} />
            </CardStackSection>

            {/* Section 5: Stats (Experience) */}
            <CardStackSection id="experience" zIndex={50}>
              <Stats stats={content.stats} />
            </CardStackSection>

            {/* Section 6: Praise */}
            <CardStackSection id="praise" zIndex={60}>
              <ClientPraise reviews={content.reviews} />
            </CardStackSection>

            {/* Section 7: Contact / Reserve */}
            <CardStackSection id="contact" zIndex={70}>
              <Contact details={content.details} isModalOpen={isReserveModalOpen} setIsModalOpen={setIsReserveModalOpen} />
              
              {/* 9. Premium Boutique Footer styled like DTSTUDIO */}
              <footer className="bg-[#0D0D0D] text-white pt-24 pb-16 relative overflow-hidden border-t border-zinc-900">
                <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
                  
                  {/* Logo Brand Block */}
                  <div className="relative flex items-center justify-center mb-16 select-none">
                    <div className="relative flex items-center">
                      {/* Majestic white bird silhouette perched on the letter 'O' */}
                      <div className="absolute -left-12 sm:-left-14 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 text-white pointer-events-none z-10">
                        <svg viewBox="0 0 120 120" className="w-full h-full fill-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                          <path d="M85 30 C78 28 72 24 68 18 C66 15 65 11 66 7 C64 12 60 16 55 18 C48 21 40 22 32 21 C41 26 48 32 52 40 C44 43 35 44 26 43 C35 47 43 53 47 62 C40 67 31 71 22 74 C31 77 40 81 46 88 C40 96 32 103 24 110 C34 105 43 98 49 90 C48 99 49 108 51 117 C52 108 51 98 49 89 C55 92 61 95 68 100 C61 94 55 86 52 77 C58 75 66 75 74 77 C63 73 55 69 51 63 C55 54 60 47 68 42 C76 37 85 35 94 36 C85 33 75 32 66 34 C69 25 76 18 84 14 C76 15 68 19 63 25 C65 14 71 6 79 0 C70 7 63 16 60 26 C58 16 53 8 44 2 C51 8 55 16 56 25 C51 21 44 19 37 19 C45 23 50 28 52 34 Z" transform="scale(1.1) translate(10, 0)" />
                        </svg>
                      </div>
                      
                      <span className="font-serif text-[44px] sm:text-[56px] tracking-[0.2em] text-white leading-none font-light uppercase pl-6 sm:pl-8">
                        {content.details.name || "DTSTUDIO"}
                      </span>
                    </div>
                  </div>

                  {/* Dual-Column Elegant Menu Links */}
                  <div className="grid grid-cols-2 gap-x-16 gap-y-6 sm:gap-x-32 sm:gap-y-8 mb-24 max-w-lg w-full text-center">
                    {/* Column 1 */}
                    <div className="flex flex-col space-y-5 text-right">
                      <a href="#home" className="font-sans text-[11px] sm:text-xs tracking-[0.35em] font-normal uppercase text-zinc-300 hover:text-white hover:tracking-[0.4em] transition-all duration-300">
                        HOME
                      </a>
                      <a href="#about-us" className="font-sans text-[11px] sm:text-xs tracking-[0.35em] font-normal uppercase text-zinc-300 hover:text-white hover:tracking-[0.4em] transition-all duration-300">
                        ABOUT
                      </a>
                      <a href="#portfolio" className="font-sans text-[11px] sm:text-xs tracking-[0.35em] font-normal uppercase text-zinc-300 hover:text-white hover:tracking-[0.4em] transition-all duration-300">
                        PORTFOLIO
                      </a>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col space-y-5 text-left">
                      <a href="#experience" className="font-sans text-[11px] sm:text-xs tracking-[0.35em] font-normal uppercase text-zinc-300 hover:text-white hover:tracking-[0.4em] transition-all duration-300">
                        LEGACY
                      </a>
                      <a href="#praise" className="font-sans text-[11px] sm:text-xs tracking-[0.35em] font-normal uppercase text-zinc-300 hover:text-white hover:tracking-[0.4em] transition-all duration-300">
                        REVIEWS
                      </a>
                      <a href="#contact" className="font-sans text-[11px] sm:text-xs tracking-[0.35em] font-normal uppercase text-zinc-300 hover:text-white hover:tracking-[0.4em] transition-all duration-300">
                        INQUIRE
                      </a>
                    </div>
                  </div>

                  {/* Legal / Copyright Info - Ultra-refined & matching the image */}
                  <div className="w-full border-t border-zinc-900 pt-10 text-center text-zinc-500 font-sans tracking-[0.18em] text-[8px] sm:text-[9px] uppercase leading-relaxed font-light space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
                      <span>
                        COPYRIGHT © {new Date().getFullYear()} {content.details.name || "DTSTUDIO"} SERVICES PVT. LTD.
                      </span>
                      <button
                        onClick={() => setIsTermsOpen(true)}
                        className="hover:text-zinc-300 transition-colors cursor-pointer font-sans text-[8px] sm:text-[9px] uppercase tracking-[0.18em] focus:outline-none"
                      >
                        T&amp;C and PRIVACY POLICY
                      </button>
                    </div>
                    <div className="pt-2 text-[8px] tracking-[0.25em] text-zinc-600">
                      | &nbsp; DESIGNED BY STARLINE CREATIVE
                    </div>
                  </div>

                </div>
              </footer>
            </CardStackSection>
          </main>

          {/* Global reservation modal handler (when not on contact page) */}
          {currentPath !== "contact" && isReserveModalOpen && (
            <Contact details={content.details} isModalOpen={isReserveModalOpen} setIsModalOpen={setIsReserveModalOpen} onlyModal={true} />
          )}

          {/* Legal Guidelines TermsModal */}
          <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} brandName={content.details.name} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
