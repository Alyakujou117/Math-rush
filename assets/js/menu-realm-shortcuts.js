    /* Premium menu: decorative character previews + functioning realm shortcuts. */
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const heroIds = ['hoodie', 'astronaut-animated', 'dragon-animated', 'cowboy-animated', 'ninja-animated'];
      const getBank = (id) => ({
        'hoodie': typeof HERO_SPRITES !== 'undefined' ? HERO_SPRITES : null,
        'astronaut-animated': typeof ASTRONAUT_SPRITES !== 'undefined' ? ASTRONAUT_SPRITES : null,
        'dragon-animated': typeof DRAGON_HERO_SPRITES !== 'undefined' ? DRAGON_HERO_SPRITES : null,
        'cowboy-animated': typeof COWBOY_SPRITES !== 'undefined' ? COWBOY_SPRITES : null,
        'ninja-animated': typeof NINJA_SPRITES !== 'undefined' ? NINJA_SPRITES : null
      })[id];
      const lineup = $('rrMenuHeroLineup');
      if (lineup) {
        heroIds.forEach(id => {
          const bank = getBank(id), slot = document.createElement('div'); slot.className = 'rr-menu-character'; slot.dataset.hero = id;
          if (bank?.idle) { const img = document.createElement('img'); img.src = bank.idle; img.alt = ''; img.loading = 'eager'; img.decoding = 'async'; slot.appendChild(img) }
          lineup.appendChild(slot);
        });
      }
      const setup = $('rrSetupHeroes');
      if (setup) {
        ['hoodie', 'dragon-animated', 'ninja-animated'].forEach(id => {
          const bank = getBank(id); if (!bank?.idle) return;
          const img = document.createElement('img'); img.src = bank.idle; img.alt = ''; img.decoding = 'async'; setup.append(img);
        });
      }
      const names = { temple: 'THE LOST TEMPLE', forest: 'EMERALD WILDS', frost: 'FROST CITADEL', volcano: 'EMBER FORGE', cosmos: 'STAR OBSERVATORY', atlantis: 'SUNKEN KINGDOM' };
      const worlds = Object.keys(names);
      const choose = world => {
        const input = document.querySelector('input[name="mapTheme"][value="' + world + '"]');
        if (!input) return;
        input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true }));
        update();
      };
      const update = () => {
        const selected = document.querySelector('input[name="mapTheme"]:checked')?.value || 'temple';
        const world = worlds.includes(selected) ? selected : 'temple';
        const stage = document.querySelector('#menuScreen .rr-menu-stage');
        if (stage) stage.dataset.previewTheme = world;
        if ($('rrMenuCurrentRealm')) $('rrMenuCurrentRealm').textContent = names[world];
        const marker = document.querySelector('#menuScreen .rr-realm-marker');
        if (marker) marker.textContent = String(worlds.indexOf(world) + 1).padStart(2, '0') + ' / 06';
        document.querySelectorAll('[data-rr-world]').forEach(b => { b.classList.toggle('selected', b.dataset.rrWorld === world); b.setAttribute('aria-pressed', String(b.dataset.rrWorld === world)); });
      };
      document.querySelectorAll('#menuScreen [data-rr-world]').forEach(b => b.addEventListener('click', () => choose(b.dataset.rrWorld)));
      document.querySelectorAll('input[name="mapTheme"]').forEach(input => input.addEventListener('change', update));
      $('settingMapTheme')?.addEventListener('change', update);
      $('menuThemeBanner') && new MutationObserver(update).observe($('menuThemeBanner'), { childList: true, subtree: true, characterData: true });
      update();
    })();

  
