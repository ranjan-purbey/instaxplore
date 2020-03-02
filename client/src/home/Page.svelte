<script>
  import { onMount, onDestroy } from 'svelte';
  import Gutter from '../shared/Gutter.svelte';
  import Explorer from './explorer/Explorer.svelte';
  import Editor from './editor/Editor.svelte';
  import { fbLoop } from '../utils';
  import { lastCache, getInstagramId } from '../stores';

  let addedPosts = [], modal;

  const saveCache = (() => {
    let rafId, lastCacheVal;
    return {
      subscribe() {
        if(!lastCacheVal || (Date.now() - lastCacheVal.time > 1e4)) {
          window.localStorage.setItem("addedPosts", JSON.stringify(addedPosts));
          lastCacheVal = {
            time: Date.now(),
            postsCount: addedPosts.length
          };
          lastCache.set(lastCacheVal);
        }
        rafId = window.requestAnimationFrame(() => this.subscribe());
      },
      unsubscribe() {
        window.cancelAnimationFrame(rafId);
      }
    }
  })();

  onMount(() => {
    try {
      addedPosts = [...addedPosts, ...JSON.parse(window.localStorage.getItem("addedPosts"))];
    } catch(error){}
    saveCache.subscribe();
  })
  onDestroy(saveCache.unsubscribe)

  const handleAddPost = ({detail}) => {
    addedPosts = [...addedPosts, detail.post];
  }

  const handleRemovePost = ({detail}) => {
    addedPosts = addedPosts.filter(post => post.id !== detail.postId);
  }

  const handleReorderPosts = ({detail: {postId, delta}}) => {
    const currentIndex = addedPosts.findIndex(post => post.id === postId);
    const targetIndex = currentIndex + delta;

    if(currentIndex < targetIndex) addedPosts = addedPosts.slice(0, currentIndex)
      .concat(addedPosts.slice(currentIndex + 1, targetIndex + 1))
      .concat(addedPosts.slice(currentIndex, currentIndex + 1))
      .concat(addedPosts.slice(targetIndex + 1))
    else addedPosts = addedPosts.slice(0, targetIndex).concat(addedPosts.slice(currentIndex, currentIndex + 1))
      .concat(addedPosts.slice(targetIndex, currentIndex)).concat(addedPosts.slice(currentIndex + 1));
  }

  const handleOpenModal = ({detail}) => {
    modal = detail.modal;
  }

  const handleCloseModal = ({detail}) => {
    if(detail) {
      switch(detail.action) {
        case 'add_url_posts':
          addedPosts = [...addedPosts, ...detail.payload]; break;
      }
    }
    modal = null
  }
</script>
<style>
  main {
    flex: 1;
    display: flex;
    position: relative;
  }
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
    padding: 2rem;
    background: white;
    max-height: 75vh;
  }
</style>


{#await $getInstagramId then }
  <main>
    <Explorer on:add={handleAddPost} />
    <Gutter />
    <Editor {addedPosts}
      on:reorder={handleReorderPosts}
      on:remove={handleRemovePost}
      on:openModal={handleOpenModal}
      on:clear={() => addedPosts = []} />
    {#if modal}
      <div class="modal" on:click={() => modal = null}>
        <div class="modal-wrapper" on:click|stopPropagation>
          <svelte:component this={modal.component} {...modal.props} on:close={handleCloseModal} />
        </div>
      </div>
    {/if}
  </main>
{:catch }
  <p class="message">Couldn't find any Instagram business account linked Facebook page</p>
{/await}
