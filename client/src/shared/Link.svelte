<script>
  import { currentPath } from '../stores';
  export let to;
  const handleClick = e => {
    const url = new URL(to, window.location.origin);
    const isRelative = url.origin === window.location.origin;
    if(isRelative) {
      window.history.pushState(null, null, url);
      currentPath.set(url.pathname);
    } else {
      window.location.assign(to);
    }
  }
</script>

<style>
  a {
    color: inherit;
    text-decoration: none;
  }
  slot:active, slot:hover {
    text-decoration: underline;
  }
</style>

<a href={to} on:click|preventDefault={handleClick}>
  <slot />
</a>
