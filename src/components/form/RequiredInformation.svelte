<script lang="ts">
  import { readable } from "svelte/store";

  import Choices from "./Choices.svelte";
  import Spinner from "../Spinner.svelte";
  import { normalizeName } from "../../normalize";
  import type { Option } from "../../types";
  import { simple } from "../../store/local";
  import {
    Availability,
    isNameAvailableDebounced,
  } from "../../store/checkNameAvailability";

  // supplied by parent
  export let categories: readonly Option[];
  export let parentId: string;

  // provided by component
  const name = simple(parentId, "name", null);
  const categoryId = simple(parentId, "categoryId", null);

  const isAvailable = isNameAvailableDebounced(name, 200);

  let nameInput;

  $: if (nameInput !== undefined) {
    if ($isAvailable.available === Availability.UNAVAILABLE) {
      nameInput.setCustomValidity(
        "Sorry, there is already a recording under that name. Please enter a different name.",
      );
    } else {
      nameInput.setCustomValidity("");
    }
  }

  function updateName() {
    if ($name !== null) {
      $name = normalizeName($name);
    }
  }
</script>

<style>
</style>

<label class="required name" for="user-name">What is your name? (You may enter a
  nickname if you prefer.)
  <input
    type="text"
    name="name"
    autocomplete="name"
    id="user-name"
    bind:value={$name}
    pattern=".*\S.*"
    on:change={updateName}
    bind:this={nameInput}
    required />
  <span
    class="error"
    aria-live="polite">{#if nameInput && nameInput.validity.customError}
      {nameInput.validationMessage}
    {/if}
    {#if $isAvailable.checking}
      <Spinner label="Checking…" />
    {/if}</span>
</label>

<Choices
  className="required"
  label="What is your story about?"
  options={categories}
  name="category"
  optional={false}
  bind:selection={$categoryId} />
