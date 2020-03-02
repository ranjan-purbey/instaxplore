<script>
  import { onMount, onDestroy } from 'svelte';
  import ItemDetail from './ItemDetail.svelte';
  import Icon from '../shared/Icon.svelte';
  import IconButton from '../shared/IconButton.svelte';
  import { notify } from '../utils';

  let pickedImages = [], inProgress = false;
  try {
    pickedImages = pickedImages.concat(JSON.parse(window.sessionStorage.getItem('pickedImages')) || []);
  } catch(_){}

  const updateImages = images => {
    pickedImages = images;
    window.sessionStorage.setItem('pickedImages', JSON.stringify(pickedImages));
  }

  const handleData = e => {
    updateImages(pickedImages.concat(Array.from(JSON.parse(e.detail)).map(image => ({
      ...image,
      id: Math.random().toString(36).substring(7)
    }))));
  };

  onMount(() => {
    window.addEventListener('data', handleData);
    window.dispatchEvent(new Event('readytoupload'));
  });
  onDestroy(() => window.removeEventListener('data', handleData));

  const handleItemUpdate = e => {
    let images = pickedImages.filter(image => image.id !== e.detail.imageId);
    if(e.detail.updates) {
      images = images.concat(Object.assign({}, pickedImages.find(image => image.id === e.detail.imageId), e.detail.updates));
    }
    updateImages(images);
  }

  const handleClear = () => {
    if(pickedImages.length && confirm('Are you sure you want to delete all images?')) updateImages([]);
    else notify("There are no images in workspace to clear");
  }

  const handleUpload =  async () => {
    if(pickedImages.length && confirm('Are you sure you want to upload all images to gallery?')) {
      inProgress = true;
      Promise.all(pickedImages.map(async image => {
        try {
          image.state = 'UPLOADING';
          console.log(image);
          // TODO: upload image to S3 and save details to database
          image.state = 'UPLOADED';
        } catch(error) {
          image.state = 'FAILED';
        }
      })).then(() => notify('All images were uploaded successfully')).catch(_ => {});
      inProgress = false;
    } else {
      notify("There are no images in workspace to upload");
    }
  }
</script>


<style>
  .images-container {
    margin: 1rem;
  }
  .toolbar {
    padding: .5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #787;
    position: fixed;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
  }
</style>


<div class="upload-page">
  <div class="images-container">
    {#each pickedImages as image (image.id)}
      <ItemDetail image={image}
        on:delete={handleItemUpdate}
        on:update={handleItemUpdate}/>
    {/each}
  </div>
  <div class="toolbar">
    <IconButton icon="eraser" color="white" disabled={inProgress} on:click={handleClear}>
      <span slot="text-right">Clear</span>
    </IconButton>
    <IconButton icon="upload" color="white" disabled={inProgress} on:click={handleUpload}>
      <span slot="text-right">Upload</span>
    </IconButton>
  </div>
</div>
