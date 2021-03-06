<script context="module" lang="ts">
  import type { Preload } from "@sapper/app";

  import { verifyToken } from "../../token";
  import type { IFrontendSettings } from "../../server/frontendSettings";
  import { fetchMetadata } from "./_fetch";
  import { API_PATH } from "../../paths";

  export const preload: Preload = async function ({ params, query }, session) {
    const {
      baseUrl,
      minRecordingLengthSeconds,
      maxRecordingLengthSeconds,
    } = session.frontendSettings as IFrontendSettings;
    const { id } = params;

    const res: Response = await this.fetch(`${API_PATH}/id/${id}`);

    if (res.status === 400 || res.status === 404) {
      this.error(404, `Could not find recording with ID ${id}`);
      return;
    }

    if (res.status === 410) {
      this.error(410, "This recording has been deleted.");
      return;
    }

    if (res.status !== 200) {
      this.error(
        res.status,
        `Could not fetch recording with ID ${id}: ${await res.text()}`,
      );
      return;
    }

    const verificationResult = await verifyToken(this, query.token, id);

    if (verificationResult?.status !== undefined) {
      this.error(verificationResult.status, verificationResult.message);
      return;
    }

    const { key } = query;

    let isOwner = false;
    let recordingTokens = [];

    if (key !== undefined) {
      const response = await this.fetch(`${API_PATH}/lookup/${key}/`);

      if (response.status !== 200) {
        this.error(400, `Not a valid key: ${key}`);
        return;
      }

      const data = await response.json();
      const keyId = data.id;

      if (id !== keyId) {
        this.error(400, `Not a valid key: ${key}`);
        return;
      }

      recordingTokens = data.tokens;

      isOwner = true;
    }

    const metadata =
      query.token !== undefined ? await fetchMetadata(this, API_PATH) : {};

    return {
      ...metadata,
      baseUrl,
      key,
      isOwner,
      minRecordingLength: minRecordingLengthSeconds,
      maxRecordingLength: maxRecordingLengthSeconds,
      recording: await res.json(),
      recordingTokens,
      token: verificationResult?.token,
    };
  };
</script>

<script lang="ts">
  import { asLocationString } from "../../components/story";
  import Listen from "../../components/story/Listen.svelte";
  import Publish from "../../components/story/Publish.svelte";
  import Record from "../../components/story/Record.svelte";
  import Remember from "../../components/Remember.svelte";
  import type { IRecording, Option } from "../../types";
  import { reply } from "../../store/replies";

  export let baseUrl: string;
  export let minRecordingLength: number;
  export let maxRecordingLength: number;

  export let ages: readonly Option[];
  export let categories: readonly Option[];
  export let formats: readonly string[];
  export let genders: readonly Option[];

  export let recording: IRecording;
  export let recordingTokens: readonly string[];
  export let token: string;
  export let key: string;

  export let isOwner: boolean;

  const blob = reply(recording.id);

  let base;
  $: base = new URL(baseUrl);

  let permalink;
  $: permalink = new URL(`/recording/${recording.id}`, base);

  let location;
  let title;
  let description;

  $: location = asLocationString(recording.location);

  $: title = `A story by ${recording.name}${location}`;
  $: description = `Listen to the story of ${recording.name}${location}.`;
</script>

<style>
  main {
    padding: 1rem;
  }

  :global(section) {
    margin-top: 1rem;
  }
</style>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="twitter:card" value="summary" />
  <meta property="og:title" content={title} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{baseUrl}recording/{recording.id}/" />
  <meta
    property="og:image"
    content="{baseUrl}static/favicon/ms-icon-310x310.png" />
  <meta property="og:description" content={description} />
</svelte:head>

<main aria-live="polite">
  <Listen {recording} {isOwner} />

  {#if isOwner}
    <Remember
      {key}
      username={recording.name}
      link={permalink}
      location={recording.location}
      base={new URL(baseUrl)}
      {recording}
      tokens={recordingTokens} />
  {:else if token !== undefined}
    {#if $blob === undefined}
      <Record
        {categories}
        {formats}
        parent={recording.name}
        parentId={recording.id}
        {minRecordingLength}
        {maxRecordingLength} />
    {:else}
      <Publish
        {ages}
        {categories}
        {genders}
        parent={recording.name}
        parentId={recording.id}
        {token} />
    {/if}
  {/if}
</main>
