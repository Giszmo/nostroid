<script type="ts">
  export let tags: string[][] = []
  // $: height = tags.length
  // $: width = Math.max(...tags.map(it=>it.length))
</script>
<pre>
<table>
{#if tags}
{#each tags as tag}
<tr>
{#each tag as value}
  <td>{value}</td>
{/each}
</tr>
{/each}
{/if}
</table>
</pre>