<script>
	import { createEventDispatcher } from 'svelte';
	import Waiter from './shared/Waiter.svelte';
	import { notify, saveWordpressPost } from './utils.js';
	export let content;

	let dispatch = createEventDispatcher();
	let site, title, username, password, wordpressRequest, postId;

	const handleSubmit = () => {
		if(confirm("Are you sure you want to save the post?"))
			wordpressRequest = saveWordpressPost({site, title, username, password, content}).then(res => postId = res);
	}
</script>

<style>
	.actions {
		display: flex;
		justify-content: flex-end;
	}
	.actions button {
		margin-left: .3rem;
	}
	.success-message {
		text-align: center
	}
	.success-message span {
		color: #060;
		font-size: 1.3em;
	}
</style>

{#await wordpressRequest}
	<Waiter />
{/await}
{#if postId}
	<div class="success-message">
		<span>Wordpress post saved successfully</span><br/>
		<a href="{site}/wp-admin/post.php?post={postId}&action=edit" target="_blank">Click here</a> to edit
	</div>
{:else}
	<form on:submit|preventDefault={handleSubmit}>
		<label>
			Wordpress Site<br/>
			<input bind:value={site} type="url" required />
		</label>
		<label>
			Title / Post ID<br/>
			<input bind:value={title} required />
		</label>
		<label>
			Username<br/>
			<input bind:value={username} required />
		</label>
		<label>
			Password<br/>
			<input bind:value={password} type="password" required />
		</label>
		<div class="actions">
			<button type="reset">Clear</button>
			<button type="submit">Submit</button>
		</div>
	</form>
{/if}
