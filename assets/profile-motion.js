/* Content is visible before enhancement and when motion is reduced. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => {
    for (const {isIntersecting, target} of entries) {
      if (!isIntersecting) continue;
      if (!preference.matches) {
        target.classList.add(target.matches('svg') ? 'arrived' : 'story-enter');
      }
      observer.unobserve(target);
    }
  }, {threshold: .12});
  document.querySelectorAll('.profile-study, main h1, main h2, .service-detail, .insight-row')
    .forEach(element => observer.observe(element));
  document.querySelectorAll('.replay-pixels').forEach(button => {
    function updateButton() {
      button.disabled = preference.matches;
      button.textContent = preference.matches ? 'Reduced motion on' : 'Replay diagram';
    }
    preference.addEventListener('change', updateButton);
    updateButton();
    button.addEventListener('click', () => {
      const study = button.closest('.pixel-composition').querySelector('.profile-study');
      study.classList.remove('arrived');
      study.getBoundingClientRect();
      study.classList.add('arrived');
    });
  });
})();
