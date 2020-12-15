<script context="module" lang="ts">
  const STORIES_TO_SHOW = 3;

  export async function preload() {
    const res = await this.fetch(`/api/recordings/random/${STORIES_TO_SHOW}/`);

    if (res.status !== 200) {
      return { recordings: [] };
    }

    const json = await res.json();
    return { recordings: json.recordings };
  }
</script>

<style>
  main {
    display: grid;
    grid-template:
      max-content auto
      / 1fr 1fr;
    gap: 1em;
    font-size: 1.2rem;
  }

  .p {
    padding: 1rem;
  }

  .intro {
    grid-area: 1 / 1 / auto / auto;
    padding: 2rem;
  }

  .invitation {
    grid-area: 1 / 2 / auto / auto;
    text-align: center;
    padding: 2rem;
  }

  .about {
    grid-area: 2 / 1 / 2 / 3;
    padding: 2rem 10rem;
  }

  @supports (hyphens: auto) {
    .about {
      text-align: justify;
      hyphens: auto;
    }
  }

  h2 {
    font-size: 1.4rem;
  }

  h2 + p {
    margin-top: 1rem;
  }

  ul, li {
    list-style: none;
  }
</style>

<script lang="ts">
  export let recordings;
</script>

<svelte:head>
  <title>A Viral World</title>
</svelte:head>

<main>
  <section class="intro p">
    <h2>Explore connections through stories.</h2>
    <p>
      Stories to help us reflect on what is happening to us during the Covid-19
      pandemic whilst simultaneously creating connections between us.
    </p>
    <p>
      If you would like to start a thread of your own, please get in touch with
      us.
    </p>
  </section>

  <section class="invitation p">
    <h2>Randomly-curated stories</h2>

    <ul>
      {#each recordings as recording}
        <li><a href={`/recording/${recording.id}/`}>{recording.name} {#if recording.location !== null}from {recording.location}{/if}</a></li>
      {/each}
    </ul>
  </section>

  <section class="about p">
    <h2>About the project</h2>
    <p>
      As humans, we have the innate desire to be connected with each other. Our
      lives and stories are deeply entangled, interdependent and strongly
      intertwined. As never before, in this historical moment we are
      understanding the deeper meaning of this. Human closeness and relations in
      centuries has been forged and build on shared experiences and knowledges.
      Storytelling and story-sharing appeared in various forms since the
      presence of humanity on this earth; from the drawings of our early
      ancestors on caves, to gestures, to oral and written transmission of
      stories.
    </p>
    <p>
      The current pandemic is depriving us of the freedom and spontaneity in
      which stories are shared and repetitive narratives are now originated
      mainly in the mass media or shared in the social media, which follows
      predetermined rules, editing and scripts. This project, however, wants to
      provide an intangible space, where oral transmission of different stories
      and narratives are entitled to overlap and connect to generate a network.
    </p>
    <p>
      In this moment, all of us are deprived of opportunities to explore new
      places and meet people, as many of us are currently experiencing some
      forms of lockdown and social distancing. This lack of exposure to new
      ideas and stories was one of the driving forces behind this project: what
      if, through interconnected stories, we could experience that sense of
      exploration whilst staying indoors? Just because we are physically
      confined to one location does not mean we have to let go of our desire to
      explore and discover new things.
    </p>
    <p>
      Disregarding national borders, stories can connect people rapidly,
      unexpectedly, and maybe even unwantedly—just like a virus contaminates us
      and creates networks between people. Given that the current pandemic has
      created a lot of anxiety, grief, disbelief, and fear, with this project,
      we want to remind people that not everything that is connected to viruses
      is bad. Granted, the impact of the COVID-19 virus is beyond anything the
      world has seen in a long time, but, for a moment, leave those things aside
      and think about the pace with which the virus has brought humanity
      together. This interconnectedness of people is something we want to
      highlight and celebrate with this project.
    </p>
    <p>
      To take part in this project you are asked to share an audio recording of
      a meaningful story of yours related to the COVID-19 virus. Each story is
      connected to a thread and has an initiator—someone who started the
      thread—but please feel free to explore connections between different
      threads, connecting different people and different experiences.
    </p>
    <p>
      This initiative was created by a team of professionals currently residing
      in Germany, India, and the UAE. Our background is in design, philosophy,
      software development, and management, and we were drawn to this topic by
      curiosity. At first, we were thinking about how the global lockdown might
      create tensions in households, thus creating a need for people to vent
      their frustrations somehow. After a couple of discussions, however, we
      quickly realized asking people to share with us audio recordings of them
      talking about their frustrations would result in voyeurism, which is why
      we shifted our focus.
    </p>
  </section>
</main>
