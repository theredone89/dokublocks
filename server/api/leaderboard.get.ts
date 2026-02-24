import { defineEventHandler } from 'h3';
import { ensureScoresTable, getSql, hasNeonConfig } from '../utils/db';
import { readScoresFile } from '../utils/scores-file';

export default defineEventHandler(async () => {
  try {
    if (!hasNeonConfig()) {
      const scores = await readScoresFile();
      const data = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return {
        success: true,
        data
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

    type LeaderboardRow = {
      id: number | string;
      username: string;
      score: number | string;
      created_at: string | Date;
    };

    const typedRows = rows as LeaderboardRow[];

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
    console.error('Error fetching leaderboard:', error);
    return {
      success: false,
      error: 'Failed to fetch leaderboard'
    };
  }
});
