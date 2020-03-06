<script>
  import { onDestroy } from 'svelte';
  import IconButton from './shared/IconButton.svelte';
  import Link from './shared/Link.svelte';
  import { cookies } from './utils';
  import { loggedIn, currentPath } from './stores';

  let loggedInVal, currentPathVal;
  onDestroy(loggedIn.subscribe(val => loggedInVal = val));
  onDestroy(currentPath.subscribe(val => currentPathVal = val));

  const logout = () => {
    window.localStorage.clear();
    Object.keys(cookies()).forEach(key => {
      document.cookie = `${key}= ; expires=${new Date(0).toUTCString()}`;
    });
    window.FB.logout();
  }
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    padding: .1rem .5rem;
    background: #eee;
    box-shadow: #000 0 0 5px;
    color: #666;
    font-size: 1.1rem;
  }
  .header-item {
    display: flex;
    height: 100%;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
  }
  .header-link {
    transition-property: background-color, box-shadow;
    transition-duration: .4s;
  }
  .header-link.active {
    font-weight: bold;
  }
  .header-link:hover {
    background: #ccc;
    box-shadow: 0 0 3px;
  }
  .brand {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .menu {
    display: flex;
  }
</style>

<header>
  <Link to="/">
    <div class="brand header-item">InstaXplore</div>
  </Link>
  <div class="menu">
    {#if loggedInVal}
      <Link to="/gallery">
        <div class="header-item header-link" class:active={currentPathVal === '/gallery'}>Gallery</div>
      </Link>
    {/if}
    <IconButton size="1.5rem" color={loggedInVal ? "#900" : "#093"} icon="power"
      on:click={() => loggedInVal ? logout() : window.FB.login(() => {}, {
        scope: "manage_pages,instagram_basic,instagram_manage_insights", auth_type: "rerequest"})}>
      <div class="header-item">Log{loggedInVal ? "out" : "in"}
    </IconButton>
  </div>
</header>
