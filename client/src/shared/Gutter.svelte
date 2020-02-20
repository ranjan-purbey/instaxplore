<script>
  export let vertical = true;
  export let size = '.2rem';
  export let background = '#eee';
  let width = vertical ? size : '100%';
  let height = vertical ? '100%' : size;
</script>
<div style="width: {width}; height: {height}; background: {background};" />
