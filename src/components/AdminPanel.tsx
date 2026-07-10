import React, { useState } from "react";
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
  RefreshCw
} from "lucide-react";
import { StudioContent } from "../types";

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
  | "reviews";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentContent,
  onSaveContent,
  onClose,
}) => {
  const [content, setContent] = useState<StudioContent>(currentContent);
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");
  
  // Save status states
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
            {activeTab === "inquiries" && <InquiriesSection />}

            {activeTab === "details" && (
              <DetailsSection
                initialDetails={content.details}
                onSave={(data) => handleSectionSave("details", data)}
              />
            )}

            {activeTab === "hero" && (
              <HeroSection
                initialHero={content.hero}
                onSave={(data) => handleSectionSave("hero", data)}
              />
            )}

            {activeTab === "story" && (
              <StorySection
                initialAbout={content.about}
                onSave={(data) => handleSectionSave("about", data)}
              />
            )}

            {activeTab === "stats" && (
              <StatsSection
                initialStats={content.stats}
                onSave={(data) => handleSectionSave("stats", data)}
              />
            )}

            {activeTab === "portfolio" && (
              <PortfolioSection
                initialPortfolio={content.portfolio}
                onSave={(data) => handleSectionSave("portfolio", data)}
              />
            )}

            {activeTab === "reviews" && (
              <ReviewsSection
                initialReviews={content.reviews}
                onSave={(data) => handleSectionSave("reviews", data)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

