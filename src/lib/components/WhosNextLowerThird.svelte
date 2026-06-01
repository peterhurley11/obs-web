<!-- Who's Next lower third — Zuume Edge Cut, white text, transparent bg -->
<script>
  let { fields = { name: 'PLAYER NAME', title: 'TEAM · POSITION', color: '#ffffff', imageUrl: '' } } = $props()
</script>

{#if fields.imageUrl}
  <img src={fields.imageUrl} class="wn-player-image" alt={fields.name} />
{/if}

<div class="wn-lower-third">
  <div class="wn-name" style:color={fields.color}>{fields.name}</div>
  <div class="wn-title" style:color={fields.color}>{fields.title}</div>
</div>

<style>
  @font-face {
    font-family: 'ZuumeEdgeCut';
    src: url('/fonts/zuume-edge-cut-3.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  /* Player image: same canvas position as the source PNGs */
  .wn-player-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: left bottom;
    pointer-events: none;
  }

  /*
    Text block: sits to the right of the player figure.
    All reference cutouts end at ~28% from left and ~67% from top.
    Text starts just right of the figure, vertically at chest level (~60%).
  */
  .wn-lower-third {
    position: absolute;
    left: 29%;
    top: 61%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    pointer-events: none;
  }

  .wn-name,
  .wn-title {
    font-family: 'ZuumeEdgeCut', 'Arial Narrow', Impact, sans-serif;
    font-weight: 400;
    background: transparent;
    border: none;
    letter-spacing: 0.06em;
    text-align: left;
    white-space: nowrap;
    line-height: 1;
    color: #ffffff;
    /* Shadow keeps text legible over any background */
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.6),
      0 0 12px rgba(0,0,0,0.4);
  }

  .wn-name {
    font-size: clamp(2.4rem, 4.4vw, 4rem);
  }

  .wn-title {
    font-size: clamp(1.5rem, 2.8vw, 2.6rem);
  }
</style>
