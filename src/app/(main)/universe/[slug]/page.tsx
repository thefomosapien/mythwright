import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import FollowButton from "@/components/universe/FollowButton";
import type { ContentRating, CanonStatus } from "@/lib/types/database";

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

  // Check if current user is the creator
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isCreator = user?.id === universe.creator_id;

  // Only show draft/archived to the creator
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

  // Fetch lore entries
  const loreQuery = supabase
    .from("lore_entries")
    .select(
      "id, entry_type, title, slug, image_url, is_mist_zone, canon_tier, status"
    )
    .eq("universe_id", universe.id)
    .order("sort_order", { ascending: true });

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

  // Group lore entries by type
  const loreByType: Record<string, typeof loreEntries> = {};
  loreEntries?.forEach((entry) => {
    if (!loreByType[entry.entry_type]) {
      loreByType[entry.entry_type] = [];
    }
    loreByType[entry.entry_type]!.push(entry);
  });

  const loreTypeLabels: Record<string, string> = {
    character: "Characters",
    faction: "Factions",
    location: "Locations",
    event: "Events",
    item: "Items",
    lore: "Lore",
    custom: "Other",
  };

  return (
    <div>
      {/* Banner */}
      {universe.banner_image_url && (
        <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-80">
          <img
            src={universe.banner_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start">
          {universe.cover_image_url && (
            <div className="w-48 shrink-0 overflow-hidden rounded-lg border border-border shadow-lg">
              <img
                src={universe.cover_image_url}
                alt={universe.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}
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
              <p className="mb-3 font-prose text-lg text-void-200">
                {universe.tagline}
              </p>
            )}
            {universe.description && (
              <p className="mb-4 max-w-2xl font-prose text-void-200">
                {universe.description}
              </p>
            )}
            <div className="mb-4 flex flex-wrap gap-2">
              {universe.genre?.map((g: string) => (
                <Tag key={g} label={g} variant="genre" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-subtle">
              {creator && (
                <a
                  href={`/profile/${creator.username}`}
                  className="flex items-center gap-2 transition-colors hover:text-gold"
                >
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {creator.display_name}
                </a>
              )}
              <span>
                {universe.comic_count}{" "}
                {universe.comic_count === 1 ? "comic" : "comics"}
              </span>
              <span>
                {universe.follower_count}{" "}
                {universe.follower_count === 1 ? "follower" : "followers"}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              {user && !isCreator && (
                <FollowButton
                  universeId={universe.id}
                  initialFollowing={isFollowing}
                />
              )}
              {isCreator && (
                <a
                  href={`/create/universe/${universe.slug}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-gold px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
                >
                  Edit Universe
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Comics Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-void-50">Comics</h2>
            {isCreator && (
              <a
                href={`/create/universe/${universe.slug}/edit`}
                className="text-sm text-gold transition-colors hover:text-gold-light"
              >
                Manage Comics
              </a>
            )}
          </div>
          {comics && comics.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {comics.map((comic) => (
                <a
                  key={comic.id}
                  href={`/universe/${slug}/comic/${comic.slug}`}
                >
                  <Card glow>
                    {comic.cover_image_url && (
                      <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                        <img
                          src={comic.cover_image_url}
                          alt={comic.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {comic.title}
                        </h3>
                        <RatingBadge
                          rating={comic.content_rating as ContentRating}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-subtle">
                        {comic.is_origin && (
                          <span className="rounded bg-gold/20 px-1.5 py-0.5 text-gold">
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
                        <p className="mt-2 text-sm text-foreground-muted line-clamp-2">
                          {comic.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface px-8 py-12 text-center">
              <p className="text-foreground-muted">
                No comics published yet.
              </p>
            </div>
          )}
        </section>

        {/* Lore Section */}
        {loreEntries && loreEntries.length > 0 && (
          <section>
            <h2 className="mb-6 font-display text-xl font-semibold text-void-50">
              Lorebook
            </h2>
            <div className="space-y-8">
              {Object.entries(loreByType).map(([type, entries]) => (
                <div key={type}>
                  <h3 className="mb-4 text-lg font-medium capitalize text-foreground-muted">
                    {loreTypeLabels[type] || type}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {entries!.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-hover"
                      >
                        {entry.image_url ? (
                          <img
                            src={entry.image_url}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-lg font-bold text-gold">
                            {entry.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate font-medium text-foreground">
                              {entry.title}
                            </h4>
                            {entry.is_mist_zone && (
                              <span
                                className="shrink-0 text-xs text-foreground-subtle"
                                title="Mist Zone — lore is partially hidden"
                              >
                                [Mist]
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag
                              label={entry.canon_tier}
                              variant="canon"
                            />
                            {isCreator && (
                              <Tag
                                label={entry.status}
                                variant="status"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
