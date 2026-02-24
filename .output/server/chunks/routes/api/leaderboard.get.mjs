import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { h as hasNeonConfig, r as readScoresFile, e as ensureScoresTable, g as getSql } from '../../_/scores-file.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@netlify/neon';

const leaderboard_get = defineEventHandler(async () => {
  try {
    if (!hasNeonConfig()) {
      const scores = await readScoresFile();
      const data2 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
      return {
        success: true,
        data: data2
      };
    }
    await ensureScoresTable();
    const sql = getSql();
    const rows = await sql`
      SELECT id, username, score, created_at
      FROM scores
      ORDER BY score DESC, created_at ASC
      LIMIT 10
    `;
    const typedRows = rows;
    const data = typedRows.map((row) => ({
      id: Number(row.id),
      username: row.username,
      score: Number(row.score),
      timestamp: new Date(row.created_at).toISOString()
    }));
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      success: false,
      error: "Failed to fetch leaderboard"
    };
  }
});

export { leaderboard_get as default };
//# sourceMappingURL=leaderboard.get.mjs.map
