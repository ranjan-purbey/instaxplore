<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import MediaItem from './MediaItem.svelte';
  import WordpressForm from './WordpressForm.svelte';
  import AddLinksForm from './AddLinksForm.svelte';
  import IconButton from '../../shared/IconButton.svelte';
  import ModalDialog from '../../shared/ModalDialog.svelte';
  import WordpressLogin from '../../shared/WordpressLogin.svelte';
  import { pluralize, cookies } from '../../utils';
  import { addedMedia } from '../../stores';

  let addedMediaItems, selectedMediaIds = [], lastCacheVal, modal;
  const modals = {
    'ADD_LINKS': {},
    'WORDPRESS': {
      'LOGIN': {title: 'Wordpress Login'},
      'SAVE': {title: 'Wordpress Post Details'}
    }
  }

  onDestroy(addedMedia.subscribe(items => addedMediaItems = items));

  const closeModal = () => modal = null;

  const handleSelectItem = e => selectedMediaIds =
    e.detail.selected ? [...selectedMediaIds, e.detail.id] : selectedMediaIds.filter(id => id !== e.detail.id)

  const handleClear = () => {
    if(confirm('Are you sure you want to remove all items from the current workspace?')) addedMedia.set([]);
  }

  const reorderItems = ({id, delta}) => {
    addedMedia.update(mediaItems => {
      const currentIndex = mediaItems.findIndex(item => item.id === id);
      const targetIndex = currentIndex + delta;
      if(currentIndex < targetIndex) return mediaItems.slice(0, currentIndex)
        .concat(mediaItems.slice(currentIndex + 1, targetIndex + 1))
        .concat(mediaItems.slice(currentIndex, currentIndex + 1))
        .concat(mediaItems.slice(targetIndex + 1))
      else return mediaItems.slice(0, targetIndex)
        .concat(mediaItems.slice(currentIndex, currentIndex + 1))
        .concat(mediaItems.slice(targetIndex, currentIndex))
        .concat(mediaItems.slice(currentIndex + 1));
    })
  }

  const handleSave = () => {
    if(cookies().wpToken) modal = modals.WORDPRESS.SAVE;
    else modal = modals.WORDPRESS.LOGIN;
  }
</script>

<style>
  .editor {
    flex: 1;
    padding: .5rem;
    display: flex;
    flex-direction: column;
  }
  .media-items-container {
    flex: 1 0 0;
    overflow-y: auto;
  }
  .selection-toolbar {
    background: #39f;
    color: white;
    transition: display 1s, visibility 1s;
    padding: .5rem;
    z-index: 1;
    display: flex;
    align-items: center;
  }
  .toolbar {
    padding: .5rem 0;
    background: #eee;
    box-shadow: 0 -5px 5px -2px #ccc;
    display: flex;
    justify-content: space-between;
  }
  .save-button, .clear-button, .add-links-button {
    padding: .5rem;
    margin: 0 .3rem;
  }
</style>

<div class="editor">
  <div class="media-items-container">
    {#each addedMediaItems as item (item.id)}
      <div animate:flip={{duration:300}}>
        <MediaItem {item} selected={selectedMediaIds.find(itemId => item.id === itemId)} on:select={handleSelectItem} />
      </div>
    {/each}
  </div>
  {#if selectedMediaIds.length}
    <div class="selection-toolbar" transition:slide={{duration: 200}}>
      <IconButton icon="rounded-down" size="1.5em"
        disabled={!(selectedMediaIds.length === 1 && addedMediaItems.findIndex(item => item.id === selectedMediaIds[0]) < addedMediaItems.length - 1)}
        on:click={() => reorderItems({id: selectedMediaIds[0], delta: 1})}>Move Down</IconButton>
      <IconButton icon="rounded-up" size="1.5em"
        disabled={!(selectedMediaIds.length === 1 && addedMediaItems.findIndex(item => item.id === selectedMediaIds[0]) > 0)}
        on:click={() => reorderItems({id: selectedMediaIds[0], delta: -1})}>Move Up</IconButton>
      {selectedMediaIds.length} selected
    </div>
  {/if}
  <div class="toolbar">
    <div class="left">
      <button class="add-links-button" on:click={() => modal = modals.ADD_LINKS}>Add Links</button>
      <span class="items-count">{pluralize(addedMediaItems.length, 'item', 'items')}</span>
    </div>
    <div class="right">
      <button class="clear-button" on:click={handleClear} disabled={!addedMediaItems.length}>Clear</button>
      <button class="save-button" on:click={handleSave} disabled={!addedMediaItems.length}>Create Post</button>
    </div>
  </div>
  {#if modal}
    <ModalDialog on:modalClose={closeModal}>
      <span slot="title">{modal.title || ''}</span>
      {#if modal === modals.ADD_LINKS}
        <AddLinksForm on:added={closeModal} />
      {:else if modal === modals.WORDPRESS.LOGIN}
        <WordpressLogin on:login={handleSave} />
      {:else if modal === modals.WORDPRESS.SAVE}
        <WordpressForm />
      {/if}
    </ModalDialog>
  {/if}
</div>
