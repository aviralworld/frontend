<script lang="ts">
  import Choices from "./Choices.svelte";

  export let ages;
  export let genders;

  export let occupation = undefined;
  export let age_id = undefined;
  export let gender_id = undefined;
  export let location = undefined;

  export let details;

  $: details = { occupation, age_id, gender_id, location };
</script>

<style type="text/css">
  label {
    display: flex;
    flex-flow: column;
    margin-top: 1rem;
  }

  label > :global(*) {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }

  .note {
    font-weight: bold;
  }

  p {
    margin-top: 1rem;
    font-size: 1.1em;
  }

  :global(input:invalid), :global(select:invalid) {
    border-color: red;
  }
</style>

<section>
  <p class="note">The following fields are optional. They will only be used for research purposes and will never be shared publicly.</p>

  <label for="user-occupation">What is your occupation? <input type="text" name="occupation" id="user-occupation" bind:value={occupation} /></label>

  <p>What is your age? <Choices options={ages} id="user-age" name="age" optional={true} bind:selection={age_id} /></p>

  <p>What gender do you identify as? <Choices options={genders} id="user-gender" name="gender" optional={true} bind:selection={gender_id} /></p>

  <label for="user-location">Where do you live? <input type="text" name="location" id="user-location" bind:value={location} /></label>
</section>