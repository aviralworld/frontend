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

  a {
    text-decoration: none;
    border-bottom: 1px dashed;
    padding-bottom: 0.25rem;
    color: var(--link-foreground);
    line-height: 1.6;
  }

  a:hover,
  a:active,
  a:focus {
    color: var(--link-hover);
    border-bottom: 1px solid;
  }
</style>

<a
  href={`/recording/${recording.id}/`}>{recording.name}{#if recording.location !== null}
    {' '}<span class="from">from</span>
    {recording.location}
  {/if}</a>
