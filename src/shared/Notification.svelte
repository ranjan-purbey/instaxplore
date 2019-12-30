<script>
	import { onMount } from 'svelte';
	let notification, color;

	onMount(() => {
		window.addEventListener('notification', event => {
			notification = event.detail;
			color = (() => {
				switch(notification.type) {
					case 'success': return '#0d0';
					case 'error': return '#d00';
					default: return '#dd0'
				}
			})()
			setTimeout(() => {notification = null}, 2e3);
		})
	})
</script>

<style>
	.notification {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 2rem;
		min-width: 20rem;
		background: #000;
		font-weight: bold;
		color: var(--color);
		border-radius: .2rem;
	}
</style>

{#if notification}
 <div class="notification" style="--color: {color}">{notification.message}</div>
{/if}

