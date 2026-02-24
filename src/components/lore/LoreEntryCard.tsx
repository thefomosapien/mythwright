import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import {
  User,
  Shield,
  MapPin,
  Calendar,
  Package,
  BookOpen,
  Sparkles,
} from "lucide-react";

export interface LoreEntryCardProps {
  entry: {
    id: string;
    title: string;
    entry_type: string;
    image_url: string | null;
    content: string | null;
    canon_tier: string;
    is_mist_zone: boolean;
    slug: string;
    status?: string;
  };
  universeSlug: string;
  showType?: boolean;
  isCreator?: boolean;
  /** If true, clicking links to the edit page instead of the public page */
  editMode?: boolean;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  character: User,
  faction: Shield,
  location: MapPin,
  event: Calendar,
  item: Package,
  lore: BookOpen,
  custom: Sparkles,
};

const TYPE_LABELS: Record<string, string> = {
  character: "Character",
  faction: "Faction",
  location: "Location",
  event: "Event",
  item: "Item",
  lore: "Lore",
  custom: "Custom",
};

export default function LoreEntryCard({
  entry,
  universeSlug,
  showType = false,
  isCreator = false,
  editMode = false,
}: LoreEntryCardProps) {
  const Icon = TYPE_ICONS[entry.entry_type] || Sparkles;
  const typeLabel = TYPE_LABELS[entry.entry_type] || entry.entry_type;

  const href = editMode
    ? `/create/universe/${universeSlug}/lore/${entry.slug}/edit`
    : `/u/${universeSlug}/lore/${entry.entry_type}/${entry.slug}`;

  return (
    <a href={href}>
      <Card
        glow
        className={
          entry.is_mist_zone
            ? "border-mist-500/40 hover:border-mist-400/60"
            : ""
        }
      >
        {/* Image or placeholder */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-void-900">
          {entry.image_url ? (
            <img
              src={entry.image_url}
              alt={entry.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon size={48} className="text-void-400" />
            </div>
          )}
          {entry.is_mist_zone && (
            <div className="absolute top-2 right-2 rounded bg-mist-500/80 px-1.5 py-0.5 text-xs font-medium text-white">
              Mist Zone
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-1 truncate font-semibold text-foreground">
            {entry.title}
          </h3>

          <div className="mb-2 flex flex-wrap items-center gap-2">
            {showType && (
              <span className="text-xs text-foreground-subtle">{typeLabel}</span>
            )}
            <Tag label={entry.canon_tier} variant="canon" />
            {isCreator && entry.status && (
              <Tag label={entry.status} variant="status" />
            )}
          </div>

          {entry.content && (
            <p className="text-sm text-foreground-muted line-clamp-2">
              {entry.content.slice(0, 100)}
              {entry.content.length > 100 ? "..." : ""}
            </p>
          )}
        </div>
      </Card>
    </a>
  );
}
