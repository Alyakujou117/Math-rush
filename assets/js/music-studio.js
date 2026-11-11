    /* Radical Rush Music Studio · five original instrumental loops, independently configurable. */
    (function () {
      'use strict';
      const STORAGE_KEY = 'radical-rush-music-studio-v1';
      const TRACKS = [
        ['portal-overture', 'Portal Overture · Fantasy'],
        ['enchanted-grove', 'Enchanted Grove · Calm'],
        ['starbound-drift', 'Starbound Drift · Cosmic'],
        ['arcade-sprint', 'Arcade Sprint · Energetic'],
        ['victory-lights', 'Victory Lights · Celebration']
      ];
      const CHOICES = new Set(TRACKS.map(item => item[0]));
      const SOURCES = window.RR_EMBEDDED_MUSIC || Object.fromEntries(TRACKS.map(([id]) => [id, 'assets/audio/' + id + '.mp3']));
      const ids = { menu: 'rrMusicMenuTrack', game: 'rrMusicGameTrack', victory: 'rrMusicVictoryTrack' };
      const defaults = { enabled: true, volume: 40, menu: 'portal-overture', game: 'arcade-sprint', victory: 'victory-lights' };
      let prefs = { ...defaults };
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (stored && typeof stored === 'object') {
          prefs.enabled = stored.enabled !== false;
          prefs.volume = Number.isFinite(Number(stored.volume)) ? Math.max(0, Math.min(100, Number(stored.volume))) : defaults.volume;
          for (const part of Object.keys(ids)) if (CHOICES.has(stored[part])) prefs[part] = stored[part];
        }
      } catch (_) { /* private mode may block storage */ }
      const el = id => document.getElementById(id);
      const status = text => { if (el('rrMusicStatus')) el('rrMusicStatus').textContent = text; };
      const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (_) { } };
      let allowed = false, active = null, old = null, activeId = '', previewId = null, quickMuted = false;
      let lastScene = 'menu', seq = 0, fadeFrame = 0, blocked = false, hiddenPaused = false;
      function hidden(id) { return !el(id) || el(id).classList.contains('hidden'); }
      function scene() {
        if (!hidden('gameScreen')) {
          lastScene = hidden('winner') ? 'game' : 'victory';
          return lastScene;
        }
        if (!hidden('settingsScreen')) return lastScene;
        lastScene = 'menu'; return lastScene;
      }
      const currentId = () => previewId || prefs[scene()];
      const labelFor = id => TRACKS.find(t => t[0] === id)?.[1].split(' · ')[0] || 'Music';
      function targetVolume() { return prefs.enabled && !quickMuted ? Math.min(.85, Math.max(0, prefs.volume / 100) * .72) : 0; }
      function updateUI() {
        el('rrMusicEnabled').checked = prefs.enabled;
        el('rrMusicVolume').value = prefs.volume;
        el('rrMusicVolumeValue').textContent = prefs.volume + '%';
        for (const [part, id] of Object.entries(ids)) el(id).value = prefs[part];
        for (const select of Object.values(ids)) el(select).disabled = !prefs.enabled;
        for (const b of document.querySelectorAll('.rr-music-preview')) b.disabled = !prefs.enabled;
        el('rrMusicStopPreview').classList.toggle('hidden', !previewId);
        window.refreshAudioUI?.();
      }
      function cancelFade() { if (fadeFrame) cancelAnimationFrame(fadeFrame); fadeFrame = 0; }
      function stopElement(element) { if (element) { element.pause(); element.currentTime = 0; } }
      function stopAll() {
        ++seq; cancelFade(); stopElement(active); stopElement(old); active = null; old = null; activeId = '';
      }
      function adjustVolume() {
        if (active && !fadeFrame) active.volume = targetVolume();
        if (old && !fadeFrame) old.volume = 0;
      }
      function fadeIn(newPlayer, oldPlayer) {
        cancelFade(); const begin = performance.now(), duration = 550;
        const initialOld = oldPlayer?.volume || 0;
        const tick = now => {
          const t = Math.min(1, (now - begin) / duration), ease = t * t * (3 - 2 * t);
          if (newPlayer) newPlayer.volume = Math.min(1, targetVolume() * ease);
          if (oldPlayer) oldPlayer.volume = Math.max(0, initialOld * (1 - ease));
          if (t < 1) { fadeFrame = requestAnimationFrame(tick); } else {
            fadeFrame = 0; if (oldPlayer) { stopElement(oldPlayer); if (old === oldPlayer) old = null; }
          }
        };
        fadeFrame = requestAnimationFrame(tick);
      }
      function playTrack(force = false) {
        if (quickMuted || !allowed || document.hidden || !prefs.enabled || prefs.volume === 0) {
          if (!prefs.enabled || prefs.volume === 0) stopAll();
          return;
        }
        const id = currentId();
        if (active && activeId === id) {
          if (active.paused) active.play().then(() => { blocked = false; status('♫ Playing: ' + labelFor(id)); }).catch(() => { blocked = true; status('Tap ▶ to enable music on this device.'); });
          adjustVolume(); return;
        }
        if (!force && activeId === id) return;
        const token = ++seq;
        const next = new Audio(SOURCES[id]);
        next.loop = true; next.preload = 'auto'; next.volume = 0;
        next.addEventListener('error', () => {
          if (token === seq) status('This track could not load. Please choose another track.');
        }, { once: true });
        const attempt = next.play();
        if (!attempt || typeof attempt.then !== 'function') return;
        attempt.then(() => {
          if (token !== seq) { stopElement(next); return; }
          if (old) { stopElement(old); old = null; }
          old = active; active = next; activeId = id; blocked = false;
          status((previewId ? '♫ Previewing: ' : '♫ Playing: ') + labelFor(id));
          fadeIn(active, old);
        }).catch(() => {
          if (token === seq) { blocked = true; status('Tap ▶ to enable music on this device.'); }
        });
      }
      function syncScene() {
        if (quickMuted) return;
        const next = scene();
        if (previewId && hidden('settingsScreen')) { previewId = null; updateUI(); }
        if (allowed && !document.hidden && (activeId !== currentId() || blocked)) playTrack();
        else if (allowed && active && next && !previewId) adjustVolume();
      }
      function firstGesture() {
        if (!allowed) { allowed = true; playTrack(true); }
      }
      // Gesture unlock is required by mobile browsers and avoids unsolicited autoplay.
      document.addEventListener('pointerdown', firstGesture, { capture: true, passive: true });
      document.addEventListener('keydown', firstGesture, { capture: true });
      for (const [part, id] of Object.entries(ids)) {
        const select = el(id);
        for (const [key, label] of TRACKS) { const option = new Option(label, key); select.add(option); }
        select.addEventListener('change', () => {
          prefs[part] = select.value; save();
          if (!previewId && scene() === part) { stopElement(old); playTrack(); }
          else status('Saved ' + part + ' music: ' + labelFor(select.value));
        });
      }
      el('rrMusicEnabled').addEventListener('change', e => {
        prefs.enabled = e.target.checked; save(); if (!prefs.enabled) previewId = null; updateUI();
        if (!prefs.enabled) { stopAll(); status('Background music is off.'); }
        else { allowed = true; playTrack(true); }
      });
      el('rrMusicVolume').addEventListener('input', e => {
        prefs.volume = Number(e.target.value); el('rrMusicVolumeValue').textContent = prefs.volume + '%'; save();
        if (prefs.volume === 0) { stopAll(); status('Music volume is 0%.'); }
        else if (allowed) { if (active) adjustVolume(); else playTrack(true); }
      });
      for (const button of document.querySelectorAll('[data-rr-preview]')) {
        button.addEventListener('click', () => {
          if (!prefs.enabled) return;
          previewId = el(ids[button.dataset.rrPreview]).value;
          allowed = true; updateUI(); playTrack(true);
        });
      }
      el('rrMusicStopPreview').addEventListener('click', () => {
        previewId = null; updateUI(); playTrack(true);
      });
      // When saving or leaving Settings, restore the track appropriate to the scene.
      const observer = new MutationObserver(() => queueMicrotask(syncScene));
      for (const id of ['menuScreen', 'setupScreen', 'rulesScreen', 'settingsScreen', 'gameScreen', 'winner']) {
        const node = el(id); if (node) observer.observe(node, { attributes: true, attributeFilter: ['class'] });
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { hiddenPaused = true; active?.pause(); old?.pause(); cancelFade(); }
        else if (hiddenPaused) { hiddenPaused = false; if (!quickMuted) active?.play().then(() => adjustVolume()).catch(() => status('Tap ▶ to resume music.')); }
      });
      window.addEventListener('pagehide', () => { active?.pause(); old?.pause(); });
      document.addEventListener('click', e => {
        if (e.target.closest('#saveSettings,#settingsBack')) queueMicrotask(syncScene);
      });
      updateUI();
      if (!prefs.enabled) status('Background music is off.');
      else status('Music begins after your first tap or click.');
      function setQuickMuted(value) {
        quickMuted = !!value;
        if (quickMuted) {
          ++seq; cancelFade();
          if (active) { active.pause(); active.volume = 0; }
          if (old) { stopElement(old); old = null; }
          status('Audio muted.');
        } else if (prefs.enabled && prefs.volume > 0) {
          allowed = true; playTrack(true);
        } else {
          status('Background music is disabled in Settings.');
        }
        window.refreshAudioUI?.();
      }
      window.rrMusicStudio = { getSettings: () => ({ ...prefs }), getTrack: () => activeId, isPlaying: () => !!active && !active.paused && !quickMuted, stop: stopAll, setQuickMuted, isQuickMuted: () => quickMuted };
      window.refreshAudioUI?.();
    })();

  
