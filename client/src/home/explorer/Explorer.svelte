<script>
  import { onDestroy } from 'svelte';
  import Waiter from '../../shared/Waiter.svelte';
  import SearchForm from './SearchForm.svelte';
  import PostDetail from './PostDetail.svelte';
  import Pagination from '../../shared/Pagination.svelte';
  import { getInstagramMediaPosts, paginate } from '../../utils';
  import { getInstagramId } from '../../stores';

  let posts = [], filteredPosts = [], profile, sortBy = 'timestamp', textFilter = '', typeFilter='images', instagramId;

  onDestroy(getInstagramId.subscribe(async promise => { instagramId = await promise }));

  const handleSearch = ({detail}) => {
    posts = getInstagramMediaPosts(detail.profile, detail.since, detail.until, instagramId)
      .then(res => {
        posts = res;
        handleFilterAndSort();
      });
  }

  const handlePagination = e => {
    filteredPosts = paginate(filteredPosts, e.detail.pageNum);
  }

  const handleFilterAndSort = () => {
    filteredPosts = paginate(posts
      .filter(post => new RegExp(textFilter, "i").test(post['caption']))
      .filter(post => typeFilter === 'all'
        || (typeFilter === 'images' && post['media_type'] !== 'VIDEO')
        || (typeFilter === 'videos' && post['media_type'] === 'VIDEO'))
      .sort((postA, postB) => {
        const a = postA[sortBy], b = postB[sortBy];
        switch(sortBy) {
          case 'timestamp': return Date.parse(b) - Date.parse(a);
          case 'like_count': case 'comments_count': return b - a;
          default: return b < a ? -1 : (b === a ? 0 : 1);
        }
      }));
  }
</script>

<style>
  .explorer {
    flex: 1;
    padding: .5rem;
    display: flex;
    flex-direction: column;
  }
  .post-list {
    flex: 1 0 0;
    overflow-y: auto;
  }
  .tools {
    display: flex;
    justify-content: space-between;
    font-size: .7em;
  }
  .filters {
    display: flex;
    justify-items: flex-end;
  }
  .filters > div {
    margin-right: .3rem;
  }
</style>


<svelte:head>
  <title>InstaXplore | Home</title>
</svelte:head>

<section class="explorer">
  {#await posts}
    <Waiter />
  {/await}
  <SearchForm on:search={handleSearch} />
  {#if posts.length}
    <div class="tools">
      <Pagination pageCount={filteredPosts.pageCount} currentPage={filteredPosts.currentPage.pageNum}
        on:navigate={handlePagination} />
      <div class="filters">
        <div class="text-filter">
          <input bind:value={textFilter} on:input={handleFilterAndSort} placeholder="Filter by text"/>
        </div>
        <div class="type-filter">
          <label>
            Type:
            <select bind:value={typeFilter} on:change={handleFilterAndSort}>
              {#each ["all", "images", "videos"] as type (type)}
                <option value={type}>{type[0].toUpperCase() + type.slice(1).toLowerCase()}</option>
              {/each}
            </select>
          </label>
        </div>
        <div class="sort-by">
          <label>
            Sort:
            <select bind:value={sortBy} on:change={handleFilterAndSort}>
              <option value="timestamp">Newest</option>
              <option value="like_count">Most Liked</option>
              <option value="comments_count">Most Commented</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  {/if}
  <div class="post-list">
    {#each filteredPosts.currentPage || [] as post (post.id)}
      <PostDetail {post} highlight={textFilter} on:add />
    {/each}
    {#if !(filteredPosts.currentPage && filteredPosts.currentPage.length)}
      <div class='message'>Nothing to display...</div>
    {/if}
  </div>
</section>
