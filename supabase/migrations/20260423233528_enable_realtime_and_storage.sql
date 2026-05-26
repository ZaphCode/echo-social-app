
-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_request;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('service-photos', 'service-photos', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for service photos
CREATE POLICY "Service photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-photos');

CREATE POLICY "Authenticated users can upload service photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own service photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'service-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
;
