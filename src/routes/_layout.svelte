<script lang="ts">
  import Nav from "../components/Nav.svelte";

  export let segment: string;
</script>

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
