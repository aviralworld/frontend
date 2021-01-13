<script lang="ts">
  import RecordingSummary from "../components/RecordingSummary.svelte";

  export let recordings;
</script>

<style>
  ul, li {
    list-style: none;
  }

  li {
    margin-top: 1rem;
  }
</style>

<ul>
  {#each recordings as recording}
    <li><RecordingSummary recording={recording} /></li>
  {/each}
</ul>
