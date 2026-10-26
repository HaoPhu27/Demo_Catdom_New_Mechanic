(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CatdomMechanics=api})(typeof window==='undefined'?globalThis:window,function(){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const cat=(id,color,x,y,extra={})=>({id,color,x,y,scale:1,...extra});
const hole=(color,x,y,remaining=1,shape=[[0,0]])=>({color,x,y,remaining,scale:1,shape});
const action=(h,dx,dy)=>({h,dx,dy});
const right=(h,n=1)=>Array.from({length:n},()=>action(h,1,0));
const left=(h,n=1)=>Array.from({length:n},()=>action(h,-1,0));
const up=(h,n=1)=>Array.from({length:n},()=>action(h,0,-1));
const stripeFixtures={
 'SC-01':{name:'SC-01 · Làm quen khóa ngang',hint:'↑ ↓ → →. Thử → trước để thấy nhận ngang quá sớm gây stuck và thua.',initial:{cats:[cat('normal-c2','xanhduong',2,1,{kind:'NORMAL'}),cat('h-d3','xanhduong',3,2,{kind:'STRIPE_H'}),cat('normal-e3','xanhduong',4,2,{kind:'NORMAL'})],holes:[hole('xanhduong',2,2,3)]},good:[...up(0),action(0,0,1),...right(0,2)]},
 'SC-02':{name:'SC-02 · Chia hố theo strict',hint:'Xanh 1: ← ← → → →. Xanh 2: ↑ ↑ ↑ ↑. Mỗi hố nhận một trục; không cho hố ngang ăn mèo dọc.',initial:{cats:[cat('h-d3','xanhduong',3,2,{kind:'STRIPE_H'}),cat('v-e3','xanhduong',4,2,{kind:'STRIPE_V'}),cat('normal-a3','xanhduong',0,2,{kind:'NORMAL'}),cat('normal-b3','xanhduong',1,2,{kind:'NORMAL'}),cat('normal-e1','xanhduong',4,0,{kind:'NORMAL'})],holes:[hole('xanhduong',2,2,3),hole('xanhduong',4,4,2)]},good:[...left(0,2),...right(0,3),...up(1,4)]},
 'SC-03':{name:'SC-03 · Thu sọc cùng trục',hint:'→ → ← ← ← ←. Hai mèo sọc ngang chỉ duy trì khóa ngang, không cộng dồn.',initial:{cats:[cat('h-d3','xanhduong',3,2,{kind:'STRIPE_H'}),cat('h-e3','xanhduong',4,2,{kind:'STRIPE_H'}),cat('normal-a3','xanhduong',0,2,{kind:'NORMAL'})],holes:[hole('xanhduong',2,2,3)]},good:[...right(0,2),...left(0,4)]},
 'SC-04':{name:'SC-04 · Mèo cuối hoàn thành hố',hint:'→ →. Hố nhận ngang, còn 1; ăn mèo dọc cuối cùng vẫn hoàn thành, không xung đột.',initial:{cats:[cat('last-h','xanhduong',3,2,{kind:'STRIPE_H'}),cat('last-v','xanhduong',4,2,{kind:'STRIPE_V'})],holes:[hole('xanhduong',2,2,2)]},good:right(0,2)},
 'SC-05':{name:'SC-05 · Strict gây stuck',hint:'Đúng: ↑ ↑ ↓ ↓ → →. Sai: → ăn sọc ngang trước, hố không thể thu mèo ở cột trên và thua STUCK ngay.',initial:{cats:[cat('above','xanhduong',2,0,{kind:'NORMAL'}),cat('lock','xanhduong',3,2,{kind:'STRIPE_H'}),cat('right','xanhduong',4,2,{kind:'NORMAL'})],holes:[hole('xanhduong',2,2,3)]},good:[...up(0,2),action(0,0,1),action(0,0,1),...right(0,2)]}
};
function laneBoard(columns,colors,quota){return {cats:columns.flatMap((x,i)=>Array.from({length:quota},(_,n)=>cat('lane-'+i+'-'+n,colors[i],x,3-n))),holes:columns.map((x,i)=>hole(colors[i],x,4,quota)),pads:[[1,2],[3,2]]}}
const electricFixtures={
 'EL-00':{name:'EL-00 · Hai hố làm quen',hint:'Xanh ↑ ↑ vào A. Hồng ↑ ↑ vào B để bật rào chắn. Cho Xanh ← để tắt điện.',initial:{cats:[cat('b','xanhduong',0,0),cat('p','hong',4,0)],holes:[hole('xanhduong',1,4),hole('hong',3,4)],pads:[[1,2],[3,2]]},bad:[...up(0,2),...up(1,2)],good:[...up(0,2),...left(0),...up(0,2),...up(1,2),...right(1),...up(1,2)]},
 'EL-01':{name:'EL-01 · 3 hố × 3 mèo',hint:'Thử rào: Xanh ↑ ↑ →; Hồng ↑ ↑ ←; Vàng ↑ bị chặn. Mở: Xanh ← ↑; Hồng → ↑; Vàng ↑ ↑ ↑.',initial:laneBoard([0,4,2],['xanhduong','hong','vang'],3),bad:[...up(0,2),...right(0),...up(1,2),...left(1),...up(2,2)],good:[...up(0,2),...right(0),...left(0),...up(0),...up(1,2),...left(1),...right(1),...up(1),...up(2,3)]},
 'EL-02':{name:'EL-02 · 4 hố × 3 mèo',hint:'Vàng ↑ ↑ ← để nhường B. Hồng ↑ ↑ đứng A. Vàng → bật điện; ← tắt điện. Hoàn thành Hồng ↑, Vàng → ↑, hai hố xanh ↑ ↑ ↑.',initial:laneBoard([0,1,3,4],['xanhduong','hong','vang','xanhduong'],3),bad:[...up(2,2),...left(2),...up(1,2),...right(2),...right(0),...up(0),...right(0),...up(0)],good:[...up(2,2),...left(2),...up(1,2),...up(1),...right(2),...up(2),...up(0,3),...up(3,3)]},
 'EL-03':{name:'EL-03 · 3 hố × 4 mèo',hint:'Xanh ↑ ↑ → vào A, Hồng ↑ ↑ ← vào B để chặn đường. Xanh ← ↑ ↑ rời A và hoàn thành; Hồng → ↑ ↑; Vàng ↑ ↑ ↑ ↑.',initial:laneBoard([0,4,2],['xanhduong','hong','vang'],4),bad:[...up(0,2),...right(0),...up(1,2),...left(1),...up(2,2)],good:[...up(0,2),...right(0),...left(0),...up(0,2),...up(1,2),...left(1),...right(1),...up(1,2),...up(2,4)]},
 'EL-04':{name:'EL-04 · 4 hố × 4 mèo',hint:'Vàng ↑ ↑ ←; Hồng ↑ ↑; Vàng → bật điện, ← để mở. Hoàn thành Hồng ↑ ↑; Vàng → ↑ ↑; Xanh 1 và Xanh 4 mỗi hố ↑ ↑ ↑ ↑.',initial:laneBoard([0,1,3,4],['xanhduong','hong','vang','xanhduong'],4),bad:[...up(2,2),...left(2),...up(1,2),...right(2),...right(0),...up(0),...right(0),...up(0)],good:[...up(2,2),...left(2),...up(1,2),...up(1,2),...right(2),...up(2,2),...up(0,4),...up(3,4)]}
};
Object.assign(electricFixtures['EL-00'],{badOutcome:null,badTitle:'Đoạn nối trống: chỉ chặn đường',badLesson:'Bật điện khi đoạn nối trống: không thua. Đường điện trở thành vật cản.',good:[...up(0,2),...up(1,2),...left(0),...up(0,2),...right(1),...up(1,2)]});
Object.assign(electricFixtures['EL-01'],{badOutcome:'lost',badTitle:'Bật điện trúng mèo',badLesson:'Mèo vàng còn trên đoạn nối A–B lúc bật điện: THUA ngay.',hint:'Đừng bật cả A và B khi mèo vàng còn ở ô giữa. Xanh ↑ ↑ → ← ↑; Hồng ↑ ↑ ← → ↑; Vàng ↑ ↑ ↑.'});
Object.assign(electricFixtures['EL-02'],{badOutcome:'lost',badTitle:'Bật điện trúng hố',badLesson:'Hố Hồng còn trong đoạn nối khi Xanh nhấn A và Vàng giữ B: THUA ngay.',hint:'An toàn: Vàng ↑ ↑ ←; Hồng ↑ ↑; Vàng → bật điện khi đoạn nối trống. Hồng ↑ nhả A và hoàn thành; Vàng ↑; mỗi hố xanh ↑ ↑ ↑.',bad:[...up(2),...up(1,2),...right(1),...up(2),...right(0),...up(0,2)]});
Object.assign(electricFixtures['EL-03'],{badOutcome:'lost',badTitle:'Mèo trên dây, quota 4',badLesson:'Mèo vàng chưa được dọn khỏi đoạn nối: kích hoạt điện gây THUA ngay.',hint:'Dọn mèo trên đoạn nối trước khi bật điện. Giải an toàn: Xanh ↑ ↑ → ← ↑ ↑; Hồng ↑ ↑ ← → ↑ ↑; Vàng ↑ ↑ ↑ ↑.'});
Object.assign(electricFixtures['EL-04'],{badOutcome:null,badTitle:'Rào bật khi đoạn nối trống',badLesson:'Đoạn nối trống nên bật điện không thua. Hố Xanh thử đi vào đường điện và bị chặn.',hint:'Vàng ↑ ↑ ←; Hồng ↑ ↑; Vàng → bật rào an toàn. Hồng ↑ ↑ nhả A và hoàn thành; Vàng ↑ ↑; mỗi hố xanh ↑ ↑ ↑ ↑. Không đi vào ô giữa khi rào đang bật.',good:[...up(2,2),...left(2),...up(1,2),...right(2),...up(1,2),...up(2,2),...up(0,4),...up(3,4)]});
const levels={
 '1':{id:1,name:'Mèo nam châm',icon:'∪',accent:'#bd9b39',tag:'DỌN VÙNG HÚT TRƯỚC',headline:'Một chút hút.\nMột cú đổi ván.',description:'Khi được ăn, mèo nam châm hút mọi mèo trong 8 ô xung quanh, kể cả khác màu. Mèo bị hút mất khiến các hố còn lại không thể hoàn thành.',rule:'Dọn 8 ô xung quanh. Ăn nam châm sau.',hint:'Hố xanh: ↑ ↑ ↑ →. Hố hồng: ↑ ↑ ←. Cuối cùng hố vàng: ↑ ↑.',badTitle:'Ăn nam châm quá sớm',goodTitle:'Dọn vùng hút trước',badLesson:'Mèo xanh và hồng bị hút mất. Hai hố còn thiếu mèo, phải làm lại.',goodLesson:'Thu mèo xanh và hồng trước, rồi ăn nam châm để hoàn thành.',note:'Phạm vi hút gồm 8 ô kề cạnh và đường chéo. Mèo khác màu chặn đường hố. Hút mất mèo cần cho hố khác gây stuck và phải làm lại.',initial:{cats:[cat('blue','xanhduong',1,1),cat('magnet','vang',2,2,{magnet:true}),cat('pink','hong',3,2)],holes:[hole('xanhduong',0,4),hole('vang',2,4),hole('hong',4,4)]},bad:up(1,2),good:[...up(0,3),...right(0),...up(2,2),...left(2),...up(1,2)]},
 '2':{id:2,name:'Sàn dễ vỡ',icon:'◇',accent:'#c08342',tag:'TÍNH TRƯỚC ĐƯỜNG VỀ',headline:'Một lần đi qua.\nMột vết nứt mới.',description:'Mỗi lần hố đi vào ô sàn dễ vỡ, độ bền giảm 1. Về 0, ô sàn sụp xuống và không thể đi qua nữa. Một lượt đi thừa có thể cắt đứt đường của hố khác.',rule:'Sàn 2 → 1 → 0. Đừng lãng phí lượt qua cầu.',hint:'Hố xanh đi → → → → ↑. Sau khi xanh hoàn thành, hố hồng đi ↑ ← ← ← ← ↑. Không quay lại cầu.',badTitle:'Quay lại quá nhiều',goodTitle:'Mỗi hố qua một lần',badLesson:'Cầu sụp quá sớm. Hố hồng không còn đường đến mèo.',goodLesson:'Dùng vừa đủ hai lượt qua cầu để hoàn thành cả hai hố.',note:'Độ bền giảm khi hố đi vào ô mới, không giảm theo thời gian đứng trên ô. Hố đang đứng trên sàn vừa sụp vẫn có thể rời đi.',
  initial:{cats:[cat('b','xanhduong',4,1),cat('p','hong',0,1)],holes:[hole('xanhduong',0,2),hole('hong',4,3)],walls:Array.from({length:25},(_,i)=>[i%5,Math.floor(i/5)]).filter(([x,y])=>y!==2&&!((x===0||x===4)&&y===1)&&!(x===4&&y===3)),floors:[{x:2,y:2,durability:2,max:2}]},
  bad:[...right(0,2),...left(0),...right(0)],good:[...right(0,4),...up(0),...up(1),...left(1,4),...up(1)]},
 '3':{id:3,name:'Mèo sọc',icon:'↔',accent:'#a479bf',tag:'NHẬN STRICT · TRÁNH XUNG ĐỘT',headline:'Nhận một trục.\nChọn đúng mèo tiếp theo.',description:'Ăn mèo sọc ngang hoặc dọc để hố nhận strict tương ứng. Mèo thường giữ nguyên strict. Ăn sọc đối trục khi hố còn cần hơn 1 mèo: thua ngay. Hố còn 1 ăn mèo cuối sẽ hoàn thành và biến mất, không xung đột. Có thể tiếp cận mèo sọc từ mọi hướng nếu hố còn đi được hướng đó.',rule:'Còn >1: sọc đối trục gây thua. Còn 1: ăn mèo cuối, hố biến mất. Không còn cách thu đủ mèo: thua STUCK.',hint:stripeFixtures['SC-02'].hint,badTitle:'Hố ngang ăn mèo dọc',goodTitle:'Mỗi hố giữ một trục',badLesson:'Xanh 1 nhận ngang, còn 2 mèo mà ăn sọc dọc: xung đột, thua ngay.',goodLesson:'Xanh 1 thu hai mèo thường rồi sọc ngang. Xanh 2 nhận sọc dọc rồi thu mèo thường, vẫn giữ strict dọc.',note:'Không yêu cầu hướng tiếp cận trùng sọc của mèo. Khi đã nhận strict, hố chỉ đi theo trục đang mang; vuốt sai trục bị chặn. Chỉ kiểm tra xung đột sọc nếu hố còn cần hơn 1 mèo trước khi ăn. Khi còn 1, ưu tiên thu mèo cuối và xóa hố. Thả tay, đổi hố, tạm dừng và ăn mèo thường không đổi strict. Nếu không còn chuỗi di chuyển hợp lệ để thu đủ mèo cho các hố, màn thua STUCK ngay. Một hố bị chặn tạm vẫn được tiếp tục nếu hố khác có thể dọn mèo hoặc nhường đường. Mỗi hố giữ strict riêng; làm lại màn đưa hố về tự do.',
  initial:stripeFixtures['SC-02'].initial,bad:right(0,2),good:stripeFixtures['SC-02'].good},
 '4':{id:4,name:'Vùng báo động',icon:'!',accent:'#cc6555',tag:'GIỮ CÔNG TẮC · PHỐI HỢP HỐ',headline:'Một hố giữ.\nMột hố đi qua.',description:'Đứng trên công tắc S để tắt toàn bộ vùng báo động. Hố khác đi qua khi các ô chuyển xanh. Rời công tắc làm báo động bật lại: nếu còn bất kỳ hố nào trong vùng đỏ, thua ngay.',rule:'Giữ S để tắt báo động. Chờ hố khác ra khỏi vùng nguy hiểm rồi mới nhả.',hint:'Xanh ↑ vào S và giữ. Hồng ↑ ↑ ↑ ← ↑ để thu đủ 2 mèo và ra khỏi vùng. Cuối cùng Xanh ↑ ↑ ↑ thu mèo xanh.',badTitle:'Nhả công tắc quá sớm',goodTitle:'Giữ đến khi hố kia qua hết',badLesson:'Xanh rời S khi Hồng còn trong vùng báo động: vùng đỏ bật lại và thua ngay, dù Xanh đứng ngoài vùng.',goodLesson:'Xanh giữ S, Hồng đi qua vùng xanh và hoàn thành. Khi vùng đã trống, Xanh rời công tắc để thu mèo cuối.',note:'Bất kỳ hố nào còn hoạt động cũng có thể giữ S. Ăn mèo không tắt báo động vĩnh viễn. Khi hố giữ công tắc hoàn thành và biến mất, công tắc được nhả ngay. Kiểm tra mọi ô mà các hố còn hoạt động chiếm, không chỉ hố vừa di chuyển. Hố đã hoàn thành không còn ở vùng nguy hiểm.',initial:{cats:[cat('b','xanhduong',0,0),cat('p1','hong',4,1),cat('p2','hong',3,0)],holes:[hole('xanhduong',0,4),hole('hong',4,4,2)],alarmSwitches:[[0,3]],alarms:[[1,2],[2,2],[3,2],[4,2]]},bad:[...up(0),...up(1,2),action(0,0,1)],good:[...up(0),...up(1,3),...left(1),...up(1),...up(0,3)]},
 '5':{id:5,name:'Mèo dịch chuyển',icon:'→',accent:'#468e9c',tag:'NHÌN TRƯỚC VỊ TRÍ MỚI',headline:'Ăn một mèo.\nĐổi cả vị trí.',description:'Thu mèo mang mũi tên sẽ dịch chuyển các mèo còn lại cùng màu 1 ô theo hướng chỉ định. Nếu ô đích có mèo hoặc hố, mèo đó đứng yên. Đừng đẩy mèo vào nơi hố không thể tới.',rule:'Dự đoán ô đích trước khi thu mèo mũi tên.',hint:'Hố xanh đi → → ↑ ↑ để thu mèo thường, rồi ← để ăn mèo mũi tên. Nếu ăn mũi tên trước, mèo thường sẽ lọt vào hốc hẹp bên phải.',badTitle:'Dịch chuyển vào góc kẹt',goodTitle:'Dọn mèo dễ kẹt trước',badLesson:'Mèo bị đẩy vào hốc 1 ô. Hố cao 2 ô không thể thu được nữa.',goodLesson:'Thu mèo thường trước, rồi mới kích hoạt mèo mũi tên.',note:'Demo dùng mũi tên sang phải và hố cao 2 ô. Ô đích có mèo/hố sẽ chặn dịch chuyển; tường và mép board cũng chặn để giữ mèo trong vùng hợp lệ. Các ô đích được kiểm tra cùng một thời điểm.',
  initial:{cats:[cat('arrow','xanhduong',2,2,{arrow:[1,0]}),cat('normal','xanhduong',3,1)],holes:[hole('xanhduong',1,3,2,[[0,0],[0,1]])],walls:[[4,0],[4,2]]},
  bad:[...up(0),...right(0)],good:[...right(0,2),...up(0,2),...left(0)]},
 '6':{id:6,name:'Liên kết điện',icon:'ϟ',accent:'#b08b28',tag:'DỌN ĐOẠN NỐI · TRÁNH ĐIỆN',headline:'Bật điện đúng lúc.\nĐừng để ai trên dây.',description:'Hai hố giữ A và B để bật điện. Nếu còn mèo hoặc hố trên đoạn nối giữa A–B, thua ngay. Nếu đoạn nối trống, điện chỉ tạo rào chắn: hố không được đi vào cho đến khi một công tắc được nhả.',rule:'Bật điện trúng mèo/hố trên đoạn nối: THUA. Đoạn nối trống: chặn đường. Nhả A hoặc B để mở.',hint:electricFixtures['EL-01'].hint,badTitle:electricFixtures['EL-01'].badTitle,goodTitle:'Dọn đoạn nối, bật điện an toàn',badLesson:electricFixtures['EL-01'].badLesson,goodLesson:'Dọn mèo và đưa hố ra khỏi đoạn nối trước khi bật điện. Khi rào đang bật, nhả một công tắc để mở đường rồi tiếp tục thu mèo.',note:'Phạm vi nguy hiểm là các ô giữa A và B, không gồm chính hai ô công tắc. Kiểm tra toàn bộ hình dạng của mọi hố còn hoạt động và mọi mèo còn trên board ngay khi điện bật, trước khi thu mèo. Hố đã hoàn thành và mèo đã thu không còn bị tính. Khi điện đã bật, thử đi vào đoạn nối chỉ bị chặn vì hố chưa đi vào được. Không cho hố đứng sẵn trên dây thoát nạn sau khi bật: màn đã thua. Mèo ngoài đoạn nối vẫn thu bình thường.',initial:electricFixtures['EL-01'].initial,bad:electricFixtures['EL-01'].bad,good:electricFixtures['EL-01'].good}

};
function create(id,fixture='SC-02'){const l=levels[id];if(!l)throw new Error('Unknown mechanic');const init=String(id)==='3'?stripeFixtures[fixture]?.initial:String(id)==='6'?(electricFixtures[fixture]||electricFixtures['EL-01']).initial:l.initial;if(!init)throw new Error('Unknown Stripe Cat fixture');const s={id:String(id),...copy(init),walls:copy(init.walls||[]),floors:copy(init.floors||[]),alarms:copy(init.alarms||[]),pads:copy(init.pads||[]),outcome:null,reason:'',caption:l.rule,turn:0,pulse:0,events:[]};if(s.id==='6')s.fixture=electricFixtures[fixture]?fixture:'EL-01';if(s.id==='3'){s.fixture=fixture;s.log=[];s.invalidSwipes=0;s.totalSwipes=0;s.retryIndex=0;s.holes.forEach(h=>h.axis='FREE')}return s}
const key=(x,y)=>x+','+y;
const cells=(h,x=h.x,y=h.y)=>h.shape.map(([dx,dy])=>[x+dx,y+dy]);
const contains=(list,x,y)=>list.some(p=>p[0]===x&&p[1]===y);
function fits(s,h,x,y,oldX=h.x,oldY=h.y,ignoreMovable=false){
 const old=cells(h,oldX,oldY);
 return cells(h,x,y).every(([cx,cy])=>cx>=0&&cx<5&&cy>=0&&cy<5&&!contains(s.walls,cx,cy)&&!s.floors.some(f=>f.x===cx&&f.y===cy&&f.durability===0&&!contains(old,cx,cy))&&(ignoreMovable||(!s.holes.some(o=>o!==h&&o.remaining>0&&contains(cells(o),cx,cy))&&!s.cats.some(c=>c.scale>0&&c.color!==h.color&&c.x===cx&&c.y===cy))));
}
function canReach(s,h,c){
 const queue=[[h.x,h.y]],seen=new Set([key(h.x,h.y)]);
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];if(contains(cells(h,x,y),c.x,c.y))return true;
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const xx=x+dx,yy=y+dy,k=key(xx,yy);if(!seen.has(k)&&fits(s,h,xx,yy,x,y,true)){seen.add(k);queue.push([xx,yy])}}
 }return false;
}
const alarmActive=s=>s.id==='4'&&!(s.alarmSwitches||[]).some(p=>s.holes.some(h=>h.remaining>0&&contains(cells(h),...p)));
const alarmOccupied=s=>s.holes.some(h=>h.remaining>0&&s.alarms.some(p=>contains(cells(h),...p)));
function checkAlarm(s){if(!alarmActive(s)||!alarmOccupied(s))return false;lose(s,'Báo động đang BẬT và có hố trong vùng nguy hiểm. Giữ công tắc S cho đến khi vùng đã trống!','alarm');return true;}
const padOccupants=s=>s.pads.map(([x,y])=>s.holes.findIndex(h=>h.remaining>0&&contains(cells(h),x,y)));
const electricActive=s=>{const occ=padOccupants(s);return occ.length===2&&occ.every(i=>i>=0)&&occ[0]!==occ[1]};
function electricBarrierCells(s){if(s.pads.length!==2)return [];const [[ax,ay],[bx,by]]=s.pads;if(ay!==by&&ax!==bx)return [];const steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));return Array.from({length:Math.max(0,steps-1)},(_,i)=>[ax+Math.sign(bx-ax)*(i+1),ay+Math.sign(by-ay)*(i+1)]);}
function electricOccupants(s){const beam=electricBarrierCells(s);return {cats:s.cats.filter(c=>c.scale>0&&contains(beam,c.x,c.y)),holes:s.holes.filter(h=>h.remaining>0&&cells(h).some(p=>contains(beam,...p))) };}
function checkElectric(s){if(s.id!=='6'||!electricActive(s))return false;const hit=electricOccupants(s);if(!hit.cats.length&&!hit.holes.length)return false;s.electricHit={cats:hit.cats.map(c=>c.id),holes:hit.holes.map(h=>s.holes.indexOf(h))};s.reasonCode='LOSE_ELECTRIC';lose(s,'Điện bật khi còn '+(hit.cats.length&&hit.holes.length?'mèo và hố':hit.cats.length?'mèo':'hố')+' trên đoạn nối A–B. Phải dọn trống đoạn nối trước khi kích hoạt!','electricHit');return true;}
function lose(s,reason,kind){s.outcome='lost';s.reasonCode=s.reasonCode||(kind==='stuck'?'LOSE_STUCK':kind==='alarm'?'LOSE_ALARM':'LOSE');s.reason=reason;s.caption=reason;s.events.push({kind})}
const axisName=axis=>axis==='HORIZONTAL'?'NGANG':axis==='VERTICAL'?'DỌC':'TỰ DO';
function record(s,type,hi,fields={}){const event={sequenceId:s.log.length+1,type,level_id:s.fixture,hole_id:hi,move_index:s.turn,...fields};s.log.push(event);s.events.push({...event,kind:type})}
function stripeConflict(s,h,hi,incoming,catId){const from=h.axis;s.conflict={from,incoming,x:h.x,y:h.y};s.reasonCode='LOSE_CONFLICT';lose(s,from==='FREE'?'Cùng bước có cả sọc NGANG và DỌC — xung đột!':`Hố đang khóa ${axisName(from)}. Ăn mèo sọc ${axisName(incoming)} gây xung đột — thua ngay.`,'stripeConflict');record(s,'stripe_conflict_lose',hi,{old_axis:from,incoming_stripe:incoming,cat_id:catId});return {state:s,valid:true}}
function retry(s){if(s.id!=='3')return create(s.id);const next=create('3',s.fixture);next.retryIndex=(s.retryIndex||0)+1;record(next,'level_retry',null,{retry_index:next.retryIndex,last_fail_reason:s.reasonCode||s.reason||null});return next}
// Search actual legal moves of all holes: a temporary obstruction may be cleared
// by another hole, while a strict can make a still-mobile hole permanently stuck.
function stripeCanComplete(input){
 if(input.outcome)return input.outcome==='won';
 const signature=s=>s.holes.map(h=>h.remaining>0?[h.x,h.y,h.remaining,h.axis].join(','):'done').join('|')+'/'+s.cats.map(c=>c.scale>0?'1':'0').join('');
 const initial=copy(input);initial.log=[];initial.events=[];
 const stack=[initial],seen=new Set([signature(initial)]);
 while(stack.length){const current=stack.pop();
  for(let hi=0;hi<current.holes.length;hi++){const h=current.holes[hi];if(h.remaining<=0)continue;
   const dirs=h.axis==='HORIZONTAL'?[[1,0],[-1,0]]:h.axis==='VERTICAL'?[[0,1],[0,-1]]:[[1,0],[-1,0],[0,1],[0,-1]];
   for(const [dx,dy] of dirs){const result=step(current,hi,dx,dy,{skipStuck:true});if(!result.valid||result.state.outcome==='lost')continue;
    if(result.state.outcome==='won')return true;
    const next=result.state,k=signature(next);if(seen.has(k))continue;seen.add(k);next.log=[];next.events=[];stack.push(next);
   }
  }
 }return false;
}
function step(input,hi,dx,dy,options={}){
 const s=copy(input);s.events=[];s.pulse=0;
 const h=s.holes[hi];if(s.outcome||!h||h.remaining<=0||Math.abs(dx)+Math.abs(dy)!==1)return {state:s,valid:false};
 if(checkElectric(s))return {state:s,valid:true};
 if(s.id==='3')s.totalSwipes=(s.totalSwipes||0)+1;
 if(s.id==='3'&&((h.axis==='HORIZONTAL'&&dy!==0)||(h.axis==='VERTICAL'&&dx!==0))){s.caption=`Hố đang khóa ${axisName(h.axis)}. Hướng này bị chặn, không thua.`;s.invalidSwipes++;record(s,'stripe_invalid_swipe',hi,{axis:h.axis,attempted_direction:dx<0?'LEFT':dx>0?'RIGHT':dy<0?'UP':'DOWN'});return {state:s,valid:false,blockedAxis:true}}
 const x=h.x+dx,y=h.y+dy;
 if(s.id==='6'){if(electricActive(s)&&electricBarrierCells(s).some(([cx,cy])=>contains(cells(h,x,y),cx,cy))){s.caption='Đường điện đang BẬT — không thể đi qua đoạn nối A–B. Cho một hố rời công tắc để mở đường.';s.events.push({kind:'electricBarrierBlocked'});return {state:s,valid:false,electricBlocked:true}}}
 if(!fits(s,h,x,y)){s.caption=s.cats.some(c=>c.scale>0&&c.color!==h.color&&contains(cells(h,x,y),c.x,c.y))?'Mèo khác màu chặn đường hố. Hãy đi đường khác.':'Đường này bị chặn. Hãy chọn hướng khác.';return {state:s,valid:false}}
 const old=cells(h);h.x=x;h.y=y;s.turn++;s.events.push({kind:'move',hole:hi});
 for(const f of s.floors)if(contains(cells(h),f.x,f.y)&&!contains(old,f.x,f.y)){f.durability=Math.max(0,f.durability-1);s.events.push({kind:'crack',x:f.x,y:f.y,durability:f.durability});s.caption='Độ bền sàn còn '+f.durability+'.'}
 if(s.id==='4'){if(alarmActive(input)!==alarmActive(s))s.events.push({kind:alarmActive(s)?'alarmOn':'alarmOff'});if(checkAlarm(s))return {state:s,valid:true}} 
 const wasElectric=s.id==='6'&&electricActive(input),isElectric=s.id==='6'&&electricActive(s);if(wasElectric!==isElectric)s.events.push({kind:isElectric?'electricOn':'electricOff'});
 if(checkElectric(s))return {state:s,valid:true};
 const targets=s.cats.filter(c=>c.scale>0&&c.color===h.color&&contains(cells(h),c.x,c.y));
 if(s.id==='3'&&h.remaining>1&&targets.some(c=>c.kind==='STRIPE_H')&&targets.some(c=>c.kind==='STRIPE_V'))return stripeConflict(s,h,hi,'BOTH',null);
 const accepted=targets.slice(0,h.remaining);
 for(const c of accepted){
  if(s.id==='3'){
   const before=h.axis;
   const incoming=c.kind==='STRIPE_H'?'HORIZONTAL':c.kind==='STRIPE_V'?'VERTICAL':null;
   if(incoming){if(h.remaining>1&&h.axis!=='FREE'&&h.axis!==incoming)return stripeConflict(s,h,hi,incoming,c.id);h.axis=incoming;record(s,'stripe_collected',hi,{cat_id:c.id,kind:c.kind,cat_kind:c.kind,axis_before:before,axis_after:h.axis})}
   record(s,'cat_collected',hi,{cat_id:c.id,cat_kind:c.kind||'NORMAL'});
  }
  c.scale=0;h.remaining--;s.events.push({kind:'collect',id:c.id});s.caption=s.id==='3'?`Đã thu mèo. Strict hiện tại: ${axisName(h.axis)}.`:'Đã thu mèo đúng màu.';if(c.arrow)s.events.push({kind:'trigger',id:c.id,arrow:c.arrow})
 }
 if(h.remaining===0)h.scale=0;
 if(s.id==='4'){if(!alarmActive(input)&&alarmActive(s)&&!s.events.some(e=>e.kind==='alarmOn'))s.events.push({kind:'alarmOn'});if(checkAlarm(s))return {state:s,valid:true};}
 for(const source of accepted.filter(c=>c.magnet)){
  const victims=s.cats.filter(c=>c.scale>0&&Math.max(Math.abs(c.x-source.x),Math.abs(c.y-source.y))<=1);
  for(const c of victims){s.events.push({kind:'magnet',id:c.id});c.x=source.x;c.y=source.y;c.scale=0}
  if(victims.length){s.caption='Nam châm đã hút mèo trong 8 ô xung quanh.';if(s.holes.some(o=>o.remaining>s.cats.filter(c=>c.scale>0&&c.color===o.color).length)){lose(s,'Nam châm hút mất mèo cần cho hố khác — phải làm lại!','stuck');return {state:s,valid:true}}}
 }
 for(const trigger of s.events.filter(e=>e.kind==='trigger')){
  const source=s.cats.find(c=>c.id===trigger.id),active=s.cats.filter(c=>c.scale>0),occupied=active.map(c=>[c.x,c.y]);
  for(const c of active.filter(c=>c.color===source.color)){
   const xx=c.x+trigger.arrow[0],yy=c.y+trigger.arrow[1];
   const blocked=xx<0||xx>=5||yy<0||yy>=5||contains(s.walls,xx,yy)||contains(occupied,xx,yy)||s.holes.some(o=>o.remaining>0&&contains(cells(o),xx,yy));
   if(blocked){s.events.push({kind:'blockedTeleport',id:c.id});continue}
   s.events.push({kind:'teleport',id:c.id,from:[c.x,c.y],to:[xx,yy]});c.x=xx;c.y=yy;s.caption='Các mèo cùng màu dịch chuyển 1 ô sang phải.';
  }
 }
 if(s.holes.every(h=>h.remaining===0)){s.outcome='won';s.reason='Mọi hố đều hoàn thành!';s.caption=s.reason;if(s.id==='3')record(s,'level_complete',hi,{total_moves:s.turn,total_swipes:s.totalSwipes,invalid_swipes:s.invalidSwipes,retries:s.retryIndex})}
 else if(s.id==='2'||s.id==='5'){
  const stranded=s.cats.filter(c=>c.scale>0).some(c=>!s.holes.some(h=>h.remaining>0&&h.color===c.color&&canReach(s,h,c)));
  if(stranded)lose(s,s.id==='2'?'Sàn đã sụp — mèo còn lại không còn đường thu!':'Mèo đã vào hốc hẹp — hố không thể tới được!','stuck');
 }
 if(s.id==='3'&&!s.outcome&&!options.skipStuck&&!stripeCanComplete(s)){
  s.reasonCode='LOSE_STUCK';lose(s,'STUCK: strict và vật cản khiến không còn cách thu đủ mèo cho các hố. Phải làm lại.','stuck');
  record(s,'stripe_stuck_lose',hi,{axis:h.axis,remaining:h.remaining});
 }
 if(s.id==='4'&&!s.outcome)s.caption=alarmActive(s)?'BÁO ĐỘNG BẬT · Đứng trên S trước khi vào vùng đỏ.':'BÁO ĐỘNG TẮT · Giữ S cho đến khi hố khác ra khỏi vùng xanh.';
 if(s.id==='6'&&!s.outcome){const occ=padOccupants(s),labels=occ.map((n,i)=>n>=0?String.fromCharCode(65+i):'').filter(Boolean);s.caption=electricActive(s)?'ĐIỆN BẬT: đoạn nối A–B chặn đường. Mèo ở nơi khác vẫn thu được.':labels.length?'Công tắc '+labels.join(' và ')+' đang nhấn. ĐIỆN TẮT — đường giữa đang mở.':'ĐIỆN TẮT — đường giữa đang mở.'}
 return {state:s,valid:true};
}
return {levels,stripeFixtures,electricFixtures,electricActive,electricBarrierCells,electricOccupants,create,step,retry,axisName,copy,cells,contains,canReach,alarmActive,alarmOccupied,padOccupants,stripeCanComplete};
});


