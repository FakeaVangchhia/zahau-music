-- Create 'videos' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects to allow public read access
CREATE POLICY "Allow public read access to videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Policies to allow admins to upload videos
CREATE POLICY "Allow admin insert access to videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Policies to allow admins to update videos
CREATE POLICY "Allow admin update access to videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Policies to allow admins to delete videos
CREATE POLICY "Allow admin delete access to videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
