<script>
  import { createEventDispatcher, afterUpdate } from 'svelte';
  import { autoAdjustHeight } from '../../actions';
  import { addedMedia } from '../../stores';
  export let item, selected;
  let mediaItemComponent;
  const dispatch = createEventDispatcher();

  afterUpdate(() => {
    if(selected) {
      setTimeout(() => mediaItemComponent.scrollIntoView({behaviour: 'smooth', block: 'nearest'}), 150);
    }
  })

  const updateItem = updates => {
    addedMedia.update(items => {
      const index = items.findIndex(_item => _item.id === item.id);
      return items.slice(0, index).concat({...item, ...updates}).concat(items.slice(index + 1));
    })
  }

  const handleRemove = () => {
    addedMedia.update(items => items.filter(i => i.id !== item.id));
  }
</script>

<style>
  .item-detail {
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
  .checkbox-container {
    padding: .5rem;
  }
</style>

<div class="item-detail" bind:this={mediaItemComponent}>
  <div class="checkbox-container">
    <input type="checkbox" checked={selected} on:change={e => dispatch('select', {id: item.id, selected: e.target.checked})} />
  </div>
  <a class="media-wrapper" href={item['permalink'] || item['media_url']} target="_blank">
    {#if item['media_type'] === "VIDEO"}
      <video src={item['media_url']} preload="metadata" controls>Instagram Video</video>
    {:else}
      <img src={item['media_url']} alt="Instagram Image" />
    {/if}
  </a>
  <div class="details-wrapper">
    <div class="toolbar">
      <div class="info">
        {#if !item['non_instagram']}
          <a href="https://www.instagram.com/{item['username']}" target="_blank" class="username">@{item['username']}</a>
          <span class="timestamp">{item['timestamp'] ? new Date(item['timestamp']).toUTCString() : ''}</span>
        {/if}
      </div>
      <div class="actions">
        <button on:click|once={handleRemove}>Remove</button>
      </div>
    </div>
    <div class="details">
      <textarea value={item.header || ''} class="header" rows="1" placeholder="Header for post (optional)"
        use:autoAdjustHeight on:change={e => updateItem({header: e.target.value})}></textarea>
      {#if !item['non_instagram']}
        <div class="caption">{item['caption']}</div>
        <label><input type="checkbox" bind:checked={item['hidecaption']}> Hide caption</label>
      {/if}
      <textarea value={item.description || ''} class="description" rows="1" placeholder="Description for post (optional)"
        use:autoAdjustHeight on:change={e => updateItem({description: e.target.value})}></textarea>
    </div>
  </div>
</div>
