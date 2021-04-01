<script context="module" lang="ts">
  export async function preload({ params }, session) {
    const { baseUrl } = session.frontendSettings;
    const { token } = params;

    const res = await this.fetch(`/api/recordings/lookup/${token}`);

    if (res.status === 200 || res.status === 410) {
      const recording = await res.json();
      return this.redirect(302, new URL(`/recording/${recording.id}/?key=${token}`, baseUrl).toString());
    }

    this.error(404, `No such key: ${token}`);
  }
</script>
