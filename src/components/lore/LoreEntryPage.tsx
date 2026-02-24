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
import type { LoreEntry } from "@/lib/types/database";
import type { CrossReference } from "@/lib/utils/cross-references";

export interface LoreEntryPageProps {
  entry: LoreEntry;
  universe: { slug: string; title: string };
  crossReferences: {
    forward: CrossReference[];
    reverse: CrossReference[];
  };
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

function MetadataField({
  label,
  value,
  universeSlug,
}: {
  label: string;
  value: unknown;
  universeSlug: string;
}) {
  if (!value) return null;

  // Reference object
  if (
    typeof value === "object" &&
    value !== null &&
    "entry_id" in (value as Record<string, unknown>)
  ) {
    const ref = value as { entry_id: string; entry_title: string; entry_slug: string; entry_type: string };
    return (
      <div className="mb-3">
        <dt className="text-sm font-medium text-foreground-subtle">{label}</dt>
        <dd className="mt-0.5">
          <a
            href={`/u/${universeSlug}/lore/${ref.entry_type}/${ref.entry_slug}`}
            className="text-gold transition-colors hover:text-gold-light"
          >
            {ref.entry_title}
          </a>
        </dd>
      </div>
    );
  }

  // Array of references
  if (Array.isArray(value) && value.length > 0 && value[0]?.entry_id) {
    return (
      <div className="mb-3">
        <dt className="text-sm font-medium text-foreground-subtle">{label}</dt>
        <dd className="mt-0.5 flex flex-wrap gap-2">
          {value.map((ref: { entry_id: string; entry_title: string; entry_slug: string; entry_type: string }) => (
            <a
              key={ref.entry_id}
              href={`/u/${universeSlug}/lore/${ref.entry_type}/${ref.entry_slug}`}
              className="text-gold transition-colors hover:text-gold-light"
            >
              {ref.entry_title}
            </a>
          ))}
        </dd>
      </div>
    );
  }

  // Plain text
  return (
    <div className="mb-3">
      <dt className="text-sm font-medium text-foreground-subtle">{label}</dt>
      <dd className="mt-0.5 text-foreground">{String(value)}</dd>
    </div>
  );
}

const CHARACTER_FIELDS = [
  { key: "aliases", label: "Aliases" },
  { key: "faction_affiliation", label: "Faction" },
  { key: "first_appearance", label: "First Appearance" },
  { key: "traits", label: "Traits" },
  { key: "character_status", label: "Status" },
];

const FACTION_FIELDS = [
  { key: "leader", label: "Leader" },
  { key: "territory", label: "Territory" },
  { key: "motto", label: "Motto" },
  { key: "alignment", label: "Alignment" },
];

const LOCATION_FIELDS = [
  { key: "region", label: "Region" },
  { key: "climate", label: "Climate / Environment" },
  { key: "controlling_faction", label: "Controlling Faction" },
  { key: "notable_residents", label: "Notable Residents" },
];

const EVENT_FIELDS = [
  { key: "date_era", label: "Date / Era" },
  { key: "location", label: "Location" },
  { key: "key_participants", label: "Key Participants" },
  { key: "outcome", label: "Outcome" },
];

const ITEM_FIELDS = [
  { key: "item_type", label: "Item Type" },
  { key: "current_holder", label: "Current Holder" },
  { key: "origin", label: "Origin" },
  { key: "powers", label: "Powers / Properties" },
];

const METADATA_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
  character: CHARACTER_FIELDS,
  faction: FACTION_FIELDS,
  location: LOCATION_FIELDS,
  event: EVENT_FIELDS,
  item: ITEM_FIELDS,
};

export default function LoreEntryPage({
  entry,
  universe,
  crossReferences,
}: LoreEntryPageProps) {
  const Icon = TYPE_ICONS[entry.entry_type] || Sparkles;
  const typeLabel = TYPE_LABELS[entry.entry_type] || entry.entry_type;
  const metadata = (entry.metadata || {}) as Record<string, unknown>;
  const fields = METADATA_FIELDS[entry.entry_type] || [];

  const allRefs = [
    ...crossReferences.forward,
    ...crossReferences.reverse,
  ];

  // Deduplicate by entryId
  const uniqueRefs = allRefs.filter(
    (ref, idx, arr) => arr.findIndex((r) => r.entryId === ref.entryId) === idx
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-foreground-subtle">
        <a
          href={`/universe/${universe.slug}`}
          className="transition-colors hover:text-gold"
        >
          {universe.title}
        </a>
        <span>/</span>
        <a
          href={`/u/${universe.slug}/lore`}
          className="transition-colors hover:text-gold"
        >
          Lore Bible
        </a>
        <span>/</span>
        <a
          href={`/u/${universe.slug}/lore?type=${entry.entry_type}`}
          className="transition-colors hover:text-gold"
        >
          {typeLabel}s
        </a>
        <span>/</span>
        <span className="text-foreground">{entry.title}</span>
      </nav>

      {/* Mist Zone banner */}
      {entry.is_mist_zone && (
        <div className="mb-6 rounded-lg border border-mist-500/30 bg-mist-500/5 px-4 py-3 text-sm text-mist-400">
          This lore is marked as unexplored — a gap in the world waiting to be
          filled.
        </div>
      )}

      {/* Hero section */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div
          className={`w-full shrink-0 overflow-hidden rounded-lg border sm:w-56 ${
            entry.is_mist_zone ? "border-mist-500/40" : "border-border"
          }`}
        >
          {entry.image_url ? (
            <img
              src={entry.image_url}
              alt={entry.title}
              className="aspect-[16/9] w-full object-cover sm:aspect-square"
            />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center bg-void-900 sm:aspect-square">
              <Icon size={64} className="text-void-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-void-50">
              {entry.title}
            </h1>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm text-foreground-subtle">
              <Icon size={14} />
              {typeLabel}
            </span>
            <Tag label={entry.canon_tier} variant="canon" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Content */}
        <div className="lg:col-span-2">
          {entry.content && (
            <div className="prose max-w-none font-prose text-foreground-muted">
              {entry.content.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i}>{paragraph}</p>
                ) : (
                  <br key={i} />
                )
              )}
            </div>
          )}
          {!entry.content && (
            <p className="text-foreground-subtle italic">
              No content has been written for this entry yet.
            </p>
          )}
        </div>

        {/* Metadata sidebar */}
        {fields.length > 0 && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
              Details
            </h2>
            <dl>
              {fields.map(({ key, label }) => (
                <MetadataField
                  key={key}
                  label={label}
                  value={metadata[key]}
                  universeSlug={universe.slug}
                />
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Cross-references */}
      {uniqueRefs.length > 0 && (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="mb-4 font-display text-lg font-semibold text-void-50">
            Connected Lore
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {uniqueRefs.map((ref) => {
              const RefIcon = TYPE_ICONS[ref.entryType] || Sparkles;
              return (
                <a
                  key={ref.entryId}
                  href={`/u/${universe.slug}/lore/${ref.entryType}/${ref.entrySlug}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-hover"
                >
                  <RefIcon size={20} className="shrink-0 text-void-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {ref.entryTitle}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {ref.fieldLabel}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
