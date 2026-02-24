import { d as defineEventHandler, r as readBody, s as setResponseStatus } from '../../nitro/nitro.mjs';
import { h as hasNeonConfig, r as readScoresFile, w as writeScoresFile, e as ensureScoresTable, g as getSql } from '../../_/scores-file.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@netlify/neon';

const score_post = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const body = await readBody(event);
    const username = body == null ? void 0 : body.username;
    const score = body == null ? void 0 : body.score;
    if (!username || typeof username !== "string") {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: "Username is required and must be a string"
      };
    }
    if (username.length > 20) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: "Username must be 20 characters or less"
      };
    }
    if (typeof score !== "number" || score < 0) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: "Score must be a non-negative number"
      };
    }
    if (!hasNeonConfig()) {
      const scores = await readScoresFile();
      const newScore = {
        id: Date.now(),
        username: username.trim(),
        score,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      scores.push(newScore);
      await writeScoresFile(scores);
      const rank2 = scores.sort((a, b) => b.score - a.score).findIndex((entry) => entry.id === newScore.id) + 1;
      setResponseStatus(event, 201);
      return {
        success: true,
        message: "Score submitted successfully",
        rank: rank2
      };
    }
    try {
      await ensureScoresTable();
    } catch (error) {
      console.error("Error ensuring scores table:", error);
      setResponseStatus(event, 503);
      return {
        success: false,
        error: "Database temporarily unavailable",
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
      console.error("Error saving score:", error);
      setResponseStatus(event, 503);
      return {
        success: false,
        error: "Failed to save score to database",
        retryable: true
      };
    }
    const insertedScore = insertedRows[0];
    if (!insertedScore) {
      console.error("Error saving score: insert returned no rows");
      setResponseStatus(event, 503);
      return {
        success: false,
        error: "Failed to save score to database",
        retryable: true
      };
    }
    const rankRows = await sql`
      SELECT COUNT(*)::int AS above_count
      FROM scores
      WHERE score > ${insertedScore.score}
    `;
    const aboveCount = (_b = (_a = rankRows[0]) == null ? void 0 : _a.above_count) != null ? _b : 0;
    const rank = Number(aboveCount) + 1;
    setResponseStatus(event, 201);
    return {
      success: true,
      message: "Score submitted successfully",
      rank
    };
  } catch (error) {
    console.error("Error submitting score:", error);
    setResponseStatus(event, 500);
    return {
      success: false,
      error: "Internal server error",
      retryable: false
    };
  }
});

export { score_post as default };
//# sourceMappingURL=score.post.mjs.map
