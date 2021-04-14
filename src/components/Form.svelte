<script lang="ts">
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";
  import { readable, writable } from "svelte/store";

  import Choices from "./Choices.svelte";
  import { normalizeName } from "../normalize";
  import { checkName } from "../actions/checkName";
  import { asMinutesAndSeconds } from "../time";
  import { MicrophoneStatus, microphonePermission } from "../store/microphone";
  import { createRecordingMachine } from "../machines/recording";
  import type { Option, ISubmission } from "../types";
  import { publish as _publish, FORBIDDEN_CODE } from "../publish";
  import { findSupportedFormat, makeRecordingUrl } from "../recorder";

  // passed from route or settings
  export let ages: readonly Option[];
  export let categories: readonly Option[];
  export let formats: readonly string[];
  export let genders: readonly Option[];
  export let minRecordingLength: number;
  export let maxRecordingLength: number;
  export let parent: string;
  export let token: string;

  let name: string | undefined = undefined;
  let categoryId: string | undefined = undefined;

  let occupation: string = undefined;
  let ageId: string = undefined;
  let genderId: string = undefined;
  let location: string = undefined;
  let email: string = undefined;

  function trim(v: string | undefined): string | undefined {
    if (v === undefined) {
      return v;
    }

    const trimmed = v.trim();

    if (trimmed === "") {
      return undefined;
    }

    return trimmed;
  }

  let currentCategory: Option;
  $: currentCategory = categories.find(([id]) => id === categoryId);

  const canAccessMicrophone = writable(MicrophoneStatus.UNKNOWN);

  onMount(() => {
      microphonePermission().subscribe((v) => {
        canAccessMicrophone.set(v);
      });
  });

  const machine = createRecordingMachine(minRecordingLength, maxRecordingLength);

  function updateName() {
    if (name !== undefined) {
      name = normalizeName(name);
    }
  }

  let noData = false;
  $: if ($machine.matches("ready.noData")) {
    noData = true;
  } else {
    noData = false;
  }

  let currentTime = 0;
  let data: Blob;

  machine.onTransition((state, event) => {
    if (event.type === "TIME") {
      currentTime = event.time;
    }

    if (state.value === "completed") {
      data = state.context.data;
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

  let uploading = false;
  let lastPublishedName: string;
  let publishErrorCode: number;

  async function publish() {
    const details: ISubmission = {
      name,
      category_id: categoryId,
      token,
      occupation: trim(occupation),
      age_id: ageId,
      gender_id: genderId,
      location: trim(location),
      email: trim(email),
    };

    uploading = true;
    lastPublishedName = name;

    try {
      const recording = await _publish(data, details);
      publishErrorCode = undefined;
      await goto(`/lookup/${recording.key}/`);
    } catch(e) {
      publishErrorCode = e;
      console.error("Failed to publish with status", e);
    } finally {
      uploading = false;
    }
  }
</script>

<style>
  .required-metadata-item {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    font-size: 1.1rem;
  }

  .required-metadata-item:first-line {
    text-indent: -1em;
  }

  input {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }

  :global(fieldset), .thanks {
    margin-top: 1rem;
  }


  label {
    display: flex;
    flex-flow: column;
    margin-top: 1rem;
  }

  label > :global(*) {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }

  .addendum {
    font-style: italic;
    font-size: 0.9em;
    display: block;
    padding: 0;
  }

  .label, :global(.choices) {
    margin-top: 1.5rem;
    font-size: 1.1em;
  }

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

  .optional {
    margin-top: 1.5rem;
  }
</style>

<h2>{#if $machine.matches("completed")}Share{:else}Reply{/if}</h2>
{#if $canAccessMicrophone === MicrophoneStatus.DENIED}
  <p>Recording a story of your own requires accessing your microphone.</p>
{:else if $machine.matches("disabled")}
  <!-- TODO add polyfill: https://github.com/ai/audio-recorder-polyfill -->
  <p>You can record a story of your own to share with {parent}.</p>
<p class="error">
  Your browser does not allow recording audio in any supported formats.
</p>
{:else}
  <form class="record" on:submit|preventDefault={() => $machine.matches("completed") ? publish() : handleRecordButton()}>
    <p>
      You can record a story of your own to share with
      {parent}.
      {#if !canAccessMicrophone}
        You will need to grant access to your microphone when prompted.
      {/if}
    </p>
    <p>First, please let us know a few details:</p>
    <label class="required-metadata-item name" for="user-name">What is your name? (This must be unique.)
      <input
        type="text"
        name="name"
        autocomplete="name"
        id="user-name"
        bind:value={name}
        pattern=".*\S.*"
        on:change={updateName}
        required
        use:checkName={readable(undefined, () => () => undefined)} />
    </label>

    <Choices
      className="required-metadata-item"
      label="What is your story about?"
      options={categories}
      name="category"
      optional={false}
      bind:selection={categoryId} />

    {#if $machine.matches("completed")}
      <p class="thanks">Thank you for recording your story:</p>
      <!-- TODO custom pause/play buttons and scrubber -->
      <audio controls="controls" src={makeRecordingUrl(data)}>Your browser does not
        support embedded audio!</audio>

    <p>You can publish it and make it visible to all visitors below.  
          The remaining fields are optional. They will only be used for research
          purposes and will never be shared publicly.</p>

      <section class="optional">
        <label for="user-occupation" class="label">What is your occupation?
          <input
            type="text"
            name="occupation"
            id="user-occupation"
            bind:value={occupation} /></label>

        <Choices
          className="choices"
          label="What is your age?"
          options={ages}
          name="age"
          optional={true}
          bind:selection={ageId} />

        <Choices
          className="choices"
          label="What gender do you identify as?"
          options={genders}
          name="gender"
          optional={true}
          bind:selection={genderId} />

        <label class="label" for="user-location">Where do you live?
          <input
            type="text"
            name="location"
            id="user-location"
            bind:value={location} /></label>

        <label class="label" for="user-email">What is your email address?
          <input type="email" name="email" id="user-email" bind:value={email} />
          <span class="addendum">(If you share this, we will
            <strong>only</strong>
            use it to email you the link to manage your recording, as a reminder, and
            major updates about the project. You can also choose not to share it, in
            which case you’ll still be able to copy the link and save it once you’ve
            published your recording.)</span></label>
      </section>

      {#if publishErrorCode === FORBIDDEN_CODE}
      <p class="error">
        There is already a recording under that name. Please try again with a
        different name.
      </p>
    {:else if publishErrorCode !== undefined && publishErrorCode !== FORBIDDEN_CODE}
      <p class="error">
        Your story could not be published. This may be a temporary issue. Please
        try again.
      </p>
    {/if}
      <button on:click|preventDefault={publish} type="submit" class="button publish-button" disabled={uploading} aria-live="polite" aria-relevant="text">{#if uploading}Publishing…{:else}Publish and share my story{/if}</button>
    {:else}
      {#if noData}<p class="error">The last recording was a bit short. Please try recording for at least {minRecordingLength.toLocaleString()} seconds.</p>{/if}
      <button
        aria-live="polite"
        aria-relevant="text"
        class="button record-button"
        type="submit">
        {#if $machine.matches("recording")}
          Stop recording ({asMinutesAndSeconds(currentTime)}/{asMinutesAndSeconds(maxRecordingLength)})
        {:else}Record{/if}
          </button>
        {/if}
      </form>
    {/if}
  