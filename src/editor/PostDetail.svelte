<script>
	import { createEventDispatcher, afterUpdate } from 'svelte';
	import { slide, crossfade, fade } from 'svelte/transition';
	import Icon from '../shared/Icon.svelte';
	export let post, selected;
	let postDetailComponent;
	const dispatch = createEventDispatcher();

	afterUpdate(() => {
		if(selected) {
			setTimeout(() => postDetailComponent.scrollIntoView({behaviour: 'smooth', block: 'nearest'}), 150);
		}
	})

	const adjustHeight = e => {
		e.target.style.height = '0';
		e.target.style.height =
			~~(e.target.scrollHeight + parseInt(window.getComputedStyle(e.target).getPropertyValue('font-size')) * 1.3) + 'px';
	}
</script>

<style>
	.post-detail {
		margin: .3rem 0;
		padding: .4rem;
		border: solid 1px #eee;
		border-radius: .4rem;
		display: flex;
		align-items: center;
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
	.details {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
	.header {
		font-weight: bold;
		font-size: 1.2em;
	}
	.header, .description {
		resize: none;
	}
	.select-post-checkbox-container {
		padding: .5rem;
	}
</style>

<div class="post-detail" bind:this={postDetailComponent}>
	<div class="select-post-checkbox-container">
		<input type="checkbox" checked={selected} on:change={e => dispatch('select', {postId: post.id, selected: e.target.checked})} />
	</div>
	<div class="media-wrapper">
		<a href={post['permalink']} target="_blank">
			{#if post['media_type'] === "VIDEO"}
				<video src={post['media_url']} preload="metadata" controls>Instagram Video</video>
			{:else}
				<img src={post['media_url']} alt="Instagram Image" />
			{/if}
		</a>
	</div>
	<div class="details-wrapper">
		<div class="toolbar">
			<div class="info">
				<a href="https://www.instagram.com/{post['username']}" target="_blank" class="username">@{post['username']}</a>
				<span class="timestamp">{post['timestamp'] ? new Date(post['timestamp']).toUTCString() : ''}</span>
			</div>
			<div class="actions">
				<button on:click|once={() => dispatch('remove', {postId: post.id})}>Remove</button>
			</div>
		</div>
		<div class="details">
			<textarea bind:value={post.header} class="header" rows="1" placeholder="Header for post (optional)"
				on:input={adjustHeight}></textarea>
			<div class="caption">{post['caption']}</div>
			<label><input type="checkbox" bind:checked={post['hidecaption']}> Hide caption</label>
			<textarea bind:value={post.description} class="description" rows="1" placeholder="Description for post (optional)"
				on:input={adjustHeight}></textarea>
		</div>
	</div>
</div>
