import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: comicId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns this comic
  const { data: comic } = await supabase
    .from("comics")
    .select("id, creator_id")
    .eq("id", comicId)
    .single();

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }

  if (comic.creator_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { pageIds } = body as { pageIds: string[] };

  if (!Array.isArray(pageIds) || pageIds.length === 0) {
    return NextResponse.json(
      { error: "pageIds array is required" },
      { status: 400 }
    );
  }

  // Update each page's page_number based on its index in the array
  const updates = pageIds.map((pageId, index) =>
    supabase
      .from("comic_pages")
      .update({ page_number: index + 1 })
      .eq("id", pageId)
      .eq("comic_id", comicId)
  );

  const results = await Promise.all(updates);

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json(
      { error: `Reorder failed: ${failed.error.message}` },
      { status: 500 }
    );
  }

  // Update page_count on the comic
  await supabase
    .from("comics")
    .update({ page_count: pageIds.length })
    .eq("id", comicId);

  return NextResponse.json({ success: true });
}
