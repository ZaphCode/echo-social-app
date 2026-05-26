
-- Fix: Set proper bcrypt password for test users
-- The INSERT directo no hasheó la contraseña correctamente para GoTrue
UPDATE auth.users
SET 
  encrypted_password = crypt('echo_de_one_123', gen_salt('bf', 10)),
  updated_at = now()
WHERE email IN ('proveedor@test.com', 'cliente@test.com');
;
