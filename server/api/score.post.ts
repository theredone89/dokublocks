import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { ensureScoresTable, getSql, hasNeonConfig } from '../utils/db';
import { readScoresFile, writeScoresFile } from '../utils/scores-file';

type ScorePayload = {
  username?: unknown;
  score?: unknown;
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ScorePayload>(event);
    const username = body?.username;
    const score = body?.score;

    if (!username || typeof username !== 'string') {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: 'Username is required and must be a string'
      };
    }

    if (username.length > 20) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: 'Username must be 20 characters or less'
      };
    }

    if (typeof score !== 'number' || score < 0) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: 'Score must be a non-negative number'
      };
    }

    if (!hasNeonConfig()) {
      const scores = await readScoresFile();
      const newScore = {
        id: Date.now(),
        username: username.trim(),
        score,
        timestamp: new Date().toISOString()
      };

      scores.push(newScore);
      await writeScoresFile(scores);

      const rank = scores
        .sort((a, b) => b.score - a.score)
        .findIndex((entry) => entry.id === newScore.id) + 1;

      setResponseStatus(event, 201);
      return {
        success: true,
        message: 'Score submitted successfully',
        rank
      };
    }

    try {
      await ensureScoresTable();
    } catch (error) {
      console.error('Error ensuring scores table:', error);
      setResponseStatus(event, 503);
      return {
        success: false,
        error: 'Database temporarily unavailable',
        retryable: true
      };
    }

    const sql = getSql();
    const trimmedUsername = username.trim();

    let insertedRows;
    try {
      insertedRows = await sql`
        INSERT INTO scores (username, score)
        VALUES (${trimmedUsername}, ${score})
        RETURNING id, score
      `;
    } catch (error) {
      console.error('Error saving score:', error);
      setResponseStatus(event, 503);
      return {
        success: false,
        error: 'Failed to save score to database',
        retryable: true
      };
    }

    const insertedScore = insertedRows[0];

    if (!insertedScore) {
      console.error('Error saving score: insert returned no rows');
      setResponseStatus(event, 503);
      return {
        success: false,
        error: 'Failed to save score to database',
        retryable: true
      };
    }

    const rankRows = await sql`
      SELECT COUNT(*)::int AS above_count
      FROM scores
      WHERE score > ${insertedScore.score}
    `;

    const aboveCount = rankRows[0]?.above_count ?? 0;
    const rank = Number(aboveCount) + 1;

    setResponseStatus(event, 201);
    return {
      success: true,
      message: 'Score submitted successfully',
      rank
    };
  } catch (error) {
    console.error('Error submitting score:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      error: 'Internal server error',
      retryable: false
    };
  }
});
