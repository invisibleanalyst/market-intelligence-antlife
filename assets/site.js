'use strict';
// Shared navigation remains usable when JavaScript is unavailable (see noscript CSS).
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu(restoreFocus = false) {
  if (!menu || !nav) return;
  const wasOpen = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
  if (restoreFocus && wasOpen) menu.focus();
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

const stages = [
  { label: '01 / What to make', title: 'Find a focused feedstock.', text: 'The study identified recovered polyester as a candidate for a focused entry route, rather than treating all used textiles as interchangeable input.', limit: 'The composition of the actual supply, contamination, sorting losses and usable recovery yield.', diagram: 'Mixed clothing / target feedstock' },
  { label: '02 / Where to source', title: 'Compare the usable input cost.', text: 'The research favoured investigating local bale interception in Nairobi. The relevant comparison is delivered, usable material—not the sticker price of a bale.', limit: 'Comparable bale weights, grades, transport, duties, sorting costs and usable recovery yield. Historical savings are not presented as verified current prices.', diagram: 'Supply routes / delivered usable material' },
  { label: '03 / How to process', title: 'Investigate a smaller first step.', text: 'The study recommended examining a container-scale mechanical route before a larger, more complex processing investment.', limit: 'Independent feedstock trials, vendor throughput claims, energy needs, output quality and engineering feasibility.', diagram: 'Sort / process / test the output' },
  { label: '04 / What to decide', title: 'Make the next commitment conditional.', text: 'The desk study brought product, sourcing and processing choices into one decision view. It supported a staged investigation rather than claiming a proven production business.', limit: 'Validate commercial inputs and technical performance before investment. No launched plant, realised savings or investment return is asserted.', diagram: 'Evidence / conditions / next decision' }
];
const stageTabs = [...document.querySelectorAll('[data-stage]')];
let activeStage = 0;
function renderStage(index, focus = false) {
  if (!stageTabs.length) return;
  activeStage = (index + stages.length) % stages.length;
  const stage = stages[activeStage];
  for (const [i, tab] of stageTabs.entries()) {
    tab.setAttribute('aria-selected', String(i === activeStage));
    tab.tabIndex = i === activeStage ? 0 : -1;
  }
  for (const [id, value] of Object.entries({ 'stage-category': stage.label, 'stage-title': stage.title, 'stage-text': stage.text, 'stage-limit': stage.limit, 'stage-diagram-label': stage.diagram, 'stage-count': `0${activeStage + 1} / 04` })) document.getElementById(id).textContent = value;
  const panel = document.querySelector('#stage-panel');
  panel.dataset.step = String(activeStage);
  panel.setAttribute('aria-labelledby', stageTabs[activeStage].id);
  if (focus) stageTabs[activeStage].focus();
}
stageTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderStage(index));
  tab.addEventListener('keydown', e => {
    const keys = { ArrowRight: activeStage + 1, ArrowLeft: activeStage - 1, Home: 0, End: 3 };
    if (Object.hasOwn(keys, e.key)) { e.preventDefault(); renderStage(keys[e.key], true); }
  });
});
document.querySelector('[data-stage-prev]')?.addEventListener('click', () => renderStage(activeStage - 1));
document.querySelector('[data-stage-next]')?.addEventListener('click', () => renderStage(activeStage + 1));

