    (function () {
      'use strict';
      const game = document.getElementById('gameScreen');
      const row = game?.querySelector('.sidebar>.game-panel:first-child .roll-row');
      const panel = document.getElementById('rrAbilityPanel');
      if (!game || !row || !panel) return;
      const openBtn = document.createElement('button');
      openBtn.type = 'button'; openBtn.id = 'rrPowerToggle'; openBtn.textContent = '⚡ Powers';
      openBtn.setAttribute('aria-controls', 'rrAbilityPanel'); openBtn.setAttribute('aria-expanded', 'false');
      row.appendChild(openBtn);
      const backdrop = document.createElement('button'); backdrop.type = 'button'; backdrop.id = 'rrPowersBackdrop'; backdrop.setAttribute('aria-label', 'Close powers');
      const closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.id = 'rrPowersClose'; closeBtn.textContent = '✕ Close';
      document.body.append(backdrop, closeBtn);
      const close = () => { document.body.classList.remove('rr-powers-open'); openBtn.setAttribute('aria-expanded', 'false'); if (panel.parentElement === document.body) row.insertAdjacentElement('afterend', panel); };
      const toggle = () => {
        if (game.classList.contains('rr-math-focus') || game.classList.contains('rr-finish-focus')) return;
        if (document.body.classList.contains('rr-powers-open')) { close(); return; } document.body.appendChild(panel); const newVal = document.body.classList.toggle('rr-powers-open'); openBtn.setAttribute('aria-expanded', String(newVal));
      };
      openBtn.addEventListener('click', toggle);
      backdrop.addEventListener('click', close); closeBtn.addEventListener('click', close);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close() });
      // When a power is activated, close the drawer before any target/dialog popup.
      panel.addEventListener('click', e => { if (e.target.closest('button[data-power],button[data-item],#rrAbilityHelp')) queueMicrotask(close) });
      document.getElementById('rollBtn')?.addEventListener('click', close);
      document.getElementById('menuBtn')?.addEventListener('click', close);
      document.getElementById('gameSetupBtn')?.addEventListener('click', close);
      document.getElementById('settingsBtn')?.addEventListener('click', close);
      new MutationObserver(() => { if (game.classList.contains('rr-math-focus') || game.classList.contains('rr-finish-focus') || game.classList.contains('hidden')) close() }).observe(game, { attributes: true, attributeFilter: ['class'] });
      // The existing start/play-again click handlers now resolve the wrapped startGame,
      // so the Balanced Powers module can initialize its per-player state.
    })();

  
