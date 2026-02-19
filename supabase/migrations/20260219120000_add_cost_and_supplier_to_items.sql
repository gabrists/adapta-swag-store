ALTER TABLE public.items ADD COLUMN unit_cost NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.items ADD COLUMN supplier_url TEXT;
