<script lang="ts">
import { onMount } from 'svelte';
import { currentUser } from '$lib/stores';
let logs: any[] = [];
let error = '';
$: user = $currentUser;

onMount(async () => {
	if (!user) return;
	try {
		const res = await fetch('/api/log', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id })
		});
		if (!res.ok) {
			error = 'Failed to load logs';
			return;
		}
		logs = await res.json();
	} catch (e) {
		error = 'Failed to load logs';
	}
});
</script>

<h1>Action Log</h1>

{#if error}
    <p style="color: red;">{error}</p>
{:else if logs.length === 0}
    <p>No actions have been logged yet.</p>
{:else}
    <ul>
    {#each logs as log}
        <li>{log.message}</li>
    {/each}
    </ul>
{/if}

<style>
</style>
