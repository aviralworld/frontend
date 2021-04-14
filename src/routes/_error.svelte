<script lang="ts">
  import { stores } from "@sapper/app";

  const { session } = stores();
  const { dev } = $session.frontendSettings;

  export let status: number;
  export let error: Error;

  if (dev) {
    console.error("Error", error);
  }
</script>

<style>
  pre {
    whitespace: pre-wrap;
  }
</style>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<main>
  <h1>{status}</h1>

  <p>{error.message}</p>

  {#if dev && error.stack}
    <pre>{error.stack}</pre>
  {/if}
</main>
