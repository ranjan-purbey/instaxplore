<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '../shared/Icon.svelte';
  import { autoAdjustHeight } from '../actions';
  export let image;

  const dispatch = createEventDispatcher();
</script>

<style>
  .upload-item {
    /* padding: 1rem; */
    border: solid 1px lightgray;
    border-radius: .5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .image-wrapper {
    text-align: center;
    margin-bottom: .5rem;
    position: relative;
    overflow-y: hidden;
  }
  .image-wrapper img {
    max-width: 100%;
    height: auto;
    vertical-align: bottom;
  }
  .info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(2em);
    background: #0008;
    color: white;
    padding: .3rem 1rem;
    display: flex;
    justify-content: space-between;
    transition: transform .5s;
  }
  .image-wrapper:hover .info-overlay {
    transform: translateY(0);
  }
  .info-overlay em{
    max-width: 60%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-overlay a {
    color: inherit;
  }
  .metadata-wrapper label {
    font-weight: bold;
  }
  .metadata-wrapper textarea{
    display: block;
    width: 100%;
  }
  .actions {
    display: grid;
  }
  .remove-button {
    justify-self: flex-end;
    color: #d00;
  }
</style>

<div class="upload-item">
  <div class="image-wrapper">
    <img src={image.src} alt={image.alt}>
    <div class="info-overlay">
      <b>{image.height} x {image.width}</b>
      <em>Source <a href={image.href} target='_blank'>{image.href}</a></em>
    </div>
  </div>
  <div class="metadata-wrapper">
    <label>
      Alternate text:
      <textarea use:autoAdjustHeight value={image.alt || ''}
        on:change={function() {dispatch('update', {imageId: image.id, updates: {alt: this.value}})}}
        placeholder="Alternate text to display if image fails to load"></textarea>
    </label>
    <label>
      Tags:
      <textarea use:autoAdjustHeight value={image.tags || ''}
        on:change={function() {dispatch('update', {imageId: image.id, updates: {tags: this.value}})}}
        placeholder="Comma-separated list of tags by which the image can be searched"></textarea>
    </label>
  </div>
  <div class="actions">
    <button class="remove-button" on:click={() => dispatch('delete', {imageId: image.id})}>
      <Icon icon="trash" color="#d00" size="1em"><span slot="text-right">Remove</span></Icon>
    </button>
  </div>
</div>
