<script lang="ts">
  import Metadata from "./Metadata.svelte";

  export let ages;
  export let blob;
  export let categories;
  export let genders;

  export let published = false;

  let storyLink = undefined;
  let uploading = false;

  function makeRecordingUrl() {
    return URL.createObjectURL(blob);
  }

  async function publish() {
    storyLink = undefined;
          uploading = true;
    // TODO upload
          storyLink = "http://www.example.com/";
          uploading = false;
    published = true;
  }
</script>

<style>
  .publish-button {
    margin: 1rem auto 0 auto;
    font-size: 1.1em;
    display: flex;
  }
</style>

<section>
  <h2>Share</h2>
  <p>Thank you for recording your story. You can listen to it below:</p>
  <!-- TODO custom pause/play buttons and scrubber -->
  <audio controls="controls" src="{makeRecordingUrl()}">Your browser does not support embedded audio!</audio>
  <form>
    <p>Please list up to two e-mail addresses of people who will be prompted to share their thoughts on your story:</p>
    <p>(TODO: e-mail invitees)</p>
    <p>Your story will be published on the website and will be visible to all visitors. If you share your e-mail address below, you can choose to delete the story at any time.</p>
    <Metadata ages={ages} categories={categories} genders={genders} />
    <button on:click|preventDefault={publish} class="button publish-button" disabled={uploading}>
      {#if uploading}
        Publishing your story…
      <!-- TODO add spinner -->
    {:else}
      Publish and share my story
    {/if}
  </button>
    {#if storyLink !== undefined}
      <p>(this is a link to the story)</p>
    {/if}
  </form>
</section>
