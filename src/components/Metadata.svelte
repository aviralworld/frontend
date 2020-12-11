<script lang="ts">
  import Dropdown from "./Dropdown.svelte";

  export let ages;
  export let categories;
  export let genders;
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

  p {
    margin-top: 1rem;
    font-size: 1.1em;
    font-weight: bold;
  }
</style>

<label for="user-category">What is your story about? <Dropdown options={categories} id="user-category" name="category" optional={false} /></label>

<section>
  <p>The following fields are optional. They will only be used for research purposes and will never be shared publicly.</p>

  <label for="user-gender">What gender do you identify as? <Dropdown options={genders} id="user-gender" name="gender" optional={true} /></label>

  <label for="user-age">What is your age? <Dropdown options={ages} id="user-age" name="age" optional={true} /></label>

  <label for="user-location">Where do you live? <input type="text" name="location" id="user-location"></label>
</section>