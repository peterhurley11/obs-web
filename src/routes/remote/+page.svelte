<!-- src/routes/remote/+page.svelte -->
<script>
  import { graphicsState, patchOverlay, wsConnected } from '$lib/graphics.js'
  import { getTemplate } from '$lib/templates.js'

  function handleToggle (overlay) {
    patchOverlay(overlay.id, { visible: !overlay.visible })
  }
</script>

<svelte:head>
  <title>Graphics Remote</title>
</svelte:head>

<div class="remote-panel">
  <header class="remote-panel__header">
    <h1 class="title is-5">Graphics Remote</h1>
  </header>

  {#if !$wsConnected}
    <div class="notification is-warning is-light" style="margin-bottom: 1rem;">
      Disconnected — reconnecting…
    </div>
  {/if}

  <div class="remote-panel__overlays">
    {#each $graphicsState.overlays as overlay (overlay.id)}
      {@const tpl = getTemplate(overlay.templateId)}
      <div class="remote-card" class:is-live={overlay.visible}>
        {#if overlay.fields?.imageUrl}
          <img src={overlay.fields.imageUrl} class="remote-card__image" alt="player" />
        {/if}
        <div class="remote-card__info">
          <span class="remote-card__label">{tpl?.label || overlay.templateId}</span>
          <span class="remote-card__preview">
            {Object.entries(overlay.fields ?? {}).filter(([k]) => k !== 'imageUrl' && k !== 'color').map(([, v]) => v).slice(0, 2).join(' / ') || '—'}
          </span>
        </div>
        <button
          class="button is-medium remote-card__toggle"
          class:is-success={!overlay.visible}
          class:is-danger={overlay.visible}
          on:click={() => handleToggle(overlay)}
        >
          {overlay.visible ? 'TAKE OUT' : 'TAKE IN'}
        </button>
      </div>
    {/each}

    {#if $graphicsState.overlays.length === 0}
      <div class="notification is-light">
        No overlays configured. Use the main controller to add overlays.
      </div>
    {/if}
  </div>
</div>

<style>
  .remote-panel {
    padding: 1rem;
    max-width: 480px;
    margin: 0 auto;
  }
  .remote-panel__header {
    padding: 1rem 0 0.5rem;
    border-bottom: 1px solid #dbdbdb;
    margin-bottom: 1rem;
  }
  .remote-panel__overlays {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .remote-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    border-radius: 6px;
    background: #f9f9f9;
    border: 2px solid #dbdbdb;
    gap: 0.75rem;
  }
  .remote-card__image {
    height: 80px;
    width: 64px;
    object-fit: cover;
    object-position: left bottom;
    border-radius: 4px;
    background: #ebebeb;
    flex-shrink: 0;
  }
  .remote-card.is-live {
    border-color: #48c774;
    background: #f0fff4;
  }
  .remote-card__info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
    flex: 1;
  }
  .remote-card__label {
    font-weight: 700;
    font-size: 1rem;
  }
  .remote-card__preview {
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .remote-card__toggle {
    flex-shrink: 0;
    font-weight: 700;
    letter-spacing: 0.05em;
    min-width: 8rem;
  }
</style>
