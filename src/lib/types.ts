export interface Pet {
	id: number;
	name: string;
	type: string;
	adoptedBy?: number | null;
	hunger?: number;
	happiness?: number;
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
