    /* RADICAL RUSH - Six biomes, six guardian designs, ONE unchanged setback mechanic.
       No external dependencies; all guardian art is original inline SVG. */
    (function () {
      'use strict';
      const GUARDIANS = {
        temple: { name: 'Stone Golem', short: 'GOLEM', glyph: '◆', burst: '✦', color: '#ffc674', description: 'Ancient stone protector of the Lost Temple' },
        forest: { name: 'Forest Troll', short: 'TROLL', glyph: '❧', burst: '❧', color: '#91f6a1', description: 'Moss-covered guardian of the Emerald Wilds' },
        frost: { name: 'Yeti', short: 'YETI', glyph: '❄', burst: '❄', color: '#d8f8ff', description: 'Snow guardian of the Frost Citadel' },
        volcano: { name: 'Lava Titan', short: 'TITAN', glyph: '✹', burst: '✹', color: '#ff8b55', description: 'Molten guardian of the Ember Forge' },
        cosmos: { name: 'Astral Warden', short: 'WARDEN', glyph: '✧', burst: '✧', color: '#dbb7ff', description: 'Celestial guardian of the Star Observatory' },
        atlantis: { name: 'Sea Serpent', short: 'SERPENT', glyph: '◌', burst: '≋', color: '#89f9eb', description: 'Ocean guardian of the Sunken Kingdom' }
      };
      const world = () => document.body.dataset.boardTheme in GUARDIANS ? document.body.dataset.boardTheme : 'temple';
      const guardian = () => GUARDIANS[world()];
      const shell = (body, extra = '') => `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="sh"><feGaussianBlur stdDeviation="1.4"/></filter>${extra}</defs><ellipse cx="64" cy="116" rx="43" ry="8" fill="#050e20" opacity=".4" filter="url(#sh)"/>${body}</svg>`;
      const art = {
        temple: shell(`<g stroke="#5a4338" stroke-width="5" stroke-linejoin="round"><path d="M24 74 10 65 7 84 25 99 37 92M104 74 118 65 121 84 103 99 91 92" fill="#a99a7e"/><path d="M29 61 18 36 36 22 49 33 79 33 92 22 109 36 99 61" fill="#c9b58f"/><path d="M31 75Q33 55 49 54h30q18 3 18 21l-6 33H37Z" fill="#a58f77"/><path d="M37 90 27 109 48 113 55 94M88 90 101 109 79 113 72 94" fill="#b9a889"/><path d="M27 28 40 14 86 14 100 28 93 69 35 69Z" fill="#cbbb9b"/><path d="M33 31h61l-4 10H37Z" fill="#e3d3b1"/></g><path d="M43 49h14l-6 7H42Zm26 0h16l1 7H75Z" fill="#3d2f35"/><path d="m57 43 7-13 7 13-7 17Z" fill="#f6c974" stroke="#a47b43" stroke-width="3"/><path d="M48 75h32l-16 26Z" fill="#e7c374" stroke="#614f3b" stroke-width="4"/><path d="m64 77-7 12 7 6 7-6Z" fill="#ffe49c"/>`),
        forest: shell(`<g stroke="#234a37" stroke-width="5" stroke-linejoin="round"><path d="M29 74 12 67l-8 14 22 21 18-12M99 74l16-7 9 14-22 21-18-12" fill="#60864c"/><path d="M39 67q-8 20-1 45h20l6-23 7 23h20q6-29-2-45Z" fill="#496f45"/><path d="M25 44q-15-9-17-28 27-2 39 18M102 44q15-9 17-28-27-2-39 18" fill="#68af5b"/><path d="M24 46q-5-33 22-35l18 9 19-9q26 5 22 35l-9 31q-29 24-65 0Z" fill="#7bab61"/><path d="M20 51q-19-15-16 9l22 15M108 51q19-15 16 9l-22 15" fill="#629c51"/></g><path d="M40 48 55 52 44 59 37 56Zm33 4 15-4 3 8-7 3Z" fill="#f7c66c"/><path d="M44 68q21 9 41 0" fill="none" stroke="#234a37" stroke-width="5" stroke-linecap="round"/><path d="m39 19-13-13M89 20l14-15" stroke="#4bd177" stroke-width="7" stroke-linecap="round"/><path d="M51 30q-2-18 12-23 12 8 10 23" fill="#b9ee89" stroke="#234a37" stroke-width="3"/><circle cx="64" cy="85" r="8" fill="#b3ef8d"/><path d="m60 80 4 11 4-11" stroke="#2d6546" stroke-width="3" fill="none"/>`),
        frost: shell(`<g stroke="#416b91" stroke-width="5" stroke-linejoin="round"><path d="M26 73 8 66 4 82l21 22 18-10M102 73l18-7 4 16-21 22-18-10" fill="#d6f5fb"/><path d="M36 72q-10 15-8 35l26 6 10-18 10 18 26-6q1-22-9-35Z" fill="#e4faff"/><path d="M31 36 18 15l29 9M96 36l13-21-28 9" fill="#e2f9ff"/><path d="M23 48q-1-37 41-40 42 3 41 40L94 79q-15 25-30 29-16-4-30-29Z" fill="#e8fcff"/><path d="M36 48q-11 22 1 34l12 9-8-26M92 48q11 22-1 34L79 91l8-26" fill="#bde2f0"/></g><path d="M42 49 56 46l-4 12-10-1Zm30-3 14 3v8l-10 1Z" fill="#27465c"/><ellipse cx="64" cy="66" rx="12" ry="8" fill="#92c6db"/><path d="M52 79q12 8 24 0" fill="none" stroke="#4a718d" stroke-width="4" stroke-linecap="round"/><path d="m54 95 10 13 10-13" fill="#c5eaf7" stroke="#416b91" stroke-width="3"/><path d="m18 39-6 10M110 39l6 10" stroke="#fff" stroke-width="5"/>`),
        volcano: shell(`<g stroke="#381d29" stroke-width="5" stroke-linejoin="round"><path d="M28 75 8 65 5 86l24 16 18-9M100 75l20-10 3 21-24 16-18-9" fill="#4a303b"/><path d="M34 69q-7 18-4 41l27 3 7-25 7 25 27-3q2-25-5-41Z" fill="#563040"/><path d="M22 48 11 28 40 28 43 10 64 26 85 10 88 28 116 28 105 48l-9 31H31Z" fill="#503440"/><path d="M28 39 20 10l23 18 21-25 21 25 23-18-8 30" fill="#ff973e" stroke="#ab392a"/></g><path d="m32 45 19 7-5 8-16-7Zm45 7 19-7 2 8-16 7Z" fill="#ffd078"/><path d="M47 74q17-8 34 0l-7 11H54Z" fill="#2b161f"/><path d="m64 35-9 14 7 11-4 12 10-9-4-13 9-11Z" fill="#ff7e34" stroke="#ffbc59" stroke-width="2"/><path d="m39 90 9 7-3 12m38-19-9 7 3 12" fill="none" stroke="#ff7135" stroke-width="5" stroke-linecap="round"/><path d="m18 60-5-14m101 14 5-14" stroke="#ffd06e" stroke-width="4"/>`),
        cosmos: shell(`<g stroke="#534598" stroke-width="5" stroke-linejoin="round"><path d="M27 74 7 68l9 24 21 6M101 74l20-6-9 24-21 6" fill="#8d7bce"/><path d="M29 78q6-23 35-29 29 6 35 29l-14 25H43Z" fill="#52448c"/><path d="M36 41q-8-27 28-35 36 8 28 35L80 74H48Z" fill="#7d67c5"/><path d="m33 26-6-16 23 10M95 26l6-16-23 10" fill="#a896e5"/></g><ellipse cx="64" cy="46" rx="27" ry="22" fill="#1e204d" stroke="#b49cff" stroke-width="4"/><path d="M64 22 69 38l17 8-17 6-5 18-6-18-17-6 17-8Z" fill="#ffe5a0"/><circle cx="64" cy="46" r="5" fill="#fff"/><ellipse cx="64" cy="48" rx="49" ry="14" transform="rotate(-21 64 48)" fill="none" stroke="#9ad9ff" stroke-width="4" opacity=".8"/><circle cx="103" cy="33" r="6" fill="#cfaeff"/><path d="m29 87 16-7 19 12 19-12 16 7-20 20H49Z" fill="#9a7de4" stroke="#493b94" stroke-width="4"/>`),
        atlantis: shell(`<g stroke="#135e72" stroke-width="5" stroke-linejoin="round"><path d="M83 80q43-1 35 25-12 17-30 2 16 1 12-12L75 92" fill="#32b7aa"/><path d="M36 74 17 61 13 85l26 17 16-13" fill="#55d9c6"/><path d="M33 74q5-24 20-31l11 3 14 11q18 21 9 45H56Z" fill="#37aaad"/><path d="M27 45Q19 9 53 11q25-13 45 16l-5 33-25 17-31-12Z" fill="#64dbc8"/><path d="M27 34 7 28 21 49M92 30l20-15-9 34" fill="#95f4e6"/></g><path d="m42 42 11 4-4 10-12-3Zm29 4 12-5 5 12-12 3Z" fill="#153e5b"/><path d="M48 64q16 9 29 0" stroke="#14627a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="m36 77 16 8-13 5m38-7 14-9-4 19" fill="#b0fff0" stroke="#258e98" stroke-width="3"/><circle cx="102" cy="14" r="6" fill="none" stroke="#d1ffff" stroke-width="3"/><circle cx="115" cy="37" r="4" fill="none" stroke="#d1ffff" stroke-width="2"/>`)
      };
      const lastClass = 'rr-guardian-temple rr-guardian-forest rr-guardian-frost rr-guardian-volcano rr-guardian-cosmos rr-guardian-atlantis';
      function applyGuardians() {
        const board = document.getElementById('board'); if (!board || !board.children.length) return;
        const type = world(), data = guardian();
        board.querySelectorAll('.tile[data-tile]').forEach(tile => {
          const n = Number(tile.dataset.tile);
          if (!Object.prototype.hasOwnProperty.call(jumps, n) || jumps[n] >= n) return;
          const special = tile.querySelector('.tile-special'); if (!special) return;
          special.classList.remove(...lastClass.split(' ')); special.classList.add('rr-guardian-special', 'rr-guardian-' + type);
          tile.classList.remove(...lastClass.split(' ')); tile.classList.add('rr-guardian-' + type);
          let figure = special.querySelector('.rr-dragon-guardian'); if (!figure) { figure = document.createElement('span'); special.append(figure); }
          figure.className = 'rr-dragon-guardian rr-realm-guardian';
          if (figure.dataset.guardian !== type) { figure.innerHTML = art[type]; figure.dataset.guardian = type; }
          let spark = special.querySelector('.rr-guardian-spark'); if (!spark) { spark = document.createElement('span'); spark.className = 'rr-guardian-spark'; spark.setAttribute('aria-hidden', 'true'); special.append(spark); }
          spark.textContent = data.glyph;
          special.style.setProperty('--rr-guardian-attack-color', data.color);
          tile.title = `Tile ${n}: ${data.name} challenge. Correct answer: escape safely. Wrong answer: move ${n - jumps[n]} tiles backward to tile ${jumps[n]}.`;
          tile.setAttribute('aria-label', `Tile ${n}, ${data.name} encounter, moves you back ${n - jumps[n]} tiles if your math answer is wrong`);
          special.setAttribute('role', 'img'); special.setAttribute('aria-label', data.name + ' guardian');
        });
        const routes = document.getElementById('routes');
        if (routes) {
          for (const route of routes.querySelectorAll('.route')) {
            if (!route.querySelector('b.minus')) continue;
            const label = route.querySelector('span'); if (!label) continue;
            const fromTo = (label.textContent || '').match(/\d+\s*[→-]\s*\d+/);
            if (fromTo) label.textContent = data.glyph + ' ' + fromTo[0];
            route.title = data.name + ' · wrong answer sends you backward';
          }
        }
      }
      function relabelChallenge() {
        const data = guardian(); if (phase !== 'answer' || !pending || !(jumps[pending.tile] < pending.tile)) return;
        const title = document.getElementById('challengeTitle'); if (title) title.textContent = data.glyph + ' ' + data.name + ' Challenge';
        const badge = document.getElementById('difficulty'); if (badge) badge.textContent = data.short;
        const topic = document.getElementById('topic'); if (topic) topic.textContent = `Tile ${pending.tile} · Correct → escape ${data.name} safely. Wrong → move ${pending.tile - jumps[pending.tile]} tiles backward.`;
        const status = document.getElementById('status'); if (status) status.textContent = `${players[turn]?.name || 'Player'}: solve the ${data.name} challenge!`;
      }
      const prevDraw = drawBoard;
      drawBoard = function (...args) { const r = prevDraw.apply(this, args); applyGuardians(); return r; };
      const prevStart = startGame;
      startGame = function (...args) { const r = prevStart.apply(this, args); requestAnimationFrame(applyGuardians); return r; };
      const prevChallenge = challenge;
      challenge = function (...args) { const r = prevChallenge.apply(this, args); relabelChallenge(); return r; };
      const prevAnswer = submitAnswer;
      submitAnswer = async function (...args) {
        const context = !!pending && jumps[pending.tile] < pending.tile;
        const creature = guardian().name;
        const result = await prevAnswer.apply(this, args);
        if (context) {
          for (const id of ['feedback', 'status']) {
            const el = document.getElementById(id); if (!el) continue;
            el.textContent = (el.textContent || '').replace(/dragon/gi, creature).replace(/🐉/g, guardian().glyph);
          }
        }
        return result;
      };
      const prevSpecial = animateSpecial;
      animateSpecial = async function (from, to, player, epoch) {
        const creature = guardian();
        const promise = prevSpecial.call(this, from, to, player, epoch);
        if (to < from) {
          const tile = document.querySelector(`#board [data-tile="${from}"]`);
          const burst = tile?.querySelector('.rr-dragon-fire'); if (burst) { burst.textContent = creature.burst; burst.style.setProperty('--rr-guardian-attack-color', creature.color); }
        }
        return await promise;
      };
      const prevReady = setReadyPanel;
      setReadyPanel = function (...args) { const r = prevReady.apply(this, args); const topic = document.getElementById('topic'); if (topic && phase !== 'answer') topic.textContent = 'Only mystery portals trigger math questions.'; return r; };
      document.getElementById('board')?.addEventListener('click', () => queueMicrotask(() => {
        const info = document.getElementById('tileInfo');
        if (info && /dragon/i.test(info.textContent || '')) info.textContent = info.textContent.replace(/dragon/gi, guardian().name);
      }));
      const applyDeferred = () => requestAnimationFrame(() => requestAnimationFrame(applyGuardians));
      new MutationObserver(applyDeferred).observe(document.body, { attributes: true, attributeFilter: ['data-board-theme'] });
      document.querySelectorAll('#mapThemeLive,#settingMapTheme,input[name="mapTheme"]').forEach(control => control.addEventListener('change', applyDeferred));
      window.rrBiomeGuardians = { get: () => ({ ...guardian(), theme: world() }), all: GUARDIANS, refresh: applyGuardians };
      applyDeferred();
    })();

  
