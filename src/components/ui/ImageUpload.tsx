"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: "1:1" | "16:9" | "3:4";
  maxSizeMB?: number;
  bucket?: string;
  path?: string;
}

const aspectClasses = {
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "3:4": "aspect-[3/4]",
};

export default function ImageUpload({
  value,
  onChange,
  aspect = "1:1",
  maxSizeMB = 5,
  bucket = "uploads",
  path = "images",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be under ${maxSizeMB}MB.`);
        return;
      }

      setUploading(true);
      setProgress(0);

      const ext = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Simulate progress since Supabase JS doesn't expose upload progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 100);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      clearInterval(progressInterval);

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        setProgress(0);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      setProgress(100);
      setUploading(false);
      onChange(publicUrl);
    },
    [supabase, bucket, path, maxSizeMB, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setError(null);
    setProgress(0);
  }, [onChange]);

  return (
    <div>
      {value ? (
        <div className={`relative overflow-hidden rounded-lg border border-border ${aspectClasses[aspect]}`}>
          <img
            src={value}
            alt="Upload preview"
            className="h-full w-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-foreground hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${aspectClasses[aspect]} ${
            dragOver
              ? "border-gold bg-gold/5"
              : "border-border hover:border-border-hover"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-gold transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-foreground-subtle">Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mb-2 h-8 w-8 text-foreground-subtle"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.862 3.225A3.75 3.75 0 0118 19.5H6.75z"
                />
              </svg>
              <p className="text-sm text-foreground-subtle">
                Drop an image or click to upload
              </p>
              <p className="mt-1 text-xs text-foreground-subtle">
                Max {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
