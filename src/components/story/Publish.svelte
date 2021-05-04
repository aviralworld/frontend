<script lang="ts">
  import { goto } from "@sapper/app";
  import { get } from "svelte/store";
  import { fade, slide } from "svelte/transition";

  import { trim } from "../../normalize";
  import { FORBIDDEN_CODE, publish as _publish } from "../../publish";
  import { makeRecordingUrl } from "../../recorder";
  import type { ISubmission, Option } from "../../types";
  import OptionalInformation from "../form/OptionalInformation.svelte";
  import RequiredInformation from "../form/RequiredInformation.svelte";
  import { reply } from "../../store/replies";
  import { simple } from "../../store/local";
  import Audio from "../Audio.svelte";
  import { PublishFailedError } from "../../errors";

  // supplied by parent
  export let ages: readonly Option[];
  export let categories: readonly Option[];
  export let genders: readonly Option[];
  export let parent: string;
  export let parentId: string;
  export let token: string;

  const stored = reply(parentId);

  const name = simple(parentId, "name", null);
  const categoryId = simple(parentId, "categoryId", null);

  const ageId = simple(parentId, "ageId", null);
  const email = simple(parentId, "email", null);
  const genderId = simple(parentId, "genderId", null);
  const location = simple(parentId, "location", null);
  const occupation = simple(parentId, "occupation", null);

  let uploading = false;
  let publishErrorCode: number;
  let lastPublishedName: string;

  let form;

  async function publish(): Promise<void> {
    if (!form.checkValidity()) {
      return;
    }

    const details: ISubmission = {
      name: $name,
      category_id: $categoryId,
      token,
      occupation: trim($occupation),
      age_id: $ageId,
      gender_id: $genderId,
      location: trim($location),
      email: trim($email),
    };

    uploading = true;
    lastPublishedName = name;
    publishErrorCode = undefined;

    try {
      const published = await _publish(get(stored), details);
      await goto(`/lookup/${published.key}/`);

      forgetMetadata();
      await forgetRecording();
    } catch (e) {
      if (e instanceof PublishFailedError) {
        publishErrorCode = e.code;
      } else {
        throw e;
      }
    } finally {
      uploading = false;
    }
  }

  function askToForgetRecording(): Promise<void> {
    if (confirm("Are you sure you want to discard the existing recording and try again?")) {
      forgetMetadata();
      return forgetRecording();
    }
  }

  function forgetRecording(): Promise<void> {
      return stored.set(undefined);
  }

  function forgetMetadata(): void {
    for (const f of [name, categoryId, ageId, email, genderId, location, occupation]) {
      f.set(null);
    }
  }
</script>

<style>
  .reset {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-gap: 1rem;
    align-items: center
  }

  .optional {
    font-size: 1.1em;
    font-style: italic;
    margin: 1.5rem 0;
    text-align: center;
  }

  .publish-button {
    display: block;
    margin: 1rem auto 1rem;
    font-size: 1.1em;
  }
</style>

<section class="publish" in:slide out:fade>
  <h2>Publish</h2>
  <p class="thanks">Thank you for recording your reply to {parent}.</p>
  <form class="reset"><Audio url={$stored && makeRecordingUrl($stored)} /><button type="submit" on:click|preventDefault={askToForgetRecording} class="button reset-button">Try again</button></form>
  <p>You can confirm your details and publish your story below. Only your name and location, as well as the subject of your story, will be visible on the website.</p>

  <form class="record" on:submit|preventDefault={publish} bind:this={form}>
    <RequiredInformation {categories} {parentId} />

    <p class="optional">The remaining fields are optional. Only your
      location will be shared publicly. The rest will only be used for
      research purposes and will never be shared publicly.</p>

    <OptionalInformation {ages} {genders} {parentId} />

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

  <button type="submit" class="button publish-button" disabled={uploading} aria-live="polite" aria-relevant="text">{#if uploading}Publishing…{:else}Publish and share my story{/if}</button>
    </form>
</section>
