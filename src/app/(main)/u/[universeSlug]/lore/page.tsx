import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoreEntryCard from "@/components/lore/LoreEntryCard";
import LoreTypeNav from "@/components/lore/LoreTypeNav";
import type { LoreEntryType } from "@/lib/types/database";

const VALID_TYPES: LoreEntryType[] = [
  "character",
  "faction",
  "location",
  "event",
  "item",
  "lore",
  "custom",
];

const TYPE_LABELS: Record<string, string> = {
  character: "characters",
  faction: "factions",
  location: "locations",
  event: "events",
  item: "items",
  lore: "lore entries",
  custom: "custom entries",
};

export default async function LoreBiblePage({
  params,
  searchParams,
}: {
  params: Promise<{ universeSlug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { universeSlug } = await params;
  const { type: filterType } = await searchParams;
  const supabase = await createClient();

  // Fetch universe
  const { data: universe } = await supabase
    .from("universes")
    .select("id, slug, title, status, creator_id")
    .eq("slug", universeSlug)
    .single();

  if (!universe) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isCreator = user?.id === universe.creator_id;

  // Only published universes are public (unless creator)
  if (universe.status !== "published" && !isCreator) {
    notFound();
  }

  // Fetch all lore entries for this universe
  const query = supabase
    .from("lore_entries")
    .select(
      "id, entry_type, title, slug, image_url, content, is_mist_zone, canon_tier, status"
    )
    .eq("universe_id", universe.id)
    .order("sort_order", { ascending: true });

  if (!isCreator) {
    query.eq("status", "published");
  }

  const { data: allEntries } = await query;
  const entries = allEntries || [];

  // Build type counts
  const typeCounts: Record<string, number> = {};
  for (const entry of entries) {
    typeCounts[entry.entry_type] = (typeCounts[entry.entry_type] || 0) + 1;
  }

  // Apply filter
  const activeType =
    filterType && VALID_TYPES.includes(filterType as LoreEntryType)
      ? filterType
      : undefined;

  const filtered = activeType
    ? entries.filter((e) => e.entry_type === activeType)
    : entries;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-1.5 text-sm text-foreground-subtle">
            <a
              href={`/universe/${universe.slug}`}
              className="transition-colors hover:text-gold"
            >
              {universe.title}
            </a>
            <span>/</span>
            <span className="text-foreground">Lore Bible</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-void-50 sm:text-3xl">
            {universe.title} — Lore Bible
          </h1>
        </div>
        {isCreator && (
          <a
            href={`/create/universe/${universe.slug}/lore/new`}
            className="inline-flex items-center justify-center rounded-md bg-forge-500 px-4 py-2 text-sm font-medium text-void-950 transition-colors hover:bg-forge-300"
          >
            New Entry
          </a>
        )}
      </div>

      <LoreTypeNav
        universeSlug={universe.slug}
        activeType={activeType}
        typeCounts={typeCounts}
      />

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <LoreEntryCard
              key={entry.id}
              entry={entry}
              universeSlug={universe.slug}
              showType={!activeType}
              isCreator={isCreator}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-8 py-12 text-center">
          <p className="text-foreground-muted">
            {activeType
              ? `No ${TYPE_LABELS[activeType] || "entries"} have been added to this universe yet.`
              : "No lore entries have been added to this universe yet."}
          </p>
        </div>
      )}
    </div>
  );
}
