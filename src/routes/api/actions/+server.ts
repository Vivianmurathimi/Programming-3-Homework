import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import { Pet, Puppy, Kitten, UserEntity } from '$lib/helpers';

const usersPath = path.resolve('static/data/users.json');
const petsPath = path.resolve('static/data/pets.json');
const logPath = path.resolve('static/data/log.json');

export const POST: RequestHandler = async ({ request }) => {
	const { petId, action, userId } = await request.json();

	try {
		const fs = (await import('fs/promises')).default;
		const usersRaw = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
		const petsRaw = JSON.parse(await fs.readFile(petsPath, 'utf-8'));
		const userObj = usersRaw.find((u: any) => u.id === userId);
		const petObj = petsRaw.find((p: any) => p.id === petId && p.adoptedBy === userId);
		if (!userObj || !petObj) return new Response('Pet or user not found', { status: 404 });

		// Use OOP classes
		const user = new UserEntity(userObj.id, userObj.name, userObj.budget ?? 0, userObj.inventory ?? { food: 0, toy: 0, treat: 0 }, userObj.role ?? 'user');
		let pet: Pet;
		if (petObj.type === 'puppy') {
			pet = new Puppy(petObj.id, petObj.name, petObj.adoptedBy, petObj.hunger ?? 50, petObj.happiness ?? 50);
		} else if (petObj.type === 'kitten') {
			pet = new Kitten(petObj.id, petObj.name, petObj.adoptedBy, petObj.hunger ?? 50, petObj.happiness ?? 50);
		} else {
			pet = new Pet(petObj.id, petObj.name, petObj.type, petObj.adoptedBy, petObj.hunger ?? 50, petObj.happiness ?? 50);
		}

		let logMsgObj = null;
		if (action === 'feed') {
			if (!user.spend(5)) return new Response('Not enough budget', { status: 400 });
			pet.feed(20);
			logMsgObj = { userId: user.id, message: `${user.name} fed ${pet.name} (−$5)` };
		} else if (action === 'toy') {
			if (!user.spend(10)) return new Response('Not enough budget', { status: 400 });
			pet.play(30);
			logMsgObj = { userId: user.id, message: `${user.name} played with ${pet.name} (−$10)` };
		} else if (action === 'return') {
			if (!user.spend(20)) return new Response('Not enough budget', { status: 400 });
			pet.returnPet();
			logMsgObj = { userId: user.id, message: `${user.name} returned ${pet.name} (−$20)` };
		} else {
			return new Response('Invalid action', { status: 400 });
		}

		// Update raw objects for saving
		Object.assign(userObj, { budget: user.budget, inventory: user.inventory });
		Object.assign(petObj, { adoptedBy: pet.adoptedBy, hunger: pet.hunger, happiness: pet.happiness });

		await fs.writeFile(usersPath, JSON.stringify(usersRaw, null, 2));
		await fs.writeFile(petsPath, JSON.stringify(petsRaw, null, 2));

		// Log the action
		try {
			const logs = JSON.parse(await fs.readFile(logPath, 'utf-8'));
			logs.unshift(logMsgObj);
			await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
		} catch (e) {
			await fs.writeFile(logPath, JSON.stringify([logMsgObj], null, 2));
		}

		return new Response('Action successful', { status: 200 });
	} catch (err) {
		return new Response('Server error', { status: 500 });
	}
};
