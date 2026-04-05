"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface UploadFieldProps {
  label?: string;
  hint?: string;
  onChange?: (file: File | null) => void;
}

export default function UploadField({ label, hint, onChange }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onChange?.(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[#111111]">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[140px] flex items-center justify-center
          ${dragging ? "border-[#0F766E] bg-[#CCFBF1]/30" : "border-[#E5E7EB] bg-[#FAFAF8] hover:border-[#0F766E]/50 hover:bg-white"}`}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="preview" className="w-full rounded-lg object-cover max-h-48" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-[#6B7280] hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-6 px-4">
            <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center mx-auto mb-3">
              {dragging ? <ImageIcon className="w-6 h-6 text-[#0F766E]" /> : <Upload className="w-6 h-6 text-[#0F766E]" />}
            </div>
            <p className="text-sm font-medium text-[#111111]">Drop image here or click to browse</p>
            <p className="text-xs text-[#6B7280] mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>
      {fileName && !preview && <p className="text-xs text-[#6B7280]">{fileName}</p>}
      {hint && <p className="text-xs text-[#6B7280]">{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
      }} />
    </div>
  );
}
