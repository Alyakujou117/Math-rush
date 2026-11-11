/* Radical Rush — Six-Realm Board Atmosphere
   Decorative renderer only. Never edits board tiles, movement, abilities or network state.
   The transparent, pointer-free canvas follows the board's original rectangle.
*/
(() => {
  'use strict';
  if (window.rrBiomeAtmosphere) return;
  const board = document.getElementById('board');
  const game = document.getElementById('gameScreen');
  if (!board || !game) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'rrBiomeAtmosphere';
  canvas.className = 'rr-biome-atmosphere';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) { canvas.remove(); return; }
  const motionControl = document.getElementById('settingMotion');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const realms = ['temple','forest','frost','volcano','cosmos','atlantis'];
  const tones = {
    temple:['#ffdf91','#f4c875','#fff4c8'],
    forest:['#9bf8a2','#d5ffad','#85d39a'],
    frost:['#e8faff','#b9e9ff','#ffffff'],
    volcano:['#ff9a40','#ffc663','#ef7151'],
    cosmos:['#d2bbff','#7ceaff','#f8ebff'],
    atlantis:['#81f2f2','#c6ffff','#62d9d4']
  };
  const rand=(a,b)=>a+Math.random()*(b-a);
  const isSmall=()=>window.innerWidth<720||window.matchMedia('(pointer:coarse)').matches;
  // Mobile and touch-screen mode uses a static, particle-free board for clarity
  // and to avoid browser-compositor jitter during portal challenges.
  const enabled=()=>!isSmall()&&!document.hidden&&!game.classList.contains('hidden')&&
    (!motionControl||motionControl.checked)&&!reduced.matches;
  const currentRealm=()=>{
    const theme=document.body.dataset.boardTheme || 'temple';
    return realms.includes(theme)?theme:'temple';
  };
  let realm='', particles=[], impacts=[], frame=0, last=0, lastPaint=0,
      W=0,H=0,D=1, boardWidth=0,boardHeight=0, emitted=0;
  let portalCache=[], portalCacheAt=0;
  function viewSize() {
    const vw=window.innerWidth,vh=window.innerHeight;
    if (W===vw&&H===vh&&canvas.width) return;
    W=vw;H=vh;D=Math.min(window.devicePixelRatio||1,isSmall()?1.15:1.5);
    canvas.width=Math.max(1,Math.round(W*D));
    canvas.height=Math.max(1,Math.round(H*D));
    ctx.setTransform(D,0,0,D,0,0);
  }
  function spawn(type,w,h,fromEdge=false) {
    const x=rand(0,w),y=rand(0,h),small=isSmall();
    const p={x,y,age:rand(0,600),size:rand(small?1.3:1.7,small?3.7:5.0),
      sway:rand(0,6.283),twinkle:rand(0,6.283),vx:rand(-5,5),vy:rand(-3,3),kind:'dot',
      color:tones[type][Math.floor(rand(0,3))]};
    switch(type) {
      case 'temple':
        p.kind=Math.random()<.17?'rune':'dust';p.vx=rand(5,15);p.vy=rand(-4,5);
        if(fromEdge) p.x=-10;break;
      case 'forest':
        p.kind=Math.random()<.28?'firefly':'leaf';p.vx=p.kind==='leaf'?rand(8,19):rand(-4,5);
        p.vy=p.kind==='leaf'?rand(12,24):rand(-5,4);p.size=p.kind==='leaf'?rand(4,7):rand(1.5,3);
        if(fromEdge) {p.x=p.kind==='leaf'?rand(-35,w):rand(0,w);p.y=-12;}break;
      case 'frost':
        p.kind=Math.random()<.16?'ice':'snow';p.vx=rand(-5,6);p.vy=rand(17,39);
        p.size=p.kind==='ice'?rand(3,5):rand(1.8,3.8);
        if(fromEdge) p.y=-10;break;
      case 'volcano':
        p.kind=Math.random()<.20?'ash':'ember';p.vx=rand(-9,9);p.vy=rand(-37,-15);
        p.size=p.kind==='ash'?rand(1.5,4):rand(1.7,3.4);
        if(fromEdge) p.y=h+10;break;
      case 'cosmos':
        p.kind=Math.random()<.1?'meteor':'star';p.vx=p.kind==='meteor'?rand(-22,-10):rand(-1,2);
        p.vy=p.kind==='meteor'?rand(15,28):rand(-1.3,1.3);
        p.size=p.kind==='meteor'?rand(2,4):rand(1.2,3);
        if(fromEdge&&p.kind==='meteor'){p.y=rand(-20,h*.2);p.x=rand(w*.2,w+10);}break;
      case 'atlantis':
        p.kind=Math.random()<.23?'plankton':'bubble';p.vx=rand(-6,6);p.vy=rand(-28,-10);
        p.size=p.kind==='bubble'?rand(2.8,6.5):rand(1.2,3);
        if(fromEdge) p.y=h+12;break;
    }
    return p;
  }
  function populate(w,h) {
    boardWidth=w;boardHeight=h;
    const density=Math.max(10,Math.min(isSmall()?18:31,Math.round(w*h/(isSmall()?15000:11000))));
    particles=Array.from({length:density},()=>spawn(realm,w,h));
    impacts=[]; portalCache=[]; portalCacheAt=0;
  }
  function move(p,dt,w,h) {
    p.age+=dt*1000; p.sway+=dt*(p.kind==='leaf'?2.5:1.3);
    p.x+=(p.vx+Math.sin(p.sway)*((p.kind==='leaf'||p.kind==='snow')?8:3))*dt;
    p.y+=p.vy*dt;
    if(p.x>w+20||p.x< -40||p.y>h+20||p.y< -32) Object.assign(p,spawn(realm,w,h,true));
  }
  function paintParticle(p,time) {
    const flicker=.73+.27*Math.sin(time*.002+p.twinkle);
    let alpha= (p.kind==='ash'?.24:p.kind==='dust'?.36:p.kind==='star'?.5:.53)*flicker;
    const s=p.size;
    ctx.strokeStyle=p.color;ctx.fillStyle=p.color;ctx.globalAlpha=alpha;
    ctx.save();ctx.translate(p.x,p.y);
    switch(p.kind) {
      case 'leaf': {
        ctx.rotate(p.sway*.5);
        ctx.beginPath();ctx.moveTo(0,-s);ctx.quadraticCurveTo(s*.8,-s*.5,s*.6,s*.7);
        ctx.quadraticCurveTo(-s*.7,s*.6,0,-s);ctx.fill();
        ctx.globalAlpha=alpha*.7;ctx.beginPath();ctx.moveTo(0,-s*.6);ctx.lineTo(s*.25,s*.6);ctx.stroke();break;
      }
      case 'firefly':case 'plankton':case 'ember': {
        ctx.shadowColor=p.color;ctx.shadowBlur=p.kind==='firefly'?13:8;
        ctx.beginPath();ctx.arc(0,0,s*.70,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;break;
      }
      case 'snow': {
        ctx.lineWidth=Math.max(.7,s*.28);
        for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI/3);
          ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke();ctx.restore();}break;
      }
      case 'ice':case 'star':case 'rune': {
        ctx.lineWidth=p.kind==='rune'?1.3:.8;
        ctx.rotate(p.sway*(p.kind==='rune'?.18:.04));
        if(p.kind==='rune'){
          ctx.strokeRect(-s,-s,s*2,s*2);
          ctx.beginPath();ctx.moveTo(-s*1.2,0);ctx.lineTo(s*1.2,0);ctx.stroke();
        }else{
          ctx.beginPath();ctx.moveTo(0,-s*1.8);ctx.lineTo(0,s*1.8);
          ctx.moveTo(-s*1.8,0);ctx.lineTo(s*1.8,0);ctx.stroke();
          ctx.beginPath();ctx.arc(0,0,Math.max(.5,s*.35),0,Math.PI*2);ctx.fill();
        }break;
      }
      case 'meteor':{
        ctx.lineWidth=Math.max(1,s*.48);ctx.globalAlpha=alpha*.75;
        ctx.beginPath();ctx.moveTo(s*6,-s*9);ctx.lineTo(0,0);ctx.stroke();
        ctx.beginPath();ctx.arc(0,0,s*.7,0,Math.PI*2);ctx.fill();break;
      }
      case 'bubble':{
        ctx.globalAlpha=alpha*.83;ctx.lineWidth=1.2;
        ctx.beginPath();ctx.arc(0,0,s,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=alpha*.7;ctx.beginPath();ctx.arc(-s*.25,-s*.3,Math.max(.6,s*.22),0,Math.PI*2);ctx.fill();break;
      }
      default:{ctx.beginPath();ctx.arc(0,0,s*.7,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
  function backdrop(w,h,time) {
    const backdropColors={temple:'239,178,86',forest:'70,239,125',frost:'178,225,255',
      volcano:'255,113,49',cosmos:'167,124,255',atlantis:'90,232,223'};
    const color=backdropColors[realm];
    const origin=realm==='volcano'?h:h*.1;
    const g=ctx.createLinearGradient(0,origin,0,realm==='volcano'?0:h);
    g.addColorStop(0,`rgba(${color},${realm==='volcano'?.105:.075})`);
    g.addColorStop(1,`rgba(${color},0)`);
    ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    if(realm==='atlantis'||realm==='cosmos') {
      ctx.save();ctx.globalAlpha=realm==='atlantis'?.095:.06;
      ctx.fillStyle=realm==='atlantis'?'#a4ffff':'#ded0ff';
      for(let j=0;j<3;j++) {
        const x=w*(j*.45-.08)+Math.sin(time*.0003+j)*w*.04;
        ctx.beginPath();ctx.moveTo(x,-5);ctx.lineTo(x+w*.085,-5);
        ctx.lineTo(x+w*.33,h);ctx.lineTo(x+w*.19,h);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    }
    if(realm==='volcano'){
      const g2=ctx.createRadialGradient(w*.5,h+20,0,w*.5,h+20,w*.75);
      g2.addColorStop(0,`rgba(255,111,50,${.095+Math.sin(time*.0016)*.02})`);
      g2.addColorStop(1,'rgba(255,111,50,0)');
      ctx.fillStyle=g2;ctx.fillRect(0,0,w,h);
    }
  }
  function getPortals(rect,now) {
    if(now-portalCacheAt<1700 && portalCache.length) return portalCache;
    portalCacheAt=now;portalCache=[];
    for(const tile of board.querySelectorAll('.tile.boost')){
      const t=tile.getBoundingClientRect();
      if(t.width>1) portalCache.push({x:t.left-rect.left+t.width/2,y:t.top-rect.top+t.height/2,r:t.width*.4});
    }
    return portalCache;
  }
  function portalGlow(rect,now) {
    const portals=getPortals(rect,now);
    if(!portals.length) return;
    const p=portals[Math.floor(now/2300)%portals.length];
    if(!p)return;
    ctx.save();ctx.globalAlpha=.13+.08*(Math.sin(now*.003)+1)/2;
    ctx.strokeStyle=tones[realm][0];ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(p.x,p.y,Math.max(5,p.r*(.8+.08*Math.sin(now*.002))),0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }
  function paint(now) {
    frame=0;
    if(!enabled()) {ctx.clearRect(0,0,W,H); return;}
    const cap=isSmall()?34:45;
    if(now-lastPaint<1000/cap){frame=requestAnimationFrame(paint);return;}
    lastPaint=now;
    viewSize();
    const rect=board.getBoundingClientRect();
    if(rect.width<40||rect.height<40){frame=requestAnimationFrame(paint);return;}
    const selected=currentRealm();
    if(selected!==realm || Math.abs(rect.width-boardWidth)>1 || Math.abs(rect.height-boardHeight)>1){
      realm=selected;populate(rect.width,rect.height);
    }
    const dt=Math.min(.04,Math.max(.002,last?(now-last)/1000:.022));last=now;
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.beginPath();ctx.rect(rect.left+1,rect.top+1,rect.width-2,rect.height-2);ctx.clip();
    ctx.translate(rect.left,rect.top);
    backdrop(rect.width,rect.height,now);
    for(const p of particles){move(p,dt,rect.width,rect.height);paintParticle(p,now);}
    portalGlow(rect,now);
    for (const p of impacts) {
      p.age+=dt*1000;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;
      if(p.age>p.life)continue;
      ctx.globalAlpha=.68*Math.pow(1-p.age/p.life,1.2);ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*(1-p.age/p.life*.3),0,Math.PI*2);ctx.fill();
    }
    impacts=impacts.filter(p=>p.age<p.life);
    ctx.restore(); ctx.globalAlpha=1;
    frame=requestAnimationFrame(paint);
  }
  function start() {
    if(!enabled() || frame)return;
    last=0;lastPaint=0;frame=requestAnimationFrame(paint);
  }
  function stop() {
    if(frame)cancelAnimationFrame(frame);frame=0;
    ctx.clearRect(0,0,W,H);
    last=0;
  }
  function refresh(){if(enabled())start();else stop();}
  function pulseAt(tile) {
    if(!enabled()||!tile)return;
    const b=board.getBoundingClientRect(),r=tile.getBoundingClientRect();
    if(!b.width||!r.width)return;
    const x=r.left-b.left+r.width/2,y=r.top-b.top+r.height/2;
    const names=tones[currentRealm()];
    for(let n=0,amount=isSmall()?5:9;n<amount;n++){
      const angle=rand(0,Math.PI*2),v=rand(20,63);
      impacts.push({x,y,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v,gravity:currentRealm()==='volcano'?-10:30,
        age:0,life:rand(420,740),size:rand(1.4,3.6),color:names[n%3]});
    }
    emitted++;
    start();
  }
  // Observe existing movement visual cue, without changing any game state.
  new MutationObserver(records=>{
    if(!enabled())return;
    for(const r of records){
      if(r.attributeName==='class'&&r.target.classList?.contains('tile')&&r.target.classList.contains('path-glow')){
        pulseAt(r.target);break;
      }
    }
  }).observe(board,{subtree:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(refresh).observe(game,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>{realm='';refresh();}).observe(document.body,{attributes:true,attributeFilter:['data-board-theme']});
  motionControl?.addEventListener('change',refresh);
  reduced.addEventListener?.('change',refresh);
  window.addEventListener('resize',()=>{W=0;});
  document.addEventListener('visibilitychange',refresh);
  start();
  window.rrBiomeAtmosphere=Object.freeze({
    version:'1.0',
    getTheme:currentRealm,
    getCounts:()=>({ambient:particles.length,landingBursts:emitted,remaining:impacts.length}),
    isActive:enabled,
    refresh
  });
})();

  
