    /* Sculpted theme roads: decorative SVG tiles, no game-state changes. */
    (function () {
      'use strict';
      const NS = 'http://www.w3.org/2000/svg';
      const $ = id => document.getElementById(id);
      function gridPos(number) {
        const row = Math.floor((number - 1) / 10), index = (number - 1) % 10;
        return { row, col: (row % 2 === 0 ? index : 9 - index) };
      }
      function connection(a, b) {
        const p = gridPos(a), q = gridPos(b);
        if (q.row > p.row) return 'top';
        if (q.row < p.row) return 'bottom';
        return q.col > p.col ? 'right' : 'left';
      }
      function edge(side) { return { top: [50, 0], bottom: [50, 100], left: [0, 50], right: [100, 50] }[side] || [50, 50]; }
      function makePath(n, end) {
        const earlier = n > 1 ? edge(connection(n, n - 1)) : [50, 50];
        const later = n < end ? edge(connection(n, n + 1)) : [50, 50];
        if (earlier.join() === later.join()) return `M${earlier.join(' ')} L50 50`;
        if (earlier[0] === later[0] || earlier[1] === later[1]) return `M${earlier.join(' ')} L${later.join(' ')}`;
        return `M${earlier.join(' ')} L50 50 L${later.join(' ')}`;
      }
      const layers = ['road-ground', 'road-curb', 'road-base', 'road-face', 'road-rim', 'road-tread', 'road-lane', 'road-grit'];
      function paint() {
        const board = $('board'); if (!board) return;
        const tiles = [...board.querySelectorAll('.tile[data-tile]')];
        if (!tiles.length) return;
        const total = tiles.length;
        tiles.forEach(tile => {
          const n = Number(tile.dataset.tile);
          tile.querySelector('.world-road')?.remove();
          tile.querySelector('.world-prop')?.remove();
          const svg = document.createElementNS(NS, 'svg');
          svg.setAttribute('class', 'world-road'); svg.setAttribute('viewBox', '0 0 100 100');
          svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
          const d = makePath(n, total);
          layers.forEach(cls => {
            const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls);
            p.setAttribute('d', d); svg.append(p);
          });
          tile.insertBefore(svg, tile.firstChild);
          if (n % 4 === 2 && !tile.classList.contains('boost') && !tile.classList.contains('danger')) {
            const prop = document.createElement('span'); prop.className = 'world-prop';
            prop.setAttribute('aria-hidden', 'true'); tile.append(prop);
          }
        });
        const legend = board.parentElement?.querySelector('.legend');
        if (legend && !legend.querySelector('.world-road-note')) {
          const marker = document.createElement('span'); marker.className = 'world-road-note';
          marker.innerHTML = '<span class="road-key" aria-hidden="true"></span><span>Follow the raised road</span>';
          legend.prepend(marker);
        }
      }
      if (typeof drawBoard === 'function') {
        const original = drawBoard;
        drawBoard = function (...args) { const result = original(...args); paint(); return result; };
      }
      // Draw existing board when this extension loads after game initialization.
      paint();
    })();

  
