<script>
	import { createEventDispatcher } from 'svelte';
	import Icon from './Icon.svelte';

	export let pageCount, currentPage;
	const dispatch = createEventDispatcher();
	const gotoPage = pageNum => dispatch("navigate", {pageNum});
</script>

<style>
	.pagination-container {
		display:flex;
	}
	.pagination-container button {
		margin-right: .2rem;
		margin-left: .2rem;
	}
	.current-page {
		width: 4em;
	}
</style>

<div class="pagination-container">
	<button type="button" class="prev-page" on:click={() => gotoPage(currentPage - 1)} disabled={currentPage <= 1}>
		<Icon icon="ui-previous" size="inherit" color="inherit" />
	</button>
	<label>
		Page:
		<input type="number" class="current-page" value={currentPage} min="1" max={pageCount} step="1"
			on:change={e => e.target.validationMessage || gotoPage(parseInt(e.target.value))}> of {pageCount}
	</label>
	<button type="button" class="next-page" on:click={() => gotoPage(currentPage + 1)} disabled={currentPage >= pageCount}>
		<Icon icon="ui-next" size="inherit" color="inherit" />
	</button>
</div>
