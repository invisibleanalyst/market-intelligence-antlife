const svgNamespace = 'http://www.w3.org/2000/svg';

function createTerrainLight(stage, map) {
  const layer = map.querySelector('.relief-sparks');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const tracks = new Map([...map.querySelectorAll('path')].map(path => [
    path.dataset.route ?? path, { path, length: path.getTotalLength() }
  ]));
  // Sample once for hit testing, then use the curves themselves to guide the light.
  const contours = [...tracks.values()].flatMap(track => {
    const count = Math.ceil(track.length / 13);
    return Array.from({ length: count + 1 }, (_, index) => {
      const distance = index * track.length / count;
      return { track, distance, point: track.path.getPointAtLength(distance) };
    });
  });
  const sparks = Array.from({ length: 40 }, () => {
    const node = document.createElementNS(svgNamespace, 'circle');
    node.setAttribute('opacity', '0');
    layer.append(node);
    return { node, life: 0 };
  });
  let frame = 0;
  let earliestMove = 0;

  function render(now) {
    frame = 0;
    for (const spark of sparks) {
      if (!spark.life) continue;
      const time = (now - spark.started) / spark.life;
      if (time >= 1 || !motion.matches) {
        spark.life = 0;
        spark.node.setAttribute('opacity', '0');
        continue;
      }
      if (time < 0) continue;
      const distance = Math.max(0, Math.min(spark.track.length, spark.distance + spark.travel * time));
      const point = spark.track.path.getPointAtLength(distance);
      const envelope = Math.sin(Math.PI * time);
      spark.node.setAttribute('cx', point.x.toFixed(2));
      spark.node.setAttribute('cy', (point.y + spark.lift * time).toFixed(2));
      spark.node.setAttribute('r', (spark.size * (.75 + .25 * envelope)).toFixed(2));
      spark.node.setAttribute('opacity', (envelope * spark.brightness).toFixed(2));
    }
    if (sparks.some(spark => spark.life)) frame = requestAnimationFrame(render);
  }

  function emit(track, distance, count, travel) {
    if (!motion.matches) return;
    const now = performance.now();
    for (let index = 0; index < count; index++) {
      const spark = sparks.find(candidate => !candidate.life);
      if (!spark) break;
      Object.assign(spark, {
        track, distance,
        travel: travel * (.72 + Math.random() * .28),
        started: now + index * 32,
        life: 480 + Math.random() * 420,
        lift: (Math.random() - .8) * 10,
        size: .65 + Math.random() * 1.2,
        brightness: .45 + Math.random() * .5
      });
    }
    if (!frame) frame = requestAnimationFrame(render);
  }

  function followPointer(event, count) {
    if (!motion.matches || event.target.closest('a, button') || performance.now() < earliestMove) return;
    earliestMove = performance.now() + 38;
    const bounds = map.getBoundingClientRect();
    const units = map.viewBox.baseVal.width / bounds.width;
    const x = (event.clientX - bounds.left) * units;
    const y = (event.clientY - bounds.top) * units;
    if (x < 490) return;
    let nearest;
    let threshold = 36 ** 2;
    for (const sample of contours) {
      const gap = (sample.point.x - x) ** 2 + (sample.point.y - y) ** 2;
      if (gap < threshold) {
        threshold = gap;
        nearest = sample;
      }
    }
    if (nearest) emit(nearest.track, nearest.distance, count, 28);
  }

  stage.addEventListener('pointermove', event => {
    if (hover.matches && event.pointerType !== 'touch') followPointer(event, 2);
  }, { passive: true });
  stage.addEventListener('pointerup', event => {
    if (event.pointerType === 'touch') followPointer(event, 7);
  }, { passive: true });

  return function illuminate(route) {
    const track = tracks.get(route);
    emit(track, route === 'stem' ? track.length * .58 : 0, 8,
      route === 'stem' ? track.length * .42 : track.length);
  };
}

