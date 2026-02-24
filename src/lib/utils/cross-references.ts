import type { SupabaseClient } from "@supabase/supabase-js";

export interface CrossReference {
  fieldLabel: string;
  entryId: string;
  entryTitle: string;
  entrySlug: string;
  entryType: string;
}

// Fields in metadata that can contain references to other lore entries.
// Each reference is stored as { entry_id, entry_title, entry_slug, entry_type }.
const REFERENCE_FIELDS: Record<string, string> = {
  faction_affiliation: "Faction",
  first_appearance: "First Appearance",
  leader: "Leader",
  territory: "Territory",
  controlling_faction: "Controlling Faction",
  current_holder: "Current Holder",
  location: "Location",
};

// Multi-reference fields (arrays of references)
const MULTI_REFERENCE_FIELDS: Record<string, string> = {
  notable_residents: "Notable Residents",
  key_participants: "Key Participants",
};

// For reverse lookups: which metadata field references which entry type
const REVERSE_LOOKUP_MAP: Record<string, { field: string; label: string }[]> = {
  faction: [
    { field: "faction_affiliation", label: "Members" },
    { field: "controlling_faction", label: "Controlled Locations" },
  ],
  character: [
    { field: "leader", label: "Leads" },
    { field: "current_holder", label: "Held Items" },
    { field: "notable_residents", label: "Resides In" },
    { field: "key_participants", label: "Participated In" },
  ],
  location: [
    { field: "territory", label: "Faction Territory" },
    { field: "location", label: "Events Here" },
  ],
};

function extractSingleRef(
  metadata: Record<string, unknown>,
  field: string,
  label: string
): CrossReference | null {
  const ref = metadata[field] as
    | { entry_id?: string; entry_title?: string; entry_slug?: string; entry_type?: string }
    | undefined;
  if (ref?.entry_id) {
    return {
      fieldLabel: label,
      entryId: ref.entry_id,
      entryTitle: ref.entry_title || "Unknown",
      entrySlug: ref.entry_slug || "",
      entryType: ref.entry_type || "",
    };
  }
  return null;
}

function extractMultiRef(
  metadata: Record<string, unknown>,
  field: string,
  label: string
): CrossReference[] {
  const refs = metadata[field] as
    | Array<{ entry_id?: string; entry_title?: string; entry_slug?: string; entry_type?: string }>
    | undefined;
  if (!Array.isArray(refs)) return [];
  return refs
    .filter((r) => r.entry_id)
    .map((r) => ({
      fieldLabel: label,
      entryId: r.entry_id!,
      entryTitle: r.entry_title || "Unknown",
      entrySlug: r.entry_slug || "",
      entryType: r.entry_type || "",
    }));
}

/** Extract all forward references from a lore entry's metadata */
export function getForwardReferences(
  metadata: Record<string, unknown> | null
): CrossReference[] {
  if (!metadata) return [];
  const refs: CrossReference[] = [];

  for (const [field, label] of Object.entries(REFERENCE_FIELDS)) {
    const ref = extractSingleRef(metadata, field, label);
    if (ref) refs.push(ref);
  }

  for (const [field, label] of Object.entries(MULTI_REFERENCE_FIELDS)) {
    refs.push(...extractMultiRef(metadata, field, label));
  }

  return refs;
}

/** Find all entries in this universe that reference the given entry via metadata fields */
export async function getReverseReferences(
  supabase: SupabaseClient,
  entryId: string,
  entryType: string,
  universeId: string
): Promise<CrossReference[]> {
  const lookups = REVERSE_LOOKUP_MAP[entryType];
  if (!lookups || lookups.length === 0) return [];

  const results: CrossReference[] = [];

  for (const { field, label } of lookups) {
    // Single reference fields: metadata->field->>'entry_id' = entryId
    if (REFERENCE_FIELDS[field]) {
      const { data } = await supabase
        .from("lore_entries")
        .select("id, title, slug, entry_type")
        .eq("universe_id", universeId)
        .filter(`metadata->${field}->>entry_id`, "eq", entryId);

      if (data) {
        for (const row of data) {
          results.push({
            fieldLabel: label,
            entryId: row.id,
            entryTitle: row.title,
            entrySlug: row.slug,
            entryType: row.entry_type,
          });
        }
      }
    }

    // Multi-reference fields: need to check if array contains the entry_id
    if (MULTI_REFERENCE_FIELDS[field]) {
      const { data } = await supabase
        .from("lore_entries")
        .select("id, title, slug, entry_type, metadata")
        .eq("universe_id", universeId)
        .not("metadata", "is", null);

      if (data) {
        for (const row of data) {
          const meta = row.metadata as Record<string, unknown>;
          const arr = meta?.[field] as
            | Array<{ entry_id?: string }>
            | undefined;
          if (Array.isArray(arr) && arr.some((r) => r.entry_id === entryId)) {
            results.push({
              fieldLabel: label,
              entryId: row.id,
              entryTitle: row.title,
              entrySlug: row.slug,
              entryType: row.entry_type,
            });
          }
        }
      }
    }
  }

  return results;
}

/** Get all cross-references (forward + reverse) for a lore entry */
export async function getAllCrossReferences(
  supabase: SupabaseClient,
  entry: {
    id: string;
    entry_type: string;
    universe_id: string;
    metadata: Record<string, unknown> | null;
  }
): Promise<{ forward: CrossReference[]; reverse: CrossReference[] }> {
  const forward = getForwardReferences(entry.metadata);
  const reverse = await getReverseReferences(
    supabase,
    entry.id,
    entry.entry_type,
    entry.universe_id
  );

  return { forward, reverse };
}
