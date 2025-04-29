import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const logPath = path.resolve('static/data/log.json');

export const GET: RequestHandler = async () => {
  try {
    const fileContent = await fs.readFile(logPath, 'utf-8');
    const logs: string[] = JSON.parse(fileContent);
    return new Response(JSON.stringify(logs), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Error loading log:', err);
    return new Response('Failed to load log.', { status: 500 });
  }
};
