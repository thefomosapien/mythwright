import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoreEntryForm from "@/components/lore/LoreEntryForm";

export default async function NewLoreEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
          <span className="text-foreground">New Lore Entry</span>
        </nav>
        <h1 className="font-display text-3xl font-bold text-void-50">
          New Lore Entry
        </h1>
      </div>

      <LoreEntryForm
        universeId={universe.id}
        universeSlug={universe.slug}
        universeStatus={universe.status}
      />
    </div>
  );
}
