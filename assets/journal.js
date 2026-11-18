'use strict';
// Six transparent, fictional demonstrations. None are client results or live market data.
(() => {
  const host = document.querySelector('.service-laboratory');
  if (host) {
    const tabs = [...host.querySelectorAll('[data-lens]')];
    const scenarios = [...host.querySelectorAll('[data-lens-scenario]')];
    const entries = [
      {
        id: 'market-entry',
        startingPoint: "Three markets compete for the same launch budget.", analysis: "Compare entry costs and first-year contribution.", decisions: ["Prioritise Market B for customer interviews.", "Shift the pilot budget to Market A."],
        title: 'Size is only the start.', unit: 'Year-one contribution after entry costs · USD thousands', output: 'Market assessment', type: 'bars', labels: ['Market A', 'Market B', 'Market C'], values: [[24,41,13],[12,9,-7]], max: 50,
        options: ['Base case', 'Higher entry costs'],
        findings: ['The strongest base-case entry economics belong to Market B. An addressable market is only one part of the decision.', 'Higher entry costs change the ranking: Market A now leads, and Market C is negative. A recommendation depends on the entry assumptions.'],
        assumptions: 'Fictional annual markets, not country forecasts. Base contribution after operating costs: A 44, B 61, C 33 (USD thousands). Base entry cost is 20 each; alternate entry costs are A 32, B 52, C 40. Net contribution = contribution after operations minus entry cost.'
      },
      {
        id: 'feasibility',
        startingPoint: "A proposed launch needs a sales target.", analysis: "Test unit margin against fixed costs.", decisions: ["Set a 500-unit threshold for launch.", "Validate demand for 750 units before launch."],
        title: 'Find the point that makes it work.', unit: 'Contribution after fixed costs · USD thousands · at 0, 250, 500, 750 and 1,000 units', output: 'Commercial feasibility review', type: 'line', labels: ['0','250','500','750','1,000'], values: [[-12,-6,0,6,12],[-12,-8,-4,0,4]], min: -12, max: 12,
        options: ['Base margin', 'Lower margin'],
        findings: ['At $24 contribution per unit and $12,000 fixed cost, the model breaks even at 500 units. The next question is whether that volume is reachable.', 'At $16 contribution per unit, break-even moves to 750 units. A small-looking change in unit economics can materially change the required demand.'],
        assumptions: 'Fictional one-period operating model. Fixed cost: USD 12,000. Contribution per unit: USD 24 base, USD 16 lower margin. Result = volume × unit contribution − fixed cost. Excludes tax, financing, working capital and capital expenditure.'
      },
      {
        id: 'diligence',
        startingPoint: "Ten claims underpin an investment proposal.", analysis: "Match each claim to commercial evidence.", decisions: ["Assign owners to the five open questions.", "Focus follow-up on two open claims and revisit the two challenged claims."],
        title: 'A claim is a starting point.', unit: 'Ten fictional commercial claims · number by evidence status', output: 'Commercial diligence memo', type: 'stack', labels: ['Supported','Unresolved','Contradicted'], values: [[4,5,1],[6,2,2]], max: 10,
        options: ['Initial review', 'More evidence'],
        findings: ['Four claims have support; five remain unresolved and one is contradicted. The memo should explain the gaps rather than turn them into an arbitrary confidence score.', 'More evidence resolves some questions—and contradicts another claim. Progress in diligence is a clearer view, not necessarily a more positive one.'],
        assumptions: 'Invented evidence statuses across ten equally counted claims. Counts do not measure materiality or investment quality. In the alternate review, two unresolved claims become supported and one becomes contradicted. This is a method illustration, not an audit.'
      },
      {
        id: 'sector',
        startingPoint: "Three activities compete for investment.", analysis: "Compare margins across the value chain.", decisions: ["Investigate the service segment first.", "Stress-test the service margin before allocating capital."],
        title: 'Look along the value chain.', unit: 'Example gross margin by activity · percent of activity revenue', output: 'Sector review', type: 'bars', labels: ['Processing','Distribution','Services'], values: [[18,12,32],[10,8,26]], max: 40,
        options: ['Base costs', 'Cost pressure'],
        findings: ['The activities have different margin structures. Understanding where value is captured is more useful than treating a sector as one average.', 'Cost pressure reduces margins across the chain. A sector review examines why some positions are more exposed and whether the assumptions are credible.'],
        assumptions: 'Fictional activities, each normalised to 100 units of revenue. Base costs: processing 82, distribution 88, services 68. Cost-pressure case adds 8, 4 and 6 respectively. Gross margin = (revenue − cost) ÷ revenue. Not comparable returns on capital; excludes overhead.'
      },
      {
        id: 'strategy',
        startingPoint: "The annual plan depends on a revenue target.", analysis: "Test the plan against cost and revenue changes.", decisions: ["Set a trigger for reviewing spend if revenue falls.", "Rephase spending to restore the base surplus."],
        title: 'Test the plan where it is fragile.', unit: 'Example operating result · USD thousands · revenue change scenarios', output: 'Strategy review', type: 'bars', labels: ['−10% revenue','Base revenue','+10% revenue'], values: [[-5,5,15],[-10,0,10]], max: 20,
        options: ['Current costs', 'Costs +$5k'],
        findings: ['A plan with a $5,000 base surplus turns negative after a 10% revenue shortfall. The review should identify the assumptions carrying the recommendation.', 'An extra $5,000 of fixed cost removes the base surplus. The useful discussion is what can be changed or validated before proceeding.'],
        assumptions: 'Fictional period revenue scenarios: USD 90k, 100k, 110k. Current total cost: USD 95k, held fixed for this narrow sensitivity; alternate cost USD 100k. Result = revenue minus cost. This is not a full strategy or cash-flow model.'
      },
      {
        id: 'capital',
        startingPoint: "A team tracks demand across six periods.", analysis: "Update the demand index as evidence arrives.", decisions: ["Prepare capacity options for rising demand.", "Stage the capacity decision while the team checks the latest figures."],
        title: 'A signal needs context.', unit: 'Example demand index · six fictional periods · first period = 100', output: 'Research briefing', type: 'line', labels: ['P1','P2','P3','P4','P5','P6'], values: [[100,103,101,109,112,115],[100,103,101,109,106,104]], min: 95, max: 120,
        options: ['Initial view', 'New evidence'],
        findings: ['The index suggests an upward direction. A briefing should explain the evidence, its relevance to the client’s question, and what would change the view.', 'Newer evidence weakens the apparent trend. Capital intelligence should keep the interpretation open to revision as the information changes.'],
        assumptions: 'Invented indexed observations, not market prices or investment performance. Both sequences start at 100; the final two observations are revised in the alternate view. A non-zero line-chart axis is labelled. Capital intelligence scope and cadence remain to be agreed.'
      }
    ];
    let selected = Math.max(0, entries.findIndex(entry => `#${entry.id}` === location.hash));
    let mode = 0;
    const node = id => host.querySelector(`#${id}`);
    const style = getComputedStyle(host);
    const token = name => style.getPropertyValue(name).trim();
    const chartInk = token('--ivory');
    const chartMuted = token('--subtle');
    Chart.defaults.font.family = token('--mono');
    let chart;
    function drawChart(entry, values) {
      if (!chart) {
        const canvas = document.createElement('canvas');
        node('lens-graph').replaceChildren(canvas);
        chart = new Chart(canvas, {type: 'bar', data: {datasets: []}});
      }
      const line = entry.type === 'line';
      const ring = entry.type === 'stack';
      const series = {
        type: ring ? 'doughnut' : line ? 'line' : 'bar', label: entry.options[mode], data: values,
        backgroundColor: ring ? [chartInk, token('--sage'), token('--clay')] : line ? 'rgba(111,150,132,.2)' : token('--sage-light'),
        borderColor: token('--sage-light'), borderWidth: line ? 3 : 0, borderRadius: 4,
        pointRadius: 4, pointHoverRadius: 7, fill: line, tension: .18, maxBarThickness: 42
      };
      chart.config.type = series.type;
      chart.data.labels = entry.labels;
      const comparison = {
        ...series, label: entry.options[1-mode], data: entry.values[1-mode],
        borderColor: token('--sage'), backgroundColor: token('--clay'), borderDash: [4,4],
        pointRadius: 2, fill: false
      };
      chart.data.datasets = ring ? [series] : [series, comparison];
      chart.options = {
        responsive: true, maintainAspectRatio: false,
        animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {duration: parseFloat(token('--final-motion-time')) || 420},
        interaction: {mode: 'index', intersect: false},
        plugins: {legend: {display: true, position: 'bottom', onClick: () => {},
            labels: {color: chartInk, usePointStyle: true, boxHeight: 8, font: {size: 13}}},
            tooltip: {displayColors: true, titleFont: {weight: 'normal'}}},
        scales: ring ? {} : {
          x: {grid: {display: false}, ticks: {color: chartMuted, font: {size: 13}}},
          y: {min: line ? entry.min : undefined, max: entry.max, beginAtZero: true,
              grid: {color: '#ffffff20'}, ticks: {color: chartMuted, precision: 0}}
        }
      };
      chart.update();
    }
    function render(focus=false) {
      const entry=entries[selected], values=entry.values[mode];
      const highest = values.indexOf(Math.max(...values));
      let metrics;
      switch (entry.id) {
        case 'market-entry': metrics = ['Leading market', entry.labels[highest], 'Year-one contribution', '$'+values[highest]+'k']; break;
        case 'feasibility': metrics = ['Break-even volume', entry.labels[values.indexOf(0)]+' units', 'At 1,000 units', '$'+values.at(-1)+'k']; break;
        case 'diligence': metrics = ['Claims supported', values[0]+' / 10', 'Open questions', values[1]]; break;
        case 'sector': metrics = ['Highest margin', entry.labels[highest], 'Gross margin', values[highest]+'%']; break;
        case 'strategy': metrics = ['Base surplus', '$'+values[1]+'k', 'Revenue downside', '−$'+Math.abs(values[0])+'k']; break;
        case 'capital': metrics = ['Latest index', values.at(-1), 'Since period one', '+'+(values.at(-1)-values[0])+'%']; break;
      }
      ['metric-label','metric-value','comparison-label','comparison-value'].forEach((id,i) => { node(id).textContent=metrics[i]; });
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===selected));tab.tabIndex=i===selected?0:-1;});
      node('lens-panel').setAttribute('aria-labelledby',tabs[selected].id);
      node('lens-title').textContent=entry.title;
      node('lens-unit').textContent=entry.unit;
      node('lens-finding').textContent=entry.findings[mode];
      node('lens-start').textContent=entry.startingPoint;
      node('lens-analysis').textContent=entry.analysis;
      node('lens-decision').textContent=entry.decisions[mode];
      node('lens-assumptions').textContent=entry.assumptions;
      node('lens-data').textContent=entry.labels.map((label,i)=>`${label}: ${values[i]}`).join('; ')+`. Measure: ${entry.unit}.`;
      node('lens-service-link').href=`/services#${entry.id}`;
      scenarios.forEach((button,i)=>{button.textContent=entry.options[i];button.setAttribute('aria-pressed',String(i===mode));});
      const figure=node('lens-graph');drawChart(entry,values);
      figure.setAttribute('aria-label',`Example ${entry.options[mode]}: ${entry.labels.map((label,i)=>`${label} ${values[i]}`).join('; ')}. ${entry.unit}.`);
      if(focus)tabs[selected].focus();
    }
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>{selected=i;mode=0;render();});
      tab.addEventListener('keydown',event=>{
        const keys={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1};
        if(Object.hasOwn(keys,event.key)){event.preventDefault();selected=(selected+keys[event.key]+entries.length)%entries.length;mode=0;render(true);}
        if(event.key==='Home'||event.key==='End'){event.preventDefault();selected=event.key==='Home'?0:entries.length-1;mode=0;render(true);}
      });
    });
    scenarios.forEach((button,i)=>button.addEventListener('click',()=>{mode=i;render();}));
    window.addEventListener('hashchange',()=>{const index=entries.findIndex(entry=>`#${entry.id}`===location.hash);if(index>=0){selected=index;mode=0;render();}});
    render();
  }

  // Decorative animation resolves to a still pattern in under four seconds.
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const fields=[...document.querySelectorAll('.pixel-field')];
  function play(field){
    field.classList.remove('is-playing');
    if(motion.matches)return;
    void field.offsetWidth;
    field.classList.add('is-playing');
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){play(entry.target);observer.unobserve(entry.target);}
  },{threshold:.2});
  fields.forEach(field=>observer.observe(field));
  document.querySelectorAll('.replay-pixels').forEach(button=>button.addEventListener('click',()=>play(button.closest('.pixel-composition').querySelector('.pixel-field'))));
  function updateMotion(){
    fields.forEach(field=>{if(motion.matches)field.classList.remove('is-playing');});
    document.querySelectorAll('.replay-pixels').forEach(button=>{button.disabled=motion.matches;button.textContent=motion.matches?'Reduced motion on':'Replay pattern';});
  }
  motion.addEventListener('change',updateMotion);updateMotion();
})();

// A quiet chapter rail keeps the argument legible as the reader moves through a case.
(() => {
  const links=[...document.querySelectorAll('.chapter-nav a, .article-layout aside a')];
  if(!links.length)return;
  const sections=links.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
  let queued=false;
  function update(){
    queued=false;
    let active=sections[0];
    for(const section of sections)if(section.getBoundingClientRect().top<=155)active=section;
    links.forEach(link=>{if(link.hash===`#${active.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    const index=sections.indexOf(active);
    document.querySelector('.chapter-nav')?.style.setProperty('--progress',`${(index+1)/sections.length*100}%`);
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  update();
})();

// Reveal a few editorial headings and the four research steps once on entry.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (isIntersecting) {
        if (!reduced.matches) target.classList.add('story-enter');
        observer.unobserve(target);
      }
    }
  }, {threshold: .2});
  document.querySelectorAll('.paper-band h2, .journal-insights h2, .method-foot')
    .forEach(element => observer.observe(element));
})();
