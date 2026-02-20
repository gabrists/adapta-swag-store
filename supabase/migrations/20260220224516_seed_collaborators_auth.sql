-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    dept_id UUID;
    r RECORD;
    target_id UUID;
BEGIN
    -- Get default department for new employees
    SELECT id INTO dept_id FROM public.departments WHERE name = 'Engenharia' LIMIT 1;
    IF dept_id IS NULL THEN
        SELECT id INTO dept_id FROM public.departments LIMIT 1;
    END IF;

    -- Create temporary table to hold the new list
    CREATE TEMP TABLE sync_employees (
        name TEXT,
        email TEXT
    );

    -- Insert raw data from the new synchronization list
    INSERT INTO sync_employees (name, email) VALUES
    ('Allan Baptista', 'allan@adapta.org'),
    ('Angelo Nuncio Pinheiro', 'angelo@adapta.org'),
    ('Arthur da Fonte Guerra', 'arthur@adapta.org'),
    ('Axel Ríos', 'axel@adapta.org'),
    ('Ben Schulze', 'ben@adapta.org'),
    ('Bia', 'maria.beatriz@adapta.org'),
    ('Braga', 'olalucasbraga@gmail.com'),
    ('Caio Filip Juliaci', 'caio.juliaci@adapta.org'),
    ('Davi Cunha', 'davicunha3454@gmail.com'),
    ('Davy Pedrosa', 'davy@adapta.org'),
    ('Edson Muniz', 'edson@adapta.org'),
    ('Eduarda Almeida', 'eduarda@adapta.org'),
    ('Eduardo Coelho', 'eduardo@copyexperts.com.br'),
    ('Erica Ayumi', 'erica@adapta.org'),
    ('Ezequiel', 'ezequiel.santos@adapta.org'),
    ('Felipe Batista', 'felipe.batista@adapta.org'),
    ('Felipe Mamede', 'felipe@adapta.org'),
    ('Felipe Navaar', 'navaar@adapta.org'),
    ('Felipe Oliveira Garcia', 'felipe.garcia@adapta.org'),
    ('Felipe Peixoto', 'felipe.peixoto@adapta.org'),
    ('Fellipe Carvalho', 'felipe.carvalho@adapta.org'),
    ('Fellipe Carvalho', 'fellipe@adapta.org'),
    ('Fernando Mascarenhas', 'fernando.mascarenhas@adapta.org'),
    ('Fernando Sousa', 'fernando@adapta.org'),
    ('Gabriel Carvalho', 'gabriel.alexandre@adapta.org'),
    ('Gabriel Henrique', 'gabriel.henrique@adapta.org'),
    ('Gabriel Jesus', 'gabrieljesus@adapta.org'),
    ('Gabriel Pavão', 'Gabriel.pavao@adapta.org'),
    ('Giampaolo Lepore', 'giam@adapta.org'),
    ('Guilherme Lago', 'guilhermeoliveira@adapta.org'),
    ('Guilherme Teofilo', 'guilherme.lauer@adapta.org'),
    ('Gustavo Fonseca', 'gustavo@adapta.org'),
    ('Hamú', 'marcelo.hamu@adapta.org'),
    ('Ian Ede', 'ian@adapta.org'),
    ('Ingrid Costa', 'ingrid@adapta.org'),
    ('Isadora Magri', 'isadora@adapta.org'),
    ('Izabel Villyn', 'izabel@adapta.org'),
    ('Jadson Consolini', 'jadson@copyexperts.com.br'),
    ('Jamilson Scarcella', 'scarcella.junior@gmail.com'),
    ('Jessica Ferreira', 'adm@adapta.org'),
    ('João Augusto', 'joao@adapta.org'),
    ('João Ferrari', 'joaovitorferrari2017@gmail.com'),
    ('João Locatelli', 'joao.locatelli@adapta.org'),
    ('João Vitor Andrade Estrela', 'contact.joaovitorandrade@gmail.com'),
    ('Joao Vitor Ferrari', 'ferrari@adapta.org'),
    ('Juan Bonfim', 'juan@copyexperts.com.br'),
    ('Julia Pereira Cruz', 'julia@adapta.org'),
    ('Kaike Mota', 'kaikemsantana@gmail.com'),
    ('Kelvi Maycon', 'kelvi@adapta.org'),
    ('Kelvin Dutra', 'kelvin@adapta.org'),
    ('Kelvyn Holovecki', 'kelvyn@adapta.org'),
    ('Kimberly Prestes', 'kimberly@adapta.org'),
    ('Léo Camargo', 'leonardo@adapta.org'),
    ('Léo Marinho', 'leonardo.marinho@adapta.org'),
    ('Lucas Andrade', 'lucas.andrade@adapta.org'),
    ('Lucas Bueno', 'bueno@adapta.org'),
    ('Lucas Dias', 'lucas.dias@adapta.org'),
    ('Lucas Machado', 'lucas.machado@adapta.org'),
    ('lucas paiva', 'lcspaiva87@gmail.com'),
    ('Lucas Pereira', 'lucas.pereira@adapta.org'),
    ('Lucas Richard', 'lucas.silva@adapta.org'),
    ('Lucas Romcy', 'lucas.romcy@adapta.org'),
    ('Lucas Vin', 'lucas@copyexperts.com.br'),
    ('Lucas Yuri', 'lymeelo@gmail.com'),
    ('Luis Fernando', 'luissousaof@gmail.com'),
    ('Luis Miguel', 'luimgfra@gmail.com'),
    ('Lydia', 'lydia@adapta.org'),
    ('Márcia Ertel', 'marcia@adapta.org'),
    ('Marcos Cury', 'marcos.cury@adapta.org'),
    ('Mateus Tápias', 'mateustapias2015@gmail.com'),
    ('Matheus Kubo', 'kubo@adapta.org'),
    ('Matheus Prado', 'matheus@adapta.org'),
    ('Matheus Sotto', 'matheus.sotto@adapta.org'),
    ('Max', 'max@adapta.org'),
    ('Miguel Carvalho de Medeiros', 'miguel@adapta.org'),
    ('Miguel Souza Dias', 'miguel.dias@adapta.org'),
    ('Monike Leal', 'monike.leal@adapta.org'),
    ('Patrick Peters', 'patrick@adapta.org'),
    ('Paulo Zanquetta', 'paulo@adapta.org'),
    ('Priscilla Petry', 'priscilla@adapta.org'),
    ('Rafael Cabral', 'rafaelcabral@adapta.org'),
    ('Raphael Araujo', 'raphael@adapta.org'),
    ('Raphaela Castro', 'raphaela.castro@adapta.org'),
    ('Rodrigo A. Santos', 'rodrigo@adapta.org'),
    ('Romario', 'romario@adapta.org'),
    ('Ruan Azevedo', 'ruan.azevedo@adapta.org'),
    ('Ruan Azevedo', 'ruan.azevedo@gmail.com'),
    ('Samyla Vidal', 'samyla.vidal@adapta.org'),
    ('Tainara Oliveira', 'tainara@adapta.org'),
    ('Themila Andrade', 'themila@adapta.org'),
    ('Thiago Machado', 'contatocostathiago@gmail.com'),
    ('Vinicius Galetti', 'vinicius@adapta.org'),
    ('Yuri', 'yuri@adapta.org');

    -- Process each employee to ensure they exist in auth.users and public.employees
    FOR r IN SELECT name, LOWER(email) AS email FROM sync_employees
    LOOP
        target_id := NULL;
        
        -- Priority 1: Check if an auth user already exists for this email
        SELECT id INTO target_id FROM auth.users WHERE LOWER(email) = r.email LIMIT 1;
        
        -- Priority 2: Check if a public.employee record already exists
        IF target_id IS NULL THEN
            SELECT id INTO target_id FROM public.employees WHERE LOWER(email) = r.email LIMIT 1;
        END IF;
        
        -- If no record in either table, generate a new UUID
        IF target_id IS NULL THEN
            target_id := gen_random_uuid();
        END IF;

        -- Provision Auth User (if not already existing)
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = r.email) THEN
            -- CRITICAL: Insert with empty strings for tokens, but NULL for phone to prevent duplicate phone unique constraint violation
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
                recovery_token,
                email_change_token_new,
                email_change,
                email_change_token_current,
                phone,
                phone_change,
                phone_change_token,
                reauthentication_token
            ) VALUES (
                target_id,
                '00000000-0000-0000-0000-000000000000',
                'authenticated',
                'authenticated',
                r.email,
                crypt('123', gen_salt('bf')), -- Default password
                now(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('name', r.name),
                now(),
                now(),
                '', '', '', '', '', NULL, '', '', ''
            );

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
                target_id,
                json_build_object('sub', target_id, 'email', r.email),
                'email',
                target_id::text,
                now(),
                now(),
                now()
            );
        END IF;

        -- Upsert Employee Record in public schema
        -- If there is a conflict on email, we ensure the name and avatar are updated
        INSERT INTO public.employees (id, name, email, department_id, role, avatar_url)
        VALUES (
            target_id,
            r.name,
            r.email,
            dept_id,
            'Colaborador',
            'https://img.usecurling.com/ppl/thumbnail?seed=' || split_part(r.email, '@', 1)
        )
        ON CONFLICT (email) DO UPDATE
        SET 
            name = EXCLUDED.name,
            avatar_url = EXCLUDED.avatar_url;

    END LOOP;

    -- Cleanup
    DROP TABLE sync_employees;
END $$;
