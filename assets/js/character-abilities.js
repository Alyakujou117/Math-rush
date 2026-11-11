    /* RADICAL RUSH — BALANCED CHARACTER POWERS
     * One active skill and one automatic passive per hero, plus collectible items.
     * Entirely local/offline. Powers cannot finish a match or trigger extra board questions.
     */
    (function () {
      'use strict';
      const $rr = id => document.getElementById(id);
      const GAME = document.getElementById('gameScreen');
      const FIRST = GAME?.querySelector('.sidebar > .game-panel:first-child');
      const ROLL = FIRST?.querySelector('.roll-row');
      if (!GAME || !FIRST || !ROLL) return;
      const ICONS = { hoodie: '🧭', 'astronaut-animated': '🪐', 'dragon-animated': '🔥', 'cowboy-animated': '🤠', 'ninja-animated': '🥷' };
      const HEROES = {
        hoodie: {
          name: 'Green Adventurer', category: 'Explorer / Mobility', powers: [
            { id: 'trail', label: 'Trailblazer', icon: '👟', cooldown: 5, desc: 'ACTIVE · Your next spin gains +3 movement if you roll 6, or +2 if you roll below 6. Five complete own turns of cooldown.' }],
          passive: { id: 'scout', label: 'Second Chance', icon: '🧭', desc: 'PASSIVE · One extra attempt after a wrong math answer. Recharges after 7 complete own turns; timeouts do not activate it.' }
        },
        'astronaut-animated': {
          name: 'Blue Astronaut', category: 'Gravity / Defense', powers: [
            { id: 'gravity', label: 'Gravity Shift', icon: '🪐', cooldown: 7, desc: 'ACTIVE · Choose an opponent; their next wheel spin sends them backward instead of forward. Seven complete own turns of cooldown.' }],
          passive: { id: 'zero-g', label: 'Zero-G Shield', icon: '🛡️', desc: 'PASSIVE · Automatically block your first wrong-answer dragon setback each match. No item needed.' }
        },
        'dragon-animated': {
          name: 'Green Dragon', category: 'Attack / Resilience', powers: [
            { id: 'fireball', label: 'Fireball', icon: '🔥', cooldown: 3, desc: 'ACTIVE · Move any chosen opponent backward by 4 tiles, regardless of location. Three complete own turns of cooldown.' }],
          passive: { id: 'scales', label: 'Dragon Scales', icon: '🐲', desc: 'PASSIVE · Always active: 50% chance to reflect an opponent’s harmful ability or tool back to its user. Does not reflect lava puddles or beneficial buffs.' }
        },
        'cowboy-animated': {
          name: 'Cowboy Explorer', category: 'Disruption / Luck', powers: [
            { id: 'lasso', label: 'Lasso', icon: '🪢', cooldown: 5, desc: 'ACTIVE · Select an opponent ahead of you within the same 10-tile board row and pull them back onto your tile. Five complete own turns of cooldown.' }],
          passive: { id: 'quick-draw', label: 'Quick Draw', icon: '🎯', desc: 'PASSIVE · When your wheel lands on 1, gain +1 movement automatically (so you move 2, before other bonuses).' }
        },
        'ninja-animated': {
          name: 'Shadow Ninja', category: 'Speed / Evasion', powers: [
            { id: 'shadowstep', label: 'Shadow Step', icon: '💨', cooldown: 5, desc: 'ACTIVE · Gain +1 movement on this spin and protection against harmful board events, portals, attacks and tools until your next personal turn. Five complete own turns of cooldown.' }],
          passive: { id: 'smoke-veil', label: 'Smoke Veil', icon: '🌫️', desc: 'PASSIVE · Automatically block one harmful opponent character power. Recharges after 7 complete own turns.' }
        }
      };
      const ITEMS = [
        { id: 'boots', label: 'Speed Boots', icon: '👟', desc: 'Add +2 to the next roll (maximum 8).' },
        { id: 'reflect', label: 'Reflect Shield', icon: '🛡', desc: 'Bounce the next opponent movement attack back at the attacker.' },
        { id: 'freeze', label: 'Freeze Crystal', icon: '❄', desc: 'Make one opponent skip their next roll.' },
        { id: 'lucky', label: 'Lucky Spin', icon: '🎡', desc: 'Spin twice and choose one of the two results.' }
      ];
      const POWER_LOOKUP = Object.fromEntries(Object.values(HEROES).flatMap(h => h.powers).map(p => [p.id, p]));
      const ITEM_LOOKUP = Object.fromEntries(ITEMS.map(x => [x.id, x]));
      const EXP = () => window.rrExpeditionBridge;
      const panel = document.createElement('div'); panel.id = 'rrAbilityPanel'; panel.className = 'rr-ability-panel'; panel.setAttribute('aria-label', 'Character powers');
      ROLL.insertAdjacentElement('afterend', panel);
      const overlay = document.createElement('div'); overlay.id = 'rrAbilityOverlay'; overlay.className = 'rr-ability-overlay hidden';
      overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Choose an ability target');
      overlay.innerHTML = '<div class="rr-ability-dialog"><div class="rr-ability-dialog-top"><div><span class="rr-ability-eyebrow">CHARACTER POWER</span><h2 id="rrAbilityDialogTitle">Choose a target</h2></div><button type="button" class="rr-ability-close" id="rrAbilityCancel">✕</button></div><p id="rrAbilityDialogHelp"></p><div id="rrAbilityChoices"></div><div id="rrAbilityQuestionBox" class="hidden"></div></div>';
      document.body.append(overlay);
      const status = document.createElement('div'); status.id = 'rrAbilityToast'; status.className = 'rr-ability-toast hidden'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); document.body.append(status);
      const S = { data: [], turnCount: [], actionUsed: false, itemUsed: false, awaiting: false, epoch: 0, toastTimeout: null, powerEvents: [], itemDrops: new Map() };
      const name = p => players[p]?.name || `Player ${p + 1}`;
      const desc = p => HEROES[players[p]?.character] || HEROES.hoodie;
      const isGame = () => currentScreen === 'game' && players.length > 0;
      const canAct = () => isGame() && phase === 'roll' && !S.awaiting && !players[turn].cpu;
      const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
      const choice = (a) => a[Math.floor(Math.random() * a.length)];
      const copy = s => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
      const timeReady = (p, i) => S.turnCount[p] >= S.data[p].readyAt;
      function toast(msg, kind = 'info') {
        status.textContent = msg; status.dataset.kind = kind; status.classList.remove('hidden', 'rr-ability-toast-pop'); void status.offsetWidth; status.classList.add('rr-ability-toast-pop');
        clearTimeout(S.toastTimeout); S.toastTimeout = setTimeout(() => status.classList.add('hidden'), 2600);
        if (isGame()) log(msg);
      }
      function powerFX(p, id, from, to) {
        if (!isGame()) return;
        const color = id === 'fireball' ? '#ff8745' : id === 'gravity' ? '#bb96ff' : id === 'freeze' ? '#a1eaff' : '#8df7c9';
        const board = $rr('board'); const pos = tileCenter(from ?? positions[p]);
        const target = tileCenter(to ?? positions[p]);
        if (pos && motionOn()) {
          const fx = document.createElement('div'); fx.className = 'rr-ability-burst'; fx.style.left = pos.x + 'px'; fx.style.top = pos.y + 'px'; fx.style.setProperty('--power-color', color);
          fx.textContent = POWER_LOOKUP[id]?.icon || ITEM_LOOKUP[id]?.icon || '✦'; board.append(fx); setTimeout(() => fx.remove(), 1250);
          // Actual path-following visual FX, using the same tile coordinates as movement.
          const symbols = { trail: '➤', gravity: '✺', fireball: '✹', lasso: '◎', shadowstep: '✦', boots: '➤', reflect: '⬡', freeze: '❅', lucky: '✧' };
          const projectile = document.createElement('div'); projectile.className = 'rr-skill-projectile rr-skill-' + id;
          projectile.textContent = symbols[id] || '✦'; projectile.style.setProperty('--skill-color', color);
          projectile.style.left = pos.x + 'px'; projectile.style.top = pos.y + 'px'; projectile.setAttribute('aria-hidden', 'true'); board.append(projectile);
          const dx = (target?.x ?? pos.x) - pos.x, dy = (target?.y ?? pos.y) - pos.y;
          const frames = [{ transform: 'translate(-50%,-50%) scale(.45) rotate(-25deg)', opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * .38}px),calc(-50% + ${dy * .38 - 18}px)) scale(1.4) rotate(16deg)`, opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.8) rotate(45deg)`, opacity: .1 }];
          if (projectile.animate) { projectile.animate(frames, { duration: 850, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => { }).finally(() => projectile.remove()); }
          else setTimeout(() => projectile.remove(), 900);
          if (target) { const ring = document.createElement('div'); ring.className = 'rr-skill-target-ring'; ring.style.left = target.x + 'px'; ring.style.top = target.y + 'px'; ring.style.setProperty('--skill-color', color); board.append(ring); setTimeout(() => ring.remove(), 1100); }
        }
        const card = board?.querySelector(`[data-tile="${to ?? positions[p]}"]`);
        if (card) { card.classList.add('rr-ability-highlight'); setTimeout(() => card.classList.remove('rr-ability-highlight'), 1200); }
        sound(id === 'fireball' ? 'dragon' : id === 'gravity' ? 'backstep' : 'good');
      }
      function logEvent(id, actor, target) { S.powerEvents.push({ id, actor, target, at: Date.now() }); if (S.data[actor]) S.data[actor].uses++; }
      function init() {
        S.epoch++; S.data = players.map(() => ({ readyAt: 1, inventory: [], skip: 0, bonus: 0, fixed: null, lastRoll: 1, passiveUsed: false, secondChanceReadyAt: 1, smokeReadyAt: 1, reverseSpin: false, trailPending: false, trailSixThisRoll: false, shadowProtected: false, shadowBonusPending: false, reflect: 0, uses: 0, blocked: 0, attacks: 0 }));
        S.turnCount = players.map(() => 1); S.actionUsed = false; S.itemUsed = false; S.awaiting = false; S.powerEvents = []; S.itemDrops.clear();
        overlay.classList.add('hidden');
        update();
      }
      function passiveState(p) {
        const hero = desc(p), d = S.data[p]; if (!d) return 'AUTOMATIC';
        if (hero.passive.id === 'zero-g') return d.passiveUsed ? 'USED THIS MATCH' : 'READY';
        if (hero.passive.id === 'scout') return S.turnCount[p] >= d.secondChanceReadyAt ? 'SECOND CHANCE READY' : `RECHARGE ${d.secondChanceReadyAt-S.turnCount[p]}T`;
        if (hero.passive.id === 'smoke-veil') return S.turnCount[p] >= d.smokeReadyAt ? 'READY' : `RECHARGE ${d.smokeReadyAt-S.turnCount[p]}T`;
        return 'ALWAYS ACTIVE';
      }
      function update() {
        if (!isGame() || !S.data[turn]) { panel.innerHTML = ''; return; }
        const d = S.data[turn], hero = desc(turn), p = hero.powers[0];
        const ready = timeReady(turn, 0), disabled = !canAct() || S.actionUsed || !ready;
        const statusText = !ready ? `COOLDOWN ${d.readyAt - S.turnCount[turn]}T` : S.actionUsed ? 'USED THIS TURN' : 'READY';
        const active = `<button type="button" class="rr-ability-button" data-power="${p.id}" ${disabled ? 'disabled' : ''} title="${copy(p.desc)}"><span class="rr-power-icon">${window.rrIconKit?.markup(p.id) || p.icon}</span><span class="rr-power-label">${copy(p.label)}</span><small>${statusText}</small></button>`;
        const passive = `<div class="rr-passive-display" title="${copy(hero.passive.desc)}"><span class="rr-power-icon">${window.rrIconKit?.markup(hero.passive.id) || hero.passive.icon}</span><span class="rr-passive-label">${copy(hero.passive.label)}<small>PASSIVE · ${passiveState(turn)}</small></span></div>`;
        const inventory = d.inventory.map((id, i) => { const item = ITEM_LOOKUP[id]; return `<button type="button" class="rr-item-button" data-item="${id}" data-slot="${i}" ${!canAct() || S.itemUsed ? 'disabled' : ''} title="${copy(item.desc)}">${window.rrIconKit?.markup(item.id) || item.icon} ${copy(item.label)}</button>`; }).join('');
        panel.innerHTML = `<div class="rr-ability-head"><span>⚡ ${copy(hero.name)} · POWERS</span><button type="button" class="rr-ability-help" id="rrAbilityHelp" title="Learn about character powers">?</button></div><div class="rr-ability-actions rr-one-active-passive">${active}${passive}</div><div class="rr-ability-inventory"><span>🎒 BAG ${d.inventory.length}/2</span>${inventory || '<em>Find power-ups in treasure chests</em>'}</div>`;
        panel.querySelector('[data-power]')?.addEventListener('click', () => startPower(p.id));
        panel.querySelectorAll('[data-item]').forEach(b => b.addEventListener('click', () => startItem(b.dataset.item)));
        $rr('rrAbilityHelp')?.addEventListener('click', help);
      }
      function showDialog(title, help, opts) {
        if (!isGame()) return;
        S.awaiting = true; update(); overlay.classList.remove('hidden');
        $rr('rrAbilityDialogTitle').textContent = title; $rr('rrAbilityDialogHelp').textContent = help;
        const region = $rr('rrAbilityChoices'); region.replaceChildren(); $rr('rrAbilityQuestionBox').classList.add('hidden'); $rr('rrAbilityQuestionBox').replaceChildren();
        opts.forEach(({ label, info, click, color }) => {
          const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'rr-ability-choice';
          if (color) btn.style.setProperty('--target-color', color);
          const title = document.createElement('strong'); title.textContent = label; const small = document.createElement('small'); small.textContent = info || ''; btn.append(title, small);
          btn.addEventListener('click', click); region.append(btn);
        });
      }
      function hideDialog() { overlay.classList.add('hidden'); S.awaiting = false; update(); }
      $rr('rrAbilityCancel').addEventListener('click', () => { if (!$rr('rrAbilityQuestionBox').classList.contains('hidden')) { toast('Complete the math challenge to continue.', 'warning'); return; } hideDialog(); });
      overlay.addEventListener('click', e => { if (e.target === overlay && $rr('rrAbilityQuestionBox').classList.contains('hidden')) hideDialog() });
      function targets(rule) { return players.map((p, i) => i).filter(i => i !== turn && positions[i] < gameLength && (!rule || rule(i))); }
      function selectTarget(id, valid, callback, info) {
        const opts = targets(valid); if (!opts.length) { toast('No valid opponent for ' + POWER_LOOKUP[id].label + '.', 'warning'); return; }
        showDialog(POWER_LOOKUP[id].icon + ' ' + POWER_LOOKUP[id].label, info || POWER_LOOKUP[id].desc, opts.map(i => ({ label: name(i), info: `Tile ${positions[i]} · ${desc(i).name}`, color: players[i].color, click: () => { hideDialog(); callback(i) } })));
      }
      function triggerPower(id, actor) {
        const power = POWER_LOOKUP[id], hero = desc(actor), d = S.data[actor];
        if (!power || hero.powers[0]?.id !== id || S.actionUsed || !timeReady(actor, 0)) return false;
        d.readyAt = S.turnCount[actor] + (power.cooldown || 3) + 1; // wait for all complete personal cooldown turns
        S.actionUsed = true; logEvent(id, actor, null); update(); return true;
      }
      function triggerItem(id) {
        const d = S.data[turn]; if (S.itemUsed) return false;
        const slot = d.inventory.indexOf(id); if (slot < 0) return false;
        d.inventory.splice(slot, 1); S.itemUsed = true; logEvent(id, turn, null); update(); return true;
      }
      async function shiftPlayer(p, to, id) {
        const start = positions[p], dest = clamp(to, 1, gameLength - 1); if (dest === start) { drawBoard(); EXP()?.refresh?.(); return; }
        if (!isGame()) return;
        const epoch = gameEpoch;
        const prior = phase; phase = 'ability'; update();
        powerFX(p, id, start, dest);
        const valid = await animateSteps(start, dest, p, epoch, dest < start ? 'penalty' : 'walk');
        if (epoch !== gameEpoch) return;
        phase = prior; drawBoard(); renderStandings(); EXP()?.refresh?.(); update();
        if (valid) toast(`${name(p)}: tile ${start} → ${dest}`, dest < start ? 'attack' : 'info');
      }
      // Return a harmful action to its caster without recursively reflecting reflections.
      async function reflectToCaster(target, attacker, steps, id) {
        const actorState = S.data[attacker];
        if (!actorState) return;
        if (id === 'gravity') actorState.reverseSpin = true;
        else if (id === 'snowball') window.rrFaithChests?.applySpinPenalty?.(attacker, 2);
        else if (id === 'freeze' || id === 'bear_trap') {
          if (id === 'freeze') actorState.skip++;
          else window.rrFaithChests?.applySkip?.(attacker);
        } else await shiftPlayer(attacker, positions[attacker] - Math.max(1, steps), 'reflect');
        powerFX(target, 'reflect');
        toast(`🐲 Dragon Scales! ${name(target)} reflected ${id.replaceAll('_', ' ')} onto ${name(attacker)}!`, 'shield');
      }
      function isShadowSafe(p) { return !!S.data[p]?.shadowProtected && desc(p).powers[0].id === 'shadowstep'; }
      function mayReflect(target, attacker, id) {
        return attacker != null && attacker !== target && desc(target).passive.id === 'scales' &&
          id !== 'lava_flask' && id !== 'buff' && Math.random() < .5;
      }
      async function protection(target, attacker, steps, id = 'attack') {
        const d = S.data[target]; if (!d) return false;
        if (isShadowSafe(target)) {
          d.blocked++; powerFX(target, 'shadowstep');
          toast(`💨 ${name(target)} is protected by Shadow Step!`, 'shield'); update(); return true;
        }
        if (mayReflect(target, attacker, id)) {
          d.blocked++; await reflectToCaster(target, attacker, steps, id); update(); return true;
        }
        if (window.rrFaithChests?.hasAnkh?.(target)) {
          window.rrFaithChests.useAnkh(target); d.blocked++;
          powerFX(target, 'reflect'); toast(`🛡 ${name(target)} used an Ank Shield!`, 'shield'); update(); return true;
        }
        // Smoke Veil only blocks other players' character powers, and recharges.
        if (attacker != null && ['fireball','gravity','lasso'].includes(id) &&
            desc(target).passive.id === 'smoke-veil' && S.turnCount[target] >= d.smokeReadyAt &&
            !window.rrFaithChests?.passiveLocked?.(target)) {
          d.smokeReadyAt = S.turnCount[target] + 8;
          d.blocked++; powerFX(target, 'smoke');
          toast(`🌫️ ${name(target)} used Smoke Veil! Recharges in 7 own turns.`, 'shield'); update(); return true;
        }
        if (attacker != null && d.reflect > 0) {
          d.reflect--; d.blocked++; powerFX(target, 'reflect');
          toast(`🛡 ${name(target)} REFLECTED the attack!`, 'shield');
          if (attacker !== target) await reflectToCaster(target, attacker, steps, id);
          update(); return true;
        }
        if (EXP()?.getItems?.()?.[target]?.shields > 0) {
          EXP().useShield(target); d.blocked++; powerFX(target, 'zero');
          toast(`🛡 ${name(target)} used a Dragon Shield!`, 'shield'); EXP()?.refresh?.(); update(); return true;
        }
        return false;
      }
      async function attack(actor, target, steps, id) {
        powerFX(actor, id, positions[actor], positions[target]);
        if (await protection(target, actor, steps, id)) return false;
        S.data[actor].attacks++;
        await shiftPlayer(target, positions[target] - steps, id);
        return true;
      }
      function readyRoll() { if (phase === 'roll') { $rr('rollBtn').disabled = !!players[turn]?.cpu; update(); } }
      function progressBoost(amount) { const d = S.data[turn]; d.bonus = Math.min(4, d.bonus + amount); toast(`👟 ${name(turn)}: +${amount} on the next wheel spin!`, 'good'); }

      function startPower(id) {
        if (!canAct() || S.actionUsed) return;
        const actor = turn, d = S.data[actor], hero = desc(actor);
        if (hero.powers[0]?.id !== id || !timeReady(actor, 0)) return;
        switch (id) {
          case 'trail': if (triggerPower(id, actor)) {
            d.trailPending = true;
            powerFX(actor, 'trail'); toast(`👟 ${name(actor)}: +3 on 6, or +2 on rolls 1–5!`, 'good');
          } break;
          case 'gravity': selectTarget(id, null, async target => { if (triggerPower(id, actor)) {
            powerFX(actor, id, positions[actor], positions[target]);
            if (!await protection(target, actor, 0, id)) {
              S.data[target].reverseSpin = true;
              toast(`🪐 ${name(target)}'s NEXT wheel spin will move BACKWARD!`, 'attack');
            }
            readyRoll();
          } }); break;
          case 'fireball': selectTarget(id, null, async target => { if (triggerPower(id, actor)) { await attack(actor, target, 4, id); readyRoll(); } }); break;
          case 'lasso': selectTarget(id, i => positions[i] > positions[actor] && Math.floor((positions[i]-1)/10) === Math.floor((positions[actor]-1)/10), async target => {
            if (triggerPower(id, actor)) {
              await attack(actor, target, positions[target] - positions[actor], id); readyRoll();
            }
          }, 'Pull an opponent ahead in YOUR 10-tile row back onto your tile.'); break;
          case 'shadowstep': if (triggerPower(id, actor)) {
            d.shadowProtected = true; d.shadowBonusPending = true;
            powerFX(actor, 'shadowstep'); toast(`💨 ${name(actor)} is protected until their next turn and gains +1 this spin!`, 'shield');
          } break;
        }
      }
      function startItem(id) {
        if (!canAct() || S.itemUsed || !S.data[turn].inventory.includes(id)) return;
        const actor = turn;
        switch (id) {
          case 'boots': if (triggerItem(id)) progressBoost(2); break;
          case 'reflect': if (triggerItem(id)) { S.data[actor].reflect++; toast(`🛡 ${name(actor)} equipped a Reflect Shield!`, 'shield'); powerFX(actor, id); } break;
          case 'freeze': selectItemTarget(id, async target => { if (triggerItem(id)) {
            if (!await protection(target, actor, 0, id)) {
              S.data[target].skip++; powerFX(target, id); toast(`❄ ${name(target)} will skip their next roll!`, 'attack');
            }
          } }); break;
          case 'lucky': {
            const rolls = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
            showDialog('🎡 Lucky Spin', 'Choose one of two random wheel results. The chosen value will be shown when you spin.', rolls.map((n, i) => ({ label: `🎡 ${n}`, info: `Spin ${i + 1}`, click: () => { hideDialog(); if (triggerItem(id)) { S.data[actor].fixed = n; toast(`🎲 Lucky Dice locked ${n} for your next roll!`, 'good'); } } }))); break;
          }
        }
      }
      function selectItemTarget(id, callback) {
        const opts = targets(); if (!opts.length) { toast('No opponent available.', 'warning'); return; }
        showDialog(ITEM_LOOKUP[id].icon + ' ' + ITEM_LOOKUP[id].label, ITEM_LOOKUP[id].desc, opts.map(i => ({ label: name(i), info: `Tile ${positions[i]}`, color: players[i].color, click: () => { hideDialog(); callback(i) } })));
      }
      function help() {
        const entries = Object.entries(HEROES).map(([id, h]) => ({
          label: (ICONS[id] || '✦') + ' ' + h.name, info: `⚡ ${h.powers[0].label} · ✧ ${h.passive.label}`,
          click: () => showDialog(h.name, h.category, [
            { label: '⚡ ACTIVE · ' + h.powers[0].label, info: h.powers[0].desc, click: help },
            { label: '✧ PASSIVE · ' + h.passive.label, info: h.passive.desc, click: help }
          ])
        }));
        showDialog('⚡ Hero Powers', 'Each character has one active skill with its own cooldown and one automatic passive. Cooldowns count complete turns of that character. You may use one collected tool per turn.', entries.concat([{ label: '🎒 Collectible Power-ups', info: ITEMS.map(x => x.label).join(' · '), click: () => showDialog('🎒 Collected Power-ups', 'Find these in treasure chests. One power-up can be used per turn.', ITEMS.map(p => ({ label: p.icon + ' ' + p.label, info: p.desc, click: help }))) }]));
      }
      function attachCharacterDescriptions() {
        document.querySelectorAll('#playerEditors .player-editor').forEach((card, i) => {
          const character = configs[i]?.character || 'astronaut-animated';
          const hero = HEROES[character] || HEROES.hoodie;
          let details = card.querySelector('.rr-character-skills');
          if (!details) { details = document.createElement('section'); details.className = 'rr-character-skills'; details.setAttribute('aria-label', 'Active skill and passive ability'); card.append(details); }
          const active = hero.powers[0], passive = hero.passive;
          details.innerHTML = `<div class="rr-skill-summary"><div class="rr-skill-type">⚡ ACTIVE · ${active.cooldown}-TURN COOLDOWN</div><strong>${active.icon} ${copy(active.label)}</strong><p>${copy(active.desc.replace(/^ACTIVE · /, ''))}</p></div><div class="rr-skill-summary passive"><div class="rr-skill-type">✧ AUTOMATIC PASSIVE</div><strong>${passive.icon} ${copy(passive.label)}</strong><p>${copy(passive.desc.replace(/^PASSIVE · /, ''))}</p></div>`;
          const selector = card.querySelector('select[aria-label$="character"]');
          if (selector && !selector.dataset.rrPowerBound) { selector.dataset.rrPowerBound = '1'; selector.addEventListener('change', () => queueMicrotask(attachCharacterDescriptions)); }
        });
      }
      const baseRenderEditors = renderEditors;
      renderEditors = function (...args) { const result = baseRenderEditors(...args); attachCharacterDescriptions(); return result; };
      // The current setup may already be open when this script initializes.
      if (currentScreen === 'setup') attachCharacterDescriptions();
      // Hooks to preserve all original game mechanics.
      const coreStart = startGame;
      startGame = function (...args) { const r = coreStart(...args); init(); return r; };
      const coreNext = nextTurn;
      nextTurn = function (...args) {
        const old = turn; const r = coreNext(...args); if (!isGame() || phase !== 'roll') return r;
        S.turnCount[turn]++; S.actionUsed = false; S.itemUsed = false;
        // Shadow Step lasts from activation until the player's following turn.
        if (S.data[turn]) { S.data[turn].shadowProtected = false; S.data[turn].shadowBonusPending = false; }
        // Passive abilities are automatic; no charge meter or ultimate state.
        update();
        const d = S.data[turn];
        if (d?.skip > 0) { d.skip--; phase = 'feedback'; $rr('rollBtn').disabled = true; toast(`❄ ${name(turn)} skips this roll due to a Freeze Crystal.`, 'attack'); startTurnAdvance(); return r; }
        return r;
      };
      const coreSubmit = submitAnswer;
      submitAnswer = async function (value) { const res = await coreSubmit(value); update(); return res; };
      const coreSafe = showSafeLanding;
      showSafeLanding = function (tile) {
        if (phase === 'moving' && EXP()?.getTreasures?.()?.[tile] && !EXP()?.isCollected?.(tile)) {
          const d = S.data[turn]; if (d && d.inventory.length < 2) {
            const seed = tile % 4; const item = ITEMS[seed].id; d.inventory.push(item); S.itemDrops.set(tile, item); toast(`🎒 ${name(turn)} found ${ITEM_LOOKUP[item].label}!`, 'good');
          } else toast(`🎁 ${name(turn)} found treasure. Bag full (max 2 items).`, 'info');
        }

        const result = coreSafe(tile); update(); return result;
      };

      const coreRender = renderStandings;
      renderStandings = function (...args) { const r = coreRender(...args); update(); return r; };
      const bridge = window.rrExpeditionBridge;
      if (bridge) {
        const originalHas = bridge.hasShield?.bind(bridge), originalUse = bridge.useShield?.bind(bridge);
        bridge.hasShield = function (p) {
          return !!(isShadowSafe(p) || desc(p).passive.id === 'zero-g' && !S.data[p]?.passiveUsed && !window.rrFaithChests?.passiveLocked?.(p) || S.data[p]?.reflect > 0 || originalHas?.(p));
        };
        bridge.useShield = function (p) {
          if (isShadowSafe(p)) { toast(`💨 ${name(p)} was protected from the portal setback by Shadow Step!`, 'shield'); update(); return; }
          const d = S.data[p]; if (desc(p).passive.id === 'zero-g' && d && !d.passiveUsed && !window.rrFaithChests?.passiveLocked?.(p)) {
            d.passiveUsed = true; d.blocked++; toast(`🪐 ${name(p)} used Zero-G Shield against a dragon!`, 'shield'); update(); return;
          }
          if (d?.reflect) { d.reflect--; d.blocked++; toast(`🛡 ${name(p)} blocked a dragon with a Reflect Shield!`, 'shield'); update(); return; }
          originalUse?.(p); update();
        };
      }
      window.rrAbilityEngine = {
        diceForTurn(player) {
          const d = S.data[player]; if (!d) return 1 + Math.floor(Math.random() * 6);
          const result = d.fixed ?? 1 + Math.floor(Math.random() * 6);
          d.fixed = null; d.lastRoll = result; update(); return result;
        },
        takeReverseRoll(player) {
          const d = S.data[player]; if (!d) return false;
          const reversed = d.reverseSpin; d.reverseSpin = false;
          if (reversed) toast(`🪐 Gravity Shift: ${name(player)} rolls BACKWARD this turn!`, 'attack');
          update(); return !!reversed;
        },
        takeRollBonus(player) {
          const d = S.data[player]; if (!d) return 0;
          let bonus = d.bonus; d.bonus = 0; d.trailSixThisRoll = false;
          if (d.trailPending) {
            d.trailPending = false;
            d.trailSixThisRoll = d.lastRoll === 6;
            bonus += d.lastRoll === 6 ? 3 : 2;
            toast(`👟 Trailblazer: +${d.lastRoll === 6 ? 3 : 2} movement!`, 'good');
          }
          if (d.shadowBonusPending) { d.shadowBonusPending = false; bonus += 1; toast('💨 Shadow Step: +1 movement!', 'good'); }
          if (!window.rrFaithChests?.passiveLocked?.(player) && desc(player).passive.id === 'quick-draw' && d.lastRoll === 1) {
            bonus += 1; toast(`🎯 Quick Draw: a roll of 1 gains +1 movement!`, 'good');
          }
          update(); return bonus;
        },
        rollCap(player) { return S.data[player]?.trailSixThisRoll ? 9 : 8; },
        dragonDestination(player, tile, dest) { return dest; },
        isProtected: isShadowSafe,
        reflectHazard(target, attacker, id) {
          if (!mayReflect(target, attacker, id)) return false;
          const d = S.data[target]; if (d) d.blocked++;
          powerFX(target, 'reflect');
          toast(`🐲 Dragon Scales reflected the ${id.replaceAll('_', ' ')} to ${name(attacker)}!`, 'shield');
          update(); return true;
        },
        allowSecondChance(player, answer, correctAnswer) {
          const d = S.data[player]; if (!d || desc(player).passive.id !== 'scout' ||
              answer == null || answer === correctAnswer || !pending || phase !== 'answer' ||
              window.rrFaithChests?.passiveLocked?.(player) || S.turnCount[player] < d.secondChanceReadyAt) return false;
          d.secondChanceReadyAt = S.turnCount[player] + 8;
          // The same portal question remains active. The wrong choice cannot be tapped twice.
          const wrong = Array.from($rr('answers')?.children || []).find(b => b.dataset.rrOption === answer);
          if (wrong) { wrong.disabled = true; wrong.classList.add('wrong'); }
          const feedback = $rr('feedback'); if (feedback) {
            feedback.style.color = '#9ff2c5'; feedback.textContent = '🧭 SECOND CHANCE! Your first answer was incorrect. Choose another answer.';
          }
          toast(`🧭 ${name(player)} gets a second try! Second Chance recharges in 7 own turns.`, 'good');
          update(); return true;
        },
        getState: () => S, hitWithTool: (actor, target, steps, id) => attack(actor, target, steps, id),
        blockToolTarget: (actor, target, id = 'snowball') => protection(target, actor, 1, id),
        grantItem(id, p = turn) { if (S.data[p]?.inventory.length < 2 && ITEM_LOOKUP[id]) { S.data[p].inventory.push(id); update(); } },
        help: () => help()
      };
      // Power records in the existing winner podium and the downloadable race report.
      const coreVictory = showVictory;
      showVictory = function (winner) {
        const result = coreVictory(winner); const section = $rr('winner')?.querySelector('.victory-stats'); if (section) {
          const heading = document.createElement('h3'); heading.textContent = '⚡ CHARACTER POWER RESULTS'; section.append(heading);
          players.forEach((p, i) => { const d = S.data[i]; if (!d) return; const row = document.createElement('div'); row.className = 'victory-stat-row'; row.textContent = `${p.name}: ${d.uses} power-ups / abilities · ${d.attacks} successful attacks · ${d.blocked} blocks`; section.append(row); });
        } return result;
      };
      const report = $rr('raceReport'); if (report) {
        new MutationObserver(() => {
          if (report.classList.contains('hidden')) return; const pre = report.querySelector('pre'); if (!pre || pre.textContent.includes('CHARACTER POWER STATISTICS')) return;
          const powers = players.map((p, i) => { const d = S.data[i]; return `${p.name}: ${d?.uses || 0} abilities & items, ${d?.attacks || 0} successful attacks, ${d?.blocked || 0} blocks, passive ${desc(i).passive.id === 'smoke-veil' ? (S.turnCount[i] < d?.smokeReadyAt ? 'recharging' : 'ready') : desc(i).passive.id === 'scout' ? (S.turnCount[i] < d?.secondChanceReadyAt ? 'recharging' : 'ready') : d?.passiveUsed ? 'used' : 'available/automatic'}`; });
          pre.textContent += '\n\nCHARACTER POWER STATISTICS\n' + powers.join('\n') + '\n\nPOWER HISTORY\n' + (S.powerEvents.map(e => `${name(e.actor)}: ${POWER_LOOKUP[e.id]?.label || ITEM_LOOKUP[e.id]?.label || e.id}`).join('\n') || 'No powers used.');
        }).observe(report, { attributes: true, attributeFilter: ['class'] });
      }
      // Always keep a power available in solo play; attacks need an opponent to target.
      if (isGame()) init();
    })();

  
