import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type');
	const petsPath = path.resolve('static/data/pets.json');

	try {
		const pets = JSON.parse(await fs.readFile(petsPath, 'utf-8'));
		let filteredPets = pets;
		if (type) {
			filteredPets = pets.filter((pet: any) => pet.type === type);
		}
		return new Response(JSON.stringify(filteredPets), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response('Failed to load pets', { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const { name, type, adoptedBy, user } = await request.json();

	// user: { id, name } expected from frontend
	if (!user || !user.name) {
		return new Response('Unauthorized', { status: 401 });
	}

	const usersPath = path.resolve('static/data/users.json');
	const petsPath = path.resolve('static/data/pets.json');

	try {
		const users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
		const adminUser = users.find((u: any) => u.name === user.name && u.role === 'admin');
		if (!adminUser) {
			return new Response('Forbidden', { status: 403 });
		}

		const pets = JSON.parse(await fs.readFile(petsPath, 'utf-8'));
		const newId = pets.length > 0 ? Math.max(...pets.map((p: any) => p.id)) + 1 : 1;
		const newPet = { id: newId, name, type, adoptedBy: adoptedBy ?? null, hunger: 50, happiness: 0 };
		pets.push(newPet);
		await fs.writeFile(petsPath, JSON.stringify(pets, null, 2));
		return new Response(JSON.stringify(newPet), { status: 201 });
	} catch (err) {
		return new Response('Failed to add pet', { status: 500 });
	}
};
