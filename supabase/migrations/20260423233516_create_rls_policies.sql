
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES policies
-- =============================================
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- SERVICE_CATEGORY policies (read-only for all)
-- =============================================
CREATE POLICY "Categories are viewable by everyone" ON public.service_category
  FOR SELECT USING (true);

-- =============================================
-- CLIENT_PROFILE policies
-- =============================================
CREATE POLICY "Client profiles are viewable by everyone" ON public.client_profile
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create client profiles" ON public.client_profile
  FOR INSERT WITH CHECK (auth.uid() = "user");

CREATE POLICY "Users can update own client profile" ON public.client_profile
  FOR UPDATE USING (auth.uid() = "user");

-- =============================================
-- PROVIDER_PROFILE policies
-- =============================================
CREATE POLICY "Provider profiles are viewable by everyone" ON public.provider_profile
  FOR SELECT USING (true);

CREATE POLICY "Providers can create their profile" ON public.provider_profile
  FOR INSERT WITH CHECK (
    auth.uid() = "user"
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'provider')
  );

CREATE POLICY "Users can update own provider profile" ON public.provider_profile
  FOR UPDATE USING (auth.uid() = "user");

-- =============================================
-- SERVICE policies
-- =============================================
CREATE POLICY "Services are viewable by everyone" ON public.service
  FOR SELECT USING (true);

CREATE POLICY "Providers can create services" ON public.service
  FOR INSERT WITH CHECK (auth.uid() = provider);

CREATE POLICY "Providers can update own services" ON public.service
  FOR UPDATE USING (auth.uid() = provider);

-- =============================================
-- SERVICE_REQUEST policies
-- =============================================
CREATE POLICY "Parties can view their requests" ON public.service_request
  FOR SELECT USING (
    auth.uid() = client
    OR auth.uid() IN (SELECT s.provider FROM public.service s WHERE s.id = service_request.service)
  );

CREATE POLICY "Authenticated users can create requests" ON public.service_request
  FOR INSERT WITH CHECK (auth.uid() = client);

CREATE POLICY "Parties can update requests" ON public.service_request
  FOR UPDATE USING (
    auth.uid() = client
    OR auth.uid() IN (SELECT s.provider FROM public.service s WHERE s.id = service_request.service)
  );

-- =============================================
-- MESSAGE policies
-- =============================================
CREATE POLICY "Authenticated users can view messages" ON public.message
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create messages" ON public.message
  FOR INSERT WITH CHECK (auth.uid() = sender);

-- =============================================
-- REVIEW policies
-- =============================================
CREATE POLICY "Reviews are viewable by everyone" ON public.review
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.review
  FOR INSERT WITH CHECK (auth.uid() = reviewer);

-- =============================================
-- NOTIFICATION policies
-- =============================================
CREATE POLICY "Users can view own notifications" ON public.notification
  FOR SELECT USING (auth.uid() = "user");

CREATE POLICY "Authenticated users can create notifications" ON public.notification
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own notifications" ON public.notification
  FOR UPDATE USING (auth.uid() = "user");
;
