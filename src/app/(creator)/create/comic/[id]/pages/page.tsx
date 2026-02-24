import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageManager from "./PageManager";

export default async function ComicPagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: comicId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user owns this comic
  const { data: comic } = await supabase
    .from("comics")
    .select("id, title, slug, status, universe_id, creator_id, page_count")
    .eq("id", comicId)
    .single();

  if (!comic || comic.creator_id !== user.id) {
    redirect("/create");
  }

  // Get universe slug for redirect after publish
  const { data: universe } = await supabase
    .from("universes")
    .select("id, slug, status")
    .eq("id", comic.universe_id)
    .single();

  // Get existing pages
  const { data: pages } = await supabase
    .from("comic_pages")
    .select("id, page_number, image_url, thumbnail_url, width, height")
    .eq("comic_id", comicId)
    .order("page_number", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{comic.title}</h1>
        <p className="mt-1 text-foreground-muted">
          Manage pages &middot;{" "}
          <span className={comic.status === "published" ? "text-success" : ""}>
            {comic.status}
          </span>
        </p>
      </div>

      <PageManager
        comicId={comic.id}
        comicTitle={comic.title}
        comicStatus={comic.status}
        universeId={universe?.id || ""}
        universeSlug={universe?.slug || ""}
        universeStatus={universe?.status || "draft"}
        initialPages={pages || []}
      />
    </div>
  );
}
