<div class="profile">
	<div class="avatar is-loading" />
	<div class="info">
		<span class="name is-loading">&nbsp;</span>
		<div id="id" class="is-loading">&nbsp;</div>
	</div>
</div>

<style>
	.profile {
		width: 100%;
		min-height: 3em;
	}
	.info {
		margin-left: 60px;
		font-weight: bold;
	}
	.name {
		display: block;
		max-width: 90px;
		margin-bottom: 2px;
	}
	.avatar {
		width: 3em;
		height: 3em;
		float: left;
		margin: 10px;
		border-radius: 50%;
	}
	#id {
		word-break: break-word;
		max-width: 500px;
	}
	.is-loading {
		animation: 1.5s shine linear infinite;
		background: linear-gradient(110deg, #d3d2d2 5%, #dfdddd 25%, #d3d2d2 55%);
		background-size: 200% 100%;
	}
	@keyframes shine {
		to {
			background-position-x: -200%;
		}
	}
</style>
