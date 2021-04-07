<script lang="ts">
  import Publish from "./Publish.svelte";
  import Record from "./Record.svelte";

  export let ages;
  export let categories;
  export let formats;
  export let genders;

  export let recording;
  export let token;

  let publishedLink;
  let publishedLocation;
  let publishedName;
  let publishedRecording;

  let initialName;

  let categoryId;

  let currentlyRecording;
  let blob;
  let invitees;
  let supportedFormat;

  $: completedRecording = !currentlyRecording && blob !== undefined;
</script>

{#if completedRecording}
  <Publish
    {categories}
    {ages}
    {blob}
    {genders}
    {token}
    bind:publishedLink
    username={initialName}
    {categoryId}
    bind:location={publishedLocation}
    bind:publishedRecording
    bind:publishedName />
{:else if token !== undefined}
  <section class="after reply">
    <h2>Reply</h2>
    <Record
      {categories}
      {formats}
      bind:inProgress={currentlyRecording}
      bind:blob
      bind:supportedFormat
      maxRecordingLengthSeconds={5 * 60}
      bind:name={initialName}
      bind:categoryId
      parentName={recording.name} />
  </section>
{/if}
