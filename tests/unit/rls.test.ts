import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { describe, it, expect, beforeAll } from "vitest";

// ---------------------------------------------------------------------------
// Test configuration
// Use environment variables or fall back to local Supabase defaults.
// ---------------------------------------------------------------------------

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Fixed seed data UUIDs
const USERS = {
  creator1: {
    id: "a1000000-0000-0000-0000-000000000001",
    email: "elena@mythwright.test",
    password: "password123",
  },
  creator2: {
    id: "a1000000-0000-0000-0000-000000000002",
    email: "marcus@mythwright.test",
    password: "password123",
  },
  child: {
    id: "b1000000-0000-0000-0000-000000000001",
    email: "child@mythwright.test",
    password: "password123",
  },
  teen: {
    id: "b1000000-0000-0000-0000-000000000002",
    email: "teen@mythwright.test",
    password: "password123",
  },
  olderTeen: {
    id: "b1000000-0000-0000-0000-000000000003",
    email: "olderteen@mythwright.test",
    password: "password123",
  },
  adult: {
    id: "b1000000-0000-0000-0000-000000000004",
    email: "adult@mythwright.test",
    password: "password123",
  },
  admin: {
    id: "c1000000-0000-0000-0000-000000000001",
    email: "admin@mythwright.test",
    password: "password123",
  },
};

const UNIVERSES = {
  crystalKingdoms: "d1000000-0000-0000-0000-000000000001", // E, published
  neonDrift: "d1000000-0000-0000-0000-000000000002",       // T, published
  hollowveil: "d1000000-0000-0000-0000-000000000003",       // M, published
  draftWip: "d1000000-0000-0000-0000-000000000004",         // T, draft (marcus)
};

const COMICS = {
  firstFracture: "e1000000-0000-0000-0000-000000000001",     // E, published, CK
  shardwalkerTrials: "e1000000-0000-0000-0000-000000000002", // E, draft, CK
  signalZero: "e1000000-0000-0000-0000-000000000003",        // T, published, ND
  ghostProtocol: "e1000000-0000-0000-0000-000000000004",     // T, draft, ND
  firstEcho: "e1000000-0000-0000-0000-000000000005",         // M, published, HV
  beneathPier: "e1000000-0000-0000-0000-000000000006",       // M, draft, HV
};

const CONTENT_EVENTS = {
  event1: "aa000000-0000-0000-0000-000000000001",
  event2: "aa000000-0000-0000-0000-000000000002",
  event3: "aa000000-0000-0000-0000-000000000003",
};

const REPORTS = {
  pending: "bb000000-0000-0000-0000-000000000001",
};

const AGREEMENTS = {
  sample: "cc000000-0000-0000-0000-000000000001",
};

// ---------------------------------------------------------------------------
// Helper: get authenticated Supabase client for a test user
// ---------------------------------------------------------------------------

