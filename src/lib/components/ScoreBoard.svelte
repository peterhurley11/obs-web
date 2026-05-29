<script>
  export let fields = { teamA: 'HOME', teamB: 'AWAY', scoreA: '0', scoreB: '0', period: 'Q1' }
</script>

<div class="scoreboard">
  <div class="scoreboard__team">{fields.teamA}</div>
  <div class="scoreboard__score">{fields.scoreA}</div>
  <div class="scoreboard__period">{fields.period}</div>
  <div class="scoreboard__score">{fields.scoreB}</div>
  <div class="scoreboard__team">{fields.teamB}</div>
</div>

<style>
  .scoreboard {
    position: absolute;
    top: 4%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(10, 12, 24, 0.92);
    border: 2px solid #e63946;
    font-family: 'Arial Black', Arial, sans-serif;
    pointer-events: none;
    white-space: nowrap;
  }
  .scoreboard__team {
    font-size: clamp(0.9rem, 2vw, 1.4rem);
    font-weight: 900;
    color: #ffffff;
    padding: 0.4em 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .scoreboard__score {
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 900;
    color: #e63946;
    background: rgba(230, 57, 70, 0.12);
    padding: 0.3em 0.6em;
    min-width: 2.2em;
    text-align: center;
  }
  .scoreboard__period {
    font-size: clamp(0.75rem, 1.4vw, 1rem);
    color: #aab4c8;
    padding: 0.4em 0.6em;
    border-left: 1px solid rgba(255,255,255,0.15);
    border-right: 1px solid rgba(255,255,255,0.15);
    text-transform: uppercase;
  }
</style>
