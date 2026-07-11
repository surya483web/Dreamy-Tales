import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";
import { StudioContent, Inquiry } from "../types";

// 1. Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Services
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Simple connection test to verify configuration
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "settings", "content"));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Verification skipped.");
    } else {
      console.warn("Firebase Firestore test connection status:", error);
    }
  }
}
testConnection();

// 3. Client-Side Image Compression & Optimization
async function compressAndOptimizeImage(file: File): Promise<File> {
  // Exclude non-images or animated GIFs
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Max web dimension: 2000px on the longest side
        const MAX_WIDTH = 2000;
        const MAX_HEIGHT = 2000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to original if canvas context fails
          return;
        }

        // Fill background white for potential transparency
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "image";
              const newName = `${baseName}_optimized.jpg`;
              const optimizedFile = new File([blob], newName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              console.log(
                `High speed compression complete: reduced from ${(file.size / (1024 * 1024)).toFixed(2)}MB to ${(
                  optimizedFile.size /
                  (1024 * 1024)
                ).toFixed(2)}MB`
              );
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85 // High-quality but highly optimized compression level
        );
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}

// 4. Local Server Upload Fallback with Progress Tracking
async function uploadToLocalBackend(file: File, onProgress?: (progress: number) => void): Promise<string> {
  console.log(`Firebase Storage upload unavailable. Routing fallback to high-performance local server upload for ${file.name}...`);
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // CRITICAL: Enable withCredentials so that the security cookie for the AI Studio preview environment is passed
    // in partitioned iframe/cross-site browser context.
    xhr.withCredentials = true;
    xhr.open("POST", "/api/upload", true);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      };
    }

    xhr.onload = () => {
      const responseText = xhr.responseText || "";
      if (xhr.status >= 200 && xhr.status < 300) {
        // Double check if we received an HTML cookie check/recovery page instead of JSON
        if (responseText.trim().startsWith("<!doctype") || responseText.includes("<html") || responseText.includes("<title>Cookie check</title>")) {
          console.error("Local server returned HTML instead of JSON. The preview environment requires cookie authorization.");
          reject(new Error("Browser blocked security cookie. Please click 'Authenticate' or enable third-party cookies."));
          return;
        }

        try {
          const res = JSON.parse(responseText);
          if (res.success && res.url) {
            console.log("Local server upload fallback succeeded:", res.url);
            resolve(res.url);
          } else {
            reject(new Error(res.error || "Failed to retrieve local file path."));
          }
        } catch (e: any) {
          console.error("Local server response is not valid JSON. Raw response content:", responseText, "Error:", e);
          reject(new Error(`Failed to parse local server response. Original error: ${e.message}`));
        }
      } else {
        if (responseText.trim().startsWith("<!doctype") || responseText.includes("<html") || responseText.includes("<title>Cookie check</title>")) {
          reject(new Error("Cookie authorization required. Please authorize cookies or open the app in a new tab."));
        } else {
          reject(new Error(`Server returned error status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error to local server."));
    };

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

// 5. Direct Firebase Storage Upload (With automatic Express backend fallback for ultimate robustness)
export async function uploadToFirebaseStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log(`uploadToFirebaseStorage via high-performance proxy: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  
  let fileToUpload = file;
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      fileToUpload = await compressAndOptimizeImage(file);
    } catch (e) {
      console.warn("Client side image compression failed, using original file", e);
    }
  }

  // Directly route through the local high-performance server upload endpoint to avoid client-side CORS errors completely!
  return uploadToLocalBackend(fileToUpload, onProgress);
}

// 5. Direct settings & content persistence helpers
export async function saveSettingsToFirebase(content: StudioContent): Promise<void> {
  const contentRef = doc(db, "settings", "content");
  await setDoc(contentRef, content);
}

export async function getSettingsFromFirebase(): Promise<StudioContent | null> {
  const contentRef = doc(db, "settings", "content");
  const snap = await getDoc(contentRef);
  if (snap.exists()) {
    return snap.data() as StudioContent;
  }
  return null;
}

// 6. Direct Inquiry registration helpers
export async function submitInquiryToFirebase(inquiry: Inquiry): Promise<void> {
  const inquiriesRef = doc(db, "settings", "inquiries");
  const snap = await getDoc(inquiriesRef);
  let list: Inquiry[] = [];
  if (snap.exists()) {
    list = snap.data().list || [];
  }
  // Standardize the structure and add new submission to the top
  list.unshift(inquiry);
  await setDoc(inquiriesRef, { list });
}

export async function getInquiriesFromFirebase(): Promise<Inquiry[]> {
  const inquiriesRef = doc(db, "settings", "inquiries");
  const snap = await getDoc(inquiriesRef);
  if (snap.exists()) {
    return (snap.data().list || []) as Inquiry[];
  }
  return [];
}

export async function updateInquiryStatusInFirebase(id: string, status: "new" | "read"): Promise<void> {
  const inquiriesRef = doc(db, "settings", "inquiries");
  const snap = await getDoc(inquiriesRef);
  if (snap.exists()) {
    const list: Inquiry[] = snap.data().list || [];
    const index = list.findIndex((inq) => inq.id === id);
    if (index !== -1) {
      list[index].status = status;
      await setDoc(inquiriesRef, { list });
    }
  }
}
