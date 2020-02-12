<script>
	import IconButton from './shared/IconButton.svelte';
	import { pluralize } from './utils';
	export let loggedIn, lastCache;
</script>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: .1rem .5rem;
		background: #eee;
		box-shadow: #ccc 0 0 5px;
	}

	.brand {
		font-size: 1.5rem;
		font-weight: bold;
		color: #777
	}

	.last-cache {
		font-style: italic;
		font-size: 0.6em;
		color: darkslategrey;
	}
</style>

<header>
	<div class="brand">
		<span>InstaXplore</span>
	</div>
	<div>
		{#if lastCache}
			<span class="last-cache">Last cached on {new Date(lastCache.time).toLocaleString()} ({pluralize(lastCache.postsCount, 'post', 'posts')})</span>
		{/if}
		<IconButton size="1.5rem" color={loggedIn ? "#900" : "#093"} icon="power"
			on:click={() => loggedIn ? window.FB.logout() : window.FB.login(() => {}, {
				scope: 'manage_pages,instagram_basic,instagram_manage_insights', auth_type: 'rerequest'})}>
			Log{loggedIn ? 'out' : 'in'}
		</IconButton>
	</div>
</header>
