<script>
	import { createEventDispatcher } from 'svelte';
	import Waiter from '../shared/Waiter.svelte';
	import SearchBar from './SearchBar.svelte';
	import PostDetail from './PostDetail.svelte';
	import { instaGetMediaPosts } from '../utils.js';

	export let instagramId;

	let dispatch = createEventDispatcher();
	let posts = [], profile, sortBy = 'timestamp';

	const handleSearch = async ({detail}) => {
		posts = new Promise(() => {});
		posts = await instaGetMediaPosts(instagramId, detail.profile, detail.since, detail.until);
		handleSort();
	}

	const handleSort = () => {
		posts = posts.sort((postA, postB) => {
			const a = postA[sortBy], b = postB[sortBy];
			switch(sortBy) {
				case 'timestamp': return Date.parse(b) - Date.parse(a);
				case 'like_count': case 'comments_count': return b - a;
				default: return b < a ? -1 : (b === a ? 0 : 1);
			}
		})
	}
</script>

<style>
	.explorer {
		flex: 1;
		padding: .5rem;
		display: flex;
		flex-direction: column;
	}
	.post-list {
		flex: 1 0 0;
		overflow-y: auto;
	}
	.sort-by {
		font-size: .7em;
		text-align: right;
	}
</style>

<section class="explorer">
	{#await posts}
		<Waiter />
	{/await}
	<SearchBar on:search={handleSearch} />
	<div class="sort-by">
		<label>
			Sort:
			<select bind:value={sortBy} on:change={handleSort} disabled={!posts.length}>
				<option value="timestamp">Newest</option>
				<option value="like_count">Most Liked</option>
				<option value="comments_count">Most Commented</option>
			</select>
		</label>
	</div>
	<div class="post-list">
		{#each posts as post (post.id)}
			<PostDetail {post} on:add />
		{/each}
	</div>
</section>
