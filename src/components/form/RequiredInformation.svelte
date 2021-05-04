<script lang="ts">
  import { readable } from "svelte/store";

  import Choices from "./Choices.svelte";
  import Spinner from "../Spinner.svelte";
  import { normalizeName } from "../../normalize";
  import type { Option } from "../../types";
  import { simple } from "../../store/local";
  import { isNameAvailableDebounced } from "../../store/checkNameAvailability";

  // supplied by parent
  export let categories: readonly Option[];
  export let parentId: string;

  // provided by component
  const name = simple(parentId, "name", null);
  const categoryId = simple(parentId, "categoryId", null);

  const isAvailable = isNameAvailableDebounced(name, 200);

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

  .error {
    display: block;
    color: var(--error-foreground);
    padding: 0.5rem 0;
  }

  .error::after {
    content: " ";
    display: inline-block;
  }
</style>

<label class="required name" for="user-name">What is your name? (You may enter a nickname if you prefer.)
  <input
    type="text"
    name="name"
    autocomplete="name"
    id="user-name"
    bind:value={$name}
    pattern=".*\S.*"
    on:change={updateName}
    required />
  <span class="error" aria-live="polite">{#if !$isAvailable.available}Sorry, there is already a recording under that name. Please enter a different name.{/if} {#if $isAvailable.checking}<Spinner />{/if}</span>
</label>

<Choices
  className="required"
  label="What is your story about?"
  options={categories}
  name="category"
  optional={false}
  bind:selection={$categoryId} />
