    /* Global fullscreen action beside the audio button, using the existing game handler. */
    (function () {
      'use strict';
      const top = document.getElementById('rrTopFullscreenBtn');
      const original = document.getElementById('rrFullscreenBtn');
      if (!top) return;
      function sync() {
        const full = !!document.fullscreenElement;
        top.setAttribute('aria-label', full ? 'Exit fullscreen' : 'Enter fullscreen');
        top.setAttribute('aria-pressed', String(full));
        top.title = full ? 'Exit fullscreen' : 'Enter fullscreen';
        top.innerHTML = (full ? '⛶' : '⛶') + ' <span>' + (full ? 'Exit full screen' : 'Full screen') + '</span>';
      }
      top.addEventListener('click', async () => {
        if (original) { original.click(); return; }
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await document.documentElement.requestFullscreen();
        } catch (error) { console.warn('Fullscreen unavailable:', error); }
      });
      document.addEventListener('fullscreenchange', sync);
      document.addEventListener('fullscreenerror', sync);
      sync();
    })();

  
