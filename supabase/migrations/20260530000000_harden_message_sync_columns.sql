-- Ensure chat offline sync can reconcile by stable client ids while using
-- server timestamps as the authoritative sync cursor.
ALTER TABLE public.message
  ADD COLUMN IF NOT EXISTS client_id TEXT;

ALTER TABLE public.message
  ADD COLUMN IF NOT EXISTS created_at_client TIMESTAMPTZ;

UPDATE public.message
SET created_at_client = created_at
WHERE created_at_client IS NULL;

ALTER TABLE public.message
  ALTER COLUMN created_at_client SET DEFAULT now(),
  ALTER COLUMN created_at_client SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_message_client_id
  ON public.message (client_id);

CREATE INDEX IF NOT EXISTS idx_message_request_created_at
  ON public.message (request, created_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'message'
      AND policyname = 'Message senders can update own messages'
  ) THEN
    CREATE POLICY "Message senders can update own messages" ON public.message
      FOR UPDATE USING (auth.uid() = sender)
      WITH CHECK (auth.uid() = sender);
  END IF;
END $$;
