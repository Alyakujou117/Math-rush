    /* Radical Rush Expedition Edition: additive upgrades over the existing game. */
    (function () {
      'use strict';
      const by = id => document.getElementById(id);
      const KEY = 'radical-rush-classroom-questions-v3', ANIM_KEY = 'radical-rush-animation-speed-v1';
      const worldNames = { temple: 'Ancient Temple', forest: 'Emerald Wilds', frost: 'Frost Citadel', volcano: 'Ember Forge', cosmos: 'Star Observatory', atlantis: 'Sunken Kingdom' };
      const sceneProps = { temple: ['🏺', '⚱', '◈', '♜'], forest: ['🌲', '🌿', '🍄', '✿'], frost: ['❄', '✧', '❅', '◆'], volcano: ['🔥', '◆', '✦', '♨'], cosmos: ['✦', '✧', '✶', '☄'], atlantis: ['🐚', '🪸', '◌', '◈'] };
      const defaultExplanations = [
        'The exponent 1/2 means square root. √9 = 3 because 3 × 3 = 9.',
        'The exponent 1/3 means cube root. ∛8 = 2 because 2 × 2 × 2 = 8.',
        'The square root of 36 is 6, since 6² = 36.',
        'A power of 1/2 means the square root: 16^(1/2) = √16.',
        '√25 = 5 because 5² = 25.',
        '∛27 = 3 because 3³ = 27.',
        'First take the square root of 4, which is 2. Then cube: 2³ = 8.',
        '√49 = 7, since 7 × 7 = 49.',
        'A cube root is the same as a power of 1/3: ∛x = x^(1/3).',
        '∛27 = 3 because 3³ = 27.',
        'The principal square root of 81 is 9 because 9² = 81.',
        '16^(1/4) asks for the fourth root. Since 2⁴ = 16, the answer is 2.',
        'Factor 72 = 36 × 2. Then √72 = √36 × √2 = 6√2.',
        'Take the fourth root of 16 first (2), then cube: 2³ = 8.',
        'Factor 54 = 27 × 2. Then ∛54 = ∛27 × ∛2 = 3∛2.',
        'Factor 50 = 25 × 2. Therefore √50 = 5√2.',
        'The fifth root of 32 is 2. Square it: 2² = 4.',
        'Factor 98 = 49 × 2. √98 = 7√2.',
        '√12 = 2√3 and √27 = 3√3. Add like radicals: 5√3.',
        'The fourth root of 81 is 3. Cube it: 3³ = 27.',
        '√18 = 3√2 and √8 = 2√2. Adding gives 5√2.',
        '16 = 8 × 2. ∛16 = ∛8 × ∛2 = 2∛2.',
        'The cube root of 64 is 4. Then square it: 4² = 16.',
        '75 = 25 × 3, so √75 = 5√3.',
        'First simplify √12 to 2√3. (√3 + 2√3)² = (3√3)² = 27.',
        '125^(2/3) = (∛125)² = 5² = 25. A negative exponent takes the reciprocal: 1/25.',
        '√48 × √3 = √144 = 12.',
        'Use (a+b)(a−b) = a²−b²: (√5)²−(√2)² = 5−2 = 3.',
        '81^(3/4) = (⁴√81)³ = 3³ = 27. Take the reciprocal: 1/27.',
        '(3√2)(2√8) = 6√16 = 6 × 4 = 24.',
        'Combine the radicals: √27 / √3 = √(27/3) = √9 = 3.',
        '32^(3/5) = (⁵√32)³ = 2³ = 8. With a negative exponent, the result is 1/8.',
        '√7 + √7 = 2√7. Then (2√7)² = 4 × 7 = 28.',
        '√200 = 10√2 and √32 = 4√2. Subtract: 6√2.',
        '(√6)⁴ = ((√6)²)² = 6² = 36.',
        '16^(3/2) = (√16)³ = 4³ = 64. Negative exponent: reciprocal 1/64.'
      ];
      const ORIGINAL_BANK = Object.values(questions).flat().map((q, i) => [q[0], q[1], [...q[2]], q[3] || defaultExplanations[i] || 'Use the rules of radical expressions and rational exponents.']);
      function validQuestion(q) { return Array.isArray(q) && q.length >= 3 && typeof q[0] === 'string' && typeof q[1] === 'string' && Array.isArray(q[2]) && q[2].length === 3 && [q[0], q[1], ...q[2]].every(x => typeof x === 'string' && x.trim().length > 0 && x.length < 420) && new Set([q[1], ...q[2]]).size === 4; }
      function normalizeQuestion(q) { return [q[0].trim(), q[1].trim(), q[2].map(x => x.trim()), typeof q[3] === 'string' ? q[3].trim().slice(0, 1200) : 'Apply the relevant exponent or radical rule and simplify step by step.']; }
      let activeBank = ORIGINAL_BANK.map(normalizeQuestion);
      try {
        const parsed = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 300 && parsed.every(validQuestion)) {
          // Keep any teacher-edited saved questions, then add the missing verified stock questions.
          // Previously saved banks can contain 36 or 150 prompts in a DIFFERENT order
          // from the new 300-question easy/medium/hard interleaving.
          const verifiedByPrompt = new Map(ORIGINAL_BANK.map(q => [q[0], q]));
          const restored = parsed.map(q => {
            const output = normalizeQuestion(q);
            const verified = verifiedByPrompt.get(output[0]);
            if (verified && output[1] === verified[1] &&
                /^Write (?:∛x|the (?:square|cube|fourth|fifth|sixth|seventh) root of x)/.test(output[0])) {
              // These seven original questions had two mathematically equal distractors.
              output[2] = verified[2].slice();
            }
            if (!q[3] && verified) output[3] = verified[3];
            return output;
          });
          const existingPrompts = new Set(restored.map(q => q[0]));
          const missing = ORIGINAL_BANK.filter(q => !existingPrompts.has(q[0]));
          // Never discard a teacher-authored question; include new questions where space permits.
          activeBank = restored.concat(missing.map(normalizeQuestion)).slice(0, 300);
        }
      } catch (_) { }
      function syncBank() { questions.easy = activeBank.map(q => [q[0], q[1], [...q[2]], q[3]]); questions.medium = []; questions.hard = []; questionDeck = shuffle(questions.easy.slice()); questionSequence = 0; }
      syncBank();

      let rrSpeed = 'normal'; try { const saved = localStorage.getItem(ANIM_KEY); if (['fast', 'normal', 'cinematic'].includes(saved)) rrSpeed = saved; } catch (_) { }
      function rrSpeedFactor() { return { fast: .65, normal: 1, cinematic: 1.48 }[rrSpeed] || 1; }
      const rrSpeedInput = document.getElementById('settingAnimationSpeed'); if (rrSpeedInput) { rrSpeedInput.value = rrSpeed; rrSpeedInput.addEventListener('change', () => { rrSpeed = rrSpeedInput.value; try { localStorage.setItem(ANIM_KEY, rrSpeed) } catch (_) { } }); }

      const basePlayFrames = playFrames;
      playFrames = function (node, frames, options, essential = false) { const opt = { ...options }; if (typeof opt.duration === 'number') opt.duration = Math.round(opt.duration * rrSpeedFactor()); return basePlayFrames(node, frames, opt, essential); };
      // Gameplay state: rewards are collected once per board and shields are single-use.
      let treasureTiles = {}, collected = new Set(), playerItems = [], playerStats = [], gameStartedAt = 0, questionHistory = [];
      window.rrExpeditionBridge = { reset: newStats, roll: (p) => { if (playerStats[p]) playerStats[p].rolls++; }, hasShield: (p) => !!playerItems[p]?.shields, useShield: (p) => { if (playerItems[p]?.shields) { playerItems[p].shields--; if (playerStats[p]) playerStats[p].shieldsUsed++; updateExpedition(); } }, getTreasures: () => treasureTiles, isCollected: n => collected.has(n), getItems: () => playerItems, refresh: () => updateExpedition(), claimTreasure: (n, p) => { if (!treasureTiles[n] || collected.has(n) || !playerItems[p]) return false; collected.add(n); if (treasureTiles[n] === 'shield' && playerItems[p].shields < 3) playerItems[p].shields++; else playerItems[p].coins += 10; if (playerStats[p]) playerStats[p].treasures++; updateExpedition(); return true; } };
      window.rrExpeditionBridge.recordFaithPrize = p => { if (playerStats[p]) playerStats[p].treasures++; updateExpedition(); };
      // Shared prize entry point for the animated chest roulette. Always resolve the
      // reward exactly once before ending the landing, so the old collectors skip it.
      window.rrExpeditionBridge.claimPrize = function (tile, player, reward) {
        if (!treasureTiles[tile] || collected.has(tile) || !playerItems[player]) return null;
        const gear = playerItems[player], ability = window.rrAbilityEngine, inventory = ability?.getState?.()?.data?.[player]?.inventory;
        const rewards = ['boots', 'reflect', 'freeze', 'lucky']; let actual = reward;
        if (rewards.includes(actual) && (!inventory || inventory.length >= 2)) actual = 'coins';
        if (actual === 'shield' && gear.shields >= 3) actual = 'coins';
        if (!['shield', 'coins', ...rewards].includes(actual)) actual = 'coins';
        collected.add(tile);
        if (actual === 'shield') gear.shields++;
        else if (actual === 'coins') gear.coins += 10;
        else ability.grantItem(actual, player);
        if (playerStats[player]) playerStats[player].treasures++;
        updateExpedition(); return actual;
      };
      function newStats() { playerItems = players.map(() => ({ coins: 0, shields: 0 })); playerStats = players.map(() => ({ rolls: 0, correct: 0, wrong: 0, portals: 0, dragonHits: 0, treasures: 0, shieldsUsed: 0 })); questionHistory = []; gameStartedAt = Date.now(); }
      function buildTreasure() {
        // No separate chest/dragon squares: all random events are through portals.
        treasureTiles = {}; collected.clear();
      }
      // Reuse the original chest prize inventory system from any portal encounter.
      window.rrExpeditionBridge.claimPortalPrize = function (player, reward) {
        if (!playerItems[player]) return null;
        const gear = playerItems[player], ability = window.rrAbilityEngine;
        const inventory = ability?.getState?.()?.data?.[player]?.inventory;
        const itemIds = ['boots', 'reflect', 'freeze', 'lucky'];
        let actual = reward;
        if (itemIds.includes(actual) && (!inventory || inventory.length >= 2)) actual = 'coins';
        if (actual === 'shield' && gear.shields >= 3) actual = 'coins';
        if (!['shield', 'coins', ...itemIds].includes(actual)) actual = 'coins';
        if (actual === 'shield') gear.shields++;
        else if (actual === 'coins') gear.coins += 10;
        else ability.grantItem(actual, player);
        if (playerStats[player]) playerStats[player].treasures++;
        updateExpedition(); return actual;
      };

      const baseGenerate = generateBoard;
      generateBoard = function (...a) { const out = baseGenerate(...a); buildTreasure(); return out; };
      const baseStart = startGame;
      startGame = function (...a) { const out = baseStart(...a); newStats(); renderStandings(); drawBoard(); updateExpedition(); return out; };
      const baseDraw = drawBoard;
      drawBoard = function (...a) { const out = baseDraw(...a); decorateWorld(); return out; };
      function activeWorld() { return document.body.dataset.boardTheme || 'temple'; }
      function decorateWorld() {
        const board = by('board'); if (!board || !board.children.length) return;
        const world = activeWorld(), props = sceneProps[world] || sceneProps.temple;
        board.querySelectorAll('.tile[data-tile]').forEach(tile => {
          const n = Number(tile.dataset.tile); if (!n) return;
          if ((n % 13 === 6 || n % 17 === 10) && n !== gameLength) { tile.classList.add('terrain-bridge'); tile.dataset.elevation = 'bridge'; }
          else if (n % 9 === 4) { tile.classList.add('terrain-rise'); }
          if (n % 7 === 4 && !jumps[n] && !treasureTiles[n]) {
            const plant = document.createElement('span'); plant.className = 'expedition-prop'; plant.setAttribute('aria-hidden', 'true'); plant.textContent = props[n % props.length]; tile.append(plant);
          }
          if (jumps[n]) {
            const special = tile.querySelector('.tile-special'); if (special) {
              special.classList.add(jumps[n] > n ? 'realm-portal' : 'realm-dragon');
              const structure = document.createElement('span'); structure.className = jumps[n] > n ? 'portal-arch' : 'dragon-perch'; structure.setAttribute('aria-hidden', 'true');
              special.prepend(structure);
            }
          }
          if (n === gameLength) { const arch = document.createElement('span'); arch.className = 'finish-arch'; arch.setAttribute('aria-hidden', 'true'); arch.textContent = '✦'; tile.append(arch); }
          if (treasureTiles[n]) {
            const item = document.createElement('span'); item.className = 'treasure-object' + (collected.has(n) ? ' treasure-claimed' : ''); item.setAttribute('aria-label', collected.has(n) ? 'Prize chest opened' : 'Unopened prize chest'); item.setAttribute('title', collected.has(n) ? 'Prize chest already opened' : 'Prize chest: reveal a random reward (coins or dragon shield)');
            item.textContent = collected.has(n) ? '✓' : '🎁'; tile.append(item);
            tile.classList.add('treasure-tile');
          }
        });
      }
      // The theme switcher changes scenery without regenerating the route.
      ['settingMapTheme', 'mapThemeLive'].forEach(id => by(id)?.addEventListener('change', () => requestAnimationFrame(() => { drawBoard(); updateExpedition(); })));
      document.querySelectorAll('input[name="mapTheme"]').forEach(el => el.addEventListener('change', () => requestAnimationFrame(() => drawBoard())));
      const baseSparkle = sparkleAt;
      sparkleAt = function (tile, kind = 'step') { const r = baseSparkle(tile, kind); if (kind === 'step' && motionOn()) { const p = tileCenter(tile); if (p) { const dust = document.createElement('span'); dust.className = 'step-dust'; dust.style.left = p.x + 'px'; dust.style.top = (p.y + 10) + 'px'; by('board').append(dust); later(() => dust.remove(), 520); } } return r; };
      const baseSafe = showSafeLanding;
      showSafeLanding = function (tile) {
        if (phase === 'moving' && treasureTiles[tile] && !collected.has(tile)) {
          collected.add(tile); const item = playerItems[turn], st = playerStats[turn];
          if (item && st) {
            st.treasures++; const reward = (treasureTiles[tile] === 'shield' && item.shields < 3) ? 'shield' : 'coins'; if (reward === 'shield') { item.shields++; log('🎁 ' + nameOf(turn) + ' opened a prize chest and found a Dragon Shield!'); }
            else { item.coins += 10; log('🎁 ' + nameOf(turn) + ' opened a prize chest and collected 10 expedition coins!'); }
            sound('good'); announceLoot(reward); drawBoard();
          }
        }
        const r = baseSafe(tile); updateExpedition(); return r;
      };
      function announceLoot(kind) {
        const banner = document.createElement('div'); banner.className = 'loot-toast'; banner.textContent = kind === 'shield' ? '🛡️ DRAGON SHIELD EARNED!' : '+10 ✨ TREASURE COINS!'; by('board').append(banner);
        later(() => banner.remove(), 1700);
      }
      const baseRenderStandings = renderStandings;
      renderStandings = function (...a) { const r = baseRenderStandings(...a); updateExpedition(); return r; };
      function ensureExpeditionPanels() {
        const standings = by('standings'); if (!standings) return;
        if (!by('expeditionProgress')) {
          const wrap = document.createElement('div'); wrap.id = 'expeditionProgress'; wrap.className = 'expedition-progress'; wrap.setAttribute('aria-label', 'Player race progress');
          standings.after(wrap);
        }
        if (!by('expeditionTreasureGuide')) { const legend = by('board')?.parentElement?.querySelector('.legend'); if (legend) { const tag = document.createElement('span'); tag.id = 'expeditionTreasureGuide'; tag.className = 'badge'; tag.textContent = '🌀 Portal: Ladder / Lair / Chest'; legend.append(tag); } }
        if (!by('expeditionLoot')) {
          const badge = document.createElement('div'); badge.id = 'expeditionLoot'; badge.className = 'expedition-loot';
          by('status')?.after(badge);
        }
      }
      function updateExpedition() {
        if (!players.length) return; ensureExpeditionPanels(); const progress = by('expeditionProgress'), loot = by('expeditionLoot'); if (!progress || !loot) return;
        progress.replaceChildren(); const head = document.createElement('div'); head.className = 'expedition-head'; head.innerHTML = '<b>EXPEDITION TRACKER</b><span>START → FINISH</span>'; progress.append(head);
        players.forEach((p, i) => {
          const row = document.createElement('div'); row.className = 'expedition-progress-row'; const label = document.createElement('div'); label.className = 'progress-label';
          const name = document.createElement('span'); name.textContent = p.name; const val = document.createElement('span'); val.textContent = positions[i] + '/' + gameLength;
          label.append(name, val); const rail = document.createElement('div'); rail.className = 'progress-rail'; const fill = document.createElement('div'); fill.className = 'progress-fill'; fill.style.width = Math.max(0, Math.min(100, (positions[i] - 1) / (gameLength - 1) * 100)) + '%'; fill.style.background = p.color;
          rail.append(fill); row.append(label, rail); if (i === turn) row.classList.add('progress-active'); progress.append(row);
        });
        const gear = playerItems[turn] || { coins: 0, shields: 0 }; loot.textContent = window.rrFaithChests?.summary?.(turn) || '🎁 Chest of Faith · Rewards and tools';
      }
      const baseAnimateSpecial = animateSpecial;
      animateSpecial = async function (from, to, player, epoch) {
        if (to < from) { by('board')?.querySelector(`[data-tile="${from}"] .realm-dragon`)?.classList.add('guardian-attacking'); }
        const ok = await baseAnimateSpecial(from, to, player, epoch);
        if (ok && playerStats[player]) { if (to > from) playerStats[player].portals++; else playerStats[player].dragonHits++; }
        updateExpedition(); return ok;
      };
      const baseSubmit = submitAnswer;
      submitAnswer = async function (value) {
        if (phase !== 'answer' || !pending) return;
        const player = turn, q = pending.q, correct = value === q[1], kind = 'Portal / ' + (pending.portalOutcome || 'mystery');
        const st = playerStats[player]; if (st) { if (correct) st.correct++; else st.wrong++; }
        questionHistory.push({ player, kind, prompt: q[0], correct: q[1], chosen: value ?? 'No answer', wasCorrect: correct, explanation: q[3] || 'Use properties of rational exponents and radicals.' });
        const r = await baseSubmit(value);
        const box = by('solutionReveal'); if (box && currentScreen === 'game' && phase === 'feedback') {
          box.classList.remove('hidden'); const result = box.querySelector('strong'); const expl = box.querySelector('p');
          result.textContent = correct ? '✓ Correct solution' : 'Step-by-step review'; expl.innerHTML = format(q[3] || 'Use the exponent and radical rules to simplify the expression.');
        }
        updateExpedition(); return r;
      };
      // Existing logic in submitAnswer handles shield protection (patch in the core branch).
      const baseClearQuestion = clearQuestionUI;
      clearQuestionUI = function (...a) { const r = baseClearQuestion(...a); by('solutionReveal')?.classList.add('hidden'); return r; };
      const baseSetReady = setReadyPanel;
      setReadyPanel = function (...a) { const r = baseSetReady(...a); by('solutionReveal')?.classList.add('hidden'); return r; };
      const baseNext = nextTurn;
      nextTurn = function (...a) { const result = baseNext(...a); showNextPlayerCue(); updateExpedition(); return result; };
      function showNextPlayerCue() {
        const ribbon = by('turnRibbon'); if (!ribbon) return; ribbon.classList.remove('next-hero-pulse'); void ribbon.offsetWidth; ribbon.classList.add('next-hero-pulse');
      }
      const baseVictory = showVictory;
      showVictory = function (player) { const r = baseVictory(player); createFinishCeremony(player); return r; };
      function createFinishCeremony(winner) {
        const panel = by('winner'); if (!panel) return;
        panel.querySelector('.victory-stats')?.remove();
        const summary = document.createElement('div'); summary.className = 'victory-stats';
        const title = document.createElement('h3'); title.textContent = '🏁 FINISH LINE · RACE RESULTS'; summary.append(title);
        [...players.keys()].sort((a, b) => positions[b] - positions[a] || a - b).forEach((i, place) => {
          const p = players[i], s = playerStats[i] || {}, item = playerItems[i] || {};
          const line = document.createElement('div'); line.className = 'victory-stat-row';
          const rank = document.createElement('b'); rank.textContent = (i === winner ? '🏆' : place === 1 ? '🥈' : place === 2 ? '🥉' : '★') + ' ' + p.name;
          const desc = document.createElement('span'); desc.textContent = `Tile ${positions[i]} · ${s.correct || 0} right / ${s.wrong || 0} wrong · ${s.portals || 0} portals · ${item.shields || 0} legacy shields`;
          line.append(rank, desc); summary.append(line);
        });
        const more = document.createElement('p'); more.className = 'muted'; more.textContent = 'Results also include every answered math question in the post-game review.'; summary.append(more);
        const show = document.createElement('button'); show.className = 'btn secondary sm'; show.type = 'button'; show.textContent = 'View full race report'; show.addEventListener('click', showRaceReport); summary.append(show);
        panel.querySelector('#playAgain')?.before(summary);
        const board = by('board'); board?.querySelector(`[data-tile="${gameLength}"]`)?.classList.add('finish-celebrating');
        for (let i = 0; i < 22; i++) {
          const bit = document.createElement('span'); bit.className = 'winner-confetti'; bit.style.left = (5 + Math.random() * 90) + '%'; bit.style.animationDelay = (Math.random() * 1.2) + 's'; bit.style.setProperty('--bit-color', players[i % players.length].color); panel.append(bit); later(() => bit.remove(), 3600);
        }
      }
      function showRaceReport() {
        const rows = players.map((p, i) => { const s = playerStats[i] || {}, it = playerItems[i] || {}; return `${p.name}: ${s.rolls || 0} rolls; ${s.correct || 0} correct; ${s.wrong || 0} wrong; ${s.portals || 0} portals; ${s.dragonHits || 0} dragon hits; ${s.treasures || 0} treasures; ${s.shieldsUsed || 0} shields used; Chest of Faith rewards earned.`; });
        const lines = questionHistory.map((h, i) => `${i + 1}. ${players[h.player]?.name || 'Player'} (${h.kind}): ${h.prompt}\nAnswer: ${h.correct}; chosen: ${h.chosen}\n${h.explanation}`);
        const text = 'RADICAL RUSH · RACE REPORT\n' + new Date().toLocaleString() + '\n' + gameLength + '-tile race\n\n' + rows.join('\n') + '\n\nMATH QUESTION REVIEW\n' + (lines.join('\n\n') || 'No challenges were answered this match.');
        const dlg = by('raceReport'); dlg.querySelector('pre').textContent = text; dlg.classList.remove('hidden');
      }
      // Spin wheel: tapping the physical wheel rolls when the current player is ready.
      by('dice')?.addEventListener('click', () => { if (phase === 'roll' && !by('rollBtn').disabled) roll(); });
      if (by('dice')) { by('dice').tabIndex = 0; by('dice').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (phase === 'roll' && !by('rollBtn').disabled) roll(); } }); }
      document.addEventListener('keydown', e => { if (e.key === 'Escape') { by('raceReport')?.classList.add('hidden'); } });
      // Sound on collecting a shield is reusing the game's generated success tone.
      // Don't change movement penalties or the original 3-second handoff.
      requestAnimationFrame(() => { ensureExpeditionPanels(); updateExpedition(); });
    })();


    /* Inline extension bootstrapping */
    const rrDie = document.getElementById('dice');
    if (rrDie && !rrDie.parentElement.classList.contains('dice-tray')) {
      const tray = document.createElement('div'); tray.className = 'dice-tray'; tray.setAttribute('title', 'Tap the wheel to spin');
      rrDie.parentNode.insertBefore(tray, rrDie); tray.append(rrDie);
    }
    document.getElementById('closeRaceReport')?.addEventListener('click', () => document.getElementById('raceReport').classList.add('hidden'));
    document.getElementById('exportRaceReport')?.addEventListener('click', () => {
      const txt = document.querySelector('#raceReport pre')?.textContent || '';
      const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = 'radical-rush-race-report.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    const rrRollNumber = document.getElementById('turnCountdownNumber');
    if (rrRollNumber && document.getElementById('turnCountdown')) {
      const el = document.createElement('span'); el.className = 'countdown-player-preview'; el.textContent = 'Next adventurer is getting ready';
      document.getElementById('turnCountdown').append(el);
    }

  
