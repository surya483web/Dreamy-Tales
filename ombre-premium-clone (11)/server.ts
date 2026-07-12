import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { StudioContent, Inquiry } from "./src/types.js";
import multer from "multer";
import convert from "heic-convert";
import { v2 as cloudinary } from "cloudinary";
import { exec } from "child_process";
import { promisify } from "util";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const execPromise = promisify(exec);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1100mb" }));
app.use(express.urlencoded({ limit: "1100mb", extended: true }));

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
    philosophySlides: [
      {
        "id": "p-slide-1",
        "imageUrl": "/uploads/T_S_Wed_1.jpg",
        "title": "THE REGAL UNION"
      },
      {
        "id": "p-slide-2",
        "imageUrl": "/uploads/T_S_Wed_2.jpg",
        "title": "GOLDEN HOUR LOVE"
      },
      {
        "id": "p-slide-3",
        "imageUrl": "/uploads/T_S_Wed_3.jpg",
        "title": "CANDID WHISPERS"
      },
      {
        "id": "p-slide-4",
        "imageUrl": "/uploads/T_S_Wed_4.jpg",
        "title": "THE ROYAL EMBRACE"
      },
      {
        "id": "p-slide-5",
        "imageUrl": "/uploads/T_S_Wed_5.jpg",
        "title": "ARCHITECTURAL GLANCE"
      },
      {
        "id": "p-slide-6",
        "imageUrl": "/uploads/T_S_Wed_6.jpg",
        "title": "ETERNAL CHEMISTRY"
      },
      {
        "id": "p-slide-7",
        "imageUrl": "/uploads/T_S_Wed_7.jpg",
        "title": "SILENT CHEMISTRY"
      },
      {
        "id": "p-slide-8",
        "imageUrl": "/uploads/T_S_Wed_8.jpg",
        "title": "NUPTIAL HAPPINESS"
      }
    ]
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

// Initialize Firebase Admin (Firestore and Storage) using a service account or auto-detected credentials.
let firestoreDb: any = null;
let firebaseStorageBucket: any = null;

try {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  // Read local firebase configuration if available
  let configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (!fs.existsSync(configPath)) {
    configPath = path.join(process.cwd(), "../firebase-applet-config.json");
  }
  let firebaseConfig: any = null;
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (parseErr) {
      console.warn("Failed to parse firebase-applet-config.json:", parseErr);
    }
  }

  const projectId = firebaseConfig?.projectId || process.env.GOOGLE_CLOUD_PROJECT;
  const storageBucket = firebaseConfig?.storageBucket || (projectId ? `${projectId}.appspot.com` : undefined);
  const databaseId = firebaseConfig?.databaseId || firebaseConfig?.firestoreDatabaseId || process.env.FIRESTORE_DB;

  if (rawKey) {
    const serviceAccount = JSON.parse(rawKey);
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId,
        storageBucket: storageBucket,
      });
    }
  } else {
    // Attempt auto-detected or Application Default Credentials (ADC) fallback (perfect for Cloud Run integration)
    console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found. Attempting Application Default Credentials (ADC) auto-initialization...");
    if (!getApps().length) {
      initializeApp({
        projectId: projectId,
        storageBucket: storageBucket,
      });
    }
  }

  // Set up Firestore with custom databaseId if configured
  if (databaseId) {
    firestoreDb = getFirestore(databaseId);
  } else {
    firestoreDb = getFirestore();
  }

  // Set up Firebase Storage bucket
  try {
    const storageInstance = getStorage();
    firebaseStorageBucket = storageInstance.bucket();
    console.log(`Firebase Storage Admin initialized with bucket: ${firebaseStorageBucket.name}`);
  } catch (storageErr) {
    console.warn("Firebase Storage Admin failed to initialize bucket:", storageErr);
  }

  console.log(`Firebase Admin initialized successfully. Firestore Database ID: ${databaseId || "(default)"}`);
} catch (err: any) {
  console.error("Failed to initialize Firebase Admin:", err);
}

// Configure Cloudinary if credentials are provided in process.env
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log("Cloudinary configured successfully in server.ts");
} else {
  console.warn("Cloudinary environment variables are missing. Falling back to local uploads.");
}

