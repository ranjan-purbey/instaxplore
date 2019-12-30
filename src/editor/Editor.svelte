<script>
	import PostDetail from './PostDetail.svelte';
	export let addedPosts;
	
	let disabled;
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
	.save-button {
		background: #093;
		color: #fff;
		font-weight: bold;
		padding: .5rem;
		margin: 0 .3rem;
	}
	.save-button:hover {
		box-shadow: 0 0 5px #666;
	}
	.save-button:active {
		background: #060;
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
			<button class="save-button">Save on Wordpress</button>
		</div>
	{/if}
</div>
