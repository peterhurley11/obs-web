<script>
  import { graphicsState, addOverlay, removeOverlay, patchOverlay, makeOverlayId } from '$lib/graphics.js'
  import { TEMPLATES, ANIMATIONS, getTemplate } from '$lib/templates.js'
  import TextZoneEditor from './TextZoneEditor.svelte'

  let selectedTemplateId = $state(TEMPLATES[0].id)

  function handleAddOverlay () {
    const tpl = getTemplate(selectedTemplateId)
    if (!tpl) return
    addOverlay({
      id: makeOverlayId(),
      templateId: tpl.id,
      fields: { ...tpl.defaultFields },
      visible: false,
      animation: { ...tpl.defaultAnimation },
      layer: $graphicsState.overlays.length
    })
  }

  function handleToggleVisible (overlay) {
    patchOverlay(overlay.id, { visible: !overlay.visible })
  }

  function handleRemove (id) {
    removeOverlay(id)
  }

  function handleFieldChange (overlay, fieldKey, value) {
    patchOverlay(overlay.id, { fields: { ...overlay.fields, [fieldKey]: value } })
  }

  function handleAnimChange (overlay, direction, value) {
    patchOverlay(overlay.id, {
      animation: { ...overlay.animation, [direction === 'in' ? 'in' : 'out']: value }
    })
  }

  async function handleImageChange (overlay, e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const res = await fetch('/upload', {
        method: 'POST',
        headers: { 'X-Filename': file.name },
        body: file
      })
      const { url } = await res.json()
      patchOverlay(overlay.id, { fields: { ...overlay.fields, imageUrl: url } })
    } catch (err) {
      console.error('image upload failed', err)
    }
  }
</script>

<section class="box graphics-panel">
  <h2 class="subtitle is-5">Graphics</h2>

  <div class="field is-grouped">
    <div class="control">
      <div class="select is-small">
        <select bind:value={selectedTemplateId}>
          {#each TEMPLATES as tpl}
            <option value={tpl.id}>{tpl.label}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="control">
      <button class="button is-small is-primary" on:click={handleAddOverlay}>
        + Add Overlay
      </button>
    </div>
  </div>

  {#each $graphicsState.overlays as overlay (overlay.id)}
    {@const tpl = getTemplate(overlay.templateId)}
    <div class="box overlay-card" class:is-active={overlay.visible}>
      <div class="overlay-card__header">
        <span class="tag is-info is-light">{tpl?.label || overlay.templateId}</span>
        <button
          class="button is-small"
          class:is-success={!overlay.visible}
          class:is-danger={overlay.visible}
          on:click={() => handleToggleVisible(overlay)}
        >
          {overlay.visible ? 'Take Out' : 'Take In'}
        </button>
        <button class="button is-small is-light" on:click={() => handleRemove(overlay.id)}>
          Remove
        </button>
      </div>

      <div class="overlay-card__fields">
        {#each Object.entries(overlay.fields) as [key, val]}
          {@const fieldLabel = tpl?.fieldLabels?.[key] ?? key}
          {#if key === 'posX' || key === 'posY'}
            <div class="field slider-field">
              <label class="label is-small">{fieldLabel}: {val}%</label>
              <input
                type="range" min="0" max="100" step="1"
                value={val}
                class="slider"
                on:input={(e) => handleFieldChange(overlay, key, +e.target.value)}
              />
            </div>
          {:else if key === 'imageUrl'}
            <div class="field image-field">
              <label class="label is-small">{fieldLabel}</label>
              {#if val}
                <img src={val} class="image-thumb" alt="player" />
              {/if}
              <input
                type="file"
                accept="image/*"
                class="file-input-native"
                on:change={(e) => handleImageChange(overlay, e)}
              />
            </div>
          {:else}
            <TextZoneEditor
              label={fieldLabel}
              value={val}
              onchange={(v) => handleFieldChange(overlay, key, v)}
            />
          {/if}
        {/each}
      </div>

      <div class="overlay-card__anim">
        <div class="field is-horizontal">
          <div class="field-label is-small"><label class="label">In</label></div>
          <div class="field-body">
            <div class="select is-small">
              <select value={overlay.animation.in} on:change={(e) => handleAnimChange(overlay, 'in', e.target.value)}>
                {#each ANIMATIONS as a}<option value={a}>{a}</option>{/each}
              </select>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-small"><label class="label">Out</label></div>
          <div class="field-body">
            <div class="select is-small">
              <select value={overlay.animation.out} on:change={(e) => handleAnimChange(overlay, 'out', e.target.value)}>
                {#each ANIMATIONS as a}<option value={a}>{a}</option>{/each}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}

  {#if $graphicsState.overlays.length === 0}
    <p class="help">No overlays yet. Add one above.</p>
  {/if}
</section>

<style>
  .graphics-panel {
    margin-top: 2rem;
  }
  .overlay-card {
    margin-bottom: 1rem;
    border-left: 4px solid #dbdbdb;
  }
  .overlay-card.is-active {
    border-left-color: #48c774;
  }
  .overlay-card__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }
  .overlay-card__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1rem;
    align-items: flex-end;
  }
  .image-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .image-thumb {
    height: 64px;
    width: auto;
    border-radius: 4px;
    object-fit: contain;
    background: #f0f0f0;
  }
  .file-input-native {
    font-size: 0.75rem;
    max-width: 160px;
  }
  .slider-field {
    min-width: 160px;
    flex: 1;
  }
  .slider {
    width: 100%;
    cursor: pointer;
  }
  .overlay-card__anim {
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
</style>
