<script lang="ts">
  import Publish from "./Publish.svelte";
  import Record from "./Record.svelte";
  import Remember from "./Remember.svelte";

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

  // TODO why is this necessary?
  function forget() {
    publishedLink = undefined;
    publishedLocation = undefined;
    publishedRecording = undefined;
    blob = undefined;
    username = undefined;
    categoryId = undefined;
    currentlyRecording = undefined;
  }
</script>

{#if publishedRecording !== undefined && document.location.href !== publishedLink}
  <Remember
    username={publishedName}
    link={publishedLink}
    location={publishedLocation}
    {forget}
    recording={publishedRecording} />
{:else if completedRecording}
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
