<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores';
	import { onMount } from 'svelte';

	let name = '';
	let password = '';
	let error = '';
	let redirectToRegister = false;

	onMount(() => {
		name = '';
		password = '';
		error = '';
		redirectToRegister = false;
	});

	async function handleLogin() {
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ name, password }),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				const message = await res.text();
				error = message || 'Login failed';
				// If login failed, offer to redirect to register
				redirectToRegister = true;
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

<h1>Login</h1>

{#if error}<p style="color: red;">{error}</p>{/if}

<form on:submit|preventDefault={handleLogin}>
	<label>
		Name:
		<input type="text" bind:value={name} required />
	</label>
	<label>
		Password:
		<input type="password" bind:value={password} required />
	</label>
	<button type="submit">Login</button>
</form>

{#if redirectToRegister}
	<p>Don't have an account? <a href="/register">Register here</a>.</p>
{/if}