
-- =============================================
-- 7. MESSAGE table
-- =============================================
CREATE TABLE public.message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request UUID NOT NULL REFERENCES public.service_request(id) ON DELETE CASCADE,
  sender UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_message_updated_at
  BEFORE UPDATE ON public.message
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 8. REVIEW table
-- =============================================
CREATE TABLE public.review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service UUID NOT NULL REFERENCES public.service(id),
  reviewer UUID NOT NULL REFERENCES public.profiles(id),
  reviewed UUID NOT NULL REFERENCES public.profiles(id),
  comment TEXT DEFAULT '',
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  type TEXT NOT NULL CHECK (type IN ('AS_CLIENT', 'AS_PROVIDER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_review_updated_at
  BEFORE UPDATE ON public.review
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 9. NOTIFICATION table
-- =============================================
CREATE TABLE public.notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('PROVIDER:NEW_REQUEST', 'CLIENT:NEW_OFFER', 'PROVIDER:NEW_OFFER', 'SYSTEM:INFO')),
  read BOOLEAN NOT NULL DEFAULT false,
  service UUID REFERENCES public.service(id),
  request UUID REFERENCES public.service_request(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_notification_updated_at
  BEFORE UPDATE ON public.notification
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
;
