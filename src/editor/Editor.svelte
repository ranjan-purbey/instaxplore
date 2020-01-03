<script>
	import { createEventDispatcher } from 'svelte';
	import PostDetail from './PostDetail.svelte';
	import WordpressForm from '../WordpressForm.svelte';
	import { getHtmlFromPosts } from '../utils.js';
	export let addedPosts;
	
	let dispatch = createEventDispatcher();

	const handleSave = () => {
		dispatch('openModal', {
			modal: {
				component: WordpressForm,
				props: {
					posts: addedPosts
				}
			}
		})
	}
</script>

<style>
	.editor {
		flex: 1;
		padding: .5rem;
		display: flex;
		flex-direction: column;
	}
	.posts-container {
		flex: 1 0 0;
		overflow-y: auto;
	}
	.toolbar {
		padding: .5rem 0;
		background: #eee;
		box-shadow: 0 -5px 7px -2px #ccc;
		display: flex;
		justify-content: flex-end;
	}
	.save-button, .clear-button {
		padding: .5rem;
		margin: 0 .3rem;
	}
</style>

<div class="editor">
	<div class="posts-container">
		{#each addedPosts as post (post.id)}
			<PostDetail {post} on:remove />
		{/each}
	</div>
	{#if addedPosts.length}
		<div class="toolbar">
			<button class="clear-button" on:click={() => dispatch('clear')}>Clear</button>
			<button class="save-button" on:click={handleSave}>Save on Wordpress</button>
		</div>
	{/if}
</div>
