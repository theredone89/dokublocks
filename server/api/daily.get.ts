import { defineEventHandler } from 'h3';
import { promises as fs } from 'fs';
import { join } from 'path';

export default defineEventHandler(async (event: any) => {
  try {
    const headers = (event && event.node && event.node.req && event.node.req.headers) || {};
    const host = headers.host || `localhost:${process.env.PORT || 3000}`;
    const proto = headers['x-forwarded-proto'] || headers['x-forwarded-protocol'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const origin = `${proto}://${host}`;
    const url = new URL('/data/daily.json', origin).toString();

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching daily.json:', error);
    return {
      success: false,
      error: 'Failed to load daily data'
    };
  }
});
