<script>
  import { onMount } from 'svelte';
  export let text = "Please wait...";
  let waiter;
  onMount(() => {
    const parentStyle = waiter.parentElement.style;
    if(!parentStyle.position || parentStyle.position === 'static') {
      parentStyle.position = 'relative';
    };
  });
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
    font-size: 1.4em
  }
</style>

<div class="waiter" bind:this={waiter}>
  <span>{text}</span>
</div>
