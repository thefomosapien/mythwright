import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import ComicPageViewer from "@/components/comic/ComicPageViewer";
import type { ContentRating } from "@/lib/types/database";

export default async function ComicReaderPage({
  params,
}: {
  params: Promise<{ slug: string; comicSlug: string }>;
}) {
  const { slug, comicSlug } = await params;
  const supabase = await createClient();

  // Fetch universe
  const { data: universe } = await supabase
    .from("universes")
    .select("id, slug, title, creator_id, status")
    .eq("slug", slug)
    .single();

  if (!universe) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isCreator = user?.id === universe.creator_id;

  // Fetch comic
  const { data: comic } = await supabase
    .from("comics")
    .select("*")
    .eq("universe_id", universe.id)
    .eq("slug", comicSlug)
    .single();

  if (!comic) {
    notFound();
  }

  // Only show draft comics to creator
  if (comic.status !== "published" && !isCreator) {
    notFound();
  }

  // Fetch pages
  const { data: pages } = await supabase
    .from("comic_pages")
    .select("id, page_number, image_url, thumbnail_url, width, height")
    .eq("comic_id", comic.id)
    .order("page_number", { ascending: true });

  // Fetch adjacent comics for navigation
  const { data: allComics } = await supabase
    .from("comics")
    .select("slug, title, sort_order")
    .eq("universe_id", universe.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const currentIndex = allComics?.findIndex((c) => c.slug === comicSlug) ?? -1;
  const prevComic = currentIndex > 0 ? allComics![currentIndex - 1] : null;
  const nextComic =
    allComics && currentIndex < allComics.length - 1
      ? allComics[currentIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-foreground-subtle">
        <a
          href={`/universe/${slug}`}
          className="transition-colors hover:text-gold"
        >
          {universe.title}
        </a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{comic.title}</span>
      </nav>

      {/* Comic Header */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {comic.title}
          </h1>
          <RatingBadge rating={comic.content_rating as ContentRating} />
          {comic.is_origin && (
            <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold">
              Origin
            </span>
          )}
          <Tag label={comic.canon_status} variant="canon" />
          {isCreator && <Tag label={comic.status} variant="status" />}
        </div>
        {comic.description && (
          <p className="max-w-2xl text-foreground-muted">
            {comic.description}
          </p>
        )}
        <p className="mt-2 text-sm text-foreground-subtle">
          {comic.page_count} {comic.page_count === 1 ? "page" : "pages"}
        </p>
      </div>

      {/* Comic Pages */}
      {pages && pages.length > 0 ? (
        <ComicPageViewer
          pages={pages.map((p) => ({
            id: p.id,
            pageNumber: p.page_number,
            imageUrl: p.image_url,
            width: p.width,
            height: p.height,
          }))}
        />
      ) : (
        <div className="rounded-lg border border-border bg-surface px-8 py-16 text-center">
          <p className="text-foreground-muted">
            No pages uploaded yet.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        {prevComic ? (
          <a
            href={`/universe/${slug}/comic/${prevComic.slug}`}
            className="flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-gold"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {prevComic.title}
          </a>
        ) : (
          <div />
        )}
        <a
          href={`/universe/${slug}`}
          className="text-sm text-foreground-subtle transition-colors hover:text-gold"
        >
          Back to Universe
        </a>
        {nextComic ? (
          <a
            href={`/universe/${slug}/comic/${nextComic.slug}`}
            className="flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-gold"
          >
            {nextComic.title}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
