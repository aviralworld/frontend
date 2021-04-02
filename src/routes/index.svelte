<script context="module" lang="ts">
  export async function preload(page: any, session: any) {
    const { baseUrl, randomStoryCount } = session.frontendSettings;

    const res = await this.fetch(`/api/recordings/random/${randomStoryCount}/`);

    if (res.status !== 200) {
      return { baseUrl, recordings: [] };
    }

    const json = await res.json();
    return { baseUrl, recordings: json.recordings };
  }
</script>

<script lang="ts">
  import RecordingList from "../components/RecordingList.svelte";

  export let baseUrl;
  export let recordings;

  let description =
    "Make history. Or just rant. Share your Covid-19 story and highlight the positive elements of virality. Create and explore connections between us.";
</script>

<style>
  main {
    font-size: 1.2rem;
  }

  .intro {
    grid-area: 2 / 1 / auto / auto;
  }

  .invitation {
    grid-area: 2 / 2 / auto / auto;
  }

  h2 {
    font-size: 1.4rem;
  }

  h2 + p {
    margin-top: 1rem;
  }

  .p + .p {
    margin-top: 2rem;
  }

  @media (min-width: 40em) {
    .p + .p {
      margin-top: 0;
    }
  }

  .about, .tagline {
    text-align: center;
  }

  .about {
    font-size: 1.3rem;
  }

  .tagline {
    font-size: 2rem;
  }

  @media (min-width: 40em) {
    main {
      display: grid;
      grid-template:
        max-content auto
        / 1fr 1fr;
      gap: 1.5rem;
    }

    .tagline {
      grid-area: 1 / 1 / auto / 3;
    font-size: 2.6rem;
    }

    .p {
      padding: 0 1rem 1rem 1rem;
    }

    .about {
      grid-area: 3 / 1 / auto / 3;
    }

    .invitation {
      text-align: center;
    }
  }
</style>

<svelte:head>
  <title>A Viral World</title>
  <meta name="description" content={description} />
  <meta name="twitter:card" value="summary" />
  <meta property="og:title" content="A Viral World" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={baseUrl} />
  <meta
    property="og:image"
    content="{baseUrl}static/favicon/ms-icon-310x310.png" />
  <meta property="og:description" content={description} />
</svelte:head>

<main>
  <p class="tagline p">Make history. Or just rant. Share your Covid-19 story.</p>

  <section class="intro p">
    <h2>Explore connections through stories.</h2>
    <p>
      Stories to help us reflect on what is happening to us during the Covid-19
      pandemic whilst simultaneously creating connections between us.
    </p>
    <p>
      If you would like to start a thread of your own, please
      <a href="mailto:info@aviral.world">get in touch with us</a>.
    </p>
  </section>

  <section class="invitation p">
    <h2>Randomly-curated stories</h2>

    <RecordingList {recordings} />
  </section>

  <p class="about p"><a href="/about/">Learn more about the project</a></p>
</main>
