<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import Gutter from './shared/Gutter.svelte';
	import Explorer from './explorer/Explorer.svelte';
	import Editor from './editor/Editor.svelte';
	export let instagramId;

	let addedPosts = [], modal;
	const dispatch = createEventDispatcher();

	onMount(() => {
		try {
			addedPosts = [...addedPosts, ...JSON.parse(localStorage.getItem("addedPosts"))];
		} catch(error){}
		
		let lastCache;
		(function saveCache() {
			if(!lastCache || (Date.now() - lastCache.time > 1e4)) {
				window.localStorage.setItem("addedPosts", JSON.stringify(addedPosts));
				lastCache = {
					time: Date.now(),
					postsCount: addedPosts.length
				}
				dispatch("cache", lastCache);
			}
			window.requestAnimationFrame(saveCache)
		})();
	})

	const handleAddPost = ({detail}) => {
		addedPosts = [...addedPosts, detail.post];
	}

	const handleRemovePost = ({detail}) => {
		addedPosts = addedPosts.filter(post => post.id !== detail.postId);
	}

	const handleSwapPosts = ({detail: {sourceId, targetId}}) => {
		const sourceIndex = addedPosts.findIndex(post => post.id === sourceId);
		const targetIndex = addedPosts.findIndex(post => post.id === targetId);
		const addedPostsCopy = Array.from(addedPosts);
		[addedPostsCopy[sourceIndex], addedPostsCopy[targetIndex]]
			= [addedPostsCopy[targetIndex], addedPostsCopy[sourceIndex]];
		addedPosts = addedPostsCopy;
	}

	const handleOpenModal = ({detail}) => {
		modal = detail.modal;
	}

	const handleCloseModal = ({detail}) => {
		if(detail) {
			switch(detail.action) {
				case 'add_url_posts':
					addedPosts = [...addedPosts, ...detail.payload]; break;
			}
		}
		modal = null
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
		on:swap={handleSwapPosts}
		on:remove={handleRemovePost}
		on:openModal={handleOpenModal}
		on:clear={() => addedPosts = []} />
	{#if modal}
		<div class="modal" on:click={() => modal = null}>
			<div class="modal-wrapper" on:click|stopPropagation>
				<svelte:component this={modal.component} {...modal.props} on:close={handleCloseModal} />
			</div>
		</div>
	{/if}
</main>
