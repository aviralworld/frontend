<script lang="ts">
  export let href;

  let input;
  let copied = false;

  async function copy() {
    copied = false;
    await navigator.clipboard.writeText(href);
    copied = true;
  }
</script>

<style>
  form {
    margin-top: 0.5rem;
    display: flex;
    flex-flow: row;
    width: 100%;
  }

  input, button {
    padding: 0.5rem;
  }

  input {
    font-family: monospace;
    flex: 1 1 99%;
  }

  button {
    flex: 1 0 1ch;
    margin-left: -1px; /* hide the doubled border */
    transition: color 0.5s;
    color: rgba(255, 255, 255, 1);
  }

  .copied {
    color: rgba(255, 255, 255, 0.75);
  }
</style>

<form>
  <input type="text" readonly value={href} on:click={() => input.setSelectionRange(0, input.value.length)} bind:this={input} />
  <button on:click|preventDefault={copy} class:copied class="button">{#if copied}Copied!{:else}Copy{/if}</button>
</form>
