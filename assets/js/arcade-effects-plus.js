/* Radical Rush · Arcade Effects Plus
   Standalone visual layer: zero game-state, scoring, layout or network changes.
   Reads DOM transitions so players on this device see the same visual cues.
*/
(function () {
  'use strict';
  if (window.rrArcadeEffectsPlus) return;
  const $ = id => document.getElementById(id);
  const game = $('gameScreen');
  const board = $('board');
  if (!game || !board) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'rrfx-canvas';
  canvas.id = 'rrArcadeEffectsCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { canvas.remove(); return; }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, scale = 1, frame = 0, stamp = 0;
  let sparks = [], wheelInterval = null, lastStep = '', lastStepTime = 0;
  const random = (a, b) => a + Math.random() * (b - a);
  // Keep desktop bursts; don't render the arcade spark canvas on phones/touch devices.
  const active = () => !mobile() && !game.classList.contains('hidden') && !document.hidden &&
    !reduce.matches && ($('settingMotion')?.checked !== false);
  const mobile = () => window.innerWidth < 680 || window.matchMedia('(pointer: coarse)').matches;
  function topLayer() {
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    return dialogs.length ? dialogs[dialogs.length - 1] : document.body;
  }
  function attach() {
    const parent = topLayer();
    if (canvas.parentNode !== parent) parent.append(canvas);
  }
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (width === w && height === h && canvas.width) return;
    width = w; height = h;
    scale = Math.min(window.devicePixelRatio || 1, mobile() ? 1.25 : 1.5);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  function center(node) {
    if (!node || !node.isConnected) return null;
    const r = node.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function tilePoint(n) { return center(board.querySelector('[data-tile="' + n + '"]')); }
  const colors = {
    wheel: ['#fef6c7', '#8ef3ff', '#9ecaff', '#ffe19d'],
    portal: ['#68fff1', '#a997ff', '#d4f9ff', '#76b7ff'],
    gold: ['#ffdf75', '#fff7c6', '#ffaf67', '#f7eb9a'],
    good: ['#78ffd8', '#d8fff2', '#84eaff', '#fff6bd'],
    bad: ['#ff91ba', '#ffd2d9', '#e6a5ff', '#fff1df'],
    walk: ['#c7eaff', '#fff2c2', '#80ffde', '#d6b5ff']
  };
  function add(p) {
    const max = mobile() ? 70 : 125;
    if (sparks.length >= max) sparks.splice(0, sparks.length - max + 1);
    sparks.push(p);
  }
  function burst(point, palette, amount, options = {}) {
    if (!active() || !point) return;
    attach(); resize();
    const tones = colors[palette] || colors.portal;
    const count = Math.min(amount, mobile() ? 19 : 37);
    const speed = options.speed || 145;
    const life = options.life || 750;
    for (let i = 0; i < count; i++) {
      const a = i * 2 * Math.PI / count + random(-.28, .28);
      const v = random(.4, 1.1) * speed;
      add({ x: point.x, y: point.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        gravity: options.gravity ?? 90, drag: random(.90,.98),
        life: life * random(.72,1.26), age: 0,
        size: random(2.1, 5.5), spin: random(-4,4), angle: random(0,7),
        shape: i % 4 === 0 ? 'diamond' : 'glow', color: tones[i % tones.length] });
    }
    start();
  }
  function shower(point, amount, palette = 'gold') {
    if (!active() || !point) return;
    attach(); resize();
    const tones = colors[palette] || colors.gold;
    for (let i = 0, n = Math.min(amount, mobile() ? 30 : 65); i < n; i++) {
      const x = point.x + random(-Math.min(width*.40, 280), Math.min(width*.40, 280));
      add({ x, y: point.y + random(-160,-10), vx: random(-35,35), vy: random(-20,55),
        gravity: random(170,300), drag:.99,
        life: random(1300,2200), age:0, size: random(3,7), angle: random(0,7), spin:random(-7,7),
        shape: i%3===0?'diamond':'rect', color: tones[i%tones.length] });
    }
    start();
  }
  function start() { if (!frame) { stamp = performance.now(); frame = requestAnimationFrame(draw); } }
  function draw(now) {
    frame = 0;
    if (!active()) { sparks.length = 0; ctx.clearRect(0,0,width,height); return; }
    attach(); resize();
    const dt = Math.min(0.044, Math.max(0.003, (now-stamp)/1000)); stamp = now;
    ctx.clearRect(0,0,width,height);
    ctx.save();
    for (const p of sparks) {
      p.age += dt*1000;
      const time = p.age / p.life;
      if (time >= 1) continue;
      p.x += p.vx*dt; p.y += p.vy*dt;
      p.vx *= Math.pow(p.drag, dt*60);
      p.vy += p.gravity*dt;
      p.angle += p.spin*dt;
      const opacity = time < .12 ? time/.12 : Math.pow(1-time, .9);
      ctx.globalAlpha = Math.min(1, opacity*.94);
      ctx.fillStyle = p.color;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle);
      const s = p.size * (1 - time*.25);
      if (p.shape === 'glow') {
        ctx.shadowColor = p.color; ctx.shadowBlur = mobile()?5:9;
        ctx.beginPath(); ctx.arc(0,0,Math.max(.5,s*.65),0,Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.shape === 'diamond') {
        ctx.beginPath(); ctx.moveTo(0,-s*1.6);ctx.lineTo(s*.8,0);ctx.lineTo(0,s*1.6);ctx.lineTo(-s*.8,0);ctx.closePath();ctx.fill();
      } else ctx.fillRect(-s*.6,-s*.6,s*1.2,s*1.2);
      ctx.restore();
    }
    ctx.restore();
    sparks = sparks.filter(p => p.age < p.life);
    if (sparks.length) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0,0,width,height);
  }
  // The wheel and its output already handle game state. Enhance only their visible transitions.
  const wheel = $('dice');
  if (wheel) {
    let wasSpinning = wheel.classList.contains('is-rolling');
    new MutationObserver(() => {
      const spinning = wheel.classList.contains('is-rolling');
      if (spinning === wasSpinning) return;
      wasSpinning = spinning;
      if (spinning) {
        burst(center(wheel), 'wheel', 21, { speed:110 });
        clearInterval(wheelInterval);
        wheelInterval = setInterval(() => {
          if (!wheel.isConnected || !wheel.classList.contains('is-rolling') || !active()) {
            clearInterval(wheelInterval); wheelInterval=null; return;
          }
          const pt = center(wheel);
          if (pt) burst({ x:pt.x+random(-25,25),y:pt.y+random(-25,25)}, 'wheel', 3, {speed:55,life:450,gravity:0});
        }, 230);
      } else {
        clearInterval(wheelInterval); wheelInterval=null;
        if (wheel.classList.contains('is-landed')) burst(center(wheel),'gold',27,{speed:160,gravity:125});
      }
    }).observe(wheel, {attributes:true,attributeFilter:['class']});
  }
  // New sparks follow the animated path glow; the board itself is never modified.
  new MutationObserver(records => {
    if (!active()) return;
    for (const m of records) {
      if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
      const el = m.target;
      if (!el?.classList?.contains('tile') || !el.classList.contains('path-glow')) continue;
      const n = el.dataset.tile;
      const now = performance.now();
      if (!n || (n===lastStep && now-lastStepTime<350)) continue;
      lastStep = n; lastStepTime = now;
      burst(center(el), 'walk', 5, {speed:50,gravity:125,life:490});
    }
  }).observe(board,{subtree:true,attributes:true,attributeFilter:['class']});
  // Portal visit / question result: read the game's status and feedback, never change either.
  const status = $('status');
  if (status) {
    let previous='';
    new MutationObserver(() => {
      const message=status.textContent || '';
      if (message===previous) return;
      previous=message;
      const m=message.match(/entered a mystery portal on tile\s+(\d+)/i);
      if (m) burst(tilePoint(m[1]),'portal',35,{speed:185,gravity:-10,life:1050});
    }).observe(status,{subtree:true,childList:true,characterData:true});
  }
  const card = $('rrPortalFate');
  if (card) {
    let flipped=card.classList.contains('rr-card-flipped');
    new MutationObserver(() => {
      const next=card.classList.contains('rr-card-flipped') && !card.classList.contains('hidden');
      if (!flipped && next) burst(center($('rrFateCard')) || center(card),'portal',36,{speed:195,gravity:10,life:1000});
      flipped=next;
    }).observe(card,{attributes:true,attributeFilter:['class']});
  }
  const feedback=$('feedback');
  if (feedback) {
    let previous='';
    new MutationObserver(() => {
      const text=feedback.textContent.trim();
      if (!text || text===previous) { previous=text; return; }
      previous=text;
      const pt=center($('challenge')) || center(feedback);
      if (/^✓\s*Correct/i.test(text)) burst(pt,'good',27,{speed:135,gravity:45});
      else if (/^(✕|⌛)/.test(text)) burst(pt,'bad',13,{speed:100,gravity:110,life:620});
    }).observe(feedback,{childList:true,subtree:true,characterData:true});
  }
  const treasure=$('rrPrizeOverlay');
  if (treasure) {
    let rewarded=treasure.classList.contains('rr-prize-win');
    new MutationObserver(() => {
      const next=treasure.classList.contains('rr-prize-win') && !treasure.classList.contains('hidden');
      if (!rewarded && next) shower(center(treasure.querySelector('.rr-prize-wheel-glyph')) || center(treasure),48,'gold');
      rewarded=next;
    }).observe(treasure,{attributes:true,attributeFilter:['class']});
  }
  const winner=$('winner');
  if (winner) {
    let appeared=!winner.classList.contains('hidden');
    new MutationObserver(() => {
      const next=!winner.classList.contains('hidden');
      if (!appeared && next) {
        burst(center(winner),'gold',35,{speed:220,gravity:65,life:1350});
        shower({x:width?width/2:window.innerWidth/2,y:85},75,'gold');
      }
      appeared=next;
    }).observe(winner,{attributes:true,attributeFilter:['class']});
  }
  // Stop rendering whenever the player leaves the game screen. No background animation loop.
  new MutationObserver(() => {
    if (!active()) {
      clearInterval(wheelInterval); wheelInterval=null;
      sparks.length=0;
      if (frame) cancelAnimationFrame(frame); frame=0;
      ctx.clearRect(0,0,width,height);
    }
  }).observe(game,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { sparks.length=0; if(frame) cancelAnimationFrame(frame);frame=0; }
  });
  window.rrArcadeEffectsPlus = Object.freeze({
    version:'1.0',
    burst:(name,elementId)=>burst(center($(elementId)) || center(board),name||'portal',24),
    active,
    getParticleCount:()=>sparks.length
  });
})();
