<script lang="ts">
  import Form from "./Form.svelte";

  export let ages: readonly Option[];
  export let categories: readonly Option[];
  export let genders: readonly Option[];

  export let parentName: string;

  export let formats: readonly string[];
  export let maxRecordingLength;
</script>

<Form
  {ages}
  {categories}
  {formats}
  {genders}
  {parentName}
  {maxRecordingLength}/>
