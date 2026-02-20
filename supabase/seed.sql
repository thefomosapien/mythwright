-- ============================================================================
-- Mythwright Seed Data
-- Deterministic UUIDs for test users and content
-- ============================================================================

-- ============================================================================
-- AUTH USERS (inserted into auth.users for local dev)
-- ============================================================================

-- Creator 1: Elena (adult, owns 2 universes)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'elena@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"elena@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  jsonb_build_object('sub', 'a1000000-0000-0000-0000-000000000001', 'email', 'elena@mythwright.test'),
  'email', now(), now(), now()
);

-- Creator 2: Marcus (adult, owns 1 universe)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'marcus@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"marcus@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  jsonb_build_object('sub', 'a1000000-0000-0000-0000-000000000002', 'email', 'marcus@mythwright.test'),
  'email', now(), now(), now()
);

-- Reader 1: child_reader (age 10, under 13)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'child@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"child@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  jsonb_build_object('sub', 'b1000000-0000-0000-0000-000000000001', 'email', 'child@mythwright.test'),
  'email', now(), now(), now()
);

-- Reader 2: teen_reader (age 14)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'b1000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'teen@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"teen@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000002',
  jsonb_build_object('sub', 'b1000000-0000-0000-0000-000000000002', 'email', 'teen@mythwright.test'),
  'email', now(), now(), now()
);

-- Reader 3: older_teen_reader (age 17)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'b1000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'olderteen@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"olderteen@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000003',
  jsonb_build_object('sub', 'b1000000-0000-0000-0000-000000000003', 'email', 'olderteen@mythwright.test'),
  'email', now(), now(), now()
);

-- Reader 4: adult_reader (age 25)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'b1000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'adult@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"adult@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000004',
  jsonb_build_object('sub', 'b1000000-0000-0000-0000-000000000004', 'email', 'adult@mythwright.test'),
  'email', now(), now(), now()
);

-- Admin user
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@mythwright.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}',
  '{"email":"admin@mythwright.test"}'
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  jsonb_build_object('sub', 'c1000000-0000-0000-0000-000000000001', 'email', 'admin@mythwright.test'),
  'email', now(), now(), now()
);

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Creator 1: Elena (adult, born 1990)
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'elena_creates',
  'Elena Vasquez',
  'Fantasy and sci-fi worldbuilder. I draw what I dream.',
  'https://placehold.co/200x200/d4a843/0a0a0f?text=EV',
  '1990-03-15',
  'creator',
  true
);

-- Creator 2: Marcus (adult, born 1988)
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  'marcus_dark',
  'Marcus Chen',
  'Horror artist and storyteller. The shadows have stories too.',
  'https://placehold.co/200x200/ef4444/0a0a0f?text=MC',
  '1988-10-31',
  'creator',
  true
);

-- Reader 1: child (under 13, born 2016 = age ~10)
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'little_reader',
  'Alex Junior',
  null,
  null,
  '2016-06-01',
  'reader',
  true
);

-- Reader 2: teen (age 14, born 2012)
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'teen_explorer',
  'Sam Walker',
  'I love reading comics!',
  null,
  '2012-01-20',
  'reader',
  true
);

-- Reader 3: older teen (age 17, born 2009)
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'b1000000-0000-0000-0000-000000000003',
  'almost_adult',
  'Jordan Blake',
  'Aspiring comic artist, reading everything I can.',
  null,
  '2009-07-04',
  'reader',
  true
);

-- Reader 4: adult (age 25, born 2001)
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'b1000000-0000-0000-0000-000000000004',
  'adult_fan',
  'Riley Morgan',
  'Lifelong comics fan. Horror is my jam.',
  'https://placehold.co/200x200/3b82f6/0a0a0f?text=RM',
  '2001-04-12',
  'reader',
  true
);

-- Admin
INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, birth_date, role, is_onboarded)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'mythwright_admin',
  'Mythwright Admin',
  'Platform administrator.',
  null,
  '1985-01-01',
  'admin',
  true
);

-- ============================================================================
-- UNIVERSES
-- ============================================================================

