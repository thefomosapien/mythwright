import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEditForm from "./ProfileEditForm";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Only the owner can edit
  if (profile.id !== user.id) {
    redirect(`/profile/${username}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 font-display text-2xl font-bold text-void-50">
        Edit Profile
      </h1>
      <ProfileEditForm profile={profile} />
    </div>
  );
}
