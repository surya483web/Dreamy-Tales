import { PortfolioItem } from "../types";

export async function fetchSamaroGalleryClient(): Promise<PortfolioItem[]> {
  // 1. Try to fetch from Express server proxy first
  try {
    const response = await fetch("/api/samaro-gallery");
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.items) {
        return data.items;
      }
    }
  } catch (err) {
    console.warn("Express server samaro-gallery proxy failed, calling public API directly:", err);
  }

  // 2. Direct client-side fetch from Samaro API (ideal for static sites like Netlify)
  try {
    const url = "https://events.samaro.ai/pybackend/app/events/aarushi-edit/public-data/";
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Samaro API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawPhotos = data?.data?.media?.photos || [];

    // Map to standard PortfolioItem structure
    return rawPhotos.map((photo: any) => {
      let title = "Aarushi & Edit's Ceremony";
      if (photo.filename) {
        const cleanName = decodeURIComponent(photo.filename)
          .replace(/_edited_[a-f0-9]+.*$/gi, "") // clean edited suffixes
          .replace(/\.[a-zA-Z0-9]+$/g, "")      // clean file extension
          .replace(/WhatsApp Image \d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2}/gi, "") // clean WhatsApp date pattern
          .replace(/_/g, " ")                    // underscores to space
          .trim();
        
        if (cleanName) {
          // Capitalize words beautifully
          title = cleanName.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        } else {
          title = "Candid Ritual Moment";
        }
      }

      return {
        id: `samaro-${photo.id || photo.media_id}`,
        title: title,
        category: photo.height > photo.width ? "Candid" : "Photography",
        mediaType: "image" as const,
        mediaUrl: photo.media_url,
        thumbnail: photo.mobile_url?.url || photo.media_url,
      };
    });
  } catch (err) {
    console.error("Direct client-side fetch from Samaro API failed:", err);
    throw err;
  }
}
