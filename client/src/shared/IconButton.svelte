<script>
  import Icon from './Icon.svelte';
  export let size = '1.2rem', color = 'black', icon, hover = true, disabled = false;
</script>

<style>
  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0;
  }
  .icon-button:active {
    background: none;
  }
  .icon-button:disabled {
    cursor: not-allowed;
  }
  .icon-button.disabled {
    opacity: 0.5;
  }
</style>

<button class:disabled class='icon-button' on:click disabled={disabled}>
  <Icon size={size} color={color} icon={icon} hover={hover && !disabled}>
    <span slot="text-right"><slot name="text-right" /></span>
    <slot/>
  </Icon>
</button>