export function initReliefExplorer(hero, mainSlider, currency) {
  const stage = hero.querySelector('.relief-stage');
  const image = hero.querySelector('.relief-landscape');
  const map = hero.querySelector('.relief-map');
  const explorer = hero.querySelector('.relief-explore');
  const trigger = hero.querySelector('.relief-trigger');
  const markers = [...hero.querySelectorAll('[data-relief-stop]')];
  const panel = hero.querySelector('.relief-readout');
  const heading = panel.querySelector('h2');
  const costView = panel.querySelector('[data-relief-view="cost"]');
  const demandView = panel.querySelector('[data-relief-view="demand"]');
  const slider = panel.querySelector('#relief-cost');
  const value = panel.querySelector('#relief-cost-value');
  const parity = panel.querySelector('.relief-parity');
  const outcome = panel.querySelector('.relief-outcome');
  const result = panel.querySelector('.relief-result');
  const marketA = outcome.querySelector('[data-market="a"]');
  const marketB = outcome.querySelector('[data-market="b"]');
  const netAValue = marketA.querySelector('dd');
  const netBValue = marketB.querySelector('dd');
  const docked = matchMedia('(max-width: 1100px)');
  const titles = {
    demand: 'Compare the upside.',
    cost: 'Find the tipping point.',
    decision: 'Which market leads?'
  };
  let opener;
  let leader;

  function positionMap() {
    // Match the artwork's object-fit crop, including the right-biased mobile framing.
    const width = image.clientWidth;
    const height = image.clientHeight;
    const art = map.viewBox.baseVal;
    const scale = Math.max(width / art.width, height / art.height);
    const position = parseFloat(getComputedStyle(image).getPropertyValue('--relief-position')) / 100;
    const x = image.offsetLeft + (width - art.width * scale) * position;
    const y = image.offsetTop + (height - art.height * scale) / 2;
    Object.assign(map.style, {
      left: x + 'px', top: y + 'px', width: art.width * scale + 'px', height: art.height * scale + 'px'
    });
    for (const marker of markers) {
      marker.style.setProperty('--relief-x', x + Number(marker.dataset.x) * scale + 'px');
      marker.style.setProperty('--relief-y', y + Number(marker.dataset.y) * scale + 'px');
    }
  }

  positionMap();
  map.removeAttribute('hidden');
  const illuminate = createTerrainLight(stage, map);
  explorer.hidden = false;
  if ('ResizeObserver' in window) new ResizeObserver(positionMap).observe(image);
  else window.addEventListener('resize', positionMap);

  function reveal(name, source, pointer) {
    const wasClosed = panel.hidden;
    if (wasClosed) opener = source;
    hero.dataset.reliefStop = name;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    for (const marker of markers) {
      marker.setAttribute('aria-pressed', String(marker.dataset.reliefStop === name));
    }
    heading.textContent = titles[name];
    demandView.hidden = name !== 'demand';
    costView.hidden = name !== 'cost';
    parity.hidden = name !== 'cost';
    outcome.hidden = name === 'demand';
    if (name === 'demand') illuminate('stem');
    else showRoutes();
    if (wasClosed && docked.matches && pointer) {
      trigger.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function close() {
    panel.hidden = true;
    delete hero.dataset.reliefStop;
    trigger.setAttribute('aria-expanded', 'false');
    for (const marker of markers) marker.setAttribute('aria-pressed', 'false');
    (opener?.getClientRects().length ? opener : trigger).focus();
  }

  function showRoutes() {
    if (leader === 'a' || leader === 'tie') illuminate('a');
    if (leader === 'b' || leader === 'tie') illuminate('b');
  }

  function setCost(cost) {
    mainSlider.value = cost;
    mainSlider.dispatchEvent(new Event('input'));
  }

  trigger.addEventListener('click', event => {
    if (panel.hidden) reveal('cost', trigger, event.detail > 0);
    else close();
  });
  for (const marker of markers) {
    marker.addEventListener('click', event => reveal(marker.dataset.reliefStop, marker, event.detail > 0));
  }
  panel.querySelector('.relief-close').addEventListener('click', close);
  hero.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) close();
  });
  slider.addEventListener('input', () => setCost(slider.value));
  parity.addEventListener('click', () => setCost(parity.dataset.cost));

  return function update({ cost, netA, netB, difference, tieCost }) {
    const previous = leader;
    leader = difference === 0 ? 'tie' : difference > 0 ? 'b' : 'a';
    hero.dataset.reliefLead = leader;
    slider.value = cost;
    slider.style.setProperty('--relief-travel', (cost / Number(slider.max)) * 100 + '%');
    parity.dataset.cost = tieCost;
    const parityText = 'Try the $' + tieCost + 'k tie';
    if (parity.textContent !== parityText) parity.textContent = parityText;
    value.textContent = currency.format(cost * 1000);
    slider.setAttribute('aria-valuetext', value.textContent + ' in entry costs');
    netAValue.textContent = '$' + netA + 'k';
    netBValue.textContent = '$' + netB + 'k';
    marketA.toggleAttribute('data-leading', leader !== 'b');
    marketB.toggleAttribute('data-leading', leader !== 'a');
    if (leader !== previous) {
      result.textContent = leader === 'tie' ? 'The markets tie.' : 'Pilot Market ' + leader.toUpperCase() + '.';
      if (!outcome.hidden && !panel.hidden) showRoutes();
    }
  };
}
