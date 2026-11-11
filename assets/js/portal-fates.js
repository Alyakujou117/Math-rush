    /* Radical Rush: Portal of Fate. Original prize roulette visuals and rewards. */
    (function () {
      'use strict';
      const $ = id => document.getElementById(id);
      const state = { open: false, token: 0, cardToken: 0, cardOutcome: null, flipping: false };
      const names = { ladder: 'Ladder', lair: "Dragon's Lair", chest: 'Chest of Faith' };
      const icons = { ladder: '🪜', lair: '🐉', chest: '🎁' };
      const messages = { ladder: 'A path forward awaits!', lair: 'Watch out! A backward slide!', chest: 'A mystery reward is waiting!' };
      const root = document.createElement('div');
      root.id = 'rrPortalFate'; root.className = 'rr-portal-fate hidden';
      root.innerHTML = `<div class="rr-fate-heading"><span>✧ PORTAL MYSTERY CARD</span><small>ONE RANDOM FATE PER VISIT</small></div>
 <div class="rr-card-stage">
 <button type="button" id="rrFateCard" class="rr-mystery-card" aria-label="Flip the mystery card to reveal your portal fate">
 <span class="rr-card-inner">
  <span class="rr-card-face rr-card-back" aria-hidden="true">
   <span class="rr-card-corner rr-corner-top">✦</span><span class="rr-card-sigil">✧</span>
   <span class="rr-card-question">?</span><span class="rr-card-back-title">PORTAL OF FATE</span>
   <span class="rr-card-back-footer">MYSTERY CARD</span><span class="rr-card-corner rr-corner-bottom">✦</span>
  </span>
  <span class="rr-card-face rr-card-front" aria-hidden="true">
   <span class="rr-card-reveal-heading">YOUR FATE</span><span id="rrFateIcon" class="rr-card-fate-icon">✦</span>
   <strong id="rrFateName" class="rr-card-fate-name">MYSTERY</strong><span id="rrFateSubtitle" class="rr-card-fate-subtitle">A NEW ADVENTURE</span>
   <span class="rr-card-front-star">✧ ✦ ✧</span>
  </span>
 </span></button></div>
 <div class="rr-fate-result" id="rrPortalFateResult" role="status">Tap the face-down card to reveal your fate.</div>`;
      $('question')?.before(root);
      const button = root.querySelector('#rrFateCard');
      const result = root.querySelector('#rrPortalFateResult');
      function clear() {
        ++state.cardToken; state.cardOutcome = null; state.flipping = false;
        root.className = 'rr-portal-fate hidden'; delete root.dataset.result;
        button.disabled = false; button.setAttribute('aria-label', 'Flip the mystery card to reveal your portal fate');
      }
      function showClosed(outcome, canFlip = true) {
        if (!names[outcome]) { clear(); return; }
        ++state.cardToken; state.flipping = false; state.cardOutcome = outcome;
        root.className = 'rr-portal-fate'; delete root.dataset.result;
        button.disabled = !canFlip;
        button.setAttribute('aria-label', canFlip ? 'Flip the mystery card to reveal your portal fate' : 'Waiting for the current player to flip the mystery card');
        result.textContent = canFlip ? 'Tap the face-down card to reveal your fate.' : 'Waiting for the current player to reveal the card…';
      }
      function setFront(outcome) {
        root.dataset.result = outcome;
        $('rrFateIcon').textContent = icons[outcome]; $('rrFateName').textContent = names[outcome];
        $('rrFateSubtitle').textContent = messages[outcome];
      }
      function showRevealed(outcome) {
        if (!names[outcome]) { clear(); return; }
        ++state.cardToken; state.cardOutcome = outcome; state.flipping = false;
        root.className = 'rr-portal-fate rr-card-flipped rr-card-compact';
        setFront(outcome); button.disabled = true;
        button.setAttribute('aria-label', names[outcome] + ' revealed');
        result.textContent = icons[outcome] + ' ' + names[outcome] + ' revealed! Answer the challenge below.';
      }
      function flip(outcome, onComplete) {
        if (!names[outcome] || state.flipping || root.classList.contains('rr-card-flipped') || root.classList.contains('hidden')) return;
        if (state.cardOutcome !== outcome) return;
        state.flipping = true; const token = ++state.cardToken;
        button.disabled = true; setFront(outcome);
        root.classList.remove('rr-card-no-motion'); // The card flip is an essential gameplay animation, even in Reduce Motion.
        button.setAttribute('aria-label', names[outcome] + ' revealed');
        root.classList.add('rr-card-flipped');
        result.textContent = '✨ Revealing your portal fate…';
        try { sound('portal') } catch (_) { }
        const reduced = false; // Never skip the mystery-card flip.
        setTimeout(() => {
          if (token !== state.cardToken) return;
          state.flipping = false; root.classList.add('rr-card-compact');
          result.textContent = icons[outcome] + ' ' + names[outcome] + ' revealed! Answer the challenge below.';
          if (typeof onComplete === 'function') onComplete();
        }, reduced ? 0 : 850);
      }
      button.addEventListener('click', () => { if (!button.disabled) window.rrPortalFates?.onCardClick?.() });
      // Clear the mystery card only when leaving a portal challenge.
      const oldClear = clearQuestionUI;
      clearQuestionUI = function (...args) { const ret = oldClear(...args); clear(); return ret; };
      const prizeTypes = [
        { id: 'ank_shield', name: 'Ank Shield', icon: '🛡️' },
        { id: 'mana_power', name: 'Mana Power', icon: '🔮' },
        { id: 'bear_trap', name: 'Bear Trap', icon: '🪤' },
        { id: 'air_strike', name: 'Air Strike', icon: '💥' },
        { id: 'snowball', name: 'Snowball', icon: '❄️' },
        { id: 'lava_flask', name: 'Lava Flask', icon: '🧪' }
      ];
      const pickWeights = ['ank_shield','ank_shield','mana_power','mana_power','bear_trap','air_strike','snowball','lava_flask'];
      function openChest(tile, player) {
        const overlay = $('rrPrizeOverlay');
        if (!overlay) { const pick = window.rrFaithChests?.pickReward?.() || pickWeights[Math.floor(Math.random() * pickWeights.length)]; return Promise.resolve(window.rrExpeditionBridge?.claimPortalPrize?.(player,pick) || pick); }
        const token = ++state.token; state.open = true;
        const pick = window.rrFaithChests?.pickReward?.() || pickWeights[Math.floor(Math.random() * pickWeights.length)];
        const glyph = overlay.querySelector('.rr-prize-wheel-glyph');
        const label = overlay.querySelector('.rr-prize-wheel-name');
        const head = overlay.querySelector('.rr-prize-heading');
        const button = overlay.querySelector('.rr-prize-skip');
        head.textContent = '✦ CHEST OF FAITH ✦'; button.textContent = 'Reveal now';
        overlay.querySelector('.rr-prize-description').textContent = 'Open the chest to discover a shield, a blessing, or a useful tool.';
        overlay.classList.remove('hidden', 'rr-prize-win');
        return new Promise(resolve => {
          let finished = false, awarded = false, actual = null;
          const timers = [];
          const after = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t) };
          function award() {
            if (awarded) return; awarded = true;
            actual = window.rrExpeditionBridge?.claimPortalPrize?.(player, pick) || pick;
            const item = prizeTypes.find(r => r.id === actual) || prizeTypes[0];
            const rewardInfo = window.rrFaithChests?.ITEMS?.find(r => r.id === actual);
            if (rewardInfo) overlay.querySelector('.rr-prize-description').textContent = rewardInfo.group.toUpperCase() + ' · ' + rewardInfo.description;
            glyph.innerHTML = window.rrIconKit?.markup(item.id) || item.icon; label.textContent = item.name;
            overlay.dataset.faithReward = actual; overlay.classList.add('rr-prize-win'); head.textContent = 'CHEST OF FAITH OPENED!';
            button.textContent = 'Continue';
            sound('good'); log('🎁 ' + nameOf(player) + ' won ' + item.name + ' from portal ' + tile + '!');
            renderStandings();
          }
          function finish() {
            if (finished || token !== state.token) return;
            finished = true; award(); timers.forEach(clearTimeout);
            overlay.classList.add('hidden'); overlay.classList.remove('rr-prize-win'); delete overlay.dataset.faithReward;
            button.onclick = null; state.open = false;
            resolve(actual);
          }
          button.onclick = () => { if (!awarded) award(); else finish(); };
          if (!motionOn()) {
            award(); after(finish, 450); return;
          }
          let tick = 0;
          function spin() {
            if (finished || awarded || token !== state.token) return;
            if (tick >= 15) { award(); after(finish, 1000); return; }
            const prize = prizeTypes[(tick * 3 + Math.floor(tick / 2)) % prizeTypes.length];
            glyph.innerHTML = window.rrIconKit?.markup(prize.id) || prize.icon; label.textContent = prize.name;
            if (tick % 3 === 0) sound('diceTick'); tick++;
            after(spin, 85 + tick * 3);
          }
          spin();
        });
      }
      window.rrPortalFates = { showClosed, showRevealed, flip, clear, openChest, names, onCardClick: () => revealPortalCard(), onRevealed: null };
    })();

  
