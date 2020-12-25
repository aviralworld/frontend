<script lang="ts">
  import Choices from "./Choices.svelte";
  import debounce from "lodash/debounce";

  export let categories;
  export let categoryIsReadonly;

  export let name;
  export let categoryId;

  let currentCategory;
  $: currentCategory = categories.find(([id]) => id === categoryId);
</script>

<style>
  .required-metadata-item {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
  }

  .required-metadata-item.name {
  }

  input {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }

  :global(fieldset) {
    margin-top: 1rem;
  }
</style>

<label class="required-metadata-item name" for="user-name">What is your name? <input type="text" name="name" id="user-name" bind:value={name} required /></label>

<!-- TODO use radio buttons with descriptions -->
<p class="required-metadata-item">What is your story about?
  <Choices options={categories} id="user-category" name="category" optional={false} bind:selection={categoryId} readonly={categoryIsReadonly} />
</p>
