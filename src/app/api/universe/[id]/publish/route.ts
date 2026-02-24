import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: universeId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns this universe
  const { data: universe } = await supabase
    .from("universes")
    .select("id, creator_id, status")
    .eq("id", universeId)
    .single();

  if (!universe) {
    return NextResponse.json(
      { error: "Universe not found" },
      { status: 404 }
    );
  }

  if (universe.creator_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate universe has at least one published comic
  const { count } = await supabase
    .from("comics")
    .select("id", { count: "exact", head: true })
    .eq("universe_id", universeId)
    .eq("status", "published");

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "Universe must have at least one published comic before publishing" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("universes")
    .update({ status: "published" })
    .eq("id", universeId);

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to publish: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
