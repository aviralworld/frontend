<style>
  nav {
    border-bottom: 1px solid rgba(255, 62, 0, 0.1);
    font-weight: 300;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    width: 100%;
  }

  img {
    width: 100%;
  }

  h1 {
    height: 3.25rem;
    padding: var(--button-padding);
  }

  a {
    border: 0;
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
</style>

<nav>
  <h1>
    <a href="/" class="logo"><img
        src="/static/logo.svg"
        alt="A Viral World" /></a>
  </h1>

  <a href="/listen" class="listen button">Listen to other stories</a>
</nav>
