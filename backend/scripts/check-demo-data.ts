import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false,
});

async function checkDemoData() {
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Check users in demo schema
    console.log('=== USERS IN DEMO SCHEMA ===');
    const demoUsers = await dataSource.query(`SELECT id, email, nome_completo, ativo FROM demo.users`);
    console.table(demoUsers);

    // Check roles in demo schema
    console.log('\n=== ROLES IN DEMO SCHEMA ===');
    const demoRoles = await dataSource.query(`SELECT id, nome, descricao FROM demo.roles`);
    console.table(demoRoles);

    // Check permissions in demo schema
    console.log('\n=== PERMISSIONS IN DEMO SCHEMA ===');
    const demoPermissions = await dataSource.query(`SELECT COUNT(*) as total FROM demo.permissions`);
    console.table(demoPermissions);

    // Check user_roles junction table
    console.log('\n=== USER_ROLES IN DEMO SCHEMA ===');
    const userRoles = await dataSource.query(`
      SELECT ur.user_id, ur.role_id, u.email, r.nome as role_name
      FROM demo.user_roles ur
      LEFT JOIN demo.users u ON u.id = ur.user_id
      LEFT JOIN demo.roles r ON r.id = ur.role_id
    `);
    console.table(userRoles);

    // Check what happens when we set search_path
    console.log('\n=== TESTING SEARCH_PATH ===');
    await dataSource.query(`SET search_path TO demo, public`);
    console.log('Set search_path to "demo, public"');

    const usersViaSearchPath = await dataSource.query(`SELECT id, email, nome_completo FROM users LIMIT 1`);
    console.log('\nQuery: SELECT * FROM users (using search_path)');
    console.table(usersViaSearchPath);

    const rolesViaSearchPath = await dataSource.query(`SELECT id, nome FROM roles LIMIT 5`);
    console.log('\nQuery: SELECT * FROM roles (using search_path)');
    console.table(rolesViaSearchPath);

    await dataSource.destroy();
    console.log('\n✅ Check complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkDemoData();
