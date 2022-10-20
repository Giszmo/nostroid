<script type="ts">
	export let tags: string[] = [];
	// $: height = tags.length
	// $: width = Math.max(...tags.map(it=>it.length))
</script>

{#if tags?.length > 0}
	<pre>
    {#each tags as tag}
			<br />
      {tag}
		{/each}
  </pre>
{:else}
	[]
{/if}

<style>
	pre {
		white-space: nowrap;
	}
</style>
