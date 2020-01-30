<script>
	import { createEventDispatcher } from 'svelte';
	import PostDetail from './PostDetail.svelte';
	import WordpressForm from '../modals/WordpressForm.svelte';
	import InstagramLinksForm from '../modals/InstagramLinksForm.svelte';
	export let addedPosts;
	const dispatch = createEventDispatcher();

	const handleAddLinks = () => {
		dispatch('openModal', {
			modal: {
				component: InstagramLinksForm
			}
		})
	}

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
		justify-content: space-between;
	}
	.save-button, .clear-button, .add-links-button {
		padding: .5rem;
		margin: 0 .3rem;
	}
</style>

<div class="editor">
	<div class="posts-container">
		{#each addedPosts as post (post.id)}
			<PostDetail {post} on:remove on:swap />
		{/each}
	</div>
	<div class="toolbar">
		<div class="left">
			<button class="add-links-button" on:click={handleAddLinks}>Add Links</button>
		</div>
		<div class="right">
			{#if addedPosts.length}
				<button class="clear-button" on:click={() => dispatch('clear')}>Clear</button>
				<button class="save-button" on:click={handleSave}>Save on Wordpress</button>
			{/if}
		</div>
	</div>
</div>
