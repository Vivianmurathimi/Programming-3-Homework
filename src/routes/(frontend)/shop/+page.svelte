<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { onMount } from 'svelte';

	let budget: number | null = null;
	let inventory = { food: 0, toy: 0, treat: 0 };
	let error = '';
	let success = '';

	$: user = $currentUser;

	async function loadUser() {
		error = '';
		if (!user) return;
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: user.name, password: '' })
		});
		if (res.ok) {
			const updatedUser = await res.json();
			budget = updatedUser.budget ?? null;
			inventory = updatedUser.inventory ?? { food: 0, toy: 0, treat: 0 };
			currentUser.set(updatedUser); // update the store so dashboard and others update too
		} else {
			budget = user.budget ?? null;
			inventory = user.inventory ?? { food: 0, toy: 0, treat: 0 };
		}
	}

	onMount(loadUser);

	async function buy(item: 'food' | 'toy' | 'treat') {
		error = '';
		success = '';
		const res = await fetch('/api/shop', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ item, userId: user?.id ?? null })
		});
		if (res.ok) {
			success = await res.text();
			await loadUser();
		} else {
			error = await res.text();
		}
	}
</script>

<h1>Pet Shop</h1>

{#if budget !== null}
	<p>Your budget: <strong>${budget}</strong></p>
{/if}
<p>Inventory: Food: {inventory.food}, Toy: {inventory.toy}, Treat: {inventory.treat}</p>

{#if error}<p style="color: red;">{error}</p>{/if}
{#if success}<p style="color: green;">{success}</p>{/if}

<div>
	<button on:click={() => buy('food')}>Buy Food (−$5)</button>
	<button on:click={() => buy('toy')}>Buy Toy (−$10)</button>
	<button on:click={() => buy('treat')}>Buy Treat (−$2)</button>
</div>

<style>
    button {
        padding: 0.5rem;
        font-size: 1rem;
        margin-right: 0.5rem;
    }
</style>
