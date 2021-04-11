<style type="text/css">
  /* adapted from https://loading.io/css/ */
  .ring {
    display: inline-block;
    position: relative;
    width: var(--spinner-size);
    height: var(--spinner-size);

    --spinner-size: 1em;
    --animation-duration: 1.5s;
  }

  .ring::before,
  .ring::after,
  .ring > i::before,
  .ring > i::after {
    content: " ";
    box-sizing: border-box;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: calc(var(--spinner-size) * 0.8);
    height: calc(var(--spinner-size) * 0.8);
    margin: calc(var(--spinner-size) / 10);
    border: calc(var(--spinner-size) / 10) solid var(--spinner-foreground);
    border-radius: 50%;
    animation: ring var(--animation-duration) cubic-bezier(0.5, 0, 0.5, 1)
      infinite;
    border-color: var(--spinner-foreground) transparent transparent transparent;
  }

  .ring::before {
    animation-delay: calc(var(--animation-duration) / 8 * -3);
  }

  .ring > i::before {
    content: " ";
    animation-delay: calc(var(--animation-duration) / 8 * -2);
  }

  .ring > i::after {
    content: " ";
    animation-delay: calc(var(--animation-duration) / 8 * -1);
  }

  @keyframes ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

<span class="ring"> <i /> </span>
