    /* Branded startup scene; works for standalone file:// and extracted source. */
    (function () {
      'use strict';
      const boot = document.getElementById('rrBootScreen');
      if (!boot) return;
      const fill = document.getElementById('rrBootFill');
      const label = document.getElementById('rrBootMessage');
      const percent = document.getElementById('rrBootPercent');
      let current = 0, done = false;
      const start = performance.now();
      function show(n, msg) { if (done) return; current = Math.max(current, Math.min(100, n)); fill.style.width = current + '%'; percent.textContent = current + '%'; if (msg) label.textContent = msg; }
      function dismiss() { if (done) return; done = true; show(100, 'Ready'); fill.style.width = '100%'; percent.textContent = '100%'; label.textContent = 'Adventure ready!'; const elapsed = performance.now() - start; setTimeout(() => { boot.classList.add('rr-boot-finished'); boot.setAttribute('aria-hidden', 'true'); setTimeout(() => boot.remove(), 450); }, Math.max(120, (window.matchMedia?.('(min-width:900px) and (pointer:fine)')?.matches ? 1650 : 560) - elapsed)); }
      function prepare() {
        show(35, 'Preparing the six worlds…');
        const imgs = Array.from(document.querySelectorAll('#rrMenuHeroLineup img')).slice(0, 5);
        const imageReady = Promise.all(imgs.map(img => {
          if (img.complete) return Promise.resolve();
          if (typeof img.decode === 'function') return img.decode().catch(() => { });
          return new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); });
        }));
        show(72, 'Bringing heroes to life…');
        Promise.race([imageReady, new Promise(resolve => setTimeout(resolve, 1900))]).then(() => {
          show(95, 'Opening the portal…');
          requestAnimationFrame(() => requestAnimationFrame(dismiss));
        });
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepare, { once: true }); else prepare();
      // Don't trap the user behind a loader when a browser rejects a sprite.
      setTimeout(dismiss, 4500);
    })();

  
