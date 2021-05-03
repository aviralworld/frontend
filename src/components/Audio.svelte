<script lang="ts">
  import type {IRecording} from "../../types";

  export let url: string;
  export let metadata: IRecording;

  function setUpMediaSession() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }
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
       on:play={setUpMediaSession}
       src={url}>Your browser does not support
  embedded audio!</audio>
