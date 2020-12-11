<script lang="ts">
  export let id;
  export let name;
  export let options;
  export let optional;

  export let value = undefined;
</script>

<select id={id} name={name} required={!optional} bind:value>
  {#if optional}
    <option value={undefined}>Prefer not to say</option>
  {:else}
    <option value={undefined} disabled selected hidden>Select one…</option>
  {/if}
  {#each options as [value, label] (value)}
    <option value={value}>{label}</option>
  {/each}
</select>
