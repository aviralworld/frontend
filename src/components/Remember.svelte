<script lang="ts">
  import Link from "./Link.svelte";

  export let username;
  export let link;
  export let location;
  export let forget;
  export let recording;

  const base = new URL(window.location.href);

  let links;
  $: links = recording.tokens.map((t) => new URL(`/recording/${recording.id}/?token=${t}`, base).toString());
</script>

<style>
  ul, p {
    margin-top: 1rem;
  }

  li {
    text-align: center;
    list-style: none;
  }
</style>

<section>
  <h2>Remember</h2>
  <p>Congratulations! Your recording has been published:</p>
<a href={link} on:click={forget}>Listen to the story of {username}{#if location !== undefined}{" "}{location}{/if}</a>
  <!-- TODO e-mail form or sample e-mail -->
  <!--<p>We’d like to save your e-mail address to share a very special gift with you later, and to send you a special link through which you can choose at any time to delete the story. This is completely optional.</p>
  <form>(TODO: e-mail form)</form> -->
  <p>You can invite people to listen and reply to your story using the following links (one each):</p>
  <ul>
    {#each links as link}
      <li><Link href={link} /></li>
    {/each}
  </ul>
  <p>Thank you for participating!</p>
</section>
