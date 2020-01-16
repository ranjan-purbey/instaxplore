<script>
	import Waiter from './shared/Waiter.svelte';
	import { getHtmlFromPosts, saveWordpressPost } from './utils.js';
	export let posts;

	let urls = {
		staging: "https://staging.mamasuncut.com",
		production: "https://mamasuncut.com",
		others: null
	};
	let server  = "staging", siteUrl = urls[server];
	let	title, username, password, embed, wordpressRequest, wordpressPostId;

	const handleServerChange = () => {
		siteUrl = urls[server];
	}

	const handleSubmit = () => {
		const content = getHtmlFromPosts(posts, embed);
		if(siteUrl.slice(-1) === "/") siteUrl = siteUrl.slice(0, -1);

		if(confirm("Are you sure you want to save the post?"))
			wordpressRequest = saveWordpressPost({siteUrl, title, username, password, content}).then(res => wordpressPostId = res);
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
		<a href="{siteUrl}/wp-admin/post.php?post={wordpressPostId}&action=edit" target="_blank">Click here</a> to edit
	</div>
{:else}
	<form on:submit|preventDefault={handleSubmit}>
		<div>
			Wordpress Site<br/>
			<select bind:value={server} on:change={handleServerChange}>
				{#each Object.keys(urls) as serverName (serverName)}
					<option value={serverName}>{serverName[0].toUpperCase() + serverName.slice(1)}</option>
				{/each}
			</select>
			<input bind:value={siteUrl} autocomplete="url"
				placeholder="Enter Wordpress server URL"
				disabled={server !== "others"} type="url" required />
		</div>
		<label>
			Title(New Post) / Post ID(Existing Post)<br/>
			<input bind:value={title} required />
		</label>
		<label>
			Username<br/>
			<input bind:value={username} autocomplete="username" required />
		</label>
		<label>
			Password<br/>
			<input bind:value={password} type="password" autocomplete="current-password" required />
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
