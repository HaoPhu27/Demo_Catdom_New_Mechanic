(function(){
'use strict';
document.body.classList.add('compact');
const bar=document.createElement('div');bar.className='view-tabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','Nội dung mechanic');
bar.innerHTML='<button id="tab-review" role="tab" aria-controls="review" data-view="review">Tổng quan & demo</button><button id="tab-play" role="tab" aria-controls="play" data-view="play">Chơi thử</button><button id="tab-gifs" role="tab" aria-controls="gifs" data-view="gifs">GIF minh họa</button>';
document.querySelector('.mechanic-picker').after(bar);
function view(name,update=true){
 const pending=document.querySelector('.review-pending');if(pending)name='review';
 if(!['review','play','gifs'].includes(name))name='review';
 document.body.dataset.view=name;
 for(const key of ['review','play','gifs']){const panel=document.getElementById(key),tab=bar.querySelector(`[data-view="${key}"]`);panel.hidden=key!==name;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-'+key);tab.setAttribute('aria-selected',String(key===name));tab.tabIndex=key===name?0:-1;tab.disabled=!!pending&&key!=='review'}
 if(update){const url=new URL(location.href);url.hash=name;history.replaceState(null,'',url);window.scrollTo({top:0,behavior:'instant'})}
}
bar.querySelectorAll('button').forEach(b=>b.onclick=()=>view(b.dataset.view));
bar.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...bar.querySelectorAll('button:not(:disabled)')],i=tabs.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();view(tabs[next].dataset.view)});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=a.getAttribute('href').slice(1);if(['review','mechanic','play','gifs'].includes(target)){e.preventDefault();view(target==='mechanic'?'review':target)}});
window.addEventListener('hashchange',()=>view(location.hash.slice(1),false));
window.compactLayout=function(){
 const review=document.getElementById('review'),aside=review.querySelector('.review-script');
 review.querySelectorAll('.review-criteria article').forEach((article,i)=>{const box=article.querySelector('div'),h=box.querySelector('h3'),details=document.createElement('details'),summary=document.createElement('summary');details.className='criterion';if(i===0)details.open=true;summary.innerHTML=`<span class="review-index">0${i+1}</span><span>${h.textContent}</span>`;h.remove();details.append(summary);const content=document.createElement('div');content.className='criterion-content';while(box.firstChild)content.append(box.firstChild);details.append(content);article.replaceWith(details)});
 const shell=document.querySelector('.lab-preview');if(shell&&!review.querySelector('.review-pending')){aside.prepend(shell)}
 const intro=aside.querySelector('h3'),label=aside.querySelector('.small-label'),steps=aside.querySelector('ol');if(intro)intro.remove();if(label)label.remove();if(steps){const d=document.createElement('details');d.className='presenter-steps';d.innerHTML='<summary>Kịch bản giới thiệu · 3 bước</summary>';d.append(steps);aside.append(d)}
 review.querySelector('.review-context').textContent='Mở từng tiêu chí để xem chi tiết. Độ dễ hiểu và cảm giác chơi cần xác nhận qua playtest.';
 review.querySelectorAll('[data-review-action]').forEach(b=>b.onclick=()=>{const action=b.dataset.reviewAction;if(action==='try'){document.getElementById('reset').click();view('play');return}view('review');document.querySelector(`[data-case="${action}"]`).click();const pause=document.getElementById('pause');if(pause.getAttribute('aria-label').startsWith('Phát'))pause.click()});
 view(location.hash.slice(1),false);
};
window.compactLayout();
window.addEventListener('load',()=>window.scrollTo({top:0,behavior:'instant'}),{once:true});
})();
