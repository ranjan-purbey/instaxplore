<script>
  export let size = '1.2rem', color = 'black', icon, hover = false, spin =false;
</script>

<style>
  .icon {
    font-size: var(--size);
  }
  .icon-text {
    font-size: calc(var(--size) * .5)
  }
  .icon-wrapper {
    margin: 0 .3rem;
    color: var(--color);
    text-align: center;
    display: inline-block;
    transition: text-shadow .4s;
  }
  .icon-wrapper.hover:hover {
    text-shadow: var(--color) 0 0 20px
  }
  .spin {
    display: inline-block;
    animation: spin 1s infinite linear;
  }
  @keyframes spin {
    from { transform: rotate(0deg) }
    to { transform: rotate(360deg) }
  }
</style>

<div class="icon-wrapper" class:hover style="--size: {size}; --color: {color};">
  <div class="icon"><span class="icofont-{icon}" class:spin /> <slot name="text-right" /></div>
  <div class="icon-text"><slot/></div>
</div>
