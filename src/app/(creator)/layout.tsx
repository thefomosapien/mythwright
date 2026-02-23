import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_onboarded) {
    redirect("/onboarding");
  }

  return (
    <>
      <MainNav />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  );
}
