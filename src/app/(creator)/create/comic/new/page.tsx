import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ComicCreateForm from "./ComicCreateForm";

export default async function NewComicPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "reader") {
    redirect("/create");
  }

  // Fetch creator's universes for the selector
  const { data: universes } = await supabase
    .from("universes")
    .select("id, slug, title, status")
    .eq("creator_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-foreground">New Comic</h1>
      <p className="mb-8 text-foreground-muted">
        Create a new comic. You can upload pages after creating it.
      </p>
      <ComicCreateForm universes={universes || []} />
    </div>
  );
}
