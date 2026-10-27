/* Bộ UI dùng chung cho các trang demo mechanic CatDom.
 * Tách từ selfish-cat.html (file mẫu chuẩn) và bổ sung vật thể của các mechanic mới.
 * UI chỉ vẽ theo events/getState() của logic (docs/logic-contract.md); không tự tính luật.
 * Cần GSAP 3 (window.gsap). */
(function () {
  'use strict';
  const CELL = 56, PAD = 8, OL = '#3b2417';
  const PAL = {
    blue:  {f:'#5b9bff', d:'#2456c7', l:'#a9c9ff', vi:'xanh dương'},
    green: {f:'#63d26b', d:'#23853a', l:'#b5f0b4', vi:'xanh lá'},
    orange:{f:'#ffa53a', d:'#c7620f', l:'#ffd59a', vi:'cam'},
    purple:{f:'#b07cff', d:'#6531c9', l:'#dcc4ff', vi:'tím'},
    pink:  {f:'#ff7fb0', d:'#c22f6a', l:'#ffc2d9', vi:'hồng'},
    yellow:{f:'#ffd84a', d:'#b8900a', l:'#fff0a6', vi:'vàng'}
  };
  const MARK = {pink:'#ff3d8b', blue:'#2f7bff', green:'#1fb24a', orange:'#ff7a00', purple:'#8a3dff', yellow:'#e6b800'};
  /* Người xem bật "giảm chuyển động": demo không tự chạy/lặp, đợi bấm nút; bỏ rung + nháy. */
  const REDUCE = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- art ---------- */
  function catSVG(c, mood = 'happy', o = {}) {
    const p = PAL[c];
    const s = `stroke="${OL}" stroke-linecap="round" stroke-linejoin="round"`;
    let face = '', extra = '';
    const cheeks = (op, col = '#ff6f8f') => `<ellipse cx="28" cy="60" rx="5.5" ry="3.2" fill="${col}" opacity="${op}"/><ellipse cx="72" cy="60" rx="5.5" ry="3.2" fill="${col}" opacity="${op}"/>`;
    const nose = `<path d="M47.5 53.5h5l-2.5 3z" fill="#ff7c96"/>`;
    const vein = `<g transform="translate(76 34)" stroke="#e0263b" stroke-width="3" stroke-linecap="round" fill="none"><path d="M-6-2q4 0 4-4M6-2q-4 0-4-4M-6 2q4 0 4 4M6 2q-4 0-4 4"/></g>`;
    const heart = (x, y, r, col) => `<path d="M${x} ${y + r}c-${r * 1.6}-${r * 1.1}-${r * 1.6}-${r * 2.3}-${r * .55}-${r * 2.3}c${r * .4} 0 ${r * .55}.3 ${r * .55}.6c0-.3.15-.6.55-.6c${r * 1.05} 0 ${r * 1.05} ${r * 1.2}-${r * .55} ${r * 2.3}z" fill="${col}"/>`;
    if (mood === 'happy') {
      face = `<ellipse cx="38" cy="47" rx="4.5" ry="5.5" fill="${OL}"/><ellipse cx="62" cy="47" rx="4.5" ry="5.5" fill="${OL}"/>
        <circle cx="39.6" cy="45" r="1.7" fill="#fff"/><circle cx="63.6" cy="45" r="1.7" fill="#fff"/>
        ${nose}<path d="M44 58q3 4 6 0q3 4 6 0" ${s} stroke-width="2.6" fill="none"/>${cheeks(.55)}`;
    } else if (mood === 'annoyed' || mood === 'mad') {
      face = `<path d="M28 36l15 6M72 36l-15 6" ${s} stroke-width="4"/>
        <path d="M32 46h12a6 6 0 0 1-12 0z" fill="${OL}"/><path d="M56 46h12a6 6 0 0 1-12 0z" fill="${OL}"/>
        <circle cx="35.5" cy="48" r="1.6" fill="#fff"/><circle cx="59.5" cy="48" r="1.6" fill="#fff"/>
        ${nose}<path d="M43 63q7-6 14 0" ${s} stroke-width="2.8" fill="none"/>${cheeks(.45)}${mood === 'mad' ? vein : ''}`;
    } else if (mood === 'angry' || mood === 'scratch') {
      face = `<path d="M27 33l17 9M73 33l-17 9" ${s} stroke-width="4.6"/>
        <circle cx="38" cy="48" r="5.5" fill="#fff" ${s} stroke-width="2.5"/><circle cx="62" cy="48" r="5.5" fill="#fff" ${s} stroke-width="2.5"/>
        <circle cx="39" cy="49" r="2.6" fill="#c4122a"/><circle cx="61" cy="49" r="2.6" fill="#c4122a"/>
        ${nose}<path d="M40 60q10-6 20 0q-10 11-20 0z" fill="${OL}"/><path d="M43.5 60.5l2 4 2-4zM52.5 60.5l2 4 2-4z" fill="#fff"/>
        ${cheeks(.8)}${vein}`;
    } else if (mood === 'smug') {
      face = `<path d="M32 48q6-6 12 0M56 48q6-6 12 0" ${s} stroke-width="3.4" fill="none"/>
        ${nose}<path d="M43 58q3.5 5 7 0q3.5 5 7 0" ${s} stroke-width="2.6" fill="none"/>${cheeks(.75)}
        <path d="M84 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffd23f"/>`;
    } else if (mood === 'sick') {
      face = `<path d="M31 45q7 5 13 0M56 45q7 5 13 0" ${s} stroke-width="3.4" fill="none"/>
        <path d="M31 40l12 2M69 40l-12 2" ${s} stroke-width="2.6"/>
        ${nose}<path d="M42 62q4-4 8 0q4 4 8 0" ${s} stroke-width="2.6" fill="none"/>${cheeks(.7, '#7fcf5a')}
        <path d="M80 36q4 7 0 10q-4-3 0-10z" fill="#7fd0ff" stroke="#2a7db0" stroke-width="1.5"/>`;
    } else if (mood === 'love') {
      face = `${heart(38, 44, 6, '#ff3d6e')}${heart(62, 44, 6, '#ff3d6e')}
        ${nose}<path d="M44 58q3 4 6 0q3 4 6 0" ${s} stroke-width="2.6" fill="none"/>${cheeks(.8)}`;
    } else if (mood === 'sad') {
      face = `<path d="M30 40l13-4M70 40l-13-4" ${s} stroke-width="3"/>
        <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="${OL}"/><ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="${OL}"/>
        <circle cx="39.6" cy="46" r="1.7" fill="#fff"/><circle cx="63.6" cy="46" r="1.7" fill="#fff"/>
        <path d="M33 55q-2 6 1 8q3-2 1-8z" fill="#7fd0ff"/>
        ${nose}<path d="M43 64q7-6 14 0" ${s} stroke-width="2.8" fill="none"/>${cheeks(.45)}`;
    } else if (mood === 'scared') {
      face = `<circle cx="38" cy="47" r="6" fill="#fff" ${s} stroke-width="2.5"/><circle cx="62" cy="47" r="6" fill="#fff" ${s} stroke-width="2.5"/>
        <circle cx="38" cy="48" r="2.4" fill="${OL}"/><circle cx="62" cy="48" r="2.4" fill="${OL}"/>
        ${nose}<ellipse cx="50" cy="63" rx="4" ry="5" fill="${OL}"/>${cheeks(.4)}
        <path d="M82 30q3 6 0 9q-3-3 0-9z" fill="#7fd0ff" stroke="#2a7db0" stroke-width="1.5"/>`;
    }
    if (o.crown) extra += `<path d="M35 18l3-13 7 8 5-11 5 11 7-8 3 13z" fill="#ffd23f" ${s} stroke-width="3"/><circle cx="50" cy="13" r="2.4" fill="#e0263b"/>`;
    if (o.arms === 'claws') {
      extra += `<g ${s} stroke-width="3"><circle cx="11" cy="58" r="9" fill="${p.f}"/><circle cx="89" cy="58" r="9" fill="${p.f}"/></g>
        <path d="M4 50l-4-6M10 48l-1-7M16 50l3-6M84 50l-3-6M90 48l1-7M96 50l4-6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`;
    } else if (o.arms === 'crossed') {
      extra += `<rect x="27" y="70" width="32" height="11" rx="5.5" fill="${p.f}" ${s} stroke-width="3" transform="rotate(-10 43 75)"/>
        <rect x="41" y="70" width="32" height="11" rx="5.5" fill="${p.f}" ${s} stroke-width="3" transform="rotate(10 57 75)"/>`;
    }
    if (o.sick) {
      extra += `<g transform="translate(58 58) rotate(28)"><rect x="0" y="-2.5" width="22" height="5" rx="2.5" fill="#fff" ${s} stroke-width="1.8"/><circle cx="21" cy="0" r="3.6" fill="#e0263b" ${s} stroke-width="1.6"/></g>`;
    }
    const tint = o.sick ? `<rect x="11" y="18" width="78" height="76" rx="32" fill="#9be15d" opacity=".42"/>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M18 40L21 6 46 22z" fill="${p.f}" ${s} stroke-width="4"/><path d="M82 40L79 6 54 22z" fill="${p.f}" ${s} stroke-width="4"/>
      <path d="M24 30l1.5-15 12 8z" fill="#ffb3c1"/><path d="M76 30l-1.5-15-12 8z" fill="#ffb3c1"/>
      <rect x="11" y="18" width="78" height="76" rx="32" fill="${p.f}" ${s} stroke-width="4"/>${tint}
      <ellipse cx="50" cy="77" rx="25" ry="15" fill="#fff" opacity=".5"/>
      <path d="M37 93q4-7 8 0M55 93q4-7 8 0" ${s} stroke-width="3" fill="none"/>
      ${face}${extra}</svg>`;
  }
  const moodFor = n => n >= 3 ? 'annoyed' : n === 2 ? 'mad' : n === 1 ? 'angry' : 'scratch';

  const weedSVG = () => `<svg viewBox="0 0 56 56" aria-hidden="true">
    <rect x="3" y="3" width="50" height="50" rx="10" fill="#2f7a2c" stroke="#174d17" stroke-width="2.5"/>
    <g fill="#5fc24a" stroke="#174d17" stroke-width="1.8" stroke-linejoin="round">
      <path d="M10 46q2-18 14-24q-4 14-14 24z"/><path d="M46 44q-4-20-16-26q6 16 16 26z"/>
      <path d="M22 50q4-22 22-30q-10 14-22 30z"/><path d="M8 20q10-2 16 8q-10 0-16-8z"/>
      <path d="M30 12q12-4 18 6q-12 0-18-6z"/></g>
    <g fill="#ffd84a"><circle cx="18" cy="16" r="2.4"/><circle cx="40" cy="32" r="2.2"/><circle cx="14" cy="36" r="2"/></g></svg>`;

  const pesticideSVG = () => `<svg viewBox="0 0 60 60" aria-hidden="true">
    <rect x="22" y="4" width="12" height="9" rx="2" fill="#ffd84a" stroke="${OL}" stroke-width="2.5"/>
    <path d="M34 7h10l3 3" stroke="${OL}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g fill="#bdf7ff"><circle cx="52" cy="6" r="2"/><circle cx="56" cy="12" r="1.6"/><circle cx="51" cy="14" r="1.4"/></g>
    <rect x="15" y="12" width="26" height="44" rx="9" fill="#33c46a" stroke="${OL}" stroke-width="3"/>
    <rect x="19" y="24" width="18" height="20" rx="4" fill="#fff" stroke="${OL}" stroke-width="2"/>
    <path d="M23 40q2-10 10-12q-1 9-10 12z" fill="#63d26b" stroke="#23853a" stroke-width="1.5"/>
    <path d="M21 26l14 16" stroke="#e0263b" stroke-width="3" stroke-linecap="round"/></svg>`;

  const boxSVG = () => `<svg viewBox="0 0 56 56" aria-hidden="true">
    <rect x="5" y="18" width="46" height="34" rx="6" fill="#c98a4b" stroke="${OL}" stroke-width="3"/>
    <path d="M5 30h46M5 41h46" stroke="#8a5528" stroke-width="2.5"/>
    <rect x="3" y="14" width="50" height="9" rx="4" fill="#e0a865" stroke="${OL}" stroke-width="3"/></svg>`;

  const heartMarkSVG = col => `<svg viewBox="0 0 30 30" aria-hidden="true">
    <path d="M15 26C3 18 2 10 7 7c3.5-2 6.5 0 8 3c1.5-3 4.5-5 8-3c5 3 4 11-8 19z" fill="${col}" stroke="#fff" stroke-width="2.5"/>
    <path d="M3 25L27 5" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M27 5l-6 1M27 5l-1 6" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M3 25l3-1M3 25l1-3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;

  const socketSVG = () => `<svg viewBox="0 0 56 56" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
    <path d="M16 46V22l-2-12 9 7h10l9-7-2 12v24q0 4-4 4H20q-4 0-4-4z" fill="#a8642c" stroke="#ffd36b" stroke-width="3" stroke-linejoin="round"/></svg>`;

  /* ---------- stage ---------- */
  class Stage {
    constructor(el, cols, rows) {
      Object.assign(this, {el, cols, rows});
      el.className = 'stage';
      this.w = cols * CELL + PAD * 2; this.h = rows * CELL + PAD * 2;
      el.style.width = this.w + 'px'; el.style.height = this.h + 'px';
      el.innerHTML = `<div class="board"></div><div class="lyr holes"></div><div class="lyr weeds"></div><div class="lyr zones"></div>
        <div class="lyr cats"></div><svg class="fx" viewBox="0 0 ${this.w} ${this.h}"></svg><div class="flash"></div>
        <svg class="claws" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path pathLength="1" d="M18 12Q48 42 80 86"/><path pathLength="1" d="M30 8Q60 38 90 78"/><path pathLength="1" d="M8 22Q36 54 66 94"/></svg>
        <div class="banner"></div><div class="hand">👆</div>`;
      const board = el.querySelector('.board');
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const t = document.createElement('div'); t.className = 'tile';
        Object.assign(t.style, {left: PAD + x * CELL + 'px', top: PAD + y * CELL + 'px'});
        board.appendChild(t);
      }
      this.zonesL = el.querySelector('.zones'); this.holesL = el.querySelector('.holes');
      this.weedsL = el.querySelector('.weeds'); this.catsL = el.querySelector('.cats'); this.fx = el.querySelector('.fx');
      this.banner = el.querySelector('.banner'); this.hand = el.querySelector('.hand');
      this.flash = el.querySelector('.flash'); this.claws = el.querySelectorAll('.claws path');
      el.parentNode.style.maxWidth = this.w + 'px';
      const fit = () => {
        const sc = Math.min(1, el.parentNode.clientWidth / this.w);
        gsap.set(el, {scale: sc});
        el.parentNode.style.height = this.h * sc + 'px';
      };
      if (el._ro) el._ro.disconnect();
      el._ro = new ResizeObserver(fit);
      el._ro.observe(el.parentNode);
      fit();
      this.reset();
    }
    px(x, y) { return {left: PAD + x * CELL, top: PAD + y * CELL}; }
    center(x, y) { return {x: PAD + x * CELL + CELL / 2, y: PAD + y * CELL + CELL / 2}; }
    reset() {
      [this.zonesL, this.holesL, this.weedsL, this.catsL, this.fx].forEach(l => l.innerHTML = '');
      this.cats = {}; this.holes = {}; this.weeds = {}; this.items = {}; this.boxes = {}; this.zone = null;
      gsap.set(this.banner, {opacity: 0}); gsap.set(this.flash, {opacity: 0, background: '#e0263b'});
      gsap.set(this.claws, {strokeDashoffset: 1, opacity: 0}); gsap.set(this.hand, {opacity: 0, scale: 1});
      gsap.set(this.el, {x: 0});
      this.el.querySelector('.nologic')?.remove();
    }
    noLogic(file) {
      const d = document.createElement('div'); d.className = 'nologic';
      d.innerHTML = `Chưa có logic<br><code>${file}</code><br><small>UI đã dựng sẵn, chờ worker viết logic.</small>`;
      this.el.appendChild(d);
    }
    addCat(id, c, x, y, o = {}) {
      const d = document.createElement('div');
      d.className = 'cat' + (o.cls ? ' ' + o.cls : '');
      Object.assign(d.style, {left: this.px(x, y).left + 'px', top: this.px(x, y).top + 'px'});
      d.innerHTML = `<div class="body"></div><div class="bubble"></div>`;
      if (o.onClick) { d.classList.add('clickable'); d.addEventListener('click', () => o.onClick(id)); }
      this.catsL.appendChild(d);
      this.cats[id] = {el: d, c, x, y, o: {mood: 'happy', ...o}};
      this.setCat(id, {});
      return d;
    }
    setCat(id, o) {
      const cat = this.cats[id]; if (!cat) return;
      Object.assign(cat.o, o);
      cat.el.querySelector('.body').innerHTML = catSVG(cat.c, cat.o.mood, cat.o);
      cat.el.classList.toggle('angry', !!cat.o.shake);
      cat.el.classList.toggle('huff', !!cat.o.huff);
    }
    setBadge(id, text, cls = '') {
      const cat = this.cats[id]; if (!cat) return null;
      let b = cat.el.querySelector('.badge');
      if (text === null) { b?.remove(); return null; }
      if (!b) { b = document.createElement('div'); cat.el.appendChild(b); }
      b.textContent = text; b.className = 'badge' + (cls ? ' ' + cls : '');
      gsap.fromTo(b, {scale: 1.7}, {scale: 1, duration: .35, ease: 'back.out(3)'});
      return b;
    }
    setMark(id, markColor) {
      const cat = this.cats[id]; if (!cat) return;
      let m = cat.el.querySelector('.mark');
      if (!markColor) { m?.remove(); return; }
      if (!m) { m = document.createElement('div'); m.className = 'mark'; cat.el.appendChild(m); }
      m.innerHTML = heartMarkSVG(MARK[markColor] || markColor);
    }
    addHole(id, c, x, y, w = 1, h = 1, o = {}) {
      const d = document.createElement('div');
      d.className = 'hole' + (o.cells?.length ? ' has-cells' : '');
      Object.assign(d.style, {left: this.px(x, y).left + 3 + 'px', top: this.px(x, y).top + 3 + 'px',
        width: w * CELL - 6 + 'px', height: h * CELL - 6 + 'px'});
      if (o.cells?.length) {
        d.style.outline = 'none';
        const cells = o.cells;
        cells.forEach(([cx, cy]) => {
          const hasLeft = cells.some(([x, y]) => x === cx - 1 && y === cy);
          const hasRight = cells.some(([x, y]) => x === cx + 1 && y === cy);
          const hasTop = cells.some(([x, y]) => x === cx && y === cy - 1);
          const hasBottom = cells.some(([x, y]) => x === cx && y === cy + 1);
          const cellEl = document.createElement('div');
          cellEl.className = 'hole-cell';
          cellEl.dataset.dx = cx;
          cellEl.dataset.dy = cy;
          // Cạnh NGOÀI của khối (phía bên kia không có ô cùng hố) — viền tối chỉ vẽ ở đây.
          cellEl.dataset.edges = [!hasTop && 't', !hasRight && 'r', !hasBottom && 'b', !hasLeft && 'l']
            .filter(Boolean).join(' ');
          cellEl.style.boxSizing = 'border-box';
          const left = cx * CELL - (hasLeft ? 3 : 0);
          const top = cy * CELL - (hasTop ? 3 : 0);
          const width = CELL - 6 + (hasLeft ? 3 : 0) + (hasRight ? 3 : 0);
          const height = CELL - 6 + (hasTop ? 3 : 0) + (hasBottom ? 3 : 0);
          const rTL = !hasTop && !hasLeft ? 11 : 0;
          const rTR = !hasTop && !hasRight ? 11 : 0;
          const rBR = !hasBottom && !hasRight ? 11 : 0;
          const rBL = !hasBottom && !hasLeft ? 11 : 0;
          Object.assign(cellEl.style, {
            left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px',
            borderRadius: `${rTL}px ${rTR}px ${rBR}px ${rBL}px`
          });
          d.appendChild(cellEl);
        });
      }
      this.holesL.appendChild(d);
      this.holes[id] = {el: d, c, x, y, w, h, cells: o.cells, off: o.off || [0, 0]};
      this.styleHole(id, c, !!o.special);
      return d;
    }
    styleHole(id, c, special) {
      const hole = this.holes[id], p = PAL[c];
      hole.c = c; hole.special = special;
      if (hole.cells?.length) {
        hole.el.style.background = 'none';
        hole.el.style.boxShadow = 'none';
        hole.el.style.outline = 'none';
        const socket = hole.el.querySelector('.hole-socket');
        if (special) {
          hole.el.querySelectorAll('.hole-cell').forEach(cellEl => {
            cellEl.style.background = 'radial-gradient(circle at 50% 40%, #5a3413 0%, #3a1f08 70%)';
            // Viền vàng chỉ ở cạnh NGOÀI (3px), không dùng inset để không vẽ vạch giữa các ô cùng hố.
            setCellEdges(cellEl, '#ffd36b', 3);
            cellEl.style.boxShadow = '0 0 14px 2px rgba(255,211,107,.7)';
          });
          if (!socket) {
            const firstCell = hole.el.querySelector('.hole-cell') || hole.el;
            const sockEl = document.createElement('div');
            sockEl.className = 'hole-socket';
            sockEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1';
            sockEl.innerHTML = socketSVG();
            firstCell.appendChild(sockEl);
          }
        } else {
          socket?.remove();
          hole.el.querySelectorAll('.hole-cell').forEach(cellEl => {
            cellEl.style.background = p.f;
            setCellEdges(cellEl, p.d);
            cellEl.style.boxShadow = 'none';
          });
        }
      } else {
        hole.el.innerHTML = special ? socketSVG() : '';
        Object.assign(hole.el.style, special
          ? {background: 'radial-gradient(circle at 50% 40%, #5a3413 0%, #3a1f08 70%)', boxShadow: '0 0 0 2px #7a4a12, inset 0 0 0 3px #ffd36b, 0 0 14px 2px rgba(255,211,107,.7)'}
          : {background: p.f, boxShadow: `0 0 0 2px ${p.d}, inset 0 0 0 3px ${p.l}, inset 0 0 14px 7px ${p.d}`});
      }
    }
    moveHoleTl(id, x, y, dur = .45) {
      const at = this.px(x, y);
      return gsap.timeline().to(this.holes[id].el, {left: at.left + 3, top: at.top + 3, duration: dur, ease: 'power2.inOut'});
    }
    addZone(x, y, w, h, label) {
      const d = document.createElement('div'); d.className = 'zone';
      const at = this.px(x, y);
      Object.assign(d.style, {left: at.left + 'px', top: at.top + 'px', width: w * CELL + 'px', height: h * CELL + 'px'});
      d.innerHTML = `<span class="zone-label"></span>`;
      this.zonesL.appendChild(d); this.zone = d;
      this.zoneLabel(label);
      return d;
    }
    zoneLabel(text, cls) {
      if (!this.zone) return;
      this.zone.querySelector('.zone-label').textContent = text;
      if (cls !== undefined) this.zone.className = 'zone' + (cls ? ' ' + cls : '');
    }
    setWeed(x, y, on) {
      const k = x + '_' + y;
      if (!on) { const w = this.weeds[k]; delete this.weeds[k]; return w || null; }
      if (this.weeds[k]) return this.weeds[k];
      const d = document.createElement('div'); d.className = 'weed';
      Object.assign(d.style, {left: this.px(x, y).left + 'px', top: this.px(x, y).top + 'px'});
      d.innerHTML = weedSVG();
      this.weedsL.appendChild(d); this.weeds[k] = d;
      return d;
    }
    addItem(id, x, y, onClick) {
      const d = document.createElement('div'); d.className = 'item';
      Object.assign(d.style, {left: this.px(x, y).left + 'px', top: this.px(x, y).top + 'px'});
      d.innerHTML = `<div class="body">${pesticideSVG()}</div>`;
      if (onClick) { d.classList.add('clickable'); d.addEventListener('click', onClick); }
      this.catsL.appendChild(d);
      this.items[id] = {el: d, x, y};
      return d;
    }
    addBox(id, x, y, front, count, onClick) {
      const d = document.createElement('div'); d.className = 'box';
      Object.assign(d.style, {left: this.px(x, y).left + 'px', top: this.px(x, y).top + 'px'});
      d.innerHTML = `${boxSVG()}<div class="cat"><div class="body"></div></div><span class="count"></span><span class="shield" title="Miễn nhiễm">🛡️</span>`;
      if (onClick) { d.classList.add('clickable'); d.addEventListener('click', () => onClick(id)); }
      this.catsL.appendChild(d);
      this.boxes[id] = {el: d, x, y};
      this.setBox(id, front, count);
      return d;
    }
    setBox(id, front, count) {
      const box = this.boxes[id], cat = box.el.querySelector('.cat');
      cat.style.display = front ? '' : 'none';
      if (front) cat.querySelector('.body').innerHTML = catSVG(front, 'happy');
      box.el.querySelector('.count').textContent = count > 0 ? '×' + count : '';
    }
    line(a, b, color, dashed = true) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Object.entries({x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round',
        'stroke-dasharray': dashed ? '2 7' : 'none', opacity: .9}).forEach(([k, v]) => l.setAttribute(k, v));
      this.fx.appendChild(l);
      return l;
    }
    dot(at, r, color) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      Object.entries({cx: at.x, cy: at.y, r, fill: color}).forEach(([k, v]) => c.setAttribute(k, v));
      c.style.filter = `drop-shadow(0 0 6px ${color})`;
      this.fx.appendChild(c);
      return c;
    }
    say(id, text, dur = 1.4) {
      const cat = this.cats[id], b = cat?.el.querySelector('.bubble'); if (!b) return;
      b.textContent = text;
      b.classList.toggle('at-left', cat.x === 0);
      b.classList.toggle('at-right', cat.x === this.cols - 1);
      gsap.killTweensOf(b);
      gsap.timeline().fromTo(b, {opacity: 0, y: 6}, {opacity: 1, y: 0, duration: .2}).to(b, {opacity: 0, duration: .2}, '+=' + dur);
    }
    eatTl(ids) {
      const tl = gsap.timeline();
      ids.forEach((id, i) => {
        const el = this.cats[id]?.el; if (!el) return;
        tl.to(el, {y: -10, duration: .14, ease: 'power1.out'}, i * .1)
          .to(el, {y: 10, scale: .25, opacity: 0, duration: .3, ease: 'power2.in'}, i * .1 + .14);
      });
      return tl;
    }
    shakeTl(n = 7) {
      if (REDUCE) return gsap.timeline();
      return gsap.timeline().fromTo(this.el, {x: -8}, {x: 8, duration: .05, repeat: n, yoyo: true, clearProps: 'x'});
    }
    flashTl(color = '#e0263b') {
      if (REDUCE) return gsap.timeline();
      return gsap.timeline().set(this.flash, {background: color}).to(this.flash, {opacity: .35, duration: .06, yoyo: true, repeat: 3});
    }
    clawsTl() {
      return gsap.timeline().set(this.claws, {opacity: 1})
        .to(this.claws, {strokeDashoffset: 0, duration: .16, stagger: .09, ease: 'power2.in'});
    }
    showBanner(text, kind) {
      this.banner.textContent = text; this.banner.className = 'banner ' + kind;
      gsap.fromTo(this.banner, {opacity: 0, scale: .4, xPercent: -50, yPercent: -50, left: '50%', top: '50%', x: 0, y: 0},
        {opacity: 1, scale: 1, duration: .45, ease: 'back.out(2.2)'});
    }
    /* Bàn tay kéo hole từ ô (fx,fy) tới ô (tx,ty). */
    dragTl(holeId, fx, fy, tx, ty) {
      const hole = this.holes[holeId];
      const o = (hole && hole.off) || [0, 0];
      const handAt = (x, y) => ({left: this.px(x + o[0], y + o[1]).left + 18, top: this.px(x + o[0], y + o[1]).top + 22});
      const at = this.px(tx + o[0], ty + o[1]);
      return gsap.timeline()
        .set(this.hand, handAt(fx, fy)).to(this.hand, {opacity: 1, duration: .25}).to(this.hand, {scale: .82, duration: .12})
        .to(hole.el, {left: at.left + 3, top: at.top + 3, duration: .55, ease: 'power2.inOut'})
        .to(this.hand, {...handAt(tx, ty), duration: .55, ease: 'power2.inOut'}, '<')
        .to(this.hand, {scale: 1, opacity: 0, duration: .2});
    }
    /* Kéo hole theo chuỗi ô path kèm bàn tay. */
    dragPathTl(holeId, fromX, fromY, path) {
      const hole = this.holes[holeId];
      const o = (hole && hole.off) || [0, 0];
      const handAt = (x, y) => ({left: this.px(x + o[0], y + o[1]).left + 18, top: this.px(x + o[0], y + o[1]).top + 22});
      const dur = Math.min(.35, 1.1 / path.length);
      const tl = gsap.timeline()
        .set(this.hand, handAt(fromX, fromY)).to(this.hand, {opacity: 1, duration: .2}).to(this.hand, {scale: .82, duration: .1});
      for (const [tx, ty] of path) {
        const at = this.px(tx + o[0], ty + o[1]);
        tl.to(hole.el, {left: at.left + 3, top: at.top + 3, duration: dur, ease: 'power2.inOut'})
          .to(this.hand, {...handAt(tx, ty), duration: dur, ease: 'power2.inOut'}, '<');
      }
      return tl.to(this.hand, {scale: 1, opacity: 0, duration: .15});
    }
  }

  /* ---------- helpers ---------- */
  const loadLogic = name => (window.CatDomLogic && window.CatDomLogic[name]) || null;
  function rectOf(cells) {
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    return {x, y, w: Math.max(...xs) - x + 1, h: Math.max(...ys) - y + 1};
  }
  /* Viền tối cho một ô của hố nhiều ô: chỉ vẽ ở cạnh NGOÀI (data-edges),
   * cạnh giáp ô cùng hố thì bỏ hẳn viền để khối trông liền một màu. */
  function setCellEdges(cellEl, color, thickness = 2) {
    const edges = (cellEl.dataset.edges || '').split(' ');
    const line = `${thickness}px solid ${color}`;
    cellEl.style.borderTop = edges.includes('t') ? line : 'none';
    cellEl.style.borderRight = edges.includes('r') ? line : 'none';
    cellEl.style.borderBottom = edges.includes('b') ? line : 'none';
    cellEl.style.borderLeft = edges.includes('l') ? line : 'none';
  }
  function caption(el, text) {
    el.innerHTML = text;
    gsap.fromTo(el, {opacity: 0, y: 4}, {opacity: 1, y: 0, duration: .25});
  }
  /* Demo tự lặp kiểu GIF: bình thường gọi loop() ngay.
   * Khi bật giảm chuyển động: loop nhận cờ once → KHÔNG hẹn vòng lặp kế, timeline dựng ra bị giữ ở frame 0
   * (board + intro đứng yên sau lớp nút), người xem bấm nút mới chạy đúng một lần. */
  function runDemo(stageEl, loop) {
    if (!REDUCE) { loop(false); return; }
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'demo-play'; btn.textContent = '▶ Xem demo';
    let tl = null, shown = false;
    /* Lần xem lại: nút xuống đáy board (class `again`) để không đè lên banner thắng/thua. */
    const finished = () => { shown = true; btn.textContent = '↻ Xem lại'; btn.classList.add('again'); btn.hidden = false; };
    const start = () => {
      btn.hidden = true;
      if (shown) { shown = false; arm(loop(true)); } else tl.play();
    };
    /* Gắn lại onComplete cho mỗi timeline mới để nút hiện lại sau khi xem xong. */
    const arm = t => { t.eventCallback('onComplete', finished); tl = t; return t; };
    btn.addEventListener('click', start);
    stageEl.appendChild(btn);
    arm(loop(true));
    /* Tua tới 0,3 s KHÔNG chặn sự kiện để callback caption intro ở 0 s kịp chạy;
     * board đứng yên ở frame đầu, bấm nút thì play() tiếp từ đây. */
    tl.pause();
    tl.seek(0.3, false);
  }
  function setHoleTag(st, hid, hs) {
    const el = st.holes[hid]?.el;
    if (!el) return;
    el.querySelector('.hole-tag')?.remove();
    if (hs.remaining <= 0) return;
    const [dx0, dy0] = (hs.shape && hs.shape[0]) || [0, 0];
    const off = hs.off || [0, 0];
    const cx0 = dx0 - off[0], cy0 = dy0 - off[1];
    const target = el.querySelector(`.hole-cell[data-dx="${cx0}"][data-dy="${cy0}"]`) || el.querySelector('.hole-cell') || el;
    target.insertAdjacentHTML('beforeend', `<span class="hole-tag">${hs.remaining}</span>`);
  }

  /* Demo tự lặp kiểu GIF, chạy logic thật theo kịch bản.
   * cfg: { el, cap, name, file, level, steps, build(st, game), cellOf(game, id) -> [x,y],
   *        on: { <eventType>: (st, ev, tl, ctx) => void }, intro(st, tl, cap), holes? }
   * step: { eat:[x,y], from:[x,y], say } | { pick:true, hole:'<id>', path:[[x,y],...], say } */
  function demo(cfg) {
    const logic = loadLogic(cfg.name);
    const st = new Stage(cfg.el, cfg.level.cols, cfg.level.rows);
    if (!logic) { cfg.build(st, null); st.noLogic(cfg.file); caption(cfg.cap, 'Chưa có logic để chạy demo.'); return; }
    const loop = (once) => {
      st.reset();
      const game = logic.createGame(cfg.level);
      const ctx = {game, cap: t => caption(cfg.cap, t), hole: null};
      cfg.build(st, game);
      const holeState = {};
      if (cfg.holes) {
        for (const h of cfg.holes) {
          const r = rectOf(h.shape.map(([dx, dy]) => [h.x + dx, h.y + dy]));
          const off = [r.x - h.x, r.y - h.y];
          const cells = h.shape.map(([dx, dy]) => [h.x + dx - r.x, h.y + dy - r.y]);
          const remaining = h.remaining || h.shape.length;
          st.addHole(h.id, h.color, r.x, r.y, r.w, r.h, { cells, special: !!h.special, off });
          st.holes[h.id].off = off;
          holeState[h.id] = { id: h.id, color: h.color, x: h.x, y: h.y, shape: h.shape, off, remaining, special: !!h.special };
          setHoleTag(st, h.id, holeState[h.id]);
        }
      }
      const tl = gsap.timeline({onComplete: () => { if (!once) gsap.delayedCall(2.4, () => loop(false)); }});
      if (typeof cfg.intro === 'function') cfg.intro(st, tl, ctx);
      else if (typeof cfg.intro === 'string') tl.call(() => ctx.cap(cfg.intro)).to({}, {duration: 1.8});
      else tl.to({}, {duration: 1});
      let k = 0, finished = false;
      for (const step of cfg.steps) {
        let res;
        if (cfg.holes) {
          const hid = step.hole;
          const hs = holeState[hid];
          tl.call(() => ctx.cap(step.say || ''));
          if (step.path && step.path.length) {
            tl.add(st.dragPathTl(hid, hs.x, hs.y, step.path));
            const last = step.path[step.path.length - 1];
            hs.x = last[0]; hs.y = last[1];
          }
          if (step.eat) {
            res = game.eat(...step.eat);
            ctx.hole = hid;
          } else if (step.pick) {
            res = game.pickPesticide();
            ctx.hole = hid;
          }
          let ended = false;
          for (const ev of res.events) {
            (cfg.on[ev.type] || defaultOn[ev.type] || (() => {}))(st, ev, tl, ctx);
            if (ev.type === 'lose' || ev.type === 'win') ended = true;
          }
          if (step.eat) {
            const eatEv = res.events.find(e => e.type === 'eat');
            const eaten = eatEv ? eatEv.ids.length : 0;
            hs.remaining -= eaten;
            const rem = hs.remaining;
            tl.call(() => {
              setHoleTag(st, hid, { ...hs, remaining: rem });
              if (rem <= 0) {
                const h = st.holes[hid];
                if (h) gsap.to(h.el, {scale: 0, opacity: 0, duration: .3, ease: 'back.in(2)'});
              }
            });
          }
          tl.to({}, {duration: .6});
          if (ended) { finished = true; tl.to({}, {duration: 1.2}); break; }
        } else {
          if (step.eat) {
            const ids = game.groupAt(...step.eat);
            if (!ids.length) throw new Error(`Kịch bản demo sai: ô ${step.eat} không có nhóm ăn được`);
            const r = rectOf(ids.map(id => cfg.cellOf(game, id)));
            const from = step.from || [r.x, r.y + 1];
            const hid = 'h' + (k++);
            const hole = st.addHole(hid, cfg.colorOf(game, ids[0]), from[0], from[1], r.w, r.h);
            gsap.set(hole, {opacity: 0});
            tl.call(() => ctx.cap(step.say || ''))
              .fromTo(hole, {opacity: 0, scale: 0}, {opacity: 1, scale: 1, duration: .25, immediateRender: false})
              .add(st.dragTl(hid, from[0], from[1], r.x, r.y));
            res = game.eat(...step.eat);
            ctx.hole = hid;
          } else if (step.pick) {
            tl.call(() => ctx.cap(step.say || ''));
            for (let i = 1; i < step.path.length; i++) tl.add(st.dragTl(step.hole, ...step.path[i - 1], ...step.path[i]));
            res = game.pickPesticide();
            ctx.hole = step.hole;
          }
          let ended = false;
          for (const ev of res.events) {
            (cfg.on[ev.type] || defaultOn[ev.type] || (() => {}))(st, ev, tl, ctx);
            if (ev.type === 'lose' || ev.type === 'win') ended = true;
          }
          if (step.eat) {
            const used = ctx.hole;
            tl.call(() => { const h = st.holes[used]; if (h) gsap.to(h.el, {scale: 0, opacity: 0, duration: .3, ease: 'back.in(2)'}); });
          }
          tl.to({}, {duration: .6});
          if (ended) { finished = true; tl.to({}, {duration: 1.2}); break; }
        }
      }
      if (!finished && cfg.outro) { cfg.outro(st, tl, ctx); tl.to({}, {duration: 1.2}); }
      return tl;
    };
    runDemo(cfg.el, loop);
  }
  const defaultOn = {
    eat: (st, ev, tl) => tl.add(st.eatTl(ev.ids)),
    win: (st, ev, tl) => tl.call(() => st.showBanner('THẮNG ✓', 'ok')),
    lose: (st, ev, tl) => tl.call(() => st.showBanner('THUA ✗', 'bad'))
  };

  /* Playground: bấm mèo → hole cùng màu nuốt cả nhóm theo logic. */
  function playground(cfg) {
    const logic = loadLogic(cfg.name);
    const st = new Stage(cfg.el, cfg.level().cols, cfg.level().rows);
    const api = {st, game: null, busy: false};
    const logEl = cfg.logEl;
    api.log = (html, cls = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; logEl.prepend(d); };
    api.reset = () => {
      st.reset(); logEl.innerHTML = ''; api.busy = false;
      if (!logic) { cfg.build(st, null, api); st.noLogic(cfg.file); cfg.update(api); return; }
      const level = cfg.level();
      api.game = logic.createGame(JSON.parse(JSON.stringify(level)));
      cfg.build(st, api.game, cfg.holes ? undefined : api);
      if (cfg.holes) setupHoles(level);
      cfg.update(api);
      api.log(cfg.startText(api.game));
      if (cfg.holes) api.log('Bấm chọn một hố rồi kéo, hoặc dùng phím mũi tên. Hố trùm đủ nhóm mèo cùng màu thì nuốt.');
    };
    api.run = (res, holeCells, color) => {
      if (!res.ok) { api.busy = false; return; }
      const tl = gsap.timeline({onComplete: () => { api.busy = false; cfg.update(api); }});
      let holes = [];
      if (holeCells) {
        holes = holeCells.map(([x, y], i) => st.addHole('p' + Date.now() + i, color, x, y));
        tl.from(holes, {scale: 0, duration: .25, ease: 'back.out(2)', stagger: .04});
      }
      const ctx = {game: api.game, log: api.log, playground: true, hole: null};
      for (const ev of res.events) (cfg.on[ev.type] || defaultOn[ev.type] || (() => {}))(st, ev, tl, ctx);
      if (holes.length) tl.to(holes, {scale: 0, opacity: 0, duration: .25, ease: 'back.in(2)'}, '>-0.1');
    };
    api.eat = (x, y) => {
      if (api.busy || !api.game) return;
      const ids = api.game.groupAt(x, y);
      if (!ids.length) return;
      const cells = ids.map(id => cfg.cellOf(api.game, id));
      const color = cfg.colorOf(api.game, ids[0]);
      api.busy = true;
      api.run(api.game.eat(x, y), cells, color);
    };
    /* ---------- chế độ hố: hố đặt sẵn trên bàn, người chơi chọn hố rồi kéo/phím mũi tên ---------- */
    const HP_REJECT = {'out-of-board': 'ra ngoài bàn', 'weed-area': 'không vào được khu vực cây dại', hole: 'vướng hố khác',
      box: 'vướng box khác màu', pesticide: 'chỉ Special Hole mới nhặt được thuốc sâu', cat: 'vướng mèo khác màu',
      'not-playing': 'màn đã kết thúc, bấm Chơi lại', 'bad-hole': 'hố đã xong', 'bad-move': 'nước đi không hợp lệ'};
    const holeLabel = h => h.special && !h.picked ? 'Special Hole' : 'Hố ' + PAL[h.color].vi;
    function setupHoles(level) {
      for (const h of cfg.holes) {
        const r = rectOf(h.shape.map(([dx, dy]) => [h.x + dx, h.y + dy]));
        const off = [r.x - h.x, r.y - h.y];
        const cells = h.shape.map(([dx, dy]) => [h.x + dx - r.x, h.y + dy - r.y]);
        st.addHole(h.id, h.color, r.x, r.y, r.w, r.h, {cells, special: !!h.special, off});
        st.holes[h.id].off = off;
        setHoleTag(st, h.id, {shape: h.shape, off, remaining: h.shape.length});
      }
      api.hp = window.CatDomHolePlay.create(api.game, {cols: level.cols, rows: level.rows, holes: cfg.holes, weedArea: level.weedArea, pesticide: level.pesticide});
      api.sel = null;
      api.select(cfg.holes[0].id);
    }
    api.select = id => {
      const h = api.hp && api.hp.holes().find(o => o.id === id && !o.done);
      if (!h) return;
      api.sel = id;
      Object.entries(st.holes).forEach(([k, o]) => o.el.classList.toggle('sel', k === id));
    };
    api.move = (dx, dy) => {
      if (api.busy || !api.hp || !api.sel) return;
      const id = api.sel, before = api.hp.holes().find(o => o.id === id), res = api.hp.move(id, dx, dy), el = st.holes[id].el;
      if (!res.ok) {
        gsap.fromTo(el, {x: -5}, {x: 5, duration: .05, repeat: 5, yoyo: true, clearProps: 'x'});
        api.log(`${holeLabel(before)} · ${HP_REJECT[res.reason] || res.reason}`);
        return;
      }
      api.busy = true;
      const off = st.holes[id].off || [0, 0];
      const ctx = {game: api.game, log: api.log, playground: true, hole: id};
      const tl = gsap.timeline({onComplete: () => {
        api.busy = false;
        const left = api.hp.holes().filter(o => !o.done);
        if (!left.some(o => o.id === api.sel) && left.length) api.select(left[0].id);
        cfg.update(api);
      }});
      for (const ev of res.events) {
        if (ev.type === 'move') {
          const at = st.px(ev.x + off[0], ev.y + off[1]);
          tl.to(el, {left: at.left + 3, top: at.top + 3, duration: .14, ease: 'power2.out'});
        } else if (ev.type === 'holeEat') {
          const rem = ev.remaining;
          tl.call(() => setHoleTag(st, id, {shape: before.shape, off, remaining: rem}));
        } else if (ev.type === 'holeDone') {
          tl.to(el, {scale: 0, opacity: 0, duration: .3, ease: 'back.in(2)'});
        } else (cfg.on[ev.type] || defaultOn[ev.type] || (() => {}))(st, ev, tl, ctx);
      }
    };
    if (cfg.holes) {
      const el = cfg.el, scale = () => el.getBoundingClientRect().width / st.w;
      el.tabIndex = 0;
      el.setAttribute('role', 'application');
      el.setAttribute('aria-label', 'Board chơi thử: bấm chọn hố, phím 1–9 chọn hố, phím mũi tên để đi');
      el.style.touchAction = 'none';
      let drag = null;
      el.addEventListener('pointerdown', e => {
        if (!api.hp) return;
        const r = el.getBoundingClientRect(), sc = scale();
        const x = Math.floor(((e.clientX - r.left) / sc - PAD) / CELL), y = Math.floor(((e.clientY - r.top) / sc - PAD) / CELL);
        const id = api.hp.holeAt(x, y);
        if (!id) return;
        api.select(id); drag = {x: e.clientX, y: e.clientY};
        el.setPointerCapture(e.pointerId); el.focus({preventScroll: true});
      });
      el.addEventListener('pointermove', e => {
        if (!drag || api.busy) return;
        const sc = scale(), dx = (e.clientX - drag.x) / sc, dy = (e.clientY - drag.y) / sc;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < CELL * .6) return;
        const hor = Math.abs(dx) > Math.abs(dy);
        drag = {x: e.clientX, y: e.clientY};
        api.move(hor ? Math.sign(dx) : 0, hor ? 0 : Math.sign(dy));
      });
      el.addEventListener('pointerup', () => { drag = null; });
      el.addEventListener('pointercancel', () => { drag = null; });
      el.addEventListener('keydown', e => {
        const d = {ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0]}[e.key];
        if (d) { e.preventDefault(); api.move(...d); }
        else if (/^[1-9]$/.test(e.key) && api.hp) { const left = api.hp.holes().filter(o => !o.done); if (left[+e.key - 1]) api.select(left[+e.key - 1].id); }
      });
    }
    api.reset();
    return api;
  }

  /* ---------- board hố di chuyển (mechanic 05–10, docs/logic-contract.md mục 5) ----------
   * Vẽ hoàn toàn theo getState() + events của logic; board/chuỗi nước lấy từ boards/lab-fixtures.js. */
  const DIR_ARROW = {'0,-1': '↑', '0,1': '↓', '-1,0': '←', '1,0': '→'};
  const AXIS_MARK = {FREE: '○', HORIZONTAL: '↔', VERTICAL: '↕'};
  const AXIS_VI = {FREE: 'TỰ DO', HORIZONTAL: 'NGANG', VERTICAL: 'DỌC'};
  const LOSE_VI = {stuck: 'STUCK, không còn cách hoàn thành', stripe: 'xung đột sọc', alarm: 'báo động bật khi có hố trong vùng', electric: 'điện bật trúng mèo/hố'};
  const LOSE_BANNER = {stuck: 'STUCK ✗', stripe: 'XUNG ĐỘT ✗', alarm: 'BÁO ĐỘNG ✗', electric: 'ĐIỆN GIẬT ✗'};
  const REJECT_VI = {blocked: 'đường bị chặn', 'axis-locked': 'hố đang khoá trục, hướng này bị chặn (không thua)',
    'electric-barrier': 'rào điện đang bật, không vào được đoạn nối', 'bad-move': 'hố đã xong hoặc nước không hợp lệ', 'not-playing': 'màn đã kết thúc, bấm Làm lại'};

  function holeName(s, i) {
    const h = s.holes[i], same = s.holes.filter(o => o.color === h.color);
    return 'Hố ' + PAL[h.color].vi + (same.length > 1 ? ' ' + (same.indexOf(h) + 1) : '');
  }
  function moveEventText(ev, s) {
    switch (ev.type) {
      case 'eat': return `${holeName(s, ev.hole)} thu ${ev.ids.length} mèo`;
      case 'holeDone': return `${holeName(s, ev.hole)} hoàn thành ✓`;
      case 'crack': return ev.durability ? `sàn nứt, độ bền còn ${ev.durability}` : 'sàn sụp!';
      case 'axis': return `nhận strict ${AXIS_VI[ev.axis]} ${AXIS_MARK[ev.axis]}`;
      case 'alarmOn': return '🚨 báo động BẬT';
      case 'alarmOff': return '✅ báo động TẮT';
      case 'electricOn': return '⚡ điện BẬT';
      case 'electricOff': return 'điện TẮT, đường mở';
      case 'magnet': return `🧲 nam châm hút ${ev.ids.length} mèo`;
      case 'teleport': return 'mèo cùng màu dịch 1 ô';
      case 'teleportBlocked': return 'mèo bị chặn đứng yên';
      case 'lose': return 'THUA: ' + LOSE_VI[ev.reason];
      case 'win': return 'THẮNG: mọi hố hoàn thành';
    }
    return '';
  }
  const describe = (name, events, s) => [name, ...new Set(events.map(e => moveEventText(e, s)).filter(Boolean))].join(' · ');

  class MoveView {
    constructor(el, level) { this.st = new Stage(el, level.cols, level.rows); }
    build(s) {
      const st = this.st;
      st.reset(); this.s = s; this.off = [];
      this.overlay(s);
      s.holes.forEach((h, i) => {
        const r = rectOf(h.shape.map(([dx, dy]) => [h.x + dx, h.y + dy]));
        this.off[i] = [r.x - h.x, r.y - h.y];
        const cells = h.shape.map(([dx, dy]) => [h.x + dx - r.x, h.y + dy - r.y]);
        st.addHole('h' + i, h.color, r.x, r.y, r.w, r.h, { cells });
        if (h.done) gsap.set(st.holes['h' + i].el, {scale: 0, opacity: 0});
        this.label(i, h);
      });
      s.cats.filter(c => c.alive).forEach(c => {
        st.addCat(c.id, c.color, c.x, c.y);
        const mark = c.magnet ? '🧲' : c.arrow ? DIR_ARROW[c.arrow.join(',')] : c.kind === 'STRIPE_H' ? '↔' : c.kind === 'STRIPE_V' ? '↕' : null;
        if (mark) st.setBadge(c.id, mark, 'mv');
      });
    }
    label(i, h) {
      const el = this.st.holes['h' + i].el;
      el.querySelector('.hole-tag')?.remove();
      const off = (this.off && this.off[i]) || [0, 0];
      const [dx0, dy0] = (h.shape && h.shape[0]) || [0, 0];
      const cx0 = dx0 - off[0], cy0 = dy0 - off[1];
      const target = el.querySelector(`.hole-cell[data-dx="${cx0}"][data-dy="${cy0}"]`) || el.querySelector('.hole-cell') || el;
      target.insertAdjacentHTML('beforeend', `<span class="hole-tag">${h.remaining}${h.axis ? ' ' + AXIS_MARK[h.axis] : ''}</span>`);
    }
    overlay(s) {
      const st = this.st, L = st.zonesL;
      L.innerHTML = '';
      const cell = (x, y, cls, text = '') => {
        const d = document.createElement('div'); d.className = 'mv-cell ' + cls; d.textContent = text;
        Object.assign(d.style, {left: st.px(x, y).left + 'px', top: st.px(x, y).top + 'px'});
        L.appendChild(d);
      };
      s.walls.forEach(([x, y]) => cell(x, y, 'mv-wall'));
      (s.floors || []).forEach(f => cell(f.x, f.y, 'mv-floor' + (f.durability ? '' : ' broken'), f.durability ? f.durability + '/' + f.max : '✕'));
      (s.alarms || []).forEach(([x, y]) => cell(x, y, 'mv-alarm ' + (s.alarmOn ? 'on' : 'off'), s.alarmOn ? '!' : '✓'));
      (s.alarmSwitches || []).forEach(([x, y]) => cell(x, y, 'mv-switch' + (s.alarmOn ? '' : ' held'), 'S'));
      (s.barrier || []).forEach(([x, y]) => cell(x, y, 'mv-beam' + (s.electricOn ? ' on' : ''), s.electricOn ? '⚡' : ''));
      (s.pads || []).forEach(([x, y], i) => cell(x, y, 'mv-pad', 'AB'[i]));
      s.cats.filter(c => c.alive && c.magnet).forEach(c => {
        const x0 = Math.max(0, c.x - 1), y0 = Math.max(0, c.y - 1), x1 = Math.min(st.cols - 1, c.x + 1), y1 = Math.min(st.rows - 1, c.y + 1);
        const d = document.createElement('div'); d.className = 'mv-range';
        Object.assign(d.style, {left: st.px(x0, y0).left + 'px', top: st.px(x0, y0).top + 'px', width: (x1 - x0 + 1) * CELL + 'px', height: (y1 - y0 + 1) * CELL + 'px'});
        L.appendChild(d);
      });
    }
    select(i) { Object.entries(this.st.holes).forEach(([id, h]) => h.el.classList.toggle('sel', id === 'h' + i)); }
    rejectTl(i) { return gsap.timeline().fromTo(this.st.holes['h' + i].el, {x: -5}, {x: 5, duration: .05, repeat: 5, yoyo: true, clearProps: 'x'}); }
    /* Timeline chuyển từ state hiện tại sang next theo events của một nước đi hợp lệ. */
    step(next, events) {
      const st = this.st, prev = this.s, tl = gsap.timeline();
      this.s = next;
      const mv = events.find(e => e.type === 'move'), o = this.off[mv.hole], at = st.px(mv.to[0] + o[0], mv.to[1] + o[1]);
      tl.to(st.holes['h' + mv.hole].el, {left: at.left + 3, top: at.top + 3, duration: .32, ease: 'power2.inOut'});
      tl.call(() => this.overlay(next));
      const eaten = events.filter(e => e.type === 'eat').flatMap(e => e.ids);
      if (eaten.length) tl.add(st.eatTl(eaten));
      for (const e of events.filter(e => e.type === 'magnet')) {
        const src = prev.cats.find(c => c.id === e.source), p = st.px(src.x, src.y);
        tl.to(e.ids.map(id => st.cats[id].el), {left: p.left, top: p.top, scale: .3, opacity: 0, duration: .55, ease: 'power2.in', stagger: .06});
      }
      events.filter(e => e.type === 'teleport').forEach((e, k) => {
        const p = st.px(...e.to);
        tl.to(st.cats[e.id].el, {left: p.left, top: p.top, duration: .35, ease: 'back.out(1.6)'}, k ? '<' : '>');
      });
      tl.call(() => next.holes.forEach((h, i) => { if (!h.done) this.label(i, h); }));
      events.filter(e => e.type === 'holeDone').forEach(e => tl.to(st.holes['h' + e.hole].el, {scale: 0, opacity: 0, duration: .3, ease: 'back.in(2)'}));
      const end = events[events.length - 1];
      if (end.type === 'lose') tl.add(st.flashTl()).add(st.shakeTl(), '<').call(() => st.showBanner(LOSE_BANNER[end.reason], 'bad'));
      if (end.type === 'win') tl.call(() => st.showBanner('THẮNG ✓', 'ok'));
      return tl;
    }
  }

  /* Demo tự lặp: phát chuỗi nước (dạng CatDomFixtures.seq) trên logic thật. cfg: {el, cap, slug, level, moves, intro} */
  function moveDemo(cfg) {
    const logic = loadLogic(cfg.slug), view = new MoveView(cfg.el, cfg.level);
    if (!logic) { view.st.noLogic(`logic/${cfg.slug}.js`); caption(cfg.cap, 'Chưa có logic để chạy demo.'); return; }
    const moves = window.CatDomFixtures.seq(cfg.moves);
    const loop = (once) => {
      const game = logic.createGame(cfg.level);
      view.build(game.getState());
      const tl = gsap.timeline({onComplete: () => { if (!once) gsap.delayedCall(2.2, () => loop(false)); }});
      tl.call(() => caption(cfg.cap, cfg.intro)).to({}, {duration: 1.8});
      for (const [h, dx, dy] of moves) {
        const before = game.getState(), res = game.move(h, dx, dy), name = holeName(before, h) + ' ' + DIR_ARROW[dx + ',' + dy];
        if (!res.ok) { tl.call(() => caption(cfg.cap, `${name} · ${REJECT_VI[res.reason]}`)).add(view.rejectTl(h)).to({}, {duration: 1.2}); continue; }
        const next = game.getState(), text = describe(name, res.events, next);
        tl.call(() => caption(cfg.cap, text)).add(view.step(next, res.events)).to({}, {duration: .35});
      }
      tl.to({}, {duration: 1.4});
      return tl;
    };
    runDemo(cfg.el, loop);
  }

  /* Board chơi thử: chọn hố (bấm/kéo, phím 1–9), đi bằng phím mũi tên, nút data-dir hoặc kéo.
   * cfg: {el, logEl, slug, list: fixtures[slug].list, key, onUpdate(api)} */
  function movePlay(cfg) {
    const logic = loadLogic(cfg.slug), view = new MoveView(cfg.el, cfg.list[cfg.key].level);
    const api = {view, game: null, busy: false, sel: 0, key: cfg.key};
    api.log = (html, cls = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; cfg.logEl.prepend(d); };
    api.select = i => {
      if (!api.game || !api.game.getState().holes[i] || api.game.getState().holes[i].done) return;
      api.sel = i; view.select(i); cfg.onUpdate(api);
    };
    api.reset = key => {
      if (key) api.key = key;
      cfg.logEl.innerHTML = ''; api.busy = false;
      const lvl = cfg.list[api.key]?.level;
      if (lvl && (view.st.cols !== lvl.cols || view.st.rows !== lvl.rows)) {
        view.st = new Stage(cfg.el, lvl.cols, lvl.rows);
      }
      if (!logic) { view.st.noLogic(`logic/${cfg.slug}.js`); return; }
      api.game = logic.createGame(cfg.list[api.key].level);
      view.build(api.game.getState());
      api.select(0);
      api.log('Chọn một hố rồi đi bằng phím mũi tên, nút ↑ ↓ ← → hoặc kéo hố.');
    };
    api.move = (dx, dy) => {
      if (api.busy || !api.game) return;
      const before = api.game.getState(), h = api.sel, res = api.game.move(h, dx, dy), name = holeName(before, h) + ' ' + DIR_ARROW[dx + ',' + dy];
      if (!res.ok) { view.rejectTl(h); api.log(`${name} · ${REJECT_VI[res.reason]}`); return; }
      const next = api.game.getState(), end = res.events[res.events.length - 1].type;
      api.busy = true;
      view.step(next, res.events).eventCallback('onComplete', () => {
        api.busy = false;
        if (next.holes[api.sel].done) api.select(next.holes.findIndex(o => !o.done));
        cfg.onUpdate(api);
      });
      api.log(describe(name, res.events, next), end === 'lose' ? 'b' : end === 'win' ? 'g' : '');
    };
    const el = cfg.el, scale = () => el.getBoundingClientRect().width / view.st.w;
    el.tabIndex = 0;
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', 'Board chơi thử: phím 1–9 chọn hố, phím mũi tên để đi');
    el.style.touchAction = 'none';
    let drag = null;
    el.addEventListener('pointerdown', e => {
      if (!api.game) return;
      const r = el.getBoundingClientRect(), sc = scale();
      const x = Math.floor(((e.clientX - r.left) / sc - PAD) / CELL), y = Math.floor(((e.clientY - r.top) / sc - PAD) / CELL);
      const i = api.game.getState().holes.findIndex(h => !h.done && h.shape.some(([dx, dy]) => h.x + dx === x && h.y + dy === y));
      if (i < 0) return;
      api.select(i); drag = {x: e.clientX, y: e.clientY};
      el.setPointerCapture(e.pointerId); el.focus({preventScroll: true});
    });
    el.addEventListener('pointermove', e => {
      if (!drag || api.busy) return;
      const sc = scale(), dx = (e.clientX - drag.x) / sc, dy = (e.clientY - drag.y) / sc;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < CELL * .6) return;
      const hor = Math.abs(dx) > Math.abs(dy);
      drag = {x: e.clientX, y: e.clientY};
      api.move(hor ? Math.sign(dx) : 0, hor ? 0 : Math.sign(dy));
    });
    el.addEventListener('pointerup', () => { drag = null; });
    el.addEventListener('pointercancel', () => { drag = null; });
    el.addEventListener('keydown', e => {
      const d = {ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0]}[e.key];
      if (d) { e.preventDefault(); api.move(...d); }
      else if (/^[1-9]$/.test(e.key)) api.select(+e.key - 1);
    });
    api.reset();
    return api;
  }

  /* Nối các phần chuẩn của trang chi tiết mechanic 05–10 (id cố định trong khuôn trang). */
  function labPage(slug, text) {
    const $ = id => document.getElementById(id), set = window.CatDomFixtures.fixtures[slug], demoFx = set.list[set.demo || set.default];
    moveDemo({el: $('demoBad'), cap: $('capBad'), slug, level: demoFx.level, moves: demoFx.bad.moves, intro: text.bad});
    moveDemo({el: $('demoGood'), cap: $('capGood'), slug, level: demoFx.level, moves: demoFx.good, intro: text.good});
    const STATUS = {playing: 'Đang chơi', won: 'Thắng ✓', lost: 'Thua ✗'};
    const play = movePlay({el: $('playStage'), logEl: $('log'), slug, list: set.list, key: set.default, onUpdate: api => {
      const s = api.game.getState(), h = s.holes[api.sel];
      $('sHole').textContent = h && !h.done ? holeName(s, api.sel) + (h.axis ? ' ' + AXIS_MARK[h.axis] : '') : '–';
      $('sTurn').textContent = s.turn;
      $('sStatus').textContent = STATUS[s.status];
    }});
    const fx = $('fixture'), keys = Object.keys(set.list);
    if (keys.length > 1) {
      fx.innerHTML = keys.map(k => `<option value="${k}">${set.list[k].name}</option>`).join('');
      fx.value = set.default;
      fx.onchange = () => play.reset(fx.value);
    } else fx.closest('.ctrl').hidden = true;
    $('reset').onclick = () => play.reset();
    $('hint').onclick = () => play.log('💡 ' + set.list[play.key].hint, 'g');
    document.querySelectorAll('[data-dir]').forEach(b => { b.onclick = () => play.move(...b.dataset.dir.split(',').map(Number)); });
    return play;
  }

  window.CatDom = {CELL, PAD, OL, PAL, MARK, catSVG, moodFor, weedSVG, pesticideSVG, boxSVG, heartMarkSVG, Stage, loadLogic, rectOf, caption, demo, playground,
    MoveView, moveDemo, movePlay, labPage, holeName, moveEventText};
})();
