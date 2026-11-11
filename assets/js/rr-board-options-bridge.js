    /* Original menu actions and map selector remain in the DOM so all of the
       existing gameplay listeners work. This compact menu delegates to them. */
    (() => {
      const menu = document.getElementById('rrBoardOptions');
      const compactMap = document.getElementById('rrBoardOptionsMap');
      const originalMap = document.getElementById('mapThemeLive');
      if (!menu || !compactMap || !originalMap) return;
      compactMap.innerHTML = originalMap.innerHTML;
      function syncMap() { compactMap.value = originalMap.value; }
      menu.addEventListener('toggle', () => { if (menu.open) syncMap(); });
      originalMap.addEventListener('change', syncMap);
      compactMap.addEventListener('change', () => {
        originalMap.value = compactMap.value;
        originalMap.dispatchEvent(new Event('change', {bubbles:true}));
      });
      menu.querySelectorAll('[data-proxy]').forEach(button => {
        button.addEventListener('click', () => {
          const original = document.getElementById(button.dataset.proxy);
          menu.open = false;
          original?.click();
        });
      });
      document.addEventListener('pointerdown', (event) => {
        if (menu.open && !menu.contains(event.target)) menu.open = false;
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') menu.open = false;
      });
      syncMap();
    })();
  
