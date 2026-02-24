import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCoverImage } from "@/lib/image/normalize";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const type = formData.get("type") as "avatar" | "cover" | "banner" | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!type || !["avatar", "cover", "banner"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be avatar, cover, or banner." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let normalized;
  try {
    normalized = await normalizeCoverImage(buffer, type, file.type);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image processing failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const basePath = `${type}s/${user.id}/${timestamp}-${rand}`;

  const { error: fullErr } = await supabase.storage
    .from("uploads")
    .upload(`${basePath}.webp`, normalized.buffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (fullErr) {
    return NextResponse.json(
      { error: `Upload failed: ${fullErr.message}` },
      { status: 500 }
    );
  }

  const { error: thumbErr } = await supabase.storage
    .from("uploads")
    .upload(`${basePath}-thumb.webp`, normalized.thumbnailBuffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (thumbErr) {
    return NextResponse.json(
      { error: `Thumbnail upload failed: ${thumbErr.message}` },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl: imageUrl },
  } = supabase.storage.from("uploads").getPublicUrl(`${basePath}.webp`);

  const {
    data: { publicUrl: thumbnailUrl },
  } = supabase.storage.from("uploads").getPublicUrl(`${basePath}-thumb.webp`);

  return NextResponse.json({
    imageUrl,
    thumbnailUrl,
    width: normalized.width,
    height: normalized.height,
  });
}
