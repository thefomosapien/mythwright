import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoreEntryForm from "@/components/lore/LoreEntryForm";
import type { LoreEntry } from "@/lib/types/database";

export default async function EditLoreEntryPage({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}) {
  const { slug, entrySlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user owns this universe
  const { data: universe } = await supabase
    .from("universes")
    .select("id, slug, title, status")
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .single();

  if (!universe) {
    redirect("/create");
  }

  // Fetch the lore entry
  const { data: entry } = await supabase
    .from("lore_entries")
    .select("*")
    .eq("universe_id", universe.id)
    .eq("slug", entrySlug)
    .single();

  if (!entry) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-foreground-subtle">
          <a
            href={`/create/universe/${slug}/edit`}
            className="transition-colors hover:text-gold"
          >
            {universe.title}
          </a>
          <span>/</span>
          <a
            href={`/u/${slug}/lore/${entry.entry_type}/${entry.slug}`}
            className="transition-colors hover:text-gold"
          >
            {entry.title}
          </a>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </nav>
        <h1 className="font-display text-3xl font-bold text-void-50">
          Edit Lore Entry
        </h1>
      </div>

      <LoreEntryForm
        universeId={universe.id}
        universeSlug={universe.slug}
        universeStatus={universe.status}
        existingEntry={entry as LoreEntry}
      />
    </div>
  );
}
