
-- Fix NULL tokens that cause GoTrue "Scan error on column index" error
-- GoTrue requires these fields to be empty strings, not NULL
UPDATE auth.users
SET
  confirmation_token   = COALESCE(confirmation_token,   ''),
  recovery_token       = COALESCE(recovery_token,       ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change         = COALESCE(email_change,         ''),
  phone_change         = COALESCE(phone_change,         ''),
  phone_change_token   = COALESCE(phone_change_token,   ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email IN ('proveedor@test.com', 'cliente@test.com');
;
