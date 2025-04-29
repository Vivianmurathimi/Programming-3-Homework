import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const logPath = path.resolve('static/data/log.json');

export const POST: RequestHandler = async ({ request }) => {
	const { userId } = await request.json();
	if (!userId) return new Response('Missing userId', { status: 400 });
	try {
		const logs = JSON.parse(await fs.readFile(logPath, 'utf-8'));
		const filtered = logs.filter((log: any) => log.userId === userId);
		return new Response(JSON.stringify(filtered), { status: 200 });
	} catch (err) {
		return new Response('Failed to read logs.', { status: 500 });
	}
};
