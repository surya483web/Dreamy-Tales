import { StudioContent, Inquiry } from "../types";
import { 
  getLocalContent, 
  saveLocalContent, 
  getLocalInquiries, 
  saveLocalInquiries 
} from "./storage";

// Mock objects for database and storage to prevent import errors in any legacy code
export const db: any = {};
export const storage: any = {};

// 1. Client-Side Image Compression & Optimization (High performance WebP / JPEG fallback)
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
        // High-speed web-ready dimensions (1200px max provides crisp quality while keeping sizes extremely tiny)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
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

        // Standardize on high-efficiency webp image format, fallback to jpeg if unsupported
        const targetFormat = "image/webp";
        const fallbackFormat = "image/jpeg";
        const compressionQuality = 0.70; // Optimized sweet spot for tiny file sizes (25kb-60kb) and instant, zero-lag loading

        const handleBlob = (blob: Blob | null, isFallback = false) => {
          if (blob) {
            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "image";
            const ext = isFallback ? "jpg" : "webp";
            const formatType = isFallback ? fallbackFormat : targetFormat;
            const newName = `${baseName}_optimized.${ext}`;
            const optimizedFile = new File([blob], newName, {
              type: formatType,
              lastModified: Date.now(),
            });
            console.log(
              `Lightning-speed image compression complete (${formatType}): reduced size from ${(file.size / 1024).toFixed(1)}KB to ${(
                optimizedFile.size / 1024
              ).toFixed(1)}KB (Saving: ${(((file.size - optimizedFile.size) / file.size) * 100).toFixed(0)}%)`
            );
            resolve(optimizedFile);
          } else if (!isFallback) {
            // Retry with JPEG fallback
            try {
              canvas.toBlob((fallbackBlob) => handleBlob(fallbackBlob, true), fallbackFormat, compressionQuality);
            } catch (err) {
              resolve(file);
            }
          } else {
            resolve(file);
          }
        };

        try {
          canvas.toBlob((blob) => handleBlob(blob, false), targetFormat, compressionQuality);
        } catch (err) {
          // Sync fallback to JPEG on errors
          try {
            canvas.toBlob((blob) => handleBlob(blob, true), fallbackFormat, compressionQuality);
          } catch (err2) {
            resolve(file);
          }
        }
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

// 2. High performance Base64 file converter with simulated responsive progress tracking
export async function uploadToFirebaseStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log(`Converting ${file.name} to Base64 (size: ${(file.size / 1024 / 1024).toFixed(2)} MB)...`);
  
  let fileToUpload = file;
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      fileToUpload = await compressAndOptimizeImage(file);
    } catch (e) {
      console.warn("Client-side image compression failed, using original file", e);
    }
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    // Simulate interactive progress bar to provide immediate visual feedback to the user
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress += 15;
      if (currentProgress <= 90) {
        if (onProgress) onProgress(currentProgress);
      }
    }, 40);

    reader.onload = (event) => {
      clearInterval(progressTimer);
      if (onProgress) onProgress(100);
      const base64Url = event.target?.result as string;
      console.log(`Base64 conversion completed successfully for: ${file.name}`);
      resolve(base64Url);
    };

    reader.onerror = (err) => {
      clearInterval(progressTimer);
      console.error("Base64 reading error:", err);
      reject(new Error("Failed to read file as a Base64 data URL."));
    };

    reader.readAsDataURL(fileToUpload);
  });
}

// 3. Settings content direct IndexedDB/localStorage persistence (No Firebase connection)
export async function saveSettingsToFirebase(content: StudioContent): Promise<void> {
  await saveLocalContent(content);
}

export async function getSettingsFromFirebase(): Promise<StudioContent | null> {
  return await getLocalContent();
}

// 4. Inquiry registration IndexedDB/localStorage persistence (No Firebase connection)
export async function submitInquiryToFirebase(inquiry: Inquiry): Promise<void> {
  const inquiries = (await getLocalInquiries()) || [];
  // Add new submission to the top
  inquiries.unshift(inquiry);
  await saveLocalInquiries(inquiries);
}

export async function getInquiriesFromFirebase(): Promise<Inquiry[]> {
  const inquiries = await getLocalInquiries();
  return inquiries || [];
}

export async function updateInquiryStatusInFirebase(id: string, status: "new" | "read"): Promise<void> {
  const inquiries = (await getLocalInquiries()) || [];
  const index = inquiries.findIndex((inq) => inq.id === id);
  if (index !== -1) {
    inquiries[index].status = status;
    await saveLocalInquiries(inquiries);
  }
}
