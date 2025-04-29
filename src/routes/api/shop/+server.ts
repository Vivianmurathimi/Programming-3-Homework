import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const usersPath = path.resolve('static/data/users.json');

const ITEM_COSTS = { food: 5, toy: 10, treat: 2 };

export const POST: RequestHandler = async ({ request }) => {
	const { item, userId } = await request.json();
	if (!['food', 'toy', 'treat'].includes(item)) {
		return new Response('Invalid item', { status: 400 });
	}
	try {
		const users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
		const user = users.find((u: any) => u.id === userId);
		if (!user) return new Response('User not found', { status: 404 });
		const cost = ITEM_COSTS[item];
		if ((user.budget ?? 0) < cost) {
			return new Response('Not enough budget', { status: 400 });
		}
		user.budget -= cost;
		if (!user.inventory) user.inventory = { food: 0, toy: 0, treat: 0 };
		user.inventory[item] = (user.inventory[item] ?? 0) + 1;
		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
		return new Response(`Bought 1 ${item}`, { status: 200 });
	} catch (err) {
		return new Response('Server error', { status: 500 });
	}
};