-- Universe 1: Fantasy (E-rated, published, by Elena) — open contribution
INSERT INTO public.universes (id, creator_id, slug, title, tagline, description, genre, content_rating, cover_image_url, banner_image_url, contribution_mode, universe_license_type, status, follower_count, comic_count)
VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'crystal-kingdoms',
  'Crystal Kingdoms',
  'Where light bends through living stone',
  'In a world where crystals grow like trees, kingdoms rise and fall with the resonance of the earth. Follow the Shardwalkers as they navigate alliances, ancient magic, and the corrupting influence of the Deep Fracture.',
  '{fantasy,adventure,magic}',
  'E',
  'https://placehold.co/800x1200/22c55e/0a0a0f?text=Crystal+Kingdoms',
  'https://placehold.co/1920x400/22c55e/0a0a0f?text=Crystal+Kingdoms+Banner',
  'open',
  'open-with-attribution',
  'published',
  3,
  2
);

-- Universe 2: Sci-fi (T-rated, published, by Elena) — moderated contribution
INSERT INTO public.universes (id, creator_id, slug, title, tagline, description, genre, content_rating, cover_image_url, banner_image_url, contribution_mode, universe_license_type, status, follower_count, comic_count)
VALUES (
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'neon-drift',
  'Neon Drift',
  'The signal is the city. The city is alive.',
  'A cyberpunk universe set in the sprawling megacity of Nova Pacifica, where hackers, corpo agents, and street samurai clash over control of the Drift — a mysterious signal that rewrites reality itself.',
  '{sci-fi,cyberpunk,thriller}',
  'T',
  'https://placehold.co/800x1200/eab308/0a0a0f?text=Neon+Drift',
  'https://placehold.co/1920x400/eab308/0a0a0f?text=Neon+Drift+Banner',
  'moderated',
  'universe-owned',
  'published',
  2,
  2
);

-- Universe 3: Horror (M-rated, published, by Marcus) — closed contribution
INSERT INTO public.universes (id, creator_id, slug, title, tagline, description, genre, content_rating, cover_image_url, banner_image_url, contribution_mode, universe_license_type, status, follower_count, comic_count)
VALUES (
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'hollowveil',
  'Hollowveil',
  'Some doors should stay closed.',
  'Hollowveil is a small coastal town where the veil between the living and the dead is thinnest. Residents live alongside echoes of the departed, but when the Hollowing begins, those echoes start to hunger.',
  '{horror,supernatural,mystery}',
  'M',
  'https://placehold.co/800x1200/ef4444/0a0a0f?text=Hollowveil',
  'https://placehold.co/1920x400/ef4444/0a0a0f?text=Hollowveil+Banner',
  'closed',
  'all-rights-reserved',
  'published',
  1,
  2
);

-- Universe 4: Draft universe (by Marcus) — to test visibility rules
INSERT INTO public.universes (id, creator_id, slug, title, tagline, description, genre, content_rating, cover_image_url, banner_image_url, contribution_mode, universe_license_type, status, follower_count, comic_count)
VALUES (
  'd1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000002',
  'untitled-wip',
  'Untitled Work in Progress',
  'Still brewing...',
  'A draft universe that should not be visible to anyone except Marcus.',
  '{fantasy}',
  'T',
  null,
  null,
  'closed',
  'all-rights-reserved',
  'draft',
  0,
  0
);

-- ============================================================================
-- COMICS (2 per published universe: 1 published origin, 1 draft)
-- ============================================================================

-- Crystal Kingdoms comics
INSERT INTO public.comics (id, universe_id, creator_id, slug, title, description, content_rating, cover_image_url, sort_order, page_count, status, is_origin, canon_status)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'the-first-fracture',
  'The First Fracture',
  'The origin story of the Crystal Kingdoms. When young Shardwalker Lyra discovers a crack in the Great Crystal, she sets off a chain of events that will reshape the world.',
  'E',
  'https://placehold.co/600x900/22c55e/0a0a0f?text=First+Fracture',
  1, 8, 'published', true, 'canon'
);

