    (function () {
      'use strict';
      const game = document.getElementById('gameScreen');
      const ribbon = document.getElementById('turnRibbon');
      if (!game || !ribbon || document.getElementById('rrMobileInfoButton')) return;
      const button = document.createElement('button');
      button.type = 'button'; button.id = 'rrMobileInfoButton'; button.textContent = '☰ Race Info';
      button.setAttribute('aria-label', 'Open race information, map guide, and game controls');
      button.setAttribute('aria-haspopup', 'dialog');
      ribbon.appendChild(button);
      const dialog = document.createElement('dialog');
      dialog.id = 'rrMobileRaceDialog'; dialog.setAttribute('aria-label', 'Race information and map controls');
      dialog.innerHTML = `<div class="rr-info-head"><h2>Race info</h2><button type="button" class="rr-info-close">✕ Close</button></div>
    <div class="rr-info-section"><h3>Current world</h3><div class="rr-info-world"><span>Board theme</span><select id="rrMobileWorld" aria-label="Change board theme"></select></div></div>
    <div class="rr-info-section"><h3>Player progress</h3><div id="rrMobileProgressCopy"></div></div>
    <div class="rr-info-section"><h3>Portal treasure &amp; shields</h3><div id="rrMobileLootCopy"></div></div>
    <div class="rr-info-section"><details><summary>Mystery portals</summary><div id="rrMobileRoutes" class="rr-info-routes"></div></details>
      <p class="rr-info-note">Only portals trigger math challenges, each with Ladder, Dragon's Lair or Chest outcomes. Tap a tile to inspect it.</p></div>
    <div class="rr-info-actions"><button type="button" id="rrMobileRestart">↻ Restart</button><button type="button" id="rrMobilePlayers">Players</button></div>`;
      document.body.appendChild(dialog);
      function safeClone(sourceId, targetId) {
        const src = document.getElementById(sourceId), dest = document.getElementById(targetId);
        if (!src || !dest) return;
        const copy = src.cloneNode(true);
        copy.removeAttribute('id');
        copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        dest.replaceChildren(copy);
      }
      function refresh() {
        safeClone('expeditionProgress', 'rrMobileProgressCopy');
        safeClone('expeditionLoot', 'rrMobileLootCopy');
        const route = document.getElementById('routes');
        const routes = document.getElementById('rrMobileRoutes');
        if (route && routes) {
          routes.replaceChildren();
          for (const r of route.querySelectorAll('.route')) {
            const item = document.createElement('div');
            const label = document.createElement('span'); label.textContent = r.querySelector('span')?.textContent || r.textContent;
            const distance = document.createElement('strong'); distance.textContent = r.querySelector('b')?.textContent || '';
            item.append(label, distance); routes.append(item);
          }
        }
        const origin = document.getElementById('mapThemeLive'), world = document.getElementById('rrMobileWorld');
        if (origin && world) { world.innerHTML = origin.innerHTML; world.value = origin.value; }
      }
      button.addEventListener('click', () => {
        if (document.body.classList.contains('rr-powers-open')) document.getElementById('rrPowersClose')?.click();
        refresh(); if (!dialog.open) dialog.showModal();
      });
      dialog.querySelector('.rr-info-close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() });
      dialog.querySelector('#rrMobileWorld').addEventListener('change', event => {
        const origin = document.getElementById('mapThemeLive');
        if (origin) { origin.value = event.target.value; origin.dispatchEvent(new Event('change', { bubbles: true })); }
        refresh();
      });
      dialog.querySelector('#rrMobileRestart').addEventListener('click', () => { dialog.close(); document.getElementById('restartBtn')?.click() });
      dialog.querySelector('#rrMobilePlayers').addEventListener('click', () => { dialog.close(); document.getElementById('gameSetupBtn')?.click() });
      new MutationObserver(() => { if (game.classList.contains('hidden') && dialog.open) dialog.close() }).observe(game, { attributes: true, attributeFilter: ['class'] });
    })();

  
