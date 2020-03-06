<script>
  import { createEventDispatcher } from 'svelte';
  import { getInstagramPostFromUrl, notify, pluralize } from '../../utils.js';
  import { addedMedia } from '../../stores';
  import Waiter from '../../shared/Waiter.svelte';

  let urls, mediaItems, dispatch = createEventDispatcher();

  const handleKeyboardSubmit = e => {
    const form = e.target.closest('form');
    e.code === 'Enter' && e.ctrlKey && form.reportValidity() && handleSubmit();
  }

  const handleSubmit = async () => {
    mediaItems = Promise.all(urls.split("\n").map(url => url && getInstagramPostFromUrl(url)));
    mediaItems = (await mediaItems).filter(o => o);
    if(mediaItems.length) {
      notify(`Retrieved ${pluralize(mediaItems.length, 'post', 'mediaItems')}`, 'success');
      addedMedia.update(existingItems => existingItems.concat(mediaItems));
      dispatch('added');
    }
  }
</script>

<style>
  .links {
    display: block;
    min-width: 30em;
    width: 100%;
    min-height: 10rem;
    margin: .5rem 0;
  }
</style>

<div>
  {#await mediaItems}
    <Waiter />
  {/await}
  <form class="instagram-links-form" on:submit|preventDefault={handleSubmit}>
    <label>
      Enter Instagram post permalinks (separated by new lines)
      <textarea class="links" bind:value={urls} required on:keyup={handleKeyboardSubmit}
        placeholder="https://www.instagram.com/p/fA9uwTtkSN/"></textarea>
    <button type="submit">GET</button>
  </form>
</div>
