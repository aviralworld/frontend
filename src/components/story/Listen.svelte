<script lang="ts">
  import {asLocationString} from ".";
  import type {IRecording} from "../../types";
  import Audio from "../Audio.svelte";

  export let recording: IRecording;
  export let isOwner: boolean;

  export const location = asLocationString(recording.location);
</script>

<style>
  .parent {
    text-align: center;
    font-size: 1.1em;
  }

  .parent > a {
    text-decoration: none;
  }
</style>

<section class="listen">
  {#if recording.parent}
    <aside class="parent">
      <a href="/recording/{recording.parent}" sapper:prefetch>See this recording’s parent</a>
    </aside>
  {/if}

<h2 class="listen" id="listen">Listen</h2>
  <p>
    Listening to the story of
    {recording.name}{location}.
  </p>

  <Audio url={recording.url} />

  {#if isOwner}
    Thank you for taking the time to share this story.
  {:else}
    Thank you for taking the time to become part of this shared story.
  {/if}
</section>
