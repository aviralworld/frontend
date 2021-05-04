<script lang="ts">
  import Link from "./Link.svelte";

  export let username;
  export let link;
  export let location;
  export let recording;
  export let tokens;
  export let base;
  export let key;

  let links;
  $: links = tokens.map((t) =>
    new URL(`/recording/${recording.id}/?token=${t}`, base).toString(),
  );

  let managementLink;
  $: managementLink = new URL(`/lookup/${key}/`, base).toString();
</script>

<style>
  ul,
  p {
    margin-top: 1rem;
  }

  li {
    text-align: center;
    list-style: none;
  }
</style>

<section class="recording-section remember">
  <h2>Remember</h2>
  <p>Congratulations! Your recording has been published:</p>
  <a href={link} sapper:prefetch>Listen to the story of
{username}{#if location !== null}{' '}{location}{/if}</a>
  <p>
    You can invite people to listen and reply to your story using the following
    links (one each):
  </p>
  <ul>
    {#each links as link}
      <li>
        <Link href={link.toString()} />
      </li>
    {/each}
  </ul>
  <p>
    And you can use this private link to manage the recording (do not share it
    with anyone):
  </p>
  <a href={managementLink}><kbd>{managementLink}</kbd></a>
  <p>Thank you for participating!</p>
</section>
