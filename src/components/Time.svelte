<script type="ts">
	const S_PER_MINUTE = 60;
	const S_PER_HOUR = S_PER_MINUTE * 60;
	const S_PER_DAY = S_PER_HOUR * 24;
	const S_PER_MONTH = S_PER_DAY * 30;
	const S_PER_YEAR = S_PER_MONTH * 365;

	export let t: number;
	const date = new Date(t * 1000);
	const now = Date.now() / 1000;
	const elapsed = now - t;
	let relativeTime: string;
	if (elapsed < -S_PER_MONTH) {
		relativeTime = 'in the far future';
	} else if (elapsed < 0) {
		relativeTime = 'in the future';
	} else if (elapsed < S_PER_MINUTE) {
		relativeTime = Math.round(elapsed) + ' seconds ago';
	} else if (elapsed < S_PER_HOUR) {
		relativeTime = Math.round(elapsed / S_PER_MINUTE) + ' minutes ago';
	} else if (elapsed < S_PER_DAY) {
		relativeTime = Math.round(elapsed / S_PER_HOUR) + ' hours ago';
	} else if (elapsed < S_PER_MONTH) {
		relativeTime = Math.round(elapsed / S_PER_DAY) + ' days ago';
	} else if (elapsed < S_PER_YEAR) {
		relativeTime = Math.round(elapsed / S_PER_MONTH) + ' months ago';
	} else {
		relativeTime = Math.round(elapsed / S_PER_YEAR) + ' months ago';
	}
</script>

<span class="time" title={'' + date}>{relativeTime}</span>

<style>
	.time {
		font: 0.8em lightgray bold;
	}
</style>
