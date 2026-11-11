/* Mobile organizer: navigates existing sections, never replaces game mechanics. */
(function(){
 'use strict';
 const game=document.getElementById('gameScreen');
 const first=game?.querySelector('.sidebar > .game-panel:first-child');
 const board=game?.querySelector('.board-card');
 const title=game?.querySelector('.screen-title');
 const actions=title?.children[1];
 if(!game||!first||!board||!actions)return;
 const mq=window.matchMedia('(max-width:680px)');
 const original=[...actions.children].filter(el=>el.nodeType===1);
 const anchors=original.map(el=>{const c=document.createComment('game action anchor');actions.insertBefore(c,el);return c;});
 const menu=document.createElement('details');menu.id='rrGameMore';
 menu.innerHTML='<summary aria-label="More game controls">⚙ More</summary><div class="rr-game-more-popover" aria-label="Game controls"></div>';
 actions.append(menu);
 const pop=menu.querySelector('.rr-game-more-popover');
 function applyLayout(){
  if(mq.matches){original.forEach(el=>{if(el.parentNode!==pop)pop.append(el);});menu.hidden=false;}
  else{original.forEach((el,i)=>{if(el.previousSibling!==anchors[i])anchors[i].after(el);});menu.hidden=true;menu.open=false;}
 }
 applyLayout();
 if(mq.addEventListener)mq.addEventListener('change',applyLayout);else mq.addListener(applyLayout);
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
 menu.addEventListener('click',e=>{if(e.target.closest('button'))menu.open=false;});
 const dock=document.createElement('nav');dock.id='rrMobileDock';dock.setAttribute('aria-label','Mobile game navigation');
 const items=[['play','lucky','Play'],['map','scout','Map'],['info','scales','Race Info']];
 items.forEach(([id,icon,label])=>{
  const button=document.createElement('button');button.type='button';button.className='rr-dock-btn';button.dataset.destination=id;
  button.setAttribute('aria-label',id==='play'?'Go to wheel and abilities':id==='map'?'Go to the world map':'Open race information');
  const badge=document.createElement('span');badge.innerHTML=window.rrIconKit?.markup(icon)||'✦';
  const text=document.createElement('span');text.textContent=label;button.append(badge,text);
  if(id==='play')button.setAttribute('aria-current','page');
  dock.append(button);
 });
 document.body.append(dock);
 let active='play';
 function setActive(id){active=id;dock.querySelectorAll('button').forEach(b=>{if(b.dataset.destination===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
 function gotoSection(el){if(!el)return;const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;el.scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});}
 dock.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-destination]');if(!btn)return;
  const id=btn.dataset.destination;
  if(id==='info') {window.rrMobileLayoutLastTab=active;setActive('info');document.getElementById('rrMobileInfoButton')?.click();return;}
  menu.open=false;setActive(id);
  gotoSection(id==='map'?board:first);
 });
 const info=document.getElementById('rrMobileRaceDialog');
 info?.addEventListener('close',()=>{if(active==='info')setActive(window.rrMobileLayoutLastTab||'play');});
 // Avoid stale highlight when the game automatically scrolls to the board after a roll.
 let ticking=false;
 window.addEventListener('scroll',()=>{
  if(!mq.matches||game.classList.contains('hidden')||ticking)return;
  ticking=true;requestAnimationFrame(()=>{
   ticking=false;
   const y=board.getBoundingClientRect().top;
   const f=first.getBoundingClientRect();
   if(y<innerHeight*.44 && y>-board.getBoundingClientRect().height*.58)setActive('map');
   else if(f.bottom>Math.min(innerHeight*.6,380))setActive('play');
  });
 },{passive:true});
 window.rrMobileLayout={applyLayout,gotoSection,version:1};
})();
