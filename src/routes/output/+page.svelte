<!-- src/routes/output/+page.svelte -->
<script>
  import { graphicsState } from '$lib/graphics.js'
  import OverlayLayer from '$lib/components/OverlayLayer.svelte'
</script>

<svelte:head>
  <title>Graphics Output</title>
</svelte:head>

<div class="output-canvas">
  {#each $graphicsState.overlays as overlay (overlay.id)}
    <OverlayLayer {overlay} />
  {/each}
</div>

<style>
  :global(html, body) {
    background: transparent !important;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  .output-canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
    background: transparent;
  }
</style>
