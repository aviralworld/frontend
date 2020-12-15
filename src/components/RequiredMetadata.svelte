<script lang="ts">
  import Choices from "./Choices.svelte";
  import debounce from "lodash/debounce";

  export let categories;

  export let name;
  export let categoryId;
</script>

<label for="user-name">What is your name? <input type="text" name="name" id="user-name" bind:value={name} required /></label>

<!-- TODO use radio buttons with descriptions -->
<p>What is your story about? <Choices options={categories} id="user-category" name="category" optional={false} bind:selection={categoryId} /></p>
