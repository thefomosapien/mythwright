import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import RoleUpgrade from "./RoleUpgrade";
import type { ContentRating } from "@/lib/types/database";

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
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          Become a Creator
        </h1>
        <p className="mb-8 text-foreground-muted">
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Worlds</h1>
        <a
          href="/create/universe/new"
          className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-base font-medium text-background transition-colors hover:bg-gold-light"
        >
          New Universe
        </a>
      </div>

      {universes && universes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {universes.map((universe) => (
            <a key={universe.id} href={`/create/universe/${universe.slug}/edit`}>
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
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-8 py-16 text-center">
          <p className="text-foreground-muted">
            You haven&apos;t created any universes yet. Start by uploading your
            first comic!
          </p>
        </div>
      )}
    </div>
  );
}
