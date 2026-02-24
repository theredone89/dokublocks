import { u as useRuntimeConfig } from '../nitro/nitro.mjs';
import { neon } from '@netlify/neon';
import { promises } from 'node:fs';
import { resolve } from 'node:path';

let initialized = false;
function getSqlClient() {
  const config = useRuntimeConfig();
  const connectionString = config.neonDatabaseUrl;
  if (!connectionString) {
    throw new Error("Missing Neon database connection string. Set NETLIFY_DATABASE_URL or DATABASE_URL.");
  }
  return neon(connectionString);
}
function hasNeonConfig() {
  const config = useRuntimeConfig();
  return Boolean(config.neonDatabaseUrl);
}
async function ensureScoresTable() {
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
function getSql() {
  return getSqlClient();
}

const scoresPath = resolve(process.cwd(), "db/scores.json");
async function readScoresFile() {
  try {
    const raw = await promises.readFile(scoresPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
async function writeScoresFile(scores) {
  await promises.writeFile(scoresPath, JSON.stringify(scores, null, 2));
}

export { ensureScoresTable as e, getSql as g, hasNeonConfig as h, readScoresFile as r, writeScoresFile as w };
//# sourceMappingURL=scores-file.mjs.map
