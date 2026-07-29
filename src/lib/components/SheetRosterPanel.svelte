<script>
  import { sheetRoster, takeRosterRow } from '$lib/graphics.js'
  import { TEMPLATES } from '$lib/templates.js'

  const rosterTemplates = $derived(TEMPLATES.filter(t => t.hasSheetRoster))

  function formatFetchedAt (ts) {
    if (!ts) return 'never'
    return new Date(ts).toLocaleTimeString()
  }
</script>

{#each rosterTemplates as tpl (tpl.id)}
  <section class="box sheet-roster-panel">
    <h2 class="subtitle is-5">{tpl.label} Roster</h2>

    <p class="help">Last fetched: {formatFetchedAt($sheetRoster.lastFetchedAt)}</p>

    {#if $sheetRoster.error}
      <div class="notification is-warning is-light">{$sheetRoster.error}</div>
    {/if}

    {#if $sheetRoster.rows.length === 0}
      <p class="help">No rows yet.</p>
    {:else}
      <table class="table is-fullwidth is-narrow">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each $sheetRoster.rows as row, i (i)}
            <tr>
              <td>{row.name}</td>
              <td>{row.title}</td>
              <td>
                <button
                  class="button is-small is-primary"
                  on:click={() => takeRosterRow(row, tpl.id)}
                >
                  Take
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>
{/each}

<style>
  .sheet-roster-panel {
    margin-top: 1rem;
  }
</style>
