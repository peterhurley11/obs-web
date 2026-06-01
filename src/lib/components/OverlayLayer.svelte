<script>
  import { onMount } from 'svelte'
  import { animate } from '$lib/animations.js'
  import LowerThird from './LowerThird.svelte'
  import ScoreBoard from './ScoreBoard.svelte'
  import FullscreenTitle from './FullscreenTitle.svelte'
  import WhosNextLowerThird from './WhosNextLowerThird.svelte'

  const { overlay } = $props()

  const COMPONENT_MAP = {
    LowerThird,
    ScoreBoard,
    FullscreenTitle,
    WhosNextLowerThird
  }

  const TEMPLATE_TO_COMPONENT = {
    'lower-third': 'LowerThird',
    scoreboard: 'ScoreBoard',
    'fullscreen-title': 'FullscreenTitle',
    'whos-next-lower-third': 'WhosNextLowerThird'
  }

  const component = $derived(COMPONENT_MAP[TEMPLATE_TO_COMPONENT[overlay.templateId]] ?? null)

  let el = $state(null)
  let mounted = $state(false)
  let internalVisible = $state(false)
  let animating = false
  let pendingVisible = null

  onMount(() => {
    mounted = true
    internalVisible = overlay.visible
  })

  $effect(() => {
    const nextVisible = overlay.visible
    const animIn = overlay.animation?.in ?? 'fade'
    const animOut = overlay.animation?.out ?? 'fade'
    const durationMs = overlay.animation?.durationMs ?? 400

    if (!mounted || !el) return
    handleVisibilityChange(nextVisible, animIn, animOut, durationMs)
  })

  async function handleVisibilityChange (nextVisible, animIn, animOut, durationMs) {
    if (animating) {
      // Queue the latest requested state; previous pending is overridden
      pendingVisible = nextVisible
      return
    }
    if (nextVisible === internalVisible) return

    animating = true
    try {
      if (nextVisible) {
        internalVisible = true
        await animate(el, 'in', animIn, durationMs)
      } else {
        await animate(el, 'out', animOut, durationMs)
        internalVisible = false
      }
    } finally {
      animating = false
      // Process any state change that arrived while we were animating
      if (pendingVisible !== null && pendingVisible !== internalVisible) {
        const p = pendingVisible
        pendingVisible = null
        handleVisibilityChange(p, animIn, animOut, durationMs)
      } else {
        pendingVisible = null
      }
    }
  }
</script>

{#if internalVisible || overlay.visible}
  <div
    bind:this={el}
    class="overlay-layer"
    style:z-index={10 + (overlay.layer ?? 0)}
    style:opacity={internalVisible ? 1 : 0}
  >
    {#if component}
      <svelte:component
        this={component}
        fields={overlay.fields}
      />
    {/if}
  </div>
{/if}

<style>
  .overlay-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
</style>
