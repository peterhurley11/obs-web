<script>
  let { fields = { name: '', title: '' } } = $props()
</script>

<div class="lower-third">
  <div class="lower-third__bar">
    <span class="lower-third__name">{fields.name}</span>
    <span class="lower-third__title">{fields.title}</span>
  </div>
</div>

<style>
  .lower-third {
    position: absolute;
    bottom: 10%;
    left: 0;
    right: 0;
    padding: 0 4%;
    pointer-events: none;
  }
  .lower-third__bar {
    display: inline-flex;
    flex-direction: column;
    background: rgba(15, 20, 40, 0.92);
    border-left: 6px solid #e63946;
    padding: 0.6em 1.2em;
    gap: 0.15em;
  }
  .lower-third__name {
    font-family: 'Arial Black', Arial, sans-serif;
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.1;
  }
  .lower-third__title {
    font-family: Arial, sans-serif;
    font-size: clamp(0.85rem, 1.8vw, 1.3rem);
    font-weight: 400;
    color: #aab4c8;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
</style>
