<script lang="ts">
  import { goto } from "@sapper/app";

  import { trim } from "../../normalize";
  import { FORBIDDEN_CODE, publish as _publish } from "../../publish";
  import { makeRecordingUrl } from "../../recorder";
  import type { ISubmission, Option } from "../../types";
  import OptionalInformation from "../form/OptionalInformation.svelte";
  import RequiredInformation from "../form/RequiredInformation.svelte";
  import Audio from "../Audio.svelte";

  // supplied by parent
  export let ages: readonly Option[];
  export let categories: readonly Option[];
  export let genders: readonly Option[];
  export let initialName: string;
  export let initialCategoryId: string;
  export let parent: string;
  export let recording: Blob;
  export let token: string;

  let name: string;
  let categoryId: string;

  let ageId: string;
  let email: string;
  let genderId: string;
  let location: string;
  let occupation: string;

  let uploading = false;
  let publishErrorCode: number;
  let lastPublishedName: string;

  async function publish(): Promise<void> {
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
    publishErrorCode = undefined;

    try {
      const published = await _publish(recording, details);
      await goto(`/lookup/${published.key}/`);
    } catch (e) {
      if (typeof e === "number") {
        publishErrorCode = e;
      }

      console.error("Failed to publish with status", e);
    } finally {
      uploading = false;
    }
  }
</script>

<style>
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

<section class="publish">
  <h2>Publish</h2>
  <p class="thanks">Thank you for recording your reply to {parent}.</p>
  <Audio url={makeRecordingUrl(recording)} />
  <p>You can confirm your details and publish your story below.</p>

  <form class="record" on:submit|preventDefault={publish}>
    <RequiredInformation {categories} {initialName} {initialCategoryId} bind:name bind:categoryId />

    <p class="optional">The remaining fields are optional. They will
      only be used for research purposes and will never be shared
      publicly.</p>

    <OptionalInformation {ages} {genders} bind:ageId bind:email bind:genderId bind:location bind:occupation />

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
    </form>
</section>
