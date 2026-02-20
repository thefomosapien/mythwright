"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function RoleUpgrade({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "creator" })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <Button
        variant="primary"
        size="lg"
        onClick={handleUpgrade}
        isLoading={loading}
      >
        Become a Creator
      </Button>
      {error && (
        <p className="mt-4 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
