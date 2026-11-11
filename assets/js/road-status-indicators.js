    /* RADICAL RUSH - Sculpted roads and live character status badges.
       Visual-only road geometry; no tile positions, questions or movement rules change.
       Status badges read authoritative ability and expedition inventories. */
    (function () {
      'use strict';
      const NS = 'http://www.w3.org/2000/svg';
      const $ = id => document.getElementById(id);
      const worldNames = { temple: 'carved stone', forest: 'woodland trail', frost: 'glacial ice', volcano: 'obsidian', cosmos: 'starlight', atlantis: 'sea-glass' };
      function gridPosition(n) {
        const row = Math.floor((n - 1) / 10), offset = (n - 1) % 10;
        return { row, col: row % 2 === 0 ? offset : 9 - offset };
      }
      function stepDirection(a, b) {
        const p = gridPosition(a), q = gridPosition(b);
        return q.row > p.row ? 'up' : q.row < p.row ? 'down' : q.col > p.col ? 'right' : 'left';
      }
      function edge(dir) { return { up: [50, 0], down: [50, 100], left: [0, 50], right: [100, 50] }[dir] || [50, 50]; }
      function route(n, total) {
        const a = n === 1 ? [50, 50] : edge(stepDirection(n, n - 1));
        const b = n === total ? [50, 50] : edge(stepDirection(n, n + 1));
        return { a, b, d: `M ${a[0]} ${a[1]} ${a[0] === b[0] || a[1] === b[1] ? 'L' : 'Q 50 50'} ${b[0]} ${b[1]}` };
      }
      function svgElement(name, attrs = {}) { const x = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) x.setAttribute(k, String(v)); return x; }
      const path = (d, cls, attrs = {}) => svgElement('path', { d, class: cls, ...attrs });
      function addTexture(svg, horizontal, kind) {
        const cuts = kind === 'bridge' ? [20, 40, 60, 80] : kind === 'ramp' ? [22, 38, 54, 70, 86] : [29, 67];
        for (const c of cuts) {
          let d = horizontal ? `M ${c} 28 L ${c} 72` : `M 28 ${c} L 72 ${c}`;
          svg.append(path(d, kind === 'bridge' ? 'rr-road-plank' : kind === 'ramp' ? 'rr-ramp-score' : 'rr-road-joint'));
        }
        if (kind === 'bridge') {
          const rail1 = horizontal ? 'M 0 17 L 100 17' : 'M 17 0 L 17 100';
          const rail2 = horizontal ? 'M 0 83 L 100 83' : 'M 83 0 L 83 100';
          svg.append(path(rail1, 'rr-road-rail-shadow', { transform: 'translate(0 3)' }));
          svg.append(path(rail2, 'rr-road-rail-shadow', { transform: 'translate(0 3)' }));
          svg.append(path(rail1, 'rr-road-rail'));
          svg.append(path(rail2, 'rr-road-rail'));
          for (const c of [12, 50, 88]) {
            const railPost1 = horizontal ? `M${c} 12V25` : `M12 ${c}H25`;
            const railPost2 = horizontal ? `M${c} 75V88` : `M75 ${c}H88`;
            svg.append(path(railPost1, 'rr-road-post'));
            svg.append(path(railPost2, 'rr-road-post'));
          }
        }
        if (kind === 'ramp') {
          const wedge = horizontal ? 'M 8 70 L 90 70' : 'M 70 8 L 70 90';
          svg.append(path(wedge, 'rr-ramp-highlight'));
        }
      }
      function enhanceRoads() {
        const board = $('board'); if (!board) return;
        const tiles = board.querySelectorAll('.tile[data-tile]'); const total = tiles.length;
        tiles.forEach(tile => {
          const n = Number(tile.dataset.tile), r = route(n, total);
          tile.querySelectorAll('.rr-road-underlay,.rr-road-detail').forEach(el => el.remove());
          const straight = r.a[0] === r.b[0] || r.a[1] === r.b[1];
          const horizontal = r.a[1] === r.b[1] && r.a[0] !== r.b[0];
          const kind = tile.classList.contains('terrain-bridge') && straight ? 'bridge' : tile.classList.contains('terrain-rise') && straight ? 'ramp' : 'road';
          tile.dataset.rrElevation = kind;
          const under = svgElement('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', class: 'rr-road-underlay', 'aria-hidden': 'true' });
          // Extruded dark underside, sidewall, and lower edge create true apparent thickness.
          under.append(path(r.d, 'rr-road-contact', { transform: 'translate(0 10)' }));
          under.append(path(r.d, 'rr-road-wall-shadow', { transform: `translate(0 ${kind === 'bridge' ? 9 : 7})` }));
          under.append(path(r.d, 'rr-road-wall', { transform: `translate(0 ${kind === 'bridge' ? 6 : 4})` }));
          under.append(path(r.d, 'rr-road-wall-rim', { transform: 'translate(0 2)' }));
          tile.insertBefore(under, tile.firstChild);
          const detail = svgElement('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', class: 'rr-road-detail', 'aria-hidden': 'true' });
          if (straight) addTexture(detail, horizontal, kind);
          else detail.append(path(r.d, 'rr-road-turn-rim'));
          if (kind === 'bridge') detail.append(path(r.d, 'rr-bridge-crosslight'));
          const road = tile.querySelector('.world-road');
          if (road) road.insertAdjacentElement('afterend', detail);
          else tile.append(detail);
          if (kind === 'bridge') tile.title = (tile.title || '') + ' · raised bridge';
        });
        board.setAttribute('data-rr-road-depth', 'on');
      }
      function statList(player) {
        const state = window.rrAbilityEngine?.getState?.();
        const powers = state?.data?.[player] || {};
        const bag = window.rrExpeditionBridge?.getItems?.()?.[player] || {};
        const type = players?.[player]?.character || '';
        const items = [];
        if (powers.skip > 0) items.push({ code: 'freeze', mark: '❄', label: `Frozen: skip ${powers.skip} turn` });
        if (bag.shields > 0) items.push({ code: 'shield', mark: '⬡', label: `Dragon shield ×${bag.shields}` });
        if (powers.reflect > 0) items.push({ code: 'reflect', mark: '↩', label: `Reflect shield ×${powers.reflect}` });
        if (powers.bonus > 0) items.push({ code: 'boost', mark: '+' + powers.bonus, label: `Next roll gains +${powers.bonus} movement` });
        if (powers.fixed !== null && powers.fixed !== undefined) items.push({ code: 'lucky', mark: '✦', label: `Lucky Dice set to ${powers.fixed}` });
        if (type === 'astronaut-animated' && !powers.passiveUsed) items.push({ code: 'passive', mark: '◉', label: 'Zero-G Shield passive available' });
        const count = state?.turnCount?.[player] || 1;
        if (type === 'ninja-animated' && (powers.smokeReadyAt || 1) <= count) items.push({ code: 'passive', mark: '☁', label: 'Smoke Veil passive available' });
        if (powers.shadowProtected) items.push({ code: 'shield', mark: '💨', label: 'Shadow Step protection active' });
        if (powers.reverseSpin) items.push({ code: 'freeze', mark: '↩', label: 'Gravity Shift: next wheel spin backwards' });
        if (powers.readyAt > count) items.push({ code: 'cooldown', mark: (powers.readyAt - count) + 'T', label: `Active skill ready in ${powers.readyAt - count} own turns` });
        if (!items.length && player === turn && phase === 'roll') items.push({ code: 'ready', mark: '⚡', label: 'Active skill ready' });
        return items;
      }
      function strip(player, compact) {
        const statuses = statList(player).slice(0, compact ? 1 : 2);
        if (!statuses.length) return null;
        const node = document.createElement('span'); node.className = 'rr-status-stack';
        node.dataset.statusPlayer = String(player);
        node.setAttribute('aria-label', statuses.map(s => s.label).join(', '));
        statuses.forEach(s => {
          const pill = document.createElement('span'); pill.className = 'rr-status-pill rr-status-' + s.code;
          pill.textContent = s.mark; pill.title = s.label; pill.setAttribute('aria-label', s.label);
          node.appendChild(pill);
        });
        return node;
      }
      // On-board cooldown / shield badges are deliberately removed to keep
      // character sprites unobstructed. Powers and their status still appear in
      // the dedicated Powers panel, and the roads remain fully enhanced.
      function refreshStatus() {
        const board = $('board'); if (!board) return;
        board.querySelector('.rr-status-layer')?.remove();
        board.querySelectorAll('.fx-avatar .rr-status-stack').forEach(node => node.remove());
      }

      const previousDraw = drawBoard;
      drawBoard = function (...args) { const result = previousDraw(...args); enhanceRoads(); refreshStatus(); requestAnimationFrame(refreshStatus); return result; };
      window.addEventListener('resize', () => scheduleRefresh(), { passive: true });
      const previousAvatar = makeAvatar;
      makeAvatar = function (player, ...args) {
        return previousAvatar(player, ...args);
      };
      let queued = false;
      function scheduleRefresh() { if (queued) return; queued = true; queueMicrotask(() => { queued = false; refreshStatus(); }); }
      // These are the engine's actual state displays. Observe them rather than polling.
      const abilityPanel = $('rrAbilityPanel');
      if (abilityPanel) new MutationObserver(scheduleRefresh).observe(abilityPanel, { subtree: true, childList: true, characterData: true });
      // The loot HUD is created lazily on the first game start, so observing it
      // during script startup would miss later shield changes. Hook the bridge.
      const expedition = window.rrExpeditionBridge;
      if (expedition) {
        for (const method of ['refresh', 'useShield', 'claimPrize', 'claimTreasure']) {
          if (typeof expedition[method] !== 'function') continue;
          const original = expedition[method];
          expedition[method] = function (...args) {
            const result = original.apply(this, args); scheduleRefresh(); return result;
          };
        }
      }
      window.rrRoadStatus = { enhanceRoads, refresh: refreshStatus, statList, worldNames };
      requestAnimationFrame(() => { enhanceRoads(); refreshStatus(); });
    })();

  
