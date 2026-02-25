-- 1. Deduplicate public.employees
DO $$
DECLARE
  dup_record RECORD;
  kept_id UUID;
  dup_id UUID;
BEGIN
  FOR dup_record IN
    SELECT email, array_agg(id ORDER BY created_at ASC) as ids
    FROM public.employees
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING count(*) > 1
  LOOP
    kept_id := dup_record.ids[1];
    
    FOR i IN 2..array_length(dup_record.ids, 1) LOOP
      dup_id := dup_record.ids[i];
      
      -- Update reference: orders
      UPDATE public.orders SET employee_id = kept_id WHERE employee_id = dup_id;
      
      -- Update reference: inventory_movements
      UPDATE public.inventory_movements SET employee_id = kept_id WHERE employee_id = dup_id;
      
      -- Handle reference: campaign_responses (avoid UNIQUE constraint violation)
      DELETE FROM public.campaign_responses 
      WHERE employee_id = dup_id 
        AND campaign_id IN (
          SELECT campaign_id FROM public.campaign_responses WHERE employee_id = kept_id
        );
        
      UPDATE public.campaign_responses SET employee_id = kept_id WHERE employee_id = dup_id;
      
      -- Delete the duplicate employee record
      DELETE FROM public.employees WHERE id = dup_id;
    END LOOP;
  END LOOP;
END $$;

-- 2. Deduplicate auth.users
DO $$
DECLARE
  dup_record RECORD;
  kept_id UUID;
  dup_id UUID;
BEGIN
  FOR dup_record IN
    SELECT email, array_agg(id ORDER BY created_at ASC) as ids
    FROM auth.users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING count(*) > 1
  LOOP
    kept_id := dup_record.ids[1];
    
    FOR i IN 2..array_length(dup_record.ids, 1) LOOP
      dup_id := dup_record.ids[i];
      
      -- Delete the duplicate user record.
      -- Supabase GoTrue handles cascading deletes for identities, sessions, etc.
      DELETE FROM auth.users WHERE id = dup_id;
    END LOOP;
  END LOOP;
END $$;

-- 3. Fix Auth Table Standards (avoid NULLs in specific string columns)
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- 4. Fix Auth Phone Constraint (must be NULL, not empty string)
UPDATE auth.users
SET phone = NULL
WHERE phone = '';
