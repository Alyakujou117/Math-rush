/* A horizontally swipeable large-board view, with a one-touch full-map option. */
(()=>{
  const board=document.getElementById('board');
  const card=document.querySelector('#gameScreen .board-card');
  if(!board||!card||document.getElementById('rrMobileBoardScroller'))return;
  const scroller=document.createElement('div');
  scroller.id='rrMobileBoardScroller';
  scroller.setAttribute('role','region');
  scroller.setAttribute('aria-label','Game board. Swipe sideways to see more tiles when enlarged.');
  scroller.tabIndex=0;
  board.parentElement.insertBefore(scroller,board);
  scroller.append(board);
  const controls=document.createElement('div');controls.id='rrMobileMapControls';
  const hint=document.createElement('span');hint.className='rr-map-hint';
  const toggle=document.createElement('button');toggle.type='button';toggle.id='rrMobileMapZoomToggle';
  controls.append(hint,toggle);scroller.before(controls);
  function onPortrait(){return matchMedia('(max-width:760px) and (orientation:portrait)').matches}
  // Keep every serpentine road bend visible on entry. Large Tiles remains opt-in.
  let userChangedZoom = false;
  function showCompleteRouteByDefault(){
    if(onPortrait() && !userChangedZoom){document.body.classList.add('rr-mobile-map-fit');}
  }
  showCompleteRouteByDefault();
  function update(){
    const fit=document.body.classList.contains('rr-mobile-map-fit');
    hint.textContent=fit?'Full map visible':'Swipe map ↔';
    toggle.textContent=fit?'🔍 Large tiles':'▦ Fit whole map';
    toggle.setAttribute('aria-pressed',String(!fit));
    toggle.setAttribute('aria-label',fit?'Enlarge tiles and swipe the game board':'Show the complete game board at once');
  }
  function focusCurrent(force=false){
    if(!onPortrait()||document.body.classList.contains('rr-mobile-map-fit'))return;
    if(!document.body.classList.contains('in-game'))return;
    if(board.classList.contains('rr-place-active'))return;
    const active=(typeof positions!=='undefined'&&typeof turn!=='undefined')?positions[turn]:1;
    const tile=board.querySelector('[data-tile="'+(active||1)+'"]');
    if(!tile)return;
    const r=tile.getBoundingClientRect(),v=scroller.getBoundingClientRect();
    if(!force && r.left>=v.left+14 && r.right<=v.right-14)return;
    const target=scroller.scrollLeft+(r.left+r.right-v.left-v.right)/2;
    scroller.scrollTo({left:Math.max(0,target),behavior:'auto'});
  }
  toggle.addEventListener('click',()=>{
    userChangedZoom = true;
    const fit=document.body.classList.toggle('rr-mobile-map-fit');
    if(fit)scroller.scrollLeft=0;
    update();
    if(!fit)requestAnimationFrame(()=>focusCurrent(true));
  });
  const oldDraw=window.drawBoard;
  if(typeof oldDraw==='function'){
    window.drawBoard=function(...args){
      const result=oldDraw.apply(this,args);
      requestAnimationFrame(()=>focusCurrent());
      return result;
    };
  }
  window.addEventListener('resize',()=>{
    showCompleteRouteByDefault();
    update();
    if(onPortrait()&&!document.body.classList.contains('rr-mobile-map-fit'))requestAnimationFrame(()=>focusCurrent());
  },{passive:true});
  document.addEventListener('fullscreenchange',()=>requestAnimationFrame(()=>focusCurrent()),{passive:true});
  update();
})();
