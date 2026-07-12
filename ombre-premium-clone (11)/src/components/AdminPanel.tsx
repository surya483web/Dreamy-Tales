import React, { useState, useEffect } from "react";
import {
  FolderHeart,
  Info,
  Tv,
  BookOpen,
  BarChart3,
  Film,
  Heart,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Upload,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { StudioContent } from "../types";
import { uploadToFirebaseStorage } from "../lib/firebase";
import { getLocalPhilosophyCatalog, saveLocalPhilosophyCatalog } from "../lib/storage";

// Modular Sections
import { DetailsSection } from "./admin/DetailsSection";
import { HeroSection } from "./admin/HeroSection";
import { StorySection } from "./admin/StorySection";
import { StatsSection } from "./admin/StatsSection";
import { PortfolioSection } from "./admin/PortfolioSection";
import { ReviewsSection } from "./admin/ReviewsSection";
import { InquiriesSection } from "./admin/InquiriesSection";

interface AdminPanelProps {
  currentContent: StudioContent;
  onSaveContent: (newContent: StudioContent) => Promise<boolean>;
  onClose: () => void;
}

type TabType =
  | "inquiries"
  | "details"
  | "hero"
  | "story"
  | "stats"
  | "portfolio"
  | "reviews"
  | "philosophy_catalog";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentContent,
  onSaveContent,
  onClose,
}) => {
  const [content, setContent] = useState<StudioContent>(currentContent);
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");
  
  // Debug navigation
  React.useEffect(() => {
    console.log("AdminPanel: activeTab changed to", activeTab);
  }, [activeTab]);

  const [philosophyCatalog, setPhilosophyCatalog] = useState<string[]>(() => {
    return currentContent.philosophy_catalog || [];
  });
  const [catalogUploads, setCatalogUploads] = useState<
    { id: string; name: string; progress: number; status: "uploading" | "success" | "error"; url?: string; error?: string }[]
  >([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      if (content.philosophy_catalog && content.philosophy_catalog.length > 0) {
        setPhilosophyCatalog(content.philosophy_catalog);
        return;
      }
      setLoadingCatalog(true);
      try {
        const localCatalog = await getLocalPhilosophyCatalog();
        if (localCatalog && localCatalog.length > 0) {
          setPhilosophyCatalog(localCatalog);
          setContent((prev) => ({ ...prev, philosophy_catalog: localCatalog }));
        }
      } catch (err) {
        console.error("Failed to load philosophy catalog:", err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, [content.philosophy_catalog]);

  const handleCatalogFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    if (files.length === 0) return;

    // Create tracking objects for each file
    const newUploadTasks = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      progress: 0,
      status: "uploading" as const,
    }));

    // Update the state so the UI lists all tasks immediately
    setCatalogUploads((prev) => [...newUploadTasks, ...prev]);

    // Start parallel uploads
    files.forEach(async (file, idx) => {
      const trackingTask = newUploadTasks[idx];
      try {
        const downloadUrl = await uploadToFirebaseStorage(file, (progress) => {
          setCatalogUploads((prev) =>
            prev.map((t) =>
              t.id === trackingTask.id
                ? { ...t, progress }
                : t
            )
          );
        });

        // Update list in local component state
        setPhilosophyCatalog((prev) => {
          const updated = prev.includes(downloadUrl) ? prev : [...prev, downloadUrl];
          
          // Save directly to backend content payload
          const updatedContent = {
            ...content,
            philosophy_catalog: updated,
          };
          setContent(updatedContent);
          onSaveContent(updatedContent).catch((err) =>
            console.error("Failed to sync catalog upload with backend:", err)
          );

          // Save local IndexedDB backup
          saveLocalPhilosophyCatalog(updated).catch((err) =>
            console.error("Failed to save local catalog backup:", err)
          );
          return updated;
        });

        // Update local task state as success
        setCatalogUploads((prev) =>
          prev.map((t) =>
            t.id === trackingTask.id
              ? { ...t, status: "success" as const, progress: 100, url: downloadUrl }
              : t
          )
        );

        console.log(`Successfully processed ${file.name} to Base64.`);
      } catch (err: any) {
        console.error(`Upload/save failed for ${file.name}:`, err);
        setCatalogUploads((prev) =>
          prev.map((t) =>
            t.id === trackingTask.id
              ? { ...t, status: "error" as const, error: err.message || "Failed to process" }
              : t
          )
        );
      }
    });
  };

  const handleRemoveCatalogItem = async (url: string) => {
    try {
      const updatedCatalog = philosophyCatalog.filter((item) => item !== url);
      
      // Update in backend content payload
      const updatedContent = {
        ...content,
        philosophy_catalog: updatedCatalog,
      };
      setContent(updatedContent);
      await onSaveContent(updatedContent);

      // Clean from local backup and state
      await saveLocalPhilosophyCatalog(updatedCatalog);
      setPhilosophyCatalog(updatedCatalog);
      showNotification("success", "Item removed from Philosophy Catalog successfully.");
    } catch (err: any) {
      console.error("Failed to remove item:", err);
      showNotification("error", "Failed to remove item: " + err.message);
    }
  };

  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 4000);
  };

  const handleSectionSave = async <T extends keyof StudioContent>(
    sectionKey: T,
    sectionData: StudioContent[T]
  ) => {
    // Optimistically calculate the updated state
    const updatedContent = {
      ...content,
      [sectionKey]: sectionData,
    };
    setContent(updatedContent);
    setSaving(true);

    try {
      const success = await onSaveContent(updatedContent);
      if (success) {
        setHasUnsavedChanges(false);
        showNotification("success", "Changes applied and saved directly to the database successfully!");
      } else {
        showNotification("error", "Failed to auto-save to database live. Please retry.");
      }
    } catch (err: any) {
      console.error("Auto-save failed:", err);
      showNotification("error", err.message || "An unexpected error occurred while saving live.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllToLive = async () => {
    setSaving(true);
    setNotification({ type: null, message: "" });
    try {
      const success = await onSaveContent(content);
      if (success) {
        setHasUnsavedChanges(false);
        showNotification("success", "Congratulations! All changes saved and published live successfully.");
      } else {
        showNotification("error", "Failed to save. Server returned an unsuccessful response.");
      }
    } catch (err: any) {
      console.error(err);
      showNotification("error", err.message || "An unexpected error occurred while saving content live.");
    } finally {
      setSaving(false);
    }
  };

  const tabsConfig = [
    {
      id: "inquiries" as TabType,
      label: "Reservations",
      icon: FolderHeart,
      description: "Manage incoming consultation and booking inquiries.",
    },
    {
      id: "details" as TabType,
      label: "Studio Info",
      icon: Info,
      description: "Configure contact details, address, and base info.",
    },
    {
      id: "hero" as TabType,
      label: "Hero Showcase",
      icon: Tv,
      description: "Update the landing screen video background and headings.",
    },
    {
      id: "story" as TabType,
      label: "Story & Philosophy",
      icon: BookOpen,
      description: "Edit philosophy sliding catalog and about thumbnail.",
    },
    {
      id: "stats" as TabType,
      label: "Legacy Stats",
      icon: BarChart3,
      description: "Modify wedding and event trackers & stats background.",
    },
    {
      id: "portfolio" as TabType,
      label: "Cinematography",
      icon: Film,
      description: "Add or delete photographs and cinematic video streams.",
    },
    {
      id: "reviews" as TabType,
      label: "Client Praise",
      icon: Heart,
      description: "Manage couple testimonials and portraits.",
    },
    {
      id: "philosophy_catalog" as TabType,
      label: "Philosophy Catalog",
      icon: BookOpen,
      description: "Parallel file uploader to Firestore philosophy_catalog.",
    },
  ];

  const handleCloseClick = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes in your session. Are you sure you want to exit without saving?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div
      id="admin-panel-overlay"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 text-white font-sans overflow-hidden"
    >
      <div
        id="admin-panel-container"
        className="w-full max-w-7xl h-[90vh] bg-zinc-950 border border-white/5 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Sticky Header */}
        <header className="px-6 py-4 border-b border-white/5 bg-black flex flex-col md:flex-row gap-4 items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
            <div>
              <h1 className="font-serif text-sm tracking-widest text-gold font-bold uppercase">
                Dreamy Tales Studio
              </h1>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase">
                Luxury Administration Suite
              </p>
            </div>
          </div>

          {/* Quick Info & Main Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {hasUnsavedChanges && (
              <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> Unsaved Changes Active
              </span>
            )}

            {/* Save All changes button */}
            <button
              type="button"
              id="save-live-btn"
              onClick={handleSaveAllToLive}
              disabled={saving}
              className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                saving
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : hasUnsavedChanges
                  ? "bg-gradient-to-r from-gold to-yellow-600 text-zinc-950 hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving Changes..." : "Save Live Changes"}
            </button>

            {/* Close button */}
            <button
              type="button"
              id="close-admin-btn"
              onClick={handleCloseClick}
              className="p-2 bg-white/5 hover:bg-red-950/30 hover:text-red-400 rounded border border-white/5 transition-colors cursor-pointer"
              title="Close Administration Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Live Event Notification Panel */}
        {notification.type && (
          <div
            id="notification-toast"
            className={`px-6 py-2.5 text-xs flex items-center gap-2 font-medium border-b transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-950/20 border-green-900/30 text-green-400"
                : "bg-red-950/20 border-red-900/30 text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Vertical Sidebar Navigation */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 flex-shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto select-none no-scrollbar">
            <nav className="flex md:flex-col p-2 md:p-3 gap-1 w-full flex-shrink-0 md:flex-shrink">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-all whitespace-nowrap md:whitespace-normal cursor-pointer flex-1 md:flex-none ${
                      isActive
                        ? "bg-gold/10 border-l-2 border-gold text-gold"
                        : "text-zinc-400 hover:text-white hover:bg-white/2"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold" : "text-zinc-500"}`} />
                    <div className="hidden sm:block text-left md:block">
                      <div className="text-xs font-bold uppercase tracking-wider">{tab.label}</div>
                      <div className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5 hidden md:block">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Editor Workspace Panels */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950 scroll-smooth">
            {activeTab === "inquiries" && <InquiriesSection key="inquiries" />}
            {activeTab === "details" && (
              <DetailsSection
                key="details"
                initialDetails={content.details}
                onSave={(data) => handleSectionSave("details", data)}
              />
            )}

            {activeTab === "hero" && (
              <HeroSection
                key="hero"
                initialHero={content.hero}
                onSave={(data) => handleSectionSave("hero", data)}
              />
            )}

            {activeTab === "story" && (
              <StorySection
                key="story"
                initialAbout={content.about}
                onSave={(data) => handleSectionSave("about", data)}
              />
            )}

            {activeTab === "stats" && (
              <StatsSection
                key="stats"
                initialStats={content.stats}
                onSave={(data) => handleSectionSave("stats", data)}
              />
            )}

            {activeTab === "portfolio" && (
              <PortfolioSection
                key="portfolio"
                initialPortfolio={content.portfolio}
                onSave={(data) => handleSectionSave("portfolio", data)}
              />
            )}

            {activeTab === "reviews" && (
              <ReviewsSection
                key="reviews"
                initialReviews={content.reviews}
                onSave={(data) => handleSectionSave("reviews", data)}
              />
            )}

            {activeTab === "philosophy_catalog" && (
              <div id="philosophy-catalog-tab" className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-serif text-gold font-semibold">Philosophy Catalog</h3>
                    <p className="text-xs text-zinc-400">
                      Upload luxury wedding photos to your cloud-stored philosophy catalog. Images are processed and uploaded in parallel.
                    </p>
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 space-y-4">
                  <h4 className="text-[11px] uppercase tracking-wider text-gold font-bold">Parallel File Uploader</h4>
                  <p className="text-xs text-zinc-400">
                    Select one or more images from your local device. Each file will initiate an independent, parallel Firebase Storage upload task. Once complete, its URL will be appended to the <span className="font-mono text-gold bg-zinc-950 px-1 py-0.5 rounded">philosophy_catalog</span> array.
                  </p>

                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-8 bg-black/40 hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-300">
                    <Upload className="w-8 h-8 text-gold mb-3" />
                    <label
                      htmlFor="philosophy-catalog-bulk-upload"
                      className="px-5 py-2 bg-gradient-to-r from-gold to-yellow-600 text-zinc-950 rounded text-xs font-bold uppercase tracking-wider cursor-pointer hover:brightness-110 shadow-lg shadow-gold/10 transition-all"
                    >
                      Choose Images
                    </label>
                    <input
                      id="philosophy-catalog-bulk-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCatalogFilesChange}
                      className="hidden"
                    />
                    <p className="text-[10px] text-zinc-500 mt-2 font-mono">Supports multiple JPG, PNG, WebP files</p>
                  </div>
                </div>

                {/* Upload Task Pipeline */}
                {catalogUploads.length > 0 && (
                  <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Active Upload Queue</h4>
                      <button
                        type="button"
                        onClick={() => setCatalogUploads([])}
                        className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                      >
                        Clear Queue History
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar col-span-1">
                      {catalogUploads.map((task) => (
                        <div
                          key={task.id}
                          className="bg-black/40 border border-white/5 rounded-lg p-3 flex items-center gap-3 transition-colors hover:bg-zinc-900/40"
                        >
                          <div className="w-10 h-10 rounded bg-zinc-950 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {task.status === "success" && task.url ? (
                              <img
                                src={task.url}
                                alt="Uploaded"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-xs text-zinc-300 font-medium truncate" title={task.name}>
                              {task.name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              {task.status === "uploading" && (
                                <span className="text-gold animate-pulse">Uploading {task.progress}%</span>
                              )}
                              {task.status === "success" && (
                                <span className="text-green-400 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                                </span>
                              )}
                              {task.status === "error" && (
                                <span className="text-red-400 font-semibold" title={task.error}>
                                  Upload Failed
                                </span>
                              )}
                            </div>
                            
                            {task.status === "uploading" && (
                              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-gold to-yellow-500 h-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Catalog Display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Stored Philosophy Images ({philosophyCatalog.length})
                    </h4>
                    {loadingCatalog && (
                      <span className="text-[10px] text-gold flex items-center gap-1.5 font-mono">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Synchronizing...
                      </span>
                    )}
                  </div>

                  {philosophyCatalog.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 border border-white/5 rounded-xl">
                      <ImageIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500 italic">The philosophy catalog is currently empty.</p>
                      <p className="text-xs text-zinc-600 mt-1">Upload files above to start populating your catalog.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {philosophyCatalog.map((url, idx) => (
                        <div
                          key={`${idx}-${url}`}
                          className="group relative border border-white/10 rounded-lg overflow-hidden bg-zinc-950 flex flex-col"
                        >
                          <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden">
                            <img
                              src={url}
                              alt="Catalog Item"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(url);
                                  showNotification("success", "Link copied to clipboard!");
                                }}
                                className="p-1.5 bg-black/70 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                title="Copy Public URL"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this image from your philosophy catalog?")) {
                                    handleRemoveCatalogItem(url);
                                  }
                                }}
                                className="p-1.5 bg-black/70 hover:bg-red-600 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                title="Delete from Catalog"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 flex-1 flex flex-col justify-between bg-black/40">
                            <div className="text-[9px] text-zinc-500 font-mono truncate select-all" title={url}>
                              {url}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

