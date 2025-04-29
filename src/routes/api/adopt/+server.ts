import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const petsPath = path.resolve('static/data/pets.json');
const usersPath = path.resolve('static/data/users.json');
const logPath = path.resolve('static/data/log.json');

export const POST: RequestHandler = async ({ request }) => {
	const { petId, userId } = await request.json();
	try {
		const pets = JSON.parse(await fs.readFile(petsPath, 'utf-8'));
		const users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
		const pet = pets.find((p: any) => p.id === petId);
		const user = users.find((u: any) => u.id === userId);
		if (!pet || !user) return new Response('Pet or user not found', { status: 404 });
		if (pet.adoptedBy) return new Response('Pet already adopted', { status: 400 });
		if ((user.budget ?? 0) < 20) return new Response('Not enough budget to adopt', { status: 400 });
		pet.adoptedBy = user.id;
		user.budget -= 20;
		await fs.writeFile(petsPath, JSON.stringify(pets, null, 2));
		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
		// Log the adoption
		let logMsg = { userId: user.id, message: `${user.name} adopted ${pet.name} (−$20)` };
		try {
			const logs = JSON.parse(await fs.readFile(logPath, 'utf-8'));
			logs.unshift(logMsg);
			await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
		} catch (e) {
			await fs.writeFile(logPath, JSON.stringify([logMsg], null, 2));
		}
		return new Response('Adoption successful', { status: 200 });
	} catch (err) {
		return new Response('Server error', { status: 500 });
	}
};
