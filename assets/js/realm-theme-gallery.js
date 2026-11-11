    /* Board theme gallery: purely decorative; does not change safe-tile rules. */
    (function () {
      'use strict';
      const worlds = { "temple": { "title": "The Lost Temple", "label": "ANCIENT RUINS", "tagline": "AN ANCIENT MAP AWAITS" }, "forest": { "title": "Emerald Wilds", "label": "ENCHANTED FOREST", "tagline": "ENTER THE LIVING WOODS" }, "frost": { "title": "Frost Citadel", "label": "FROZEN REALM", "tagline": "A KINGDOM OF ICE" }, "volcano": { "title": "Ember Forge", "label": "VOLCANIC LANDS", "tagline": "THE HEART OF THE VOLCANO" }, "cosmos": { "title": "Star Observatory", "label": "CELESTIAL MAP", "tagline": "FOLLOW THE STARS" }, "atlantis": { "title": "Sunken Kingdom", "label": "DEEP SEA RUINS", "tagline": "THE SUNKEN PATH" } };
      const themes = Object.keys(worlds);
      const icons = { temple: '🏛', forest: '🌿', frost: '❄', volcano: '🌋', cosmos: '✦', atlantis: '🐚' };
      const glyphs = { temple: ['✺', '◇', '⌘', '✧', '☼'], forest: ['❧', '✤', '❖', '✽', '✿'], frost: ['❄', '✧', '✦', '❅', '✳'], volcano: ['◆', '✦', '◇', '◈', '✸'], cosmos: ['✦', '✧', '✵', '✴', '✶'], atlantis: ['◈', '❖', '◇', '✥', '✧'] };
      const safeNames = { temple: '◆ Stone causeway', forest: '◆ Forest path', frost: '◆ Frost tiles', volcano: '◆ Obsidian stones', cosmos: '◆ Celestial tiles', atlantis: '◆ Sea-glass stones' };
      const $ = id => document.getElementById(id);
      let active = 'temple';
      try { const saved = localStorage.getItem('radical-rush-map-theme-v1'); if (themes.includes(saved)) active = saved; } catch (e) { }
      const selectors = [$('settingMapTheme'), $('mapThemeLive')].filter(Boolean);
      const radios = [...document.querySelectorAll('input[name="mapTheme"]')];
      function decorate() {
        const board = $('board'); if (!board) return;
        board.querySelectorAll('.tile.safe .ruins-rune').forEach((el, i) => {
          const n = Number(el.closest('.tile')?.dataset.tile) || i;
          el.textContent = glyphs[active][n % glyphs[active].length];
        });
        board.querySelectorAll('.tile.tile-void').forEach((tile, i) => {
          tile.textContent = glyphs[active][i % glyphs[active].length];
        });
      }
      function setWorld(which, persist = true) {
        active = themes.includes(which) ? which : 'temple';
        const map = worlds[active];
        document.body.dataset.boardTheme = active;
        selectors.forEach(select => { select.value = active; });
        radios.forEach(input => input.checked = input.value === active);
        if ($('mapThemeTitle')) $('mapThemeTitle').textContent = map.title;
        if ($('mapThemeTagline')) $('mapThemeTagline').textContent = map.tagline;
        if ($('mapThemeIcon')) $('mapThemeIcon').textContent = icons[active];
        if ($('boardThemeBadge')) { $('boardThemeBadge').textContent = icons[active] + ' ' + map.label; $('boardThemeBadge').setAttribute('aria-label', map.title + ' board theme'); }
        if ($('mapSafeLabel')) $('mapSafeLabel').textContent = safeNames[active];
        if ($('menuThemeBanner')) $('menuThemeBanner').textContent = icons[active] + ' ' + map.title + ' • 75 tiles default';
        document.querySelector('.hero-art')?.setAttribute('data-preview-theme', active);
        decorate();
        if (persist) { try { localStorage.setItem('radical-rush-map-theme-v1', active); } catch (e) { } }
      }
      radios.forEach(input => input.addEventListener('change', () => { if (input.checked) setWorld(input.value); }));
      selectors.forEach(select => select.addEventListener('change', () => setWorld(select.value)));
      // Existing drawBoard is wrapped by viewport sizing logic; retain that chain.
      if (typeof drawBoard === 'function') {
        const originalDraw = drawBoard;
        drawBoard = function (...args) { const result = originalDraw(...args); decorate(); return result; };
      }
      setWorld(active, false);
    })();

  
