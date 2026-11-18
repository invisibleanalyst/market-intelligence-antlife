/* A field of square particles resolves into a folded textile, a globe or a relief map. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  for (const canvas of document.querySelectorAll('canvas[data-sculpture]')) {
    const context = canvas.getContext('2d');
    if (!context) continue;
    const shape = canvas.dataset.sculpture;
    const points = [];
    const tau = Math.PI * 2;
    for (let row = 0; row < 48; row++) {
      for (let col = 0; col < 78; col++) {
        const u = col / 77, v = row / 47;
        let x, y, depth;
        if (shape === 'orbit') {
          const lat = (v - .5) * Math.PI, lon = u * tau;
          depth = Math.cos(lat) * Math.cos(lon);
          x = .5 + .28 * Math.cos(lat) * Math.sin(lon) + .08 * Math.sin(lat);
          y = .51 - .38 * Math.sin(lat) + .08 * depth;
        } else if (shape === 'weave') {
          const twist = u * 4.5 + v * tau;
          depth = Math.cos(twist);
          x = .04 + u * .91 + .035 * Math.sin(twist);
          y = .52 + .21 * Math.sin(twist) + .11 * Math.cos(u * tau) - .12 * u;
        } else {
          depth = Math.sin(u * 8 + v * 3) * .52 + Math.cos(v * 7 - u * 2) * .48;
          x = .04 + u * .70 + v * .22;
          y = .69 - v * .33 - .16 * depth + .12 * Math.sin(u * 5);
        }
        const seed = Math.abs(Math.sin(col * 127.1 + row * 311.7) * 43758.5453) % 1;
        points.push({x, y, depth, seed});
      }
    }
    points.sort((a,b) => a.depth - b.depth);
    let width, height, frame, visible = false;
    function draw(t = 1) {
      context.clearRect(0, 0, width, height);
      for (const {x,y,depth,seed} of points) {
        const progress = Math.min(1, Math.max(0, t * 1.7 - seed * .7));
        const fall = (1 - progress) ** 2;
        const alpha = (.24 + .72 * (depth + 1) / 2) * progress;
        context.fillStyle = 'rgba(205,227,211,' + alpha + ')';
        const size = Math.max(1, width / 355) * (.75 + seed * .65);
        context.fillRect((x + fall * (seed - .5) * .18) * width,
          (y - fall * (.22 + seed * .35)) * height, size, size);
      }
    }
    function resize() {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const scale = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw();
    }
    function play() {
      cancelAnimationFrame(frame);
      if (motion.matches || !visible) { draw(); return; }
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / 1600);
        draw(t);
        if (t < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    }, {threshold: .12}).observe(canvas);
    canvas.closest('.pixel-composition')?.querySelector('.replay-pixels')?.addEventListener('click', play);
    motion.addEventListener('change', play);
  }
})();
