<script>
  import ModalDialog from '../../shared/ModalDialog.svelte';
  import WordpressLogin from '../../shared/WordpressLogin.svelte';
  import Waiter from '../../shared/Waiter.svelte';
  import Pagination from '../../shared/Pagination.svelte';
  import GalleryItem from './GalleryItem.svelte';
  import { cookies, notify } from '../../utils';
  import { wordpressUrl} from '../../constants';

  let showLoginDialog, wpMediaItems = [], pageCount = 0, currentPage = 1, inProgress = false, searchFilter = '', authorFilter = 'anyone';

  const retrieveMedia = async (params = {}) => {
    if(cookies().wpToken) {
      showLoginDialog = false;
      inProgress = true;

      params = {context: 'edit', media_type: 'image', page: currentPage, ...params}
      try {
        const res = await fetch(`${wordpressUrl}/wp-json/wp/v2/media?${new URLSearchParams(params).toString()}`, {
          headers: {'authorization': `Bearer ${cookies().wpToken}`}
        });
        const data = await res.json();
        if(res.ok) {
          wpMediaItems = data;
          pageCount = ~~res.headers.get('x-wp-totalpages');
          currentPage = params.page;
        }
        else throw new Error(data.message);
      } catch(error) {
        notify(error.message, 'error');
      }

      inProgress = false
    } else {
      showLoginDialog = true;
    }
  }
  retrieveMedia();

  const handleFilter = () => {
    let author = '';
    if(authorFilter === 'me') {
      try {
        author = JSON.parse(atob(cookies().wpToken.split('.').slice(1,2))).data.user.id
      } catch(_) {}
    }
    retrieveMedia({author, search: searchFilter});
  }
</script>


<style>
  .wordpress-gallery {
    flex: 1;
    padding: .5rem;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }
  .filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .filters form {
    display: flex;
  }
  .filters form * {
    margin-right: .3rem;
  }
  .pagination-wrapper {
    font-size: .8em;
  }
  .items-container {
    flex: 1 0 0;
    overflow-y: auto;
  }
  .info {
    color: #aaa;
    font-size: 1.2em;
    padding: 1rem;
    font-style: italic;
    text-align: center;
  }
</style>


<svelte:head>
  <title>InstaXplore | Gallery</title>
</svelte:head>

<div class="wordpress-gallery">
  <div class="filters">
    <div class="pagination-wrapper">
      <Pagination {pageCount} {currentPage} on:navigate={e => retrieveMedia({page: e.detail.pageNum})} />
    </div>
    <form on:submit|preventDefault={handleFilter}>
      <input type="search" bind:value={searchFilter} placeholder="Search terms" />
      <label>
        Uploaded by:
        <select bind:value={authorFilter}>
          <option value='me'>Only me</option>
          <option value='anyone'>Anyone</option>
        </select>
      </label>
      <button type="submit">Search</button>
    </form>
  </div>
  <div class="items-container">
    {#each wpMediaItems as item (item.id)}
      <GalleryItem {item}/>
    {/each}
    {#if !wpMediaItems.length}
      <div class="info">Nothing to display...</div>
    {/if}
  </div>
  {#if inProgress}
    <Waiter>Fetching images...</Waiter>
  {/if}
</div>
{#if showLoginDialog}
  <ModalDialog closeButton={false}>
    <span slot="title">Wordpress Login</span>
    <WordpressLogin on:login={retrieveMedia}/>
  </ModalDialog>
{/if}