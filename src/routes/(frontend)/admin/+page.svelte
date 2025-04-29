<script lang="ts">
import { currentUser } from '$lib/stores';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

let name = '';
let type: 'puppy' | 'kitten' = 'puppy';
let error = '';
let success = '';

$: user = $currentUser;

onMount(() => {
	const unsubscribe = currentUser.subscribe((u) => {
		if (!u) {
			goto('/login');
		} else if (u.role !== 'admin') {
			goto('/');
		}
	});
	return unsubscribe;
});

async function addPet() {
	error = '';
	success = '';
	if (!user) {
		error = 'Not authorized.';
		goto('/login');
		return;
	}
	try {
		const res = await fetch('/api/pets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, type, user })
		});
		if (!res.ok) {
			error = await res.text();
			return;
		}
		success = 'Pet added!';
		name = '';
		type = 'puppy';
	} catch (e) {
		error = 'Failed to add pet.';
	}
}
</script>

<h1>Add a New Pet</h1>

{#if error}<p style="color: red;">{error}</p>{/if}
{#if success}<p style="color: green;">{success}</p>{/if}

<form on:submit|preventDefault={addPet}>
	<label>
		Name:
		<input type="text" bind:value={name} required />
	</label>
	<label>
		Type:
		<select bind:value={type} required>
			<option value="puppy">Puppy</option>
			<option value="kitten">Kitten</option>
		</select>
	</label>
	<button type="submit">Add Pet</button>
</form>

<style>
    form {
        display: grid;
        gap: 0.75rem;
        max-width: 300px;
    }
</style>
