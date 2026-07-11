import React, { useState, useRef } from "react";
import { Upload, X, Film, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { uploadToFirebaseStorage } from "../../lib/firebase";

interface AdminMediaUploadProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept: "image/*" | "video/*" | "image/*,video/*";
  placeholder?: string;
  className?: string;
}

export const AdminMediaUpload: React.FC<AdminMediaUploadProps> = ({
  id,
  label,
  value,
  onChange,
  accept,
  placeholder = "E.g. https://domain.com/asset.mp4",
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewError(false);
  }, [value]);

  const isVideo = accept.includes("video") || (value && typeof value === "string" && value.toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv|qt|3gp|avi|mkv|wmv|flv)$/));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError("");
    setUploading(true);
    setProgress(0);
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);

    // Validate video file types
    if (file.type.startsWith("video/")) {
      const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
      if (!validTypes.includes(file.type)) {
        setError(`Unsupported video format: ${file.type}. Please use MP4, WebM, MOV, or AVI.`);
        setUploading(false);
        return;
      }
    }

    const isVideoFile = file.type.startsWith("video/");
    const MAX_SIZE = isVideoFile ? 1000 * 1024 * 1024 : 100 * 1024 * 1024; // 1GB for video, 100MB for images
    if (file.size > MAX_SIZE) {
      const displayLimit = isVideoFile ? "1000MB" : "100MB";
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is ${displayLimit}.`);
      setUploading(false);
      return;
    }

    try {
      const downloadUrl = await uploadToFirebaseStorage(file, (pct) => {
        setProgress(pct);
      });
      onChange(downloadUrl);
    } catch (err: any) {
      console.error("Upload Error:", err);
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id={`${id}-wrapper`} className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
          {label}
        </label>
        {value && (
          <button
            type="button"
            id={`${id}-clear-btn`}
            onClick={() => onChange("")}
            className="text-[10px] uppercase tracking-wider text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" /> Clear Media
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* URL Input */}
        <div className="flex gap-2">
          <input
            type="text"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold/50 font-mono transition-colors"
          />
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          id={`${id}-drop-zone`}
          className={`relative border border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none min-h-[110px] ${
            dragActive
              ? "border-gold bg-gold/5 text-gold"
              : uploading
              ? "border-white/20 bg-white/2"
              : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/3"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
            id={`${id}-file-input`}
          />

          {uploading ? (
            <div className="w-full max-w-xs space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Uploading asset...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gold to-yellow-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-zinc-400">
              <Upload className="w-5 h-5 mx-auto mb-1 text-zinc-500 group-hover:text-gold transition-colors" />
              <p className="text-[10px] uppercase tracking-wider font-semibold">
                Drag &amp; drop or click to upload
              </p>
              <p className="text-[9px] text-zinc-500">
                {accept.includes("video") ? "MP4, WebM, MOV up to 1000MB" : "JPG, PNG, WebP up to 50MB"}
              </p>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Preview Element */}
        {value && !uploading && (
          <div className="border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/2 rounded p-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded overflow-hidden bg-zinc-100 dark:bg-black flex-shrink-0 flex items-center justify-center border border-zinc-200 dark:border-white/10">
              {isVideo ? (
                <Film className="w-5 h-5 text-gold" />
              ) : previewError ? (
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              ) : (
                <img
                  src={value}
                  alt="Upload Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setPreviewError(true);
                  }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px] text-green-400 font-semibold uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" /> Live Active Link
              </div>
              <p className="text-[9px] text-zinc-400 font-mono truncate select-all">
                {value.startsWith("data:") ? "Base64 Data URI" : value}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
