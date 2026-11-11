    /* RADICAL RUSH | Adventure Visual Pack
     * Single-file-compatible, no external assets, no changed board mathematics.
     * Adds six distinct animated worlds, finish landmarks, guardian encounters,
     * the one-time prize roulette and animated answer explanations.
     */
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const worldInfo = {
        temple: { name: 'Lost Temple', symbol: '✦', props: ['torch', 'sand', 'torch', 'rune'], finish: 'Temple Altar' },
        forest: { name: 'Emerald Wilds', symbol: '❧', props: ['leaf', 'firefly', 'leaf', 'flower'], finish: 'Sacred Tree' },
        frost: { name: 'Frost Citadel', symbol: '❄', props: ['snow', 'crystal', 'snow', 'crystal'], finish: 'Crystal Palace' },
        volcano: { name: 'Ember Forge', symbol: '✹', props: ['ember', 'lava', 'ember', 'ember'], finish: 'Forge Gate' },
        cosmos: { name: 'Star Observatory', symbol: '✧', props: ['star', 'orbit', 'star', 'star'], finish: 'Astral Gateway' },
        atlantis: { name: 'Sunken Kingdom', symbol: '◌', props: ['bubble', 'coral', 'bubble', 'bubble'], finish: 'Coral Throne' }
      };
      const world = () => worldInfo[document.body.dataset.boardTheme] ? document.body.dataset.boardTheme : 'temple';
      const activeMotion = () => typeof motionOn === 'function' ? motionOn() : true;
      const spriteMarkup = `<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="dragonSkin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dbb3ff"/><stop offset="1" stop-color="#683bb4"/></linearGradient></defs><path d="M24 44 7 26Q2 6 28 24L37 9 47 28 65 12 64 34Q88 33 84 56L70 67 62 54Q48 79 27 68L16 77 18 61 7 58Z" fill="url(#dragonSkin)" stroke="#342058" stroke-width="4" stroke-linejoin="round"/><path d="M25 45 Q15 16 5 23M58 41Q76 18 84 43" fill="none" stroke="#f5c4ff" stroke-width="5" stroke-linecap="round"/><ellipse cx="33" cy="48" rx="4" ry="5" fill="#15152a"/><ellipse cx="56" cy="48" rx="4" ry="5" fill="#15152a"/><path d="M38 60Q45 65 52 60" fill="none" stroke="#25143a" stroke-width="3" stroke-linecap="round"/><path d="M30 29 23 18M56 31 63 18" stroke="#eacbff" stroke-width="6" stroke-linecap="round"/></svg>`;
      function landmarkMarkup(theme) {
        const base = {
          temple: '<path d="M14 74V28L45 10 76 28V74" fill="#bd9970" stroke="#644c35" stroke-width="5"/><path d="M21 27h48M33 73V41h24v32" stroke="#f8db93" stroke-width="8"/><path d="M17 77h60" stroke="#fff0ae" stroke-width="8"/>',
          forest: '<path d="M45 80V43" stroke="#765332" stroke-width="17" stroke-linecap="round"/><path d="M18 52Q-2 31 25 19 34 -4 49 15 65 4 76 26 99 50 71 56Z" fill="#4fd198" stroke="#165f50" stroke-width="6"/><circle cx="46" cy="36" r="12" fill="#d7ff9d" opacity=".75"/>',
          frost: '<path d="M14 77 25 34 35 45 45 10 55 45 66 27 77 77Z" fill="#c9efff" stroke="#4c87ba" stroke-width="5"/><path d="m45 10 8 42-8 26-8-26Z" fill="#8adbfc"/><path d="M12 78h68" stroke="#e9fcff" stroke-width="8"/>',
          volcano: '<path d="M17 78V28l16 8 12-23 12 23 17-8v50Z" fill="#5d3544" stroke="#ff8756" stroke-width="5"/><path d="M45 72V43m0 0-10 14 10-40 10 40Z" fill="#ffb25a" stroke="#f7df8c" stroke-width="5"/><path d="M14 80h62" stroke="#ffb15d" stroke-width="6"/>',
          cosmos: '<circle cx="45" cy="46" r="31" fill="#282952" stroke="#ad96ff" stroke-width="6"/><path d="M45 18 52 38 73 45 52 52 45 74 38 52 17 45 38 38Z" fill="#ffde92"/><circle cx="45" cy="45" r="7" fill="#fff"/>',
          atlantis: '<path d="M14 78Q5 30 28 30 31 11 45 12 59 11 62 30 85 30 76 78Z" fill="#50c4c8" stroke="#146d84" stroke-width="5"/><path d="M25 73V38m40 35V38M17 77h56" stroke="#d0ffff" stroke-width="7"/><circle cx="45" cy="43" r="10" fill="#fbe4ab"/>'
        };
        return `<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><filter id="rr-gate-glow"><feGaussianBlur stdDeviation="1.2"/></filter></defs>${base[theme] || base.temple}</svg>`;
      }
      const sceneHolder = document.createElement('div'); sceneHolder.className = 'rr-living-scene'; sceneHolder.setAttribute('aria-hidden', 'true');
      function drawScene() {
        const card = document.querySelector('#gameScreen .board-card'); if (!card) return;
        if (!sceneHolder.isConnected) card.prepend(sceneHolder);
        const t = world(), info = worldInfo[t]; if (sceneHolder.dataset.realm === t && sceneHolder.childElementCount === 13) return; sceneHolder.replaceChildren(); sceneHolder.dataset.realm = t;
        for (let i = 0; i < 13; i++) {
          const p = document.createElement('i'); p.className = 'rr-scenery rr-scenery-' + info.props[i % info.props.length];
          p.style.setProperty('--a', ((i * 41 + 9) % 100) + '%'); p.style.setProperty('--b', ((i * 29 + 13) % 100) + '%');
          p.style.setProperty('--delay', (i % 7 * -.58) + 's'); p.style.setProperty('--size', (8 + (i % 4) * 4) + 'px');
          p.textContent = info.symbol; sceneHolder.append(p);
        }
      }
      function decorateBoard() {
        const board = $('board'); if (!board || !board.children.length) return;
        const t = world(); drawScene();
        for (const tile of board.querySelectorAll('.tile[data-tile]')) {
          const n = Number(tile.dataset.tile);
          if (n === gameLength) {
            const old = tile.querySelector('.rr-finish-landmark'); if (old) old.remove();
            const mark = document.createElement('span'); mark.className = 'rr-finish-landmark'; mark.setAttribute('aria-hidden', 'true');
            mark.innerHTML = landmarkMarkup(t); tile.append(mark); tile.title = (tile.title || '') + ' · ' + worldInfo[t].finish;
          }
          if (jumps[n] && jumps[n] < n) {
            const special = tile.querySelector('.tile-special'); if (!special) continue;
            const figure = document.createElement('span'); figure.className = 'rr-dragon-guardian'; figure.setAttribute('aria-hidden', 'true'); figure.innerHTML = spriteMarkup;
            special.querySelector('.rr-dragon-guardian')?.remove(); special.append(figure);
          }
        }
      }
      const previousDraw = drawBoard;
      drawBoard = function (...args) { const result = previousDraw(...args); decorateBoard(); return result; };
      for (const el of document.querySelectorAll('#mapThemeLive,#settingMapTheme,input[name="mapTheme"]')) el.addEventListener('change', () => requestAnimationFrame(decorateBoard));
      const previousChallenge = challenge;
      challenge = function (...args) {
        const result = previousChallenge(...args); if (phase === 'answer' && pending) {
          const tile = $('board')?.querySelector(`[data-tile="${pending.tile}"]`);
          if (jumps[pending.tile] < pending.tile) { tile?.classList.add('rr-dragon-wakes'); setTimeout(() => tile?.classList.remove('rr-dragon-wakes'), 1250); }
          else tile?.classList.add('rr-gate-awake');
        } return result;
      };
      // Visual cue synchronized with the current animation; no change to positions.
      const oldSpecial = animateSpecial;
      animateSpecial = async function (from, to, player, epoch) {
        const tile = $('board')?.querySelector(`[data-tile="${from}"]`);
        if (to < from) {
          tile?.classList.add('rr-dragon-strikes'); const fire = document.createElement('div'); fire.className = 'rr-dragon-fire'; fire.textContent = '✹';
          tile?.append(fire); setTimeout(() => fire.remove(), 1000);
        } else tile?.classList.add('rr-portal-opening');
        return oldSpecial(from, to, player, epoch);
      };
      // Roulette rewards: actual reward is resolved once, then the underlying
      // expedition/abilities landing hooks run without collecting it again.
      let rollToken = 0, rouletteOpen = false;
      const oldStart = startGame;
      startGame = function (...args) { rollToken++; dismissRoulette(); const result = oldStart(...args); drawScene(); return result; };
      const rewardTypes = [
        { id: 'coins', name: '+10 Coins', icon: '◆', kind: 'coin' },
        { id: 'shield', name: 'Dragon Shield', icon: '⬡', kind: 'shield' },
        { id: 'boots', name: 'Speed Boots', icon: '➤', kind: 'item' },
        { id: 'reflect', name: 'Reflect Shield', icon: '◇', kind: 'item' },
        { id: 'freeze', name: 'Freeze Crystal', icon: '❄', kind: 'item' },
        { id: 'lucky', name: 'Lucky Dice', icon: '✦', kind: 'item' }
      ];
      const roulette = document.createElement('div'); roulette.id = 'rrPrizeOverlay'; roulette.className = 'rr-prize-overlay hidden';
      roulette.setAttribute('role', 'dialog'); roulette.setAttribute('aria-modal', 'true'); roulette.setAttribute('aria-label', 'Mystery chest reward');
      roulette.innerHTML = '<div class="rr-prize-card"><div class="rr-prize-heading">✦ MYSTERY TREASURE ✦</div><div class="rr-prize-description">What treasure will the chest reveal?</div><div class="rr-prize-reel"><div class="rr-prize-wheel-glyph">◆</div><div class="rr-prize-wheel-name">Spinning...</div></div><div class="rr-prize-trail"></div><button class="rr-prize-skip" type="button">Reveal now</button></div>';
      document.body.append(roulette);
      let resolveSpin = null;
      function dismissRoulette() { roulette.classList.add('hidden'); rouletteOpen = false; roulette.classList.remove('rr-prize-win'); resolveSpin?.(); resolveSpin = null; }
      const prevSafe = showSafeLanding;
      showSafeLanding = function (tile) {
        const chest = window.rrExpeditionBridge?.getTreasures?.()?.[tile];
        if (phase !== 'moving' || !chest || window.rrExpeditionBridge?.isCollected?.(tile) || rouletteOpen) return prevSafe(tile);
        const player = turn, epoch = gameEpoch, token = ++rollToken;
        rouletteOpen = true;
        const weights = ['coins', 'coins', 'coins', 'coins', 'shield', 'shield', 'boots', 'reflect', 'freeze', 'lucky'];
        const pick = weights[Math.floor(Math.random() * weights.length)];
        const result = rewardTypes.find(r => r.id === pick);
        const glyph = roulette.querySelector('.rr-prize-wheel-glyph'), name = roulette.querySelector('.rr-prize-wheel-name');
        roulette.classList.remove('hidden', 'rr-prize-win'); roulette.querySelector('.rr-prize-heading').textContent = '✦ MYSTERY TREASURE ✦';
        roulette.querySelector('.rr-prize-skip').textContent = 'Reveal now';
        const tickMs = activeMotion() ? 95 : 0;
        let stop = false, awarded = false, landed = false;
        function award() {
          if (awarded) return;
          awarded = true;
          const actual = window.rrExpeditionBridge?.claimPrize?.(tile, player, pick) || 'coins';
          const prize = rewardTypes.find(r => r.id === actual) || rewardTypes[0];
          glyph.textContent = prize.icon; name.textContent = prize.name;
          roulette.classList.add('rr-prize-win');
          roulette.querySelector('.rr-prize-heading').textContent = 'TREASURE UNLOCKED!';
          roulette.querySelector('.rr-prize-skip').textContent = 'Continue';
          sound('good');
          log('🎁 ' + nameOf(player) + ' won ' + prize.name + ' from a mystery chest!');
          renderStandings();
        }
        function finish() {
          if (landed || epoch !== gameEpoch || rollToken !== token) return;
          landed = true; dismissRoulette(); prevSafe(tile);
        }
        roulette.querySelector('.rr-prize-skip').onclick = () => {
          stop = true;
          if (epoch !== gameEpoch || rollToken !== token) return;
          award(); finish();
        };
        (async () => {
          for (let i = 0; i < (tickMs ? 17 : 0); i++) {
            if (stop || epoch !== gameEpoch || rollToken !== token) return;
            const look = rewardTypes[(i * 3 + Math.floor(i / 2)) % rewardTypes.length]; glyph.textContent = look.icon; name.textContent = look.name;
            if (i % 3 === 0) sound('diceTick');
            await new Promise(r => setTimeout(r, tickMs));
          }
          if (epoch !== gameEpoch || rollToken !== token || stop) return;
          award();
          await new Promise(r => setTimeout(r, activeMotion() ? 760 : 120));
          finish();
        })().catch(err => { console.error('Prize roulette recovered:', err); if (rollToken === token) { award(); finish(); } });

      };
      // Math review: accessible complete explanation plus staged, numbered worked steps.
      let mathToken = 0;
      const oldAnswer = submitAnswer;
      submitAnswer = async function (value) {
        const snapshot = pending?.q, epoch = gameEpoch;
        const result = await oldAnswer(value);
        if (epoch !== gameEpoch || !snapshot || phase !== 'feedback') return result;
        const box = $('solutionReveal'); if (!box || box.classList.contains('hidden')) return result;
        const original = box.querySelector('p'); if (!original) return result;
        const explanation = String(snapshot[3] || original.textContent || 'Apply the exponent and radical rules.');
        const pieces = explanation.split(/(?<=[.!?])\s+(?=[A-Z(√∛(])/).filter(Boolean);
        const steps = pieces.length ? pieces.slice(0, 5) : [explanation];
        if (steps.length === 1) { steps.unshift('Identify the exponent or radical property used in the expression.'); }
        if (steps.length < 3) { steps.push('Check: the correct answer is ' + String(snapshot[1]) + '.'); }
        const old = box.querySelector('.rr-math-steps'); old?.remove();
        const list = document.createElement('ol'); list.className = 'rr-math-steps'; list.setAttribute('aria-label', 'Step-by-step math solution');
        original.classList.add('rr-original-solution'); original.setAttribute('aria-label', explanation); original.innerHTML = format(explanation);
        const token = ++mathToken;
        steps.forEach((line, i) => {
          const li = document.createElement('li'); li.innerHTML = format(line); li.style.setProperty('--step-delay', (i * 260) + 'ms');
          list.append(li);
        });
        box.append(list);
        box.classList.add('rr-steps-visible');
        return result;
      };
      const oldClear = clearQuestionUI;
      clearQuestionUI = function (...args) { mathToken++; const box = $('solutionReveal'); box?.classList.remove('rr-steps-visible'); box?.querySelector('.rr-math-steps')?.remove(); return oldClear(...args); };
      requestAnimationFrame(() => { decorateBoard(); drawScene(); });
    })();

  
