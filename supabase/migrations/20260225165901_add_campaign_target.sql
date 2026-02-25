ALTER TABLE public.swag_campaigns 
ADD COLUMN target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'departments', 'employees')),
ADD COLUMN target_ids UUID[] DEFAULT NULL;
