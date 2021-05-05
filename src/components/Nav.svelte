<style>
  nav {
    border-bottom: 1px solid var(--nav-border);
    display: flex;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    flex-wrap: wrap;
  }

  img {
    width: 100%;
  }

  h1 {
    height: 3.25rem;
    padding: var(--button-padding);
  }

  a,
  a:hover,
  a:active,
  a:focus {
    border: 0;
    color: var(--button-foreground);
  }

  .logo {
    padding: 0;
  }

  h1,
  a {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo,
  .listen {
    width: 100%;
  }

  @media (min-width: 34em) {
    nav {
      flex-wrap: nowrap;
      justify-content: space-between;
    }

    .logo,
    .listen {
      width: auto;
    }
  }
</style>

<nav>
  <h1>
    <a href="/" class="logo"><img
        src="/static/logo.svg"
        alt="A Viral World" /></a>
  </h1>

  <a href="/listen" class="listen button">Listen to other stories</a>
</nav>
