<script>
	import { fbLoop } from './utils';
	import Header from './Header.svelte';
	import Workspace from './Workspace.svelte';
	import Waiter from './shared/Waiter.svelte';
	import Notification from './shared/Notification.svelte';
	
	import './helper.css'

	let fbInitPromise = new Promise(() => {});
	let loggedIn = false, linkedFacebookPage;


	const fbInit = () => {
		window.FB.Event.subscribe('auth.statusChange', async () => {
			loggedIn = !!window.FB.getAccessToken();

			if(loggedIn) {
				linkedFacebookPage = new Promise(() => {});
				linkedFacebookPage = (await fbLoop('/me/accounts?fields=name,instagram_business_account'))
					.find(page => page['instagram_business_account']);
			}
		});
		window.FB.getLoginStatus(() => fbInitPromise = Promise.resolve());
	}
</script>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.message {
		font-size: 1.3rem;
		text-align: center;
		color: #333;
		padding: 1rem;
	}
</style>

<svelte:head>
	<script async defer crossorigin="anonymous"
		src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v5.0&appId=557311021489280"
		on:load={fbInit} on:error={() => fbInitPromise = Promise.reject()}></script>
</svelte:head>

<div class="app">
	{#await fbInitPromise}
		<Waiter />
	{:then res}
		<Header {loggedIn} />
		{#if loggedIn}
			{#await linkedFacebookPage then }
				<Workspace instagramId={linkedFacebookPage['instagram_business_account'].id} />
			{:catch }
				<p class="message">Couldn't find any Instagram business account linked Facebook page</p>
			{/await}
		{:else}
			<p class="message">Please login to proceed</p>
		{/if}
	{:catch error}
		<p class="message">Failed to load Facebook SDK. Try disabling your ad-blocker and reloading the page</p>
	{/await}

	<Notification />
</div>
