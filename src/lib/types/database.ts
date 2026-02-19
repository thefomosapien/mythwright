// ============================================================================
// Enum types — mirrors CHECK constraints in the database schema
// ============================================================================

export type UserRole = "reader" | "creator" | "admin";

export type ContentRating = "E" | "T" | "M";

export type UniverseStatus = "draft" | "published" | "archived";

export type ContributionMode = "open" | "moderated" | "closed";

export type UniverseLicenseType =
  | "all-rights-reserved"
  | "open-with-attribution"
  | "universe-owned"
  | "custom";

export type ComicStatus = "draft" | "published";

export type CanonStatus = "canon" | "community" | "fan_alt";

export type LoreEntryType =
  | "character"
  | "faction"
  | "location"
  | "event"
  | "item"
  | "lore"
  | "custom";

export type LoreCanonTier =
  | "canon"
  | "community-approved"
  | "community"
  | "fan-alt";

export type LoreStatus = "draft" | "published";

export type ContentEventType =
  | "created"
  | "published"
  | "edited"
  | "deleted"
  | "submitted"
  | "approved"
  | "rejected"
  | "removed"
  | "reported"
  | "rating_changed"
  | "warning_issued"
  | "account_suspended";

export type ContentEventTargetType =
  | "universe"
  | "comic"
  | "comic_page"
  | "lore_entry"
  | "profile";

export type ReportCategory =
  | "misrated"
  | "stolen_content"
  | "prohibited"
  | "harassment"
  | "spam"
  | "other";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

// ============================================================================
// Table row types
// ============================================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  birth_date: string; // ISO date string (YYYY-MM-DD)
  role: UserRole;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

/** Public profile view — birth_date is null unless viewing own profile */
export interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  role: UserRole;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Universe {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  genre: string[] | null;
  content_rating: ContentRating;
  cover_image_url: string | null;
  banner_image_url: string | null;
  contribution_mode: ContributionMode;
  universe_license_type: UniverseLicenseType;
  status: UniverseStatus;
  follower_count: number;
  comic_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comic {
  id: string;
  universe_id: string;
  creator_id: string;
  slug: string;
  title: string;
  description: string | null;
  content_rating: ContentRating;
  cover_image_url: string | null;
  sort_order: number;
  page_count: number;
  status: ComicStatus;
  is_origin: boolean;
  canon_status: CanonStatus;
  parent_comic_id: string | null;
  branch_point_page: number | null;
  created_at: string;
  updated_at: string;
}

export interface ComicPage {
  id: string;
  comic_id: string;
  page_number: number;
  image_url: string;
  thumbnail_url: string | null;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface LoreEntry {
  id: string;
  universe_id: string;
  creator_id: string;
  entry_type: LoreEntryType;
  title: string;
  slug: string;
  content: string | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  status: LoreStatus;
  is_mist_zone: boolean;
  source_comic_id: string | null;
  canon_tier: LoreCanonTier;
  created_at: string;
  updated_at: string;
}

export interface UniverseFollow {
  id: string;
  user_id: string;
  universe_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContentEvent {
  id: string;
  actor_id: string;
  event_type: ContentEventType;
  target_type: ContentEventTargetType;
  target_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ContentEventTargetType;
  target_id: string;
  category: ReportCategory;
  description: string | null;
  status: ReportStatus;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributionAgreement {
  id: string;
  contributor_id: string;
  universe_id: string;
  license_type: string;
  terms_version: string;
  accepted_at: string;
  created_at: string;
}

// ============================================================================
// Insert / Update helper types
// ============================================================================

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> &
  Partial<Pick<Profile, "role" | "is_onboarded">>;

export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
>;

export type UniverseInsert = Omit<
  Universe,
  "id" | "created_at" | "updated_at" | "follower_count" | "comic_count"
> &
  Partial<
    Pick<
      Universe,
      | "genre"
      | "content_rating"
      | "contribution_mode"
      | "universe_license_type"
      | "status"
    >
  >;

export type UniverseUpdate = Partial<
  Omit<
    Universe,
    "id" | "creator_id" | "created_at" | "updated_at" | "follower_count" | "comic_count"
  >
>;

export type ComicInsert = Omit<Comic, "id" | "created_at" | "updated_at"> &
  Partial<
    Pick<
      Comic,
      | "content_rating"
      | "page_count"
      | "status"
      | "is_origin"
      | "canon_status"
    >
  >;

export type ComicUpdate = Partial<
  Omit<Comic, "id" | "universe_id" | "creator_id" | "created_at" | "updated_at">
>;

export type ComicPageInsert = Omit<
  ComicPage,
  "id" | "created_at" | "updated_at"
>;

export type ComicPageUpdate = Partial<
  Omit<ComicPage, "id" | "comic_id" | "created_at" | "updated_at">
>;

export type LoreEntryInsert = Omit<
  LoreEntry,
  "id" | "created_at" | "updated_at"
> &
  Partial<Pick<LoreEntry, "status" | "is_mist_zone" | "canon_tier">>;

export type LoreEntryUpdate = Partial<
  Omit<
    LoreEntry,
    "id" | "universe_id" | "creator_id" | "created_at" | "updated_at"
  >
>;

export type ReportInsert = Omit<
  Report,
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "resolution_note"
  | "resolved_by"
  | "resolved_at"
>;
