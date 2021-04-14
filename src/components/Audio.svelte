<script lang="ts">
  export let url: string;
</script>

<style>
  audio {
    margin: 1rem 0;
    width: 100%;
  }
</style>

<!-- TODO custom pause/play buttons and scrubber -->
<!-- svelte-ignore a11y-media-has-caption -->
<audio controls="controls"
       src={url}>Your browser does not support
  embedded audio!</audio>
