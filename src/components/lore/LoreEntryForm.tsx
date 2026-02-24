"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import type { LoreEntryType, LoreCanonTier, LoreEntry } from "@/lib/types/database";

// ============================================================================
// Types
// ============================================================================

interface LoreEntryFormProps {
  universeId: string;
  universeSlug: string;
  universeStatus: string;
  /** If editing, the existing entry data */
  existingEntry?: LoreEntry | null;
}

interface LoreRef {
  entry_id: string;
  entry_title: string;
  entry_slug: string;
  entry_type: string;
}

interface LoreOption {
  id: string;
  title: string;
  slug: string;
  entry_type: string;
}

// ============================================================================
// Constants
// ============================================================================

const ENTRY_TYPES: { value: LoreEntryType; label: string }[] = [
  { value: "character", label: "Character" },
  { value: "faction", label: "Faction" },
  { value: "location", label: "Location" },
  { value: "event", label: "Event" },
  { value: "item", label: "Item" },
  { value: "lore", label: "Lore" },
  { value: "custom", label: "Custom" },
];

const CANON_TIERS: { value: LoreCanonTier; label: string }[] = [
  { value: "canon", label: "Canon" },
  { value: "community-approved", label: "Community Approved" },
  { value: "community", label: "Community" },
  { value: "fan-alt", label: "Fan Alt" },
];

const CHARACTER_STATUSES = ["active", "deceased", "unknown", "missing"];
const ITEM_TYPES = ["weapon", "artifact", "document", "tool", "other"];

// ============================================================================
// SearchableDropdown — simple filtered list
// ============================================================================

