<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';

	interface Pet {
		id: number;
		name: string;
		type: 'puppy' | 'kitten';
		adoptedBy?: string | null;
		hunger?: number;
        happiness?: number;
	}

	let pets: Pet[] = [];
	let petType: '' | 'puppy' | 'kitten' = '';
	let myPets: Pet[] = [];

	$: user = $currentUser;

	async function loadPets() {
		const res = await fetch(`/api/pets${petType ? `?type=${petType}` : ''}`);
		pets = await res.json();
	}

	async function adopt(petId: number) {
		if (!user) {
			goto('/login');
			return;
		}
		const res = await fetch('/api/adopt', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ petId, userId: user.id })
		});
		if (res.ok) {
			await loadPets();
		} else {
			alert(await res.text());
		}
	}

	onMount(loadPets);
</script>

<h1>Hi, here are our pets</h1>

<!-- Pet type filter -->
<div style="margin-bottom: 1rem;">
	<label for="petType">Filter by type: </label>
	<select id="petType" bind:value={petType} on:change={loadPets}>
		<option value=''>All</option>
		<option value='puppy'>Puppy</option>
		<option value='kitten'>Kitten</option>
	</select>
</div>

{#if pets.length === 0}
    <p>No pets available.</p>
{:else}
    <ul>
    {#each pets as pet}
        <li>
            <strong>{pet.name}</strong> ({pet.type})
            {#if pet.adoptedBy}
                <span style="color: gray;"> - Adopted</span>
            {:else}
                <span style="color: green;"> - Available</span>
                <button on:click={() => adopt(pet.id)}>Adopt</button>
            {/if}
        </li>
    {/each}
    </ul>
{/if}

<style>
</style>
