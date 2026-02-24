import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import UniverseCard from "@/components/universe/UniverseCard";
import type { UniverseCardData } from "@/components/universe/UniverseCard";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  // Fetch created universes
  const universesQuery = supabase
    .from("universes")
    .select(
      "id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count, status"
    )
    .eq("creator_id", profile.id)
    .order("created_at", { ascending: false });

  if (!isOwner) {
    universesQuery.eq("status", "published");
  }

  const { data: universes } = await universesQuery;

  // Fetch followed universes
  const { data: follows } = await supabase
    .from("universe_follows")
    .select(
      "universe_id, universes(id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count)"
    )
    .eq("user_id", profile.id);

  const followedUniverses = (follows
    ?.map((f) => f.universes)
    .filter(Boolean) || []) as UniverseCardData[];

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isCreator = profile.role === "creator" || profile.role === "admin";
  const publishedUniverses = universes?.filter((u) => u.status === "published") || [];
  const hasPublishedUniverses = publishedUniverses.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Profile header */}
      <div className="mb-12 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={`${profile.display_name}'s avatar`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-void-700 text-3xl font-bold text-forge-400">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-1 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <h1 className="font-display text-2xl font-bold text-void-50 sm:text-3xl">
              {profile.display_name}
            </h1>
            {isCreator && (
              <span className="inline-flex items-center rounded-full border border-forge-500/40 px-2.5 py-0.5 text-xs font-medium text-forge-400">
                Creator
              </span>
            )}
          </div>
          <p className="text-sm text-void-300">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 max-w-xl font-prose text-void-200">
              {profile.bio}
            </p>
          )}
          <p className="mt-2 text-sm text-void-400">Joined {joinDate}</p>
          {isOwner && (
            <Link
              href={`/profile/${profile.username}/edit`}
              className="mt-3 inline-flex items-center justify-center rounded-md border border-forge-500 px-4 py-2 text-sm font-medium text-forge-500 transition-colors hover:bg-forge-500/10"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Created Universes */}
      {isCreator && (
        <section className="mb-12">
          <h2 className="mb-6 font-display text-xl font-semibold text-void-50">
            Universes by {profile.display_name}
          </h2>
          {hasPublishedUniverses || (isOwner && universes && universes.length > 0) ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(isOwner ? universes : publishedUniverses)?.map((universe) => (
                <UniverseCard
                  key={universe.id}
                  universe={universe as UniverseCardData}
                  showStatus={isOwner}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-12 text-center">
              <p className="font-prose text-void-200">
                No published universes yet.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Following */}
      <section>
        <h2 className="mb-6 font-display text-xl font-semibold text-void-50">
          Following
          {followedUniverses.length > 0 && (
            <span className="ml-2 text-base font-normal text-void-400">
              ({followedUniverses.length})
            </span>
          )}
        </h2>
        {followedUniverses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {followedUniverses.map((universe) => (
              <UniverseCard
                key={universe.id}
                universe={universe as UniverseCardData}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-12 text-center">
            <p className="font-prose text-void-200">
              Not following any universes yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
