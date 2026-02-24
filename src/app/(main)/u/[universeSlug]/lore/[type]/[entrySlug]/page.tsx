import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoreEntryPageComponent from "@/components/lore/LoreEntryPage";
import ReportButton from "@/components/ui/ReportButton";
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

  if (!VALID_TYPES.includes(type as LoreEntryType)) {
    notFound();
  }

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

  if (universe.status !== "published" && !isCreator) {
    notFound();
  }

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

  if (entry.status !== "published" && !isCreator) {
    notFound();
  }

  const crossReferences = await getAllCrossReferences(supabase, {
    id: entry.id,
    entry_type: entry.entry_type,
    universe_id: entry.universe_id,
    metadata: entry.metadata as Record<string, unknown> | null,
  });

  return (
    <div>
      <LoreEntryPageComponent
        entry={entry as LoreEntry}
        universe={{ slug: universe.slug, title: universe.title }}
        crossReferences={crossReferences}
      />
      {user && !isCreator && (
        <div className="mx-auto max-w-4xl px-4 pb-8">
          <div className="flex items-center gap-2 text-sm text-void-400">
            <ReportButton targetType="lore_entry" targetId={entry.id} />
            <span>Report this entry</span>
          </div>
        </div>
      )}
    </div>
  );
}
