(function(root){
'use strict';
const colors={xanhduong:'#308fee',hong:'#f16db1',vang:'#efb626'},names={xanhduong:'Xanh',hong:'Hồng',vang:'Vàng'};
const assets={};
const ready=Promise.all(['board',...Object.keys(colors).flatMap(k=>['cat-'+k,'hole-'+k])].map(key=>new Promise((ok,bad)=>{const i=new Image();i.onload=()=>{assets[key]=i;ok()};i.onerror=()=>bad(Error(key));i.src='assets/'+key+'.png'})));
const rr=(c,x,y,w,h,r,fill,stroke,width=1)=>{c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}};
function text(c,t,x,y,size=20,color='#24413e',bold=false){c.font=`${bold?'700':'500'} ${size}px "Be Vietnam Pro",system-ui,sans-serif`;c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.fillText(t,x,y)}
function image(c,key,x,y,w,h){if(assets[key])c.drawImage(assets[key],x-w/2,y-h/2,w,h)}
function wrap(c,str,y,size=16,max=414){c.font=`500 ${size}px "Be Vietnam Pro",system-ui,sans-serif`;const words=str.split(' '),lines=[];let line='';for(const w of words){if(c.measureText(line+' '+w).width>max&&line){lines.push(line);line=w}else line+=(line?' ':'')+w}if(line)lines.push(line);lines.slice(0,3).forEach((l,i)=>text(c,l,240,y+i*(size+7),size))}
const pos=(x,y)=>[80+x*80,160+y*80];
function badge(c,label,x,y,fill='#fff5cf',ink='#9c6922'){rr(c,x-15,y-14,30,28,8,fill);text(c,label,x,y,22,ink,true)}
function lockBadge(c,x,y){rr(c,x-15,y-16,30,32,8,'#654a85');c.strokeStyle='#fff6d8';c.lineWidth=3;c.beginPath();c.arc(x,y-5,7,Math.PI,0);c.stroke();rr(c,x-9,y-5,18,14,3,'#fff6d8');rr(c,x-1,y,2,6,1,'#654a85')}
function draw(canvas,s,options={}){
 const M=root.CatdomMechanics,l=M.levels[s.id],c=canvas.getContext('2d');c.clearRect(0,0,480,640);rr(c,0,0,480,640,0,'#f7f9ed');text(c,'CATDOM / '+s.id.toString().padStart(2,'0'),240,26,12,'#6b8068',true);text(c,l.name,240,61,27,'#24413e',true);
 image(c,'board',240,320,440,440);
 if(s.id==='3'){for(let i=0;i<5;i++){text(c,String.fromCharCode(65+i),80+i*80,109,12,'#56777a',true);text(c,String(i+1),31,160+i*80,12,'#e6f5f0',true)}}
 for(let y=0;y<5;y++)for(let x=0;x<5;x++){
  const [px,py]=pos(x,y);rr(c,px-38,py-38,76,76,9,'#53bdd8','#9fdfeb');
  if(M.contains(s.walls,x,y)){rr(c,px-38,py-38,76,76,9,'#447c8f','#5e91a0');rr(c,px-31,py-30,62,51,6,'#5d96a5');c.strokeStyle='#75a5b0';c.lineWidth=2;c.beginPath();c.moveTo(px-20,py-12);c.lineTo(px+20,py-12);c.stroke()}
 }
 const alarm=M.alarmActive(s);
 if(s.id==='1'){const m=s.cats.find(c=>c.magnet);if(m&&m.scale>0)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=m.x+dx,y=m.y+dy;if(x<0||x>4||y<0||y>4)continue;const [px,py]=pos(x,y);rr(c,px-37,py-37,74,74,9,'#e9dba0','#fff1bb',2)}}
 for(const [x,y] of s.alarms){const [px,py]=pos(x,y);rr(c,px-37,py-37,74,74,9,alarm?'#f39a88':'#93c9a4',alarm?'#ce6250':'#689c78',2);if(alarm)text(c,'!',px,py,31,'#a94535',true);else{c.strokeStyle='#407052';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(px-10,py);c.lineTo(px-3,py+8);c.lineTo(px+12,py-10);c.stroke();c.lineCap='butt'}}
 if(s.id==='4'){
  text(c,alarm?'BÁO ĐỘNG BẬT · GIỮ S ĐỂ TẮT':'BÁO ĐỘNG TẮT · ĐỪNG NHẢ S SỚM',240,94,12,alarm?'#b94d3a':'#44714c',true);
  for(const p of s.alarmSwitches||[]){const [x,y]=pos(...p);c.setLineDash([4,5]);c.strokeStyle=alarm?'#b9705e':'#52895b';c.lineWidth=2;c.beginPath();c.moveTo(x+34,y);c.lineTo(x+40,y);c.lineTo(x+40,240);c.lineTo(160,240);c.stroke();c.setLineDash([]);rr(c,x-35,y-35,70,70,12,alarm?'#efe1b1':'#bed99c',alarm?'#a68b43':'#668a41',3);text(c,alarm?'S':'↓',x,y,30,alarm?'#876a28':'#456b2e',true)}
 }
 for(const f of s.floors){const [px,py]=pos(f.x,f.y);rr(c,px-37,py-37,74,74,9,f.durability?'#e9c38c':'#244e63',f.durability?'#fbe4b7':'#1b4051',2);if(f.durability){c.strokeStyle='#a2774c';c.lineWidth=3;c.beginPath();[[px-19,py-32],[px-6,py-14],[px-16,py],[px+6,py+10],[px-2,py+32]].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();badge(c,''+f.durability,px+21,py-22,'#fff2d7','#946332')}else text(c,'×',px,py,38,'#6e8c96',true)}
 if(s.id==='6'&&M.electricActive(s))for(const [x,y] of M.electricBarrierCells(s)){const [px,py]=pos(x,y);rr(c,px-38,py-38,76,76,8,'#efb387','#ce5d3f',4);c.strokeStyle='#c15e40';c.lineWidth=2;for(let offset=-24;offset<=24;offset+=16){c.beginPath();c.moveTo(px-31,py+offset-5);c.lineTo(px+31,py+offset+5);c.stroke()}}
 if(s.pads.length){const a=pos(...s.pads[0]),b=pos(...s.pads[1]),occ=M.padOccupants(s),live=occ.every(i=>i>=0)&&occ[0]!==occ[1];
  c.strokeStyle=live?'#e66146':'#8caaa5';c.lineWidth=live?8:5;c.beginPath();c.moveTo(...a);if(live){for(let i=1;i<12;i++)c.lineTo(a[0]+(b[0]-a[0])*i/12,a[1]+(i%2?10:-10))}c.lineTo(...b);c.stroke();
  text(c,`A: ${occ[0]>=0?'NHẤN':'TRỐNG'} · B: ${occ[1]>=0?'NHẤN':'TRỐNG'} · ĐIỆN ${live?'BẬT!':'TẮT'}`,240,94,12,live?'#c34b33':'#617973',true);
  s.pads.forEach((p,i)=>{const [x,y]=pos(...p),on=occ[i]>=0;rr(c,x-35,y-35,70,70,12,live?'#ffd0ba':on?'#f2dca7':'#ccd9d4',live?'#dc6546':on?'#b28b42':'#78978e',3);rr(c,x-25,y-(on?18:26),50,on?39:47,8,live?'#f19972':on?'#d8bb7b':'#e3ece7',live?'#be543a':'#8aa297',2);text(c,on?'↓':'○',x,y,29,on?'#8b6b2d':'#79988d',true)})}
 for(let i=0;i<s.holes.length;i++){
  const h=s.holes[i];if(h.scale<.02)continue;const xs=h.shape.map(p=>p[0]),ys=h.shape.map(p=>p[1]),w=(Math.max(...xs)+1)*80-6,hh=(Math.max(...ys)+1)*80-6,x=80+h.x*80+(w-74)/2,y=160+h.y*80+(hh-74)/2;
  image(c,'hole-'+h.color,x,y,w*h.scale,hh*h.scale);text(c,''+h.remaining,x,y+2,27,'#ffffff',true);
  if(options.selected===i&&!s.outcome){c.setLineDash([6,4]);rr(c,x-w/2-3,y-hh/2-3,w+6,hh+6,5,null,'#fff4c1',3);c.setLineDash([])}
  if(s.id==='3'){const axis=h.axis||'FREE';badge(c,axis==='HORIZONTAL'?'↔':axis==='VERTICAL'?'↕':'○',x+24,y-26,axis==='FREE'?'#e7efe0':'#ece0f7',axis==='FREE'?'#60804c':'#8552a6')}
 }
 for(const f of s.floors)if(f.durability===0){const [x,y]=pos(f.x,f.y);rr(c,x-39,y-39,78,78,10,null,'#df9272',3);badge(c,'0',x+24,y-26,'#fbe1cb','#aa6148')}
 if(s.id==='4')for(const p of s.alarmSwitches||[]){const [x,y]=pos(...p);rr(c,x-39,y-39,78,78,12,null,alarm?'#b78e3e':'#e7cc58',3);badge(c,'S',x+24,y-28,alarm?'#fff0c4':'#e7f2cf',alarm?'#957235':'#55743c');if(!alarm){rr(c,x-26,y+23,52,18,5,'#e9f2d3');text(c,'GIỮ',x,y+32,10,'#55743c',true)}}
 s.pads.forEach((p,i)=>{const [x,y]=pos(...p),occ=M.padOccupants(s),on=occ[i]>=0,live=occ.every(n=>n>=0)&&occ[0]!==occ[1];rr(c,x-39,y-39,78,78,12,null,live?'#ee6646':on?'#e2b653':'#72958b',3);badge(c,String.fromCharCode(65+i),x+24,y-28,live?'#ffd5be':on?'#fff0bb':'#e1ece5',live?'#b34e36':on?'#947337':'#5e8071')});
 for(const cat of s.cats){if(cat.scale<.02)continue;const [x,y]=pos(cat.x,cat.y);image(c,'cat-'+cat.color,x,y-8,72*cat.scale,76*cat.scale);if(cat.kind==='STRIPE_H'||cat.kind==='STRIPE_V'){c.strokeStyle='#8b4fb1';c.lineWidth=3;c.beginPath();if(cat.kind==='STRIPE_H'){for(const dy of [9,16]){c.moveTo(x-12,y+dy);c.lineTo(x+12,y+dy)}}else{for(const dx of [-4,4]){c.moveTo(x+dx,y+5);c.lineTo(x+dx,y+23)}}c.stroke();badge(c,cat.kind==='STRIPE_H'?'↔':'↕',x+24,y-36,'#ece0f7','#8552a6')}if(cat.kind==='RESET')badge(c,'○',x+24,y-36,'#e6efd3','#60804c');if(cat.guard)badge(c,'G',x+24,y-36,'#e2efd5','#507c4f');if(cat.arrow)badge(c,cat.arrow[0]>0?'→':cat.arrow[0]<0?'←':cat.arrow[1]>0?'↓':'↑',x+24,y-36,'#e3f3ec','#3c837d')}
 if(s.conflict){const [x,y]=pos(s.conflict.x,s.conflict.y);badge(c,'↔',x-23,y+27,'#fbe1d5','#a85c48');badge(c,'↕',x+23,y+27,'#fbe1d5','#a85c48');text(c,'×',x,y+27,20,'#a85c48',true)}
 for(const cat of s.cats)if(cat.magnet&&cat.scale>.02){const [x,y]=pos(cat.x,cat.y);badge(c,'∪',x+24,y-36,'#fff1cf','#bf5c44')}
 if(s.pulse>.02){c.globalAlpha=s.pulse;c.lineWidth=5;c.strokeStyle='#ffddd0';c.beginPath();c.arc(240,320,65+s.pulse*80,0,Math.PI*2);c.stroke();c.globalAlpha=1}
 if(s.outcome){rr(c,92,543,296,36,18,s.outcome==='lost'?'#f9e3d6':'#e3efcf');text(c,s.outcome==='lost'?(s.reasonCode==='LOSE_ELECTRIC'?'THUA: ĐIỆN TRÚNG MÈO / HỐ':s.reasonCode==='LOSE_CONFLICT'?'THUA: XUNG ĐỘT SỌC':s.reasonCode==='LOSE_STUCK'||s.events?.some(e=>e.kind==='stuck')?'THUA: KHÔNG THỂ HOÀN THÀNH':'THUA: PHẢI LÀM LẠI'):'HOÀN THÀNH!',240,561,15,s.outcome==='lost'?'#ae5a42':'#4c783b',true)}
 else text(c,s.id==='6'&&M.electricActive(s)?'ĐƯỜNG BỊ CHẶN · NHẢ A HOẶC B':s.id==='3'?`HỐ ${(options.selected??s.activeHole??0)+1} · STRICT: ${M.axisName(s.holes[options.selected??s.activeHole??0].axis)}`:options.interactive?'Kéo hố hoặc dùng nút mũi tên':'Xem thứ tự di chuyển của các hố',240,562,16,'#4c6a61');
 wrap(c,s.caption||l.rule,603,13);
 if(s.cursor){const [x,y]=pos(...s.cursor);c.beginPath();[[0,0],[2,24],[8,18],[15,28],[20,25],[13,15],[21,13]].forEach(([a,b],i)=>i?c.lineTo(x+a,y+b):c.moveTo(x+a,y+b));c.closePath();c.fillStyle='white';c.fill();c.strokeStyle='#284944';c.lineWidth=2;c.stroke()}
}
root.CatdomRenderer={ready,draw,colors,names};
})(window);
