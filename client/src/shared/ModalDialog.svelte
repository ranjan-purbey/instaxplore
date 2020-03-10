<script>
  import { createEventDispatcher } from 'svelte';
  import IconButton from './IconButton.svelte';
  export let closeButton = true;

  const dispatch = createEventDispatcher();
  const dispatchClose = () => dispatch('modalClose');
</script>


<style>
  .modal {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #000b;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-wrapper {
    background: white;
    max-height: 75vh;
  }
  .modal-head {
    display: flex;
    align-items: flex-start;
  }
  .modal-title {
    flex: 1;
    text-align: center;
    font-size: 1.7rem;
    margin: 1rem 0;
    text-align: center;
  }
  .modal-body {
    padding: 0 1.5rem 1.5rem;
  }
</style>


<div class="modal" on:click={dispatchClose}>
  <div class="modal-wrapper" on:click|stopPropagation>
    <div class="modal-head">
      <span class="modal-title"><slot name="title" /></span>
      {#if closeButton}
        <IconButton icon="close" color="red" size="1.5em" on:click={dispatchClose} />
      {/if}
    </div>
    <div class="modal-body"><slot/></div>
  </div>
</div>