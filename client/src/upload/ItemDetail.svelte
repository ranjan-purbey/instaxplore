<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '../shared/Icon.svelte';
  import { autoAdjustHeight } from '../actions';
  export let image;

  let uploading;
  $: uploading = image.state === 'UPLOADING';
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
    background: #0008;
    color: white;
    padding: .3rem 1rem;
    display: flex;
    justify-content: space-between;
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
    grid-auto-flow: column;
  }
  .actions .status {
    justify-self: start;
  }
  .remove-button {
    justify-self: end;
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
      <textarea use:autoAdjustHeight value={image.alt || ''} disabled={['UPLOADING', 'UPLOADED'].includes(image.state)}
        on:change={function() {dispatch('update', {imageId: image.id, updates: {alt: this.value}})}}
        placeholder="Alternate text to display if image fails to load"></textarea>
    </label>
    <label>
      Tags:
      <textarea use:autoAdjustHeight value={image.tags || ''} disabled={['UPLOADING', 'UPLOADED'].includes(image.state)}
        on:change={function() {dispatch('update', {imageId: image.id, updates: {tags: this.value}})}}
        placeholder="Comma-separated list of tags by which the image can be searched"></textarea>
    </label>
  </div>
  <div class="actions">
    <span class="status">
      {#if 'FAILED' === image.state}
        <Icon icon="close" color="red">
          <span slot="text-right">Failed{image.errorMessage ? `:: ${image.errorMessage}` : ''}</span>
        </Icon>
      {:else if 'UPLOADING' === image.state}
        <Icon icon="spinner" color="#da0" spin><span slot="text-right">Uploading</span></Icon>
      {:else if 'UPLOADED' === image.state}
        <Icon icon="check" color="green"><span slot="text-right">Uploaded</span></Icon>
      {/if}
    </span>
    <button class="remove-button" on:click={() => dispatch('delete', {imageId: image.id})} disabled={'UPLOADING' === image.state}>
      <Icon icon="trash" color="#d00" size="1em"><span slot="text-right">Remove</span></Icon>
    </button>
  </div>
</div>
