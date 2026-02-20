-- Migration: Seed Dashboard Data with Realistic Metrics
-- Description: Truncates existing movements/orders and injects new data to match ~R$ 1.850,00 monthly cost and specific department distribution.

-- 1. Clean up existing transaction data to ensure metrics are accurate
TRUNCATE public.inventory_movements CASCADE;
TRUNCATE public.orders CASCADE;

-- 2. Ensure Departments Exist and Match Requirements
-- Update existing "Vendas" to "Vendas B2B" if present to avoid duplicates
UPDATE public.departments SET name = 'Vendas B2B' WHERE name = 'Vendas';

INSERT INTO public.departments (name) VALUES 
('Vendas B2B'), 
('Marketing'), 
('Engenharia'), 
('RH')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Items with Specific Costs
-- We use upsert to ensure items exist with correct costs
-- Kit Boas Vindas: R$ 50.00
INSERT INTO public.items (name, description, category, unit_cost, current_stock, image_url, price)
VALUES ('Kit Boas Vindas', 'Kit básico para novos colaboradores', 'Kits', 50.00, 100, 'welcome kit', 50.00)
ON CONFLICT (id) DO UPDATE SET unit_cost = 50.00;

-- Mochila Tech: R$ 100.00
INSERT INTO public.items (name, description, category, unit_cost, current_stock, image_url, price)
VALUES ('Mochila Tech', 'Mochila reforçada para notebook', 'Utensílios', 100.00, 50, 'black backpack', 150.00)
ON CONFLICT (id) DO UPDATE SET unit_cost = 100.00;

-- Garrafa Térmica: R$ 25.00
INSERT INTO public.items (name, description, category, unit_cost, current_stock, image_url, price)
VALUES ('Garrafa Térmica', 'Garrafa preta 500ml', 'Utensílios', 25.00, 200, 'thermos bottle', 40.00)
ON CONFLICT (id) DO UPDATE SET unit_cost = 25.00;

-- 4. Assign Employees to Departments and Insert Movements
DO $
DECLARE
  -- Department IDs
  dept_vendas UUID;
  dept_mkt UUID;
  dept_eng UUID;
  dept_rh UUID;
  
  -- Employee IDs
  emp_vendas UUID;
  emp_mkt UUID;
  emp_eng UUID;
  emp_rh UUID;
  
  -- Item IDs
  item_kit UUID;    -- 50
  item_mochila UUID; -- 100
  item_garrafa UUID; -- 25
  
  -- Timestamps
  now_ts TIMESTAMP := NOW();
  prev_month_ts TIMESTAMP := NOW() - INTERVAL '1 month';
BEGIN
  -- Fetch Dept IDs
  SELECT id INTO dept_vendas FROM public.departments WHERE name = 'Vendas B2B' LIMIT 1;
  SELECT id INTO dept_mkt FROM public.departments WHERE name = 'Marketing' LIMIT 1;
  SELECT id INTO dept_eng FROM public.departments WHERE name = 'Engenharia' LIMIT 1;
  SELECT id INTO dept_rh FROM public.departments WHERE name = 'RH' LIMIT 1;

  -- Fetch Item IDs by name (assuming names are unique enough from upserts above)
  SELECT id INTO item_kit FROM public.items WHERE name = 'Kit Boas Vindas' LIMIT 1;
  SELECT id INTO item_mochila FROM public.items WHERE name = 'Mochila Tech' LIMIT 1;
  SELECT id INTO item_garrafa FROM public.items WHERE name = 'Garrafa Térmica' LIMIT 1;

  -- Assign & Fetch Employees
  -- Vendas B2B Employee
  SELECT id INTO emp_vendas FROM public.employees WHERE email = 'lucas.paiva@adapta.org';
  IF emp_vendas IS NOT NULL THEN
    UPDATE public.employees SET department_id = dept_vendas WHERE id = emp_vendas;
  ELSE
    SELECT id INTO emp_vendas FROM public.employees LIMIT 1; -- Fallback
    UPDATE public.employees SET department_id = dept_vendas WHERE id = emp_vendas;
  END IF;

  -- Marketing Employee
  SELECT id INTO emp_mkt FROM public.employees WHERE email = 'bia@adapta.org';
  IF emp_mkt IS NOT NULL THEN
    UPDATE public.employees SET department_id = dept_mkt WHERE id = emp_mkt;
  ELSE
    SELECT id INTO emp_mkt FROM public.employees WHERE id != emp_vendas LIMIT 1;
    UPDATE public.employees SET department_id = dept_mkt WHERE id = emp_mkt;
  END IF;

  -- Engenharia Employee
  SELECT id INTO emp_eng FROM public.employees WHERE email = 'joao.silva@adapta.org';
  IF emp_eng IS NOT NULL THEN
    UPDATE public.employees SET department_id = dept_eng WHERE id = emp_eng;
  ELSE
    SELECT id INTO emp_eng FROM public.employees WHERE id NOT IN (emp_vendas, emp_mkt) LIMIT 1;
    UPDATE public.employees SET department_id = dept_eng WHERE id = emp_eng;
  END IF;

  -- RH Employee
  SELECT id INTO emp_rh FROM public.employees WHERE email = 'maria.oliveira@adapta.org';
  IF emp_rh IS NOT NULL THEN
    UPDATE public.employees SET department_id = dept_rh WHERE id = emp_rh;
  ELSE
    SELECT id INTO emp_rh FROM public.employees WHERE id NOT IN (emp_vendas, emp_mkt, emp_eng) LIMIT 1;
    UPDATE public.employees SET department_id = dept_rh WHERE id = emp_rh;
  END IF;

  -- 5. Insert Inventory Movements (OUT) for Current Month
  -- Target ~ R$ 1.850,00
  -- Distribution: Vendas 40%, Mkt 30%, Eng 20%, RH 10%

  -- Vendas B2B (~740 R$) -> 7 Mochilas (700) + 1 Kit (50) = 750
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_vendas, 'OUT', 7, 'Premiação Q1', now_ts),
  (gen_random_uuid(), item_kit, emp_vendas, 'OUT', 1, 'Novo Cliente', now_ts);

  -- Marketing (~555 R$) -> 5 Mochilas (500) + 2 Garrafas (50) = 550
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_mkt, 'OUT', 5, 'Evento Marketing', now_ts),
  (gen_random_uuid(), item_garrafa, emp_mkt, 'OUT', 2, 'Brinde Cliente', now_ts);

  -- Engenharia (~370 R$) -> 3 Mochilas (300) + 1 Kit (50) + 1 Garrafa (25) = 375
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_eng, 'OUT', 3, 'Hackathon', now_ts),
  (gen_random_uuid(), item_kit, emp_eng, 'OUT', 1, 'Novo Dev', now_ts),
  (gen_random_uuid(), item_garrafa, emp_eng, 'OUT', 1, 'Reposição', now_ts);

  -- RH (~185 R$) -> 1 Mochila (100) + 1 Kit (50) + 1 Garrafa (25) = 175
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_rh, 'OUT', 1, 'Sorteio', now_ts),
  (gen_random_uuid(), item_kit, emp_rh, 'OUT', 1, 'Kit Novo RH', now_ts),
  (gen_random_uuid(), item_garrafa, emp_rh, 'OUT', 1, 'Uso Interno', now_ts);

  -- 6. Insert Historical Data (Previous Month) for context
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_vendas, 'OUT', 2, 'Antigo', prev_month_ts),
  (gen_random_uuid(), item_garrafa, emp_eng, 'OUT', 5, 'Antigo', prev_month_ts);
END $;