const historical = [
  { name: 'Rwanda', expected: 126509, adjusted: 149280 },
  { name: 'Burundi', expected: 166193, adjusted: 235994 },
  { name: 'Uganda', expected: 334320, adjusted: 434616 },
  { name: 'Tanzania', expected: 392781, adjusted: 542038 }
];
function renderLossChart(measure) {
  const chart = document.querySelector('#loss-chart');
  if (!chart) return;
  chart.replaceChildren();
  for (const item of historical) {
    const row = document.createElement('div'); row.className = 'loss-row'; row.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span'); name.className = 'loss-name'; name.textContent = item.name;
    const track = document.createElement('span'); track.className = 'loss-track';
    const bar = document.createElement('span'); bar.className = 'loss-bar'; bar.style.setProperty('--loss', `${item[measure] / 600000 * 100}%`); track.append(bar);
    const value = document.createElement('span'); value.className = 'loss-value'; value.textContent = `−$${Math.round(item[measure] / 1000)}k`;
    row.append(name, track, value); chart.append(row);
  }
  chart.setAttribute('aria-label', `Projected ${measure === 'adjusted' ? 'risk-adjusted' : 'expected'} first-year losses in USD: ${historical.map(d => `${d.name} ${d[measure].toLocaleString('en-US')}`).join('; ')}. All values are negative.`);
  document.querySelectorAll('[data-profit]').forEach(button => {
    const active = button.dataset.profit === measure;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#profit-caption').textContent = measure === 'adjusted' ? 'The risk-adjusted projections show a larger first-year loss in each market. See the figures and assumptions below.' : 'The model projects a first-year loss in all four markets.';
}
document.querySelectorAll('[data-profit]').forEach(button => button.addEventListener('click', () => renderLossChart(button.dataset.profit)));
renderLossChart('expected');
const money = number => `${number < 0 ? '−' : ''}$${Math.abs(number).toLocaleString('en-US')}`;
function calculateScenario() {
  const revenueInput = document.querySelector('#revenue'); if (!revenueInput) return;
  const revenue = Number(revenueInput.value), cost = Number(document.querySelector('#cost').value), customers = Number(document.querySelector('#customers').value);
  const contribution = revenue - cost, profit = contribution * customers - 20000;
  document.querySelector('#revenue-out').textContent = money(revenue);
  document.querySelector('#cost-out').textContent = money(cost);
  document.querySelector('#customers-out').textContent = customers.toLocaleString('en-US');
  document.querySelector('#scenario-profit').textContent = money(profit);
  document.querySelector('#scenario-explain').textContent = `Each customer contributes ${money(contribution)} before fixed entry costs.`;
  document.querySelector('#scenario-breakeven').textContent = contribution > 0 ? `Break-even: ${Math.ceil(20000 / contribution).toLocaleString('en-US')} customers to cover $20,000 of fixed entry costs.` : 'Break-even requires a positive contribution first.';
  document.querySelector('.scenario-result').classList.toggle('positive', profit >= 0);
}
['revenue', 'cost', 'customers'].forEach(id => document.getElementById(id)?.addEventListener('input', calculateScenario));
document.querySelector('#reset-scenario')?.addEventListener('click', () => {
  for (const [id, value] of Object.entries({ revenue: 120, cost: 150, customers: 500 })) document.getElementById(id).value = value;
  calculateScenario();
});
calculateScenario();

const insightRows = [...document.querySelectorAll('[data-kind]')];
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  let count = 0;
  for (const row of insightRows) { row.hidden = filter !== 'all' && row.dataset.kind !== filter; if (!row.hidden) count++; }
  document.querySelectorAll('[data-filter]').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
  document.querySelector('#filter-status').textContent = count ? `${count} observation available.` : `No ${filter} pieces published yet. Explore Observations for the current editorial note.`;
}));

const form = document.querySelector('#contact-form');
if (form) {
  const service = new URLSearchParams(location.search).get('service');
  if ([...form.elements.service.options].some(option => option.value === service)) form.elements.service.value = service;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type=submit]'), status = document.querySelector('#form-status');
    button.disabled = true; button.textContent = 'Sending…'; status.dataset.state = 'pending'; status.textContent = 'Sending your enquiry…';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response;
      try {
        response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))), signal: controller.signal });
      } finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error('Delivery unavailable');
      status.dataset.state = 'success'; status.textContent = 'Thank you. Your enquiry has been sent to Antlife. We’ll respond by email.';
      form.reset();
    } catch {
      status.dataset.state = 'error'; status.textContent = 'Your enquiry could not be sent. Your message is still here. Please retry or email info@antlife.one directly.';
    } finally {
      button.disabled = false; button.innerHTML = 'Send enquiry <svg class="arrow-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10"/></svg>';
    }
  });
}
