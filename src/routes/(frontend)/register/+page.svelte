<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';

	let name = '';
	let password = '';
	let confirmPassword = '';
	let error = '';

	async function handleRegister() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify({ name, password }),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				const message = await res.text();
				error = message || 'Registration failed';
				return;
			}

			const user = await res.json();
			currentUser.set(user);
			goto('/dashboard');
		} catch (err) {
			error = 'An unexpected error occurred';
		}
	}
</script>

<h1>Register</h1>

{#if error}<p style="color: red;">{error}</p>{/if}

<form on:submit|preventDefault={handleRegister}>
	<label>
		Name:
		<input type="text" bind:value={name} required />
	</label>
	<label>
		Password:
		<input type="password" bind:value={password} required />
	</label>
	<label>
		Confirm Password:
		<input type="password" bind:value={confirmPassword} required />
	</label>
	<button type="submit">Register</button>
</form>