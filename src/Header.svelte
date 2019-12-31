<script>
	import Icon from './shared/Icon.svelte';

	export let loggedIn;
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
		<button on:click={() => loggedIn ? window.FB.logout() : window.FB.login()}>
			<Icon size="1.5rem" color={loggedIn ? "#900" : "#093"} icon="power" hover>
				Log{loggedIn ? 'out' : 'in'}
			</Icon>
		</button>
	</div>
</header>
