import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
});

async function checkDemoUser() {
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Check users in demo schema
    const users = await dataSource.query(`SELECT id, email, nome_completo, ativo FROM demo.users`);
    console.log('👤 Users in demo schema:');
    console.table(users);

    // Check roles in demo schema
    const roles = await dataSource.query(`SELECT id, nome, descricao FROM demo.roles`);
    console.log('\n🔒 Roles in demo schema:');
    console.table(roles);

    await dataSource.destroy();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDemoUser();
