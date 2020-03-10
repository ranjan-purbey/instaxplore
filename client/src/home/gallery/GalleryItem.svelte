<script>
  import sanitizeHtml from 'sanitize-html';
  import { addedMedia } from '../../stores';
  import { randomString } from '../../utils';
  export let item;

  const handleAdd = e => {
    e.target.textContent = "Add again";
    addedMedia.update(mediaItems => [
      ...mediaItems,
      {
        id: randomString(),
        media_url: item['source_url'],
        description: item['description']['raw'],
        header: item['caption']['raw'],
        non_instagram: true
      }
    ])
  }
</script>


<style>
  .gallery-item {
    display: grid;
    grid-template: auto 2rem / 30% auto;
    grid-gap: .3rem;
    margin: .5rem .3rem;
    padding: .5rem;
    border: solid 1px #ddc;
    border-radius: .5rem;
  }
  .image-wrapper {
    grid-area: 1 / 1 / 3 / 2;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  .details-wrapper {
    grid-area: 1 / 2 / 2 / 3;
  }
  .actions {
    grid-area: 2 / 2 / 3 / 3;
    text-align: right;
  }
</style>


<div class="gallery-item">
  <a class="image-wrapper" href={item['link']} target="_blank">
    <img src={item['source_url']} alt={item['alt_text']}>
  </a>
  <div class="details-wrapper">
    <div>Size <em>{item['media_details']['height']}x{item['media_details']['width']}</em></div>
    <div>Last modified <em>{new Date(`${item['modified_gmt']}Z`)}</em></div>
    <div>Caption <em>{item['caption']['raw'] || '<empty>'}</div>
    <div>Description <em>{item['description']['raw'] || '<empty>'}</em></div>
  </div>
  <div class="actions">
    <button on:click={handleAdd}>Add</button>
  </div>
</div>