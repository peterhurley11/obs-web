<!-- Hold The Phone lower third — position/scale/font driven by a per-template style preset -->
<script>
  const { fields = { name: '', title: '' }, style = {} } = $props()

  const position = $derived(style.position ?? { xPct: 6, yPct: 78 })
  const scale = $derived(style.scale ?? 1)
  const line1 = $derived(style.line1 ?? { fontFamily: 'Tungsten Bold', fontSizePx: 64 })
  const line2 = $derived(style.line2 ?? { fontFamily: 'Tungsten Semibold', fontSizePx: 32 })
</script>

<div
  class="htp-lower-third"
  style:left="{position.xPct}%"
  style:top="{position.yPct}%"
  style:transform="scale({scale})"
>
  <div
    class="htp-name"
    style:font-family="{line1.fontFamily}, Impact, 'Arial Narrow', sans-serif"
    style:font-size="{line1.fontSizePx}px"
  >{fields.name}</div>
  <div
    class="htp-title"
    style:font-family="{line2.fontFamily}, Impact, 'Arial Narrow', sans-serif"
    style:font-size="{line2.fontSizePx}px"
  >{fields.title}</div>
</div>

<style>
  @font-face {
    font-family: 'Tungsten Bold';
    src: url('/fonts/Tungsten-Bold.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Tungsten Semibold';
    src: url('/fonts/Tungsten-Semibold.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  .htp-lower-third {
    position: absolute;
    transform-origin: left top;
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 46vw;
    pointer-events: none;
  }

  .htp-name,
  .htp-title {
    font-weight: 400;
    background: transparent;
    border: none;
    letter-spacing: 0.04em;
    text-align: left;
    white-space: normal;
    overflow-wrap: break-word;
    line-height: 1.15;
    text-transform: uppercase;
  }

  .htp-name {
    color: #ffffff;
  }

  .htp-title {
    color: #aab4c8;
  }
</style>
