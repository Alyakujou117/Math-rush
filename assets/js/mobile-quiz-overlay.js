    /* Radical Rush | mobile challenge overlay
       Reparents the EXISTING challenge panel (not a copy), retaining all event
       listeners, random portal reveals, timers, answers, and local state updates. */
    (function () {
      'use strict';
      const game = document.getElementById('gameScreen');
      const challenge = document.getElementById('challenge');
      if (!game || !challenge || !window.rrMobileGameFocus) return;
      const originalParent = challenge.parentElement;
      const anchor = document.createComment('Radical Rush challenge original position');
      originalParent.insertBefore(anchor, challenge);
      const overlay = document.createElement('dialog');
      overlay.id = 'rrMobileChallengeOverlay';
      overlay.className = '';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'false');
      overlay.setAttribute('aria-label', 'Portal fate and math challenge');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<div class="rr-quiz-scrim" aria-hidden="true"></div><div class="rr-quiz-shell"><div class="rr-quiz-banner">✦ Portal Expedition · Your Turn ✦</div><div class="rr-quiz-content"></div></div>';
      game.appendChild(overlay);
      overlay.addEventListener('cancel', event => event.preventDefault()); // The required question cannot be dismissed with Escape.
      const container = overlay.querySelector('.rr-quiz-content');
      const mobile = () => matchMedia('(max-width:760px) and (orientation:portrait), (max-width:1100px) and (max-height:600px) and (orientation:landscape)').matches;
      let active = false; let lastFocused = null;
      function update() {
        const showing = mobile() && !game.classList.contains('hidden') && document.body.classList.contains('in-game') && (game.classList.contains('rr-math-focus') || game.classList.contains('rr-finish-focus'));
        if (showing) {
          if (challenge.parentElement !== container) container.appendChild(challenge);
          if (!active) { lastFocused = document.activeElement; active = true; }
          overlay.classList.add('is-open');
          if (!overlay.open) { try { overlay.showModal() } catch (error) { console.warn('Challenge dialog could not open:', error) } }
          overlay.setAttribute('aria-hidden', 'false');
          overlay.setAttribute('aria-modal', 'true');
          document.body.classList.add('rr-quiz-modal-open');
        } else {
          overlay.classList.remove('is-open');
          if (overlay.open) overlay.close();
          overlay.setAttribute('aria-hidden', 'true');
          overlay.setAttribute('aria-modal', 'false');
          document.body.classList.remove('rr-quiz-modal-open');
          if (challenge.parentElement !== originalParent) originalParent.insertBefore(challenge, anchor.nextSibling);
          if (active && lastFocused && document.contains(lastFocused) && lastFocused !== document.body && lastFocused !== challenge) {
            // Do not steal focus during answer submission or game-state updates.
          }
          active = false;
        }
      }
      // Local gameplay calls its private focus() function directly. Observe the
      // resulting state-class change as well as the public multiplayer hook.
      new MutationObserver(update).observe(game, { attributes: true, attributeFilter: ['class'] });
      const originalFocus = window.rrMobileGameFocus;
      window.rrMobileGameFocus = function (mode) {
        const result = originalFocus.apply(this, arguments);
        update();
        return result;
      };
      // Screen changes (settings, lobby, home) must never leave an invisible modal.
      if (typeof showScreen === 'function') {
        const originalScreen = showScreen;
        showScreen = function () { const result = originalScreen.apply(this, arguments); update(); return result; };
      }
      if (typeof startGame === 'function') {
        const originalStart = startGame;
        startGame = function () { const result = originalStart.apply(this, arguments); update(); return result; };
      }
      const mq = matchMedia('(max-width:760px) and (orientation:portrait), (max-width:1100px) and (max-height:600px) and (orientation:landscape)');
      if (mq.addEventListener) mq.addEventListener('change', update); else if (mq.addListener) mq.addListener(update);
      addEventListener('orientationchange', update, { passive: true });
      addEventListener('resize', update, { passive: true });
      // The old mobile camera must not scroll the board behind the blocking dialog.
      if (typeof bringIntoView === 'function') {
        const previousCamera = bringIntoView;
        bringIntoView = function (which, animated) {
          if (mobile() && (overlay.classList.contains('is-open') || game.classList.contains('rr-math-focus') || game.classList.contains('rr-finish-focus'))) return;
          return previousCamera.apply(this, arguments);
        };
      }
      // Constrain the desktop map using the *actual* board-card height.
      // The existing board-fit script only measures the browser height, which can
      // allow the final row of tiles to extend below the game viewport.
      const board = game.querySelector('#board');
      const boardCard = game.querySelector('.board-card');
      let fitFrame = 0;
      function fitBoard() {
        fitFrame = 0;
        if (!board || !boardCard) return;
        if (!matchMedia('(min-width:761px) and (min-height:601px)').matches || !document.body.classList.contains('in-game') || game.classList.contains('hidden') || document.body.classList.contains('rr-actual-fullscreen')) {
          board.style.removeProperty('--rr-screen-fit-board'); return;
        }
        const card = boardCard.getBoundingClientRect(), map = board.getBoundingClientRect();
        const css = getComputedStyle(boardCard);
        const availableWidth = Math.max(150, card.width - (parseFloat(css.paddingLeft) || 0) - (parseFloat(css.paddingRight) || 0) - 7);
        const rows = Math.max(1, parseFloat(board.style.getPropertyValue('--board-rows')) || 10);
        const availableHeight = Math.max(150, card.bottom - map.top - 10);
        const width = Math.max(150, Math.floor(Math.min(availableWidth, availableHeight * 10 / rows)));
        if (board.style.getPropertyValue('--rr-screen-fit-board') !== width + 'px') board.style.setProperty('--rr-screen-fit-board', width + 'px');
      }
      function scheduleBoardFit() { if (!fitFrame) fitFrame = requestAnimationFrame(fitBoard) }
      if (boardCard && typeof ResizeObserver !== 'undefined') new ResizeObserver(scheduleBoardFit).observe(boardCard);
      addEventListener('resize', scheduleBoardFit, { passive: true });
      addEventListener('orientationchange', scheduleBoardFit, { passive: true });
      if (typeof drawBoard === 'function') { const previousDraw = drawBoard; drawBoard = function () { const result = previousDraw.apply(this, arguments); scheduleBoardFit(); return result } }
      if (typeof startGame === 'function') { const previousStart = startGame; startGame = function () { const result = previousStart.apply(this, arguments); scheduleBoardFit(); return result } }
      update(); scheduleBoardFit();
      window.rrMobileQuizOverlay = { refresh: update, isOpen: () => overlay.classList.contains('is-open') };
    })();

  
