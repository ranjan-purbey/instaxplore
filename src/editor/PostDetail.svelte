<script>
	import { createEventDispatcher } from 'svelte';
	import Icon from '../shared/Icon.svelte';
	export let post;
	let postDetailComponent;

	const dispatch = createEventDispatcher();
	let active = false;

	const handleDragStart = e => {
		e.dataTransfer.allowedEffects = 'move';
		window.sessionStorage.setItem("sourceId", post.id);
		const {left: leftOffset, top: topOffset} = postDetailComponent.getBoundingClientRect();
		e.dataTransfer.setDragImage(postDetailComponent, e.x - leftOffset, e.y - topOffset);
		active = true;
	}

	const handleDragEnd = e => {
		window.sessionStorage.removeItem("sourceId")
		active = false;
	}

	const handleDragOver = e => {
		const sourceId = window.sessionStorage.getItem("sourceId");
		if(sourceId !== post.id) {
			dispatch('swap', {sourceId, targetId: post.id});
		}
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
	.post-detail.active {
		background: #66f9;
		border: solid 2px #66f;
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
	.drag-handle {
		cursor: grab;
		display: flex;
		align-items: center;
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
</style>

<div class="post-detail" class:active
	bind:this={postDetailComponent}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:dragover|preventDefault={handleDragOver}
	on:drop|preventDefault>

	<div class="drag-handle" draggable="true">
		<Icon icon="sort" />
	</div>
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
				<a href="https://www.instagram.com/{post['username']}" target="_blank" class="username">@{post['username']}</a>
				<span class="timestamp">{post['timestamp'] ? new Date(post['timestamp']).toUTCString() : ''}</span>
			</div>
			<div class="actions">
				<button on:click|once={() => dispatch('remove', {postId: post.id})}>Remove</button>
			</div>
		</div>
		<div class="details">
			<input bind:value={post.header} class="header" placeholder="Header for post (optional)" />
			<div class="caption">{post['caption']}</div>
			<textarea bind:value={post.description} class="description" placeholder="Description for post (optional)"></textarea>
		</div>
	</div>
</div>
