import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage } from "firebase/storage";

let firebaseApp: FirebaseApp | null = null;
let firebaseStorage: FirebaseStorage | null = null;

async function initFirebase() {
  if (firebaseApp && firebaseStorage) {
    return { app: firebaseApp, storage: firebaseStorage };
  }

  const response = await fetch("/api/firebase-config");
  if (!response.ok) {
    throw new Error("Failed to load Firebase configuration from server.");
  }
  const config = await response.json();

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
  const { storage } = await initFirebase();
  let fileToUpload = file;
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      fileToUpload = await compressAndOptimizeImage(file);
    } catch (e) {
      console.warn("Client side compression failed during direct Firebase upload", e);
    }
  }
  const fileExt = fileToUpload.name.split(".").pop() || "bin";
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  
  const folder = fileToUpload.type.startsWith("video/") ? "videos" : "photos";
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

export async function uploadToFirebaseStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const isTooLargeForServer = file.size > 28 * 1024 * 1024; // 28MB threshold to avoid Cloud Run's 32MB payload limit

  if (isTooLargeForServer) {
    console.log(`File is too large for server upload (${(file.size / 1024 / 1024).toFixed(1)}MB). Directly uploading to Firebase Storage...`);
    return uploadDirectToFirebaseStorage(file, onProgress);
  }

  // Try uploading to our local container upload endpoint first (highly reliable, instant, works offline/local)
  try {
    // PRE-COMPRESS/OPTIMIZE IMAGES FIRST for ultra high speed and maximum compatibility
    let fileToUpload = file;
    if (file.type.startsWith("image/") && file.type !== "image/gif") {
      try {
        fileToUpload = await compressAndOptimizeImage(file);
      } catch (e) {
        console.warn("Client side compression failed, using original file", e);
      }
    }

    const localUrl = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", fileToUpload);

      xhr.open("POST", "/api/upload", true);

      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.url) {
              resolve(response.url);
            } else {
              reject(new Error(response.error || "Failed to parse upload response."));
            }
          } catch (err) {
            reject(new Error("Failed to parse server response as JSON."));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error || `Upload failed with status code ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status code ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error occurred during file upload."));
      };

      xhr.send(formData);
    });
    return localUrl;
  } catch (err) {
    console.warn("Local container upload failed, falling back to Firebase Storage:", err);
    return uploadDirectToFirebaseStorage(file, onProgress);
  }
}
