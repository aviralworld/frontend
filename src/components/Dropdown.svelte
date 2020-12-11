<script lang="ts">
  export let id;
  export let name;
  export let options;
  export let optional;
</script>

<select id={id} name={name} required={!optional}>
  {#if optional}
    <option>Prefer not to say</option>
  {/if}
  {#each options as [value, label] (value)}
    <option value={value}>{label}</option>
  {/each}
</select>