function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Search or type...",
}: {
  label: string;
  options: LoreOption[];
  value: LoreRef | string | null;
  onChange: (val: LoreRef | string | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const displayValue = value
    ? typeof value === "string"
      ? value
      : value.entry_title
    : "";

  const filtered = options.filter((o) =>
    o.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-foreground-muted">
        {label}
      </label>
      <input
        type="text"
        value={open ? query : displayValue}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery(displayValue);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          // If typing free text, store as string
          onChange(e.target.value || null);
        }}
        onBlur={() => {
          // Delay to allow click on option
          setTimeout(() => setOpen(false), 200);
        }}
        className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-void-800 shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange({
                  entry_id: opt.id,
                  entry_title: opt.title,
                  entry_slug: opt.slug,
                  entry_type: opt.entry_type,
                });
                setQuery(opt.title);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
            >
              {opt.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MultiSearchableDropdown — for multi-select references
// ============================================================================

function MultiSearchableDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: LoreOption[];
  value: LoreRef[];
  onChange: (val: LoreRef[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedIds = new Set(value.map((v) => v.entry_id));
  const filtered = options.filter(
    (o) =>
      o.title.toLowerCase().includes(query.toLowerCase()) &&
      !selectedIds.has(o.id)
  );

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-foreground-muted">
        {label}
      </label>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((ref) => (
            <span
              key={ref.entry_id}
              className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold"
            >
              {ref.entry_title}
              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((v) => v.entry_id !== ref.entry_id))
                }
                className="ml-0.5 rounded-full p-0.5 hover:bg-white/10"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={query}
        placeholder="Search to add..."
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-void-800 shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange([
                  ...value,
                  {
                    entry_id: opt.id,
                    entry_title: opt.title,
                    entry_slug: opt.slug,
                    entry_type: opt.entry_type,
                  },
                ]);
                setQuery("");
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
            >
              {opt.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main form
// ============================================================================

export default function LoreEntryForm({
  universeId,
  universeSlug,
  universeStatus,
  existingEntry,
}: LoreEntryFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const isEditing = !!existingEntry;

  // Common fields
  const [entryType, setEntryType] = useState<LoreEntryType>(
    existingEntry?.entry_type || "character"
  );
  const [title, setTitle] = useState(existingEntry?.title || "");
  const [content, setContent] = useState(existingEntry?.content || "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    existingEntry?.image_url || null
  );
  const [status, setStatus] = useState<"draft" | "published">(
    existingEntry?.status || "draft"
  );
  const [canonTier, setCanonTier] = useState<LoreCanonTier>(
    existingEntry?.canon_tier || "canon"
  );
  const [isMistZone, setIsMistZone] = useState(
    existingEntry?.is_mist_zone || false
  );

  // Metadata fields — stored as individual state, assembled on submit
  const existingMeta = (existingEntry?.metadata || {}) as Record<string, unknown>;

  // Character
  const [aliases, setAliases] = useState((existingMeta.aliases as string) || "");
  const [factionAffiliation, setFactionAffiliation] = useState<LoreRef | string | null>(
    (existingMeta.faction_affiliation as LoreRef | string) || null
  );
  const [firstAppearance, setFirstAppearance] = useState<LoreRef | string | null>(
    (existingMeta.first_appearance as LoreRef | string) || null
  );
  const [traits, setTraits] = useState((existingMeta.traits as string) || "");
  const [characterStatus, setCharacterStatus] = useState(
    (existingMeta.character_status as string) || "active"
  );

  // Faction
  const [leader, setLeader] = useState<LoreRef | string | null>(
    (existingMeta.leader as LoreRef | string) || null
  );
  const [territory, setTerritory] = useState<LoreRef | string | null>(
    (existingMeta.territory as LoreRef | string) || null
  );
  const [motto, setMotto] = useState((existingMeta.motto as string) || "");
  const [alignment, setAlignment] = useState(
    (existingMeta.alignment as string) || ""
  );

  // Location
  const [region, setRegion] = useState((existingMeta.region as string) || "");
  const [climate, setClimate] = useState((existingMeta.climate as string) || "");
  const [controllingFaction, setControllingFaction] = useState<LoreRef | string | null>(
    (existingMeta.controlling_faction as LoreRef | string) || null
  );
  const [notableResidents, setNotableResidents] = useState<LoreRef[]>(
    (existingMeta.notable_residents as LoreRef[]) || []
  );

  // Event
  const [dateEra, setDateEra] = useState((existingMeta.date_era as string) || "");
  const [eventLocation, setEventLocation] = useState<LoreRef | string | null>(
    (existingMeta.location as LoreRef | string) || null
  );
  const [keyParticipants, setKeyParticipants] = useState<LoreRef[]>(
    (existingMeta.key_participants as LoreRef[]) || []
  );
  const [outcome, setOutcome] = useState((existingMeta.outcome as string) || "");

  // Item
  const [itemType, setItemType] = useState(
    (existingMeta.item_type as string) || "weapon"
  );
  const [currentHolder, setCurrentHolder] = useState<LoreRef | string | null>(
    (existingMeta.current_holder as LoreRef | string) || null
  );
  const [origin, setOrigin] = useState((existingMeta.origin as string) || "");
  const [powers, setPowers] = useState((existingMeta.powers as string) || "");

  // Reference options — fetched from DB
  const [characterOptions, setCharacterOptions] = useState<LoreOption[]>([]);
  const [factionOptions, setFactionOptions] = useState<LoreOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<LoreOption[]>([]);
  const [comicOptions, setComicOptions] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reference options
  const loadOptions = useCallback(async () => {
    const [chars, facs, locs, comics] = await Promise.all([
      supabase
        .from("lore_entries")
        .select("id, title, slug, entry_type")
        .eq("universe_id", universeId)
        .eq("entry_type", "character")
        .order("title"),
      supabase
        .from("lore_entries")
        .select("id, title, slug, entry_type")
        .eq("universe_id", universeId)
        .eq("entry_type", "faction")
        .order("title"),
      supabase
        .from("lore_entries")
        .select("id, title, slug, entry_type")
        .eq("universe_id", universeId)
        .eq("entry_type", "location")
        .order("title"),
      supabase
        .from("comics")
        .select("id, title, slug")
        .eq("universe_id", universeId)
        .eq("status", "published")
        .order("title"),
    ]);

    setCharacterOptions(chars.data || []);
    setFactionOptions(facs.data || []);
    setLocationOptions(locs.data || []);
    setComicOptions(comics.data || []);
  }, [supabase, universeId]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  function buildMetadata(): Record<string, unknown> | null {
    switch (entryType) {
      case "character":
        return {
          aliases: aliases || null,
          faction_affiliation: factionAffiliation || null,
          first_appearance: firstAppearance || null,
          traits: traits || null,
          character_status: characterStatus || null,
        };
      case "faction":
        return {
          leader: leader || null,
          territory: territory || null,
          motto: motto || null,
          alignment: alignment || null,
        };
      case "location":
        return {
          region: region || null,
          climate: climate || null,
          controlling_faction: controllingFaction || null,
          notable_residents:
            notableResidents.length > 0 ? notableResidents : null,
        };
      case "event":
        return {
          date_era: dateEra || null,
          location: eventLocation || null,
          key_participants:
            keyParticipants.length > 0 ? keyParticipants : null,
          outcome: outcome || null,
        };
      case "item":
        return {
          item_type: itemType || null,
          current_holder: currentHolder || null,
          origin: origin || null,
          powers: powers || null,
        };
      case "lore":
      case "custom":
        return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (title.trim().length > 200) {
      setError("Title must be 200 characters or fewer.");
      return;
    }

    if (content && content.length > 10000) {
      setError("Content must be 10,000 characters or fewer.");
      return;
    }

    setSaving(true);

    const metadata = buildMetadata();

    if (isEditing && existingEntry) {
      const res = await fetch(`/api/lore/${existingEntry.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryType,
          title: title.trim(),
          content: content || null,
          imageUrl: imageUrl,
          metadata,
          status,
          isMistZone,
          canonTier,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update entry.");
        setSaving(false);
        return;
      }

      router.push(`/u/${universeSlug}/lore/${entryType}/${data.slug}`);
    } else {
      const res = await fetch("/api/lore/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universeId,
          entryType,
          title: title.trim(),
          content: content || null,
          imageUrl: imageUrl,
          metadata,
          status,
          isMistZone,
          canonTier,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create entry.");
        setSaving(false);
        return;
      }

      router.push(`/u/${universeSlug}/lore/${entryType}/${data.slug}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Entry Type */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground-muted">
          Entry Type *
        </label>
        <div className="flex flex-wrap gap-2">
          {ENTRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setEntryType(t.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                entryType === t.value
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-border text-foreground-muted hover:border-border-hover"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <Input
        label="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder="Entry title"
      />

      {/* Content */}
      <TextArea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={10000}
        showCount
        rows={8}
        placeholder="Main body text for this lore entry..."
      />

      {/* Image */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground-muted">
          Image
        </label>
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          aspect="16:9"
          bucket="uploads"
          path="lore"
        />
      </div>

      {/* Status and Canon Tier */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          {status === "published" && universeStatus !== "published" && (
            <p className="mt-1 text-xs text-amber">
              Publish your universe first to make lore entries visible.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-muted">
            Canon Tier
          </label>
          <select
            value={canonTier}
            onChange={(e) => setCanonTier(e.target.value as LoreCanonTier)}
            className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            {CANON_TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background-secondary px-3 py-2 transition-colors hover:border-border-hover">
            <input
              type="checkbox"
              checked={isMistZone}
              onChange={(e) => setIsMistZone(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-mist-500"
            />
            <span className="text-sm text-foreground">Mist Zone</span>
          </label>
        </div>
      </div>

      {/* Type-specific fields */}
      {entryType === "character" && (
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground-subtle">
            Character Details
          </legend>
          <Input
            label="Aliases"
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            placeholder="Comma-separated aliases"
          />
          <SearchableDropdown
            label="Faction Affiliation"
            options={factionOptions}
            value={factionAffiliation}
            onChange={setFactionAffiliation}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground-muted">
              First Appearance
            </label>
            <select
              value={
                firstAppearance && typeof firstAppearance === "object"
                  ? firstAppearance.entry_id
                  : ""
              }
              onChange={(e) => {
                const comic = comicOptions.find((c) => c.id === e.target.value);
                if (comic) {
                  setFirstAppearance({
                    entry_id: comic.id,
                    entry_title: comic.title,
                    entry_slug: comic.slug,
                    entry_type: "comic",
                  });
                } else {
                  setFirstAppearance(null);
                }
              }}
              className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="">Select a comic...</option>
              {comicOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Traits"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="Comma-separated traits"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground-muted">
              Status
            </label>
            <select
              value={characterStatus}
              onChange={(e) => setCharacterStatus(e.target.value)}
              className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {CHARACTER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
      )}

      {entryType === "faction" && (
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground-subtle">
            Faction Details
          </legend>
          <SearchableDropdown
            label="Leader"
            options={characterOptions}
            value={leader}
            onChange={setLeader}
          />
          <SearchableDropdown
            label="Territory"
            options={locationOptions}
            value={territory}
            onChange={setTerritory}
          />
          <Input
            label="Motto"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Faction motto or creed"
          />
          <Input
            label="Alignment"
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            placeholder="e.g., heroic, villainous, neutral, ambiguous"
          />
        </fieldset>
      )}

      {entryType === "location" && (
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground-subtle">
            Location Details
          </legend>
          <Input
            label="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Region or area name"
          />
          <Input
            label="Climate / Environment"
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            placeholder="e.g., temperate forest, arctic tundra"
          />
          <SearchableDropdown
            label="Controlling Faction"
            options={factionOptions}
            value={controllingFaction}
            onChange={setControllingFaction}
          />
          <MultiSearchableDropdown
            label="Notable Residents"
            options={characterOptions}
            value={notableResidents}
            onChange={setNotableResidents}
          />
        </fieldset>
      )}

      {entryType === "event" && (
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground-subtle">
            Event Details
          </legend>
          <Input
            label="Date / Era"
            value={dateEra}
            onChange={(e) => setDateEra(e.target.value)}
            placeholder="Narrative time, not real time"
          />
          <SearchableDropdown
            label="Location"
            options={locationOptions}
            value={eventLocation}
            onChange={setEventLocation}
          />
          <MultiSearchableDropdown
            label="Key Participants"
            options={characterOptions}
            value={keyParticipants}
            onChange={setKeyParticipants}
          />
          <Input
            label="Outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="What resulted from this event"
          />
        </fieldset>
      )}

      {entryType === "item" && (
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-medium text-foreground-subtle">
            Item Details
          </legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground-muted">
              Item Type
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <SearchableDropdown
            label="Current Holder"
            options={characterOptions}
            value={currentHolder}
            onChange={setCurrentHolder}
          />
          <Input
            label="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Where this item came from"
          />
          <Input
            label="Powers / Properties"
            value={powers}
            onChange={(e) => setPowers(e.target.value)}
            placeholder="Abilities or notable properties"
          />
        </fieldset>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <Button variant="primary" size="lg" type="submit" isLoading={saving}>
          {isEditing ? "Save Changes" : "Create Entry"}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() =>
            router.push(`/create/universe/${universeSlug}/edit`)
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
