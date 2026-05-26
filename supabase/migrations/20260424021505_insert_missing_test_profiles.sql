
INSERT INTO public.provider_profile ("user", phone, description, state, city, address, zip)
SELECT 'a1111111-1111-1111-1111-111111111111', '555-1234', 'Proveedor de prueba', 'CDMX', 'Mexico City', 'Calle Falsa 123', '00000'
WHERE NOT EXISTS (SELECT 1 FROM public.provider_profile WHERE "user" = 'a1111111-1111-1111-1111-111111111111');

INSERT INTO public.client_profile ("user", phone, address, state, city, zip)
SELECT 'b2222222-2222-2222-2222-222222222222', '555-5678', 'Av Siempre Viva 742', 'CDMX', 'Mexico City', '00000'
WHERE NOT EXISTS (SELECT 1 FROM public.client_profile WHERE "user" = 'b2222222-2222-2222-2222-222222222222');
;
