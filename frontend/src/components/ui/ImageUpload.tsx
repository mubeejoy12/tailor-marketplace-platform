"use client";

/**
 * Image picker that uploads to Cloudinary and reports back the hosted URL.
 * Supports click, drag-and-drop and (on phones) camera / gallery.
 * Falls back to pasting a link when uploads aren't configured.
 */

import { useRef, useState, DragEvent } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { uploadImage, optimizedImage, isUploadConfigured } from "@/lib/cloudinary";

interface ImageUploadProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** Cloudinary sub-folder, e.g. "designs" or "site" */
  folder: string;
  /** Preview shape */
  aspect?: "square" | "wide";
  disabled?: boolean;
}

export default function ImageUpload({
  label, hint, value, onChange, folder, aspect = "square", disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = isUploadConfigured();

  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const [pasteMode, setPasteMode] = useState(!configured);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !disabled) handleFile(file);
  }

  const box = aspect === "wide" ? "aspect-[16/7]" : "aspect-square max-w-[220px]";

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[#111111]">{label}</label>}

      {value ? (
        <div className={`relative ${box} w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimizedImage(value, aspect === "wide" ? { width: 800, height: 350 } : { width: 220, height: 220 })}
            alt={label ?? "Uploaded image"}
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-medium bg-white/95 rounded-full shadow text-[#111111] hover:bg-white"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove image"
                className="p-1 bg-white/95 rounded-full shadow text-[#6B7280] hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
            </div>
          )}
        </div>
      ) : pasteMode ? (
        <input
          type="url"
          disabled={disabled}
          placeholder="https://example.com/photo.jpg"
          onBlur={(e) => e.target.value.trim() && onChange(e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); }
          }}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F766E]"
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`${box} w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center px-4 cursor-pointer transition-colors ${
            dragging ? "border-[#0F766E] bg-[#CCFBF1]/30" : "border-[#E5E7EB] bg-[#FAFAF8] hover:border-[#0F766E]/60 hover:bg-white"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-[#0F766E] animate-spin" />
              <p className="text-xs text-[#6B7280]">Uploading…</p>
            </>
          ) : (
            <>
              <ImagePlus className="w-7 h-7 text-[#0F766E]" />
              <p className="text-sm font-medium text-[#111111]">Upload a photo</p>
              <p className="text-xs text-[#9CA3AF]">Tap to choose, or drag it here · up to 10 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {!value && configured && (
        <button
          type="button"
          onClick={() => setPasteMode((v) => !v)}
          className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0F766E]"
        >
          <Link2 className="w-3.5 h-3.5" /> {pasteMode ? "Upload a file instead" : "Paste a link instead"}
        </button>
      )}
      {hint && !error && <p className="text-xs text-[#9CA3AF]">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
