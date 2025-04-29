<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores';
	import type { Pet } from '$lib/types';
	import { goto } from '$app/navigation';

	let pets: Pet[] = [];
	let error = '';
	let success = '';
	let budget: number | null = null;
	let inventory = { food: 0, toy: 0, treat: 0 };

	$: user = $currentUser;

	async function loadPetsAndUser() {
		error = '';
		if (!user) return;
		const [petsRes, userRes] = await Promise.all([
			fetch('/api/pets'),
			fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: user.name, password: '' }) // password blank, backend should ignore
			})
		]);
		if (!petsRes.ok) {
			error = 'Failed to load pets';
			return;
		}
		const allPets = await petsRes.json();
		pets = allPets.filter((pet: any) => pet.adoptedBy == user.id);
		if (userRes.ok) {
			const updatedUser = await userRes.json();
			budget = updatedUser.budget ?? null;
			inventory = updatedUser.inventory ?? { food: 0, toy: 0, treat: 0 };
			currentUser.set(updatedUser); // Update the currentUser store with the latest user data
		} else {
			budget = user.budget ?? null;
			inventory = user.inventory ?? { food: 0, toy: 0, treat: 0 };
		}
	}

	async function handleAction(petId: number, action: 'feed' | 'toy' | 'return') {
		error = '';
		success = '';
		let useInventory = false;
		if (action === 'feed' && inventory.food > 0) {
			useInventory = true;
		} else if (action === 'toy' && inventory.toy > 0) {
			useInventory = true;
		}
		const res = await fetch('/api/actions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ petId, action, userId: user?.id ?? null, useInventory })
		});
		if (res.ok) {
			success = await res.text();
			await loadPetsAndUser();
		} else {
			const msg = await res.text();
			error = msg;
			if (msg.includes('out of items') || msg.includes('Not enough budget')) {
				goto('/shop');
			}
		}
	}

	onMount(() => {
		if (!user) {
			goto('/login');
		} else {
			loadPetsAndUser();
		}
	});
</script>

<h1>📋 Your Adopted Pets</h1>

{#if budget !== null}
	<p>Your budget: <strong>${budget}</strong></p>
{/if}

{#if success}<p style="color: green;">{success}</p>{/if}
{#if error}<p style="color: red;">{error}</p>{/if}

{#if pets.length === 0}
    <p>You haven’t adopted any pets yet.</p>
{:else}
    <ul>
    {#each pets as pet}
        <li>
			<strong>{pet.name}</strong> ({pet.type})<br>
            Hunger: {pet.hunger ?? 0} <br>
            Happiness: {pet.happiness ?? 0} <br>
            <button on:click={() => handleAction(pet.id, 'feed')}>Feed (−$5)</button>
            <button on:click={() => handleAction(pet.id, 'toy')}>Play (−$10)</button>
            <button on:click={() => handleAction(pet.id, 'return')}>Return (−$20)</button>
        </li>
    {/each}
    </ul>
{/if}

<style>
    button {
        margin-right: 0.5rem;
    }
</style>
