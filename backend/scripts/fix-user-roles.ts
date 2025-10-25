import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false,
});

async function fixUserRoles() {
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    console.log('Creating association between admin user and Administrador role...\n');

    // Get user and role IDs from demo schema
    const [user] = await dataSource.query(`SELECT id, email FROM demo.users WHERE email = 'admin@demo.com'`);
    const [role] = await dataSource.query(`SELECT id, nome FROM demo.roles WHERE nome = 'Administrador'`);

    if (user && role) {
      console.log(`User ID: ${user.id} (${user.email})`);
      console.log(`Role ID: ${role.id} (${role.nome})`);

      // Insert into demo.user_roles
      await dataSource.query(`
        INSERT INTO demo.user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [user.id, role.id]);

      console.log('\n✅ Created user_roles association!');
    } else {
      console.log('⚠️  User or role not found!');
    }

    // Verify
    console.log('\n=== VERIFICATION ===');
    const demoUserRoles = await dataSource.query(`
      SELECT ur.user_id, ur.role_id, u.email, r.nome as role_name
      FROM demo.user_roles ur
      LEFT JOIN demo.users u ON u.id = ur.user_id
      LEFT JOIN demo.roles r ON r.id = ur.role_id
    `);
    console.table(demoUserRoles);

    await dataSource.destroy();
    console.log('\n✅ Fix complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixUserRoles();
