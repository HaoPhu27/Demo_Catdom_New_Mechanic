'use strict';
const M=window.CatdomMechanics,R=window.CatdomRenderer,D=window.CATDOM_MECHANIC_FRAMES;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clone=M.copy,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},mix=(a,b,q)=>a+(b-a)*q;
let id='2',mode='bad',state,selected=0,busy=false,epoch=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,elapsed=0,last=0,loaded=false,pointer=null,fixture='SC-02',electricFixture='EL-01',boardPaused=false;
const holeName=(h,i)=>R.names[h.color]+(state.holes.filter(o=>o.color===h.color).length>1?' '+(i+1):'');
const pausedGifs={bad:!playing,good:!playing};
const legend={1:'∪ Nam châm hút 8 ô quanh nó, gồm đường chéo. Vùng vàng là phạm vi hút. Dọn mèo xanh và hồng trước.',2:'◇ Sàn nâu: số còn lại là độ bền. Ô sẫm màu: đã sụp. Tường chặn đường đi.',3:'↔ Ngang: trái/phải. ↕ Dọc: lên/xuống. ○ Tự do. Ăn mèo thường giữ strict; ăn sọc đối trục chỉ thua khi còn >1. Còn 1: thu mèo cuối và hố biến mất. Có thể ăn sọc từ mọi hướng khi hố đi được. Không còn cách thu đủ mèo cho các hố: thua STUCK. Thử SC-05.',4:'S: công tắc cần giữ liên tục. Một hố nhấn S → vùng xanh an toàn. Nhả S → báo động bật lại. Có hố trong vùng đỏ: THUA ngay. Thu mèo không tắt báo động vĩnh viễn.',5:'→ Mèo mũi tên: kích hoạt dịch chuyển sang phải. Tường tạo hốc hẹp mà hố 2 ô không lọt vào.',6:'Hai hố giữ A/B → đoạn nối giữa hai công tắc thành rào điện, không được đi vào. Các ô khác vẫn đi và thu mèo bình thường. Rời một công tắc → rào tắt, đường mở lại. Trước khi bật, dọn trống đoạn nối: còn mèo hoặc hố trên dây sẽ THUA ngay.'};
const framesForCase=()=>id==='6'?D.electricFixtures[electricFixture][mode]:D.mechanics[id][mode];
const gifBase=()=>id==='6'?`electric-${electricFixture}`:`mechanic-${id}`;
function syncElectricMedia(){if(id!=='6')return;const f=M.electricFixtures[electricFixture];$('#bad-title').textContent=f.badTitle;$('#bad-lesson').textContent=f.badLesson;$('#gif-bad').alt=f.badLesson;$('#preview-number').textContent='CATDOM / 06 · '+electricFixture;for(const m of ['bad','good']){$('#download-'+m).href=`assets/${gifBase()}-${m}.gif?v=20261026-electric-fail1`;$('#download-'+m).download=gifBase()+'-'+m+'.gif';updateGif(m)}$('#gif-heading').textContent=M.electricFixtures[electricFixture].name+' — chặn và mở đường';}
function setStatus(text,kind=''){$('#status').textContent=text;$('#status').className='status '+kind}
function rebuildHoleSelect(){
 $('#hole-select').innerHTML=state.holes.map((h,i)=>`<button data-hole="${i}"><i class="swatch" style="background:${R.colors[h.color]}"></i>${holeName(h,i)}</button>`).join('');
 $$('#hole-select button').forEach(b=>b.onclick=()=>{if(busy||state.outcome)return;selected=+b.dataset.hole;updateControls();drawGame()});
}
function updateControls(){
 $$('#hole-select button').forEach(b=>{const h=state.holes[+b.dataset.hole];b.disabled=busy||!!state.outcome||h.remaining<=0;b.classList.toggle('selected',+b.dataset.hole===selected);b.setAttribute('aria-pressed',String(+b.dataset.hole===selected))});
 $$('[data-dir]').forEach(b=>b.disabled=busy||boardPaused||!!state.outcome||state.holes[selected].remaining<=0);
 $('#counter').innerHTML=state.holes.map((h,i)=>`<span><i class="swatch" style="background:${R.colors[h.color]}"></i> ${holeName(h,i)}: ${h.remaining===0?'✓':h.remaining}</span>`).join('');
 $('#alarm-state').hidden=id!=='4';if(id==='4'){$('#alarm-state').textContent=M.alarmActive(state)?'BÁO ĐỘNG BẬT · S ĐANG TRỐNG':'BÁO ĐỘNG TẮT · ĐANG GIỮ S';$('#alarm-state').className=M.alarmActive(state)?'alarm-on':'alarm-off';}
 $('#electric-tools').hidden=id!=='6';if(id==='6'){$('#electric-fixture').value=electricFixture;$('#electric-fixture').disabled=busy;$('#board-name').textContent=M.electricFixtures[electricFixture].name;$('#electric-state').textContent=M.electricActive(state)?'ĐIỆN BẬT · ĐƯỜNG ĐANG CHẶN':'ĐIỆN TẮT · ĐƯỜNG ĐANG MỞ';$('#electric-state').className=M.electricActive(state)?'locked':'';$('#electric-case-note').textContent=state.holes.length+' hố · '+M.electricFixtures[electricFixture].initial.cats.length+' mèo · Nhả A hoặc B để mở đường.'}
 if(id==='6'&&state.outcome==='lost'){$('#electric-state').textContent='THUA · ĐIỆN TRÚNG MÈO / HỐ';}
 $('#stripe-tools').hidden=id!=='3';$('#stripe-lose').hidden=state.outcome!=='lost';
 if(state.outcome==='lost'){$('#stripe-lose strong').textContent='THUA · Không thể hoàn thành';$('#stripe-lose-message').textContent=state.reason;}
 if(id==='6'&&state.outcome==='lost')$('#stripe-lose strong').textContent='THUA · Điện trúng đối tượng';
 if(id==='3'){$('#axis-state').textContent=state.holes[selected].remaining===0?'HỐ ĐÃ HOÀN THÀNH':'STRICT HỐ: '+M.axisName(state.holes[selected].axis);$('#stripe-log').textContent=state.log.length?state.log.slice(-24).map(e=>JSON.stringify(e)).join('\n'):'Chưa có sự kiện.';$('#board-pause').textContent=boardPaused?'Tiếp tục board':'Tạm dừng board';$('#board-pause').disabled=busy||!!state.outcome;$('#stripe-fixture').disabled=busy;$('#stripe-fixture').value=fixture;$('#board-name').textContent=M.stripeFixtures[fixture].name;$('#stripe-lose-message').textContent=state.reason;$('#stripe-lose strong').textContent=state.reasonCode==='LOSE_STUCK'?'THUA · STUCK':'THUA · Xung đột sọc';}
}
function drawGame(s=state){if(loaded)R.draw($('#game'),s,{selected,interactive:true})}
function reset(isRetry=true){epoch++;pointer=null;busy=false;boardPaused=false;state=id==='3'&&isRetry&&state?.id==='3'&&state.fixture===fixture?M.retry(state):M.create(id,id==='6'?electricFixture:fixture);selected=0;rebuildHoleSelect();setStatus('Đưa tất cả mèo về đúng hố. '+M.levels[id].rule);updateControls();drawGame()}
function updateGif(which){const img=$('#gif-'+which);img.src=`assets/${gifBase()}-${which}${pausedGifs[which]?'-poster.png':'.gif'}?v=20261026-electric-fail1`;$(`[data-gif="${which}"]`).textContent=pausedGifs[which]?'Phát GIF':'Tạm dừng GIF'}
function choose(value){
 if(!M.levels[value])value='2';id=String(value);mode='bad';elapsed=0;const l=M.levels[id];
 $$('[data-mechanic]').forEach(b=>{b.classList.toggle('active',b.dataset.mechanic===id);b.setAttribute('aria-pressed',String(b.dataset.mechanic===id))});
 $('.mechanic-copy').style.setProperty('--accent',l.accent);
 for(const [selector,text] of Object.entries({'#mechanic-tag':l.tag,'#mechanic-name':`${id.padStart(2,'0')} / ${l.name}`,'#headline':l.headline,'#description':l.description,'#mechanic-icon':l.icon,'#rule':l.rule,'#implementation-note':l.note,'#preview-number':`CATDOM / ${id.padStart(2,'0')}`,'#board-name':l.name,'#play-title':l.name,'#play-instruction':l.rule,'#gif-heading':l.name+' — đúng và sai.','#bad-title':l.badTitle,'#bad-lesson':l.badLesson,'#good-title':l.goodTitle,'#good-lesson':l.goodLesson,'#legend':legend[id],'#closing-icon':l.icon}))$(selector).textContent=text;
 for(const m of ['bad','good']){$('#gif-'+m).alt=l.name+': '+(m==='bad'?l.badLesson:l.goodLesson);$('#download-'+m).href=`assets/mechanic-${id}-${m}.gif?v=20261026-electric-fail1`;$('#download-'+m).download=`catdom-${id}-${m}.gif`;updateGif(m)}
 $('#hole-select').innerHTML=M.create(id).holes.map((h,i)=>`<button data-hole="${i}"><i class="swatch" style="background:${R.colors[h.color]}"></i>${R.names[h.color]}${M.create(id).holes.filter(o=>o.color===h.color).length>1?' '+(i+1):''}</button>`).join('');
 $$('#hole-select button').forEach(b=>b.onclick=()=>{if(busy||state.outcome)return;selected=+b.dataset.hole;updateControls();drawGame()});
 fixture='SC-02';electricFixture='EL-01';reset(false);setCase('bad');syncElectricMedia();
 $('[data-case=bad]').textContent=id==='6'?'01 · Kiểm tra lúc bật điện':'01 · Cách chơi sai';$('[data-case=good]').textContent=id==='6'?'02 · Nhả công tắc':'02 · Cách chơi đúng';$('#gifs .tag.bad').textContent=id==='6'?'01 / ĐIỆN BẬT':'01 / SAI THỨ TỰ';$('#gifs .tag.good').textContent=id==='6'?'02 / ĐIỆN TẮT':'02 / ĐÚNG THỨ TỰ';
 $('#gifs .section-heading p').textContent=id==='3'?'Hai GIF minh họa SC-02. Chọn SC-01, SC-03, SC-04 hoặc SC-05 ở phần chơi thử để kiểm tra các luật còn lại.':'Hai GIF của mechanic đang chọn, dùng cùng board với bản chơi thử.';
 if(id==='3')$('#preview-number').textContent='CATDOM / 03 · SC-02';
 const url=new URL(location.href);url.searchParams.set('mechanic',id);history.replaceState(null,'',url);
 document.title=l.name+' · CatDom Play Lab';
 $('#game').setAttribute('aria-label',l.name+': board chơi thử, kéo hố hoặc dùng nút và phím mũi tên');
}
function setCase(value){mode=value;elapsed=0;$$('[data-case]').forEach(b=>{b.classList.toggle('active',b.dataset.case===mode);b.setAttribute('aria-pressed',String(b.dataset.case===mode))});drawPreview()}
function drawPreview(){if(!loaded)return;const f=framesForCase(),i=Math.min(f.length-1,Math.floor(elapsed*D.fps));R.draw($('#preview'),f[i]);$('#progress').style.width=i/(f.length-1)*100+'%';$('#clock').textContent=`0:${String(Math.floor(elapsed)).padStart(2,'0')} / 0:${String(Math.ceil(f.length/D.fps)).padStart(2,'0')}`}
function animate(before,after,hi,token){return new Promise(ok=>{let start;function tick(t){if(token!==epoch){ok(false);return}start??=t;const f=Math.min(1,(t-start)/750),walk=smooth(f/.45),resolve=smooth((f-.45)/.4),shift=smooth((f-.55)/.4),s=clone(after);
 s.holes.forEach((h,n)=>{const old=before.holes[n];h.x=mix(old.x,h.x,walk);h.y=mix(old.y,h.y,walk);h.scale=mix(old.scale,h.scale,resolve);if(resolve<.5){h.remaining=old.remaining;if(old.axis)h.axis=old.axis}});
 s.cats.forEach((c,n)=>{const old=before.cats[n];c.x=mix(old.x,c.x,shift);c.y=mix(old.y,c.y,shift);c.scale=mix(old.scale,c.scale,resolve)});
 if(f<.45){s.floors=clone(before.floors);}if(f<.9){s.outcome=null;s.reason=''}
 s.pulse=after.events.some(e=>['stripeConflict','overload','alarm','teleport','magnet','electricHit'].includes(e.kind))?Math.sin(resolve*Math.PI):0;
 drawGame(s);if(f<1)requestAnimationFrame(tick);else ok(true)}requestAnimationFrame(tick)})}
