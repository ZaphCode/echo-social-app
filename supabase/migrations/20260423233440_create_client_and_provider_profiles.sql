
-- =============================================
-- 3. CLIENT_PROFILE table
-- =============================================
CREATE TABLE public.client_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_client_profile_updated_at
  BEFORE UPDATE ON public.client_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 4. PROVIDER_PROFILE table
-- =============================================
CREATE TABLE public.provider_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty UUID REFERENCES public.service_category(id),
  phone TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  jobs_done INTEGER NOT NULL DEFAULT 0 CHECK (jobs_done >= 0),
  experience_years NUMERIC DEFAULT 0,
  available_days TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_provider_profile_updated_at
  BEFORE UPDATE ON public.provider_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
;
