<script>
  import Explorer from './explorer/Explorer.svelte';
  import Editor from './editor/Editor.svelte';
  import { getInstagramId } from '../stores';

</script>
<style>
  main {
    flex: 1;
    display: flex;
    position: relative;
  }
  .gutter {
    width: .3rem;
    background: #eee;
  }
</style>


{#await $getInstagramId then }
  <main>
    <Explorer />
    <div class="gutter" />
    <Editor />
  </main>
{:catch }
  <p class="message">Couldn't find any Instagram business account linked Facebook page</p>
{/await}
