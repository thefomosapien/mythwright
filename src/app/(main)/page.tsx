import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import type { ContentRating } from "@/lib/types/database";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: universes } = await supabase
    .from("universes")
    .select("id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count")
    .eq("status", "published")
    .order("follower_count", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Discover Worlds
        </h1>
        <p className="mt-2 text-foreground-muted">
          Explore comic universes built by creators and expanded by communities.
        </p>
      </div>

      {universes && universes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {universes.map((universe) => (
            <a key={universe.id} href={`/universe/${universe.slug}`}>
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
                  <p className="mt-3 text-xs text-foreground-subtle">
                    {universe.follower_count}{" "}
                    {universe.follower_count === 1 ? "follower" : "followers"}
                  </p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-8 py-16 text-center">
          <p className="text-foreground-muted">
            No universes yet. Be the first to create one.
          </p>
        </div>
      )}
    </div>
  );
}
