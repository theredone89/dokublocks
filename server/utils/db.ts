import { neon } from '@netlify/neon';
import { useRuntimeConfig } from '#imports';

let initialized = false;

function getSqlClient() {
  const config = useRuntimeConfig();
  const connectionString = config.neonDatabaseUrl;

  if (!connectionString) {
    throw new Error('Missing Neon database connection string. Set NETLIFY_DATABASE_URL or DATABASE_URL.');
  }

  return neon(connectionString);
}

export function hasNeonConfig() {
  const config = useRuntimeConfig();
  return Boolean(config.neonDatabaseUrl);
}

export async function ensureScoresTable() {
  if (initialized) {
    return;
  }

  const sql = getSqlClient();
  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(20) NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  initialized = true;
}

export function getSql() {
  return getSqlClient();
}
