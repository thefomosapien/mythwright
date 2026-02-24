import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportQueue from "./ReportQueue";
import type { ReportStatus } from "@/lib/types/database";

export default async function AdminDashboard() {
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

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch reports with reporter info
  const { data: rawReports } = await supabase
    .from("reports")
    .select(
      "id, target_type, target_id, category, description, status, resolution_note, created_at, profiles!reports_reporter_id_fkey(username, display_name)"
    )
    .order("created_at", { ascending: false });

  const reports = (rawReports || []).map((r) => ({
    id: r.id,
    target_type: r.target_type,
    target_id: r.target_id,
    category: r.category,
    description: r.description,
    status: r.status as ReportStatus,
    resolution_note: r.resolution_note,
    created_at: r.created_at,
    reporter: r.profiles as unknown as {
      username: string;
      display_name: string;
    } | null,
  }));

  // Content overview stats
  const [
    { count: totalUniverses },
    { count: publishedUniverses },
    { count: draftUniverses },
    { count: totalComics },
    { count: totalLore },
    { count: totalUsers },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from("universes").select("*", { count: "exact", head: true }),
    supabase.from("universes").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("universes").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("comics").select("*", { count: "exact", head: true }),
    supabase.from("lore_entries").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    {
      label: "Universes",
      value: totalUniverses ?? 0,
      sub: `${publishedUniverses ?? 0} published / ${draftUniverses ?? 0} draft`,
    },
    { label: "Comics", value: totalComics ?? 0 },
    { label: "Lore Entries", value: totalLore ?? 0 },
    { label: "Users", value: totalUsers ?? 0 },
    {
      label: "Pending Reports",
      value: pendingReports ?? 0,
      highlight: (pendingReports ?? 0) > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-void-50">
        Admin Dashboard
      </h1>

      {/* Content Overview */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-xl font-semibold text-void-50">
          Content Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-4 ${
                stat.highlight
                  ? "border-ember-500/30 bg-ember-500/5"
                  : "border-void-700 bg-void-800"
              }`}
            >
              <p className="text-sm text-void-300">{stat.label}</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  stat.highlight ? "text-ember-400" : "text-void-50"
                }`}
              >
                {stat.value}
              </p>
              {stat.sub && (
                <p className="mt-1 text-xs text-void-400">{stat.sub}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Report Queue */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-void-50">
          Report Queue
        </h2>
        <ReportQueue initialReports={reports} adminId={user.id} />
      </section>
    </div>
  );
}
