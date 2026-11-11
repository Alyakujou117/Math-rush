/* Chest of Faith visual director. Adds animation only; never modifies turns, inventory, rolls or network state. */
(function(){
  'use strict';
  const layer=document.createElement('div');
  layer.id='rrFaithFxLayer'; layer.setAttribute('aria-hidden','true'); document.body.append(layer);
  const PALETTE={ank_shield:'#ffe19b',mana_power:'#c5a4ff',bear_trap:'#ffe19a',air_strike:'#ff9754',snowball:'#b5f6ff',lava_flask:'#ff9c49'};
  const ICON={ank_shield:'🛡️',mana_power:'🔮',bear_trap:'🪤',air_strike:'💥',snowball:'❄️',lava_flask:'🧪'};
  const LABEL={ank_shield:'ANK SHIELD!',mana_power:'MANA POWER!',bear_trap:'BEAR TRAP!',air_strike:'AIR STRIKE!',snowball:'SNOWBALL!',lava_flask:'LAVA FLASK!'};
  const reduce=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const active=()=>document.body.classList.contains('fx-enabled')&&!reduce()&&!!document.getElementById('gameScreen')&&!document.getElementById('gameScreen').classList.contains('hidden');
  const tileEl=n=>document.querySelector('#board [data-tile="'+Number(n)+'"]');
  const getCenter=el=>{if(!el || !el.isConnected)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};};
  const getTile=n=>getCenter(tileEl(n));
  const getPlayer=p=>getCenter(document.querySelector('#board .token[data-player="'+Number(p)+'"]')) || getTile((window.rrFaithChests?.getState?.().positions||[])[p]);
  const color=id=>PALETTE[id]||'#ffe19b';
  function fx(cls,pos,opt={}){
    if(!active()||!pos)return null;
    const e=document.createElement('div'); e.className='rr-faith-fx '+cls;
    e.style.left=pos.x+'px';e.style.top=pos.y+'px';
    if(opt.color)e.style.setProperty('--fx-color',opt.color);
    if(opt.icon && window.rrIconKit?.has(opt.icon))e.innerHTML=window.rrIconKit.markup(opt.icon);else if(opt.text)e.textContent=opt.text;
    layer.append(e);setTimeout(()=>e.remove(),opt.duration||1800);return e;
  }
  function orb(pos,c){fx('rr-faith-fx-orb',pos,{color:c,duration:920});}
  function sparks(pos,c,amount){
    if(!active()||!pos)return;
    const total=amount||(window.innerWidth<680?7:12);
    for(let i=0;i<total;i++){
      const a=2*Math.PI*i/total+(Math.random()-.5)*.5;
      const radius=30+Math.random()*65;
      const el=fx('rr-faith-fx-particle',pos,{color:c,duration:1100});if(!el)continue;
      el.style.setProperty('--vx',Math.round(Math.cos(a)*radius)+'px');
      el.style.setProperty('--vy',Math.round(Math.sin(a)*radius)+'px');
      el.style.width=(4+Math.random()*5)+'px';el.style.height=el.style.width;
    }
  }
  function banner(pos,text,c,kind){
    const el=fx('rr-faith-fx-banner',pos,{text,duration:1580});if(!el)return;
    el.style.setProperty('--banner-border',c);
    if(kind==='danger')el.style.setProperty('--banner-bg','#692344');
    if(kind==='ice')el.style.setProperty('--banner-bg','#225e83');
    if(kind==='mana')el.style.setProperty('--banner-bg','#50307a');
  }
  function spell(pos,icon,c,text,kind){
    if(!pos)return;
    orb(pos,c);sparks(pos,c);
    if(icon)fx('rr-faith-fx-emoji',pos,{icon,color:c,duration:1140});
    if(text)banner({x:pos.x,y:pos.y-32},text,c,kind);
  }
  function fly(from,to,icon,c,duration,onHit){
    if(!active()||!to){onHit?.();return;}
    const source=from||{x:innerWidth/2,y:innerHeight*.26};
    const dx=to.x-source.x,dy=to.y-source.y;
    const node=fx('rr-faith-fx-projectile',source,{icon,color:c,duration:duration+250});
    if(node){
      node.style.setProperty('--dx',dx+'px');node.style.setProperty('--dy',dy+'px');
      node.style.setProperty('--mid-x',(dx*.50)+'px');node.style.setProperty('--mid-y',(dy*.50-Math.max(58,Math.abs(dx)*.10))+'px');
      node.style.setProperty('--flight-time',duration+'ms');
    }
    setTimeout(()=>{if(active())onHit?.();},duration);
  }
  function reward(p,id){
    if(!active())return;
    setTimeout(()=>{
      const prize=document.getElementById('rrPrizeOverlay');
      const chestOpen=prize&&!prize.classList.contains('hidden');
      const pos=chestOpen?getCenter(prize.querySelector('.rr-prize-reel')):getPlayer(p);
      if(!pos)return;
      const kind=id==='snowball'?'ice':'mana';
      spell(pos,id,color(id),LABEL[id],kind);
      sync();
    },40);
  }
  function shieldBreak(p){const pos=getPlayer(p);spell(pos,'ank_shield','#ffdc8e','BLOCKED!', 'mana');sync();}
  function slow(p){const pos=getPlayer(p);if(!pos)return;fx('rr-faith-fx-frost',pos,{duration:1050});sparks(pos,'#c1f6ff');banner({x:pos.x,y:pos.y-30},'−2 WHEEL STEPS','#abf3ff','ice');}
  function skip(p){const pos=getPlayer(p);spell(pos,'⛔','#ff98ad','TURN SKIPPED','danger');}
  function snowball(actor,target){
    const from=getPlayer(actor)||getTile(1);const to=getPlayer(target);
    fly(from,to,'snowball',color('snowball'),690,()=>{
      if(!to)return;
      fx('rr-faith-fx-frost',to,{duration:990});sparks(to,'#aef1ff');
      fx('rr-faith-fx-emoji',to,{text:'☃️',color:'#c7f6ff',duration:1150});
    });
  }
  function blocked(p){const pos=getPlayer(p);spell(pos,'ank_shield',color('ank_shield'),'DEFLECTED!','mana');}
  function place(actor,tile,id){
    const target=getTile(tile),from=getPlayer(actor),c=color(id);
    fly(from,target,id,c,id==='lava_flask'?690:540,()=>{
      if(!target)return;
      orb(target,c);sparks(target,c,9);
      fx(id==='bear_trap'?'rr-faith-fx-trap':'rr-faith-fx-flash',target,{icon:id==='bear_trap'?'bear_trap':null,color:c,duration:900});
      banner({x:target.x,y:target.y-22},id==='lava_flask'?'LAVA PLACED!':'TRAP SET!',c,id==='lava_flask'?'danger':'mana');
      const tag=tileEl(tile)?.querySelector('.rr-faith-hazard');tag?.classList.add('rr-faith-just-planted');
      setTimeout(()=>tag?.classList.remove('rr-faith-just-planted'),800);
    });
  }
  function trigger(p,tile,id){
    const pos=getTile(tile)||getPlayer(p);if(!pos)return;
    const c=color(id);
    if(id==='bear_trap')fx('rr-faith-fx-trap',pos,{icon:'bear_trap',color:c,duration:830});
    else fx('rr-faith-fx-flash',pos,{color:c,duration:650});
    sparks(pos,c);banner({x:pos.x,y:pos.y-26},id==='bear_trap'?'TRAP SNAPPED!':'LAVA BURN!','#ffb782','danger');
  }
  function airstrike(actor,targets){
    if(!active())return;
    targets.forEach((p,i)=>{
      const pos=getPlayer(p);if(!pos)return;
      setTimeout(()=>{
        const m=fx('rr-faith-fx-meteor',pos,{text:'☄️',color:'#ffb56b',duration:750});
        if(m) m.style.animationDelay='0ms';
        setTimeout(()=>{fx('rr-faith-fx-flash',pos,{duration:650});sparks(pos,'#ffb572',14);banner({x:pos.x,y:pos.y-27},'AIR STRIKE!','#ffa961','danger');},500);
      },i*100);
    });
  }
  function consumePenalty(p,amount){const pos=getPlayer(p);if(!pos)return;fx('rr-faith-fx-frost',pos,{duration:850});banner({x:pos.x,y:pos.y-25},'SLOWED −'+amount,'#b1f2ff','ice');}
  function sync(){
    const state=window.rrFaithChests?.getState?.();
    const bags=state?.bags||[];
    document.querySelectorAll('#board .token[data-player]').forEach(token=>{
      const idx=Number(token.dataset.player),protectedNow=(bags[idx]?.ankh||0)>0;
      token.classList.toggle('rr-faith-shielded',protectedNow);
      let halo=token.querySelector('.rr-faith-token-aura');
      if(protectedNow&&!halo){halo=document.createElement('span');halo.className='rr-faith-token-aura';halo.setAttribute('aria-hidden','true');token.append(halo);}
      if(!protectedNow&&halo)halo.remove();
    });
  }
  const prize=document.getElementById('rrPrizeOverlay');
  if(prize){
    let wasWin=prize.classList.contains('rr-prize-win');
    new MutationObserver(()=>{
      const win=prize.classList.contains('rr-prize-win')&&!prize.classList.contains('hidden');
      if(win&&!wasWin&&active()){
        const pos=getCenter(prize.querySelector('.rr-prize-reel'));
        sparks(pos,'#ffe5a5',16);orb(pos,'#f9c977');
      }
      wasWin=win;
    }).observe(prize,{attributes:true,attributeFilter:['class']});
  }
  window.rrFaithVFX={reward,shieldBreak,slow,skip,snowball,blocked,place,trigger,airstrike,consumePenalty,sync};
  sync();
})();
