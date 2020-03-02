<script>
  import { onDestroy } from 'svelte';
  import { fbLoop } from './utils';
  import Header from './Header.svelte';
  import Waiter from './shared/Waiter.svelte';
  import Notification from './shared/Notification.svelte';
  import HomePage from './home/Page.svelte';
  import GalleryPage from './gallery/Page.svelte';
  import UploadPage from './upload/Page.svelte';
  import { currentPath, loggedIn } from './stores';

  import './helper.css'

  let fbInitPromise = new Promise(() => {}), isLoggedIn, currentPage;

  const routes = {
    '/gallery': { component: GalleryPage },
    '/upload': { component: UploadPage },
    'home': { component: HomePage }
  }
  onDestroy(currentPath.subscribe(path => currentPage = routes[path] || routes['home']));

  const fbInit = () => {
    window.FB.Event.subscribe('auth.statusChange', async () => {
      loggedIn.set(!!window.FB.getAccessToken());
    });
    window.FB.getLoginStatus(() => fbInitPromise = Promise.resolve());
  }
  onDestroy(loggedIn.subscribe(val => isLoggedIn = val));
</script>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>

<svelte:head>
  <script async defer crossorigin="anonymous"
    src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v5.0&appId=557311021489280"
    on:load={fbInit} on:error={() => fbInitPromise = Promise.reject()}></script>
</svelte:head>

<div class="app">
  {#await fbInitPromise}
    <Waiter />
  {:then res}
    <Header />
    {#if isLoggedIn}
      <svelte:component this={currentPage.component} {...currentPage.props} />
    {:else}
      <p class="message">Please login to proceed</p>
    {/if}
  {:catch error}
    <p class="message">Failed to load Facebook SDK. Try disabling your ad-blocker and reloading the page</p>
  {/await}

  <Notification />
</div>
