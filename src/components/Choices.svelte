<script lang="ts">
  export let name;
  export let options;
  export let optional;

  export let selection = undefined;
</script>

<style>
  fieldset { border: 0; }

  label {
    display: block;
  }

  label + label {
    margin-top: 1rem;
  }
</style>

<fieldset>
  {#if optional}
    <label><input type="radio" name={name} bind:group={selection} value={undefined}> Prefer not to say</label>
    {/if}
  {#each options as [value, label] (value)}
    <label><input type="radio" name={name} bind:group={selection} value={value} /> {label}</label>
    {/each}
</fieldset>
