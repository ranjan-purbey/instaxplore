<script>
	import Gutter from './shared/Gutter.svelte';
	import Explorer from './explorer/Explorer.svelte';
	import Editor from './editor/Editor.svelte';
	import { instaGetMediaPosts } from './utils';
	export let instagramId;

	let addedPosts = [];

	const handleAddPost = ({detail}) => {
		addedPosts = [...addedPosts, detail.post];
	}

	const handleRemovePost = ({detail}) => {
		addedPosts = addedPosts.filter(post => post.id !== detail.postId);
	}
</script>
<style>
	main {
		flex: 1;
		display: flex;
	}
</style>

<main>
	<Explorer {instagramId} on:add={handleAddPost} />
	<Gutter />
	<Editor {addedPosts} on:remove={handleRemovePost} />
</main>
