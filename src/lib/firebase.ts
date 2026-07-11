import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage } from "firebase/storage";

let firebaseApp: FirebaseApp | null = null;
let firebaseStorage: FirebaseStorage | null = null;

async function initFirebase() {
  if (firebaseApp && firebaseStorage) {
    return { app: firebaseApp, storage: firebaseStorage };
  }

  const config = {
    projectId: "ai-studio-applet-webapp-38096",
    appId: "1:196018550705:web:50397ed247010f1c362f90",
    apiKey: "AIzaSyBFZcgS9Z20I29HYo9G3yNZU97ocjMvh3A",
    authDomain: "ai-studio-applet-webapp-38096.firebaseapp.com",
    storageBucket: "ai-studio-applet-webapp-38096.firebasestorage.app",
    messagingSenderId: "196018550705",
  };

  if (getApps().length === 0) {
    firebaseApp = initializeApp(config);
  } else {
    firebaseApp = getApp();
  }
  firebaseStorage = getStorage(firebaseApp);
  return { app: firebaseApp, storage: firebaseStorage };
}

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
        // Fallback to original if file is not supported natively by the browser for image loading (e.g. raw HEIC)
        // The server-side /api/upload handler will convert HEIC files gracefully
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

async function uploadDirectToFirebaseStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log(`Starting Firebase Storage upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
  try {
    console.log("Initializing Firebase...");
    const { storage } = await initFirebase();
    console.log("Firebase initialized. Bucket:", storage.app.options.storageBucket);
    
    let fileToUpload = file;
    
    // Only compress images, NOT videos
    if (file.type.startsWith("image/") && file.type !== "image/gif") {
      try {
        fileToUpload = await compressAndOptimizeImage(file);
        console.log(`Image compressed: ${fileToUpload.name} (${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB)`);
      } catch (e) {
        console.warn("Client side image compression failed, using original file", e);
      }
    }

    const fileExt = fileToUpload.name.split(".").pop() || "bin";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const folder = fileToUpload.type.startsWith("video/") ? "videos" : "photos";
    const path = `${folder}/${fileName}`;
    console.log("Creating storage reference for path:", path);
    const storageRef = ref(storage, path);
    console.log("Storage reference created:", storageRef.fullPath);
    
    console.log(`Creating upload task for ${fileToUpload.name} to path: ${path}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
    console.log("Upload task created:", uploadTask);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = snapshot.totalBytes > 0 
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
            : 0;
          console.log(`Upload state: ${snapshot.state}, Progress: ${Math.round(progress)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
          
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error(`Firebase Storage upload error for ${fileToUpload.name}:`, error);
          reject(error);
        },
        async () => {
          console.log(`Firebase Storage upload complete for ${fileToUpload.name}`);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`Download URL obtained: ${downloadUrl}`);
            resolve(downloadUrl);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Critical failure during Firebase Storage upload initialization:", error);
    throw error;
  }
}

export async function uploadToFirebaseStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log(`uploadToFirebaseStorage (forced direct): ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
  return uploadDirectToFirebaseStorage(file, onProgress);
}