async function move(dx,dy,hi=selected){
 if(busy||boardPaused||state.outcome)return false;
 const before=clone(state),r=M.step(state,hi,dx,dy);
 if(!r.valid){state=r.state;setStatus(r.state.caption,r.electricBlocked?'locked':'');updateControls();drawGame();if(r.blockedAxis){$('#game').classList.remove('axis-blocked');void $('#game').offsetWidth;$('#game').classList.add('axis-blocked')}return false}
 busy=true;updateControls();const token=epoch;
 if(!await animate(before,r.state,hi,token))return false;
 state=r.state;busy=false;
 if(state.outcome==='lost')setStatus('THUA! '+state.reason+' Bấm “Làm lại” để thử thứ tự khác.','lost');
 else if(state.outcome==='won')setStatus('Hoàn thành! '+(id==='3'&&fixture!=='SC-02'?'Bạn đã hoàn thành '+fixture+' đúng luật strict.':M.levels[id].goodLesson),'won');
 else {setStatus(state.caption);if(state.holes[selected].remaining<=0)selected=state.holes.findIndex(h=>h.remaining>0)}
 updateControls();drawGame();return true;
}
const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
$$('[data-dir]').forEach(b=>b.onclick=()=>move(...dirs[b.dataset.dir]));
$$('[data-mechanic]').forEach(b=>b.onclick=()=>choose(b.dataset.mechanic));
$$('[data-case]').forEach(b=>b.onclick=()=>setCase(b.dataset.case));
$$('[data-gif]').forEach(b=>b.onclick=()=>{const m=b.dataset.gif;pausedGifs[m]=!pausedGifs[m];updateGif(m)});
$('#reset').onclick=()=>reset(true);$('#stripe-retry').onclick=()=>reset(true);$('#hint').onclick=()=>setStatus(id==='3'?M.stripeFixtures[fixture].hint:id==='6'?M.electricFixtures[electricFixture].hint:M.levels[id].hint);
$('#electric-fixture').onchange=e=>{electricFixture=e.target.value;reset(false);setCase('bad');syncElectricMedia()};
$('#stripe-fixture').onchange=e=>{fixture=e.target.value;reset(false)};
$('#board-pause').onclick=()=>{if(busy||state.outcome)return;boardPaused=!boardPaused;pointer=null;setStatus(boardPaused?'Board đang tạm dừng. Trục khóa được giữ nguyên.':'Đã tiếp tục. Trục hố: '+M.axisName(state.holes[selected].axis));updateControls()};
$('#pause').onclick=()=>{playing=!playing;$('#pause').textContent=playing?'Ⅱ':'▶';$('#pause').setAttribute('aria-label',playing?'Tạm dừng minh họa':'Phát minh họa')};
$('#replay').onclick=()=>{elapsed=0;drawPreview()};
$('#game').addEventListener('keydown',e=>{const key={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(key){e.preventDefault();move(...dirs[key])}});
function eventCell(e){const r=$('#game').getBoundingClientRect();return [Math.round(((e.clientX-r.left)*480/r.width-80)/80),Math.round(((e.clientY-r.top)*640/r.height-160)/80)]}
$('#game').addEventListener('pointerdown',e=>{if(busy||boardPaused||state.outcome)return;const p=eventCell(e),hi=state.holes.findIndex(h=>h.remaining>0&&M.contains(M.cells(h),...p));if(hi<0)return;selected=hi;pointer={id:e.pointerId,hi,offset:[p[0]-state.holes[hi].x,p[1]-state.holes[hi].y],cells:[[state.holes[hi].x,state.holes[hi].y]],token:epoch};$('#game').setPointerCapture(e.pointerId);$('#game').focus({preventScroll:true});updateControls();drawGame()});
$('#game').addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const p=eventCell(e).map((v,i)=>Math.max(0,Math.min(4,v-pointer.offset[i]))),last=pointer.cells.at(-1);if(p[0]!==last[0]||p[1]!==last[1])pointer.cells.push(p)});
$('#game').addEventListener('pointerup',async e=>{if(!pointer||pointer.id!==e.pointerId)return;const gesture=pointer;pointer=null;const endpoint=eventCell(e).map((v,i)=>Math.max(0,Math.min(4,v-gesture.offset[i])));gesture.cells.push(endpoint);
 for(const [tx,ty] of gesture.cells){for(let n=0;n<12;n++){if(epoch!==gesture.token||state.outcome||state.holes[gesture.hi].remaining<=0)return;const h=state.holes[gesture.hi],dx=tx-h.x,dy=ty-h.y;if(!dx&&!dy)break;const x=Math.abs(dx)>=Math.abs(dy)?Math.sign(dx):0,y=Math.abs(dy)>Math.abs(dx)?Math.sign(dy):0;if(!await move(x,y,gesture.hi))return}}
});
$('#game').addEventListener('pointercancel',()=>pointer=null);
choose(new URLSearchParams(location.search).get('mechanic')||'2');
R.ready.then(()=>{loaded=true;drawGame();drawPreview();$('#pause').textContent=playing?'Ⅱ':'▶';function loop(t){if(last&&playing&&!document.hidden){elapsed+=(t-last)/1000;if(elapsed>=framesForCase().length/D.fps)elapsed=0;drawPreview()}last=t;requestAnimationFrame(loop)}requestAnimationFrame(loop)}).catch(()=>setStatus('Không tải được art. Hãy mở lại trang.'));


