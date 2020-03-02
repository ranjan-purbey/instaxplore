<script>
  import Icon from './Icon.svelte';
</script>
<style>
  .waiter {
    background: #ddda;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
</style>

<div class="waiter">
  <slot><Icon icon="spinner" size="2em" spin><span slot="text-right">Please wait...</span></Icon></slot>
</div>
