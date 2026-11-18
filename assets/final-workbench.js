// First-year contribution, in USD thousands. Operating contribution and A's entry
// cost stay fixed while the user varies B's launch quote.
(() => {
  const study = document.getElementById('entry-study');
  if (!study) return;
  const slider = study.querySelector('#entry-cost');
  const instrument = study.querySelector('.entry-instrument');
  const costLabel = study.querySelector('#entry-cost-label');
  const result = study.querySelector('#entry-result');
  const explanation = study.querySelector('#entry-explanation');
  const marketB = study.querySelector('#market-b-net');
  const operatingB = 61;
  const netA = 44 - 20;
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  });

  function update() {
    const cost = slider.valueAsNumber;
    const netB = operatingB - cost;
    const difference = netB - netA;
    const costInDollars = currency.format(cost * 1000);
    instrument.style.setProperty('--entry-position', (cost / Number(slider.max)) * 100 + '%');
    instrument.style.setProperty('--entry-b-y', (1 - netB / 65) * 100 + '%');
    costLabel.value = costInDollars;
    slider.setAttribute('aria-valuetext', costInDollars + ' in entry costs. Market A leaves $24k; Market B leaves $' + netB + 'k.');
    marketB.textContent = '$' + netB + 'k';
    if (difference === 0) {
      result.textContent = 'The markets tie.';
      explanation.textContent = 'Both leave $24k in year one. Compare demand, timing and execution risk to decide which pilot to fund.';
      return;
    }
    const leader = difference > 0 ? 'Market B' : 'Market A';
    result.textContent = 'Pilot ' + leader + '.';
    const action = difference > 0
      ? 'Verify the launch quote before committing the pilot budget.'
      : 'Prioritise A unless the team can bring B’s entry cost below $37k.';
    explanation.textContent = leader + ' leaves $' + Math.abs(difference) + 'k more in year one. ' + action;
  }
  slider.addEventListener('input', update);
  slider.disabled = false;
  update();
})();
