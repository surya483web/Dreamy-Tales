import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { StudioContent, Inquiry } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// Uploads directory
const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// Content directories
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

// Default premium data matching the "Dreamy Tales Studio" presentation details
const defaultContent: StudioContent = {
  details: {
    name: "DT Dreamy Tales Studio",
    owner: "Gyanu Verma",
    phone: "+91 8368914755",
    email: "dreamytalesstudio@gmail.com",
    instagram: "@dreamytalesstudio",
    location: "Greater Noida / Delhi NCR",
    msme: "MSME Registered",
    experience: "5+ Years",
  },
  hero: {
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-rings-and-flowers-40011-large.mp4",
    headline: "DT Dreamy Tales Studio",
    subHeadline: "Capturing Your Moments, Creating Timeless Stories",
  },
  about: {
    storyHeadline: "Stories That Feel Like Home",
    storyDescription: "We don't just click pictures; we weave emotions, laughter, and timeless tears into beautiful stories. Led by Gyanu Verma with 5+ years of rich storytelling experience.",
    storyParagraphs: [
      "Our Journey: Founded out of sheer passion for preservation, DT Dreamy Tales Studio has grown into an elite team of artistic photographers and cinematographers serving Delhi NCR and beyond.",
      "Our Approach: We believe in candid, unposed magic. By blending into your wedding as friends rather than vendors, we capture the silent sighs, the ecstatic laughter, and the authentic family love that standard photos miss.",
      "Our Promise: To treat every frame as an archival piece of art. Handcrafted album layouts, meticulously color-graded cinematic films, and memories that retain their warmth for generations.",
    ],
    photoUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200",
  },
  stats: {
    weddings: 100,
    couples: 150,
    events: 200,
  },
  services: [
    {
      id: "srv-1",
      title: "Wedding Photography",
      description: "Full-scale coverage of your auspicious rituals, featuring elegant custom portraitures and artistic capture of key milestones.",
      startingPrice: "₹45,000",
      features: ["Traditional & Candid blend", "High-res color-corrected photos", "Digital gallery delivery", "Premium printed album"],
      icon: "Camera",
    },
    {
      id: "srv-2",
      title: "Candid Photography",
      description: "Documenting raw, authentic, unscripted emotions, secret glances, and joyous tears in journalistic style.",
      startingPrice: "₹35,000",
      features: ["Exclusively non-posed shots", "Dedicated candid photo artist", "Stunning cinematic grade", "Unlimited emotional moments"],
      icon: "Sparkles",
    },
    {
      id: "srv-3",
      title: "Pre-Wedding Shoot",
      description: "A gorgeous, stylized photoshoot at handpicked scenic locations to capture your anticipation and intimate chemistry before the big day.",
      startingPrice: "₹25,000",
      features: ["Creative conceptual styling", "Drone or cinematic frames", "15 edited master portraits", "Beautiful teaser slideshow video"],
      icon: "Heart",
    },
    {
      id: "srv-4",
      title: "Cinematic Videography",
      description: "High-end cinematic wedding films that look and feel like movie masterpieces, crafted with top-tier narrative editing and custom music scores.",
      startingPrice: "₹65,000",
      features: ["Multi-camera custom cinematography", "4K resolution master exports", "3-5 mins highlight teaser", "Full ceremony documentary"],
      icon: "Film",
    },
    {
      id: "srv-5",
      title: "Album Designing",
      description: "Bespoke lay-flat premium coffee table albums printed on fine-art archival paper, individually curated and laid out by expert designers.",
      startingPrice: "₹15,000",
      features: ["Archival non-fade paper", "Custom elegant leather or linen cover", "Up to 150 selected photos", "Lay-flat modern seamless binding"],
      icon: "BookOpen",
    },
  ],
  portfolio: [
    {
      id: "p-1",
      title: "Serenade of Sunset",
      category: "Pre-Wedding",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-2",
      title: "The Golden Vows",
      category: "Cinematic",
      mediaType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-holding-hands-40012-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "p-3",
      title: "Royal Crimson Elegance",
      category: "Photography",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-4",
      title: "Baraat Grandeur & Celebration",
      category: "Films",
      mediaType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-by-the-lake-at-sunset-40009-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "p-5",
      title: "Archway Whispers",
      category: "Candid",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-6",
      title: "Joyous Nuptial Bliss",
      category: "Candid",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "p-7",
      title: "Unconditional Laughter",
      category: "Films",
      mediaType: "video",
      mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-groomsman-putting-on-his-jacket-40008-large.mp4",
      thumbnail: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
    },
  ],
};

// Initialize content.json
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultContent, null, 2));
}

// Initialize inquiries.json
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
}

// Helper to read content
const readContent = (): StudioContent => {
  try {
    const raw = fs.readFileSync(CONTENT_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return defaultContent;
  }
};

// Helper to write content
const writeContent = (content: StudioContent) => {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));
};

// Helper to read inquiries
const readInquiries = (): Inquiry[] => {
  try {
    const raw = fs.readFileSync(INQUIRIES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

// Helper to write inquiries
const writeInquiries = (inquiries: Inquiry[]) => {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
};

// --- API Endpoints ---

// Upload endpoint for files from local device
app.post("/api/upload", (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: "Missing file name or file data." });
    }

    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const ext = path.extname(fileName) || (fileType && fileType.split("/")[1] ? `.${fileType.split("/")[1]}` : "");
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload file." });
  }
});

// Get website dynamic content
app.get("/api/content", (req, res) => {
  res.json(readContent());
});

// Update website dynamic content
app.post("/api/content", (req, res) => {
  try {
    const newContent = req.body as StudioContent;
    if (!newContent.details || !newContent.hero || !newContent.about || !newContent.services || !newContent.portfolio) {
      return res.status(400).json({ error: "Invalid content payload structure." });
    }
    writeContent(newContent);
    res.json({ success: true, message: "Content updated successfully!", content: newContent });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update content." });
  }
});

// Submit a booking inquiry
app.post("/api/inquiries", (req, res) => {
  try {
    const { clientName, partnerName, eventType, eventDate, phone, email, message } = req.body;
    if (!clientName || !eventType || !eventDate || !phone || !email || !message) {
      return res.status(400).json({ error: "Missing required contact details." });
    }

    const inquiries = readInquiries();
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      clientName,
      partnerName,
      eventType,
      eventDate,
      phone,
      email,
      message,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(newInquiry);
    writeInquiries(inquiries);

    res.json({ success: true, message: "Inquiry submitted successfully! We will get back to you shortly.", inquiry: newInquiry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit inquiry." });
  }
});

// Get all inquiries (for Admin panel)
app.get("/api/inquiries", (req, res) => {
  // Simple check or header authentication can be verified
  res.json(readInquiries());
});

// Update inquiry status (mark as read/unread)
app.post("/api/inquiries/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'new' | 'read'
    if (status !== "new" && status !== "read") {
      return res.status(400).json({ error: "Invalid status state." });
    }

    const inquiries = readInquiries();
    const index = inquiries.findIndex((inq) => inq.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Inquiry not found." });
    }

    inquiries[index].status = status;
    writeInquiries(inquiries);

    res.json({ success: true, inquiries });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update inquiry status." });
  }
});

// Vite middleware integration for asset serving & compilation
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
