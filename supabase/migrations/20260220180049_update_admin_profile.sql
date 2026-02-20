-- Update admin profile in employees table
UPDATE public.employees
SET
  name = 'Gabriel Santos',
  avatar_url = 'https://gabrielsantos.work/wp-content/uploads/2026/02/gabrielsantos.jpg'
WHERE email = 'admin@adapta.org';

-- Update admin profile in auth.users metadata to maintain consistency
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{name}', '"Gabriel Santos"')
WHERE email = 'admin@adapta.org';
