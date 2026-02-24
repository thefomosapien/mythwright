import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoreEntryPageComponent from "@/components/lore/LoreEntryPage";
import { getAllCrossReferences } from "@/lib/utils/cross-references";
import type { LoreEntry, LoreEntryType } from "@/lib/types/database";

const VALID_TYPES: LoreEntryType[] = [
  "character",
  "faction",
  "location",
  "event",
  "item",
  "lore",
  "custom",
];

export default async function LoreEntryDetailPage({
  params,
}: {
  params: Promise<{ universeSlug: string; type: string; entrySlug: string }>;
}) {
  const { universeSlug, type, entrySlug } = await params;
  const supabase = await createClient();

  // Validate type
  if (!VALID_TYPES.includes(type as LoreEntryType)) {
    notFound();
  }

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

  // Fetch the lore entry
  const { data: entry } = await supabase
    .from("lore_entries")
    .select("*")
    .eq("universe_id", universe.id)
    .eq("entry_type", type)
    .eq("slug", entrySlug)
    .single();

  if (!entry) {
    notFound();
  }

  // Draft entries only visible to creator
  if (entry.status !== "published" && !isCreator) {
    notFound();
  }

  // Resolve cross-references
  const crossReferences = await getAllCrossReferences(supabase, {
    id: entry.id,
    entry_type: entry.entry_type,
    universe_id: entry.universe_id,
    metadata: entry.metadata as Record<string, unknown> | null,
  });

  return (
    <LoreEntryPageComponent
      entry={entry as LoreEntry}
      universe={{ slug: universe.slug, title: universe.title }}
      crossReferences={crossReferences}
    />
  );
}
