import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import type { ContentRating } from "@/lib/types/database";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile from the secure public_profiles view
  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Check if viewing own profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  // Fetch created universes (published only for public)
  const universesQuery = supabase
    .from("universes")
    .select("id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count, status")
    .eq("creator_id", profile.id)
    .order("follower_count", { ascending: false });

  if (!isOwner) {
    universesQuery.eq("status", "published");
  }

  const { data: universes } = await universesQuery;

  // Fetch followed universes
  const { data: follows } = await supabase
    .from("universe_follows")
    .select("universe_id, universes(id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count)")
    .eq("user_id", profile.id);

  const followedUniverses = follows
    ?.map((f) => f.universes)
    .filter(Boolean) as Array<{
    id: string;
    slug: string;
    title: string;
    tagline: string | null;
    content_rating: string;
    genre: string[];
    cover_image_url: string | null;
    follower_count: number;
  }> | undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Profile header */}
      <div className="mb-12 flex items-start gap-6">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/20 text-2xl font-bold text-gold">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-void-50">
            {profile.display_name}
          </h1>
          <p className="text-sm text-foreground-subtle">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 max-w-xl text-foreground-muted">{profile.bio}</p>
          )}
          {isOwner && (
            <a
              href="#"
              className="mt-3 inline-block text-sm text-gold hover:text-gold-light transition-colors"
            >
              Edit Profile
            </a>
          )}
        </div>
      </div>

      {/* Created Universes */}
      <section className="mb-12">
        <h2 className="mb-6 font-display text-xl font-semibold text-void-50">
          Created Universes
        </h2>
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
                      <h3 className="font-semibold text-foreground">
                        {universe.title}
                      </h3>
                      <RatingBadge rating={universe.content_rating as ContentRating} />
                      {isOwner && (
                        <Tag label={universe.status} variant="status" />
                      )}
                    </div>
                    {universe.tagline && (
                      <p className="mb-3 text-sm text-foreground-muted line-clamp-2">
                        {universe.tagline}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {universe.genre?.slice(0, 3).map((g: string) => (
                        <Tag key={g} label={g} variant="genre" />
                      ))}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-foreground-subtle">No universes yet.</p>
        )}
      </section>

      {/* Following */}
      <section>
        <h2 className="mb-6 font-display text-xl font-semibold text-void-50">
          Following
        </h2>
        {followedUniverses && followedUniverses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {followedUniverses.map((universe) => (
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
                      <h3 className="font-semibold text-foreground">
                        {universe.title}
                      </h3>
                      <RatingBadge rating={universe.content_rating as ContentRating} />
                    </div>
                    {universe.tagline && (
                      <p className="text-sm text-foreground-muted line-clamp-2">
                        {universe.tagline}
                      </p>
                    )}
                  </div>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-foreground-subtle">Not following any universes yet.</p>
        )}
      </section>
    </div>
  );
}
