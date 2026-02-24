import { createClient } from "@/lib/supabase/server";
import UniverseDiscovery from "@/components/universe/UniverseDiscovery";
import type { UniverseCardData } from "@/components/universe/UniverseCard";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch initial universes (newest first, page 1)
  const { data: rawUniverses } = await supabase
    .from("universes")
    .select(
      "id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count, created_at, creator_id, profiles!universes_creator_id_fkey(username, display_name, avatar_url)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(0, 19);

  // Fetch distinct genres from published universes
  const { data: allPublished } = await supabase
    .from("universes")
    .select("genre")
    .eq("status", "published");

  const genreSet = new Set<string>();
  allPublished?.forEach((u) => {
    u.genre?.forEach((g: string) => genreSet.add(g));
  });
  const genres = Array.from(genreSet).sort();

  const universes: UniverseCardData[] = (rawUniverses || []).map((u) => {
    const profile = u.profiles as unknown as {
      username: string;
      display_name: string;
      avatar_url: string | null;
    } | null;
    return {
      id: u.id,
      slug: u.slug,
      title: u.title,
      tagline: u.tagline,
      content_rating: u.content_rating as UniverseCardData["content_rating"],
      genre: u.genre || [],
      cover_image_url: u.cover_image_url,
      follower_count: u.follower_count,
      creator: profile
        ? {
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero section */}
      <div className="relative mb-10 text-center">
        {/* Warm radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-96 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212, 168, 67, 0.05) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <h1 className="relative font-display text-4xl font-bold text-void-50 sm:text-5xl">
          Discover Worlds
        </h1>
        <p className="relative mt-3 font-prose text-lg text-void-200">
          Explore comic universes built by creators and expanded by communities.
        </p>
      </div>

      <UniverseDiscovery initialUniverses={universes} genres={genres} />
    </div>
  );
}
