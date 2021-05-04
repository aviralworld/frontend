<script lang="ts">
  import type { Option } from "../types";

  export let className: string;
  export let name: string;
  export let options: readonly Option[];
  export let optional: boolean;
  export let label: string;

  export let selection: string = null;

  let fullClassName = `${className || ""} choices`;
</script>

<style>
  fieldset {
    border: 0;
  }

  label {
    display: flex;
    margin-top: 1rem;
    flex-direction: row;
    flex-flow: nowrap;
    align-items: center;
  }

  label + label {
    margin-top: 1rem;
  }

  input {
    margin-right: 1ch;
  }

  .label {
    font-weight: bold;
    margin-right: 0.5ch;
  }
</style>

<fieldset class={fullClassName}>
  <legend>{label}</legend>
  {#if optional}
    <label><input type="radio" {name} bind:group={selection} value={null} />
      Prefer not to say</label>
  {/if}
  {#each options as [value, label, description], index (value)}
    <label><input type="radio" {name} bind:group={selection} {value} required />
      {#if description !== null}
        <span class="label">{label}</span>
        <span class="description">{description}</span>
      {:else}{label}{/if}</label>
  {/each}
</fieldset>
