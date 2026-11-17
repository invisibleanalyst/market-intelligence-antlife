'use strict';
// Six transparent, fictional demonstrations. None are client results or live market data.
(() => {
  const host = document.querySelector('.service-laboratory');
  if (host) {
    const tabs = [...host.querySelectorAll('[data-lens]')];
    const scenarios = [...host.querySelectorAll('[data-lens-scenario]')];
    const entries = [
      {
        id: 'market-entry', title: 'Size is only the start.', unit: 'Year-one contribution after entry costs · USD thousands', output: 'Market assessment', type: 'bars', labels: ['Market A', 'Market B', 'Market C'], values: [[24,41,13],[12,9,-7]], max: 50,
        options: ['Base case', 'Higher entry costs'],
        findings: ['The strongest base-case entry economics belong to Market B. An addressable market is only one part of the decision.', 'Higher entry costs change the ranking: Market A now leads, and Market C is negative. A recommendation depends on the entry assumptions.'],
        assumptions: 'Fictional annual markets, not country forecasts. Base contribution after operating costs: A 44, B 61, C 33 (USD thousands). Base entry cost is 20 each; alternate entry costs are A 32, B 52, C 40. Net contribution = contribution after operations minus entry cost.'
      },
      {
        id: 'feasibility', title: 'Find the point that makes it work.', unit: 'Contribution after fixed costs · USD thousands · at 0, 250, 500, 750 and 1,000 units', output: 'Commercial feasibility review', type: 'line', labels: ['0','250','500','750','1,000'], values: [[-12,-6,0,6,12],[-12,-8,-4,0,4]], min: -12, max: 12,
        options: ['Base margin', 'Lower margin'],
        findings: ['At $24 contribution per unit and $12,000 fixed cost, the model breaks even at 500 units. The next question is whether that volume is reachable.', 'At $16 contribution per unit, break-even moves to 750 units. A small-looking change in unit economics can materially change the required demand.'],
        assumptions: 'Fictional one-period operating model. Fixed cost: USD 12,000. Contribution per unit: USD 24 base, USD 16 lower margin. Result = volume × unit contribution − fixed cost. Excludes tax, financing, working capital and capital expenditure.'
      },
      {
        id: 'diligence', title: 'A claim is a starting point.', unit: 'Ten fictional commercial claims · number by evidence status', output: 'Commercial diligence memo', type: 'stack', labels: ['Supported','Unresolved','Contradicted'], values: [[4,5,1],[6,2,2]], max: 10,
        options: ['Initial review', 'More evidence'],
        findings: ['Four claims have support; five remain unresolved and one is contradicted. The memo should explain the gaps rather than turn them into an arbitrary confidence score.', 'More evidence resolves some questions—and contradicts another claim. Progress in diligence is a clearer view, not necessarily a more positive one.'],
        assumptions: 'Invented evidence statuses across ten equally counted claims. Counts do not measure materiality or investment quality. In the alternate review, two unresolved claims become supported and one becomes contradicted. This is a method illustration, not an audit.'
      },
      {
        id: 'sector', title: 'Look along the value chain.', unit: 'Illustrative gross margin by activity · percent of activity revenue', output: 'Sector review', type: 'bars', labels: ['Processing','Distribution','Services'], values: [[18,12,32],[10,8,26]], max: 40,
        options: ['Base costs', 'Cost pressure'],
        findings: ['The activities have different margin structures. Understanding where value is captured is more useful than treating a sector as one average.', 'Cost pressure reduces margins across the chain. A sector review examines why some positions are more exposed and whether the assumptions are credible.'],
        assumptions: 'Fictional activities, each normalised to 100 units of revenue. Base costs: processing 82, distribution 88, services 68. Cost-pressure case adds 8, 4 and 6 respectively. Gross margin = (revenue − cost) ÷ revenue. Not comparable returns on capital; excludes overhead.'
      },
      {
        id: 'strategy', title: 'Test the plan where it is fragile.', unit: 'Illustrative operating result · USD thousands · revenue change scenarios', output: 'Strategy review', type: 'bars', labels: ['−10% revenue','Base revenue','+10% revenue'], values: [[-5,5,15],[-10,0,10]], max: 20,
        options: ['Current costs', 'Costs +$5k'],
        findings: ['A plan with a $5,000 base surplus turns negative after a 10% revenue shortfall. The review should identify the assumptions carrying the recommendation.', 'An extra $5,000 of fixed cost removes the base surplus. The useful discussion is what can be changed or validated before proceeding.'],
        assumptions: 'Fictional period revenue scenarios: USD 90k, 100k, 110k. Current total cost: USD 95k, held fixed for this narrow sensitivity; alternate cost USD 100k. Result = revenue minus cost. This is not a full strategy or cash-flow model.'
      },
      {
        id: 'capital', title: 'A signal needs context.', unit: 'Illustrative demand index · six fictional periods · first period = 100', output: 'Research briefing', type: 'line', labels: ['P1','P2','P3','P4','P5','P6'], values: [[100,103,101,109,112,115],[100,103,101,109,106,104]], min: 95, max: 120,
        options: ['Initial view', 'New evidence'],
        findings: ['The index suggests an upward direction. A briefing should explain the evidence, its relevance to the client’s question, and what would change the view.', 'Newer evidence weakens the apparent trend. Capital intelligence should keep the interpretation open to revision as the information changes.'],
        assumptions: 'Invented indexed observations, not market prices or investment performance. Both sequences start at 100; the final two observations are revised in the alternate view. A non-zero line-chart axis is labelled. Capital intelligence scope and cadence remain to be agreed.'
      }
    ];
    let selected = Math.max(0, entries.findIndex(entry => `#${entry.id}` === location.hash));
    let mode = 0;
    const node = id => host.querySelector(`#${id}`);
    const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const svgText = (x,y,text,cls='') => `<text x="${x}" y="${y}" class="${cls}">${esc(text)}</text>`;
    function graph(entry, values) {
      let svg = '<svg viewBox="0 0 600 230" aria-hidden="true" focusable="false">';
      if (entry.type === 'bars') {
        const negative = values.some(value => value < 0);
        const left = 150, right = 525, zero = negative ? 245 : left;
        const extent = negative ? 260 : right-left;
        const scale = extent / entry.max;
        svg += `<path d="M${zero} 18V203" class="graph-axis"/>`;
        values.forEach((value, i) => {
          const y = 36+i*59, width = Math.abs(value)*scale;
          const x = value < 0 ? zero-width : zero;
          const shortLabels = entry.id === 'strategy' ? ['−10%', 'Base', '+10%'] : entry.id === 'sector' ? ['Processing', 'Distrib.', 'Services'] : entry.labels;
          svg += svgText(4,y+19,shortLabels[i]);
          svg += `<rect x="${x}" y="${y}" width="${width}" height="28" class="graph-bar ${value<0?'graph-negative':i===values.indexOf(Math.max(...values))?'graph-focus':''}"/>`;
          svg += svgText(value<0 ? x-37 : x+width+10, y+19, value,'graph-value');
        });
        svg += svgText(zero-3,223,'0');
      } else if (entry.type === 'stack') {
        const colors=['#143A24','#6F9684','#9A4A2A']; let x=12;
        values.forEach((value,i) => {
          svg+=`<rect x="${x}" y="42" width="${value*56}" height="55" fill="${colors[i]}"/>`;
          x+=value*56;
        });
        values.forEach((value,i) => {
          svg+=`<rect x="12" y="${124+i*31}" width="8" height="8" fill="${colors[i]}"/>`;
          svg+=svgText(32,133+i*31,entry.labels[i]);
          svg+=svgText(540,133+i*31,value,'graph-value');
        });
      } else {
        const x0=65,y0=185,w=470,h=150;
        const px=i=>x0+i*w/(values.length-1);
        const py=v=>y0-(v-entry.min)/(entry.max-entry.min)*h;
        for(let i=0;i<3;i++){
          const val=entry.min+(entry.max-entry.min)*i/2, y=py(val);
          svg+=`<path d="M${x0} ${y}H550" class="graph-grid"/>`+svgText(5,y+4,Number(val.toFixed(1)));
        }
        const points=values.map((v,i)=>`${px(i)},${py(v)}`).join(' ');
        svg+=`<path d="M${x0} ${y0} L${points.replaceAll(' ', ' L')} L535 ${y0}Z" class="graph-area"/>`;
        svg+=`<polyline points="${points}" class="graph-line"/>`;
        values.forEach((value,i)=>{
          svg+=`<circle cx="${px(i)}" cy="${py(value)}" r="4" class="graph-dot"/>`;
          svg+=svgText(px(i)-10,py(value)-12,value,'graph-value');
          svg+=svgText(px(i)-9,218,entry.labels[i]);
        });
      }
      return svg+'</svg>';
    }
    function render(focus=false) {
      const entry=entries[selected], values=entry.values[mode];
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===selected));tab.tabIndex=i===selected?0:-1;});
      node('lens-panel').setAttribute('aria-labelledby',tabs[selected].id);
      node('lens-title').textContent=entry.title;
      node('lens-unit').textContent=entry.unit;
      node('lens-finding').textContent=entry.findings[mode];
      node('lens-output').textContent=`Output / ${entry.output}`;
      node('lens-assumptions').textContent=entry.assumptions;
      node('lens-data').textContent=entry.labels.map((label,i)=>`${label}: ${values[i]}`).join('; ')+`. Measure: ${entry.unit}.`;
      node('lens-service-link').href=`/services#${entry.id}`;
      host.querySelector('.lens-counter').textContent=`0${selected+1} / 06`;
      scenarios.forEach((button,i)=>{button.textContent=entry.options[i];button.setAttribute('aria-pressed',String(i===mode));});
      const figure=node('lens-graph');figure.innerHTML=graph(entry,values);
      figure.setAttribute('aria-label',`Illustrative ${entry.options[mode]}: ${entry.labels.map((label,i)=>`${label} ${values[i]}`).join('; ')}. ${entry.unit}.`);
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
