<script>
  const { fields = { headline: '', subtext: '' } } = $props()
</script>

<div class="fullscreen-title">
  <div class="fullscreen-title__headline">{fields.headline}</div>
  {#if fields.subtext}
    <div class="fullscreen-title__subtext">{fields.subtext}</div>
  {/if}
</div>

<style>
  .fullscreen-title {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(10, 12, 24, 0.88);
    pointer-events: none;
    gap: 1rem;
  }
  .fullscreen-title__headline {
    font-family: 'Arial Black', Arial, sans-serif;
    font-size: clamp(3rem, 8vw, 7rem);
    font-weight: 900;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 4px 32px rgba(230,57,70,0.6);
  }
  .fullscreen-title__subtext {
    font-family: Arial, sans-serif;
    font-size: clamp(1rem, 2.5vw, 2rem);
    color: #aab4c8;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
</style>