INSERT INTO public.comics (id, universe_id, creator_id, slug, title, description, content_rating, cover_image_url, sort_order, page_count, status, is_origin, canon_status)
VALUES (
  'e1000000-0000-0000-0000-000000000002',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'shardwalker-trials',
  'Shardwalker Trials',
  'Lyra faces the ancient trials to earn her place among the Shardwalkers.',
  'E',
  'https://placehold.co/600x900/22c55e/0a0a0f?text=Shardwalker+Trials',
  2, 5, 'draft', false, 'canon'
);

-- Neon Drift comics
INSERT INTO public.comics (id, universe_id, creator_id, slug, title, description, content_rating, cover_image_url, sort_order, page_count, status, is_origin, canon_status)
VALUES (
  'e1000000-0000-0000-0000-000000000003',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'signal-zero',
  'Signal Zero',
  'Hacker Ren intercepts a signal that shouldn''t exist — the first Drift event in a decade. Now everyone from the Yakuza to the megacorps wants what''s in her head.',
  'T',
  'https://placehold.co/600x900/eab308/0a0a0f?text=Signal+Zero',
  1, 10, 'published', true, 'canon'
);

INSERT INTO public.comics (id, universe_id, creator_id, slug, title, description, content_rating, cover_image_url, sort_order, page_count, status, is_origin, canon_status)
VALUES (
  'e1000000-0000-0000-0000-000000000004',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'ghost-protocol',
  'Ghost Protocol',
  'A side story following corpo agent Kael as he investigates the Drift from the inside.',
  'T',
  'https://placehold.co/600x900/eab308/0a0a0f?text=Ghost+Protocol',
  2, 6, 'draft', false, 'community'
);

-- Hollowveil comics
INSERT INTO public.comics (id, universe_id, creator_id, slug, title, description, content_rating, cover_image_url, sort_order, page_count, status, is_origin, canon_status)
VALUES (
  'e1000000-0000-0000-0000-000000000005',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'the-first-echo',
  'The First Echo',
  'When a new family moves into the old Marsh house, they discover that not all echoes are memories. Some are warnings.',
  'M',
  'https://placehold.co/600x900/ef4444/0a0a0f?text=First+Echo',
  1, 7, 'published', true, 'canon'
);

INSERT INTO public.comics (id, universe_id, creator_id, slug, title, description, content_rating, cover_image_url, sort_order, page_count, status, is_origin, canon_status)
VALUES (
  'e1000000-0000-0000-0000-000000000006',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'beneath-the-pier',
  'Beneath the Pier',
  'The town''s fishermen know something lives beneath the old pier. This is the story of the first to look.',
  'M',
  'https://placehold.co/600x900/ef4444/0a0a0f?text=Beneath+Pier',
  2, 5, 'draft', false, 'canon'
);

-- ============================================================================
-- COMIC PAGES (placeholder pages for each comic)
-- ============================================================================

-- Helper: generate pages for each comic
-- Crystal Kingdoms: The First Fracture (8 pages)
INSERT INTO public.comic_pages (id, comic_id, page_number, image_url, thumbnail_url, width, height) VALUES
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 1, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P1', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P1', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 2, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P2', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P2', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 3, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P3', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P3', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 4, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P4', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P4', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 5, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P5', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P5', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 6, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P6', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P6', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 7, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P7', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P7', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000001', 8, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-1-P8', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-1-P8', 800, 1200);

-- Crystal Kingdoms: Shardwalker Trials (5 pages, draft)
INSERT INTO public.comic_pages (id, comic_id, page_number, image_url, thumbnail_url, width, height) VALUES
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000002', 1, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-2-P1', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-2-P1', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000002', 2, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-2-P2', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-2-P2', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000002', 3, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-2-P3', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-2-P3', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000002', 4, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-2-P4', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-2-P4', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000002', 5, 'https://placehold.co/800x1200/22c55e/0a0a0f?text=CK-2-P5', 'https://placehold.co/200x300/22c55e/0a0a0f?text=CK-2-P5', 800, 1200);

