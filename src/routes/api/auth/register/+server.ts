import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';
import type { User } from '$lib/types';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { name, password } = await request.json();

	try {
		// Read existing users
		const users: User[] = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

		// Check if username is already taken
		if (users.some(user => user.name === name)) {
			return new Response('Username already exists', { status: 400 });
		}

		// Hash the password
		const passwordHash = await bcrypt.hash(password, 10);

		// Create new user
		const newUser: User = {
			id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
			name,
			passwordHash,
			budget: 200, // Set initial budget to 200
			inventory: { food: 0, toy: 0, treat: 0 }
		};

		// Save the new user
		users.push(newUser);
		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

		return new Response(JSON.stringify({ id: newUser.id, name: newUser.name }), { status: 201 });
	} catch (err) {
		console.error('Error registering user:', err);
		return new Response('Internal Server Error', { status: 500 });
	}
};