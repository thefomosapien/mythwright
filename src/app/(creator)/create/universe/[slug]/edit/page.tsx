"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import Tag from "@/components/ui/Tag";
import RatingBadge from "@/components/ui/RatingBadge";
import type {
  ContentRating,
  ContributionMode,
  UniverseLicenseType,
  UniverseStatus,
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

export default function EditUniversePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Universe fields
  const [universeId, setUniverseId] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [contentRating, setContentRating] = useState<ContentRating>("E");
  const [contributionMode, setContributionMode] =
    useState<ContributionMode>("moderated");
  const [licenseType, setLicenseType] =
    useState<UniverseLicenseType>("all-rights-reserved");
  const [status, setStatus] = useState<UniverseStatus>("draft");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);

  // Comics
  const [comics, setComics] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      status: string;
      content_rating: string;
      page_count: number;
      sort_order: number;
    }>
  >([]);

  const loadUniverse = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: universe } = await supabase
      .from("universes")
      .select("*")
      .eq("slug", slug)
      .eq("creator_id", user.id)
      .single();

    if (!universe) {
      router.push("/create");
      return;
    }

    setUniverseId(universe.id);
    setTitle(universe.title);
    setTagline(universe.tagline || "");
    setDescription(universe.description || "");
    setGenres(universe.genre || []);
    setContentRating(universe.content_rating as ContentRating);
    setContributionMode(universe.contribution_mode as ContributionMode);
    setLicenseType(universe.universe_license_type as UniverseLicenseType);
    setStatus(universe.status as UniverseStatus);
    setCoverImageUrl(universe.cover_image_url);
    setBannerImageUrl(universe.banner_image_url);

    const { data: comicData } = await supabase
      .from("comics")
      .select("id, slug, title, status, content_rating, page_count, sort_order")
      .eq("universe_id", universe.id)
      .order("sort_order", { ascending: true });

    setComics(comicData || []);
    setLoading(false);
  }, [supabase, slug, router]);

  useEffect(() => {
    loadUniverse();
  }, [loadUniverse]);

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (genres.length === 0) {
      setError("Select at least one genre.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("universes")
      .update({
        title: title.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        genre: genres,
        content_rating: contentRating,
        contribution_mode: contributionMode,
        universe_license_type: licenseType,
        cover_image_url: coverImageUrl,
        banner_image_url: bannerImageUrl,
      })
      .eq("id", universeId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Universe updated successfully.");
    }

    setSaving(false);
  }

  async function handlePublish() {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const newStatus = status === "published" ? "draft" : "published";

    const { error: updateError } = await supabase
      .from("universes")
      .update({ status: newStatus })
      .eq("id", universeId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setStatus(newStatus);
      setSuccess(
        newStatus === "published"
          ? "Universe published! It is now visible to everyone."
          : "Universe unpublished. Only you can see it."
      );
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-void-50">Edit Universe</h1>
          <p className="mt-1 text-foreground-subtle">
            <a
              href={`/universe/${slug}`}
              className="text-gold transition-colors hover:text-gold-light"
            >
              View public page
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={status === "published" ? "ghost" : "primary"}
            size="md"
            onClick={handlePublish}
            isLoading={saving}
          >
            {status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main form */}
        <form onSubmit={handleSave} className="space-y-6 lg:col-span-2">
          <Input
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={200}
            helperText="A brief description shown on universe cards."
          />
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            showCount
            rows={5}
          />

          {/* Images */}
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
              Genres *
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
              Content Rating
            </label>
            <div className="flex gap-3">
              {(["E", "T", "M"] as ContentRating[]).map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setContentRating(rating)}
                  className={`flex-1 rounded-lg border p-3 text-center transition-colors ${
                    contentRating === rating
                      ? rating === "E"
                        ? "border-rating-e bg-rating-e/10 text-rating-e"
                        : rating === "T"
                          ? "border-rating-t bg-rating-t/10 text-rating-t"
                          : "border-rating-m bg-rating-m/10 text-rating-m"
                      : "border-border text-foreground-muted hover:border-border-hover"
                  }`}
                >
                  <div className="font-bold">{rating}</div>
                  <div className="text-xs">
                    {rating === "E"
                      ? "Everyone"
                      : rating === "T"
                        ? "Teen"
                        : "Mature"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contribution & License */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted">
                Contributions
              </label>
              <select
                value={contributionMode}
                onChange={(e) =>
                  setContributionMode(e.target.value as ContributionMode)
                }
                className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="closed">Closed</option>
                <option value="moderated">Moderated</option>
                <option value="open">Open</option>
              </select>
            </div>
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
          </div>

          <div className="border-t border-border pt-6">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>

        {/* Sidebar — Comics */}
        <div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Comics
              </h2>
              <a
                href={`/create/comic/new?universe=${slug}`}
                className="inline-flex items-center justify-center rounded-md bg-forge-500 px-3 py-1.5 text-xs font-medium text-void-950 transition-colors hover:bg-forge-300"
              >
                Add Comic
              </a>
            </div>
            {comics.length > 0 ? (
              <div className="space-y-3">
                {comics.map((comic) => (
                  <a
                    key={comic.id}
                    href={`/create/comic/${comic.id}/pages`}
                    className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:border-border-hover hover:bg-surface-hover"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {comic.title}
                        </p>
                        <RatingBadge
                          rating={comic.content_rating as ContentRating}
                        />
                      </div>
                      <p className="text-xs text-foreground-subtle">
                        {comic.page_count} pages &middot;{" "}
                        <span
                          className={
                            comic.status === "published"
                              ? "text-success"
                              : ""
                          }
                        >
                          {comic.status}
                        </span>
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-subtle">
                No comics yet.{" "}
                <a
                  href={`/create/comic/new?universe=${slug}`}
                  className="text-gold hover:text-gold-light"
                >
                  Add your first comic
                </a>
              </p>
            )}
          </div>

          {/* Completeness nudges — only for published universes */}
          {status === "published" && (
            <div className="mt-4 space-y-2">
              {!coverImageUrl && (
                <div className="rounded-lg border border-amber/30 bg-amber/5 px-4 py-2.5 text-sm text-amber">
                  Add a cover image to stand out in discovery
                </div>
              )}
              {!tagline.trim() && (
                <div className="rounded-lg border border-amber/30 bg-amber/5 px-4 py-2.5 text-sm text-amber">
                  Write a short tagline to hook readers
                </div>
              )}
              {!description.trim() && (
                <div className="rounded-lg border border-amber/30 bg-amber/5 px-4 py-2.5 text-sm text-amber">
                  Describe your world for curious explorers
                </div>
              )}
              {genres.length === 0 && (
                <div className="rounded-lg border border-amber/30 bg-amber/5 px-4 py-2.5 text-sm text-amber">
                  Add genre tags so readers can find your universe
                </div>
              )}
            </div>
          )}

          {/* Status info */}
          <div className="mt-4 rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">
              Status
            </h3>
            <Tag label={status} variant="status" />
            <p className="mt-2 text-xs text-foreground-subtle">
              {status === "draft"
                ? "Only you can see this universe. Publish it to make it visible to everyone."
                : status === "published"
                  ? "This universe is visible to everyone."
                  : "This universe has been archived."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
