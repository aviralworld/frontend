<script context="module" lang="ts">
  export async function preload({ params }) {
    const { id } = params;
    const promises = [
      this.fetch(`/api/recordings/id/${id}`),
      this.fetch("/api/recordings/formats"),
    ];
    const [res, formats] = await Promise.all(promises);

    if (res.status === 200) {
      return { recording: await res.json(), formats: await formats.json() };
    }

    if (res.status === 404) {
      this.error(404, `Could not find recording with ID ${id}`);
      return;
    }

    this.error(res.status, `Could not fetch recording: ${await res.text()}`);
  }
</script>

<script lang="ts">
  import Record from "../../components/Record.svelte";
  import type { IRecording } from "../_common";
  export let formats;
  export let recording: IRecording;

  let currentlyRecording;
  let blob;
  let invitees;
  let supportedFormat;

  let unlisted = "false";

  $: completedRecording = !currentlyRecording && blob !== undefined;

  function makeRecordingUrl() {
    return URL.createObjectURL(blob);
  }
</script>

<svelte:head>
  <title>A story by {recording.name} ({recording.location})</title>
</svelte:head>

<!-- TODO fix details -->
<h2>Listen</h2>
<p>
  Listening to the story of
  {recording.name}
  from
  {recording.location}. Thank you for taking the time to become part of a shared
  story.
</p>

<!-- TODO custom pause/play buttons and scrubber -->
<audio controls="controls" src="{recording.url}">Your browser does not support embedded audio!</audio>

<!-- TODO show parent; include unlisted recordings? -->

{#if completedRecording}
<h2>Share</h2>
<p>Thank you for recording your story. You can listen to it below:</p>
<!-- TODO custom pause/play buttons and scrubber -->
<audio controls="controls" src="{makeRecordingUrl()}">Your browser does not support embedded audio!</audio>
<p>Who should be able to listen to it? Please list up to two people who will be prompted to share their thoughts on your story.</p>
<p>(TODO: e-mail invitees)</p>
<form>
  <label for="unlisted-false"><input type="radio" name="unlisted" value="false" id="unlisted-false" bind:group={unlisted}> This is a public story. Everyone can listen and reply to it.</label><br/>
  <label for="unlisted-true"><input type="radio" name="unlisted" value="true" id="unlisted-true" bind:group={unlisted}> This is an unlisted story. Only people I share the link with can listen to it.</label>
</form>
<h2>Remember</h2>
<p>Would you like to be able to access your story later? Please share an e-mail address to which we can send a permanent link to access this story. This is completely optional.</p>
<form>(TODO: e-mail form)</form>
<p>Thank you for participating!</p>
{:else}
<h2>Reply</h2>
<p>Tap the record button to send {recording.name} a reply.</p>

<Record parent={recording} formats={formats} bind:inProgress={currentlyRecording} bind:blob bind:supportedFormat maxRecordingLengthSeconds={5 * 60} />
{/if}
