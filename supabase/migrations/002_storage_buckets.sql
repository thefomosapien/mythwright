-- ============================================================================
-- Storage Buckets
-- Creates public buckets for avatars and general uploads (covers, banners, etc.)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Avatars bucket policies
-- ----------------------------------------------------------------------------

-- Anyone can view avatars
CREATE POLICY "Public avatar read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar (path starts with their user id)
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- Uploads bucket policies (covers, banners, comic pages, etc.)
-- ----------------------------------------------------------------------------

-- Anyone can view uploads
CREATE POLICY "Public upload read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete their uploads
CREATE POLICY "Authenticated users can delete uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
  );
