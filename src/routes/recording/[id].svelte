<script context="module" lang="ts">
	export async function preload({ params }) {
		const res = await this.fetch(`recording/${params.id}.json`);
		const data = await res.json();

		if (res.status === 200) {
			return { recording: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script lang="ts">
  import type { IRecording } from "../_common";
	export let recording: IRecording;
</script>

<svelte:head>
  <title>TODO add title</title>
</svelte:head>

<!-- TODO fix details -->
<h2>Listening to the story of {recording.name} from {recording.location}</h2>
<p>Thank you for taking the time to become part of a shared story.</p>
<!-- TODO embed recording and pause/play buttons -->

<!-- TODO implement recording page -->
<a href="#todo">Proceed</a>
