<script>
	export let size = '1.2rem', color = 'black', icon, hover = false;
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
	}
	.icon-wrapper.hover:hover {
		text-shadow: var(--color) 0 0 20px
	}
</style>
{#if icon}
	<div class="icon-wrapper" class:hover style="--size: {size}; --color: {color};">
		<div class="icon">{icon}</div>
		<div class="icon-text"><slot/></div>
	</div>
{/if}