-- Neon Drift: Signal Zero (10 pages)
INSERT INTO public.comic_pages (id, comic_id, page_number, image_url, thumbnail_url, width, height) VALUES
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 1, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P1', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P1', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 2, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P2', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P2', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 3, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P3', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P3', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 4, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P4', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P4', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 5, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P5', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P5', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 6, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P6', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P6', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 7, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P7', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P7', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 8, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P8', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P8', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 9, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P9', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P9', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000003', 10, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-1-P10', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-1-P10', 800, 1200);

-- Neon Drift: Ghost Protocol (6 pages, draft)
INSERT INTO public.comic_pages (id, comic_id, page_number, image_url, thumbnail_url, width, height) VALUES
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000004', 1, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-2-P1', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-2-P1', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000004', 2, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-2-P2', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-2-P2', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000004', 3, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-2-P3', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-2-P3', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000004', 4, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-2-P4', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-2-P4', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000004', 5, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-2-P5', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-2-P5', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000004', 6, 'https://placehold.co/800x1200/eab308/0a0a0f?text=ND-2-P6', 'https://placehold.co/200x300/eab308/0a0a0f?text=ND-2-P6', 800, 1200);

-- Hollowveil: The First Echo (7 pages)
INSERT INTO public.comic_pages (id, comic_id, page_number, image_url, thumbnail_url, width, height) VALUES
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 1, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P1', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P1', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 2, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P2', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P2', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 3, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P3', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P3', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 4, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P4', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P4', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 5, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P5', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P5', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 6, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P6', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P6', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000005', 7, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-1-P7', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-1-P7', 800, 1200);

-- Hollowveil: Beneath the Pier (5 pages, draft)
INSERT INTO public.comic_pages (id, comic_id, page_number, image_url, thumbnail_url, width, height) VALUES
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000006', 1, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-2-P1', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-2-P1', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000006', 2, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-2-P2', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-2-P2', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000006', 3, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-2-P3', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-2-P3', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000006', 4, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-2-P4', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-2-P4', 800, 1200),
  (gen_random_uuid(), 'e1000000-0000-0000-0000-000000000006', 5, 'https://placehold.co/800x1200/ef4444/0a0a0f?text=HV-2-P5', 'https://placehold.co/200x300/ef4444/0a0a0f?text=HV-2-P5', 800, 1200);

-- ============================================================================
-- LORE ENTRIES (5-8 per universe with cross-references)
-- ============================================================================

-- Crystal Kingdoms lore (6 entries)
INSERT INTO public.lore_entries (id, universe_id, creator_id, entry_type, title, slug, content, image_url, metadata, sort_order, status, is_mist_zone, canon_tier) VALUES
(
  'f1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'character', 'Lyra Shardwalker', 'lyra-shardwalker',
  'A young Shardwalker with an innate ability to hear crystal resonance. She discovers the First Fracture and becomes the unlikely hero of the Crystal Kingdoms.',
  'https://placehold.co/400x600/22c55e/0a0a0f?text=Lyra',
  '{"affiliations": ["Shardwalker Guild"], "related_entries": ["f1000000-0000-0000-0000-000000000002", "f1000000-0000-0000-0000-000000000003"]}',
  1, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000002',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'faction', 'Shardwalker Guild', 'shardwalker-guild',
  'An ancient order dedicated to maintaining the crystal network. Shardwalkers can sense crystal resonance and navigate the deep caverns where the most powerful crystals grow.',
  'https://placehold.co/400x400/22c55e/0a0a0f?text=Guild',
  '{"members": ["f1000000-0000-0000-0000-000000000001"], "locations": ["f1000000-0000-0000-0000-000000000003"]}',
  2, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000003',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'location', 'The Great Crystal Cavern', 'great-crystal-cavern',
  'The largest crystal formation in the known world. Home to the Shardwalker Guild and the site of the First Fracture.',
  'https://placehold.co/400x400/22c55e/0a0a0f?text=Cavern',
  '{"related_entries": ["f1000000-0000-0000-0000-000000000001", "f1000000-0000-0000-0000-000000000002", "f1000000-0000-0000-0000-000000000004"]}',
  3, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000004',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'event', 'The First Fracture', 'the-first-fracture',
  'The cataclysmic event that cracked the Great Crystal and released ancient energies into the world, awakening long-dormant crystal beasts.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000001", "f1000000-0000-0000-0000-000000000003"]}',
  4, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000005',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'item', 'Resonance Compass', 'resonance-compass',
  'A delicate instrument that Shardwalkers use to navigate crystal caverns. It vibrates in the presence of unstable crystal formations.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000002"]}',
  5, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000006',
  'd1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'lore', 'Crystal Resonance Theory', 'crystal-resonance-theory',
  'Every crystal in the world vibrates at a unique frequency. When crystals of complementary frequencies are brought together, they amplify each other. When opposing frequencies meet, they shatter.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000003", "f1000000-0000-0000-0000-000000000005"]}',
  6, 'published', false, 'canon'
);

