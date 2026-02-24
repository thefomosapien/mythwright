import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ContentRating } from "@/lib/types/database";

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
    title,
    description,
    coverImageUrl,
    contentRating,
    universeId,
  } = body as {
    title: string;
    description?: string;
    coverImageUrl?: string;
    contentRating: ContentRating;
    universeId?: string;
  };

  if (!title || title.trim().length === 0 || title.trim().length > 200) {
    return NextResponse.json(
      { error: "Title is required (1-200 characters)" },
      { status: 400 }
    );
  }

  if (!contentRating || !["E", "T", "M"].includes(contentRating)) {
    return NextResponse.json(
      { error: "Content rating is required (E, T, or M)" },
      { status: 400 }
    );
  }

  let targetUniverseId: string;

  if (universeId) {
    // Verify user owns this universe
    const { data: universe } = await supabase
      .from("universes")
      .select("id")
      .eq("id", universeId)
      .eq("creator_id", user.id)
      .single();

    if (!universe) {
      return NextResponse.json(
        { error: "Universe not found or you don't own it" },
        { status: 403 }
      );
    }

    targetUniverseId = universe.id;
  } else {
    // Check if user has existing universes
    const { data: existingUniverses } = await supabase
      .from("universes")
      .select("id")
      .eq("creator_id", user.id);

    if (existingUniverses && existingUniverses.length > 0) {
      return NextResponse.json(
        {
          error: "You have existing universes. Please select one for your comic.",
          requiresUniverse: true,
        },
        { status: 400 }
      );
    }

    // Auto-create universe
    const universeSlug = `${slugify(title.trim())}-${Date.now().toString(36)}`;
    const { data: newUniverse, error: universeError } = await supabase
      .from("universes")
      .insert({
        creator_id: user.id,
        title: title.trim(),
        slug: universeSlug,
        content_rating: contentRating,
        status: "draft",
        contribution_mode: "closed",
        universe_license_type: "all-rights-reserved",
        genre: [],
      })
      .select("id")
      .single();

    if (universeError || !newUniverse) {
      return NextResponse.json(
        { error: `Failed to create universe: ${universeError?.message}` },
        { status: 500 }
      );
    }

    targetUniverseId = newUniverse.id;
  }

  // Check if this is the first comic in the universe
  const { count } = await supabase
    .from("comics")
    .select("id", { count: "exact", head: true })
    .eq("universe_id", targetUniverseId);

  const isOrigin = (count ?? 0) === 0;
  const sortOrder = (count ?? 0) + 1;

  const comicSlug = `${slugify(title.trim())}-${Date.now().toString(36)}`;

  const { data: comic, error: comicError } = await supabase
    .from("comics")
    .insert({
      universe_id: targetUniverseId,
      creator_id: user.id,
      slug: comicSlug,
      title: title.trim(),
      description: description?.trim() || null,
      cover_image_url: coverImageUrl || null,
      content_rating: contentRating,
      sort_order: sortOrder,
      status: "draft",
      is_origin: isOrigin,
      canon_status: "canon",
    })
    .select("id")
    .single();

  if (comicError || !comic) {
    return NextResponse.json(
      { error: `Failed to create comic: ${comicError?.message}` },
      { status: 500 }
    );
  }

  // Increment universe comic_count
  const { data: uni } = await supabase
    .from("universes")
    .select("comic_count")
    .eq("id", targetUniverseId)
    .single();
  if (uni) {
    await supabase
      .from("universes")
      .update({ comic_count: uni.comic_count + 1 })
      .eq("id", targetUniverseId);
  }

  return NextResponse.json({
    comicId: comic.id,
    universeId: targetUniverseId,
  });
}
