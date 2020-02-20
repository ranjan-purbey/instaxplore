<script>
	import { createEventDispatcher } from 'svelte';
	import { getInstagramPostFromUrl, notify, pluralize } from '../../utils.js';
	import Waiter from '../../shared/Waiter.svelte';
	let urls, posts, dispatch = createEventDispatcher();

	const handleKeyboardSubmit = e => {
		const form = e.target.closest('form');
		e.code === 'Enter' && e.ctrlKey && form.reportValidity() && handleSubmit();
	}

	const handleSubmit = async () => {
		posts = Promise.all(urls.split("\n").map(url => url && getInstagramPostFromUrl(url)));
		posts = (await posts).filter(o => o);
		if(posts.length) {
			notify(`Retrieved ${pluralize(posts.length, 'post', 'posts')}`, 'success');
			dispatch('close', {
				action: 'add_url_posts',
				payload: posts
			});
		}
	}
</script>

<style>
	.links {
		display: block;
		min-width: 30rem;
		min-height: 10rem;
	}
</style>

<div>
	{#await posts}
		<Waiter />
	{/await}
	<form class="instagram-links-form" on:submit|preventDefault={handleSubmit}>
		<label>
			Enter Instagram post permalinks or media URL (separated by new lines)
			<textarea class="links" bind:value={urls} required on:keyup={handleKeyboardSubmit}
				placeholder="https://www.instagram.com/p/fA9uwTtkSN/"></textarea>
		<button type="submit">GET</button>
	</form>
</div>
