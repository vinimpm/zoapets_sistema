import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false,
});

async function createTenantUsersTable() {
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Step 1: Create tenant_users table in public schema
    console.log('Creating public.tenant_users table...\n');

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS public.tenant_users (
        email VARCHAR(255) PRIMARY KEY,
        tenant_slug VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on tenant_slug for faster lookups
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_slug
      ON public.tenant_users(tenant_slug);
    `);

    console.log('✅ Table created successfully!\n');

    // Step 2: Get all existing schemas (tenants)
    console.log('Finding all tenant schemas...\n');

    const schemas = await dataSource.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `);

    console.log(`Found ${schemas.length} tenant schema(s):\n`);
    console.table(schemas);

    // Step 3: Populate tenant_users with emails from each schema
    console.log('\nPopulating tenant_users table...\n');

    for (const { schema_name } of schemas) {
      console.log(`Processing schema: ${schema_name}`);

      // Get all users from this tenant schema
      const users = await dataSource.query(`
        SELECT email FROM "${schema_name}".users WHERE ativo = true
      `);

      console.log(`  Found ${users.length} active user(s)`);

      // Insert each user email with their tenant_slug
      for (const user of users) {
        await dataSource.query(`
          INSERT INTO public.tenant_users (email, tenant_slug)
          VALUES ($1, $2)
          ON CONFLICT (email) DO UPDATE
          SET tenant_slug = EXCLUDED.tenant_slug,
              updated_at = CURRENT_TIMESTAMP
        `, [user.email, schema_name]);

        console.log(`  ✓ Registered: ${user.email} → ${schema_name}`);
      }
    }

    // Step 4: Verify the results
    console.log('\n=== VERIFICATION ===');
    const allMappings = await dataSource.query(`
      SELECT email, tenant_slug, created_at
      FROM public.tenant_users
      ORDER BY tenant_slug, email
    `);

    console.log(`\nTotal email-to-tenant mappings: ${allMappings.length}\n`);
    console.table(allMappings);

    await dataSource.destroy();
    console.log('\n✅ Setup complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createTenantUsersTable();
