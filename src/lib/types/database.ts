// ============================================================================
// Mythwright Database Types
// Follows the Supabase generated types pattern: Database > public > Tables
// ============================================================================

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

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

// ============================================================================
// Database type — Supabase generated types pattern
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          birth_date: string;
          role: UserRole;
          is_onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          birth_date: string;
          role?: UserRole;
          is_onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          birth_date?: string;
          role?: UserRole;
          is_onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      universes: {
        Row: {
          id: string;
          creator_id: string;
          slug: string;
          title: string;
          tagline: string | null;
          description: string | null;
          genre: string[];
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
        };
        Insert: {
          id?: string;
          creator_id: string;
          slug: string;
          title: string;
          tagline?: string | null;
          description?: string | null;
          genre?: string[];
          content_rating?: ContentRating;
          cover_image_url?: string | null;
          banner_image_url?: string | null;
          contribution_mode?: ContributionMode;
          universe_license_type?: UniverseLicenseType;
          status?: UniverseStatus;
          follower_count?: number;
          comic_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          slug?: string;
          title?: string;
          tagline?: string | null;
          description?: string | null;
          genre?: string[];
          content_rating?: ContentRating;
          cover_image_url?: string | null;
          banner_image_url?: string | null;
          contribution_mode?: ContributionMode;
          universe_license_type?: UniverseLicenseType;
          status?: UniverseStatus;
          follower_count?: number;
          comic_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comics: {
        Row: {
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
        };
        Insert: {
          id?: string;
          universe_id: string;
          creator_id: string;
          slug: string;
          title: string;
          description?: string | null;
          content_rating?: ContentRating;
          cover_image_url?: string | null;
          sort_order: number;
          page_count?: number;
          status?: ComicStatus;
          is_origin?: boolean;
          canon_status?: CanonStatus;
          parent_comic_id?: string | null;
          branch_point_page?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          universe_id?: string;
          creator_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          content_rating?: ContentRating;
          cover_image_url?: string | null;
          sort_order?: number;
          page_count?: number;
          status?: ComicStatus;
          is_origin?: boolean;
          canon_status?: CanonStatus;
          parent_comic_id?: string | null;
          branch_point_page?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comic_pages: {
        Row: {
          id: string;
          comic_id: string;
          page_number: number;
          image_url: string;
          thumbnail_url: string | null;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comic_id: string;
          page_number: number;
          image_url: string;
          thumbnail_url?: string | null;
          width: number;
          height: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          comic_id?: string;
          page_number?: number;
          image_url?: string;
          thumbnail_url?: string | null;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lore_entries: {
        Row: {
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
        };
        Insert: {
          id?: string;
          universe_id: string;
          creator_id: string;
          entry_type: LoreEntryType;
          title: string;
          slug: string;
          content?: string | null;
          image_url?: string | null;
          metadata?: Record<string, unknown> | null;
          sort_order: number;
          status?: LoreStatus;
          is_mist_zone?: boolean;
          source_comic_id?: string | null;
          canon_tier?: LoreCanonTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          universe_id?: string;
          creator_id?: string;
          entry_type?: LoreEntryType;
          title?: string;
          slug?: string;
          content?: string | null;
          image_url?: string | null;
          metadata?: Record<string, unknown> | null;
          sort_order?: number;
          status?: LoreStatus;
          is_mist_zone?: boolean;
          source_comic_id?: string | null;
          canon_tier?: LoreCanonTier;
          created_at?: string;
          updated_at?: string;
        };
      };
      universe_follows: {
        Row: {
          id: string;
          user_id: string;
          universe_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          universe_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          universe_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_events: {
        Row: {
          id: string;
          actor_id: string;
          event_type: string;
          target_type: string;
          target_id: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          event_type: string;
          target_type: string;
          target_id: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          event_type?: string;
          target_type?: string;
          target_id?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          category: string;
          description: string | null;
          status: ReportStatus;
          resolution_note: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          category: string;
          description?: string | null;
          status?: ReportStatus;
          resolution_note?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: string;
          target_id?: string;
          category?: string;
          description?: string | null;
          status?: ReportStatus;
          resolution_note?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contribution_agreements: {
        Row: {
          id: string;
          contributor_id: string;
          universe_id: string;
          license_type: string;
          terms_version: string;
          accepted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contributor_id: string;
          universe_id: string;
          license_type: string;
          terms_version: string;
          accepted_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contributor_id?: string;
          universe_id?: string;
          license_type?: string;
          terms_version?: string;
          accepted_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      public_profiles: {
        Row: {
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
        };
      };
    };
  };
}

// ============================================================================
// Convenience type aliases
// ============================================================================

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Row aliases
export type Profile = Tables<"profiles">;
export type Universe = Tables<"universes">;
export type Comic = Tables<"comics">;
export type ComicPage = Tables<"comic_pages">;
export type LoreEntry = Tables<"lore_entries">;
export type UniverseFollow = Tables<"universe_follows">;
export type ContentEvent = Tables<"content_events">;
export type Report = Tables<"reports">;
export type ContributionAgreement = Tables<"contribution_agreements">;

export type PublicProfile = Database["public"]["Views"]["public_profiles"]["Row"];
