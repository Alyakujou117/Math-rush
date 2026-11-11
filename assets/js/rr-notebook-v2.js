/* Redesigned local Math Notebook. Uses a separate top-layer dialog so mobile
   challenge dialogs, fullscreen play and windowed desktops all work. */
(function(){
'use strict';
const challenge=document.getElementById('challenge');
const question=document.getElementById('question');
const answers=document.getElementById('answers');
const game=document.getElementById('gameScreen');
if(!challenge||!question||!answers||!game)return;
const launch=document.createElement('button');
launch.type='button';launch.id='rr2Launch';launch.className='rr2-launch';launch.hidden=true;
launch.textContent='✎  Open Math Notebook · Solve Here';
answers.before(launch);
const notebook=document.createElement('dialog');
notebook.id='rr2Notebook';notebook.setAttribute('aria-label','Math Notebook');
notebook.dataset.tab='draw';
notebook.innerHTML=`
  <div class="rr2-top">
    <div class="rr2-identity"><div class="rr2-emblem" aria-hidden="true">✎</div>
      <div><div class="rr2-title">Math Notebook</div><div class="rr2-subtitle">Your private space to work out the answer</div></div>
    </div>
    <button class="rr2-close" type="button" id="rr2Close" aria-label="Close notebook">×</button>
  </div>
  <div class="rr2-problem"><span class="rr2-problem-label">Problem</span><div class="rr2-problem-text" id="rr2Problem"></div></div>
  <div class="rr2-body">
    <section class="rr2-drawpane" aria-label="Draw your solution">
      <div class="rr2-paneheading"><strong>GRAPH PAPER</strong><span class="rr2-hint">Mouse · Finger · Stylus</span></div>
      <div class="rr2-tools" role="toolbar" aria-label="Drawing tools">
        <button class="rr2-tool" id="rr2Pen" type="button" aria-pressed="true">✎ Pen</button>
        <button class="rr2-tool" id="rr2Erase" type="button" aria-pressed="false">◯ Eraser</button>
        <span class="rr2-toolseparator" aria-hidden="true"></span>
        <button class="rr2-color" data-color="#243b65" type="button" aria-label="Dark blue ink" aria-pressed="true" style="background:#243b65"></button>
        <button class="rr2-color" data-color="#179bba" type="button" aria-label="Turquoise ink" aria-pressed="false" style="background:#179bba"></button>
        <button class="rr2-color" data-color="#e45865" type="button" aria-label="Red ink" aria-pressed="false" style="background:#e45865"></button>
        <span class="rr2-toolseparator" aria-hidden="true"></span>
        <button class="rr2-tool" id="rr2Undo" type="button">↶ Undo</button>
        <button class="rr2-tool" id="rr2Redo" type="button">↷ Redo</button>
        <button class="rr2-tool" id="rr2Grid" type="button" aria-pressed="true">▦ Grid</button>
        <button class="rr2-tool" id="rr2Clear" type="button">Clear</button>
      </div>
      <div class="rr2-paper-wrap"><div class="rr2-paper" data-grid="true" id="rr2Paper">
        <canvas id="rr2Canvas" aria-label="Write your calculations with a mouse finger or stylus"></canvas>
        <span class="rr2-paper-label">RADICAL RUSH / NOTES</span>
      </div></div>
      <div class="rr2-equation-area">
        <button id="rr2TypeToggle" class="rr2-equation-toggle" type="button" aria-expanded="false" aria-controls="rr2TypeArea">⌨ Type an Equation (Optional) <span aria-hidden="true">▾</span></button>
        <div id="rr2TypeArea" class="rr2-equation-content" hidden>
          <div class="rr2-keyboard" role="group" aria-label="Math symbols"></div>
          <textarea id="rr2Notes" class="rr2-notes" spellcheck="false" aria-label="Type an equation or note" placeholder="Type any equation or note…"></textarea>
        </div>
      </div>
    </section>
  </div>
  <div class="rr2-footer"><span>Work is kept while this question is active.</span><button type="button" id="rr2Done">Done ✓</button></div>
`;
document.body.appendChild(notebook);
const $=id=>notebook.querySelector('#'+id);
const canvas=$('rr2Canvas'), ctx=canvas.getContext('2d');
const note=$('rr2Notes'), paper=$('rr2Paper');
const undo=$('rr2Undo'), redo=$('rr2Redo');
let strokes=[],redoStrokes=[],active=null,activePointer=null,tool='pen',ink='#243b65';
let questionKey='',lastFocus=null,drawReady=false;
function activeQuestion(){return document.body.classList.contains('in-game') &&
 !game.classList.contains('hidden') &&
 (typeof phase==='undefined'|| phase==='answer'|| phase==='feedback') &&
 !!answers.querySelector('button');}
function updateButtons(){undo.disabled=!strokes.length;redo.disabled=!redoStrokes.length;}
function resizeCanvas(){
 const r=canvas.getBoundingClientRect();if(r.width<10||r.height<10)return;
 const dpr=Math.min(2,window.devicePixelRatio||1);
 const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 drawReady=true;renderInk();
}
function paintStroke(s,w,h){
 if(!s.points.length)return;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 ctx.globalCompositeOperation=s.erase?'destination-out':'source-over';
 ctx.strokeStyle=s.erase?'#000':s.color;
 ctx.lineWidth=s.erase?24:s.width;
 ctx.beginPath();
 let p=s.points[0];ctx.moveTo(p[0]*w,p[1]*h);
 if(s.points.length===1)ctx.lineTo(p[0]*w+.1,p[1]*h+.1);
 else for(const p of s.points.slice(1))ctx.lineTo(p[0]*w,p[1]*h);
 ctx.stroke();ctx.restore();
}
function renderInk(){
 if(!drawReady)return;
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 const dpr=canvas.width/rect.width;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 for(const s of strokes)paintStroke(s,rect.width,rect.height);
 if(active)paintStroke(active,rect.width,rect.height);
 updateButtons();
}
function xy(ev){const r=canvas.getBoundingClientRect();return [Math.min(1,Math.max(0,(ev.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(ev.clientY-r.top)/r.height))];}
canvas.addEventListener('pointerdown',ev=>{
 if(ev.pointerType==='mouse'&&ev.button!==0)return;
 if(active)return;
 if(!drawReady)resizeCanvas();
 ev.preventDefault();activePointer=ev.pointerId;
 active={erase:tool==='erase',color:ink,width:ev.pointerType==='touch'?3.6:2.8,points:[xy(ev)]};
 try{canvas.setPointerCapture(ev.pointerId);}catch(_e){}
 renderInk();
});
canvas.addEventListener('pointermove',ev=>{
 if(!active||activePointer!==ev.pointerId)return;
 ev.preventDefault();const p=xy(ev);const last=active.points[active.points.length-1];
 if(Math.hypot((p[0]-last[0])*canvas.clientWidth,(p[1]-last[1])*canvas.clientHeight)<.8)return;
 active.points.push(p);renderInk();
});
function finish(ev){
 if(!active||activePointer!==ev.pointerId)return;
 ev.preventDefault();active.points.push(xy(ev));strokes.push(active);redoStrokes=[];
 active=null;activePointer=null;
 try{if(canvas.hasPointerCapture(ev.pointerId))canvas.releasePointerCapture(ev.pointerId);}catch(_e){}
 renderInk();
}
canvas.addEventListener('pointerup',finish);
canvas.addEventListener('pointercancel',finish);
window.addEventListener('blur',()=>{if(active){strokes.push(active);active=null;activePointer=null;redoStrokes=[];renderInk();}});
function setTool(value){tool=value;$('rr2Pen').setAttribute('aria-pressed',String(tool==='pen'));$('rr2Erase').setAttribute('aria-pressed',String(tool==='erase'));}
$('rr2Pen').addEventListener('click',()=>setTool('pen'));
$('rr2Erase').addEventListener('click',()=>setTool('erase'));
notebook.querySelectorAll('.rr2-color').forEach(btn=>btn.addEventListener('click',()=>{
 ink=btn.dataset.color;setTool('pen');notebook.querySelectorAll('.rr2-color').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
}));
undo.addEventListener('click',()=>{if(strokes.length){redoStrokes.push(strokes.pop());renderInk();}});
redo.addEventListener('click',()=>{if(redoStrokes.length){strokes.push(redoStrokes.pop());renderInk();}});
$('rr2Clear').addEventListener('click',()=>{strokes=[];redoStrokes=[];renderInk();});
$('rr2Grid').addEventListener('click',()=>{const on=paper.dataset.grid!=='true';paper.dataset.grid=String(on);$('rr2Grid').setAttribute('aria-pressed',String(on));});
const symbols=['√','∛','²','³','⁻','⁄','×','÷','±','=','(',')','π','→','∞'];
const keyboard=notebook.querySelector('.rr2-keyboard');
for(const symbol of symbols){const btn=document.createElement('button');btn.className='rr2-key';btn.type='button';btn.textContent=symbol;btn.setAttribute('aria-label','Insert '+symbol);
 btn.addEventListener('pointerdown',e=>e.preventDefault());
 btn.addEventListener('click',()=>{const a=note.selectionStart,b=note.selectionEnd;note.setRangeText(symbol,a,b,'end');note.focus();});
 keyboard.append(btn);
}
const equationToggle=$('rr2TypeToggle'), equationArea=$('rr2TypeArea');
function toggleEquationArea(expand){
 equationArea.hidden=!expand;
 equationToggle.setAttribute('aria-expanded',String(expand));
 equationToggle.querySelector('span').textContent=expand?'▴':'▾';
 if(expand)note.focus({preventScroll:true});
 requestAnimationFrame(()=>requestAnimationFrame(resizeCanvas));
}
equationToggle.addEventListener('click',()=>toggleEquationArea(equationArea.hidden));
function resetPage(){strokes=[];redoStrokes=[];active=null;activePointer=null;note.value='';renderInk();}
function closeNotebook(){if(!notebook.open)return;notebook.close();}
function openNotebook(){
 if(!activeQuestion())return;
 lastFocus=document.activeElement;
 $('rr2Problem').innerHTML=question.innerHTML;
 // ShowModal puts this notebook above the existing mobile question dialog,
 // without closing that question and without covering answer buttons afterward.
 const host=document.fullscreenElement||game;
 if(notebook.parentNode!==host)host.appendChild(notebook);
 try{notebook.showModal();}catch(e){console.error('Unable to open Math Notebook',e);return;}
 toggleEquationArea(false);requestAnimationFrame(()=>requestAnimationFrame(resizeCanvas));
}
launch.addEventListener('click',openNotebook);
$('rr2Done').addEventListener('click',closeNotebook);
$('rr2Close').addEventListener('click',closeNotebook);
notebook.addEventListener('click',ev=>{if(ev.target===notebook)closeNotebook();});
notebook.addEventListener('close',()=>{if(lastFocus&&lastFocus.isConnected&&launch.hidden===false)lastFocus.focus({preventScroll:true});lastFocus=null;});
function refresh(){
 const visible=activeQuestion();
 if(launch.hidden===visible)launch.hidden=!visible;
 if(!visible){if(notebook.open)closeNotebook();return;}
 const key=(typeof questionSequence!=='undefined'?questionSequence:'')+'|'+question.textContent;
 if(key!==questionKey){questionKey=key;resetPage();if(notebook.open)$('rr2Problem').innerHTML=question.innerHTML;}
}
const changes=new MutationObserver(refresh);
changes.observe(challenge,{subtree:true,childList:true,characterData:true});
new MutationObserver(refresh).observe(game,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',()=>{if(notebook.open)requestAnimationFrame(resizeCanvas);},{passive:true});
document.addEventListener('fullscreenchange',()=>{
 if(!notebook.open)return;
 // Leave the notebook on-screen as fullscreen state changes.
 requestAnimationFrame(resizeCanvas);
});
updateButtons();refresh();
window.rrMathNotebook={open:openNotebook,close:closeNotebook,clear:resetPage,version:2};
})();
