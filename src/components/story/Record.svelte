<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  import RequiredInformation from "../form/RequiredInformation.svelte";
  import { asMinutesAndSeconds } from "../../time";
  import { MicrophoneStatus, microphonePermission } from "../../store/microphone";
  import { createRecordingMachine } from "../../machines/record";
  import type { Option } from "../../types";
  import { findSupportedFormat } from "../../recorder";

  // passed from route or settings
  export let categories: readonly Option[];
  export let formats: readonly string[];
  export let minRecordingLength: number;
  export let maxRecordingLength: number;
  export let parent: string;

  // provided by component
  export let blob: Blob = undefined;

  export let name: string;
  export let categoryId: string;

  const canAccessMicrophone = writable(MicrophoneStatus.UNKNOWN);

  onMount(() => {
    microphonePermission().subscribe((v) => {
      canAccessMicrophone.set(v);
    });
  });

  const machine = createRecordingMachine(minRecordingLength, maxRecordingLength);

  let noData = false;
  $: if ($machine.matches("ready.noData")) {
    noData = true;
  } else {
    noData = false;
  }

  let currentTime = 0;

  machine.onTransition((state, event) => {
    if (event.type === "TIME") {
      currentTime = event.time;
    }

    if (state.value === "completed") {
      blob = state.context.data;
    }
  });

  function handleRecordButton() {
    if ($machine.matches("recording")) {
      machine.send("STOP");
    } else if ($machine.matches("ready.noData")) {
      machine.send("START");
    } else {
      machine.send({ type: "PREPARE", format: findSupportedFormat(formats)});
    }
  }
</script>

<style>

  .record {
    margin-top: 1rem;
  }

  /* https://moderncss.dev/css-button-styling-guide/ */
  .button {
    font-size: 1.1em;
    display: flex;
    margin: 0 auto;
    margin-top: 1rem;
  }

  @media screen and (-ms-high-contrast: active) {
    .button {
      border: 2px solid currentcolor;
    }
  }

  .error {
    font-weight: bold;
    font-size: 1.1em;
    margin-top: 1rem;
    color: var(--error-foreground);
  }
</style>

<h2>Reply</h2>
{#if $canAccessMicrophone === MicrophoneStatus.DENIED}
  <p>You must grant access to your microphone in order to record a story.</p>
{:else if $machine.matches("disabled")}
  <!-- TODO add polyfill: https://github.com/ai/audio-recorder-polyfill -->
<p>You can record a story of your own to share with {parent}.</p>
<p class="error">
  Your browser does not allow recording audio in any supported formats.
</p>
{:else}
  <form class="record" on:submit|preventDefault={handleRecordButton}>
    <p>
      You can record a story of your own to share with
      {parent}.
      {#if !canAccessMicrophone}
        You will need to grant access to your microphone when prompted.
      {/if}
    </p>
    <p>First, please let us know a few details:</p>
    <RequiredInformation {categories} bind:name bind:categoryId />

      {#if noData}<p class="error">The last recording was a bit too short. Please try recording for at least {minRecordingLength.toLocaleString()} seconds.</p>{/if}
        <button
          aria-live="polite"
          aria-relevant="text"
          class="button record-button"
          type="submit">
          {#if $machine.matches("recording")}
            Stop recording ({asMinutesAndSeconds(currentTime)}/{asMinutesAndSeconds(maxRecordingLength)})
          {:else}Record{/if}
            </button>
  </form>
{/if}
