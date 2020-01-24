<script>
	import { onMount } from 'svelte';
	let notifications = [], color;

	onMount(() => {
		window.addEventListener('notification', event => {
			const notification = event.detail;
			notifications = [notification, ...notifications];
			notification.color = (() => {
				switch(notification.type) {
					case 'success': return '#0d0';
					case 'error': return '#d00';
					default: return '#dd0'
				}
			})()
			setTimeout(() => {
				notifications = notifications.filter(n => notification !== n);
			}, 5e3);
		})
	})
</script>

<style>
	.notifications-container {
		position: absolute;
		top: 0;
		right: 0;
		max-height: 80vh;
		overflow-y: auto;
	}
	.notification {
		margin: 1rem;
		padding: 2rem;
		min-width: 20rem;
		background: #000;
		font-weight: bold;
		color: var(--color);
		border-radius: .2rem;
	}
</style>

<div class="notifications-container">
	{#each notifications as notification}
		<div class="notification" style="--color: {notification.color}">{notification.message}</div>
	{/each}
</div>
