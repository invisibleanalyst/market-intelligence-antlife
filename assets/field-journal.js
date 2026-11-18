// Interpolate the three inline print figures on wide screens. Each chapter also
// carries its complete figure for smaller screens, reduced motion and no JS.
(() => {
  const thread = document.querySelector('.fj-thread');
  const steps = [...thread.querySelectorAll('.fj-step')];
  const mode = matchMedia('(min-width:801px) and (prefers-reduced-motion:no-preference)');
  const plate = thread.querySelector('.fj-plate');
  const group = steps[0].querySelector('svg g').cloneNode(true);
  plate.querySelector('svg').append(group);
  const drawings = steps.map(step => [...step.querySelectorAll('svg path')].map(path =>
    path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number)));
  let frame = 0;
  function render() {
    frame = 0;
    const bounds = steps.map(step => step.getBoundingClientRect());
    if (bounds.at(-1).bottom < 0 || bounds[0].top > innerHeight) return;
    const middle = innerHeight * .46;
    const centers = bounds.map(rect => rect.top + rect.height / 2);
    const start = centers[1] < middle ? 1 : 0;
    const fraction = Math.min(1, Math.max(0, (middle-centers[start])/(centers[start+1]-centers[start])));
    const mix = fraction * fraction * (3 - 2 * fraction);
    drawings[start].forEach((line, i) => {
      const next = drawings[start+1][i];
      const points = line.map((value,j) => (value+(next[j]-value)*mix).toFixed(1));
      group.children[i].setAttribute('d', 'M'+points.slice(0,2).join(' ')+'C'+points.slice(2).join(' '));
    });
    plate.querySelector('figcaption').textContent = steps[start + Number(mix >= .5)].dataset.caption;
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(render); }
  function configure() {
    thread.classList.toggle('enhanced', mode.matches);
    if (mode.matches) {
      addEventListener('scroll',schedule,{passive:true});
      addEventListener('resize',schedule);
      schedule();
    } else {
      removeEventListener('scroll',schedule);
      removeEventListener('resize',schedule);
      cancelAnimationFrame(frame);
      frame=0;
    }
  }
  mode.addEventListener('change',configure);
  configure();
})();
