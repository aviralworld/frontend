<script lang="ts">
  export let recording;
</script>

{recording.name}{#if recording.location !== null}{" "}from {recording.location}{/if}
