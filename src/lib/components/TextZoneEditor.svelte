<script>
  const { label = '', value = '', onchange = (_v) => {} } = $props()

  function handleInput (e) {
    onchange(e.target.value)
  }
</script>

<div class="field">
  <label class="label is-small">{label}</label>
  <div class="control">
    <input
      class="input is-small"
      type="text"
      {value}
      on:input={handleInput}
    />
  </div>
</div>
