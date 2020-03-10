<script>
  import { onMount, onDestroy } from 'svelte';
  import ItemDetail from './ItemDetail.svelte';
  import Icon from '../shared/Icon.svelte';
  import IconButton from '../shared/IconButton.svelte';
  import ModalDialog from '../shared/ModalDialog.svelte';
  import WordpressLogin from '../shared/WordpressLogin.svelte';
  import { notify, uploadImageToWordpress, cookies, randomString } from '../utils';

  let pickedImages = [], totalImagesCount, uploadedImagesCount, inProgress = false, showWordpressLoginDialog = false;
  try {
    pickedImages = pickedImages.concat(JSON.parse(window.sessionStorage.getItem('pickedImages')) || []);
  } catch(_){}

  $: totalImagesCount = pickedImages.filter(image => image.state !== 'UPLOADED').length;

  const updateImages = images => {
    pickedImages = images;
    window.sessionStorage.setItem('pickedImages', JSON.stringify(
      pickedImages.map(image => ({
        ...image, state: image.state === 'UPLOADED' ? image.state : null, errorMessage: null
      }))
    ));
  }

  const handleData = e => {
    updateImages(pickedImages.concat(Array.from(JSON.parse(e.detail)).map(image => ({
      ...image,
      id: randomString()
    }))));
  };

  onMount(() => {
    window.addEventListener('data', handleData);
    window.dispatchEvent(new Event('readytoupload'));
  });
  onDestroy(() => window.removeEventListener('data', handleData));

  const updateArrayItem = (array, itemOrIndex, replacement) => {
    const index = itemOrIndex < array.length ? itemOrIndex : array.findIndex(i => i.id === itemOrIndex.id);
    return array.slice(0, index).concat(replacement || []).concat(array.slice(index + 1));
  }

  const handleItemUpdate = e => {
    const index = pickedImages.findIndex(image => image.id === e.detail.imageId);
    updateImages(updateArrayItem(pickedImages, index, e.detail.updates && {...pickedImages[index], ...e.detail.updates}));
  }

  const handleClear = () => {
    if(pickedImages.length) {
      if(confirm('Are you sure you want to remove all images from current workspace?')) updateImages([]);
    }
    else notify("There are no images in workspace to clear");
  }

  const handleUpload =  async () => {
    const images = pickedImages.filter(image => image.state !== 'UPLOADED');
    if(images.length) {
      if(showWordpressLoginDialog || confirm('Are you sure you want to upload all images to gallery?')) {
        if(cookies().wpToken) {
          showWordpressLoginDialog = false;
          try {
            uploadedImagesCount = 0;
            inProgress = true;
            await Promise.all(images.map(async image => {
              try {
                // TODO: add presence validation for alt text
                pickedImages = updateArrayItem(pickedImages, image, {...image, state: 'UPLOADING', errorMessage: null});
                await uploadImageToWordpress(image);
                pickedImages = updateArrayItem(pickedImages, image, {...image, state: 'UPLOADED'});
                uploadedImagesCount++;
              } catch(error) {
                pickedImages = updateArrayItem(pickedImages, image,
                  {...image, state: 'FAILED', errorMessage: (error.response || {}).data || error.message});
                throw error;
              }
            }));
            notify('All images were uploaded successfully', 'success');
          } catch(_) {
            notify('Failed to uplaod some or all images', 'error')
          }

          updateImages(pickedImages);
          inProgress = false;
        } else showWordpressLoginDialog = true;
      }
    } else {
      notify("There are no new images in workspace to upload");
    }
  }
</script>


<style>
  .upload-page {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .images-container {
    padding: 1rem;
    flex: 1 0 0;
    overflow-y: auto;
  }
  .toolbar {
    padding: .5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #787;
  }
</style>


<svelte:head>
  <title>InstaXplore | Upload</title>
</svelte:head>

<div class="upload-page">
  <div class="images-container">
    {#each pickedImages as image (image.id)}
      <ItemDetail image={image}
        on:delete={handleItemUpdate}
        on:update={handleItemUpdate}/>
    {/each}
  </div>
  <div class="toolbar">
    <IconButton icon="eraser" color="white" disabled={inProgress || !pickedImages.length} on:click={handleClear}>
      <span slot="text-right">Clear</span>
    </IconButton>
    <IconButton icon="upload" color="white" disabled={inProgress || !totalImagesCount} on:click={handleUpload}>
      <span slot="text-right">{inProgress ? 'Uploading...' : `Upload (${totalImagesCount})`}</span>
    </IconButton>
  </div>
  {#if showWordpressLoginDialog}
    <ModalDialog on:modalClose={() => showWordpressLoginDialog = false}>
      <span slot="title">Wordpress Login</span>
      <WordpressLogin on:login={handleUpload} />
    </ModalDialog>
  {/if}
</div>
