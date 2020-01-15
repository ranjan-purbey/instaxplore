<script>
	import Waiter from './shared/Waiter.svelte';
	import { getHtmlFromPosts, saveWordpressPost } from './utils.js';
	export let posts;

	let site, title, username, password, embed, wordpressRequest, wordpressPostId;

	const handleSubmit = () => {
		const content = getHtmlFromPosts(posts, embed);
		if(site.slice(-1) === "/") site = site.slice(0, -1);

		if(confirm("Are you sure you want to save the post?"))
			wordpressRequest = saveWordpressPost({site, title, username, password, content}).then(res => wordpressPostId = res);
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
{#if wordpressPostId}
	<div class="success-message">
		<span>Wordpress post saved successfully</span><br/>
		<a href="{site}/wp-admin/post.php?post={wordpressPostId}&action=edit" target="_blank">Click here</a> to edit
	</div>
{:else}
	<form on:submit|preventDefault={handleSubmit}>
		<label>
			Wordpress Site<br/>
			<input bind:value={site} type="url" required />
		</label>
		<label>
			Title(New Post) / Post ID(Existing Post)<br/>
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
		<label>
			<input bind:checked={embed} type="checkbox" />
			Use Embedded Instagram Posts
		</label>
		<div class="actions">
			<button type="reset">Clear</button>
			<button type="submit">Submit</button>
		</div>
	</form>
{/if}
