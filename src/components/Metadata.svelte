<script lang="ts">
  import Choices from "./Choices.svelte";

  export let ages;
  export let genders;

  export let occupation = undefined;
  export let ageId = undefined;
  export let genderId = undefined;
  export let location = undefined;
  export let email = undefined;

  export let details;

  $: details = {
    occupation: trim(occupation),
    age_id: ageId,
    gender_id: genderId,
    location: trim(location),
    email: trim(email),
  };

  function trim(v: string | undefined): string | undefined {
    if (v === undefined) {
      return v;
    }

    const trimmed = v.trim();

    if (trimmed === "") {
      return undefined;
    }

    return trimmed;
  }
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

  .note,
  .addendum {
    font-style: italic;
  }

  .label {
    margin-top: 1rem;
    font-size: 1.1em;
  }

  :global(input:invalid),
  :global(select:invalid) {
    border-color: red;
  }

  .addendum {
    font-size: 0.9em;
    display: block;
    padding: 0;
  }
</style>

<section>
  <p class="note">
    The remaining fields are optional. They will only be used for research
    purposes and will never be shared publicly.
  </p>

  <label for="user-occupation" class="label">What is your occupation?
    <input
      type="text"
      name="occupation"
      id="user-occupation"
      bind:value={occupation} /></label>

  <p class="label">
    What is your age?
    <Choices
      options={ages}
      id="user-age"
      name="age"
      optional={true}
      bind:selection={ageId} />
  </p>

  <p class="label">
    What gender do you identify as?
    <Choices
      options={genders}
      id="user-gender"
      name="gender"
      optional={true}
      bind:selection={genderId} />
  </p>

  <label class="label" for="user-location">Where do you live?
    <input
      type="text"
      name="location"
      id="user-location"
      bind:value={location} /></label>

  <label class="label" for="user-email">What is your email address?
    <input type="text" name="email" id="user-email" bind:value={email} />
    <span class="addendum">(If you share this, we will
      <strong>only</strong>
      use it to email you the link to manage your recording, as a reminder, and
      major updates about the project. You can also choose not to share it, in
      which case you’ll still be able to copy the link and save it once you’ve
      published your recording.)</span></label>
</section>
