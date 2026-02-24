"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

interface FollowButtonProps {
  universeId: string;
  initialFollowing: boolean;
  initialCount: number;
}

export default function FollowButton({
  universeId,
  initialFollowing,
  initialCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleToggle = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Optimistic update
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setCount((c) => (wasFollowing ? c - 1 : c + 1));

    let error;
    if (wasFollowing) {
      ({ error } = await supabase
        .from("universe_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("universe_id", universeId));
    } else {
      ({ error } = await supabase.from("universe_follows").insert({
        user_id: user.id,
        universe_id: universeId,
      }));
    }

    // Revert on error
    if (error) {
      setFollowing(wasFollowing);
      setCount((c) => (wasFollowing ? c + 1 : c - 1));
    }

    setLoading(false);
  }, [supabase, universeId, following]);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={following ? "secondary" : "primary"}
        size="md"
        onClick={handleToggle}
        isLoading={loading}
      >
        {following ? "Following" : "Follow"}
      </Button>
      <span className="text-sm text-void-300">
        {count} {count === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
