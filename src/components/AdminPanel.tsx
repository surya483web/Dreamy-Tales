import React, { useState, useEffect } from "react";
import { Sliders, Save, Plus, Trash2, Key, Loader2, Inbox, Calendar, Phone, Mail, CheckCircle, Clock, Upload, Pencil, X } from "lucide-react";
import { StudioContent, Inquiry, PortfolioItem, ServiceItem } from "../types";
import { getLocalInquiries, saveLocalInquiries } from "../lib/storage";

interface AdminProps {
  currentContent: StudioContent;
  onSaveContent: (newContent: StudioContent) => Promise<boolean>;
  onClose: () => void;
}

export default function AdminPanel({ currentContent, onSaveContent, onClose }: AdminProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"content" | "inquiries">("content");
  const [content, setContent] = useState<StudioContent>(currentContent);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New portfolio state
  const [newItem, setNewItem] = useState<Omit<PortfolioItem, "id">>({
    title: "",
    category: "Photography",
    mediaType: "image",
    mediaUrl: "",
    thumbnail: "",
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const [uploadingPhilosophyBg, setUploadingPhilosophyBg] = useState(false);
  const [uploadingStatsBg, setUploadingStatsBg] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [newSlide, setNewSlide] = useState({
    title: "",
    imageUrl: "",
  });
  const [uploadingSlide, setUploadingSlide] = useState(false);

  // New review state
  const [newReview, setNewReview] = useState({
    clientName: "",
    leftImage: "",
    rightImage: "",
    text: "",
  });
  const [uploadingReviewLeft, setUploadingReviewLeft] = useState(false);
  const [uploadingReviewRight, setUploadingReviewRight] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => {
        setAlertMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  const handlePhilosophySlidesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingSlide(true);
    setUploadError("");

    try {
      const fileList = Array.from(files).filter(Boolean) as File[];
      
      // 1. Optimistic high-speed updates: create local blob URLs and show immediately
      const optimisticSlides = fileList.map((file) => {
        const localUrl = URL.createObjectURL(file);
        const fName = file.name;
        const extIndex = fName.lastIndexOf(".");
        let rawName = extIndex !== -1 ? fName.substring(0, extIndex) : fName;
        rawName = rawName.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
        const cleanTitle = rawName
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
          .trim();

        return {
          id: `p-slide-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          imageUrl: localUrl,
          title: cleanTitle.toUpperCase(),
          isOptimistic: true,
          originalFile: file,
        };
      });

      // Show them in the list instantly
      setContent((prev) => {
        const aboutObj = prev.about || {};
        const currentSlides = aboutObj.philosophySlides || [];
        return {
          ...prev,
          about: {
            ...aboutObj,
            philosophySlides: [...currentSlides, ...optimisticSlides.map(({ id, imageUrl, title }) => ({ id, imageUrl, title }))],
          }
        };
      });

      // 2. Perform background uploads in parallel for maximum speed
      await Promise.all(
        optimisticSlides.map(async (optSlide) => {
          try {
            const formData = new FormData();
            formData.append("file", optSlide.originalFile);

            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errResult = await response.json().catch(() => ({}));
              throw new Error(errResult.error || `Upload failed for ${optSlide.originalFile.name}`);
            }

            const result = await response.json();
            if (result.success && result.url) {
              // Silently swap local blob URL with the real server URL in state
              setContent((prev) => {
                const aboutObj = prev.about || {};
                const currentSlides = aboutObj.philosophySlides || [];
                const updated = currentSlides.map((s) => {
                  if (s && s.id === optSlide.id) {
                    return {
                      id: `p-slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                      imageUrl: result.url,
                      title: s.title,
                    };
                  }
                  return s;
                });
                return {
                  ...prev,
                  about: {
                    ...aboutObj,
                    philosophySlides: updated,
                  }
                };
              });
            } else {
              throw new Error("Invalid server upload response.");
            }
          } catch (err: any) {
            console.error("Single background upload error:", err);
            // Revert this slide's addition on failure
            setContent((prev) => {
              const aboutObj = prev.about || {};
              const currentSlides = aboutObj.philosophySlides || [];
              const filtered = currentSlides.filter((s) => s && s.id !== optSlide.id);
              return {
                ...prev,
                about: {
                  ...aboutObj,
                  philosophySlides: filtered,
                }
              };
            });
            setUploadError(err.message || `Failed to upload ${optSlide.originalFile.name}`);
          } finally {
            URL.revokeObjectURL(optSlide.imageUrl);
          }
        })
      );

      setAlertMsg({ type: "success", text: `Successfully processed ${optimisticSlides.length} image(s) with high speed.` });
    } catch (err: any) {
      console.error("Multi-upload process error:", err);
      setUploadError(err.message || "Failed to process some or all uploads.");
    } finally {
      setUploadingSlide(false);
      e.target.value = "";
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "portfolio-media" | "portfolio-thumbnail" | "hero-video" | "about-photo" | "stats-bg" | "philosophy-slide" | "review-left" | "review-right" | "philosophy-bg"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    // Safeguard check
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB limit
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a file smaller than 500 MB.`
      );
      return;
    }

    // 1. Create a local optimistic blob URL for high speed instant feedback
    const localUrl = URL.createObjectURL(file);
    const fType = file.type || "";
    const fName = file.name || "";
    const isVideo = fType.startsWith("video/") || fName.endsWith(".mp4") || fName.endsWith(".webm") || fName.endsWith(".mov");

    // Automatically extract user-friendly Title from filename
    const extIndex = fName.lastIndexOf(".");
    let rawName = extIndex !== -1 ? fName.substring(0, extIndex) : fName;
    rawName = rawName.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    const cleanTitle = rawName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();

    // 2. Optimistically update local UI states instantly!
    if (target === "portfolio-thumbnail") {
      setNewItem((prev) => ({ ...prev, thumbnail: localUrl }));
    } else if (target === "review-left") {
      setNewReview((prev) => ({ ...prev, leftImage: localUrl }));
    } else if (target === "review-right") {
      setNewReview((prev) => ({ ...prev, rightImage: localUrl }));
    } else if (target === "portfolio-media") {
      setNewItem((prev) => ({
        ...prev,
        mediaUrl: localUrl,
        mediaType: isVideo ? "video" : "image",
        title: cleanTitle,
      }));
    } else if (target === "hero-video") {
      setContent((prev) => ({
        ...prev,
        hero: { ...prev.hero, videoUrl: localUrl },
      }));
    } else if (target === "about-photo") {
      setContent((prev) => ({
        ...prev,
        about: { ...prev.about, photoUrl: localUrl },
      }));
    } else if (target === "philosophy-bg") {
      setContent((prev) => ({
        ...prev,
        about: { ...prev.about, philosophyBgUrl: localUrl },
      }));
    } else if (target === "stats-bg") {
      setContent((prev) => ({
        ...prev,
        stats: { ...prev.stats, backgroundUrl: localUrl },
      }));
    } else if (target === "philosophy-slide") {
      setNewSlide((prev) => ({
        ...prev,
        imageUrl: localUrl,
        title: prev.title || cleanTitle.toUpperCase(),
      }));
    }

    if (target === "portfolio-media") setUploadingMedia(true);
    else if (target === "portfolio-thumbnail") setUploadingThumbnail(true);
    else if (target === "hero-video") setUploadingHero(true);
    else if (target === "about-photo") setUploadingAbout(true);
    else if (target === "philosophy-bg") setUploadingPhilosophyBg(true);
    else if (target === "stats-bg") setUploadingStatsBg(true);
    else if (target === "philosophy-slide") setUploadingSlide(true);
    else if (target === "review-left") setUploadingReviewLeft(true);
    else if (target === "review-right") setUploadingReviewRight(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errResult = await response.json().catch(() => ({}));
        throw new Error(errResult.error || "Server upload failed.");
      }

      const result = await response.json();
      if (result.success && result.url) {
        const uploadedUrl = result.url;

        // Swap the optimistic localUrl with the real server URL in state
        if (target === "portfolio-thumbnail") {
          setNewItem((prev) => ({ ...prev, thumbnail: prev.thumbnail === localUrl ? uploadedUrl : prev.thumbnail }));
        } else if (target === "review-left") {
          setNewReview((prev) => ({ ...prev, leftImage: prev.leftImage === localUrl ? uploadedUrl : prev.leftImage }));
        } else if (target === "review-right") {
          setNewReview((prev) => ({ ...prev, rightImage: prev.rightImage === localUrl ? uploadedUrl : prev.rightImage }));
        } else if (target === "portfolio-media") {
          setNewItem((prev) => ({ ...prev, mediaUrl: prev.mediaUrl === localUrl ? uploadedUrl : prev.mediaUrl }));
        } else if (target === "hero-video") {
          setContent((prev) => ({
            ...prev,
            hero: { ...prev.hero, videoUrl: prev.hero.videoUrl === localUrl ? uploadedUrl : prev.hero.videoUrl },
          }));
        } else if (target === "about-photo") {
          setContent((prev) => ({
            ...prev,
            about: { ...prev.about, photoUrl: prev.about?.photoUrl === localUrl ? uploadedUrl : prev.about?.photoUrl },
          }));
        } else if (target === "philosophy-bg") {
          setContent((prev) => ({
            ...prev,
            about: { ...prev.about, philosophyBgUrl: prev.about?.philosophyBgUrl === localUrl ? uploadedUrl : prev.about?.philosophyBgUrl },
          }));
        } else if (target === "stats-bg") {
          setContent((prev) => ({
            ...prev,
            stats: { ...prev.stats, backgroundUrl: prev.stats?.backgroundUrl === localUrl ? uploadedUrl : prev.stats?.backgroundUrl },
          }));
        } else if (target === "philosophy-slide") {
          setNewSlide((prev) => ({ ...prev, imageUrl: prev.imageUrl === localUrl ? uploadedUrl : prev.imageUrl }));
        }
      } else {
        throw new Error("Unable to load asset content.");
      }
    } catch (err: any) {
      console.error("Upload process error:", err);
      setUploadError(err.message || "Failed to process asset upload.");

      // Revert optimistic update on error
      if (target === "portfolio-thumbnail") {
        setNewItem((prev) => ({ ...prev, thumbnail: prev.thumbnail === localUrl ? "" : prev.thumbnail }));
      } else if (target === "review-left") {
        setNewReview((prev) => ({ ...prev, leftImage: prev.leftImage === localUrl ? "" : prev.leftImage }));
      } else if (target === "review-right") {
        setNewReview((prev) => ({ ...prev, rightImage: prev.rightImage === localUrl ? "" : prev.rightImage }));
      } else if (target === "portfolio-media") {
        setNewItem((prev) => ({ ...prev, mediaUrl: prev.mediaUrl === localUrl ? "" : prev.mediaUrl }));
      } else if (target === "hero-video") {
        setContent((prev) => ({
          ...prev,
          hero: { ...prev.hero, videoUrl: prev.hero.videoUrl === localUrl ? "" : prev.hero.videoUrl },
        }));
      } else if (target === "about-photo") {
        setContent((prev) => ({
          ...prev,
          about: { ...prev.about, photoUrl: prev.about?.photoUrl === localUrl ? "" : prev.about?.photoUrl },
        }));
      } else if (target === "philosophy-bg") {
        setContent((prev) => ({
          ...prev,
          about: { ...prev.about, philosophyBgUrl: prev.about?.philosophyBgUrl === localUrl ? "" : prev.about?.philosophyBgUrl },
        }));
      } else if (target === "stats-bg") {
        setContent((prev) => ({
          ...prev,
          stats: { ...prev.stats, backgroundUrl: prev.stats?.backgroundUrl === localUrl ? "" : prev.stats?.backgroundUrl },
        }));
      } else if (target === "philosophy-slide") {
        setNewSlide((prev) => ({ ...prev, imageUrl: prev.imageUrl === localUrl ? "" : prev.imageUrl }));
      }
    } finally {
      URL.revokeObjectURL(localUrl);
      if (target === "portfolio-media") setUploadingMedia(false);
      else if (target === "portfolio-thumbnail") setUploadingThumbnail(false);
      else if (target === "hero-video") setUploadingHero(false);
      else if (target === "about-photo") setUploadingAbout(false);
      else if (target === "philosophy-bg") setUploadingPhilosophyBg(false);
      else if (target === "stats-bg") setUploadingStatsBg(false);
      else if (target === "philosophy-slide") setUploadingSlide(false);
      else if (target === "review-left") setUploadingReviewLeft(false);
      else if (target === "review-right") setUploadingReviewRight(false);
      e.target.value = "";
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gyanuverma") {
      setIsAuthenticated(true);
      fetchInquiries();
    } else {
      setAuthError("Incorrect admin key. Please try again.");
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
        await saveLocalInquiries(data);
      } else {
        await loadInquiriesFallback();
      }
    } catch (err) {
      console.warn("Error fetching inquiries from server. Falling back to local storage:", err);
      await loadInquiriesFallback();
    } finally {
      setLoadingInquiries(false);
    }
  };

  const loadInquiriesFallback = async () => {
    try {
      const saved = await getLocalInquiries();
      if (saved) {
        setInquiries(saved);
      }
    } catch (storageErr) {
      console.warn("Failed to read inquiries from storage:", storageErr);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistically update locally first
    try {
      const saved = await getLocalInquiries();
      if (saved) {
        const index = saved.findIndex((inq: any) => inq.id === id);
        if (index !== -1) {
          saved[index].status = "read";
          await saveLocalInquiries(saved);
          setInquiries(saved);
        }
      }
    } catch (storageErr) {
      console.warn("Failed to access inquiries in storage:", storageErr);
    }

    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      if (res.ok) {
        await fetchInquiries();
      }
    } catch (err) {
      console.warn("Error updating inquiry status on server:", err);
    }
  };

  const handleDetailsChange = (field: keyof typeof content.details, value: string) => {
    setContent((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }));
  };

  const handleHeroChange = (field: keyof typeof content.hero, value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const handleAboutChange = (field: any, value: string) => {
    setContent((prev) => {
      const aboutObj = prev.about || {};
      return {
        ...prev,
        about: { ...aboutObj, [field]: value },
      };
    });
  };

  const handleServiceChange = (id: string, field: keyof ServiceItem, value: any) => {
    setContent((prev) => ({
      ...prev,
      services: prev.services.map((srv) => (srv.id === id ? { ...srv, [field]: value } : srv)),
    }));
  };

  const handleAddPortfolioItem = () => {
    let finalTitle = newItem.title.trim();
    if (!finalTitle && newItem.mediaUrl) {
      // Derive a user-friendly Title from the direct asset URL
      try {
        const urlStr = newItem.mediaUrl;
        const lastSlash = urlStr.lastIndexOf("/");
        const lastPart = lastSlash !== -1 ? urlStr.substring(lastSlash + 1) : urlStr;
        const extIndex = lastPart.lastIndexOf(".");
        let rawName = extIndex !== -1 ? lastPart.substring(0, extIndex) : lastPart;
        
        // Clean up url-escapes, hyphens, and split camelCase
        rawName = decodeURIComponent(rawName)
          .replace(/[-_]/g, " ")
          .replace(/([a-z])([A-Z])/g, "$1 $2");
        
        finalTitle = rawName
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
          .trim();
      } catch (e) {
        finalTitle = "Dreamy Story Item";
      }
    }

    if (!finalTitle) {
      finalTitle = "Dreamy Story Item";
    }

    if (!newItem.mediaUrl) {
      alert("Please upload a file or specify a direct asset media URL.");
      return;
    }

    const item: PortfolioItem = {
      id: `p-${Date.now()}`,
      title: finalTitle,
      category: newItem.category as any,
      mediaType: newItem.mediaType as any,
      mediaUrl: newItem.mediaUrl,
      thumbnail: newItem.mediaType === "video" ? newItem.thumbnail || newItem.mediaUrl : undefined,
    };

    setContent((prev) => ({
      ...prev,
      portfolio: [item, ...prev.portfolio],
    }));

    // Reset portfolio form fields
    setNewItem({
      title: "",
      category: "Photography",
      mediaType: "image",
      mediaUrl: "",
      thumbnail: "",
    });
  };

  const handleDeletePortfolioItem = (id: string) => {
    setContent((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((item) => item.id !== id),
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setAlertMsg(null);
    const success = await onSaveContent(content);
    if (success) {
      setAlertMsg({ type: "success", text: "All customization changes saved to the server successfully!" });
    } else {
      setAlertMsg({ type: "error", text: "Failed to persist configuration content. Check connection." });
    }
    setSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gold p-8 rounded-lg max-w-md w-full shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold-dark">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-luxury-black">Security Gateway</h3>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">DT Studio Admin Console</p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-zinc-600 text-xs font-sans tracking-wider mb-2 font-medium">
                Enter Administration Code (Use: <span className="text-gold-dark font-semibold">gyanuverma</span>)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-zinc-200 hover:border-zinc-300 rounded px-4 py-3 text-sm text-luxury-black focus:outline-none focus:border-gold transition-colors font-mono"
                required
              />
            </div>

            {authError && <p className="text-red-600 text-xs font-sans font-medium">{authError}</p>}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-zinc-200 text-zinc-600 hover:text-luxury-black rounded text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gold hover:bg-gold-dark text-white font-semibold rounded text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Enter Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-50 z-50 overflow-hidden flex flex-col">
      {/* Top Bar Navigation */}
      <div className="bg-luxury-black border-b border-white/10 p-4 md:px-6 md:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 border border-gold/40 flex items-center justify-center rounded-full shrink-0">
            <span className="font-serif text-xs text-gold font-semibold">DT</span>
          </div>
          <div>
            <h2 className="font-serif text-base md:text-lg text-white font-semibold">DT Studio Content Management</h2>
            <p className="text-zinc-400 text-[9px] uppercase tracking-wider font-semibold">Logged in as Executive</p>
          </div>
        </div>

        {/* Tab Controls & Actions Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Tab Controls */}
          <div className="flex items-center bg-white/5 p-1 rounded border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-[10px] md:text-xs uppercase tracking-wider font-medium transition-all ${
                activeTab === "content" ? "bg-gold text-luxury-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              Website Editor
            </button>
            <button
              onClick={() => {
                setActiveTab("inquiries");
                fetchInquiries();
              }}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded text-[10px] md:text-xs uppercase tracking-wider font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === "inquiries" ? "bg-gold text-luxury-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              <Inbox className="w-3.5 h-3.5 shrink-0" />
              <span>Reservations Inbox</span>
              {inquiries.filter((i) => i.status === "new").length > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === "inquiries" ? "bg-luxury-black text-gold" : "bg-gold text-luxury-black"
                }`}>
                  {inquiries.filter((i) => i.status === "new").length}
                </span>
              )}
            </button>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto justify-end sm:justify-start">
            <button
              onClick={onClose}
              className="flex-grow sm:flex-grow-0 px-3 py-2 border border-white/20 hover:border-white/40 rounded text-white/80 hover:text-white text-[10px] md:text-xs uppercase tracking-wider font-medium transition-all text-center bg-transparent hover:bg-white/5 cursor-pointer"
            >
              Exit Console
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex-grow sm:flex-grow-0 px-4 py-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-600 text-white font-semibold rounded text-[10px] md:text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer border border-white/15"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Save className="w-3.5 h-3.5 text-white" />}
              <span className="text-white">Save Live Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        {alertMsg && (
          <div
            className={`p-4 mb-8 rounded text-sm font-sans flex items-center space-x-3 ${
              alertMsg.type === "success"
                ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-200"
                : "bg-red-950/40 border border-red-500/20 text-red-200"
            }`}
          >
            <span>{alertMsg.text}</span>
          </div>
        )}

        {activeTab === "content" ? (
          <div className="space-y-12">
            
            {/* Row 1: Studio Info details */}
            <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl text-luxury-black mb-6 border-b border-zinc-200 pb-3">1. Business Identity Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Studio Name</label>
                  <input
                    type="text"
                    value={content.details.name}
                    onChange={(e) => handleDetailsChange("name", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Lead Artist / Owner</label>
                  <input
                    type="text"
                    value={content.details.owner}
                    onChange={(e) => handleDetailsChange("owner", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Location Zone</label>
                  <input
                    type="text"
                    value={content.details.location}
                    onChange={(e) => handleDetailsChange("location", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Experience Mark</label>
                  <input
                    type="text"
                    value={content.details.experience}
                    onChange={(e) => handleDetailsChange("experience", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Contact Telephone</label>
                  <input
                    type="text"
                    value={content.details.phone}
                    onChange={(e) => handleDetailsChange("phone", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Official Email</label>
                  <input
                    type="email"
                    value={content.details.email}
                    onChange={(e) => handleDetailsChange("email", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Instagram Handle</label>
                  <input
                    type="text"
                    value={content.details.instagram}
                    onChange={(e) => handleDetailsChange("instagram", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Registration Credential</label>
                  <input
                    type="text"
                    value={content.details.msme}
                    onChange={(e) => handleDetailsChange("msme", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Hero Section details */}
            <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl text-luxury-black mb-6 border-b border-zinc-200 pb-3">2. Hero Section</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Hero Headline</label>
                    <input
                      type="text"
                      value={content.hero.headline}
                      onChange={(e) => handleHeroChange("headline", e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Hero Subtitle Tagline</label>
                    <input
                      type="text"
                      value={content.hero.subHeadline}
                      onChange={(e) => handleHeroChange("subHeadline", e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Cinematic Video Direct Link URL (Hero Section Loop)</label>
                  <div className="flex items-center">
                    <input
                      type="url"
                      value={content.hero.videoUrl}
                      onChange={(e) => handleHeroChange("videoUrl", e.target.value)}
                      placeholder="E.g. direct mp4 URL"
                      className="w-full bg-white border border-zinc-200 rounded-l px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                    />
                    <label className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-4 py-2 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1.5 transition-all self-stretch whitespace-nowrap font-medium">
                      {uploadingHero ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      ) : (
                        <Upload className="w-4 h-4 text-zinc-500" />
                      )}
                      <span className="text-[10px] uppercase tracking-wider">{uploadingHero ? "Uploading..." : "Upload Video"}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, "hero-video")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 font-medium">Please provide a high-quality direct link to an MP4 video, or upload a video directly from your device.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl text-luxury-black mb-6 border-b border-zinc-200 pb-3">3. About Section & Storytelling</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Story Headline</label>
                    <input
                      type="text"
                      value={content.about?.storyHeadline || ""}
                      onChange={(e) => handleAboutChange("storyHeadline", e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Story Thumbnail Photo URL</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={content.about?.photoUrl || ""}
                        onChange={(e) => handleAboutChange("photoUrl", e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-l px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                      />
                      <label htmlFor="about-photo-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-4 py-2 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1.5 transition-all self-stretch whitespace-nowrap font-medium">
                        {uploadingAbout ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        ) : (
                          <Upload className="w-4 h-4 text-zinc-500" />
                        )}
                        <span className="text-[10px] uppercase tracking-wider">{uploadingAbout ? "Uploading..." : "Upload Photo"}</span>
                      </label>
                      <input
                        id="about-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "about-photo")}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Core Philosophy Background Image URL</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={content.about?.philosophyBgUrl || ""}
                        onChange={(e) => handleAboutChange("philosophyBgUrl", e.target.value)}
                        placeholder="Paste image URL here"
                        className="w-full bg-white border border-zinc-200 rounded-l px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                      />
                      <label htmlFor="philosophy-bg-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-4 py-2 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1.5 transition-all self-stretch whitespace-nowrap font-medium">
                        {uploadingPhilosophyBg ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        ) : (
                          <Upload className="w-4 h-4 text-zinc-500" />
                        )}
                        <span className="text-[10px] uppercase tracking-wider">{uploadingPhilosophyBg ? "Uploading..." : "Upload Background"}</span>
                      </label>
                      <input
                        id="philosophy-bg-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "philosophy-bg")}
                        className="sr-only"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Story Description Introduction</label>
                    <textarea
                      value={content.about?.storyDescription || ""}
                      onChange={(e) => handleAboutChange("storyDescription", e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Manage Philosophy Sliding Catalog */}
                <div className="mt-8 border-t border-zinc-100 pt-6">
                  <h4 className="font-serif text-base text-gold-dark mb-2 font-semibold">
                    Manage Our Philosophy Sliding Catalog (Multiple Images & Titles)
                  </h4>
                  <p className="text-[10px] text-zinc-400 mb-5 font-medium uppercase tracking-wider">
                    💡 Each image added here appears in the sliding gallery of the "OUR PHILOSOPHY" section. Give each image an awesome custom title! You can now select and upload multiple files at once.
                  </p>

                  {/* Form to insert new slide */}
                  <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-lg mb-6">
                    <h5 className="text-[10px] uppercase tracking-wider text-luxury-black font-semibold mb-3 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-gold-dark" />
                      <span>Insert New Philosophy Catalog Image</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Asset Title (Custom)</label>
                        <input
                          type="text"
                          value={newSlide.title}
                          onChange={(e) => setNewSlide((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="E.g. THE RAJPUTANA GLORY"
                          className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-medium uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Image URL or File Upload</label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={newSlide.imageUrl}
                            onChange={(e) => setNewSlide((prev) => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="Paste direct URL"
                            className="w-full bg-white border border-zinc-200 rounded-l px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                          />
                          <label htmlFor="p-slide-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-3 py-1.5 text-[10px] text-zinc-700 cursor-pointer flex items-center space-x-1.5 transition-all self-stretch whitespace-nowrap font-medium">
                            {uploadingSlide ? (
                              <Loader2 className="w-3 h-3 animate-spin text-gold" />
                            ) : (
                              <Upload className="w-3 h-3 text-zinc-500" />
                            )}
                            <span className="text-[9px] uppercase tracking-wider">{uploadingSlide ? "Uploading..." : "Upload Image"}</span>
                          </label>
                          <input
                            id="p-slide-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhilosophySlidesUpload}
                            className="sr-only"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newSlide.imageUrl) {
                              alert("Please select or upload an image first.");
                              return;
                            }
                            const slideTitle = newSlide.title.trim() || "UNTITLED MOMENT";
                            const newSlideItem = {
                              id: `p-slide-${Date.now()}`,
                              imageUrl: newSlide.imageUrl,
                              title: slideTitle.toUpperCase(),
                            };
                            setContent((prev) => {
                              const aboutObj = prev.about || {};
                              const slides = aboutObj.philosophySlides || [];
                              return {
                                ...prev,
                                about: {
                                  ...aboutObj,
                                  philosophySlides: [...slides, newSlideItem],
                                }
                              };
                            });
                            setNewSlide({ title: "", imageUrl: "" });
                          }}
                          className="w-full bg-luxury-black hover:bg-gold-dark text-white rounded py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Philosophy Catalog</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of current slides */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                      Current Slides in Philosophy Catalog ({content.about?.philosophySlides?.length || 0})
                    </span>
                    {(!content.about?.philosophySlides || content.about.philosophySlides.length === 0) ? (
                      <p className="text-xs text-zinc-400 italic">No custom slides added yet. The system will fall back to showing the main Story Thumbnail.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(content.about?.philosophySlides || []).map((slide, sIdx) => {
                          if (!slide) return null;
                          return (
                            <div key={slide.id || sIdx} className="flex gap-3 bg-white border border-zinc-200/80 p-2.5 rounded-lg shadow-sm items-center relative group">
                              <div className="w-14 h-14 rounded overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100">
                                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <label className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5 font-bold">Slide Title</label>
                                <input
                                  type="text"
                                  value={slide.title}
                                  onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setContent((prev) => {
                                      const aboutObj = prev.about || {};
                                      const slides = aboutObj.philosophySlides || [];
                                      const updated = slides.map((s) => s && s.id === slide.id ? { ...s, title: val } : s);
                                      return {
                                        ...prev,
                                        about: {
                                          ...aboutObj,
                                          philosophySlides: updated,
                                        }
                                      };
                                    });
                                  }}
                                  placeholder="SLIDE TITLE"
                                  className="w-full bg-transparent border-b border-zinc-200 focus:border-gold text-xs text-luxury-black py-0.5 font-medium uppercase outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setContent((prev) => {
                                    const aboutObj = prev.about || {};
                                    const slides = aboutObj.philosophySlides || [];
                                    const filtered = slides.filter((s) => s && s.id !== slide.id);
                                    return {
                                      ...prev,
                                      about: {
                                        ...aboutObj,
                                        philosophySlides: filtered,
                                      }
                                    };
                                  });
                                }}
                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-zinc-400 transition-colors self-center shrink-0 cursor-pointer"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Our Legacy Section (Milestones & Background) */}
            <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl text-luxury-black mb-6 border-b border-zinc-200 pb-3">4. Our Legacy & Milestones Section</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Weddings Documented</label>
                    <input
                      type="number"
                      value={content.stats?.weddings || 0}
                      onChange={(e) => setContent((prev) => ({
                        ...prev,
                        stats: { ...prev.stats, weddings: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Smiling Couples</label>
                    <input
                      type="number"
                      value={content.stats?.couples || 0}
                      onChange={(e) => setContent((prev) => ({
                        ...prev,
                        stats: { ...prev.stats, couples: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Events Celebrated</label>
                    <input
                      type="number"
                      value={content.stats?.events || 0}
                      onChange={(e) => setContent((prev) => ({
                        ...prev,
                        stats: { ...prev.stats, events: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Section Background Image (Custom Premium Watermark)</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={content.stats?.backgroundUrl || ""}
                      onChange={(e) => setContent((prev) => ({
                        ...prev,
                        stats: { ...prev.stats, backgroundUrl: e.target.value }
                      }))}
                      placeholder="E.g. https://... image.jpg"
                      className="w-full bg-white border border-zinc-200 rounded-l px-3 py-2 text-sm text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                    />
                    <label htmlFor="stats-bg-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-4 py-2 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1.5 transition-all self-stretch whitespace-nowrap font-medium">
                      {uploadingStatsBg ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      ) : (
                        <Upload className="w-4 h-4 text-zinc-500" />
                      )}
                      <span className="text-[10px] uppercase tracking-wider">{uploadingStatsBg ? "Uploading..." : "Upload BG"}</span>
                    </label>
                    <input
                      id="stats-bg-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "stats-bg")}
                      className="sr-only"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-400 font-sans leading-relaxed">
                    💡 The background photo will be automatically transformed into a high-end, subtle grayscale overlay watermark (6% opacity) with multiply blending to create an ultra-premium aesthetic.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 5: Portfolio Grid Manager */}
            <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl text-luxury-black mb-6 border-b border-zinc-200 pb-3">5. Custom Portfolio Master Items</h3>
              
              {/* Add New Portfolio Item Sub-form */}
              <div className="bg-zinc-50 p-5 rounded-lg border border-zinc-200 mb-8 shadow-inner">
                <h4 className="text-luxury-black text-xs uppercase tracking-widest mb-4 flex items-center space-x-2 text-gold-dark font-semibold">
                  <Plus className="w-4 h-4 text-gold-dark" />
                  <span>Insert New Media Asset</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Asset Title (Custom)</label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="E.g. HARSHEEN JAMMU"
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value as any }))}
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold animate-none font-medium"
                    >
                      <option value="Photography">Photography (Photos Page)</option>
                      <option value="Films">Films (Films Page)</option>
                      <option value="Cinematic">Cinematic (Films Page)</option>
                      <option value="Pre-Wedding">Pre-Wedding</option>
                      <option value="Candid">Candid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Media Type</label>
                    <select
                      value={newItem.mediaType}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, mediaType: e.target.value as any }))}
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-medium"
                    >
                      <option value="image">Still Image / Photo</option>
                      <option value="video">Cinematic Video / Film</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Direct Asset URL</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newItem.mediaUrl}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                        placeholder="E.g. https://... image.jpg or video.mp4"
                        className="w-full bg-white border border-zinc-200 rounded-l px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                      />
                      <label htmlFor="portfolio-media-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-3 py-1.5 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1 transition-all self-stretch whitespace-nowrap font-medium">
                        {uploadingMedia ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span className="text-[10px] uppercase tracking-wider">{uploadingMedia ? "Uploading..." : "Upload File"}</span>
                      </label>
                      <input
                        id="portfolio-media-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, "portfolio-media")}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-gold-dark font-sans tracking-wide font-medium">
                  💡 Type a custom Asset Title above, or upload a file to automatically extract and pre-fill the Title!
                </div>

                {uploadError && (
                  <p className="mt-2 text-xs text-red-600 font-sans font-medium">{uploadError}</p>
                )}

                {newItem.mediaType === "video" && (
                  <div className="mt-4">
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Fallback Image Cover Link (Optional)</label>
                    <div className="flex items-center max-w-md">
                      <input
                        type="text"
                        value={newItem.thumbnail || ""}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="E.g. cover photo URL"
                        className="w-full bg-white border border-zinc-200 rounded-l px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                      />
                      <label htmlFor="portfolio-thumbnail-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-3 py-1.5 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1 transition-all self-stretch whitespace-nowrap font-medium">
                        {uploadingThumbnail ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span className="text-[10px] uppercase tracking-wider">{uploadingThumbnail ? "Uploading..." : "Upload Cover"}</span>
                      </label>
                      <input
                        id="portfolio-thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "portfolio-thumbnail")}
                        className="sr-only"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddPortfolioItem}
                  className="mt-5 px-4 py-2 bg-gold hover:bg-gold-dark hover:text-white text-luxury-black font-semibold rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Confirm Asset Addition
                </button>
              </div>

              {/* Existing Portfolio Items Table List */}
              <div className="max-h-80 overflow-auto border border-zinc-200 rounded-lg bg-white">
                <table className="w-full text-left border-collapse text-xs min-w-[600px] md:min-w-0">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-widest text-[9px] font-semibold">
                      <th className="p-3">Asset Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">URL Snippet</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {content.portfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="p-3 font-serif text-sm text-luxury-black font-medium">{item.title}</td>
                        <td className="p-3 font-mono">{item.category}</td>
                        <td className="p-3 uppercase text-[10px] font-semibold text-zinc-500">{item.mediaType}</td>
                        <td className="p-3 font-mono opacity-50 truncate max-w-xs">{item.mediaUrl}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeletePortfolioItem(item.id)}
                            className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-zinc-400 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 6: Client Reviews manager */}
            <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-xl text-luxury-black mb-6 border-b border-zinc-200 pb-3">6. Client Reviews Testimonials</h3>

              {/* Form to insert new review */}
              <div className="bg-zinc-50 p-5 rounded-lg border border-zinc-200 mb-8 shadow-inner">
                <h4 className="text-luxury-black text-xs uppercase tracking-widest mb-4 flex items-center justify-between text-gold-dark font-semibold">
                  <div className="flex items-center space-x-2">
                    {editingReviewId ? (
                      <Pencil className="w-4 h-4 text-gold-dark" />
                    ) : (
                      <Plus className="w-4 h-4 text-gold-dark" />
                    )}
                    <span>{editingReviewId ? "Edit Client Testimonial" : "Insert Client Testimonial"}</span>
                  </div>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setNewReview({
                          clientName: "",
                          leftImage: "",
                          rightImage: "",
                          text: "",
                        });
                      }}
                      className="text-zinc-400 hover:text-zinc-600 flex items-center space-x-1 uppercase tracking-wider text-[9px] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Client Name(s)</label>
                    <input
                      type="text"
                      value={newReview.clientName}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, clientName: e.target.value }))}
                      placeholder="E.g. Krishna & Omar"
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-medium"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Left Image (Portrait ratio 3:4)</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newReview.leftImage}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, leftImage: e.target.value }))}
                          placeholder="Paste image URL"
                          className="w-full bg-white border border-zinc-200 rounded-l px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                        />
                        <label htmlFor="review-left-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-3 py-1.5 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1 transition-all self-stretch whitespace-nowrap font-medium">
                          {uploadingReviewLeft ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                          <span className="text-[10px] uppercase tracking-wider">{uploadingReviewLeft ? "Uploading..." : "Upload Left"}</span>
                        </label>
                        <input
                          id="review-left-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "review-left")}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Right Image (Portrait ratio 3:4)</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newReview.rightImage}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, rightImage: e.target.value }))}
                          placeholder="Paste image URL"
                          className="w-full bg-white border border-zinc-200 rounded-l px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-mono min-w-0"
                        />
                        <label htmlFor="review-right-upload" className="bg-zinc-100 hover:bg-zinc-200 border-y border-r border-zinc-200 rounded-r px-3 py-1.5 text-xs text-zinc-700 cursor-pointer flex items-center space-x-1 transition-all self-stretch whitespace-nowrap font-medium">
                          {uploadingReviewRight ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                          <span className="text-[10px] uppercase tracking-wider">{uploadingReviewRight ? "Uploading..." : "Upload Right"}</span>
                        </label>
                        <input
                          id="review-right-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "review-right")}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">Testimonial Review Text</label>
                    <textarea
                      value={newReview.text}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, text: e.target.value }))}
                      rows={4}
                      placeholder="Write the client's wonderful feedback here..."
                      className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-luxury-black focus:outline-none focus:border-gold font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      const clientName = newReview.clientName.trim();
                      const text = newReview.text.trim();
                      if (!clientName || !text) {
                        alert("Please provide at least a Client Name and Testimonial text.");
                        return;
                      }

                      const images = [];
                      if (newReview.leftImage.trim()) images.push(newReview.leftImage.trim());
                      if (newReview.rightImage.trim()) images.push(newReview.rightImage.trim());

                      if (editingReviewId) {
                        setContent((prev) => {
                          const existing = prev.reviews || [];
                          return {
                            ...prev,
                            reviews: existing.map((r) =>
                              r.id === editingReviewId
                                ? { ...r, clientName, text, images }
                                : r
                            ),
                          };
                        });
                        setEditingReviewId(null);
                      } else {
                        const reviewItem = {
                          id: `review-${Date.now()}`,
                          clientName,
                          text,
                          images,
                        };

                        setContent((prev) => {
                          const existing = prev.reviews || [];
                          return {
                            ...prev,
                            reviews: [...existing, reviewItem],
                          };
                        });
                      }

                      setNewReview({
                        clientName: "",
                        leftImage: "",
                        rightImage: "",
                        text: "",
                      });
                    }}
                    className="mt-5 px-4 py-2 bg-gold hover:bg-gold-dark hover:text-white text-luxury-black font-semibold rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {editingReviewId ? "Update Testimonial Review" : "Add Testimonial Review"}
                  </button>

                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setNewReview({
                          clientName: "",
                          leftImage: "",
                          rightImage: "",
                          text: "",
                        });
                      }}
                      className="mt-5 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-luxury-black font-semibold rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Existing Reviews List */}
              <div className="max-h-80 overflow-auto border border-zinc-200 rounded-lg bg-white">
                <table className="w-full text-left border-collapse text-xs min-w-[600px] md:min-w-0">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-widest text-[9px] font-semibold">
                      <th className="p-3">Client Name</th>
                      <th className="p-3">Images Found</th>
                      <th className="p-3">Feedback Snippet</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {(content.reviews || []).map((review) => (
                      <tr key={review.id} className="hover:bg-zinc-50">
                        <td className="p-3 font-serif text-sm text-luxury-black font-medium">{review.clientName}</td>
                        <td className="p-3 font-mono">
                          <div className="flex gap-1.5">
                            {review.images && review.images.length > 0 ? (
                              review.images.map((imgUrl, iIdx) => (
                                <img
                                  key={iIdx}
                                  src={imgUrl}
                                  alt=""
                                  className="w-8 h-8 object-cover rounded border border-zinc-200"
                                />
                              ))
                            ) : (
                              <span className="text-zinc-400 italic text-[10px]">None (default fallbacks used)</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-sans opacity-70 truncate max-w-xs">{review.text}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setNewReview({
                                  clientName: review.clientName,
                                  leftImage: review.images?.[0] || "",
                                  rightImage: review.images?.[1] || "",
                                  text: review.text,
                                });
                              }}
                              className="p-1.5 rounded hover:bg-zinc-100 hover:text-gold-dark transition-colors text-zinc-400 cursor-pointer"
                              title="Edit Review"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (editingReviewId === review.id) {
                                  setEditingReviewId(null);
                                  setNewReview({
                                    clientName: "",
                                    leftImage: "",
                                    rightImage: "",
                                    text: "",
                                  });
                                }
                                setContent((prev) => {
                                  const existing = prev.reviews || [];
                                  return {
                                    ...prev,
                                    reviews: existing.filter((r) => r.id !== review.id),
                                  };
                                });
                              }}
                              className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-zinc-400 cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(content.reviews || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-zinc-400 italic">No testimonials added yet. Display will fall back to default reviews.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Highly Visible Action Block */}
            <div className="mt-8 p-6 bg-zinc-100 border border-zinc-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-lg text-luxury-black font-semibold">Ready to apply these edits?</h4>
                <p className="text-zinc-500 text-xs mt-0.5">Your updates will be saved securely and go live immediately across the studio website.</p>
              </div>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-zinc-800 disabled:bg-zinc-600 text-white font-semibold rounded text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer border border-zinc-700"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
                <span className="text-white font-bold">Save Live Changes</span>
              </button>
            </div>

          </div>
        ) : (
          /* RESERVATIONS INBOX TABS */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-2xl text-white">Client Bookings Inbox</h3>
                <p className="text-white/40 text-xs">Manage online reservation requests submitted by visitors.</p>
              </div>
              <button
                onClick={fetchInquiries}
                className="px-3.5 py-1.5 border border-gold/20 text-gold hover:bg-gold hover:text-luxury-black rounded text-[10px] uppercase tracking-wider transition-all"
              >
                Refresh List
              </button>
            </div>

            {loadingInquiries ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/40">
                <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                <p className="text-xs font-sans">Connecting with client registry server...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-24 bg-luxury-charcoal rounded-lg border border-white/5">
                <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h4 className="text-white font-serif text-lg">No Reservation Inquiries Yet</h4>
                <p className="text-white/40 text-xs mt-1">Client form submissions will appear here instantly.</p>
              </div>
            ) : (
              /* Inquiries Table list */
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className={`border p-6 rounded-lg transition-all ${
                      inq.status === "new"
                        ? "bg-luxury-charcoal/80 border-gold/40 shadow-lg relative overflow-hidden"
                        : "bg-luxury-charcoal/40 border-white/5 opacity-80"
                    }`}
                  >
                    {inq.status === "new" && (
                      <div className="absolute top-0 left-0 bg-gold text-luxury-black text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-br">
                        Unread Request
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-serif text-xl text-white font-medium">{inq.clientName}</h4>
                          {inq.partnerName && (
                            <span className="text-white/40 font-serif italic text-sm">&amp; {inq.partnerName}</span>
                          )}
                        </div>

                        {/* Metadata Details taggers */}
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-sans font-light text-white/60">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span>Package: <strong className="text-white">{inq.eventType}</strong></span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span>Date: <strong className="text-white">{inq.eventDate}</strong></span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                            <a href={`tel:${inq.phone}`} className="hover:text-gold transition-colors">{inq.phone}</a>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                            <a href={`mailto:${inq.email}`} className="hover:text-gold transition-colors">{inq.email}</a>
                          </span>
                        </div>
                      </div>

                      {/* Read status action button */}
                      {inq.status === "new" ? (
                        <button
                          onClick={() => handleMarkAsRead(inq.id)}
                          className="px-3.5 py-1.5 bg-gold hover:bg-gold-light text-luxury-black font-semibold rounded text-[10px] uppercase tracking-widest transition-all self-start flex items-center space-x-1.5 shadow"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-xs font-sans font-light flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Acknowledged</span>
                        </span>
                      )}
                    </div>

                    <div className="w-full h-[1px] bg-white/5 my-4" />

                    {/* Shared Client Story / message */}
                    <div>
                      <h5 className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Story Details &amp; preferences:</h5>
                      <p className="text-white/80 font-sans text-xs leading-relaxed italic bg-luxury-black/50 p-4 rounded border border-white/5">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="text-right mt-3 text-[10px] font-mono text-white/30">
                      Submitted: {new Date(inq.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`p-4 rounded-lg shadow-2xl flex items-center space-x-3 max-w-md border ${
              alertMsg.type === "success"
                ? "bg-emerald-950 border-emerald-500/30 text-emerald-100"
                : "bg-red-950 border-red-500/30 text-red-100"
            }`}
          >
            {alertMsg.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Sliders className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="flex-grow">
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-0.5">
                {alertMsg.type === "success" ? "System Confirmed" : "System Error"}
              </p>
              <p className="font-sans text-[11px] opacity-90">{alertMsg.text}</p>
            </div>
            <button
              onClick={() => setAlertMsg(null)}
              className="text-white/40 hover:text-white text-xs px-1 hover:bg-white/10 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
