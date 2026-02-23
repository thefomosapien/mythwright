"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import Tag from "@/components/ui/Tag";
import type {
  ContentRating,
  ContributionMode,
  UniverseLicenseType,
} from "@/lib/types/database";

const GENRE_OPTIONS = [
  "Fantasy",
  "Sci-Fi",
  "Horror",
  "Romance",
  "Action",
  "Comedy",
  "Drama",
  "Mystery",
  "Thriller",
  "Slice of Life",
  "Superhero",
  "Cyberpunk",
  "Steampunk",
  "Post-Apocalyptic",
  "Mythology",
];

export default function NewUniversePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [contentRating, setContentRating] = useState<ContentRating>("E");
  const [contributionMode, setContributionMode] =
    useState<ContributionMode>("moderated");
  const [licenseType, setLicenseType] =
    useState<UniverseLicenseType>("all-rights-reserved");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (title.length > 100) {
      setError("Title must be under 100 characters.");
      return;
    }

    if (genres.length === 0) {
      setError("Select at least one genre.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setSaving(false);
      return;
    }

    const slug = slugify(title) || `universe-${Date.now()}`;

    const { data, error: insertError } = await supabase
      .from("universes")
      .insert({
        creator_id: user.id,
        slug,
        title: title.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        genre: genres,
        content_rating: contentRating,
        contribution_mode: contributionMode,
        universe_license_type: licenseType,
        cover_image_url: coverImageUrl,
        banner_image_url: bannerImageUrl,
        status: "draft",
      })
      .select("slug")
      .single();

    if (insertError) {
      if (insertError.message.includes("duplicate key")) {
        setError(
          "A universe with this title already exists. Please choose another."
        );
      } else {
        setError(insertError.message);
      }
      setSaving(false);
      return;
    }

    router.push(`/universe/${data.slug}`);
    router.refresh();
  }

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-foreground">
        Create a Universe
      </h1>
      <p className="mb-8 text-foreground-muted">
        Set up the foundation for your comic universe. You can always edit these
        details later.
      </p>

      {error && (
        <div className="mb-6 rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title & Tagline */}
        <div className="space-y-4">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The name of your universe"
            maxLength={100}
          />
          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short hook for your universe"
            maxLength={200}
            helperText="A brief description shown on universe cards."
          />
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell readers about your world, its history, and what makes it unique..."
            maxLength={2000}
            showCount
            rows={5}
          />
        </div>

        {/* Cover & Banner Images */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground-muted">
              Cover Image
            </label>
            <ImageUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              aspect="16:9"
              bucket="uploads"
              path="universes/covers"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground-muted">
              Banner Image
            </label>
            <ImageUpload
              value={bannerImageUrl}
              onChange={setBannerImageUrl}
              aspect="16:9"
              bucket="uploads"
              path="universes/banners"
            />
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground-muted">
            Genres * <span className="text-foreground-subtle">(select up to 5)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const selected = genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    if (!selected && genres.length >= 5) return;
                    toggleGenre(genre);
                  }}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selected
                      ? "border-gold bg-gold/20 text-gold"
                      : "border-border text-foreground-muted hover:border-border-hover"
                  } ${!selected && genres.length >= 5 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((g) => (
                <Tag
                  key={g}
                  label={g}
                  variant="genre"
                  removable
                  onRemove={() => toggleGenre(g)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Rating */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground-muted">
            Content Rating *
          </label>
          <div className="flex gap-3">
            {(["E", "T", "M"] as ContentRating[]).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setContentRating(rating)}
                className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
                  contentRating === rating
                    ? rating === "E"
                      ? "border-rating-e bg-rating-e/10 text-rating-e"
                      : rating === "T"
                        ? "border-rating-t bg-rating-t/10 text-rating-t"
                        : "border-rating-m bg-rating-m/10 text-rating-m"
                    : "border-border text-foreground-muted hover:border-border-hover"
                }`}
              >
                <div className="text-lg font-bold">{rating}</div>
                <div className="mt-1 text-xs">
                  {rating === "E"
                    ? "Everyone"
                    : rating === "T"
                      ? "Teen (13+)"
                      : "Mature (17+)"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contribution Mode */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground-muted">
            Contribution Mode
          </label>
          <div className="space-y-2">
            {(
              [
                {
                  value: "closed",
                  label: "Closed",
                  desc: "Only you can add content.",
                },
                {
                  value: "moderated",
                  label: "Moderated",
                  desc: "Others can submit, you approve.",
                },
                {
                  value: "open",
                  label: "Open",
                  desc: "Anyone can contribute freely.",
                },
              ] as { value: ContributionMode; label: string; desc: string }[]
            ).map((mode) => (
              <label
                key={mode.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  contributionMode === mode.value
                    ? "border-gold bg-gold/5"
                    : "border-border hover:border-border-hover"
                }`}
              >
                <input
                  type="radio"
                  name="contributionMode"
                  value={mode.value}
                  checked={contributionMode === mode.value}
                  onChange={() => setContributionMode(mode.value)}
                  className="accent-gold"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {mode.label}
                  </div>
                  <div className="text-xs text-foreground-subtle">
                    {mode.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* License Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground-muted">
            License
          </label>
          <select
            value={licenseType}
            onChange={(e) =>
              setLicenseType(e.target.value as UniverseLicenseType)
            }
            className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all-rights-reserved">All Rights Reserved</option>
            <option value="open-with-attribution">
              Open with Attribution
            </option>
            <option value="universe-owned">Universe Owned</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-4 border-t border-border pt-6">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            isLoading={saving}
          >
            Create Universe
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.push("/create")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
