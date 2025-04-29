import { writable } from 'svelte/store';
import type {SafeUser} from './types';

export const currentUser = writable<SafeUser | null>(null);
