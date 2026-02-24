import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import RatingBadge from "@/components/ui/RatingBadge";
import Tag from "@/components/ui/Tag";
import type { ContentRating } from "@/lib/types/database";

export interface UniverseCardData {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  content_rating: ContentRating;
  genre: string[];
  cover_image_url: string | null;
  follower_count: number;
  creator?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  status?: string;
}

interface UniverseCardProps {
  universe: UniverseCardData;
  showCreator?: boolean;
  showStatus?: boolean;
}

export default function UniverseCard({
  universe,
  showCreator = false,
  showStatus = false,
}: UniverseCardProps) {
  return (
    <Link href={`/universe/${universe.slug}`}>
      <Card glow>
        <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
          {universe.cover_image_url ? (
            <Image
              src={universe.cover_image_url}
              alt={`Cover image for ${universe.title}`}
              width={640}
              height={360}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-void-800 to-forge-700/20">
              <span className="font-display text-3xl font-bold text-void-400">
                {universe.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-void-50 truncate">
              {universe.title}
            </h3>
            <RatingBadge rating={universe.content_rating} />
            {showStatus && universe.status && (
              <Tag label={universe.status} variant="status" />
            )}
          </div>
          {universe.tagline && (
            <p className="mb-3 font-prose text-sm text-void-200 line-clamp-2">
              {universe.tagline}
            </p>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {universe.genre?.slice(0, 3).map((g: string) => (
              <Tag key={g} label={g} variant="genre" />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-void-300">
            <span>
              {universe.follower_count}{" "}
              {universe.follower_count === 1 ? "follower" : "followers"}
            </span>
            {showCreator && universe.creator && (
              <span className="flex items-center gap-1.5 truncate ml-2">
                {universe.creator.avatar_url ? (
                  <Image
                    src={universe.creator.avatar_url}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forge-500/20 text-[10px] font-bold text-forge-400">
                    {universe.creator.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="truncate">{universe.creator.display_name}</span>
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
