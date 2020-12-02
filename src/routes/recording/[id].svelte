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

  let showLink = false;

  $: completedRecording = !currentlyRecording && blob !== undefined;

  function makeRecordingUrl() {
    return URL.createObjectURL(blob);
  }
</script>

<style>
  main {
    padding: 1rem;
  }

  audio {
    margin: 1rem 0;
    width: 100%;
  }

  .after {
    margin-top: 1rem;
  }

  .publish-button {
    margin: 1rem auto 0 auto;
    font-size: 1.1em;
    display: flex;
  }
</style>

<svelte:head>
  <title>A story by {recording.name} ({recording.location})</title>
</svelte:head>

<main>
  {#if recording.parent}
    <a href="/recording/{recording.parent}">See this recording’s parent</a>
  {/if}

<h2>Listen</h2>
  <p>
    Listening to the story of
    {recording.name}
    from
    {recording.location}. Thank you for taking the time to become part of this shared
    story.
  </p>

  <!-- TODO custom pause/play buttons and scrubber -->
  <audio controls="controls" src="{recording.url}">Your browser does not support embedded audio!</audio>

  {#if completedRecording}
    <section class="after publish">
      <h2>Share</h2>
      <p>Thank you for recording your story. You can listen to it below:</p>
      <!-- TODO custom pause/play buttons and scrubber -->
      <audio controls="controls" src="{makeRecordingUrl()}">Your browser does not support embedded audio!</audio>
      <p>Please list up to two e-mail addresses of people who will be prompted to share their thoughts on your story:</p>
      <form>
        <p>(TODO: e-mail invitees)</p>
        <p>Your story will be published on the website and will be visible to all visitors. If you share your e-mail address below, you can choose to delete it at any time.</p>
        <button on:click|preventDefault={() => {showLink = true}} class="button publish-button">Publish and share my story</button>
        {#if showLink}
          <p>(this is a link to the story)</p>
        {/if}
      </form>
      </section>
    <section class="after remember">
      <h2>Remember</h2>
      <p>We’d like to save your e-mail address to share a very special gift with you later. This is completely optional.</p>
      <form>(TODO: e-mail form)</form>
      <p>Thank you for participating!</p>
    </section>
  {:else}
    <section class="after reply">
      <h2>Reply</h2>
      <p>Tap the record button to send {recording.name} a reply.</p>

      <Record parent={recording} formats={formats} bind:inProgress={currentlyRecording} bind:blob bind:supportedFormat maxRecordingLengthSeconds={5 * 60} />
    </section>
  {/if}
</main>
