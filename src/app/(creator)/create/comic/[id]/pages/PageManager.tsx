"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import SortableThumbnail from "./SortableThumbnail";
import Button from "@/components/ui/Button";

interface PageData {
  id: string;
  page_number: number;
  image_url: string;
  thumbnail_url: string | null;
  width: number;
  height: number;
}

interface UploadingFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface PageManagerProps {
  comicId: string;
  comicTitle: string;
  comicStatus: string;
  universeId: string;
  universeSlug: string;
  universeStatus: string;
  initialPages: PageData[];
}

export default function PageManager({
  comicId,
  comicTitle,
  comicStatus,
  universeId,
  universeSlug,
  universeStatus,
  initialPages,
}: PageManagerProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pages, setPages] = useState<PageData[]>(initialPages);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadFile = useCallback(
    async (file: File, uploadId: string) => {
      const formData = new FormData();
      formData.append("image", file);

      // Use XMLHttpRequest for progress tracking
      return new Promise<{
        imageUrl: string;
        thumbnailUrl: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploading((prev) =>
              prev.map((u) =>
                u.id === uploadId ? { ...u, progress: pct } : u
              )
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));

        xhr.open("POST", "/api/upload/comic-page");
        xhr.send(formData);
      });
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);

      const newUploads: UploadingFile[] = Array.from(files).map((file) => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "uploading" as const,
      }));

      setUploading((prev) => [...prev, ...newUploads]);

      for (const upload of newUploads) {
        try {
          const result = await uploadFile(upload.file, upload.id);

          // Create page in database
          const nextPageNumber = pages.length + 1;
          const { data: pageData, error: insertError } = await supabase
            .from("comic_pages")
            .insert({
              comic_id: comicId,
              page_number: nextPageNumber,
              image_url: result.imageUrl,
              thumbnail_url: result.thumbnailUrl,
              width: result.width,
              height: result.height,
            })
            .select("id, page_number, image_url, thumbnail_url, width, height")
            .single();

          if (insertError || !pageData) {
            throw new Error(insertError?.message || "Failed to save page");
          }

          // Update comic page_count
          await supabase
            .from("comics")
            .update({ page_count: nextPageNumber })
            .eq("id", comicId);

          setPages((prev) => [...prev, pageData]);
          setUploading((prev) =>
            prev.map((u) =>
              u.id === upload.id ? { ...u, status: "done" as const, progress: 100 } : u
            )
          );

          // Clean up after a moment
          setTimeout(() => {
            setUploading((prev) => prev.filter((u) => u.id !== upload.id));
            URL.revokeObjectURL(upload.previewUrl);
          }, 1500);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          setUploading((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "error" as const, error: message }
                : u
            )
          );
        }
      }
    },
    [comicId, pages.length, supabase, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);

      const newPages = arrayMove(pages, oldIndex, newIndex);
      setPages(newPages);

      // Persist new order
      const pageIds = newPages.map((p) => p.id);
      await fetch(`/api/comic/${comicId}/reorder-pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds }),
      });
    },
    [comicId, pages]
  );

  const handleDelete = useCallback(
    async (pageId: string) => {
      setError(null);

      const { error: deleteError } = await supabase
        .from("comic_pages")
        .delete()
        .eq("id", pageId)
        .eq("comic_id", comicId);

      if (deleteError) {
        setError(`Failed to delete page: ${deleteError.message}`);
        return;
      }

      const remaining = pages.filter((p) => p.id !== pageId);

      // Reorder remaining pages
      if (remaining.length > 0) {
        const pageIds = remaining.map((p) => p.id);
        await fetch(`/api/comic/${comicId}/reorder-pages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageIds }),
        });
      }

      // Update comic page_count
      await supabase
        .from("comics")
        .update({ page_count: remaining.length })
        .eq("id", comicId);

      setPages(remaining);
    },
    [comicId, pages, supabase]
  );

  const handlePublish = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setPublishing(true);

    // Publish the comic
    const { error: publishError } = await supabase
      .from("comics")
      .update({ status: "published" })
      .eq("id", comicId);

    if (publishError) {
      setError(`Failed to publish: ${publishError.message}`);
      setPublishing(false);
      return;
    }

    // Auto-publish draft universe
    if (universeStatus === "draft" && universeId) {
      await supabase
        .from("universes")
        .update({ status: "published" })
        .eq("id", universeId);
    }

    // Log content event
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("content_events").insert({
        actor_id: user.id,
        event_type: "published",
        target_type: "comic",
        target_id: comicId,
      });
    }

    setSuccess("Comic published!");
    setPublishing(false);

    setTimeout(() => {
      router.push(`/create/universe/${universeSlug}/edit`);
    }, 1000);
  }, [comicId, universeId, universeSlug, universeStatus, supabase, router]);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          dragOver
            ? "border-gold bg-gold/5"
            : "border-border hover:border-border-hover"
        }`}
      >
        <svg
          className="mb-3 h-10 w-10 text-foreground-subtle"
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
        <p className="text-foreground-muted">
          Drop comic pages here or click to browse
        </p>
        <p className="mt-1 text-sm text-foreground-subtle">
          PNG, JPG, or WebP &middot; Max 10MB per image
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-3">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3"
            >
              <img
                src={u.previewUrl}
                alt="Uploading"
                className="h-16 w-12 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {u.file.name}
                </p>
                {u.status === "uploading" && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-gold transition-all"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
                {u.status === "done" && (
                  <p className="mt-1 text-xs text-success">Uploaded</p>
                )}
                {u.status === "error" && (
                  <p className="mt-1 text-xs text-error">{u.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thumbnail grid with drag-to-reorder */}
      {pages.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Pages ({pages.length})
          </h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {pages.map((page, index) => (
                  <SortableThumbnail
                    key={page.id}
                    page={page}
                    index={index}
                    onDelete={() => handleDelete(page.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Publish section */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Publish</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          {comicTitle} &middot; {pages.length}{" "}
          {pages.length === 1 ? "page" : "pages"}
        </p>
        {comicStatus === "published" ? (
          <p className="mt-3 text-sm text-success">
            This comic is already published.
          </p>
        ) : (
          <div className="mt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePublish}
              isLoading={publishing}
              disabled={pages.length === 0}
            >
              Publish Comic
            </Button>
            {pages.length === 0 && (
              <p className="mt-2 text-sm text-foreground-subtle">
                Upload at least one page before publishing.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