// Helper to upload local file to Firebase Storage via Admin SDK
async function uploadLocalFileToFirebaseStorage(localFilePath: string, originalName: string, mimeType: string): Promise<string | null> {
  if (!firebaseStorageBucket) {
    console.warn("Firebase Storage bucket is not initialized. Skipping Firebase Storage upload.");
    return null;
  }
  try {
    const ext = path.extname(localFilePath);
    const isVideo = mimeType.startsWith("video/") || [".mov", ".mp4", ".webm", ".avi", ".mkv"].some(vExt => originalName.toLowerCase().endsWith(vExt));
    const folder = isVideo ? "videos" : "images";
    const filename = `${path.basename(localFilePath, ext)}_${Date.now()}${ext}`;
    const destinationPath = `${folder}/${filename}`;

    console.log(`Uploading ${originalName} to Firebase Storage as ${destinationPath}...`);
    
    await firebaseStorageBucket.upload(localFilePath, {
      destination: destinationPath,
      metadata: {
        contentType: mimeType,
        cacheControl: "public, max-age=31536000",
      },
    });

    // Make the file publicly readable
    try {
      await firebaseStorageBucket.file(destinationPath).makePublic();
    } catch (pubErr) {
      console.warn("Failed to make file public in Firebase Storage (checking if bucket needs IAM config):", pubErr);
    }

    // Generate public URL
    const bucketName = firebaseStorageBucket.name;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
    console.log(`Successfully uploaded to Firebase Storage and got public URL: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("Firebase Storage upload failed:", err);
    return null;
  }
}

// Helper to upload local file to Firebase Storage, Cloudinary, or fallback to local public URL
async function uploadLocalFileToFirebase(localFilePath: string, originalName: string, mimeType: string): Promise<string> {
  // 1. Try Firebase Storage first (guarantees persistence in AI Studio environment)
  try {
    const firebaseStorageUrl = await uploadLocalFileToFirebaseStorage(localFilePath, originalName, mimeType);
    if (firebaseStorageUrl) {
      return firebaseStorageUrl;
    }
  } catch (fbErr) {
    console.error("Firebase Storage upload attempt failed:", fbErr);
  }

  // 2. Try Cloudinary if configured
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const ext = path.extname(localFilePath);
      const isVideo = mimeType.startsWith("video/") || [".mov", ".mp4", ".webm", ".avi", ".mkv"].some(vExt => originalName.toLowerCase().endsWith(vExt));
      const resourceType = isVideo ? "video" : "image";
      const folder = isVideo ? "videos" : "images";
      
      console.log(`Uploading ${originalName} to Cloudinary folder ${folder} as ${resourceType}...`);
      
      const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType,
        folder: folder,
        public_id: path.basename(localFilePath, ext),
        overwrite: true,
      });
      
      console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed, falling back to local static serving:", err);
    }
  } else {
    console.warn("Cloudinary not configured, falling back to local static serving.");
  }

  const filename = path.basename(localFilePath);
  console.log(`Successfully mapped local file ${originalName} to local serving path /uploads/${filename}`);
  return `/uploads/${filename}`;
}

// Initialize content.json
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultContent, null, 2));
}

// Initialize inquiries.json
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
}

// Function to hydrate local cache from Firestore on startup
async function syncFromFirestore() {
  if (!firestoreDb) {
    console.log("Firestore DB not available, skipping initial hydration.");
    return;
  }
  try {
    console.log("Starting initial hydration of content.json and inquiries.json from Firestore...");
    
    // Hydrate Content
    const contentRef = firestoreDb.collection("settings").doc("content");
    const contentSnap = await contentRef.get();
    if (contentSnap.exists) {
      const dbContent = contentSnap.data() as StudioContent;
      // Merge dbContent with defaultContent to avoid missing sections/keys
      const merged: StudioContent = {
        ...defaultContent,
        ...dbContent,
        details: { ...defaultContent.details, ...dbContent.details },
        hero: { ...defaultContent.hero, ...dbContent.hero },
        about: { ...defaultContent.about, ...dbContent.about },
        stats: { ...defaultContent.stats, ...dbContent.stats },
        portfolio: dbContent.portfolio || defaultContent.portfolio,
        services: dbContent.services || defaultContent.services,
        reviews: dbContent.reviews !== undefined ? dbContent.reviews : defaultContent.reviews,
      };
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2));
      console.log("Hydrated content.json from Firestore successfully.");
    } else {
      console.log("No content found in Firestore. Uploading defaultContent as initial fallback...");
      await contentRef.set(defaultContent);
    }

    // Hydrate Inquiries
    const inquiriesRef = firestoreDb.collection("settings").doc("inquiries");
    const inquiriesSnap = await inquiriesRef.get();
    if (inquiriesSnap.exists) {
      const data = inquiriesSnap.data().list || [];
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(data, null, 2));
      console.log(`Hydrated inquiries.json with ${data.length} records from Firestore successfully.`);
    } else {
      console.log("No inquiries found in Firestore. Creating empty collection...");
      await inquiriesRef.set({ list: [] });
    }
  } catch (err) {
    console.error("Failed to sync from Firestore on startup:", err);
  }
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
  if (firestoreDb) {
    firestoreDb.collection("settings").doc("content").set(content)
      .then(() => console.log("Saved content to Firestore settings/content successfully."))
      .catch((err: any) => console.error("Failed to save content to Firestore settings/content:", err));
  }
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
  if (firestoreDb) {
    firestoreDb.collection("settings").doc("inquiries").set({ list: inquiries })
      .then(() => console.log("Saved inquiries to Firestore settings/inquiries successfully."))
      .catch((err: any) => console.error("Failed to save inquiries to Firestore settings/inquiries:", err));
  }
};

// --- API Endpoints ---

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${baseName}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 } // 1000MB
});

app.get("/api/firebase-config", (req, res) => {
  try {
    let configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
        // Fallback for production bundling if running from dist/
        configPath = path.join(process.cwd(), "../firebase-applet-config.json");
    }
    
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: "Firebase configuration file not found on server." });
    }
    const configData = fs.readFileSync(configPath, "utf-8");
    res.json(JSON.parse(configData));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load Firebase config." });
  }
});

// Upload endpoint for files from local device
app.post("/api/upload", (req, res, next) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      console.error("Multer error during upload:", err);
      return res.status(400).json({ error: err.message || "Multer upload failed." });
    }
    next();
  });
}, async (req, res) => {
  try {
    // 1. Check if standard multipart/form-data upload was used
    if (req.file) {
      const ext = path.extname(req.file.filename).toLowerCase();
      
      // Handle image conversion for HEIC/HEIF
      if (ext === ".heic" || ext === ".heif") {
        try {
          console.log(`HEIC upload detected: ${req.file.filename}. Converting to JPEG...`);
          const inputBuffer = fs.readFileSync(req.file.path);
          const outputBuffer = await convert({
            buffer: inputBuffer,
            format: "JPEG",
            quality: 0.9,
          });
          
          const originalFilename = req.file.filename;
          const newFilename = originalFilename.substring(0, originalFilename.length - ext.length) + ".jpg";
          const newPath = path.join(UPLOADS_DIR, newFilename);
          
          fs.writeFileSync(newPath, Buffer.from(outputBuffer));
          
          // Delete original HEIC file
          try {
            fs.unlinkSync(req.file.path);
          } catch (err) {
            console.warn("Failed to delete original HEIC file:", err);
          }
          
          // Upload converted JPEG to Firebase Storage
          let firebaseURL = "";
          let useLocalFallback = false;
          try {
            firebaseURL = await uploadLocalFileToFirebase(newPath, newFilename, "image/jpeg");
            if (firebaseURL.startsWith("/uploads/")) {
              useLocalFallback = true;
            }
          } catch (uploadErr) {
            console.warn("Firebase Storage upload failed for HEIC, falling back to local static serving:", uploadErr);
            useLocalFallback = true;
            firebaseURL = `/uploads/${newFilename}`;
          }
          
          // Clean up local converted file ONLY if successfully uploaded to Firebase Storage
          if (!useLocalFallback) {
            try {
              fs.unlinkSync(newPath);
            } catch (err) {
              console.warn("Failed to clean up local converted file:", err);
            }
          }
          
          return res.json({
            success: true,
            url: firebaseURL,
          });
        } catch (convErr: any) {
          console.error("HEIC conversion failed, falling back to original:", convErr);
          // fall back to original file if conversion fails
        }
      }



      // Upload standard file directly to Firebase Storage
      let firebaseURL = "";
      let useLocalFallback = false;
      try {
        firebaseURL = await uploadLocalFileToFirebase(req.file.path, req.file.originalname, req.file.mimetype);
        if (firebaseURL.startsWith("/uploads/")) {
          useLocalFallback = true;
        }
      } catch (uploadErr) {
        console.warn("Firebase Storage upload failed for file, falling back to local static serving:", uploadErr);
        useLocalFallback = true;
        firebaseURL = `/uploads/${path.basename(req.file.path)}`;
      }
      
      // Clean up temporary local file ONLY if successfully uploaded to Firebase Storage
      if (!useLocalFallback) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.warn("Failed to delete temp local file:", err);
        }
      }
      
      return res.json({
        success: true,
        url: firebaseURL,
      });
    }

    // 2. Fallback to base64 body if sent as JSON
    let { fileName, fileType, fileData } = req.body || {};
    if (fileName && fileData) {
      let base64Data = fileData.replace(/^data:.*?;base64,/, "");
      let buffer = Buffer.from(base64Data, "base64");
      const baseExt = path.extname(fileName).toLowerCase();

      if (baseExt === ".heic" || baseExt === ".heif") {
        try {
          console.log(`Base64 HEIC upload detected: ${fileName}. Converting to JPEG...`);
          const outputBuffer = await convert({
            buffer: buffer,
            format: "JPEG",
            quality: 0.9,
          });
          buffer = Buffer.from(outputBuffer);
          fileName = fileName.substring(0, fileName.length - baseExt.length) + ".jpg";
          fileType = "image/jpeg";
        } catch (convErr) {
          console.error("Base64 HEIC conversion failed:", convErr);
        }
      }

      const ext = path.extname(fileName) || (fileType && fileType.split("/")[1] ? `.${fileType.split("/")[1]}` : "");
      const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9]/g, "_");
      const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueFileName);

      fs.writeFileSync(filePath, buffer);



      // Upload base64 file to Firebase Storage
      let firebaseURL = "";
      let useLocalFallback = false;
      try {
        firebaseURL = await uploadLocalFileToFirebase(filePath, fileName, fileType || "application/octet-stream");
        if (firebaseURL.startsWith("/uploads/")) {
          useLocalFallback = true;
        }
      } catch (uploadErr) {
        console.warn("Firebase Storage upload failed for base64 file, falling back to local static serving:", uploadErr);
        useLocalFallback = true;
        firebaseURL = `/uploads/${uniqueFileName}`;
      }
      
      // Clean up local temp file ONLY if successfully uploaded to Firebase Storage
      if (!useLocalFallback) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn("Failed to delete base64 temp file:", err);
        }
      }

      return res.json({
        success: true,
        url: firebaseURL,
      });
    }

    return res.status(400).json({ error: "No file uploaded or missing data." });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    res.status(500).json({ error: err.message || "Failed to upload file." });
  }
});

// Get website dynamic content
app.get("/api/samaro-gallery", async (req, res) => {
  try {
    const url = "https://events.samaro.ai/pybackend/app/events/aarushi-edit/public-data/";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Samaro API. Status: ${response.status}`);
    }

    const data = await response.json();
    const rawPhotos = data?.data?.media?.photos || [];

    // Map to standard PortfolioItem structure
    const mappedItems = rawPhotos.map((photo: any) => {
      let title = "Aarushi & Edit's Ceremony";
      if (photo.filename) {
        let cleanName = decodeURIComponent(photo.filename)
          .replace(/_edited_[a-f0-9]+.*$/gi, "") // clean edited suffixes
          .replace(/\.[a-zA-Z0-9]+$/g, "")      // clean file extension
          .replace(/WhatsApp Image \d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2}/gi, "") // clean WhatsApp date pattern
          .replace(/_/g, " ")                    // underscores to space
          .trim();
        
        if (cleanName) {
          // Capitalize words beautifully
          title = cleanName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        } else {
          title = "Candid Ritual Moment";
        }
      }

      return {
        id: `samaro-${photo.id || photo.media_id}`,
        title: title,
        category: photo.height > photo.width ? "Candid" : "Photography",
        mediaType: "image",
        mediaUrl: photo.media_url,
        thumbnail: photo.mobile_url?.url || photo.media_url,
      };
    });

    res.json({ success: true, items: mappedItems });
  } catch (err: any) {
    console.error("Failed to fetch samaro gallery:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to load external gallery" });
  }
});

// Get website dynamic content
app.get("/api/content", (req, res) => {
  res.json(readContent());
});

// Update website dynamic content
app.post("/api/content", (req, res) => {
  try {
    const existingContent = readContent();
    const newContent = req.body as Partial<StudioContent>;
    
    // Merge existing content with new content
    const mergedContent: StudioContent = {
      details: newContent.details || existingContent.details,
      hero: newContent.hero || existingContent.hero,
      about: newContent.about || existingContent.about,
      portfolio: newContent.portfolio || existingContent.portfolio,
      services: newContent.services || existingContent.services,
      stats: newContent.stats || existingContent.stats,
      reviews: newContent.reviews !== undefined ? newContent.reviews : existingContent.reviews,
    };

    // Validate that we have at least the critical structure
    if (!mergedContent.details || !mergedContent.hero || !mergedContent.about || !mergedContent.portfolio) {
      return res.status(400).json({ error: "Invalid content payload structure. Details, hero, about, and portfolio sections are required." });
    }

    writeContent(mergedContent);
    res.json({ success: true, message: "Content updated successfully!", content: mergedContent });
  } catch (err: any) {
    console.error("Failed to update content on server:", err);
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
  // Synchronize dynamic configuration from Firestore
  await syncFromFirestore();

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
