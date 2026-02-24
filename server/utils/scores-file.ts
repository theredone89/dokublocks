import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

type ScoreRow = {
  id: number;
  username: string;
  score: number;
  timestamp: string;
};

const scoresPath = resolve(process.cwd(), 'db/scores.json');

export async function readScoresFile(): Promise<ScoreRow[]> {
  try {
    const raw = await fs.readFile(scoresPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeScoresFile(scores: ScoreRow[]) {
  await fs.writeFile(scoresPath, JSON.stringify(scores, null, 2));
}
