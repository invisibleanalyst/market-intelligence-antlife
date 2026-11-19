(() => {
  const trigger = document.querySelector('#book-call');
  if (!trigger) return;
  const calendar = new URL(trigger.href);
  const layout = 'month_view';

  let embed;
  function loadEmbed() {
    const origin = 'https://app.cal.com';
    return new Promise((resolve, reject) => {
      // Cal's embed consumes this queue on load and then processes incoming calls.
      function cal(...args) { cal.q.push(args); }
      cal.q = [['init', { origin }], ['ui', { hideEventTypeDetails: false, layout }]];
      cal.ns = {};
      cal.loaded = true;
      window.Cal = cal;
      const script = document.createElement('script');
      script.src = origin + '/embed/embed.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  trigger.addEventListener('click', async event => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (trigger.getAttribute('aria-busy') === 'true') return;
    trigger.setAttribute('aria-busy', 'true');
    try {
      embed ??= loadEmbed();
      await embed;
      window.Cal('modal', {
        calLink: calendar.pathname.slice(1) + calendar.search,
        config: { layout, useSlotsViewOnSmallScreen: 'true' }
      });
    } catch {
      embed = undefined;
      location.assign(calendar.href);
    } finally {
      trigger.removeAttribute('aria-busy');
    }
  });
})();
