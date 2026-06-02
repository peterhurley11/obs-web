<!-- Who's Next lower third — Zuume Edge Cut, white text, transparent bg -->
<script>
  let { fields = { name: 'PLAYER NAME', title: 'TEAM · POSITION', color: '#ffffff', posX: 44, posY: 43 } } = $props()
</script>

<div class="wn-lower-third" style:left="{fields.posX ?? 44}%" style:bottom="{fields.posY ?? 43}%">
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

  /*
    Text block: sits to the right of the player figure.
    All reference cutouts end at ~28% from left and ~67% from top.
    Text starts just right of the figure, vertically at chest level (~60%).
  */
  .wn-lower-third {
    position: absolute;
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
  }

  .wn-name {
    font-size: clamp(2.4rem, 4.4vw, 4rem);
  }

  .wn-title {
    font-size: clamp(1.5rem, 2.8vw, 2.6rem);
  }
</style>
