<script context="module" lang="ts">
  import { verifyToken } from "./_token";

  export async function preload({ params, query }, session) {
    const { baseUrl } = session.frontendSettings;
    const { id } = params;

    const res = await this.fetch(`/api/recordings/id/${id}`);
    const promises = Promise.all(
      ["formats", "ages", "categories", "genders"].map((s) =>
        this.fetch(`/api/recordings/${s}`),
      ),
    );

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

    const responses = await promises;

    for (const r of responses) {
      if (r.status !== 200) {
        this.error(500, `Got a ${r.status} response from ${r.url}`);
        return;
      }
    }

    const [formats, ages, categories, genders] = await Promise.all(
      responses.map(async (r) => r.json()),
    );

    const verificationResult = await verifyToken(this, query.token, id);

    if (verificationResult?.status !== undefined) {
      this.error(verificationResult.status, verificationResult.message);
      return;
    }

    return {
      ages,
      baseUrl,
      categories,
      genders,
      formats,
      recording: await res.json(),
      token: verificationResult?.token,
    };
  }
</script>

<script lang="ts">
  import Reply from "../../components/Reply.svelte";

  export let baseUrl;

  export let ages;
  export let categories;
  export let formats;
  export let genders;

  export let recording;
  export let token;

  let location;
  let title;
  let description;

  $: location =
    recording.location !== null ? ` from ${recording.location}` : "";

  $: title = `A story by ${recording.name}${location}`;
  $: description = `Listen to the story of ${recording.name}${location}.`;
</script>

<style>
  main {
    padding: 1rem;
  }

  :global(audio) {
    margin: 1rem 0;
    width: 100%;
  }

  :global(section) {
    margin-top: 1rem;
  }

  .listen {
    margin-top: 1rem;
  }

  .parent {
    text-align: center;
    font-size: 1.1em;
  }

  .parent > a {
    text-decoration: none;
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

<main>
  {#if recording.parent}
    <p class="parent">
      <a href="/recording/{recording.parent}">See this recording’s parent</a>
    </p>
  {/if}

  <h2 class="listen">Listen</h2>
  <p>
    Listening to the story of
    {recording.name}{#if recording.location !== null}
      {' '}from
      {recording.location}
    {/if}. Thank you for taking the time to become part of this shared story.
  </p>

  <!-- TODO custom pause/play buttons and scrubber -->
  <audio controls="controls" src={recording.url}>Your browser does not support
    embedded audio!</audio>

  <Reply {ages} {categories} {formats} {genders} {token} {recording} />
</main>
