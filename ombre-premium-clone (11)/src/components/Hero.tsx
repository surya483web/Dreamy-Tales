import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, ChevronDown, Upload } from "lucide-react";
import { motion } from "motion/react";
import { HeroSection } from "../types";

// --- IndexedDB Helper functions for zero-server persistent local video storage ---
const DB_NAME = "HeroVideoDB";
const DB_VERSION = 1;
const STORE_NAME = "video_store";

function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveLocalVideo(file: File): Promise<void> {
  return initDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(file, "hero_background");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

function getLocalVideo(): Promise<File | null> {
  return initDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("hero_background");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  });
}

interface HeroProps {
  data?: HeroSection;
  onReserveClick?: () => void;
  isAdminMode?: boolean;
}

export default function Hero({ data, onReserveClick, isAdminMode }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoUrl = data?.videoUrl || "";
  const headline = data?.headline || "DTSTUDIO";
  const subHeadline = data?.subHeadline || "";

  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  const [isLocalVideo, setIsLocalVideo] = useState(false);

  // Load custom video from IndexedDB on mount
  useEffect(() => {
    const loadSavedVideo = async () => {
      try {
        const savedFile = await getLocalVideo();
        if (savedFile) {
          const objectUrl = URL.createObjectURL(savedFile);
          setCurrentVideoUrl(objectUrl);
          setIsLocalVideo(true);
          console.log("Successfully loaded custom video from local IndexedDB storage:", savedFile.name);
        }
      } catch (err) {
        console.error("Failed to load saved background video from IndexedDB:", err);
      }
    };
    loadSavedVideo();
  }, []);

  useEffect(() => {
    // Only override if there is no custom IndexedDB video already active
    if (videoUrl && !isLocalVideo) {
      setCurrentVideoUrl(videoUrl);
    }
  }, [videoUrl, isLocalVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      // Programmatically play to bypass any browser specific autoplay restrictions
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay of cinematic background video was prevented, waiting for user interaction:", error);
        });
      }
    }
  }, [currentVideoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleVideoError = () => {
    // If custom video fails to load (e.g. server 404), fallback to a premium online wedding cinematic background video
    const defaultFallback = "https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-and-flowers-40011-large.mp4";
    if (currentVideoUrl && currentVideoUrl !== defaultFallback) {
      console.log(`Background video ${currentVideoUrl} failed to load. Falling back to default: ${defaultFallback}`);
      setCurrentVideoUrl(defaultFallback);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Create client-side object URL for immediate responsiveness
      const objectUrl = URL.createObjectURL(file);
      setCurrentVideoUrl(objectUrl);
      setIsLocalVideo(true);

      // 2. Persist the file locally inside IndexedDB so it stays loaded on refreshes
      await saveLocalVideo(file);
      console.log("Successfully saved selected video file to local IndexedDB!");
    } catch (err) {
      console.error("Failed to save selected video locally:", err);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const scrollToReserve = () => {
    if (onReserveClick) {
      onReserveClick();
    } else {
      const reserveSection = document.querySelector("#contact");
      if (reserveSection) {
        reserveSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-white">
      {/* Hidden File Input for Background Video Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />

      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={currentVideoUrl}
          autoPlay
          loop
          muted={true}
          playsInline
          onError={handleVideoError}
          className="h-full w-full object-cover scale-105 filter brightness-95"
        />
        {/* Cinematic Premium Light Overlays - updated to maintain beautiful transparency and visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-black/20 z-10" />
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
            {headline.split(" ").map((word, i) => (
              <span key={i} className="inline-block mx-2">
                {word}
              </span>
            ))}
          </h1>

          {/* Golden Divider */}
          <div className="w-16 h-[1px] bg-zinc-200 mx-auto my-8" />

          {/* Subtitle */}
          <p className="font-serif text-lg md:text-2xl text-zinc-700 italic tracking-wide max-w-2xl mx-auto font-light leading-relaxed mb-8">
            "{subHeadline}"
          </p>

          {/* Reserve CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={scrollToReserve}
              className="px-8 py-4 bg-black hover:bg-zinc-850 text-white font-semibold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-xl rounded-sm hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              Reserve Your Date
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Controls: Custom Video Select */}
      <div className="absolute bottom-12 left-6 md:left-12 z-30 flex items-center space-x-3">
      </div>
    </section>
  );
}

