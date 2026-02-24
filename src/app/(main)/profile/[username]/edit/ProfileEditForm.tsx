"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import ImageUpload from "@/components/ui/ImageUpload";

interface ProfileEditFormProps {
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
  };
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatar_url
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  async function handleSave() {
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    setError(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/profile/${profile.username}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div>
        <label className="mb-2 block text-sm font-medium text-void-200">
          Avatar
        </label>
        <div className="max-w-[200px]">
          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            aspect="1:1"
            maxSizeMB={2}
            bucket="avatars"
            path={profile.id}
          />
        </div>
      </div>

      {/* Username (read-only) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-void-200">
          Username
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={`@${profile.username}`}
            disabled
            className="w-full rounded-md border border-void-700 bg-void-800 px-3 py-2 text-void-400 cursor-not-allowed"
          />
        </div>
        <p className="mt-1 text-xs text-void-400">
          Usernames cannot be changed after onboarding.
        </p>
      </div>

      {/* Display Name */}
      <Input
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={60}
        placeholder="Your display name"
      />

      {/* Bio */}
      <TextArea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
        showCount
        rows={4}
        placeholder="Tell us about yourself..."
      />

      {error && <p className="text-sm text-ember-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          isLoading={saving}
        >
          Save Changes
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push(`/profile/${profile.username}`)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
