<script context="module" lang="ts">
  const STORIES_TO_SHOW = 10;

  export async function preload() {
    const res = await this.fetch(`/api/recordings/random/${STORIES_TO_SHOW}/`);

    if (res.status !== 200) {
      return { recordings: [] };
    }

    const json = await res.json();
    return { recordings: json.recordings };
  }
</script>

<script lang="ts">
  import RecordingSummary from "../components/RecordingSummary.svelte";

  export let recordings;
</script>

<main>
  <h2>Randomly-curated stories</h2>

    <ul>
      {#each recordings as recording}
        <li><a href={`/recording/${recording.id}/`}><RecordingSummary recording={recording} /></a></li>
      {/each}
    </ul>
</main>