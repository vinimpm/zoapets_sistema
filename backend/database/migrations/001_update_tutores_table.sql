-- Migration: Update tutores table structure
-- Date: 2025-10-23
-- Description: Alinha a estrutura da tabela tutores com a entity do backend

DO $$
DECLARE
  schema_name TEXT;
BEGIN
  -- Loop through all tenant schemas
  FOR schema_name IN
    SELECT nspname
    FROM pg_namespace
    WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'public')
    AND nspname NOT LIKE 'pg_%'
  LOOP
    RAISE NOTICE 'Updating schema: %', schema_name;

    -- Check if table exists
    IF EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = schema_name
      AND tablename = 'tutores'
    ) THEN
      -- Rename columns if they exist (old structure)
      IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'nome'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores RENAME COLUMN nome TO nome_completo', schema_name);
        RAISE NOTICE 'Renamed nome to nome_completo in %', schema_name;
      END IF;

      IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'telefone'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores RENAME COLUMN telefone TO telefone_principal', schema_name);
        RAISE NOTICE 'Renamed telefone to telefone_principal in %', schema_name;
      END IF;

      IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'celular'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores RENAME COLUMN celular TO telefone_secundario', schema_name);
        RAISE NOTICE 'Renamed celular to telefone_secundario in %', schema_name;
      END IF;

      -- Drop old endereco column if exists
      IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'endereco'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores DROP COLUMN IF EXISTS endereco', schema_name);
        RAISE NOTICE 'Dropped endereco column in %', schema_name;
      END IF;

      -- Add new columns if they don't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'endereco_completo'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores ADD COLUMN endereco_completo JSONB', schema_name);
        RAISE NOTICE 'Added endereco_completo column in %', schema_name;
      END IF;

      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'data_nascimento'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores ADD COLUMN data_nascimento DATE', schema_name);
        RAISE NOTICE 'Added data_nascimento column in %', schema_name;
      END IF;

      IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = schema_name
        AND table_name = 'tutores'
        AND column_name = 'profissao'
      ) THEN
        EXECUTE format('ALTER TABLE %I.tutores ADD COLUMN profissao VARCHAR(100)', schema_name);
        RAISE NOTICE 'Added profissao column in %', schema_name;
      END IF;

      -- Alter column constraints (make email and telefone_principal NOT NULL if not already)
      EXECUTE format('
        ALTER TABLE %I.tutores
        ALTER COLUMN email SET NOT NULL,
        ALTER COLUMN telefone_principal SET NOT NULL,
        ALTER COLUMN cpf SET NOT NULL
      ', schema_name);

      RAISE NOTICE 'Updated column constraints in %', schema_name;

    ELSE
      RAISE NOTICE 'Table tutores does not exist in schema %', schema_name;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migration completed successfully!';
END $$;
