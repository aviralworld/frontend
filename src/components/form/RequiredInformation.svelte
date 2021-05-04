<script lang="ts">
  import { readable } from "svelte/store";

  import Choices from "./Choices.svelte";
  import { checkName } from "../../actions/checkName";
  import { normalizeName } from "../../normalize";
  import type { Option } from "../../types";
  import { simple } from "../../store/local";

  // supplied by parent
  export let categories: readonly Option[];
  export let parentId: string;

  // provided by component
  const name = simple(parentId, "name", null);
  const categoryId = simple(parentId, "categoryId", null);

  function updateName() {
    if ($name !== null) {
      $name = normalizeName($name);
    }
  }
</script>

<style>
  :global(.required) {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  :global(.required:first-line) {
    text-indent: -1em;
  }

  input {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }
</style>

<label class="required name" for="user-name">What is your name? (This must be unique.)
  <input
    type="text"
    name="name"
    autocomplete="name"
    id="user-name"
    bind:value={$name}
    pattern=".*\S.*"
    on:change={updateName}
    required
    use:checkName={readable(null, () => () => null)} />
</label>

<Choices
  className="required"
  label="What is your story about?"
  options={categories}
  name="category"
  optional={false}
  bind:selection={$categoryId} />