async function getAuthenticatedClient(
  email: string,
  password: string
): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`);
  return client;
}

function getAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function getServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// ---------------------------------------------------------------------------
// Clients — initialized once before all tests
// ---------------------------------------------------------------------------

let anonClient: SupabaseClient;
let creator1Client: SupabaseClient;
let creator2Client: SupabaseClient;
let childClient: SupabaseClient;
let teenClient: SupabaseClient;
let olderTeenClient: SupabaseClient;
let adultClient: SupabaseClient;
let adminClient: SupabaseClient;

beforeAll(async () => {
  anonClient = getAnonClient();

  [
    creator1Client,
    creator2Client,
    childClient,
    teenClient,
    olderTeenClient,
    adultClient,
    adminClient,
  ] = await Promise.all([
    getAuthenticatedClient(USERS.creator1.email, USERS.creator1.password),
    getAuthenticatedClient(USERS.creator2.email, USERS.creator2.password),
    getAuthenticatedClient(USERS.child.email, USERS.child.password),
    getAuthenticatedClient(USERS.teen.email, USERS.teen.password),
    getAuthenticatedClient(USERS.olderTeen.email, USERS.olderTeen.password),
    getAuthenticatedClient(USERS.adult.email, USERS.adult.password),
    getAuthenticatedClient(USERS.admin.email, USERS.admin.password),
  ]);
}, 30_000);

// ===========================================================================
// PROFILES
// ===========================================================================

describe("Profiles RLS", () => {
  it("anonymous user can read public profile data", async () => {
    const { data, error } = await anonClient
      .from("profiles")
      .select("id, username, display_name")
      .limit(1);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });

  it("anonymous user cannot see birth_date of other users via public_profiles view", async () => {
    const { data, error } = await anonClient
      .from("public_profiles")
      .select("id, birth_date")
      .eq("id", USERS.creator1.id)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.birth_date).toBeNull();
  });

  it("user can read their own birth_date via public_profiles view", async () => {
    const { data, error } = await creator1Client
      .from("public_profiles")
      .select("id, birth_date")
      .eq("id", USERS.creator1.id)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.birth_date).not.toBeNull();
  });

  it("user can update their own profile", async () => {
    const { error } = await adultClient
      .from("profiles")
      .update({ bio: "Updated bio for testing" })
      .eq("id", USERS.adult.id);

    expect(error).toBeNull();

    // Clean up
    await adultClient
      .from("profiles")
      .update({ bio: "Lifelong comics fan. Horror is my jam." })
      .eq("id", USERS.adult.id);
  });

  it("user cannot update another user's profile", async () => {
    const { data } = await adultClient
      .from("profiles")
      .update({ bio: "Hacked bio" })
      .eq("id", USERS.creator1.id)
      .select();

    // RLS should prevent the update — no rows affected
    expect(data).toEqual([]);
  });

  it("user cannot delete any profile", async () => {
    const { data } = await adultClient
      .from("profiles")
      .delete()
      .eq("id", USERS.adult.id)
      .select();

    // No delete policy → no rows deleted
    expect(data).toEqual([]);
  });
});

// ===========================================================================
// UNIVERSES
// ===========================================================================

describe("Universes RLS", () => {
  it("anonymous user can see published E-rated universes", async () => {
    const { data, error } = await anonClient
      .from("universes")
      .select("id, title, content_rating, status")
      .eq("id", UNIVERSES.crystalKingdoms);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBe(1);
    expect(data![0].content_rating).toBe("E");
  });

  it("anonymous user cannot see T or M rated universes", async () => {
    const { data, error } = await anonClient
      .from("universes")
      .select("id, title, content_rating")
      .in("id", [UNIVERSES.neonDrift, UNIVERSES.hollowveil]);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("anonymous user cannot see draft universes", async () => {
    const { data, error } = await anonClient
      .from("universes")
      .select("id")
      .eq("id", UNIVERSES.draftWip);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("under-13 user can see E-rated universes only", async () => {
    const { data, error } = await childClient
      .from("universes")
      .select("id, content_rating, status")
      .in("status", ["published"]);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    // All returned universes should be E-rated
    for (const u of data!) {
      expect(u.content_rating).toBe("E");
    }
  });

  it("under-13 user cannot see T or M rated universes", async () => {
    const { data, error } = await childClient
      .from("universes")
      .select("id")
      .in("id", [UNIVERSES.neonDrift, UNIVERSES.hollowveil]);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("teen user (14) can see E and T rated universes", async () => {
    const { data, error } = await teenClient
      .from("universes")
      .select("id, content_rating")
      .in("id", [UNIVERSES.crystalKingdoms, UNIVERSES.neonDrift]);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBe(2);
  });

  it("teen user cannot see M rated universes", async () => {
    const { data, error } = await teenClient
      .from("universes")
      .select("id")
      .eq("id", UNIVERSES.hollowveil);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("adult user can see all published universes", async () => {
    const { data, error } = await adultClient
      .from("universes")
      .select("id")
      .in("id", [UNIVERSES.crystalKingdoms, UNIVERSES.neonDrift, UNIVERSES.hollowveil]);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBe(3);
  });

  it("creator can see their own draft universes", async () => {
    const { data, error } = await creator2Client
      .from("universes")
      .select("id, status")
      .eq("id", UNIVERSES.draftWip);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBe(1);
    expect(data![0].status).toBe("draft");
  });

  it("user cannot see another creator's draft universes", async () => {
    const { data, error } = await creator1Client
      .from("universes")
      .select("id")
      .eq("id", UNIVERSES.draftWip);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("creator can update their own universe", async () => {
    const { error } = await creator1Client
      .from("universes")
      .update({ tagline: "Updated tagline" })
      .eq("id", UNIVERSES.crystalKingdoms);

    expect(error).toBeNull();

    // Clean up
    await creator1Client
      .from("universes")
      .update({ tagline: "Where light bends through living stone" })
      .eq("id", UNIVERSES.crystalKingdoms);
  });

  it("user cannot update another creator's universe", async () => {
    const { data } = await adultClient
      .from("universes")
      .update({ tagline: "Hacked" })
      .eq("id", UNIVERSES.crystalKingdoms)
      .select();

    expect(data).toEqual([]);
  });
});

// ===========================================================================
// COMICS
// ===========================================================================

describe("Comics RLS", () => {
  it("anonymous user can see published E-rated comics in published universes", async () => {
    const { data, error } = await anonClient
      .from("comics")
      .select("id, title, content_rating, status")
      .eq("id", COMICS.firstFracture);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBe(1);
  });

  it("anonymous user cannot see comics in draft universes (even if comic is published)", async () => {
    // The draft universe has no published comics in seed data, but let's
    // verify that the comics in draft universes are not visible
    const { data, error } = await anonClient
      .from("comics")
      .select("id")
      .eq("universe_id", UNIVERSES.draftWip);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("creator can see their own draft comics", async () => {
    const { data, error } = await creator1Client
      .from("comics")
      .select("id, status")
      .eq("id", COMICS.shardwalkerTrials);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBe(1);
    expect(data![0].status).toBe("draft");
  });

  it("user cannot see another creator's draft comics", async () => {
    const { data, error } = await adultClient
      .from("comics")
      .select("id")
      .eq("id", COMICS.shardwalkerTrials);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("comic in E universe with T rating — should be blocked by rating ceiling trigger", async () => {
    // Attempt to insert a T-rated comic into an E-rated universe via service client
    // to bypass RLS for insert but trigger the rating ceiling
    const serviceClient = getServiceClient();
    const { error } = await serviceClient.from("comics").insert({
      universe_id: UNIVERSES.crystalKingdoms, // E-rated
      creator_id: USERS.creator1.id,
      slug: "test-ceiling-violation",
      title: "Test Ceiling Violation",
      content_rating: "T", // Exceeds E ceiling
      sort_order: 99,
    });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/rating/i);
  });
});

// ===========================================================================
// CONTENT EVENTS (append-only)
// ===========================================================================

describe("Content Events RLS", () => {
  it("events are append-only: update should fail", async () => {
    const { data } = await creator1Client
      .from("content_events")
      .update({ event_type: "deleted" })
      .eq("id", CONTENT_EVENTS.event1)
      .select();

    // No update policy → no rows updated
    expect(data).toEqual([]);
  });

  it("events are append-only: delete should fail", async () => {
    const { data } = await creator1Client
      .from("content_events")
      .delete()
      .eq("id", CONTENT_EVENTS.event1)
      .select();

    // No delete policy → no rows deleted
    expect(data).toEqual([]);
  });

  it("user can see events where they are the actor", async () => {
    const { data, error } = await creator1Client
      .from("content_events")
      .select("id, actor_id")
      .eq("actor_id", USERS.creator1.id);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    for (const event of data!) {
      expect(event.actor_id).toBe(USERS.creator1.id);
    }
  });
});

// ===========================================================================
// REPORTS
// ===========================================================================

describe("Reports RLS", () => {
  it("user can create a report", async () => {
    const { error } = await teenClient.from("reports").insert({
      reporter_id: USERS.teen.id,
      target_type: "comic",
      target_id: COMICS.firstFracture,
      category: "other",
      description: "Test report from RLS test",
    });

    expect(error).toBeNull();
  });

  it("user can see their own reports", async () => {
    const { data, error } = await adultClient
      .from("reports")
      .select("id, reporter_id")
      .eq("reporter_id", USERS.adult.id);

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });

  it("user cannot see other users' reports", async () => {
    const { data, error } = await childClient
      .from("reports")
      .select("id")
      .eq("reporter_id", USERS.adult.id);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("non-admin cannot update reports", async () => {
    const { data } = await adultClient
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", REPORTS.pending)
      .select();

    expect(data).toEqual([]);
  });
});

// ===========================================================================
// CONTRIBUTION AGREEMENTS (immutable)
// ===========================================================================

describe("Contribution Agreements RLS", () => {
  it("agreements are immutable: update should fail", async () => {
    const { data } = await adultClient
      .from("contribution_agreements")
      .update({ license_type: "hacked" })
      .eq("id", AGREEMENTS.sample)
      .select();

    expect(data).toEqual([]);
  });

  it("agreements are immutable: delete should fail", async () => {
    const { data } = await adultClient
      .from("contribution_agreements")
      .delete()
      .eq("id", AGREEMENTS.sample)
      .select();

    expect(data).toEqual([]);
  });
});
