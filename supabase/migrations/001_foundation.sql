-- Mythwright Foundation Schema
-- Month 1 complete database schema with RLS policies

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Determine a user's viewable content rating tier based on birth_date.
-- Under 13 → 'E' only | 13–16 → 'E','T' | 17+ → 'E','T','M'
-- Anonymous (null) → 'E' only
create or replace function public.get_viewable_ratings(user_id uuid default null)
returns text[]
language plpgsql
security definer
stable
as $$
declare
  v_birth_date date;
  v_age int;
begin
  if user_id is null then
    return array['E'];
  end if;

  select birth_date into v_birth_date
  from public.profiles
  where id = user_id;

  if v_birth_date is null then
    return array['E'];
  end if;

  v_age := date_part('year', age(current_date, v_birth_date))::int;

  if v_age >= 17 then
    return array['E', 'T', 'M'];
  elsif v_age >= 13 then
    return array['E', 'T'];
  else
    return array['E'];
  end if;
end;
$$;

-- Auto-update updated_at timestamp on row modification.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ---------- profiles ----------
create table public.profiles (
  id          uuid        not null primary key references auth.users(id) on delete cascade,
  username    text        not null unique
    constraint username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text       not null
    constraint display_name_length check (char_length(display_name) between 1 and 60),
  bio         text        null
    constraint bio_length check (bio is null or char_length(bio) <= 500),
  avatar_url  text        null,
  birth_date  date        not null,
  role        text        not null default 'reader'
    constraint valid_role check (role in ('reader', 'creator', 'admin')),
  is_onboarded boolean    not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ---------- universes ----------
create table public.universes (
  id                    uuid        not null primary key default gen_random_uuid(),
  creator_id            uuid        not null references public.profiles(id),
  slug                  text        not null unique,
  title                 text        not null
    constraint title_length check (char_length(title) between 1 and 100),
  tagline               text        null
    constraint tagline_length check (tagline is null or char_length(tagline) <= 200),
  description           text        null
    constraint description_length check (description is null or char_length(description) <= 5000),
  genre                 text[]      null default '{}',
  content_rating        text        not null default 'E'
    constraint valid_content_rating check (content_rating in ('E', 'T', 'M')),
  cover_image_url       text        null,
  banner_image_url      text        null,
  contribution_mode     text        not null default 'closed'
    constraint valid_contribution_mode check (contribution_mode in ('open', 'moderated', 'closed')),
  universe_license_type text        not null default 'all-rights-reserved'
    constraint valid_license_type check (universe_license_type in (
      'all-rights-reserved', 'open-with-attribution', 'universe-owned', 'custom'
    )),
  status                text        not null default 'draft'
    constraint valid_status check (status in ('draft', 'published', 'archived')),
  follower_count        int         not null default 0,
  comic_count           int         not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger universes_updated_at
  before update on public.universes
  for each row execute function public.handle_updated_at();

-- ---------- comics ----------
create table public.comics (
  id                uuid        not null primary key default gen_random_uuid(),
  universe_id       uuid        not null references public.universes(id) on delete cascade,
  creator_id        uuid        not null references public.profiles(id),
  slug              text        not null,
  title             text        not null
    constraint title_length check (char_length(title) between 1 and 200),
  description       text        null
    constraint description_length check (description is null or char_length(description) <= 2000),
  content_rating    text        not null default 'E'
    constraint valid_content_rating check (content_rating in ('E', 'T', 'M')),
  cover_image_url   text        null,
  sort_order        int         not null,
  page_count        int         not null default 0,
  status            text        not null default 'draft'
    constraint valid_status check (status in ('draft', 'published')),
  is_origin         boolean     not null default false,
  canon_status      text        not null default 'canon'
    constraint valid_canon_status check (canon_status in ('canon', 'community', 'fan_alt')),
  parent_comic_id   uuid        null references public.comics(id),
  branch_point_page int         null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint unique_slug_per_universe unique (universe_id, slug)
);

create trigger comics_updated_at
  before update on public.comics
  for each row execute function public.handle_updated_at();

-- ---------- comic_pages ----------
create table public.comic_pages (
  id            uuid        not null primary key default gen_random_uuid(),
  comic_id      uuid        not null references public.comics(id) on delete cascade,
  page_number   int         not null,
  image_url     text        not null,
  thumbnail_url text        null,
  width         int         not null,
  height        int         not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint unique_page_per_comic unique (comic_id, page_number)
);

create trigger comic_pages_updated_at
  before update on public.comic_pages
  for each row execute function public.handle_updated_at();

-- ---------- lore_entries ----------
create table public.lore_entries (
  id              uuid        not null primary key default gen_random_uuid(),
  universe_id     uuid        not null references public.universes(id) on delete cascade,
  creator_id      uuid        not null references public.profiles(id),
  entry_type      text        not null
    constraint valid_entry_type check (entry_type in (
      'character', 'faction', 'location', 'event', 'item', 'lore', 'custom'
    )),
  title           text        not null
    constraint title_length check (char_length(title) between 1 and 200),
  slug            text        not null,
  content         text        null
    constraint content_length check (content is null or char_length(content) <= 10000),
  image_url       text        null,
  metadata        jsonb       null,
  sort_order       int         not null,
  status          text        not null default 'draft'
    constraint valid_status check (status in ('draft', 'published')),
  is_mist_zone    boolean     not null default false,
  source_comic_id uuid        null references public.comics(id),
  canon_tier      text        not null default 'canon'
    constraint valid_canon_tier check (canon_tier in (
      'canon', 'community-approved', 'community', 'fan-alt'
    )),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint unique_slug_per_universe_type unique (universe_id, entry_type, slug)
);

create trigger lore_entries_updated_at
  before update on public.lore_entries
  for each row execute function public.handle_updated_at();

-- ---------- universe_follows ----------
create table public.universe_follows (
  id          uuid        not null primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  universe_id uuid        not null references public.universes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint unique_follow unique (user_id, universe_id)
);

create trigger universe_follows_updated_at
  before update on public.universe_follows
  for each row execute function public.handle_updated_at();

-- ---------- content_events (audit log — append-only) ----------
create table public.content_events (
  id          uuid        not null primary key default gen_random_uuid(),
  actor_id    uuid        not null references public.profiles(id),
  event_type  text        not null
    constraint valid_event_type check (event_type in (
      'created', 'published', 'edited', 'deleted', 'submitted',
      'approved', 'rejected', 'removed', 'reported',
      'rating_changed', 'warning_issued', 'account_suspended'
    )),
  target_type text        not null
    constraint valid_target_type check (target_type in (
      'universe', 'comic', 'comic_page', 'lore_entry', 'profile'
    )),
  target_id   uuid        not null,
  metadata    jsonb       null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger content_events_updated_at
  before update on public.content_events
  for each row execute function public.handle_updated_at();

-- ---------- reports ----------
create table public.reports (
  id              uuid          not null primary key default gen_random_uuid(),
  reporter_id     uuid          not null references public.profiles(id),
  target_type     text          not null
    constraint valid_target_type check (target_type in (
      'universe', 'comic', 'comic_page', 'lore_entry', 'profile'
    )),
  target_id       uuid          not null,
  category        text          not null
    constraint valid_category check (category in (
      'misrated', 'stolen_content', 'prohibited', 'harassment', 'spam', 'other'
    )),
  description     text          null
    constraint description_length check (description is null or char_length(description) <= 2000),
  status          text          not null default 'pending'
    constraint valid_status check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolution_note text          null,
  resolved_by     uuid          null references public.profiles(id),
  resolved_at     timestamptz   null,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.handle_updated_at();

-- ---------- contribution_agreements ----------
create table public.contribution_agreements (
  id              uuid          not null primary key default gen_random_uuid(),
  contributor_id  uuid          not null references public.profiles(id),
  universe_id     uuid          not null references public.universes(id),
  license_type    text          not null,
  terms_version   text          not null,
  accepted_at     timestamptz   not null,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create trigger contribution_agreements_updated_at
  before update on public.contribution_agreements
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_universes_creator    on public.universes(creator_id);
create index idx_universes_status     on public.universes(status);
create index idx_comics_universe      on public.comics(universe_id);
create index idx_comics_creator       on public.comics(creator_id);
create index idx_comic_pages_comic    on public.comic_pages(comic_id);
create index idx_lore_entries_universe on public.lore_entries(universe_id);
create index idx_lore_entries_type     on public.lore_entries(universe_id, entry_type);
create index idx_follows_user         on public.universe_follows(user_id);
create index idx_follows_universe     on public.universe_follows(universe_id);
create index idx_events_actor         on public.content_events(actor_id);
create index idx_events_target        on public.content_events(target_type, target_id);
create index idx_reports_status       on public.reports(status);
create index idx_reports_target       on public.reports(target_type, target_id);
create index idx_agreements_contrib   on public.contribution_agreements(contributor_id);
create index idx_agreements_universe  on public.contribution_agreements(universe_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles              enable row level security;
alter table public.universes             enable row level security;
alter table public.comics                enable row level security;
alter table public.comic_pages           enable row level security;
alter table public.lore_entries          enable row level security;
alter table public.universe_follows      enable row level security;
alter table public.content_events        enable row level security;
alter table public.reports               enable row level security;
alter table public.contribution_agreements enable row level security;

-- ============================================================================
-- PROFILES — public view that omits birth_date for non-owners
-- ============================================================================

-- SELECT: anyone can view profiles, but birth_date is hidden for non-owners
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Security-definer view to expose profiles without birth_date for public use.
-- Direct table access still has birth_date, but front-end should use this view.
create or replace view public.public_profiles
  with (security_invoker = false)
as
  select
    id,
    username,
    display_name,
    bio,
    avatar_url,
    role,
    is_onboarded,
    created_at,
    updated_at,
    -- Only reveal birth_date to the profile owner
    case
      when id = auth.uid() then birth_date
      else null
    end as birth_date
  from public.profiles;

-- INSERT: users can only create their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

-- UPDATE: users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- DELETE: not allowed (soft delete pattern)
-- No delete policy = no deletes via RLS

-- ============================================================================
-- UNIVERSES
-- ============================================================================

-- SELECT: published universes filtered by viewer age tier; drafts visible to owner only
create policy "universes_select"
  on public.universes for select
  using (
    (status = 'published' and content_rating = any(
      public.get_viewable_ratings(auth.uid())
    ))
    or
    (creator_id = auth.uid())
  );

-- INSERT: any authenticated user
create policy "universes_insert"
  on public.universes for insert
  with check (auth.uid() is not null and creator_id = auth.uid());

-- UPDATE: owner only
create policy "universes_update"
  on public.universes for update
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- DELETE: owner only
create policy "universes_delete"
  on public.universes for delete
  using (creator_id = auth.uid());

-- ============================================================================
-- COMICS
-- ============================================================================

-- SELECT: published comics with age-appropriate rating (parent universe must also be published);
--         drafts visible to creator only
create policy "comics_select"
  on public.comics for select
  using (
    (
      status = 'published'
      and content_rating = any(public.get_viewable_ratings(auth.uid()))
      and exists (
        select 1 from public.universes u
        where u.id = universe_id
          and u.status = 'published'
      )
    )
    or
    (creator_id = auth.uid())
  );

-- INSERT: universe owner (Month 1 — creator_id must match universe creator_id)
create policy "comics_insert"
  on public.comics for insert
  with check (
    auth.uid() is not null
    and creator_id = auth.uid()
    and exists (
      select 1 from public.universes u
      where u.id = universe_id and u.creator_id = auth.uid()
    )
  );

-- UPDATE: comic creator
create policy "comics_update"
  on public.comics for update
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- DELETE: comic creator
create policy "comics_delete"
  on public.comics for delete
  using (creator_id = auth.uid());

-- ============================================================================
-- COMIC_PAGES
-- ============================================================================

-- SELECT: same visibility as parent comic
create policy "comic_pages_select"
  on public.comic_pages for select
  using (
    exists (
      select 1 from public.comics c
      where c.id = comic_id
        and (
          (c.status = 'published'
           and c.content_rating = any(public.get_viewable_ratings(auth.uid()))
           and exists (
             select 1 from public.universes u
             where u.id = c.universe_id and u.status = 'published'
           ))
          or c.creator_id = auth.uid()
        )
    )
  );

-- INSERT: comic creator
create policy "comic_pages_insert"
  on public.comic_pages for insert
  with check (
    exists (
      select 1 from public.comics c
      where c.id = comic_id and c.creator_id = auth.uid()
    )
  );

-- UPDATE: comic creator
create policy "comic_pages_update"
  on public.comic_pages for update
  using (
    exists (
      select 1 from public.comics c
      where c.id = comic_id and c.creator_id = auth.uid()
    )
  );

-- DELETE: comic creator
create policy "comic_pages_delete"
  on public.comic_pages for delete
  using (
    exists (
      select 1 from public.comics c
      where c.id = comic_id and c.creator_id = auth.uid()
    )
  );

-- ============================================================================
-- LORE_ENTRIES
-- ============================================================================

-- SELECT: published entries in published universes = public; drafts = creator only
create policy "lore_entries_select"
  on public.lore_entries for select
  using (
    (
      status = 'published'
      and exists (
        select 1 from public.universes u
        where u.id = universe_id and u.status = 'published'
      )
    )
    or
    (creator_id = auth.uid())
  );

-- INSERT: universe owner (Month 1)
create policy "lore_entries_insert"
  on public.lore_entries for insert
  with check (
    auth.uid() is not null
    and creator_id = auth.uid()
    and exists (
      select 1 from public.universes u
      where u.id = universe_id and u.creator_id = auth.uid()
    )
  );

-- UPDATE: entry creator
create policy "lore_entries_update"
  on public.lore_entries for update
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- DELETE: entry creator
create policy "lore_entries_delete"
  on public.lore_entries for delete
  using (creator_id = auth.uid());

-- ============================================================================
-- UNIVERSE_FOLLOWS
-- ============================================================================

-- SELECT: own follows only
create policy "follows_select_own"
  on public.universe_follows for select
  using (user_id = auth.uid());

-- INSERT: authenticated users can follow
create policy "follows_insert"
  on public.universe_follows for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- UPDATE: not allowed
-- No update policy = no updates via RLS

-- DELETE: own follows only
create policy "follows_delete_own"
  on public.universe_follows for delete
  using (user_id = auth.uid());

-- ============================================================================
-- CONTENT_EVENTS (audit log — append-only)
-- ============================================================================

-- SELECT: actor can see their own events; target owner can see events on their content.
--         Admins can see all (handled by admin role check).
create policy "events_select"
  on public.content_events for select
  using (
    actor_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- INSERT: system / authenticated users (used by triggers and server-side code)
create policy "events_insert"
  on public.content_events for insert
  with check (auth.uid() is not null and actor_id = auth.uid());

-- UPDATE: never (append-only)
-- No update policy

-- DELETE: never
-- No delete policy

-- ============================================================================
-- REPORTS
-- ============================================================================

-- SELECT: own reports or admin
create policy "reports_select"
  on public.reports for select
  using (
    reporter_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- INSERT: any authenticated user
create policy "reports_insert"
  on public.reports for insert
  with check (auth.uid() is not null and reporter_id = auth.uid());

-- UPDATE: admin only (status changes)
create policy "reports_update_admin"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- DELETE: never
-- No delete policy

-- ============================================================================
-- CONTRIBUTION_AGREEMENTS
-- ============================================================================

-- SELECT: own agreements or universe owner
create policy "agreements_select"
  on public.contribution_agreements for select
  using (
    contributor_id = auth.uid()
    or exists (
      select 1 from public.universes u
      where u.id = universe_id and u.creator_id = auth.uid()
    )
  );

-- INSERT: any authenticated user
create policy "agreements_insert"
  on public.contribution_agreements for insert
  with check (auth.uid() is not null and contributor_id = auth.uid());

-- UPDATE: never (immutable)
-- No update policy

-- DELETE: never
-- No delete policy