-- Neon Drift lore (6 entries)
INSERT INTO public.lore_entries (id, universe_id, creator_id, entry_type, title, slug, content, image_url, metadata, sort_order, status, is_mist_zone, canon_tier) VALUES
(
  'f1000000-0000-0000-0000-000000000011',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'character', 'Ren Kagawa', 'ren-kagawa',
  'A freelance hacker living in the lower levels of Nova Pacifica. She intercepts Signal Zero and becomes the most wanted person in the megacity.',
  'https://placehold.co/400x600/eab308/0a0a0f?text=Ren',
  '{"affiliations": ["Independent"], "related_entries": ["f1000000-0000-0000-0000-000000000013", "f1000000-0000-0000-0000-000000000014"]}',
  1, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000012',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'character', 'Agent Kael', 'agent-kael',
  'A corporate intelligence agent for Nexus Corp. Outwardly loyal, but secretly questioning the corporation''s interest in the Drift.',
  'https://placehold.co/400x600/eab308/0a0a0f?text=Kael',
  '{"affiliations": ["Nexus Corp"], "related_entries": ["f1000000-0000-0000-0000-000000000015"]}',
  2, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000013',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'location', 'Nova Pacifica', 'nova-pacifica',
  'A sprawling megacity built on the ruins of the Pacific coastline. Divided into Upper, Mid, and Lower levels — each with its own culture, economy, and dangers.',
  'https://placehold.co/400x400/eab308/0a0a0f?text=NovaPac',
  '{"related_entries": ["f1000000-0000-0000-0000-000000000011", "f1000000-0000-0000-0000-000000000012"]}',
  3, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000014',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'event', 'Signal Zero', 'signal-zero',
  'The first Drift event in a decade. A mysterious signal that rewrites local reality, creating pockets of altered physics. Ren Kagawa was the first to intercept it.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000011", "f1000000-0000-0000-0000-000000000016"]}',
  4, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000015',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'faction', 'Nexus Corp', 'nexus-corp',
  'The largest megacorporation in Nova Pacifica. Controls the city''s power grid, communications, and — secretly — Drift research.',
  'https://placehold.co/400x400/eab308/0a0a0f?text=Nexus',
  '{"members": ["f1000000-0000-0000-0000-000000000012"], "related_entries": ["f1000000-0000-0000-0000-000000000013"]}',
  5, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000016',
  'd1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'lore', 'The Drift', 'the-drift',
  'A poorly understood phenomenon where reality itself glitches. Areas affected by the Drift experience altered physics, time distortions, and sometimes the manifestation of impossible objects.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000014", "f1000000-0000-0000-0000-000000000015"]}',
  6, 'published', false, 'canon'
);

