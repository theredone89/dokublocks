import { neon } from '@netlify/neon';

const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing database connection string. Set NETLIFY_DATABASE_URL or DATABASE_URL.');
  process.exit(1);
}

const sql = neon(connectionString);

await sql`
  CREATE TABLE IF NOT EXISTS scores (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

console.log('Database migration completed successfully.');
