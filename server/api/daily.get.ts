import { defineEventHandler } from 'h3';
import { promises as fs } from 'fs';
import { join } from 'path';

export default defineEventHandler(async () => {
  try {
    const file = join(process.cwd(), 'public', 'data', 'daily.json');
    const raw = await fs.readFile(file, 'utf-8');
    const data = JSON.parse(raw);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error reading daily.json:', error);
    return {
      success: false,
      error: 'Failed to load daily data'
    };
  }
});
