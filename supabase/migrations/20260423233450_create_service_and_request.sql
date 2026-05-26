
-- =============================================
-- 5. SERVICE table
-- =============================================
CREATE TABLE public.service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category UUID NOT NULL REFERENCES public.service_category(id),
  provider UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  base_price NUMERIC NOT NULL DEFAULT 0,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_service_updated_at
  BEFORE UPDATE ON public.service
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 6. SERVICE_REQUEST table
-- =============================================
CREATE TABLE public.service_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service UUID NOT NULL REFERENCES public.service(id),
  client UUID NOT NULL REFERENCES public.profiles(id),
  last_offer_user UUID NOT NULL REFERENCES public.profiles(id),
  agreed_price NUMERIC NOT NULL DEFAULT 0,
  agreed_date TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  agreement_state TEXT NOT NULL DEFAULT 'NEGOTIATION' CHECK (agreement_state IN ('PENDING', 'ACCEPTED', 'CANCELED', 'FINISHED', 'NEGOTIATION')),
  client_offer_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (client_offer_status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED')),
  provider_offer_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (provider_offer_status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED')),
  finished TIMESTAMPTZ,
  canceled TIMESTAMPTZ,
  requested TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_service_request_updated_at
  BEFORE UPDATE ON public.service_request
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
;
