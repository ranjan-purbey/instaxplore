<script>
	export let addedPosts;
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
</style>

<div class="editor">
	<div class="posts-container">
		{#each addedPosts as post (post)}
			{post['caption']}<br/>
		{/each}
	</div>
	<div class="toolbar">
		
	</div>
</div>
