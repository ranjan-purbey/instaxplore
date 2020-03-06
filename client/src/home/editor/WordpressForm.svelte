<script>
  import { onDestroy } from 'svelte';
  import Waiter from '../../shared/Waiter.svelte';
  import Icon from '../../shared/Icon.svelte';
  import { generateWordpressPostContent, saveWordpressPost } from '../../utils';
  import { wordpressUrl } from '../../constants';
  import { addedMedia } from '../../stores';

  let {title, embed} = (() => {
    try {
      return JSON.parse(window.localStorage.getItem('wpConfig')) || {};
    } catch(_) {
      return {};
    }
  })();

  let	wordpressRequest, wordpressPostId, mediaItems;
  onDestroy(addedMedia.subscribe(items => mediaItems = items));

  const handleSubmit = () => {
    wordpressRequest = generateWordpressPostContent(mediaItems, embed)
      .then(content => saveWordpressPost({title, content}))
      .then(res => {
        wordpressPostId = res;
        window.localStorage.setItem('wpConfig', JSON.stringify({title: res, embed}));
      });
  }
</script>

<style>
  label {
    margin-bottom: .5rem;
  }
  input:not([type="checkbox"]) {
    width: 100%;
    margin: .3rem 0;
  }
  .actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
  .actions button {
    margin-left: .3rem;
    flex-grow: 1;
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
    <a href="{wordpressUrl}/wp-admin/post.php?post={wordpressPostId}&action=edit" target="_blank">Click here</a> to edit
  </div>
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    <label>
      Site
      <input disabled type="url" value={wordpressUrl}>
    </label>
    <label>
      Title(New Post) / Post ID (Existing Post)<br/>
      <input bind:value={title} required />
    </label>
    <label>
      <input bind:checked={embed} type="checkbox" />
      Use Embedded Instagram Posts
      {#if embed}
        <div>
          <Icon icon="info-circle" size=".85em" color="darkcyan">
            <span slot="text-right">Non-Instagram posts will be ignored in embedded mode</span>
          </Icon>
        </div>
      {/if}
    </label>
    <div class="actions">
      <button type="submit">Submit</button>
    </div>
  </form>
{/if}
