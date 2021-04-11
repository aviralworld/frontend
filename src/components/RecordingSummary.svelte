<script lang="ts">
  export let recording;
</script>

<style>
  .from {
    font-size: 0.8em;
    text-transform: uppercase;
    display: inline-block;
    margin: 0 0 0 0.25ch;
  }

  .from::after {
    content: " ";
    --width: 0.5ch;
    border-left: var(--width) solid currentColor;
    border-top: var(--width) solid transparent;
    border-bottom: var(--width) solid transparent;
    margin-left: 0.75ch;
    width: var(--width);
    display: inline-block;
  }
</style>

<a
  href={`/recording/${recording.id}/`} sapper:prefetch>{recording.name}{#if recording.location !== null}
    {' '}<span class="from">from</span>
    {recording.location}
  {/if}</a>
