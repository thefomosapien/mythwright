"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

interface FollowButtonProps {
  universeId: string;
  initialFollowing: boolean;
}

export default function FollowButton({
  universeId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function handleToggle() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    if (following) {
      await supabase
        .from("universe_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("universe_id", universeId);
      setFollowing(false);
    } else {
      await supabase.from("universe_follows").insert({
        user_id: user.id,
        universe_id: universeId,
      });
      setFollowing(true);
    }

    setLoading(false);
  }

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="md"
      onClick={handleToggle}
      isLoading={loading}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
