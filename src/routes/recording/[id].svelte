<script context="module" lang="ts">
  export async function preload({ params }) {
    const { id } = params;

    const res = await this.fetch(`/api/recordings/id/${id}`);
    const promises = Promise.all(["formats", "ages", "categories", "genders"].map((s) => this.fetch(`/api/recordings/${s}`)));

    if (res.status === 404) {
      this.error(404, `Could not find recording with ID ${id}`);
      return;
    }

    if (res.status !== 200) {
      this.error(res.status, `Could not fetch recording with ID ${id}: ${await res.text()}`);
    }

    const responses = await promises;

    for (const r of responses) {
      if (r.status !== 200) {
        this.error(500, `Got a ${r.status} response from ${r.url}`);
        return;
      }
    }

    const [formats, ages, categories, genders] = await Promise.all(responses.map(async (r) => r.json()));

    return { ages, categories, genders, formats, recording: await res.json() };
  }
</script>

<script lang="ts">
  import Publish from "../../components/Publish.svelte";
  import Record from "../../components/Record.svelte";
  import Remember from "../../components/Remember.svelte";
  import type { IRecording } from "../_common";

  export let ages;
  export let categories;
  export let formats;
  export let genders;

  export let recording: IRecording;

  export let published;

  let currentlyRecording;
  let blob;
  let invitees;
  let supportedFormat;

  $: completedRecording = !currentlyRecording && blob !== undefined;
</script>

<style>
  main {
    padding: 1rem;
  }

  :global(audio) {
    margin: 1rem 0;
    width: 100%;
  }

  :global(section) {
    margin-top: 1rem;
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
    <Publish ages={ages} blob={blob} categories={categories} genders={genders} bind:published={published} />

    {#if published}
      <Remember />
    {/if}
  {:else}
      <section class="after reply">
        <h2>Reply</h2>
        <p>Tap the record button to send {recording.name} a reply.</p>

        <Record parent={recording} formats={formats} bind:inProgress={currentlyRecording} bind:blob bind:supportedFormat maxRecordingLengthSeconds={5 * 60} />
      </section>
    {/if}
  </main>
