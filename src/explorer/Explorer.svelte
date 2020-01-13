<script>
	import { createEventDispatcher } from 'svelte';
	import Waiter from '../shared/Waiter.svelte';
	import SearchForm from './SearchForm.svelte';
	import PostDetail from './PostDetail.svelte';
	import { instaGetMediaPosts } from '../utils.js';

	export let instagramId;

	let dispatch = createEventDispatcher();
	let posts = [], filteredPosts = [], profile, sortBy = 'timestamp', textFilter = '';

	const handleSearch = ({detail}) => {
		posts = instaGetMediaPosts(instagramId, detail.profile, detail.since, detail.until)
			.then(res => {
				posts = res;
				handleFilterAndSort();
			});
	}

	const handleFilterAndSort = () => {
		filteredPosts = posts
			.filter(post => new RegExp(textFilter, "i").test(post['caption']))
			.sort((postA, postB) => {
				const a = postA[sortBy], b = postB[sortBy];
				switch(sortBy) {
					case 'timestamp': return Date.parse(b) - Date.parse(a);
					case 'like_count': case 'comments_count': return b - a;
					default: return b < a ? -1 : (b === a ? 0 : 1);
				}
			});
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
	.filters {
		display: flex;
		justify-content: flex-end;
		font-size: .7em;
	}
	.text-filter {
		margin-right: .3rem;
	}
</style>

<section class="explorer">
	{#await posts}
		<Waiter />
	{/await}
	<SearchForm on:search={handleSearch} />
	{#if posts.length}
		<div class="filters">
			<div class="text-filter">
				<input bind:value={textFilter} on:input={handleFilterAndSort} placeholder="Filter by text"/>
			</div>
			<div class="sort-by">
				<label>
					Sort:
					<select bind:value={sortBy} on:change={handleFilterAndSort}>
						<option value="timestamp">Newest</option>
						<option value="like_count">Most Liked</option>
						<option value="comments_count">Most Commented</option>
					</select>
				</label>
			</div>
		</div>
	{/if}
	<div class="post-list">
		{#each filteredPosts as post (post.id)}
			<PostDetail {post} highlight={textFilter} on:add />
		{/each}
	</div>
</section>
