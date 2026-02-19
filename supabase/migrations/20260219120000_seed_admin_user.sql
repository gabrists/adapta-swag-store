-- Enable pgcrypto if not already enabled (required for gen_salt and crypt)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Anonymous block to handle user seeding with variables
DO $$
DECLARE
  new_user_id UUID := '956e933f-3fb1-478e-be45-dd4d54ebe02c'; -- Fixed UUID for consistency
BEGIN
  -- Only insert if the user with this email does not exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@adapta.org') THEN
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@adapta.org',
      crypt('123', gen_salt('bf')), -- Password is '123'
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin Adapta"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert into auth.identities (Required for some auth flows)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      json_build_object('sub', new_user_id, 'email', 'admin@adapta.org'),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );

    -- Insert into public.employees to ensure application data consistency
    INSERT INTO public.employees (id, name, email, department_id, role, avatar_url)
    VALUES (
      new_user_id,
      'Admin Adapta',
      'admin@adapta.org',
      (SELECT id FROM public.departments WHERE name = 'RH' LIMIT 1),
      'Administrator',
      'https://img.usecurling.com/ppl/medium?gender=male&seed=admin'
    );
    
  END IF;
END $$;
