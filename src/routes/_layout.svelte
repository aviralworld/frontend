<script lang="ts">
  import Nav from "../components/Nav.svelte";

  export let segment: string;
</script>

<style>
  /* main { */
  /*   max-width: 56em; */
  /*   background-color: white; */
  /*   padding: 2em; */
  /*   margin: 0 auto; */
  /*   box-sizing: border-box; */
  /* } */
</style>

<svelte:head>
  <link
    rel="preload"
    href="/static/fonts/FuturaStd-Book.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous" />
</svelte:head>

<Nav {segment} />

<slot />
