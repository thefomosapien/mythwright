import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LoreEntryType, LoreCanonTier } from "@/lib/types/database";

const VALID_ENTRY_TYPES: LoreEntryType[] = [
  "character",
  "faction",
  "location",
  "event",
  "item",
  "lore",
  "custom",
];

const VALID_CANON_TIERS: LoreCanonTier[] = [
  "canon",
  "community-approved",
  "community",
  "fan-alt",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    universeId,
    entryType,
    title,
    content,
    imageUrl,
    metadata,
    status,
    isMistZone,
    canonTier,
  } = body as {
    universeId: string;
    entryType: LoreEntryType;
    title: string;
    content?: string;
    imageUrl?: string;
    metadata?: Record<string, unknown>;
    status?: string;
    isMistZone?: boolean;
    canonTier?: LoreCanonTier;
  };

  // Validate entry type
  if (!entryType || !VALID_ENTRY_TYPES.includes(entryType)) {
    return NextResponse.json(
      { error: "Invalid entry type" },
      { status: 400 }
    );
  }

  // Validate title
  if (!title || title.trim().length === 0 || title.trim().length > 200) {
    return NextResponse.json(
      { error: "Title is required (1-200 characters)" },
      { status: 400 }
    );
  }

  // Validate content length
  if (content && content.length > 10000) {
    return NextResponse.json(
      { error: "Content must be 10,000 characters or fewer" },
      { status: 400 }
    );
  }

  // Validate canon tier
  if (canonTier && !VALID_CANON_TIERS.includes(canonTier)) {
    return NextResponse.json(
      { error: "Invalid canon tier" },
      { status: 400 }
    );
  }

  // Verify user owns the universe
  const { data: universe } = await supabase
    .from("universes")
    .select("id, creator_id, content_rating")
    .eq("id", universeId)
    .single();

  if (!universe) {
    return NextResponse.json(
      { error: "Universe not found" },
      { status: 404 }
    );
  }

  if (universe.creator_id !== user.id) {
    return NextResponse.json(
      { error: "You do not own this universe" },
      { status: 403 }
    );
  }

  // Generate slug, ensure uniqueness within (universe_id, entry_type)
  let baseSlug = slugify(title.trim());
  if (!baseSlug) baseSlug = "entry";
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const { data: existing } = await supabase
      .from("lore_entries")
      .select("id")
      .eq("universe_id", universeId)
      .eq("entry_type", entryType)
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;

    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  // Get next sort_order
  const { count } = await supabase
    .from("lore_entries")
    .select("id", { count: "exact", head: true })
    .eq("universe_id", universeId);

  const sortOrder = (count ?? 0) + 1;

  const entryStatus = status === "published" ? "published" : "draft";

  const { data: entry, error: insertError } = await supabase
    .from("lore_entries")
    .insert({
      universe_id: universeId,
      creator_id: user.id,
      entry_type: entryType,
      title: title.trim(),
      slug,
      content: content?.trim() || null,
      image_url: imageUrl || null,
      metadata: metadata || null,
      sort_order: sortOrder,
      status: entryStatus,
      is_mist_zone: isMistZone ?? false,
      canon_tier: canonTier || "canon",
    })
    .select("id, slug")
    .single();

  if (insertError || !entry) {
    return NextResponse.json(
      { error: `Failed to create entry: ${insertError?.message}` },
      { status: 500 }
    );
  }

  // If published, log content_event
  if (entryStatus === "published") {
    await supabase.from("content_events").insert({
      actor_id: user.id,
      event_type: "published",
      target_type: "lore_entry",
      target_id: entry.id,
    });
  }

  return NextResponse.json({
    entryId: entry.id,
    slug: entry.slug,
  });
}
