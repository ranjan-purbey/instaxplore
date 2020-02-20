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
  span {
    cursor: pointer;
  }
  slot:active, slot:hover {
    text-decoration: underline;
  }
</style>

<span tabindex="0" on:click={handleClick}>
  <slot />
</span>
