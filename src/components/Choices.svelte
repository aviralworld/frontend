<script lang="ts">
  export let name;
  export let options;
  export let optional;
  export let readonly;

  export let selection = undefined;
</script>

<style>
  fieldset {
    border: 0;
    margin-left: 1rem;
  }

  label {
    display: block;
  }

  label + label {
    margin-top: 1rem;
  }

  input {
    margin-right: 1ch;
  }

  .label {
    font-weight: bold;
  }
</style>

<fieldset>
  {#if optional}
    <label><input
        type="radio"
        {name}
        bind:group={selection}
        value={undefined}
        disabled={readonly} />
      Prefer not to say</label>
  {/if}
  {#each options as [value, label, description], index (value)}
    <label><input
        type="radio"
        {name}
        bind:group={selection}
        {value}
        required
        disabled={readonly} />
      {#if description !== null}
        <span class="label">{label}</span>
        <span class="description">{description}</span>
      {:else}{label}{/if}</label>
  {/each}
</fieldset>
