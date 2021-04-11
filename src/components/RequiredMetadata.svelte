<script lang="ts">
  import Choices from "./Choices.svelte";
  import { normalizeName } from "../routes/_publish";

  export let categories;
  export let categoryIsReadonly;

  export let initialName;
  export let name = initialName;
  export let categoryId;

  export let nameInput;

  let currentCategory;
  $: currentCategory = categories.find(([id]) => id === categoryId);

  function updateName() {
    if (name !== undefined) {
      name = normalizeName(name);
    }
  }
</script>

<style>
  .required-metadata-item {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
  }

  input {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }

  :global(fieldset) {
    margin-top: 1rem;
  }
</style>

<label class="required-metadata-item name" for="user-name">What is your name?
  <input
    type="text"
    name="name"
    id="user-name"
    bind:value={name}
    pattern=".*\S.*"
    on:change={updateName}
    required
    bind:this={nameInput} /></label>

<!-- TODO use radio buttons with descriptions -->
<p class="required-metadata-item">
  What is your story about?
  <Choices
    options={categories}
    id="user-category"
    name="category"
    optional={false}
    bind:selection={categoryId}
    readonly={categoryIsReadonly} />
</p>
