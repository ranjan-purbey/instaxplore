<script>
  import { currentPath } from '../stores';
  export let to;
  const handleClick = e => {
    const isRelative = new URL(to, window.location.origin).origin === window.location.origin;
    if(isRelative) {
      window.history.pushState(null, null, to);
      currentPath.set(to);
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

<a href={to} tabindex="0" on:click|preventDefault={handleClick}>
  <slot />
</a>
