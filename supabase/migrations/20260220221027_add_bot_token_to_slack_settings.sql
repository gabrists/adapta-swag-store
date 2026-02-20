ALTER TABLE public.slack_settings ADD COLUMN IF NOT EXISTS bot_token TEXT DEFAULT '';
