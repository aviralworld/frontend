<script lang="ts">
  import Metadata from "./Metadata.svelte";
  import RequiredMetadata from "./RequiredMetadata.svelte";

  import { publish as _publish } from "../routes/_publish";

  export let ages;
  export let blob;
  export let genders;
  export let location;

  export let username;
  export let categoryId;

  export let categories;
  export let token;

  let form;

  export let details = undefined;

  export let publishedName = undefined;
  export let publishedLink = undefined;
  export let publishedRecording = undefined;
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

    publishedLink = undefined;
    uploading = true;

    const merged = { ...details, category_id: categoryId, name: username, token };

    try {
      publishedRecording = await _publish(blob, merged);
      publishedLink = `/recording/${publishedRecording.id}/`;
      publishedName = username;
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
    <!--<p>Please list up to two e-mail addresses of people who will be prompted to share their thoughts on your story:</p>
    <p>(TODO: e-mail invitees)</p> -->
    <p>Your story will be published on the website and will be visible to all visitors.<!-- If you share your e-mail address below, you can choose to delete the story at any time.--></p>
    <RequiredMetadata name={username} categoryId={categoryId} categories={categories} categoryIsReadonly={true} />
    <Metadata ages={ages} genders={genders} bind:details bind:location showErrors={showErrors} />
    <button on:click|preventDefault={publish} class="button publish-button" type="submit" disabled={uploading}>
      {#if uploading}
        Publishing your story…
      <!-- TODO add spinner -->
    {:else}
      Publish and share my story
    {/if}
  </button>
  </form>
</section>
