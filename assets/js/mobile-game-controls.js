    (function () {
      const game = document.getElementById('gameScreen');
      const first = game?.querySelector('.sidebar > .game-panel:first-child');
      const rollRow = first?.querySelector('.roll-row');
      const challengeCard = document.getElementById('challenge');
      const countdown = document.getElementById('turnCountdown');
      if (!game || !first || !rollRow || !challengeCard || !countdown) return;
      // Keep the actual question UI and all existing event listeners: merely move it
      // into the same action area as the dice, then swap which one is visible.
      rollRow.insertAdjacentElement('afterend', countdown);
      countdown.insertAdjacentElement('afterend', challengeCard);
      const recap = document.createElement('div');
      recap.id = 'rrAnswerRecap';
      recap.setAttribute('role', 'status');
      recap.setAttribute('aria-live', 'polite');
      challengeCard.insertAdjacentElement('afterend', recap);
      const classes = ['rr-dice-focus', 'rr-math-focus', 'rr-answer-result', 'rr-finish-focus'];
      function focus(mode) { classes.forEach(c => game.classList.toggle(c, c === 'rr-' + mode + '-focus' || (mode === 'result' && c === 'rr-answer-result'))); }
      function resetRecap() { recap.replaceChildren(); }
      function showRecap(question, correct, kind, answer) {
        resetRecap();
        const heading = document.createElement('div'); heading.className = 'rr-recap-heading';
        heading.textContent = (correct ? '✓ Correct! ' : '✕ Not quite. ') + (kind === 'Portal' ? 'Portal challenge' : 'Dragon challenge');
        const body = document.createElement('div');
        body.innerHTML = format((correct ? 'Challenge answered successfully. ' : 'Correct answer: ' + question[1] + '. ') + (kind === 'Portal' ? (correct ? 'Portal fate activated!' : 'The portal challenge was not solved.') : (correct ? 'You escaped the dragon!' : 'The dragon may knock you back.')));
        recap.append(heading, body);
        if (question[3]) {
          const details = document.createElement('details');
          const summary = document.createElement('summary'); summary.textContent = 'Show math solution';
          const explanation = document.createElement('p'); explanation.innerHTML = format(question[3]);
          details.append(summary, explanation); recap.append(details);
        }
      }
      window.rrMobileGameFocus = focus;
      focus('dice');
      const originalChallenge = challenge;
      challenge = function (...args) {
        const result = originalChallenge(...args);
        if (phase === 'answer' || phase === 'card') { resetRecap(); focus('math'); }
        return result;
      };
      const originalSubmit = submitAnswer;
      submitAnswer = async function (value) {
        if (phase !== 'answer' || !pending || pending.player !== turn) return;
        const q = pending.q, kind = pending.portalOutcome === 'lair' ? 'Dragon' : 'Portal';
        const correct = value === q[1];
        // Restore the dice at the instant the player submits an answer. The turn
        // cannot be rolled again until the existing animation and countdown finish.
        showRecap(q, correct, kind, value);
        focus('result');
        const result = await originalSubmit(value);
        if (correct && kind === 'Dragon' && lastDragonEscapeText) {
          const note = recap.querySelector('div:nth-child(2)');
          if (note) note.textContent = '✓ Correct! 🐉 ' + lastDragonEscapeText;
        }
        if (currentScreen === 'game' && phase === 'feedback') focus('result');
        return result;
      };
      const originalClear = clearQuestionUI;
      clearQuestionUI = function (...args) {
        const result = originalClear(...args);
        resetRecap(); focus('dice'); return result;
      };
      const originalStart = startGame;
      startGame = function (...args) { const result = originalStart(...args); focus('dice'); return result; };
      const originalVictory = showVictory;
      showVictory = function (...args) { const result = originalVictory(...args); resetRecap(); focus('finish'); return result; };
      const originalNext = nextTurn;
      nextTurn = function (...args) { const result = originalNext(...args); if (phase === 'roll') focus('dice'); return result; };
      // In one-player mode a safe tile or overshoot should show the dice, too.
      const originalSafe = showSafeLanding;
      showSafeLanding = function (...args) { const result = originalSafe(...args); if (phase === 'feedback') focus('dice'); return result; };
    })();

  
