INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Portfolio items are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Barbers can upload to their portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio'
    AND EXISTS (
      SELECT 1 FROM barber_profiles bp
      WHERE bp.user_id = (SELECT auth.uid())
      AND (storage.foldername(name))[1] = bp.id::text
    )
  );

CREATE POLICY "Barbers can delete from their portfolio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio'
    AND EXISTS (
      SELECT 1 FROM barber_profiles bp
      WHERE bp.user_id = (SELECT auth.uid())
      AND (storage.foldername(name))[1] = bp.id::text
    )
  );

CREATE POLICY "Chat participants can view attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND (
      EXISTS (
        SELECT 1 FROM service_requests sr
        WHERE sr.id::text = (storage.foldername(name))[1]
        AND sr.customer_id = (SELECT auth.uid())
      )
      OR
      EXISTS (
        SELECT 1 FROM barber_responses br
        JOIN barber_profiles bp ON br.barber_id = bp.id
        WHERE br.request_id::text = (storage.foldername(name))[1]
        AND bp.user_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Chat participants can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (
      EXISTS (
        SELECT 1 FROM service_requests sr
        WHERE sr.id::text = (storage.foldername(name))[1]
        AND sr.customer_id = (SELECT auth.uid())
      )
      OR
      EXISTS (
        SELECT 1 FROM barber_responses br
        JOIN barber_profiles bp ON br.barber_id = bp.id
        WHERE br.request_id::text = (storage.foldername(name))[1]
        AND bp.user_id = (SELECT auth.uid())
      )
    )
  );
