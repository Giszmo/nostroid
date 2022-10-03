<script type="ts">
  export let tags: string[] = []
  // $: height = tags.length
  // $: width = Math.max(...tags.map(it=>it.length))
</script>
{#if tags?.length > 0}
<pre>
<table>
{#each tags as tag}
<tr>
{#each tag as value}
  <td>{value}</td>
{/each}
</tr>
{/each}
</table>
</pre>
{:else}
[]
{/if}
