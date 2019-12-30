<script>
	import Gutter from './shared/Gutter.svelte';
	import Explorer from './explorer/Explorer.svelte';
	import Editor from './editor/Editor.svelte';
	import { instaGetMediaPosts } from './utils';
	export let instagramId;

	let addedPosts = [], modal;

	const handleAddPost = ({detail}) => {
		addedPosts = [...addedPosts, detail.post];
	}

	const handleRemovePost = ({detail}) => {
		addedPosts = addedPosts.filter(post => post.id !== detail.postId);
	}

	const handleOpenModal = ({detail}) => {
		modal = detail.modal;
	}
</script>
<style>
	main {
		flex: 1;
		display: flex;
		position: relative;
	}
	.modal {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: #000b;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-wrapper {
		padding: 2rem;
		background: white;
		max-height: 75vh;
	}
</style>

<main>
	<Explorer {instagramId} on:add={handleAddPost} />
	<Gutter />
	<Editor {addedPosts}
		on:remove={handleRemovePost}
		on:openModal={handleOpenModal}
		on:clear={() => addedPosts = []} />
	{#if modal}
		<div class="modal" on:click={() => modal = null}>
			<div class="modal-wrapper" on:click|stopPropagation>
				<svelte:component this={modal.component} {...modal.props} on:close={() => modal = null} />
			</div>
		</div>
	{/if}
</main>
