<script type="ts">
	export let content: { k: string; v: string };
</script>

<span class="tag">{content.k}:{content.v}</span>

<style>
	.tag {
		background-color: lightblue;
	}
</style>
