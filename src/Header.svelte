<script>
	import Icon from './shared/Icon.svelte';
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

	button {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
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
		<button on:click={() => loggedIn ? window.FB.logout() : window.FB.login(
				() => {}, {scope: 'manage_pages,instagram_basic,instagram_manage_insights', auth_type: 'rerequest'})}>
			<Icon size="1.5rem" color={loggedIn ? "#900" : "#093"} icon="power" hover>
				Log{loggedIn ? 'out' : 'in'}
			</Icon>
		</button>
	</div>
</header>
