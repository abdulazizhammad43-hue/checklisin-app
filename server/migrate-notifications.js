import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE defects ADD COLUMN IF NOT EXISTS notification_time INTEGER DEFAULT NULL;
    `);
    console.log('Added notification_time column');
    
    await pool.query(`
      ALTER TABLE defects ADD COLUMN IF NOT EXISTS notification_at TIMESTAMP DEFAULT NULL;
    `);
    console.log('Added notification_at column');
    
    await pool.query(`
      ALTER TABLE defects ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE;
    `);
    console.log('Added is_notified column');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

migrate();
