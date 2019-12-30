<script>
  export let text = "Please wait...";
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

<div class="waiter">
  <span>{text}</span>
</div>
