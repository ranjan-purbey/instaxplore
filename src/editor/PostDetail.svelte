<script>
	import { createEventDispatcher } from 'svelte';
	export let post;

	const dispatch = createEventDispatcher();
</script>

<style>
	.post-detail {
		margin: .3rem 0;
		padding: .4rem;
		border: solid 1px #eee;
		border-radius: .4rem;
		display: flex;
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
	}
	.toolbar {
		display: flex;
		justify-content: space-between;
		padding: .2rem 0;
	}
	.username {
		margin-right: .2rem;
	}
	.timestamp {
		font-size: .6em;
		color: #666;
	}
</style>

<div class="post-detail">
	<div class="media-wrapper">
		{#if post['media_type'] === "VIDEO"}
			<video src={post['media_url']} preload="metadata" controls>Instagram Video</video>
		{:else}
			<img src={post['media_url']} alt="Instagram Image" />
		{/if}
	</div>
	<div class="details-wrapper">
		<div class="toolbar">
			<div class="info">
				<a href="https://www.instagram.com/{post['username']}" class="username">@{post['username']}</a>
				<span class="timestamp">{new Date(post['timestamp']).toUTCString()}</span>
			</div>
			<div class="actions">
				<button on:click|once={() => dispatch('remove', {postId: post.id})}>Remove</button>
			</div>
		</div>
		<div class="caption">{post['caption']}</div>
	</div>
</div>
