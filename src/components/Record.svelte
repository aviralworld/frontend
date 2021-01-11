<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  import type { MediaRecorder } from "dom-mediacapture-record";

  import Choices from "./Choices.svelte";
  import RequiredMetadata from "./RequiredMetadata.svelte";
  import { asMinutesAndSeconds } from "../time";

  let recorder = writable(undefined);
  let currentTime: number;

  let rawName;
  export let name;
  export let categoryId;

  export let nameInput;

  export let parentName;

  $: name = rawName === undefined ? "" : rawName.trim();

  // these are provided by the parent component
  export let formats;
  export let maxRecordingLengthSeconds = 20;
  export let categories;

  // these are for the parent's use
  export let inProgress: boolean;
  $: inProgress = $recorder?.state === "recording";
  export let supportedFormat: string = undefined;
  export let blob: Blob = undefined;

  const TIME_SLICE_MS = 1000;

  let canAccessMicrophone = false;

  function updateMicrophonePermission(state) {
    canAccessMicrophone = state === "granted";
  }

  const permissionQuery = new Promise((resolve, reject) =>
    onMount(() =>
      navigator.permissions.query({ name: "microphone" }).then((result) => {
        updateMicrophonePermission(result.state);

        result.onchange = (e) => updateMicrophonePermission(e.target.state);

        supportedFormat = formats.find((format) =>
          MediaRecorder.isTypeSupported(format),
        );
        resolve();
      }),
    ),
  );

  async function handleRecording() {
    if ($recorder === undefined) {
      blob = undefined;
      recorder.set(await createRecorder(supportedFormat));
      currentTime = 0;

      const chunks = [];

      const listener = (e) => {
        if (inProgress && e.data.size > 0) {
          chunks.push(e.data);
        }

        currentTime = chunks.length;

        if (inProgress && currentTime >= maxRecordingLengthSeconds) {
          $recorder.removeEventListener("dataavailable", listener);
          $recorder.stop();
        }
      };

      $recorder.addEventListener("dataavailable", listener);

      $recorder.addEventListener("stop", () => {
        blob = new Blob(chunks);
        recorder.set(undefined);
      });

      $recorder.start(TIME_SLICE_MS);
    } else {
      $recorder.stop();
    }
  }

  async function createRecorder(mimeType) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    return new window.MediaRecorder(stream, { mimeType });
  }
</script>

<style>
  .record {
    margin-top: 1rem;
  }

  /* https://moderncss.dev/css-button-styling-guide/ */
  .record-button {
    font-size: 1.1em;
    display: flex;
    margin: 0 auto;
  }

  @media screen and (-ms-high-contrast: active) {
    .record-button {
      border: 2px solid currentcolor;
    }
  }

  .error {
    font-weight: bold;
  }
</style>

<!-- TODO add polyfill: https://github.com/ai/audio-recorder-polyfill -->
{#if supportedFormat === undefined}
  <p>You can record a story of your own to share with {parentName}.</p>
<p class="error">Your browser does not allow recording audio in any supported formats.</p>
{:else}
  {#await permissionQuery then result}
    <p>You can record a story of your own to share with {parentName}.
    {#if !canAccessMicrophone}
      You will need to grant access to your microphone when prompted.
    {/if}
    </p>
    <form class="record">
      <p>First, please let us know a few details:</p>

      <RequiredMetadata bind:name={rawName} bind:categoryId categories={categories} bind:nameInput={nameInput} />
      <button on:click|preventDefault={handleRecording} class="button record-button" disabled={name === "" || categoryId === undefined}>
        {#if inProgress}
          Stop recording ({asMinutesAndSeconds(currentTime)}/{asMinutesAndSeconds(maxRecordingLengthSeconds)})
        {:else}
        Record
      {/if}
    </button></form>
  {/await}
{/if}
