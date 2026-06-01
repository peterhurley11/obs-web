<!-- Who's Next lower third — pill badge style matching Almost Friday brand -->
<script>
  let { fields = { name: 'PLAYER NAME', title: 'TEAM · POSITION', color: '#111111' } } = $props()
</script>

<div class="wn-lower-third">
  <div class="wn-pill wn-pill--name" style:color={fields.color}>
    {fields.name}
  </div>
  <div class="wn-pill wn-pill--title" style:color={fields.color}>
    {fields.title}
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

  .wn-lower-third {
    position: absolute;
    left: 38%;
    top: 67%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .wn-pill {
    font-family: 'Bebas Neue', 'Arial Narrow', Impact, sans-serif;
    font-weight: 400;
    background: rgba(238, 238, 238, 0.96);
    border: 3px solid #1a1a1a;
    border-radius: 50px;
    letter-spacing: 0.05em;
    text-align: center;
    display: inline-block;
    white-space: nowrap;
    padding: 4px 32px 2px;
    line-height: 1.1;
    color: #111111;
  }

  .wn-pill--name {
    font-size: clamp(2.2rem, 4vw, 3.6rem);
    min-width: 260px;
  }

  .wn-pill--title {
    font-size: clamp(1.4rem, 2.6vw, 2.4rem);
    min-width: 180px;
  }
</style>
