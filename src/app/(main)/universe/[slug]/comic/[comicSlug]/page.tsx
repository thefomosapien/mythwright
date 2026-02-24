import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import ReportButton from "@/components/ui/ReportButton";
import ComicPageViewer from "@/components/comic/ComicPageViewer";
import type { ContentRating } from "@/lib/types/database";

export default async function ComicReaderPage({
  params,
}: {
  params: Promise<{ slug: string; comicSlug: string }>;
}) {
  const { slug, comicSlug } = await params;
  const supabase = await createClient();

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

  const { data: comic } = await supabase
    .from("comics")
    .select("*")
    .eq("universe_id", universe.id)
    .eq("slug", comicSlug)
    .single();

  if (!comic) {
    notFound();
  }

  if (comic.status !== "published" && !isCreator) {
    notFound();
  }

  const { data: pages } = await supabase
    .from("comic_pages")
    .select("id, page_number, image_url, thumbnail_url, width, height")
    .eq("comic_id", comic.id)
    .order("page_number", { ascending: true });

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
      <nav className="mb-6 text-sm text-void-300">
        <Link
          href={`/universe/${slug}`}
          className="transition-colors hover:text-forge-400"
        >
          {universe.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-void-50">{comic.title}</span>
      </nav>

      {/* Comic Header */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-void-50 sm:text-3xl">
            {comic.title}
          </h1>
          <RatingBadge rating={comic.content_rating as ContentRating} />
          {comic.is_origin && (
            <span className="rounded bg-forge-500/20 px-2 py-0.5 text-xs font-medium text-forge-400">
              Origin
            </span>
          )}
          <Tag label={comic.canon_status} variant="canon" />
          {isCreator && <Tag label={comic.status} variant="status" />}
          {user && !isCreator && (
            <ReportButton targetType="comic" targetId={comic.id} />
          )}
        </div>
        {comic.description && (
          <p className="max-w-2xl font-prose text-void-200">
            {comic.description}
          </p>
        )}
        <p className="mt-2 text-sm text-void-300">
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
            thumbnailUrl: p.thumbnail_url || undefined,
            width: p.width,
            height: p.height,
          }))}
        />
      ) : (
        <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-16 text-center">
          <p className="font-prose text-void-200">
            No pages uploaded yet.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-void-700 pt-6">
        {prevComic ? (
          <Link
            href={`/universe/${slug}/comic/${prevComic.slug}`}
            className="flex items-center gap-2 text-sm text-void-200 transition-colors hover:text-forge-400"
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
          </Link>
        ) : (
          <div />
        )}
        <Link
          href={`/universe/${slug}`}
          className="text-sm text-void-300 transition-colors hover:text-forge-400"
        >
          Back to Universe
        </Link>
        {nextComic ? (
          <Link
            href={`/universe/${slug}/comic/${nextComic.slug}`}
            className="flex items-center gap-2 text-sm text-void-200 transition-colors hover:text-forge-400"
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
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
