"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import type { ContentRating } from "@/lib/types/database";

interface Universe {
  id: string;
  slug: string;
  title: string;
  status: string;
}

interface ComicCreateFormProps {
  universes: Universe[];
}

const RATINGS: { value: ContentRating; label: string; description: string }[] = [
  { value: "E", label: "E", description: "Everyone — suitable for all ages" },
  { value: "T", label: "T", description: "Teen — may contain mild violence or themes" },
  { value: "M", label: "M", description: "Mature — adult themes, violence, or language" },
];

export default function ComicCreateForm({ universes }: ComicCreateFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get("universe");

  const preselectedUniverse = universes.find((u) => u.slug === preselectedSlug);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [contentRating, setContentRating] = useState<ContentRating>("E");
  const [universeId, setUniverseId] = useState(
    preselectedUniverse?.id || (universes.length === 1 ? universes[0].id : "")
  );
  const [createNewUniverse, setCreateNewUniverse] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUniverses = universes.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (title.trim().length > 200) {
      setError("Title must be 200 characters or less.");
      return;
    }

    if (hasUniverses && !createNewUniverse && !universeId) {
      setError("Please select a universe or choose to create a new one.");
      return;
    }

    setSubmitting(true);

    const payload: Record<string, unknown> = {
      title: title.trim(),
      contentRating,
    };

    if (description.trim()) {
      payload.description = description.trim();
    }

    if (coverImageUrl) {
      payload.coverImageUrl = coverImageUrl;
    }

    // Only send universeId if user selected an existing universe
    if (hasUniverses && !createNewUniverse && universeId) {
      payload.universeId = universeId;
    }
    // If createNewUniverse or no universes: don't send universeId → auto-create

    const res = await fetch("/api/comic/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create comic.");
      setSubmitting(false);
      return;
    }

    router.push(`/create/comic/${data.comicId}/pages`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <Input
        label="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder="My Awesome Comic"
      />

      <TextArea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        showCount
        rows={4}
        placeholder="What's your comic about?"
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground-muted">
          Cover Image (optional)
        </label>
        <ImageUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          aspect="3:4"
          bucket="uploads"
          path="comics/covers"
        />
      </div>

      {/* Content Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground-muted">
          Content Rating *
        </label>
        <div className="flex gap-3">
          {RATINGS.map((rating) => (
            <button
              key={rating.value}
              type="button"
              onClick={() => setContentRating(rating.value)}
              className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                contentRating === rating.value
                  ? rating.value === "E"
                    ? "border-rating-e bg-rating-e/10 text-rating-e"
                    : rating.value === "T"
                      ? "border-rating-t bg-rating-t/10 text-rating-t"
                      : "border-rating-m bg-rating-m/10 text-rating-m"
                  : "border-border text-foreground-muted hover:border-border-hover"
              }`}
            >
              <div className="font-bold">{rating.label}</div>
              <div className="mt-1 text-xs opacity-80">{rating.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Universe Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground-muted">
          Universe
        </label>
        {hasUniverses ? (
          <div className="space-y-3">
            <select
              value={createNewUniverse ? "__new__" : universeId}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setCreateNewUniverse(true);
                  setUniverseId("");
                } else {
                  setCreateNewUniverse(false);
                  setUniverseId(e.target.value);
                }
              }}
              className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="">Select a universe...</option>
              {universes.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title} ({u.status})
                </option>
              ))}
              <option value="__new__">+ Create new universe</option>
            </select>
            {createNewUniverse && (
              <p className="text-sm text-foreground-subtle">
                A new universe will be auto-created using your comic&apos;s title and
                rating.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-sm text-foreground-muted">
              You don&apos;t have any universes yet. One will be automatically
              created for this comic.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <Button
          variant="primary"
          size="lg"
          type="submit"
          isLoading={submitting}
        >
          Create Comic
        </Button>
      </div>
    </form>
  );
}
