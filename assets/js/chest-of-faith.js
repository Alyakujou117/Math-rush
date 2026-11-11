/* Radical Rush: Chest of Faith — six rewards, no coins or chest debuffs.
 * Board geometry, local inventory, effects and traps remain unchanged.
 */
(function () {
  'use strict';
  const ITEMS = [
    { id:'ank_shield', name:'Ank Shield', icon:'🛡️', group:'Protection', description:'Blocks one dragon setback or opponent attack. Stack up to 2.' },
    { id:'mana_power', name:'Mana Power', icon:'🔮', group:'Blessing', description:'Reduce your active-skill cooldown by 1 turn.' },
    { id:'bear_trap', name:'Bear Trap', icon:'🪤', group:'Tool', description:'Place on a tile. The first other player who crosses it loses their next spin; owner is safe.' },
    { id:'air_strike', name:'Air Strike', icon:'💥', group:'Tool', description:'Move each other player in your current board row backward 1 tile. Shields can block it.' },
    { id:'snowball', name:'Snowball', icon:'❄️', group:'Tool', description:'Choose a player. Their next wheel movement is reduced by 2 steps (minimum 1).' },
    { id:'lava_flask', name:'Lava Flask', icon:'🧪', group:'Tool', description:'Place permanent lava on a non-portal tile. Anyone who crosses it loses their next spin.' }
  ];
  const LOOKUP = Object.fromEntries(ITEMS.map(x=>[x.id,x]));
  const WEIGHTS = ['ank_shield','ank_shield','mana_power','mana_power','bear_trap','air_strike','snowball','lava_flask'];
  const TOOL_IDS = new Set(['bear_trap','air_strike','snowball','lava_flask']);
  const by = id => document.getElementById(id);
  const bridge = window.rrExpeditionBridge;
  const abilities = () => window.rrAbilityEngine;
  if (!bridge) return;
  let bags = [], hazards = [], serial = 0;
  let placement = null; // {id, actor}: selection is not charged until a valid board tile is clicked.

  const blank = () => ({ ankh:0, tools:[], skipNext:0, spinPenalty:0, usedTool:false, walkedLava:[] });
  const bag = p => bags[p];
  const ownTurn = () => true;
  const names = p => players[p]?.name || 'Player ' + (p+1);
  const gameplay = () => currentScreen === 'game' && players.length > 0;
  const abilityState = () => abilities()?.getState?.();
  function notify() { document.dispatchEvent(new CustomEvent('rr-faith-change')); }
  function message(text) {
    const el = by('rrFaithNotice'); if (!el) return;
    el.textContent = text; el.classList.remove('hidden'); clearTimeout(message.timer);
    message.timer = setTimeout(()=>el.classList.add('hidden'),3200);
    try { log('🎁 ' + text); } catch(_) {}
  }
  function reset() {
    stopPlacement();
    bags = players.map(blank); hazards = []; serial++;
    closeDialog(); drawStatus();
  }
  function pickReward() {
    const available = WEIGHTS.filter(id=> id !== 'ank_shield' || bags.some(b=>b.ankh < 2));
    return available[Math.floor(Math.random()*available.length)] || 'mana_power';
  }
  function give(p, id) {
    if (!bag(p) || !LOOKUP[id]) return false;
    const b=bag(p), state=abilityState(), hero=state?.data?.[p];
    if (id==='ank_shield') {
      if(b.ankh>=2) return false; b.ankh++;
    } else if (id==='mana_power') {
      if(hero) hero.readyAt = Math.max(state.turnCount[p],hero.readyAt-1);

    } else if(TOOL_IDS.has(id)) {
      b.tools.push(id); // Earned tools are stored; up to one tool may be used each turn.
    }
    drawStatus(); notify();
    window.rrFaithVFX?.reward?.(p,id);
    return true;
  }
  const previousClaim=bridge.claimPortalPrize?.bind(bridge);
  bridge.claimPortalPrize=function(p,id) {
    if(!LOOKUP[id]) id=pickReward();
    if(id==='ank_shield' && bag(p)?.ankh>=2) id=pickReward();
    if(!give(p,id)) { id='mana_power'; give(p,id); }
    bridge.recordFaithPrize?.(p);
    return id;
  };
  bridge.hasAnkShield = p => !!bag(p)?.ankh;
  bridge.useAnkShield = p => useAnkh(p);
  function useAnkh(p) {if(!bag(p)?.ankh)return false; bag(p).ankh--; message(names(p)+' blocked an attack with an Ank Shield!'); drawStatus();notify();window.rrFaithVFX?.shieldBreak?.(p);return true;}
  const priorHas=bridge.hasShield?.bind(bridge), priorUse=bridge.useShield?.bind(bridge);
  bridge.hasShield=p=>!!bag(p)?.ankh || !!priorHas?.(p);
  bridge.useShield=p=>abilities()?.isProtected?.(p) ? priorUse?.(p) : bag(p)?.ankh ? useAnkh(p) : priorUse?.(p);
  const priorReset=bridge.reset?.bind(bridge);
  bridge.reset=(...args)=>{ const ret=priorReset?.(...args);reset();return ret; };

  // These state hooks are invoked from the original game's walking/turn logic.
  function onStep(p,tile) {
    const b=bag(p); if(!b || !ownTurn()) return;
    let changed=false;
    for(const h of [...hazards]) {
      if(h.tile!==tile) continue;
      if(h.kind==='bear_trap' && h.owner!==p) {
        hazards=hazards.filter(x=>x.id!==h.id);
        if(abilities()?.isProtected?.(p)) message(names(p)+' avoided the Bear Trap with Shadow Step!');
        else if(abilities()?.reflectHazard?.(p,h.owner,'bear_trap')) {
          const owner=bag(h.owner); if(owner) owner.skipNext++;
          message(names(p)+' reflected the Bear Trap back to '+names(h.owner)+'!');
        } else { b.skipNext++; message(names(p)+' stepped on a Bear Trap! The next spin is blocked.'); }
        window.rrFaithVFX?.trigger?.(p,tile,'bear_trap'); changed=true;
      }
      if(h.kind==='lava_flask' && !b.walkedLava.includes(h.id)) {
        b.walkedLava.push(h.id);
        if(abilities()?.isProtected?.(p)) message(names(p)+' passed safely through lava with Shadow Step!');
        else { b.skipNext++; message(names(p)+' stepped into lava! The next spin is blocked.'); }
        window.rrFaithVFX?.trigger?.(p,tile,'lava_flask'); changed=true;
      }
    }
    if(changed) {drawStatus(); renderHazards();notify();}
  }
  function onTurnStart(p) {
    stopPlacement();
    const b=bag(p);if(!b || !ownTurn())return false;
    b.usedTool=false; b.walkedLava=[];
    // Queue after the character-abilities nextTurn wrapper has advanced its own turn counter.
    if(b.skipNext>0) {
      queueMicrotask(()=>{
        if(turn!==p || phase!=='roll' || !gameplay())return;
        b.skipNext--; phase='feedback'; by('rollBtn').disabled=true;
        by('nextBtn').classList.remove('hidden'); by('nextBtn').textContent='Next Player →';
        by('challengeTitle').textContent='Turn Skipped';
        by('question').textContent=names(p)+' cannot spin the wheel this turn.';
        status('⛔ '+names(p)+' skips this spin.');
        window.rrFaithVFX?.skip?.(p);
        drawStatus(); notify();startTurnAdvance();
      });
    }
    drawStatus();return false;
  }
  function passiveLocked(p) {return false;}
  function takeSpinPenalty(p) {const b=bag(p);if(!b)return 0; const n=b.spinPenalty||0;b.spinPenalty=0;if(n) {message(names(p)+' is slowed by a Snowball: -'+n+' wheel steps.');window.rrFaithVFX?.consumePenalty?.(p,n);drawStatus();notify();}return n;}

  const panel=document.createElement('section');panel.id='rrFaithInventory';panel.className='rr-faith-panel';panel.setAttribute('aria-label','Chest of Faith inventory');
  const abilityPanel=by('rrAbilityPanel'); abilityPanel?.insertAdjacentElement('afterend',panel);
  const notice=document.createElement('div');notice.id='rrFaithNotice';notice.className='rr-faith-notice hidden';notice.setAttribute('role','status');document.body.append(notice);
  const overlay=document.createElement('div');overlay.id='rrFaithToolOverlay';overlay.className='rr-faith-overlay hidden';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');document.body.append(overlay);
  // Direct-to-board tool placement. Use event delegation so board redraws, realm
  // changes, and new character tiles never break click/tap targeting.
  const placementBanner=document.createElement('div');
  placementBanner.id='rrFaithPlaceBanner';placementBanner.className='rr-place-banner';
  placementBanner.hidden=true;placementBanner.setAttribute('role','status');
  const placementCaption=document.createElement('span');
  const placementCancel=document.createElement('button');
  placementCancel.type='button';placementCancel.textContent='Cancel';
  placementCancel.setAttribute('aria-label','Cancel board tool placement');
  placementCancel.addEventListener('click',()=>stopPlacement());
  placementBanner.append(placementCaption,placementCancel);
  by('gameScreen')?.append(placementBanner);
  const placeBoard=by('board');
  function validPlacementTile(id,n){
    return Number.isInteger(n) && n>=2 && n<gameLength &&
      !(id==='lava_flask' && Object.prototype.hasOwnProperty.call(jumps,n)) &&
      !hazards.some(h=>h.tile===n);
  }
  function markPlaceTiles(){
    if(!placeBoard)return;
    placeBoard.classList.toggle('rr-place-active',!!placement);
    placeBoard.querySelectorAll('.tile[data-tile]').forEach(cell=>{
      const good=!!placement && validPlacementTile(placement.id,Number(cell.dataset.tile));
      cell.classList.toggle('rr-place-valid',good);
      cell.classList.toggle('rr-place-invalid',!!placement && !good);
      if(placement){
        cell.setAttribute('data-rr-place',good?'yes':'no');
        if(good)cell.setAttribute('tabindex','0');
        else cell.removeAttribute('tabindex');
      }else{
        cell.classList.remove('rr-place-valid','rr-place-invalid');
        cell.removeAttribute('data-rr-place');cell.removeAttribute('tabindex');
      }
    });
  }
  function stopPlacement(){
    if(!placement)return;
    placement=null;placementBanner.hidden=true;
    markPlaceTiles();drawStatus();
  }
  function beginPlacement(id,actor){
    if(placement?.id===id && placement.actor===actor){stopPlacement();return;}
    if(!canUse()||actor!==turn||!bag(actor)?.tools.includes(id))return;
    if(!Array.from({length:Math.max(0,gameLength-2)},(_,i)=>i+2).some(n=>validPlacementTile(id,n))){
      message('No available tiles for this tool.');return;
    }
    closeDialog();placement={id,actor};
    const lava=id==='lava_flask';
    placementCaption.textContent=(lava?'🌋 Lava Puddle':'🪤 Bear Trap')+' — tap a glowing tile to place';
    placementBanner.hidden=false;
    markPlaceTiles();drawStatus();
    // On phones, the tools are below the board: bring target tiles into view.
    if(window.matchMedia('(max-width:760px)').matches){
      by('board')?.scrollIntoView({behavior:'auto',block:'center'});
    }
  }
  function placeFromBoard(tile){
    if(!placement)return;
    const {id,actor}=placement;
    if(!canUse() || turn!==actor || !bag(actor)?.tools.includes(id)){
      stopPlacement();message('Your turn changed. Choose the tool again.');return;
    }
    if(!validPlacementTile(id,tile)){
      message(id==='lava_flask' && jumps[tile]?'Lava cannot be placed on a portal. Select a glowing tile.':
        'That tile is unavailable. Select a glowing tile.');return;
    }
    if(!consume(actor,id))return;
    placement=null;placementBanner.hidden=true;markPlaceTiles();
    hazards.push({id:++serial,kind:id,tile,owner:actor});
    renderHazards();drawStatus();notify();
    window.rrFaithVFX?.place?.(actor,tile,id);
    message((id==='lava_flask'?'🌋 Lava Puddle':'🪤 Bear Trap')+' placed on tile '+tile+'.');
  }
  placeBoard?.addEventListener('click',e=>{
    if(!placement)return;
    const cell=e.target.closest('.tile[data-tile]');
    if(!cell)return;
    e.preventDefault();e.stopImmediatePropagation();
    placeFromBoard(Number(cell.dataset.tile));
  },true);
  placeBoard?.addEventListener('keydown',e=>{
    if(!placement || (e.key!=='Enter' && e.key!==' '))return;
    const cell=e.target.closest('.tile[data-tile]');if(!cell)return;
    e.preventDefault();e.stopImmediatePropagation();placeFromBoard(Number(cell.dataset.tile));
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&placement){e.preventDefault();stopPlacement();}
  });
  // Spinning takes priority over a pending (unspent) placement selection.
  by('rollBtn')?.addEventListener('click',()=>stopPlacement(),true);
  by('dice')?.addEventListener('click',()=>stopPlacement(),true);
  by('dice')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')stopPlacement();},true);
  function closeDialog(){overlay.classList.add('hidden');overlay.replaceChildren();}
  function openDialog(title,description) {
    overlay.replaceChildren();const box=document.createElement('div');box.className='rr-faith-dialog';
    const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=description;
    const controls=document.createElement('div');controls.className='rr-faith-dialog-actions';
    const cancel=document.createElement('button');cancel.type='button';cancel.className='btn secondary';cancel.textContent='Cancel';cancel.onclick=closeDialog;
    box.append(h,p,controls,cancel);overlay.append(box);overlay.classList.remove('hidden');return controls;
  }
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeDialog();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))closeDialog();});
  function canUse(){const b=bag(turn);return !!(gameplay() && phase==='roll' && ownTurn() && !players[turn]?.cpu && b && !b.usedTool);}
  function consume(p,id){const b=bag(p),i=b?.tools.indexOf(id)??-1;if(i<0 || !canUse())return false;b.tools.splice(i,1);b.usedTool=true;drawStatus();notify();return true;}
  function toolButton(id,label,callback) {
    const b=document.createElement('button');b.type='button';b.className='rr-faith-choice rr-ability-choice';b.textContent=label;b.addEventListener('click',callback);return b;
  }
  async function useTool(id){
    if(!canUse() || !bag(turn).tools.includes(id))return;
    const actor=turn;
    if(id==='snowball'){
      const choices=players.map((p,i)=>i).filter(i=>i!==actor && positions[i]<gameLength);
      if(!choices.length){message('Snowball needs another player.');return;}
      const region=openDialog('❄️ Snowball','Choose a player. Their next wheel movement loses 2 steps (minimum 1).');
      for(const i of choices) region.append(toolButton(id,names(i)+' · Tile '+positions[i],async()=>{
        closeDialog();if(!consume(actor,id))return;
        window.rrFaithVFX?.snowball?.(actor,i);
        const blocked=await abilities()?.blockToolTarget?.(actor,i,'snowball');
        if(!blocked){bag(i).spinPenalty=Math.min(6,(bag(i).spinPenalty||0)+2);message('❄️ '+names(i)+' will lose 2 steps on the next spin.');}
        else window.rrFaithVFX?.blocked?.(i);
        drawStatus();notify();
      }));
    }else if(id==='bear_trap'||id==='lava_flask'){
      beginPlacement(id,actor);
    }else if(id==='air_strike'){
      const row=Math.floor((positions[actor]-1)/10);
      const rivals=players.map((p,i)=>i).filter(i=>i!==actor && Math.floor((positions[i]-1)/10)===row && positions[i]>1);
      if(!rivals.length){message('Air Strike: No other players in your board row.');return;}
      const region=openDialog('💥 Air Strike','Move all other players in your current 10-tile board row backward 1 tile. Shields may block the strike.');
      region.append(toolButton(id,'Strike '+rivals.length+' player'+(rivals.length===1?'':'s'),async()=>{
        closeDialog();if(!consume(actor,id))return;
        message('💥 Air Strike on board row '+(row+1)+'!');
        window.rrFaithVFX?.airstrike?.(actor,rivals);
        if(document.body.classList.contains('fx-enabled') && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve=>setTimeout(resolve,550));
        for(const i of rivals) {if(currentScreen!=='game')break;await abilities()?.hitWithTool?.(actor,i,1,'air_strike');}
        drawStatus();notify();
      }));
    }
  }
  function drawStatus(){
    if(!panel)return;
    if(!gameplay() || !bag(turn)){panel.classList.add('hidden');return;}
    panel.classList.remove('hidden');panel.replaceChildren();const b=bag(turn);
    const heading=document.createElement('div');heading.className='rr-faith-panel-title';heading.textContent='🎁 CHEST OF FAITH · '+names(turn);panel.append(heading);
    const line=document.createElement('div');line.className='rr-faith-status-line';
    const stats=[['shield','🛡️','Shields '+b.ankh+'/2']];
    if(b.skipNext)stats.push(['skip','⛔','Skip '+b.skipNext]);
    if(b.spinPenalty)stats.push(['slow','❄️','−'+b.spinPenalty+' steps']);
    for(const [kind,icon,label] of stats){const tag=document.createElement('span');tag.className='rr-faith-stat';tag.dataset.status=kind;tag.textContent=icon+' '+label;line.append(tag);}panel.append(line);
    const inventory=document.createElement('div');inventory.className='rr-faith-tool-row';
    if(!b.tools.length){const empty=document.createElement('span');empty.className='rr-faith-empty';empty.textContent='No tools yet · Open a Chest of Faith';inventory.append(empty);}
    else b.tools.forEach((id)=>{
      const item=LOOKUP[id],button=document.createElement('button');button.type='button';button.className='rr-faith-tool';button.title=item.description;
      button.dataset.tool=id;
      const icon=document.createElement('span');icon.className='rr-faith-tool-icon';icon.innerHTML=window.rrToolArt?.inventory?.(id)||window.rrIconKit?.markup(id)||item.icon;icon.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.className='rr-faith-tool-label';label.textContent=item.name;
      button.append(icon,label);button.setAttribute('aria-label','Use '+item.name);button.disabled=!canUse();
      button.classList.toggle('rr-tool-placing',!!placement && placement.id===id && placement.actor===turn);
      if(placement && placement.id===id && placement.actor===turn)button.setAttribute('aria-pressed','true');
      button.onclick=()=>useTool(id);inventory.append(button);
    });
    panel.append(inventory);window.rrFaithVFX?.sync?.();
  }
  function renderHazards(){
    const board=by('board');if(!board)return;
    board.querySelectorAll('.rr-faith-hazard').forEach(x=>x.remove());
    for(const h of hazards){
      const cell=board.querySelector('[data-tile="'+h.tile+'"]');if(!cell)continue;
      const tag=document.createElement('span');tag.className='rr-faith-hazard rr-faith-'+h.kind;tag.innerHTML=window.rrToolArt?.hazard?.(h.kind)||window.rrIconKit?.markup(h.kind)||(h.kind==='bear_trap'?'🪤':'');
      tag.title=h.kind==='bear_trap'?'Bear Trap · one-time spin lock':'Permanent Lava · spin lock';tag.setAttribute('aria-label',tag.title);cell.append(tag);
    }
    if(placement && (!canUse() || turn!==placement.actor || !bag(turn)?.tools.includes(placement.id)))stopPlacement();
    else markPlaceTiles();
  }
  const baseDraw=drawBoard;
  drawBoard=function(...args){const result=baseDraw(...args);renderHazards();window.rrFaithVFX?.sync?.();return result;};
  const baseRender=renderStandings;
  renderStandings=function(...args){const result=baseRender(...args);drawStatus();return result;};
  window.rrFaithChests={ITEMS,pickReward,give,reset,onStep,onTurnStart,passiveLocked,takeSpinPenalty,
    applySpinPenalty:(p,n=2)=>{const b=bag(p);if(b){b.spinPenalty=Math.min(6,b.spinPenalty+n);drawStatus();notify();}},
    applySkip:(p)=>{const b=bag(p);if(b){b.skipNext++;drawStatus();notify();}},
    hasAnkh:p=>!!bag(p)?.ankh,useAnkh,summary:p=>'🛡️ Ankh '+(bag(p)?.ankh||0)+'/2 · '+(bag(p)?.tools.length||0)+' tools',getState:()=>({bags,hazards}),useTool,renderHazards};
  drawStatus();
})();
