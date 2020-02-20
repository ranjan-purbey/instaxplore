<script>
	import { createEventDispatcher } from 'svelte';
	import Icon from '../../shared/Icon.svelte';
	export let post, highlight;

	const dispatch = createEventDispatcher();

	const humanizeCount = count => {
		if(count < 1e3) return count.toString();
		else if(count < 1e6) return (count/1e3).toFixed(2).replace(/\.?0+$/, '') + ' K';
		else return (count/1e6).toFixed(2).replace(/\.?0+$/, '') + ' M';
	}
	let likes = humanizeCount(post['like_count']), comments = humanizeCount(post['comments_count']);

	const handleAdd = event => {
		event.target.innerText = "Add again";
		dispatch('add', {post: Object.assign({}, post, {id: `${post.id}_${Math.random().toString(36).substring(7)}`})});
	}
</script>

<style>
	.post-detail {
		margin: .3rem 0;
		padding: .4rem;
		border: solid 1px #eee;
		border-radius: .4rem;
		display: flex;
	}
	.post-detail:hover {
		background: #eee;
	}
	.media-wrapper {
		height: 200px;
		width: 200px;
		border: solid 1px black;
		box-shadow: 0 0 4px #999;
		margin-right: .7rem;
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	img, video {
		max-width: 100%;
		max-height: 100%;
	}
	.details-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.timestamp {
		color: #555;
		font-size: .7em;
		margin: .2rem;
	}
</style>

<div class="post-detail">
	<a class="media-wrapper" href={post['permalink'] || post['media_url']} target="_blank">
		{#if post['media_type'] === "VIDEO"}
			<video src={post['media_url']} preload="metadata" controls>Instagram Video</video>
		{:else}
			<img src={post['media_url']} alt="Instagram Image" />
		{/if}
	</a>
	<div class="details-wrapper">
		<div>
			<div>
				{@html highlight ? post['caption'].replace(
					new RegExp(highlight, "gi"),
					"<span style='background: #ff0a'>$&</span>"
				) : post['caption']}
			</div>
			<div class="timestamp">{new Date(post['timestamp']).toUTCString()}</div>
		</div>
		<div class="flex justify-content-between">
			<div class="stats">
				<Icon color="red" icon="heart">{likes}</Icon>
				<Icon color="grey" icon="speech-comments">{comments}</Icon>
			</div>
			<div>
				<button on:click={handleAdd}>Add</button>
			</div>
		</div>
	</div>
</div>
