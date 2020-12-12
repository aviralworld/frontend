<script lang="ts">
  export let username;
  export let link;
  export let location;
</script>

<section>
  <h2>Remember</h2>
  <p>Congratulations! Your recording has been published:</p>
  <a href={link}>Listen to the story of {username} {#if location !== undefined}from {location}{/if}</a>
  <p>We’d like to save your e-mail address to share a very special gift with you later, and to send you a special link through which you can choose at any time to delete the story. This is completely optional.</p>
  <form>(TODO: e-mail form)</form>
  <p>Thank you for participating!</p>
</section>
