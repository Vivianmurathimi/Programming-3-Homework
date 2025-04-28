export interface Pet {
	name: string
}

export interface User {
	id: number;
	name: string;
	passwordHash: string;
	budget?: number;
	inventory?: { food: number; toy: number; treat: number };
	role?: 'user' | 'admin';
}

export type SafeUser = Omit<User, 'passwordHash'>;
