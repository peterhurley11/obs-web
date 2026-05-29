<script>
  import { onMount } from 'svelte'
  import { animate } from '$lib/animations.js'
  import LowerThird from './LowerThird.svelte'
  import ScoreBoard from './ScoreBoard.svelte'
  import FullscreenTitle from './FullscreenTitle.svelte'

  let { overlay } = $props()

  const COMPONENT_MAP = {
    LowerThird,
    ScoreBoard,
    FullscreenTitle
  }

  const TEMPLATE_TO_COMPONENT = {
    'lower-third': 'LowerThird',
    'scoreboard': 'ScoreBoard',
    'fullscreen-title': 'FullscreenTitle'
  }

  const component = $derived(COMPONENT_MAP[TEMPLATE_TO_COMPONENT[overlay.templateId]] ?? null)

  let el = $state(null)
  let mounted = $state(false)
  let internalVisible = $state(false)

  onMount(() => {
    mounted = true
    internalVisible = overlay.visible
  })

  $effect(() => {
    const nextVisible = overlay.visible
    if (!mounted || !el) return
    handleVisibilityChange(nextVisible)
  })

  async function handleVisibilityChange (nextVisible) {
    if (nextVisible === internalVisible) return
    const anim = overlay.animation
    if (nextVisible) {
      internalVisible = true
      await animate(el, 'in', anim.in, anim.durationMs)
    } else {
      await animate(el, 'out', anim.out, anim.durationMs)
      internalVisible = false
    }
  }
</script>

{#if internalVisible || overlay.visible}
  <div
    bind:this={el}
    class="overlay-layer"
    style:z-index={10 + overlay.layer}
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
  }
</style>
