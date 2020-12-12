<script lang="ts">
  import Metadata from "./Metadata.svelte";

  import { publish as _publish } from "../routes/_publish";

  export let ages;
  export let blob;
  export let categories;
  export let genders;
  export let parentId;
  export let username;
  export let location;

  let form;

  export let details = undefined;

  export let storyLink = undefined;
  let uploading = false;

  let showErrors = false;

  function makeRecordingUrl() {
    return URL.createObjectURL(blob);
  }

  async function publish() {
    for (const e of form.elements) {
      if (!e.checkValidity()) {
        showErrors = true;
        return;
      }
    }

    storyLink = undefined;
    uploading = true;

    const merged = { ...details };

    if (parentId !== undefined) {
      merged.parent_id = parentId;
    }

    try {
      const id = await _publish(blob, merged);
      storyLink = `/recording/${id}/`;
      published = true;
    } catch (e) {
    }

    uploading = false;
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
  <form bind:this={form} enctype="multipart/form-data">
    <p>Please list up to two e-mail addresses of people who will be prompted to share their thoughts on your story:</p>
    <p>(TODO: e-mail invitees)</p>
    <p>Your story will be published on the website and will be visible to all visitors. If you share your e-mail address below, you can choose to delete the story at any time.</p>
    <Metadata ages={ages} categories={categories} genders={genders} bind:details bind:name={username} bind:location showErrors={showErrors} />
    <button on:click|preventDefault={publish} class="button publish-button" type="submit" disabled={uploading}>
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
