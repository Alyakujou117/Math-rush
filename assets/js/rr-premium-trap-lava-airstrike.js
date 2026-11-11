/* Production-ready local vector assets and tactical animation. No rules are changed. */
(function(){
 'use strict';
 let uid=0;
 function bearTrap(){
  const k='rrBear'+(++uid);
  return `<svg class="rr-viz-hazard rr-viz-bear" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 110" role="img" aria-label="Animated steel bear trap">
   <defs><linearGradient id="${k}steel" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#f8fffd"/><stop offset=".25" stop-color="#b4cdd7"/><stop offset=".65" stop-color="#607789"/><stop offset="1" stop-color="#233b4c"/></linearGradient><linearGradient id="${k}edge"><stop stop-color="#304450"/><stop offset=".5" stop-color="#e6f5fa"/><stop offset="1" stop-color="#465e68"/></linearGradient></defs>
   <ellipse cx="64" cy="92" rx="53" ry="12" fill="#081421" opacity=".55"/>
   <path d="M13 62 Q64 97 115 62 L110 82 Q64 108 18 83Z" fill="#192936" stroke="#101b28" stroke-width="4"/>
   <ellipse cx="64" cy="75" rx="49" ry="27" fill="#304755" stroke="#101b29" stroke-width="6"/>
   <ellipse cx="64" cy="75" rx="42" ry="20" fill="#778b8b" stroke="#d5e7e6" stroke-width="2"/>
   <g class="rr-viz-jaw-bottom"><path d="M16 73 L23 51 32 62 41 45 51 61 62 45 73 62 85 45 95 62 106 52 113 73 Q64 104 16 73Z" fill="url(#${k}steel)" stroke="#1b3341" stroke-width="5" stroke-linejoin="round"/><path d="M21 78 Q64 97 108 77" fill="none" stroke="#eefcff" stroke-width="3" opacity=".9"/></g>
   <g class="rr-viz-jaw-top"><path d="M14 52 Q64 5 114 52 L107 69 98 51 88 66 78 49 65 65 53 49 41 66 31 50 21 67Z" fill="url(#${k}steel)" stroke="#213c48" stroke-width="5" stroke-linejoin="round"/><path d="M22 48 Q64 15 108 48" fill="none" stroke="#f7fbff" stroke-width="4" opacity=".78"/></g>
   <path d="M10 75 L29 86 M99 86 L119 75" stroke="url(#${k}edge)" stroke-width="7" stroke-linecap="round"/>
   <g class="rr-viz-coil"><circle cx="64" cy="85" r="12" fill="url(#${k}steel)" stroke="#223442" stroke-width="5"/><circle cx="64" cy="85" r="5" fill="#263a49" stroke="#f2fcff" stroke-width="2"/></g>
  </svg>`;
 }
 function lava(){
  const k='rrLava'+(++uid);
  return `<svg class="rr-viz-hazard rr-viz-lava" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 142 100" role="img" aria-label="Animated glowing lava puddle">
   <defs><radialGradient id="${k}m"><stop stop-color="#fff9a6"/><stop offset=".29" stop-color="#ffcf4a"/><stop offset=".60" stop-color="#fc7425"/><stop offset=".86" stop-color="#b92b20"/><stop offset="1" stop-color="#501720"/></radialGradient><linearGradient id="${k}c" x1=".2" y1="0" x2=".8" y2="1"><stop stop-color="#ffb144"/><stop offset="1" stop-color="#642124"/></linearGradient></defs>
   <ellipse cx="72" cy="80" rx="63" ry="15" fill="#141724" opacity=".53"/>
   <path d="M12 53 Q19 33 41 35 Q49 10 74 24 Q93 9 113 36 Q135 38 132 60 Q124 87 94 81 Q74 98 51 83 Q24 91 14 69Z" fill="#3e171e" stroke="#591b20" stroke-width="5"/>
   <path d="M13 54 Q23 39 38 40 Q49 26 66 29 Q88 16 105 42 Q126 40 127 58 Q118 77 96 74 Q68 88 54 76 Q27 84 17 68Z" fill="url(#${k}m)" stroke="#ffb43d" stroke-width="3"/>
   <g class="rr-viz-lava-core"><path d="M25 56 Q43 38 59 52 Q73 66 86 45 Q95 33 117 57 Q109 72 93 65 Q76 82 56 67 Q41 74 25 56Z" fill="#ffb32c" opacity=".95"/><path d="M28 53 Q45 45 57 56 Q72 73 86 51 Q96 45 108 54" fill="none" stroke="#fff8ab" stroke-linecap="round" stroke-width="6"/><path d="M42 69 Q56 62 70 73 Q81 77 96 69" fill="none" stroke="#ffe768" stroke-linecap="round" stroke-width="4"/></g>
   <g class="rr-viz-ripple" fill="none" stroke="#fff0a2" stroke-width="2.2" opacity=".85"><path d="M23 58 Q29 38 48 36"/><path d="M92 35 Q111 35 122 54"/><path d="M54 78 Q71 87 89 77"/></g>
   <g fill="#fff4a1"><circle class="rr-viz-bubble" cx="53" cy="43" r="4"/><circle class="rr-viz-bubble" cx="90" cy="51" r="3.6"/><circle class="rr-viz-bubble" cx="74" cy="32" r="2.8"/><circle class="rr-viz-bubble" cx="113" cy="64" r="2.8"/></g>
  </svg>`;
 }
 function plane(){return `<svg viewBox="0 0 180 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 55 L72 47 98 18 122 22 111 44 163 52 172 61 111 66 123 90 103 94 75 71 15 66Z" fill="#b1c9d1" stroke="#253b50" stroke-width="6" stroke-linejoin="round"/><path d="M72 48 L89 42 103 54 96 67 74 68" fill="#f9e4af" stroke="#445461" stroke-width="3"/><path d="M18 56 L160 57" stroke="#f4f7e8" stroke-width="4"/><path d="M91 40 L112 19" stroke="#e5f5f3" stroke-width="3"/><ellipse cx="88" cy="55" rx="12" ry="7" fill="#2e5b78" stroke="#e0f2eb" stroke-width="2"/><path d="M141 54 L151 54" stroke="#feab4b" stroke-width="4" stroke-linecap="round"/></svg>`;}
 function bomb(){return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 4 L43 23 43 53 Q30 76 17 53 L17 23Z" fill="#45596a" stroke="#fbe5a9" stroke-width="4"/><path d="M24 11 L18 3 M37 11 L43 3" stroke="#cde8f7" stroke-width="5" stroke-linecap="round"/><path d="M30 52 L30 68" stroke="#ff9c30" stroke-width="6"/><path d="M30 58 L18 77 M30 58 L42 77" stroke="#ffc65e" stroke-width="3"/></svg>`;}
 function inventory(id){
  if(id==='bear_trap')return bearTrap().replace('rr-viz-hazard rr-viz-bear','rr-viz-inventory rr-viz-bear');
  if(id==='lava_flask')return lava().replace('rr-viz-hazard rr-viz-lava','rr-viz-inventory rr-viz-lava');
  if(id==='air_strike')return `<svg class="rr-viz-inventory" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="26" fill="#263858" stroke="#fbd181" stroke-width="2"/><path d="M10 47 Q28 26 50 47" stroke="#ff8c30" stroke-width="6" fill="none"/><path d="M8 24 L24 22 33 7 39 9 35 22 53 25 56 31 36 31 37 44 32 47 23 33 9 31Z" fill="#c7dce2" stroke="#26384a" stroke-width="2"/><circle cx="29" cy="45" r="6" fill="#ffcf55" stroke="#ff652f" stroke-width="3"/></svg>`;
  return '';
 }
 window.rrToolArt={hazard:id=>id==='bear_trap'?bearTrap():id==='lava_flask'?lava():'',inventory};
 const oldVFX=window.rrFaithVFX;
 // Fullscreen mode hides DOM outside the fullscreen element; keep stage inside it.
 const stage=document.createElement('div'); stage.id='rrToolFxStage';stage.setAttribute('aria-hidden','true');document.body.append(stage);
 function host(){const f=document.fullscreenElement;return f||document.body;}
 function syncHost(){const h=host();if(stage.parentElement!==h)h.append(stage);}
 document.addEventListener('fullscreenchange',syncHost);
 const motionEnabled=()=>document.body.classList.contains('fx-enabled')&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function strike(actor,targets){
  if(document.getElementById('gameScreen')?.classList.contains('hidden'))return;
  syncHost();
  const list=[...new Set((targets||[]).filter(p=>Number.isInteger(p)))];
  list.forEach((p,i)=>{
   const n=typeof positions!=='undefined'?positions[p]:null;
   const cell=n?document.querySelector('#board [data-tile="'+n+'"]'):null;
   const token=document.querySelector('#board .token[data-player="'+p+'"]');
   const target=cell||token;if(!target)return;
   const r=target.getBoundingClientRect();
   if(!r.width||!r.height)return;
   const size=Math.max(window.innerWidth<680?82:102,Math.min(160,Math.max(r.width,r.height)*1.65));
   const x=Math.max(size/2,Math.min(window.innerWidth-size/2,r.x+r.width/2));
   const y=Math.max(size/2,Math.min(window.innerHeight-size/2,r.y+r.height/2));
   const node=document.createElement('div');node.className='rr-strike-phase';node.dataset.target=String(p);
   node.style.cssText=`left:${x}px;top:${y}px;--strike-size:${size}px;animation-delay:${i*100}ms`;
   node.innerHTML=`<svg class="rr-strike-crosshair" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="36" fill="none" stroke="#ffcd5e" stroke-width="2" stroke-dasharray="6 3"/><circle cx="50" cy="50" r="24" fill="#ffe59626" stroke="#fff1a6" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="#fff3a0"/><path d="M50 4 V33 M50 67 V96 M4 50 H33 M67 50 H96" fill="none" stroke="#ffc85b" stroke-width="3"/></svg><span class="rr-strike-lock-label">TARGET LOCKED</span><div class="rr-strike-aircraft">${plane()}</div><div class="rr-strike-bomb">${bomb()}</div><div class="rr-strike-explosion"></div><div class="rr-strike-ring"></div>`;
   for(let j=0;j<9;j++){
    const sp=document.createElement('div');sp.className='rr-strike-spark';
    const a=2*Math.PI*j/9; const dist=size*(.55+(j%3)*.18);
    sp.style.setProperty('--spark-x',Math.cos(a)*dist+'px');sp.style.setProperty('--spark-y',Math.sin(a)*dist+'px');node.append(sp);
   }
   stage.append(node);
   if(!motionEnabled()){
    for(const child of node.children){if(child.classList.contains('rr-strike-explosion')){child.style.opacity='1';child.style.transform='scale(.72)';}else child.style.display='none';}
   }
   setTimeout(()=>node.remove(),motionEnabled()?1450+i*100:500);
  });
 }
 if(oldVFX){oldVFX.airstrike=strike;oldVFX.sync?.();}
 window.rrToolArt.playAirstrike=strike;
 window.rrFaithChests?.renderHazards?.();
})();
