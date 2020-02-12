<script>
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import PostDetail from './PostDetail.svelte';
	import WordpressForm from '../modals/WordpressForm.svelte';
	import InstagramLinksForm from '../modals/InstagramLinksForm.svelte';
	import IconButton from '../shared/IconButton.svelte';
	import { pluralize } from '../utils';
	export let addedPosts;
	let selectedPostIds = [];
	const dispatch = createEventDispatcher();

	const handleAddLinks = () => {
		dispatch('openModal', {
			modal: {
				component: InstagramLinksForm
			}
		})
	}

	const handleSelectPost = e => selectedPostIds = 
		e.detail.selected ? [...selectedPostIds, e.detail.postId] : selectedPostIds.filter(postId => postId !== e.detail.postId)

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
	.selection-toolbar {
		background: #39f;
		color: white;
		transition: display 1s, visibility 1s;
		padding: .5rem;
		z-index: 1;
		display: flex;
		align-items: center;
	}
	.toolbar {
		padding: .5rem 0;
		background: #eee;
		box-shadow: 0 -5px 5px -2px #ccc;
		display: flex;
		justify-content: space-between;
	}
	.posts-count {
		font-size: .8em;
		color: gray;
	}
	.save-button, .clear-button, .add-links-button {
		padding: .5rem;
		margin: 0 .3rem;
	}
</style>

<div class="editor">
	<div class="posts-container">
		{#each addedPosts as post (post.id)}
			<div animate:flip={{duration:300}}>
				<PostDetail {post} selected={selectedPostIds.find(postId => post.id === postId)} on:remove on:select={handleSelectPost} />
			</div>
		{/each}
	</div>
	{#if selectedPostIds.length}
		<div class="selection-toolbar" transition:slide={{duration: 200}} on:outroend={() => console.log("Out")}>
			<IconButton icon="rounded-down" size="1.5em"
				disabled={!(selectedPostIds.length === 1 && addedPosts.findIndex(post => post.id === selectedPostIds[0]) < addedPosts.length - 1)}
				on:click={() => dispatch('reorder', {postId: selectedPostIds[0], delta: 1})}>Move Down</IconButton>
			<IconButton icon="rounded-up" size="1.5em"
				disabled={!(selectedPostIds.length === 1 && addedPosts.findIndex(post => post.id === selectedPostIds[0]) > 0)}
				on:click={() => dispatch('reorder', {postId: selectedPostIds[0], delta: -1})}>Move Up</IconButton>
			{selectedPostIds.length} selected
		</div>
	{/if}
	<div class="toolbar">
		<div class="left">
			<button class="add-links-button" on:click={handleAddLinks}>Add Links</button>
			<span class="posts-count">{pluralize(addedPosts.length, 'post', 'posts')}</span>
		</div>
		<div class="right">
			{#if addedPosts.length}
				<button class="clear-button" on:click={() => dispatch('clear')}>Clear</button>
				<button class="save-button" on:click={handleSave}>Save on Wordpress</button>
			{/if}
		</div>
	</div>
</div>
