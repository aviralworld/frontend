<script lang="ts">
  import type { Option } from "../../types";
  import { simple } from "../../store/local";
  import Choices from "./Choices.svelte";

  export let ages: readonly Option[];
  export let genders: readonly Option[];
  export let parentId: string;

  const ageId = simple(parentId, "ageId", null);
  const email = simple(parentId, "email", null);
  const genderId = simple(parentId, "genderId", null);
  const location = simple(parentId, "location", null);
  const occupation = simple(parentId, "occupation", null);
</script>

<style type="text/css">
  .addendum {
    margin-top: 0.25rem;
    font-style: italic;
  }

  label {
    display: flex;
    flex-flow: column;
  }
</style>

<label for="user-occupation" class="label">What is your occupation?
  <input
    type="text"
    name="occupation"
    id="user-occupation"
    bind:value={$occupation} /></label>

<Choices
  label="What is your age?"
  options={ages}
  name="age"
  optional={true}
  bind:selection={$ageId} />

<Choices
  label="What gender do you identify as?"
  options={genders}
  name="gender"
  optional={true}
  bind:selection={$genderId} />

<label class="label" for="user-location">Where do you live?
  <input
    type="text"
    name="location"
    id="user-location"
    bind:value={$location} /></label>

<label class="label" for="user-email">What is your email address?
  <input type="email" name="email" id="user-email" bind:value={$email} />
  <span class="addendum">(If you share this, we will
    <strong>only</strong>
    use it to email you the link to manage your recording, as a reminder, and
    major updates about the project. You can also choose not to share it, in
    which case you’ll still be able to copy the link and save it once you’ve
    published your recording.)</span></label>
