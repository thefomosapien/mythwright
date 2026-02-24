import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import FollowButton from "@/components/universe/FollowButton";
import ReportButton from "@/components/ui/ReportButton";
import LoreEntryCard from "@/components/lore/LoreEntryCard";
import type { ContentRating } from "@/lib/types/database";

export default async function UniverseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: universe } = await supabase
    .from("universes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!universe) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isCreator = user?.id === universe.creator_id;

  if (universe.status !== "published" && !isCreator) {
    notFound();
  }

  // Fetch creator profile
  const { data: creator } = await supabase
    .from("public_profiles")
    .select("username, display_name, avatar_url")
    .eq("id", universe.creator_id)
    .single();

  // Fetch comics
  const comicsQuery = supabase
    .from("comics")
    .select(
      "id, slug, title, description, content_rating, cover_image_url, page_count, status, is_origin, canon_status, sort_order"
    )
    .eq("universe_id", universe.id)
    .order("sort_order", { ascending: true });

  if (!isCreator) {
    comicsQuery.eq("status", "published");
  }

  const { data: comics } = await comicsQuery;

  // Fetch lore entries (up to 6 for preview)
  const loreQuery = supabase
    .from("lore_entries")
    .select(
      "id, entry_type, title, slug, image_url, content, is_mist_zone, canon_tier, status"
    )
    .eq("universe_id", universe.id)
    .order("sort_order", { ascending: true })
    .limit(6);

  if (!isCreator) {
    loreQuery.eq("status", "published");
  }

  const { data: loreEntries } = await loreQuery;

  // Check follow status
  let isFollowing = false;
  if (user) {
    const { data: follow } = await supabase
      .from("universe_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("universe_id", universe.id)
      .maybeSingle();
    isFollowing = !!follow;
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-80">
        {universe.banner_image_url ? (
          <Image
            src={universe.banner_image_url}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-void-800 via-void-900 to-void-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Header */}
        <div className="relative -mt-24 mb-10 flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="w-48 shrink-0 overflow-hidden rounded-lg border border-void-700 shadow-lg">
            {universe.cover_image_url ? (
              <Image
                src={universe.cover_image_url}
                alt={`Cover image for ${universe.title}`}
                width={192}
                height={108}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-void-800 to-forge-700/20 text-3xl font-bold text-void-400">
                {universe.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-void-50 sm:text-4xl">
                {universe.title}
              </h1>
              <RatingBadge
                rating={universe.content_rating as ContentRating}
              />
              {isCreator && (
                <Tag label={universe.status} variant="status" />
              )}
            </div>
            {universe.tagline && (
              <p className="mb-3 font-prose text-lg italic text-void-200">
                {universe.tagline}
              </p>
            )}
            <div className="mb-3 flex flex-wrap gap-2">
              {universe.genre?.map((g: string) => (
                <Tag key={g} label={g} variant="genre" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-void-300">
              {creator && (
                <Link
                  href={`/profile/${creator.username}`}
                  className="flex items-center gap-2 transition-colors hover:text-forge-400"
                >
                  {creator.avatar_url ? (
                    <Image
                      src={creator.avatar_url}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forge-500/20 text-xs font-bold text-forge-400">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {creator.display_name}
                </Link>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              {user && !isCreator && (
                <FollowButton
                  universeId={universe.id}
                  initialFollowing={isFollowing}
                  initialCount={universe.follower_count}
                />
              )}
              {!user && (
                <span className="text-sm text-void-300">
                  {universe.follower_count}{" "}
                  {universe.follower_count === 1 ? "follower" : "followers"}
                </span>
              )}
              {isCreator && (
                <>
                  <Link
                    href={`/create/universe/${universe.slug}/edit`}
                    className="inline-flex items-center justify-center rounded-md border border-forge-500 px-4 py-2 text-sm font-medium text-forge-500 transition-colors hover:bg-forge-500/10"
                  >
                    Edit Universe
                  </Link>
                  <span className="text-sm text-void-300">
                    {universe.follower_count}{" "}
                    {universe.follower_count === 1 ? "follower" : "followers"}
                  </span>
                </>
              )}
              {user && !isCreator && (
                <ReportButton targetType="universe" targetId={universe.id} />
              )}
            </div>
          </div>
        </div>

        {/* Comics Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-void-50">
              Comics
            </h2>
            {isCreator && (
              <Link
                href={`/create/universe/${universe.slug}/edit`}
                className="text-sm text-forge-400 transition-colors hover:text-forge-300"
              >
                Manage Comics
              </Link>
            )}
          </div>
          {comics && comics.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {comics.map((comic) => (
                <Link
                  key={comic.id}
                  href={`/universe/${slug}/comic/${comic.slug}`}
                >
                  <Card glow>
                    <div className="aspect-[3/4] overflow-hidden rounded-t-lg bg-void-900">
                      {comic.cover_image_url ? (
                        <Image
                          src={comic.cover_image_url}
                          alt={`Cover for ${comic.title}`}
                          width={300}
                          height={400}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-void-400">
                          {comic.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold text-void-50">
                          {comic.title}
                        </h3>
                        <RatingBadge
                          rating={comic.content_rating as ContentRating}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-void-300">
                        {comic.is_origin && (
                          <span className="rounded bg-forge-500/20 px-1.5 py-0.5 text-forge-400">
                            Origin
                          </span>
                        )}
                        <Tag
                          label={comic.canon_status}
                          variant="canon"
                        />
                        {isCreator && (
                          <Tag label={comic.status} variant="status" />
                        )}
                        <span>{comic.page_count} pages</span>
                      </div>
                      {comic.description && (
                        <p className="mt-2 text-sm text-void-200 line-clamp-2">
                          {comic.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-12 text-center">
              <p className="font-prose text-void-200">
                {isCreator
                  ? "Share your first story with the world."
                  : "No comics published yet. Check back soon."}
              </p>
            </div>
          )}
        </section>

        {/* Lore Bible Preview */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-void-50">
              Lore Bible
            </h2>
            {loreEntries && loreEntries.length > 0 && (
              <Link
                href={`/u/${slug}/lore`}
                className="text-sm text-forge-400 transition-colors hover:text-forge-300"
              >
                Explore All &rarr;
              </Link>
            )}
          </div>
          {loreEntries && loreEntries.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loreEntries.map((entry) => (
                <LoreEntryCard
                  key={entry.id}
                  entry={entry}
                  universeSlug={slug}
                  showType
                  isCreator={isCreator}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-12 text-center">
              <p className="font-prose text-void-200">
                {isCreator
                  ? "Build the lore for readers to discover."
                  : "This universe's lore is still being written."}
              </p>
            </div>
          )}
        </section>

        {/* Description */}
        {universe.description && (
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-void-50">
              About
            </h2>
            <div className="max-w-3xl font-prose text-void-200">
              {universe.description.split("\n").map((paragraph: string, i: number) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-3">
                    {paragraph}
                  </p>
                ) : null
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
