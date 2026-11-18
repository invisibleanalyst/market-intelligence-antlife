(() => {
  const room = document.querySelector('.decision-room');
  const choices = [...room.querySelectorAll('.dr-choices button')];
  function select(choice) {
    for (const button of choices) {
      const selected = button === choice;
      button.setAttribute('aria-pressed', String(selected));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    }
  }
  for (const button of choices) button.addEventListener('click', () => select(button));
  for (const panel of room.querySelectorAll('.dr-panel')) {
    const modes = panel.querySelectorAll('.dr-switch button');
    const measures = panel.querySelectorAll('.dr-measure');
    for (const button of modes) {
      button.addEventListener('click', () => {
        for (const mode of modes) mode.setAttribute('aria-pressed', String(mode === button));
        const values = button.dataset.values.split(',').map(Number);
        measures.forEach((row, i) => {
          row.querySelector('strong').textContent = panel.dataset.prefix + values[i] + panel.dataset.suffix;
          row.querySelector('i').style.width = (100 * values[i] / Number(panel.dataset.max)) + '%';
        });
        panel.querySelector('h4').textContent = button.dataset.title;
        panel.querySelector('.dr-finding').textContent = button.dataset.finding;
      });
    }
  }
  select(choices[0]);
  room.classList.add('interactive');
})();