-- Hollowveil lore (5 entries)
INSERT INTO public.lore_entries (id, universe_id, creator_id, entry_type, title, slug, content, image_url, metadata, sort_order, status, is_mist_zone, canon_tier) VALUES
(
  'f1000000-0000-0000-0000-000000000021',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'character', 'Mae Hollow', 'mae-hollow',
  'Descendant of the town founders. She can see and communicate with echoes more clearly than anyone else in Hollowveil. She''s also the only one who can sense the Hollowing.',
  'https://placehold.co/400x600/ef4444/0a0a0f?text=Mae',
  '{"affiliations": ["Hollow Family"], "related_entries": ["f1000000-0000-0000-0000-000000000022", "f1000000-0000-0000-0000-000000000023"]}',
  1, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000022',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'location', 'Hollowveil Town', 'hollowveil-town',
  'A small coastal town in the Pacific Northwest where the veil between the living and the dead is thinnest. Fog rolls in every evening, and with it, the echoes.',
  'https://placehold.co/400x400/ef4444/0a0a0f?text=Town',
  '{"related_entries": ["f1000000-0000-0000-0000-000000000021", "f1000000-0000-0000-0000-000000000024"]}',
  2, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000023',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'event', 'The Hollowing', 'the-hollowing',
  'A cyclical event that occurs every 50 years when the veil becomes so thin that echoes can physically interact with the living — and they hunger.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000021", "f1000000-0000-0000-0000-000000000022"]}',
  3, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000024',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'location', 'The Old Pier', 'the-old-pier',
  'An abandoned fishing pier at the edge of town. Something lives in the water beneath it. The fishermen know, but they don''t talk about it.',
  'https://placehold.co/400x400/ef4444/0a0a0f?text=Pier',
  '{"related_entries": ["f1000000-0000-0000-0000-000000000022"]}',
  4, 'published', false, 'canon'
),
(
  'f1000000-0000-0000-0000-000000000025',
  'd1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'lore', 'Echoes', 'echoes',
  'Residual imprints of the departed that persist in Hollowveil due to the thin veil. Most echoes simply replay moments from their lives, but during the Hollowing, they become aware — and hungry.',
  null,
  '{"related_entries": ["f1000000-0000-0000-0000-000000000021", "f1000000-0000-0000-0000-000000000023"]}',
  5, 'published', true, 'canon'
);

-- ============================================================================
-- UNIVERSE FOLLOWS (readers following different universes)
-- ============================================================================

-- Child reader follows Crystal Kingdoms (E-rated)
INSERT INTO public.universe_follows (user_id, universe_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001');

-- Teen reader follows Crystal Kingdoms and Neon Drift
INSERT INTO public.universe_follows (user_id, universe_id) VALUES
  ('b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002');

-- Older teen follows Neon Drift
INSERT INTO public.universe_follows (user_id, universe_id) VALUES
  ('b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002');

-- Adult follows Crystal Kingdoms and Hollowveil
INSERT INTO public.universe_follows (user_id, universe_id) VALUES
  ('b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003');

-- ============================================================================
-- CONTENT EVENTS (audit trail samples)
-- ============================================================================

INSERT INTO public.content_events (id, actor_id, event_type, target_type, target_id, metadata) VALUES
(
  'aa000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'created', 'universe', 'd1000000-0000-0000-0000-000000000001',
  '{"title": "Crystal Kingdoms"}'
),
(
  'aa000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'published', 'comic', 'e1000000-0000-0000-0000-000000000001',
  '{"title": "The First Fracture", "universe": "Crystal Kingdoms"}'
),
(
  'aa000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'created', 'universe', 'd1000000-0000-0000-0000-000000000003',
  '{"title": "Hollowveil"}'
);

-- ============================================================================
-- REPORTS (1 pending report)
-- ============================================================================

INSERT INTO public.reports (id, reporter_id, target_type, target_id, category, description, status)
VALUES (
  'bb000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000004',
  'comic', 'e1000000-0000-0000-0000-000000000005',
  'misrated',
  'I think this comic should be rated higher than M — some of the imagery is extremely graphic.',
  'pending'
);

-- ============================================================================
-- CONTRIBUTION AGREEMENTS (1 sample)
-- ============================================================================

INSERT INTO public.contribution_agreements (id, contributor_id, universe_id, license_type, terms_version, accepted_at)
VALUES (
  'cc000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000004',
  'd1000000-0000-0000-0000-000000000001',
  'open-with-attribution',
  '1.0',
  now()
);
