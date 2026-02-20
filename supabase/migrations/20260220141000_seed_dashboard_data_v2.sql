-- Migration: Seed Dashboard Data with Accurate R$ 1850 Metrics (V2)
-- Description: Truncates existing movements/orders and injects new data to exactly match R$ 1.850,00 monthly cost and specific department distribution (40%, 30%, 20%, 10%).

-- 1. Clean up existing transaction data
TRUNCATE public.inventory_movements CASCADE;
TRUNCATE public.orders CASCADE;

-- 2. Ensure Departments Exist and Match Requirements
UPDATE public.departments SET name = 'Vendas B2B' WHERE name = 'Vendas';

INSERT INTO public.departments (name) VALUES 
('Vendas B2B'), 
('Marketing'), 
('Engenharia'), 
('RH')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Items with Specific Costs to hit the R$ 1850 perfectly
-- Mochila Tech: R$ 100.00
INSERT INTO public.items (name, description, category, unit_cost, current_stock, image_url, price)
VALUES ('Mochila Tech', 'Mochila premium', 'Utensílios', 100.00, 150, 'black tech backpack', 150.00)
ON CONFLICT (id) DO UPDATE SET unit_cost = 100.00;

-- Kit Boas Vindas: R$ 40.00
INSERT INTO public.items (name, description, category, unit_cost, current_stock, image_url, price)
VALUES ('Kit Boas Vindas', 'Kit básico', 'Kits', 40.00, 200, 'welcome kit', 60.00)
ON CONFLICT (id) DO UPDATE SET unit_cost = 40.00;

-- Garrafa Térmica: R$ 15.00
INSERT INTO public.items (name, description, category, unit_cost, current_stock, image_url, price)
VALUES ('Garrafa Térmica', 'Garrafa 500ml', 'Utensílios', 15.00, 300, 'thermos bottle', 25.00)
ON CONFLICT (id) DO UPDATE SET unit_cost = 15.00;

-- 4. Assign Employees to Departments and Insert Movements
DO $$
DECLARE
  dept_vendas UUID;
  dept_mkt UUID;
  dept_eng UUID;
  dept_rh UUID;
  
  emp_vendas UUID;
  emp_mkt UUID;
  emp_eng UUID;
  emp_rh UUID;
  
  item_mochila UUID; -- R$ 100
  item_kit UUID;     -- R$ 40
  item_garrafa UUID; -- R$ 15
  
  now_ts TIMESTAMP := NOW();
  prev_month_ts TIMESTAMP := NOW() - INTERVAL '1 month';
BEGIN
  -- Fetch Dept IDs
  SELECT id INTO dept_vendas FROM public.departments WHERE name = 'Vendas B2B' LIMIT 1;
  SELECT id INTO dept_mkt FROM public.departments WHERE name = 'Marketing' LIMIT 1;
  SELECT id INTO dept_eng FROM public.departments WHERE name = 'Engenharia' LIMIT 1;
  SELECT id INTO dept_rh FROM public.departments WHERE name = 'RH' LIMIT 1;

  -- Fetch Item IDs
  SELECT id INTO item_mochila FROM public.items WHERE name = 'Mochila Tech' LIMIT 1;
  SELECT id INTO item_kit FROM public.items WHERE name = 'Kit Boas Vindas' LIMIT 1;
  SELECT id INTO item_garrafa FROM public.items WHERE name = 'Garrafa Térmica' LIMIT 1;

  -- Ensure we have at least 4 employees
  INSERT INTO public.employees (email, name, role) VALUES 
  ('lucas.vendas@adapta.org', 'Lucas (Vendas)', 'user'),
  ('bia.mkt@adapta.org', 'Bia (Marketing)', 'user'),
  ('joao.eng@adapta.org', 'João (Engenharia)', 'user'),
  ('maria.rh@adapta.org', 'Maria (RH)', 'user')
  ON CONFLICT (email) DO NOTHING;

  -- Assign Employees to Departments
  SELECT id INTO emp_vendas FROM public.employees WHERE email = 'lucas.vendas@adapta.org';
  UPDATE public.employees SET department_id = dept_vendas WHERE id = emp_vendas;

  SELECT id INTO emp_mkt FROM public.employees WHERE email = 'bia.mkt@adapta.org';
  UPDATE public.employees SET department_id = dept_mkt WHERE id = emp_mkt;

  SELECT id INTO emp_eng FROM public.employees WHERE email = 'joao.eng@adapta.org';
  UPDATE public.employees SET department_id = dept_eng WHERE id = emp_eng;

  SELECT id INTO emp_rh FROM public.employees WHERE email = 'maria.rh@adapta.org';
  UPDATE public.employees SET department_id = dept_rh WHERE id = emp_rh;

  -- 5. Insert Inventory Movements (OUT) for Current Month
  -- Target: R$ 1.850,00

  -- Vendas B2B: 40% = R$ 740,00 -> 7 Mochilas (700) + 1 Kit (40)
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_vendas, 'OUT', 7, 'Premiação Q1', now_ts),
  (gen_random_uuid(), item_kit, emp_vendas, 'OUT', 1, 'Novo Cliente', now_ts);

  -- Marketing: 30% = R$ 555,00 -> 5 Mochilas (500) + 1 Kit (40) + 1 Garrafa (15)
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_mkt, 'OUT', 5, 'Evento Externo', now_ts),
  (gen_random_uuid(), item_kit, emp_mkt, 'OUT', 1, 'Campanha Influencer', now_ts),
  (gen_random_uuid(), item_garrafa, emp_mkt, 'OUT', 1, 'Sorteio Social', now_ts);

  -- Engenharia: 20% = R$ 370,00 -> 3 Mochilas (300) + 1 Kit (40) + 2 Garrafas (30)
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_eng, 'OUT', 3, 'Hackathon', now_ts),
  (gen_random_uuid(), item_kit, emp_eng, 'OUT', 1, 'Onboarding Dev', now_ts),
  (gen_random_uuid(), item_garrafa, emp_eng, 'OUT', 2, 'Uso Interno', now_ts);

  -- RH: 10% = R$ 185,00 -> 1 Mochila (100) + 1 Kit (40) + 3 Garrafas (45)
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_rh, 'OUT', 1, 'Sorteio Aniversariantes', now_ts),
  (gen_random_uuid(), item_kit, emp_rh, 'OUT', 1, 'Integração', now_ts),
  (gen_random_uuid(), item_garrafa, emp_rh, 'OUT', 3, 'Brindes Treinamento', now_ts);

  -- 6. Insert Historical Data (Previous Month) for context
  INSERT INTO public.inventory_movements (group_id, item_id, employee_id, type, quantity, destination, created_at)
  VALUES 
  (gen_random_uuid(), item_mochila, emp_vendas, 'OUT', 2, 'Antigo B2B', prev_month_ts),
  (gen_random_uuid(), item_garrafa, emp_eng, 'OUT', 5, 'Antigo Eng', prev_month_ts);
END $$;
