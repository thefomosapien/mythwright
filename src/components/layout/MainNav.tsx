import { createClient } from "@/lib/supabase/server";
import NavBar from "./NavBar";

export default async function MainNav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  return <NavBar user={user ? { id: user.id } : null} profile={profile} />;
}
