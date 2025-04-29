import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	const { name, password } = await request.json();

	try {
		// Read existing users
		const users: User[] = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

		// Find the user by name
		const user = users.find(user => user.name === name);
		if (!user) {
			return new Response('Invalid username or password', { status: 401 });
		}

		// Compare the password
		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
		if (!isPasswordValid) {
			return new Response('Invalid username or password', { status: 401 });
		}

		// Return the user (excluding passwordHash)
		const { passwordHash, ...safeUser } = user;
		return new Response(JSON.stringify(safeUser), { status: 200 });
	} catch (err) {
		console.error('Error logging in user:', err);
		return new Response('Internal Server Error', { status: 500 });
	}
};
