import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import RoleUpgrade from "./RoleUpgrade";
import type { ContentRating, ComicStatus } from "@/lib/types/database";

export default async function CreatorDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Reader who hasn't upgraded to creator yet
  if (profile.role === "reader") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-4 font-display text-3xl font-bold text-void-50">
          Become a Creator
        </h1>
        <p className="mb-8 font-prose text-lg text-void-200">
          Want to share your comics? Upgrade to a creator account to start
          building universes.
        </p>
        <RoleUpgrade userId={user.id} />
      </div>
    );
  }

  // Creator — show their universes
  const { data: universes } = await supabase
    .from("universes")
    .select("id, slug, title, tagline, content_rating, genre, status, follower_count, comic_count, cover_image_url")
    .eq("creator_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch comics for each universe
  const universeIds = universes?.map((u) => u.id) || [];
  let comicsByUniverse: Record<
    string,
    Array<{ id: string; title: string; status: ComicStatus; page_count: number }>
  > = {};

  if (universeIds.length > 0) {
    const { data: allComics } = await supabase
      .from("comics")
      .select("id, title, status, page_count, universe_id, sort_order")
      .in("universe_id", universeIds)
      .order("sort_order", { ascending: true });

    if (allComics) {
      comicsByUniverse = allComics.reduce(
        (acc, comic) => {
          const uid = comic.universe_id;
          if (!acc[uid]) acc[uid] = [];
          acc[uid].push({
            id: comic.id,
            title: comic.title,
            status: comic.status as ComicStatus,
            page_count: comic.page_count,
          });
          return acc;
        },
        {} as typeof comicsByUniverse
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-void-50">Your Worlds</h1>
        <div className="flex items-center gap-3">
          <a
            href="/create/universe/new"
            className="inline-flex items-center justify-center rounded-md border border-forge-500 px-4 py-2 text-sm font-medium text-forge-500 transition-colors hover:bg-forge-500/10"
          >
            New Universe
          </a>
          <a
            href="/create/comic/new"
            className="inline-flex items-center justify-center rounded-md bg-forge-500 px-6 py-3 text-base font-medium text-void-950 transition-colors hover:bg-forge-300"
          >
            New Comic
          </a>
        </div>
      </div>

      {universes && universes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {universes.map((universe) => (
            <div key={universe.id}>
              <a href={`/create/universe/${universe.slug}/edit`}>
                <Card glow>
                  {universe.cover_image_url && (
                    <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                      <img
                        src={universe.cover_image_url}
                        alt={universe.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">
                        {universe.title}
                      </h2>
                      <RatingBadge rating={universe.content_rating as ContentRating} />
                      <Tag label={universe.status} variant="status" />
                    </div>
                    {universe.tagline && (
                      <p className="mb-3 text-sm text-foreground-muted line-clamp-2">
                        {universe.tagline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {universe.genre?.slice(0, 3).map((g: string) => (
                        <Tag key={g} label={g} variant="genre" />
                      ))}
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-foreground-subtle">
                      <span>{universe.comic_count} comics</span>
                      <span>{universe.follower_count} followers</span>
                    </div>
                  </div>
                </Card>
              </a>

              {/* Comics under this universe */}
              {comicsByUniverse[universe.id]?.length > 0 && (
                <div className="mt-2 space-y-1 pl-2">
                  {comicsByUniverse[universe.id].map((comic) => (
                    <a
                      key={comic.id}
                      href={`/create/comic/${comic.id}/pages`}
                      className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface-hover"
                    >
                      <span className="truncate text-foreground-muted">
                        {comic.title}
                      </span>
                      <span className="ml-2 flex shrink-0 items-center gap-2 text-xs text-foreground-subtle">
                        <span>{comic.page_count}p</span>
                        <span
                          className={
                            comic.status === "published"
                              ? "text-success"
                              : ""
                          }
                        >
                          {comic.status}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-8 py-16 text-center">
          <p className="mb-4 text-foreground-muted">
            You haven&apos;t created anything yet. Start by uploading your
            first comic!
          </p>
          <a
            href="/create/comic/new"
            className="inline-flex items-center justify-center rounded-md bg-forge-500 px-6 py-3 text-base font-medium text-void-950 transition-colors hover:bg-forge-300"
          >
            Create Your First Comic
          </a>
        </div>
      )}
    </div>
  );
}
