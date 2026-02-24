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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: entryId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch existing entry
  const { data: existingEntry } = await supabase
    .from("lore_entries")
    .select("*, universes!inner(creator_id, content_rating, status)")
    .eq("id", entryId)
    .single();

  if (!existingEntry) {
    return NextResponse.json(
      { error: "Entry not found" },
      { status: 404 }
    );
  }

  const universeData = existingEntry.universes as unknown as {
    creator_id: string;
    content_rating: string;
    status: string;
  };

  if (universeData.creator_id !== user.id) {
    return NextResponse.json(
      { error: "You do not own this universe" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    entryType,
    title,
    content,
    imageUrl,
    metadata,
    status,
    isMistZone,
    canonTier,
  } = body as {
    entryType?: LoreEntryType;
    title?: string;
    content?: string | null;
    imageUrl?: string | null;
    metadata?: Record<string, unknown> | null;
    status?: string;
    isMistZone?: boolean;
    canonTier?: LoreCanonTier;
  };

  // Validate entry type if provided
  if (entryType && !VALID_ENTRY_TYPES.includes(entryType)) {
    return NextResponse.json(
      { error: "Invalid entry type" },
      { status: 400 }
    );
  }

  // Validate title if provided
  if (title !== undefined && (title.trim().length === 0 || title.trim().length > 200)) {
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

  // If publishing, verify universe is published
  const newStatus = status === "published" ? "published" : status === "draft" ? "draft" : undefined;
  if (newStatus === "published" && universeData.status !== "published") {
    return NextResponse.json(
      { error: "Publish your universe first to make lore entries visible." },
      { status: 400 }
    );
  }

  // Build slug if title or entry_type changed
  const finalType = entryType || existingEntry.entry_type;
  const finalTitle = title !== undefined ? title.trim() : existingEntry.title;
  let slug = existingEntry.slug;

  if (title !== undefined || entryType !== undefined) {
    let baseSlug = slugify(finalTitle);
    if (!baseSlug) baseSlug = "entry";
    slug = baseSlug;
    let attempt = 0;

    while (true) {
      const { data: existing } = await supabase
        .from("lore_entries")
        .select("id")
        .eq("universe_id", existingEntry.universe_id)
        .eq("entry_type", finalType)
        .eq("slug", slug)
        .neq("id", entryId)
        .maybeSingle();

      if (!existing) break;

      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }
  }

  // Track if transitioning to published
  const wasPublished = existingEntry.status === "published";
  const isNowPublished = newStatus === "published";

  const updateData: Record<string, unknown> = { slug, updated_at: new Date().toISOString() };
  if (entryType) updateData.entry_type = entryType;
  if (title !== undefined) updateData.title = finalTitle;
  if (content !== undefined) updateData.content = content?.trim() || null;
  if (imageUrl !== undefined) updateData.image_url = imageUrl;
  if (metadata !== undefined) updateData.metadata = metadata;
  if (newStatus) updateData.status = newStatus;
  if (isMistZone !== undefined) updateData.is_mist_zone = isMistZone;
  if (canonTier) updateData.canon_tier = canonTier;

  const { error: updateError } = await supabase
    .from("lore_entries")
    .update(updateData)
    .eq("id", entryId);

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to update: ${updateError.message}` },
      { status: 500 }
    );
  }

  // Log publish event if transitioning from non-published to published
  if (!wasPublished && isNowPublished) {
    await supabase.from("content_events").insert({
      actor_id: user.id,
      event_type: "published",
      target_type: "lore_entry",
      target_id: entryId,
    });
  }

  return NextResponse.json({
    entryId,
    slug,
  });
}
