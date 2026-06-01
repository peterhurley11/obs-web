<!-- src/routes/output/+page.svelte -->
<script>
  import { onMount } from 'svelte'
  import { graphicsState } from '$lib/graphics.js'
  import OverlayLayer from '$lib/components/OverlayLayer.svelte'

  // Force transparency via JS — Bulma's CSS bundle order beats :global !important in some builds
  onMount(() => {
    document.documentElement.style.setProperty('background', 'transparent', 'important')
    document.documentElement.style.setProperty('overflow', 'hidden', 'important')
    document.body.style.setProperty('background', 'transparent', 'important')
    document.body.style.setProperty('overflow', 'hidden', 'important')
  })
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
    overflow: hidden !important;
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
