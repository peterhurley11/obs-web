<script>
  import { graphicsState, patchTemplateStyle } from '$lib/graphics.js'
  import { TEMPLATES } from '$lib/templates.js'

  const stylableTemplates = $derived(TEMPLATES.filter(t => t.hasStylePreset))

  function styleFor (tpl) {
    return $graphicsState.templateStyles?.[tpl.id] ?? tpl.defaultStyle
  }

  function handlePositionChange (tpl, axis, value) {
    const s = styleFor(tpl)
    const num = Number(value)
    if (Number.isNaN(num)) return
    patchTemplateStyle(tpl.id, { position: { ...s.position, [axis]: num } })
  }

  function handleScaleChange (tpl, value) {
    const num = Number(value)
    if (Number.isNaN(num)) return
    patchTemplateStyle(tpl.id, { scale: num })
  }

  function handleLineChange (tpl, lineKey, prop, value) {
    const s = styleFor(tpl)
    const nextValue = prop === 'fontSizePx' ? Number(value) : value
    if (prop === 'fontSizePx' && Number.isNaN(nextValue)) return
    patchTemplateStyle(tpl.id, { [lineKey]: { ...s[lineKey], [prop]: nextValue } })
  }
</script>

{#each stylableTemplates as tpl (tpl.id)}
  {@const s = styleFor(tpl)}
  <section class="box style-preset-panel">
    <h2 class="subtitle is-5">{tpl.label} Style</h2>

    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <label class="label is-small">X %</label>
        <input
          class="input is-small"
          type="number"
          value={s.position.xPct}
          on:change={(e) => handlePositionChange(tpl, 'xPct', e.target.value)}
        />
      </div>
      <div class="control">
        <label class="label is-small">Y %</label>
        <input
          class="input is-small"
          type="number"
          value={s.position.yPct}
          on:change={(e) => handlePositionChange(tpl, 'yPct', e.target.value)}
        />
      </div>
      <div class="control">
        <label class="label is-small">Scale</label>
        <input
          class="input is-small"
          type="number"
          step="0.05"
          min="0.1"
          value={s.scale}
          on:change={(e) => handleScaleChange(tpl, e.target.value)}
        />
      </div>
    </div>

    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <label class="label is-small">Line 1 Font</label>
        <input
          class="input is-small"
          type="text"
          value={s.line1.fontFamily}
          on:change={(e) => handleLineChange(tpl, 'line1', 'fontFamily', e.target.value)}
        />
      </div>
      <div class="control">
        <label class="label is-small">Line 1 Size (px)</label>
        <input
          class="input is-small"
          type="number"
          value={s.line1.fontSizePx}
          on:change={(e) => handleLineChange(tpl, 'line1', 'fontSizePx', e.target.value)}
        />
      </div>
    </div>

    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <label class="label is-small">Line 2 Font</label>
        <input
          class="input is-small"
          type="text"
          value={s.line2.fontFamily}
          on:change={(e) => handleLineChange(tpl, 'line2', 'fontFamily', e.target.value)}
        />
      </div>
      <div class="control">
        <label class="label is-small">Line 2 Size (px)</label>
        <input
          class="input is-small"
          type="number"
          value={s.line2.fontSizePx}
          on:change={(e) => handleLineChange(tpl, 'line2', 'fontSizePx', e.target.value)}
        />
      </div>
    </div>
  </section>
{/each}

<style>
  .style-preset-panel {
    margin-top: 1rem;
  }
</style>
