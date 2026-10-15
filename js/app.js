/* ============================================================
   구구단 탐험대 — app.js
   1) 데이터  2) 저장  3) 유틸  4) 소리·음성  5) 효과(색종이·토스트)
   6) 그림 그리기(묶음·수직선)  7) 화면: 지도·배우기·도전·표·배지
   8) 배지 규칙  9) 이벤트 연결
   외부 라이브러리 없이 순수 JavaScript로 작성했습니다.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- 1) 데이터 ---------- */
  const DANS = [2, 3, 4, 5, 6, 7, 8, 9];
  const RAINBOW = ['#ff4d4d', '#ff9f1c', '#ffd60a', '#22b573', '#3a86ff', '#3d348b', '#9d4edd'];

  // 단마다 하나의 '섬' 테마: 이름, 아이콘, 묶음 안에 그릴 그림, 색, 선생님 팁
  const THEMES = {
    2: { name: '체리 마을', icon: '🍒', item: '🍒', c1: '#ff5d8f', c2: '#ffd3e0',
         tip: '2단의 곱은 모두 짝수예요. 일의 자리 숫자가 2, 4, 6, 8, 0으로 되풀이돼요.' },
    3: { name: '주먹밥 소풍길', icon: '🍙', item: '🍙', c1: '#f08c00', c2: '#ffe3b3',
         tip: '3단의 곱은 각 자리 숫자를 더하면 3, 6, 9 중 하나가 돼요. (예: 27 → 2 + 7 = 9)' },
    4: { name: '네잎클로버 언덕', icon: '🍀', item: '🍀', c1: '#22b573', c2: '#c9f5dc',
         tip: '4단의 곱은 2단의 곱을 두 배 한 것과 같아요. (4 × 3 = 12는 2 × 3 = 6의 두 배)' },
    5: { name: '별빛 해변', icon: '⭐', item: '⭐', c1: '#e0a400', c2: '#fff1b0',
         tip: '5단의 곱은 일의 자리 숫자가 5와 0으로 번갈아 나와요.' },
    6: { name: '무당벌레 정원', icon: '🐞', item: '🐞', c1: '#e5484d', c2: '#ffd6d7',
         tip: '6단의 곱은 3단의 곱을 두 배 한 것과 같아요. 6에 짝수를 곱하면 일의 자리가 곱한 수와 같아요! (6 × 4 = 24, 6 × 8 = 48)' },
    7: { name: '무지개 폭포', icon: '🌈', item: null, c1: '#7b5cff', c2: '#e3dbff',
         tip: '어려운 7단은 나누어 생각해요. 7 × 8 = 5 × 8 + 2 × 8 = 40 + 16 = 56' },
    8: { name: '문어 바다', icon: '🐙', item: '🐙', c1: '#118ab2', c2: '#c6ecf8',
         tip: '8단의 곱은 4단의 곱을 두 배 한 것과 같아요. 일의 자리 숫자가 8, 6, 4, 2, 0으로 줄어들어요.' },
    9: { name: '보석 동굴', icon: '💎', item: '💎', c1: '#079e98', c2: '#c3f1ee',
         tip: '9단은 십의 자리가 1씩 커지고 일의 자리가 1씩 작아져요. 두 숫자를 더하면 언제나 9! (9 × 7 = 63 → 6 + 3 = 9)' },
  };

  const PRAISE = [
    '정답이에요! 최고예요! 🎉', '우와, 천재 탐험가! 🌟', '딱 맞혔어요! 👏',
    '멋져요! 다음 섬도 문제없겠어요 🚀', '척척박사 등장! 🧠', '반짝반짝 빛나는 실력이에요 ✨',
    '정확해요! 그림이 머릿속에 쏙 들어왔네요 🖼️', '완벽해요! 부엉이 대장도 깜짝 놀랐어요 🦉',
  ];
  const RETRY = [
    '괜찮아요! 그림을 보면서 다시 세어 볼까요? 🦉', '아깝다! 거의 다 왔어요 💪',
    '틀려도 괜찮아요. 실수는 배움의 지도예요 🗺️', '한 번 더! 묶음을 하나씩 세어 보세요 🍀',
  ];
  const STREAK_MSG = {
    3: '🔥 3연속 정답! 불이 붙었어요!',
    5: '🔥🔥 5연속! 멈출 수 없는 탐험가!',
    10: '⚡ 10연속! 전설의 탐험가가 나타났어요!',
  };

  /* ---------- 2) 저장 (브라우저 localStorage) ---------- */
  const KEY = 'gugudan-explorer-v1';
  const fresh = () => ({
    stars: {}, learned: [], badges: [], totalCorrect: 0, bestStreak: 0,
    tableTaps: 0, mistakes: {}, fixed: 0, perfect: 0, sound: true,
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(fresh(), JSON.parse(raw));
    } catch (e) { /* 저장소를 못 쓰는 환경(시크릿 창 등)에서도 앱은 동작 */ }
    return fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 무시 */ } }

  let S = load();
  let streak = 0;
  let current = 'map';

  /* ---------- 3) 유틸 ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => {
    const r = [...arr];
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const totalStars = () => DANS.reduce((s, d) => s + (S.stars[d] || 0), 0);

  // 한자어 수 읽기와 조사(은/는, 을/를) — 받침 있는 끝자리: 일·삼·육·칠·팔·십
  const DIG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  function sino(n) {
    if (n === 0) return '영';
    const t = Math.floor(n / 10), o = n % 10;
    return (t ? (t > 1 ? DIG[t] : '') + '십' : '') + DIG[o];
  }
  const batchim = n => [0, 1, 3, 6, 7, 8].includes(n % 10);
  const eunNeun = n => (batchim(n) ? '은' : '는');
  const eulReul = n => (batchim(n) ? '을' : '를');
  const itemWord = a => THEMES[a].item || '🌈 구슬';
  const sayMul = (a, b) => `${sino(a)} 곱하기 ${sino(b)}${eunNeun(b)} ${sino(a * b)}`;

  /* ---------- 4) 소리(Web Audio)와 읽어 주기(Web Speech) ---------- */
  const Sound = {
    ctx: null,
    get() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(freq, t0, dur, type = 'sine', vol = 0.12) {
      if (!S.sound) return;
      const c = this.get(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      const st = c.currentTime + t0;
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(vol, st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(g); g.connect(c.destination);
      o.start(st); o.stop(st + dur + 0.05);
    },
    click()   { this.tone(660, 0, 0.06, 'triangle', 0.05); },
    ding()    { this.tone(988, 0, 0.15, 'sine', 0.08); this.tone(1319, 0.08, 0.25, 'sine', 0.06); },
    correct() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, i * 0.08, 0.22, 'triangle', 0.12)); },
    soft()    { this.tone(659.25, 0, 0.15, 'triangle', 0.08); this.tone(783.99, 0.1, 0.2, 'triangle', 0.08); },
    wrong()   { this.tone(392, 0, 0.16, 'sine', 0.09); this.tone(311.13, 0.14, 0.3, 'sine', 0.09); },
    badge()   { [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => this.tone(f, i * 0.1, 0.3, 'triangle', 0.1)); },
    fanfare() { [523.25, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, i * 0.13, 0.28, 'square', 0.05)); },
  };

  function speak(text) {
    try {
      const sy = window.speechSynthesis;
      if (!sy) { toast('이 브라우저는 읽어 주기를 지원하지 않아요'); return; }
      sy.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR'; u.rate = 0.85; u.pitch = 1.1;
      const v = sy.getVoices().find(v => /^ko/i.test(v.lang));
      if (v) u.voice = v;
      sy.speak(u);
    } catch (e) { /* 무시 */ }
  }

  /* ---------- 5) 효과: 색종이, 토스트 ---------- */
  const Confetti = (() => {
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const colors = ['#ff5d8f', '#ffd60a', '#22b573', '#3a86ff', '#9d4edd', '#ff9f1c'];
    let parts = [], raf = null;
    function resize() {
      const r = window.devicePixelRatio || 1;
      cv.width = innerWidth * r; cv.height = innerHeight * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
    }
    addEventListener('resize', resize); resize();
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 30);
      for (const p of parts) {
        p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : null;
      if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    function burst(n = 80, el = null) {
      if (reduceMotion) return;
      let x = innerWidth / 2, y = innerHeight / 3;
      if (el) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      for (let i = 0; i < n; i++) {
        parts.push({ x, y, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 11 - 4,
          s: Math.random() * 8 + 5, c: pick(colors), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 140 });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    return { burst };
  })();

  function toast(html, kind = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2600);
  }

  function updateStatus(bump) {
    $('#starTotal').textContent = `⭐ ${totalStars()}`;
    $('#streakPill').textContent = `🔥 ${streak}`;
    $('#badgePill').textContent = `🏅 ${S.badges.length}`;
    if (bump) { const el = $(bump); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  function updateSoundBtn() {
    const b = $('#soundBtn');
    b.textContent = S.sound ? '🔊' : '🔇';
    b.setAttribute('aria-label', S.sound ? '소리 끄기' : '소리 켜기');
  }

  /* ---------- 6) 그림 그리기 ---------- */
  // a × b  →  'a개씩 b묶음' 그림 (곱셈의 뜻을 눈으로 보여 주는 핵심 부품)
  function arrayHTML(a, b, animate = true) {
    const t = THEMES[a];
    const cols = a <= 5 ? a : Math.ceil(a / 2);
    const dense = a * b > 36 ? 'dense' : '';
    let out = `<div class="array ${dense}" style="--cols:${cols};--c1:${t.c1}" role="img" aria-label="${a}개씩 ${b}묶음, 모두 ${a * b}개">`;
    for (let g = 0; g < b; g++) {
      out += `<div class="group" style="--d:${animate ? g * 0.16 : 0}s"><div class="items">`;
      for (let i = 0; i < a; i++) {
        out += t.item
          ? `<span class="item" aria-hidden="true">${t.item}</span>`
          : `<span class="dot" style="background:${RAINBOW[i]}"></span>`;
      }
      out += `</div><span class="count">${a * (g + 1)}</span></div>`;
    }
    return out + '</div>';
  }

  // 수직선 위에서 a씩 k번 뛰어 세기
  function numberLine(a, k, animate = true) {
    const W = 900, L = 40, R = 860, max = a * 9;
    const x = m => (L + (m / max) * (R - L)).toFixed(1);
    let s = `<svg class="numline" viewBox="0 0 ${W} 140" role="img" aria-label="0에서 ${a}씩 ${k}번 뛰어 세면 ${a * k}">`;
    s += `<line class="axis" x1="${L}" y1="100" x2="${R}" y2="100"/>`;
    for (let j = 0; j <= 9; j++) {
      const on = j <= k ? 'on' : '';
      s += `<line class="tick ${on}" x1="${x(a * j)}" y1="91" x2="${x(a * j)}" y2="109"/>`;
      s += `<text class="tl ${on}" x="${x(a * j)}" y="132">${a * j}</text>`;
    }
    for (let j = 1; j <= k; j++) {
      const x1 = +x(a * (j - 1)), x2 = +x(a * j), mx = (x1 + x2) / 2, d = animate ? (j - 1) * 0.16 : 0;
      s += `<path class="hop" pathLength="1" style="--d:${d}s" d="M${x1} 96 Q ${mx} 30 ${x2} 96"/>`;
      s += `<text class="hl" style="--d:${d}s" x="${mx}" y="56">+${a}</text>`;
    }
    s += `<text class="frog" x="${x(a * k)}" y="86">🐸</text></svg>`;
    return s;
  }

  const danChips = (sel, act, multi = null) => `<div class="chips">${DANS.map(d => {
    const on = multi ? multi.has(d) : d === sel;
    return `<button class="chip ${on ? 'on' : ''}" style="--c1:${THEMES[d].c1}" data-act="${act}" data-dan="${d}" aria-pressed="${on}">${THEMES[d].icon} ${d}단</button>`;
  }).join('')}</div>`;

  /* ---------- 7-1) 탐험 지도 ---------- */
  function renderMap() {
    const total = totalStars();
    const next = DANS.find(d => (S.stars[d] || 0) < 3);
    const greet = next
      ? `오늘은 <b>${next}단 ${THEMES[next].name}</b> ${THEMES[next].icon}(으)로 떠나 볼까요?`
      : '모든 섬을 정복했어요! 진정한 구구단 대장이에요 👑';
    $('#view-map').innerHTML = `
      <section class="card hero">
        <div class="mascot" aria-hidden="true">🦉</div>
        <div style="flex:1">
          <h1>구구단 탐험대에 온 걸 환영해요!</h1>
          <p class="bubble-text">나는 부엉이 대장 <b>구구</b>예요. ${greet}</p>
          <div class="hero-progress">
            <div class="progress" aria-label="모은 별 ${total}개, 전체 24개"><span style="width:${(total / 24) * 100}%"></span></div>
            <b>⭐ ${total} / 24</b>
          </div>
        </div>
      </section>
      <div class="islands">${DANS.map(d => islandCard(d, d === next)).join('')}</div>
      <section class="card how">
        <h2>🧭 이렇게 탐험해요</h2>
        <ol>
          <li><b>📖 1. 배우기</b>그림 묶음과 개구리 뜀뛰기로 곱셈의 뜻을 눈으로 봐요.</li>
          <li><b>🎯 2. 도전</b>10문제를 풀고 별을 모아요. 틀리면 그림 힌트가 도와줘요.</li>
          <li><b>🔢 3. 구구단 표</b>표를 눌러 숨은 규칙과 같은 값을 찾아요.</li>
          <li><b>🏅 4. 배지</b>꾸준히 탐험하면 반짝이는 배지가 모여요.</li>
        </ol>
      </section>`;
  }
  function islandCard(d, isNext) {
    const t = THEMES[d], st = S.stars[d] || 0;
    return `
      <article class="island ${isNext ? 'next' : ''}" style="--c1:${t.c1};--c2:${t.c2}">
        ${isNext ? '<span class="ribbon">추천!</span>' : ''}
        <div class="island-art" aria-hidden="true"><span class="float" style="animation-delay:${d * 0.2}s">${t.icon}</span></div>
        <h3>${d}단</h3>
        <p>${t.name}</p>
        <div class="stars" aria-label="별 ${st}개">${'★'.repeat(st)}<span class="off">${'★'.repeat(3 - st)}</span></div>
        <div class="island-btns">
          <button class="btn small" data-act="learn" data-dan="${d}">📖 배우기</button>
          <button class="btn small solid" data-act="quiz" data-dan="${d}">🎯 도전</button>
        </div>
      </article>`;
  }

  /* ---------- 7-2) 배우기 ---------- */
  const learn = { dan: 2, k: 1, timer: null };

  function renderLearn(opts = {}) {
    if (opts.dan) { learn.dan = opts.dan; learn.k = 1; }
    clearTimeout(learn.timer);
    const { dan, k } = learn, t = THEMES[dan], ans = dan * k;
    const sum = k > 1
      ? `${Array(k).fill(dan).join(' + ')} = <b>${ans}</b><br><small>${dan}${eulReul(dan)} ${k}번 더한 것과 같아요!</small>`
      : `${dan}개씩 한 묶음이면 <b>${ans}</b>개예요`;
    $('#view-learn').innerHTML = `
      ${danChips(dan, 'learnDan')}
      <div class="learn-layout" style="--c1:${t.c1};--c2:${t.c2}">
        <article class="card lesson">
          <header class="lesson-head">
            <span class="tag">${t.icon} ${dan}단 · ${t.name}</span>
            <div class="steps">${range(1, 9).map(j =>
              `<button class="step ${j < k ? 'done' : ''} ${j === k ? 'now' : ''}" data-act="learnStep" data-k="${j}" aria-label="${dan} 곱하기 ${j}">${j}</button>`).join('')}
            </div>
          </header>
          <div class="equation" aria-live="polite">
            <span>${dan}</span><span class="op">×</span><span>${k}</span><span class="op">=</span><span class="ans" id="learnAns">?</span>
          </div>
          <p class="story">${itemWord(dan)} <b>${dan}개씩 ${k}묶음</b>이 있어요. 모두 몇 개일까요?</p>
          ${arrayHTML(dan, k)}
          ${numberLine(dan, k)}
          <p class="sum-line" id="sumLine" hidden>${sum}</p>
          <div class="lesson-ctrl">
            <button class="btn" data-act="learnPrev" ${k === 1 ? 'disabled' : ''}>◀ 이전</button>
            <button class="btn" data-act="speakLearn">🔊 읽어 주기</button>
            <button class="btn solid" data-act="learnNext">${k < 9 ? '다음 ▶' : `🎯 ${dan}단 도전하기`}</button>
          </div>
        </article>
        <aside class="card side">
          <h3>${t.icon} ${dan}단 한눈에 보기</h3>
          <ul class="dan-table">${range(1, 9).map(j =>
            `<li class="${j === k ? 'now' : ''} ${j < k ? 'seen' : ''}"><button data-act="learnStep" data-k="${j}">${dan} × ${j} = ${j <= k ? dan * j : '?'}</button></li>`).join('')}
          </ul>
          <div class="tip"><b>💡 부엉이 대장의 비밀 팁</b><p>${t.tip}</p></div>
        </aside>
      </div>`;

    // 묶음이 다 나타난 뒤 정답 공개 → 예측하고 확인하는 흐름
    const delay = (reduceMotion ? 0 : k * 160) + 500;
    learn.timer = setTimeout(() => {
      const a = $('#learnAns'); if (!a) return;
      a.textContent = ans; a.classList.add('pop');
      $('#sumLine').hidden = false;
      Sound.ding();
      if (k === 9 && !S.learned.includes(dan)) {
        S.learned.push(dan); save();
        toast(`${t.icon} ${dan}단 배우기 완료! 이제 도전해 볼까요?`);
        checkBadges();
      }
    }, delay);
  }

  /* ---------- 7-3) 도전 (퀴즈) ---------- */
  const quiz = { phase: 'setup', sel: new Set([2]), dans: [2], source: 'normal', qs: [], i: 0, first: 0, wrongList: [], stars: 0 };

  function renderQuiz(opts = {}) {
    if (opts.dan) { quiz.sel = new Set([opts.dan]); startQuiz([opts.dan]); return; }
    if (quiz.phase === 'play') return renderQuestion();
    if (quiz.phase === 'result') return renderResult();
    renderQuizSetup();
  }

  function renderQuizSetup() {
    quiz.phase = 'setup';
    const mCount = Object.keys(S.mistakes).length;
    $('#view-quiz').innerHTML = `
      <article class="card setup">
        <div class="mascot-row">
          <span class="mascot" aria-hidden="true">🦉</span>
          <p class="bubble">어떤 섬에 도전할까요? 여러 단을 골라 <b>섞어서</b> 풀 수도 있어요!</p>
        </div>
        ${danChips(null, 'toggleSel', quiz.sel)}
        <div class="row">
          <button class="btn small" data-act="selAll">🌏 모두 고르기</button>
          <button class="btn small" data-act="selNone">🧹 지우기</button>
        </div>
        <div class="start-row">
          <button class="btn solid big" data-act="startQuiz" ${quiz.sel.size ? '' : 'disabled'}>🚀 10문제 출발!</button>
          ${mCount ? `<button class="btn warm big" data-act="startMistakes">📒 오답 노트 다시 풀기 (${Math.min(mCount, 10)}문제)</button>` : ''}
        </div>
        <p class="muted" style="margin-top:12px">💡 한 단만 골라 도전하면 그 섬의 별을 받을 수 있어요. 숫자키 1~4로 답을 고르고, Enter로 다음 문제로 넘어갈 수 있어요.</p>
      </article>`;
  }

  function makeQuestions(dans) {
    const qs = [], seen = new Set(), all = dans.length * 9;
    let guard = 0;
    while (qs.length < 10 && guard++ < 1000) {
      const a = pick(dans), b = randInt(1, 9), key = `${a}x${b}`;
      if (seen.has(key) && seen.size < all) continue;           // 가능한 한 겹치지 않게
      const last = qs[qs.length - 1];
      if (last && last.a === a && last.b === b) continue;        // 같은 문제 연속 금지
      seen.add(key); qs.push({ a, b });
    }
    return qs;
  }

  // 오답 선택지는 '흔한 실수'로 만든다 → 틀린 답에 따라 맞춤 피드백 가능
  function makeChoices(a, b) {
    const ans = a * b;
    const cand = [a + b, a * (b - 1), a * (b + 1), (a - 1) * b, (a + 1) * b, ans + 1, ans - 1, ans + 10, ans - 10];
    const pool = shuffle([...new Set(cand)].filter(v => v > 0 && v !== ans && v <= 99));
    const ch = [ans, ...pool.slice(0, 3)];
    while (ch.length < 4) { const v = randInt(1, 90); if (!ch.includes(v)) ch.push(v); }
    return shuffle(ch);
  }

  function startQuiz(dans, list = null, source = 'normal') {
    if (!dans.length && !list) return;
    quiz.dans = dans; quiz.source = source;
    quiz.qs = (list || makeQuestions(dans)).map(q => ({ ...q, ans: q.a * q.b, choices: makeChoices(q.a, q.b), missed: false, solved: false }));
    quiz.i = 0; quiz.first = 0; quiz.wrongList = []; quiz.phase = 'play';
    renderQuestion();
    window.scrollTo({ top: 0 });
  }
  function startMistakes() {
    const list = Object.entries(S.mistakes)
      .sort((x, y) => y[1] - x[1]).slice(0, 10)
      .map(([k]) => { const [a, b] = k.split('x').map(Number); return { a, b }; });
    if (!list.length) return;
    startQuiz([...new Set(list.map(q => q.a))], shuffle(list), 'mistakes');
  }

  function renderQuestion() {
    const q = quiz.qs[quiz.i], t = THEMES[q.a], n = quiz.qs.length;
    const intro = quiz.source === 'mistakes'
      ? '📒 지난번에 헷갈렸던 문제예요. 이번엔 꼭 맞혀 봐요!'
      : `${t.icon} ${t.name}의 문제예요! 정답을 골라 볼까요?`;
    $('#view-quiz').innerHTML = `
      <div class="quiz-top">
        <span class="tag" style="--c2:${t.c2}">문제 ${quiz.i + 1} / ${n}</span>
        <div class="progress" aria-hidden="true"><span style="width:${(quiz.i / n) * 100}%"></span></div>
        <span class="tag" style="--c2:#d6f7e6">✅ ${quiz.first}</span>
      </div>
      <article class="card qcard" id="qcard" style="--c1:${t.c1};--c2:${t.c2}">
        <div class="mascot-row">
          <span class="mascot" id="mascot" aria-hidden="true">🦉</span>
          <p class="bubble" id="bubble" aria-live="polite">${intro}</p>
        </div>
        <div class="equation big">
          <span>${q.a}</span><span class="op">×</span><span>${q.b}</span><span class="op">=</span><span class="ans" id="qAns">?</span>
        </div>
        <div class="choices">${q.choices.map((v, idx) =>
          `<button class="choice" data-act="answer" data-v="${v}"><small>${idx + 1}</small>${v}</button>`).join('')}
        </div>
        <div class="q-tools">
          <button class="btn" data-act="hint">💡 그림 힌트</button>
          <button class="btn" data-act="speakQ">🔊 문제 듣기</button>
        </div>
        <div class="hint" id="hint" hidden>
          <p class="story">${itemWord(q.a)} ${q.a}개씩 ${q.b}묶음을 세어 봐요</p>
          ${arrayHTML(q.a, q.b)}
        </div>
        <button class="btn solid big next-btn" id="nextBtn" data-act="nextQ" hidden>${quiz.i < n - 1 ? '다음 문제 ▶' : '결과 보기 🏁'}</button>
      </article>`;
  }

  // 틀린 답을 보고 '왜' 틀렸는지 짚어 주는 진단형 피드백
  function diagnose(q, v) {
    const { a, b } = q;
    if (v === a + b) return `앗, 더하기를 했어요! ${a} × ${b}는 ${a}개씩 ${b}묶음이에요. 그림을 보며 세어 볼까요? 🦉`;
    if (v === a * (b - 1)) return `아깝다! 한 묶음이 모자라요. ${v}에 ${a}${eulReul(a)} 한 번 더 더해 봐요 ➕`;
    if (v === a * (b + 1)) return `아깝다! 한 묶음이 더 많아요. ${v}에서 ${a}${eulReul(a)} 한 번 빼 봐요 ➖`;
    if (v === (a - 1) * b || v === (a + 1) * b) return `한 묶음에 들어 있는 개수를 다시 봐요. ${a}개씩이에요! 👀`;
    if (Math.abs(v - a * b) === 1) return '정말 가까워요! 하나만 더 꼼꼼히 세어 볼까요? 🔍';
    return pick(RETRY);
  }

  function setBubble(msg, kind, face) {
    const b = $('#bubble'); if (!b) return;
    b.className = 'bubble ' + kind; void b.offsetWidth;
    b.innerHTML = msg;
    if (face) $('#mascot').textContent = face;
  }

  function answer(v, btn) {
    const q = quiz.qs[quiz.i];
    if (!q || q.solved) return;
    const key = `${q.a}x${q.b}`;

    if (v === q.ans) {
      q.solved = true;
      btn.classList.add('right');
      $$('.choice').forEach(b => { b.disabled = true; });
      const qa = $('#qAns'); qa.textContent = q.ans; qa.classList.add('pop');

      if (!q.missed) {
        quiz.first++; streak++; S.totalCorrect++;
        S.bestStreak = Math.max(S.bestStreak, streak);
        if (S.mistakes[key]) {                       // 오답 노트에 있던 문제를 한 번에 맞히면 극복!
          S.mistakes[key]--; if (S.mistakes[key] <= 0) delete S.mistakes[key];
          S.fixed++;
        }
        setBubble(STREAK_MSG[streak] || pick(PRAISE), 'good', '🥳');
        Confetti.burst(streak >= 5 ? 120 : 70, btn);
        Sound.correct();
      } else {
        setBubble(`맞았어요! ${q.a} × ${q.b} = ${q.ans}. 이번엔 꼭 기억해요 ✨`, 'good', '😊');
        Sound.soft();
      }
      save(); updateStatus('#streakPill'); checkBadges();
      const nb = $('#nextBtn'); nb.hidden = false; nb.focus({ preventScroll: true });
    } else {
      q.missed = true; streak = 0;
      btn.classList.add('wrong'); btn.disabled = true;
      S.mistakes[key] = (S.mistakes[key] || 0) + 1;
      if (!quiz.wrongList.includes(key)) quiz.wrongList.push(key);
      save(); updateStatus();
      setBubble(diagnose(q, v), 'oops', '🤗');
      Sound.wrong();
      const h = $('#hint'); h.hidden = false;
      h.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  function nextQ() {
    quiz.i++;
    if (quiz.i >= quiz.qs.length) finishQuiz(); else renderQuestion();
  }

  function finishQuiz() {
    quiz.phase = 'result';
    const n = quiz.qs.length, r = quiz.first / n;
    quiz.stars = r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.4 ? 1 : 0;
    quiz.newRecord = false;
    if (quiz.source === 'normal' && quiz.dans.length === 1) {
      const d = quiz.dans[0];
      if (quiz.stars > (S.stars[d] || 0)) { S.stars[d] = quiz.stars; quiz.newRecord = true; }
    }
    if (quiz.first === n && n >= 10) S.perfect++;
    save(); updateStatus('#starTotal');
    renderResult();
    if (quiz.stars >= 2) { Sound.fanfare(); Confetti.burst(160); } else Sound.soft();
    checkBadges();
  }

  function renderResult() {
    const n = quiz.qs.length, s = quiz.stars;
    const title = ['괜찮아요, 탐험은 이제 시작이에요!', '좋은 출발이에요!', '훌륭해요! 별 3개가 코앞이에요!', '대단해요! 완벽한 탐험이었어요!'][s];
    const msg = [
      '배우기에서 그림을 다시 보고 오면 금방 늘 거예요 🌱',
      '틀린 문제를 그림으로 다시 보면 실력이 쑥쑥 자라요 🌿',
      '조금만 더 연습하면 완벽해요! 💪',
      '부엉이 대장이 박수를 보내요! 👏👏👏',
    ][s];
    const single = quiz.source === 'normal' && quiz.dans.length === 1;
    const review = quiz.wrongList.length
      ? `<div class="review"><h3>📒 다시 보면 좋은 문제 <small class="muted">(눌러서 그림 보기)</small></h3>
          ${quiz.wrongList.map(k => { const [a, b] = k.split('x').map(Number);
            return `<details><summary>${a} × ${b} = ${a * b}</summary>${arrayHTML(a, b, false)}</details>`; }).join('')}
        </div>`
      : '<p class="muted">틀린 문제가 하나도 없어요! 💯</p>';
    $('#view-quiz').innerHTML = `
      <article class="card result">
        <div class="trophy" aria-hidden="true">${['🌱', '🥉', '🥈', '🏆'][s]}</div>
        <h2>${title}</h2>
        <div class="big-stars" aria-label="별 ${s}개">${range(1, 3).map(i => `<span class="${i <= s ? 'on' : ''}">★</span>`).join('')}</div>
        <p class="score">한 번에 맞힌 문제 <b>${quiz.first}</b> / ${n}</p>
        <p>${msg}</p>
        ${quiz.newRecord ? `<p><span class="tag">${THEMES[quiz.dans[0]].icon} ${quiz.dans[0]}단 섬의 별이 새로 빛나요!</span></p>` : ''}
        ${!single && quiz.source === 'normal' ? '<p class="muted">한 단만 골라 도전하면 그 섬의 별을 모을 수 있어요.</p>' : ''}
        ${review}
        <div class="row">
          <button class="btn solid big" data-act="retry">🔁 다시 도전</button>
          ${single ? `<button class="btn big" data-act="learn" data-dan="${quiz.dans[0]}">📖 ${quiz.dans[0]}단 배우기</button>` : ''}
          <button class="btn big" data-act="newQuiz">🎯 다른 섬 고르기</button>
          <button class="btn big" data-go="map">🗺️ 지도로</button>
        </div>
      </article>`;
  }

  /* ---------- 7-4) 구구단 표 ---------- */
  const tbl = { mode: 'area', hide: false, sel: null, row: null, revealed: new Set() };

  function tableCell(r, c) {
    tbl.sel = [r, c]; tbl.row = null;
    if (tbl.hide) tbl.revealed.add(`${r}x${c}`);
    S.tableTaps++; save();
    Sound.click(); renderTable(); checkBadges();
  }

  function renderTable() {
    const [sr, sc] = tbl.sel || [0, 0], p = sr * sc;
    let cells = '<div class="th corner" aria-hidden="true">×</div>' + range(1, 9).map(c => `<div class="th">${c}</div>`).join('');
    for (const r of range(1, 9)) {
      cells += `<button class="th rh ${tbl.row === r ? 'on' : ''}" data-act="rowHead" data-r="${r}" aria-label="${r}단 줄 보기">${r}</button>`;
      for (const c of range(1, 9)) {
        const key = `${r}x${c}`, cls = [];
        if (tbl.sel) {
          if (tbl.mode === 'area' && r <= sr && c <= sc) cls.push('area');
          if (tbl.mode === 'area' && r === sc && c === sr && sr !== sc) cls.push('mirror');
          if (tbl.mode === 'same' && r * c === p) cls.push('same');
          if (r === sr && c === sc) cls.push('target');
        }
        if (tbl.row === r) cls.push('rowhl');
        const show = !tbl.hide || tbl.revealed.has(key);
        if (!show) cls.push('hidden');
        if (tbl.hide && tbl.revealed.has(key) && r === sr && c === sc) cls.push('revealed');
        cells += `<button class="cell ${cls.join(' ')}" data-act="cell" data-r="${r}" data-c="${c}" aria-label="${r} 곱하기 ${c}">${show ? r * c : '?'}</button>`;
      }
    }

    let info;
    if (tbl.row) {
      const r = tbl.row;
      info = `<h3>➡️ ${r}단 줄</h3>
        <p>오른쪽으로 한 칸 갈 때마다 <b>${r}씩</b> 커져요.</p>
        <p class="seq">${range(1, 9).map(c => r * c).join(' → ')}</p>
        <p class="muted">다른 줄 머리(왼쪽 보라색 숫자)도 눌러 비교해 봐요.</p>`;
    } else if (tbl.sel && tbl.mode === 'same') {
      const pairs = [];
      for (const i of range(1, 9)) for (const j of range(1, 9)) if (i * j === p) pairs.push(`${i} × ${j}`);
      info = `<div class="equation small">${sr} × ${sc} = ${p}</div>
        <h3>🔎 곱이 ${p}인 칸은 ${pairs.length}개!</h3>
        <ul class="pairs">${pairs.map(x => `<li>${x}</li>`).join('')}</ul>
        <p class="muted">서로 다른 곱셈이 같은 값을 만들 수 있어요.</p>`;
    } else if (tbl.sel) {
      info = `<div class="equation small">${sr} × ${sc} = ${p}</div>
        <p>세로 <b>${sr}줄</b>, 가로 <b>${sc}칸</b>인 보라색 직사각형 안에 칸이 모두 <b>${p}개</b> 있어요.</p>
        ${sr !== sc
          ? `<p>🔄 주황색 칸 <b>${sc} × ${sr}</b>도 ${p}! 곱하는 두 수의 순서를 바꾸어도 곱은 같아요.</p>`
          : '<p>🟪 같은 수를 두 번 곱하면 정사각형 모양이 돼요!</p>'}`;
    } else {
      info = tbl.mode === 'area'
        ? '<h3>📐 넓이로 보기</h3><p>아무 칸이나 눌러 보세요. 곱셈이 <b>직사각형</b>으로 변신해요!</p><p class="muted">왼쪽 줄 머리를 누르면 그 단이 어떻게 커지는지 보여 줘요.</p>'
        : '<h3>🔎 같은 값 찾기</h3><p>칸을 누르면 같은 곱이 나오는 칸이 모두 노랗게 빛나요.</p>';
    }
    if (tbl.hide) info += `<p class="tag" style="--c2:#fff1b0;margin-top:10px">🙈 가리기 놀이: 답을 먼저 떠올리고 눌러 확인해요 (${tbl.revealed.size} / 81)</p>`;

    $('#view-table').innerHTML = `
      <div class="table-layout">
        <article class="card">
          <div class="tmodes">
            <button class="btn small ${tbl.mode === 'area' ? 'on' : ''}" data-act="tmode" data-mode="area">📐 넓이로 보기</button>
            <button class="btn small ${tbl.mode === 'same' ? 'on' : ''}" data-act="tmode" data-mode="same">🔎 같은 값 찾기</button>
            <button class="btn small ${tbl.hide ? 'on' : ''}" data-act="thide" aria-pressed="${tbl.hide}">🙈 가리기 놀이</button>
          </div>
          <div class="ttable">${cells}</div>
        </article>
        <aside class="card side info" aria-live="polite">${info}</aside>
      </div>`;
  }

  /* ---------- 7-5) 배지 화면 ---------- */
  function renderBadges() {
    const top = Object.entries(S.mistakes).sort((x, y) => y[1] - x[1]).slice(0, 5);
    $('#view-badges').innerHTML = `
      <article class="card">
        <h2 class="badges-head">🏅 나의 배지 상자 <small>${S.badges.length} / ${BADGES.length}</small></h2>
        <div class="badges">${BADGES.map(b => {
          const on = S.badges.includes(b.id);
          return `<div class="badge ${on ? 'on' : ''}"><span class="bi" aria-hidden="true">${b.icon}</span><b>${b.name}</b><small>${on ? b.desc : '🔒 ' + b.desc}</small></div>`;
        }).join('')}</div>
      </article>
      <article class="card stats">
        <h2>📊 나의 탐험 기록</h2>
        <ul>
          <li>모은 별: <b>${totalStars()}</b> / 24</li>
          <li>한 번에 맞힌 문제: <b>${S.totalCorrect}</b>개</li>
          <li>최고 연속 정답: <b>${S.bestStreak}</b>번</li>
          <li>끝까지 배운 단: <b>${S.learned.length ? S.learned.slice().sort((a, b) => a - b).join(', ') + '단' : '아직 없어요'}</b></li>
          <li>오답 노트에 남은 문제: <b>${Object.keys(S.mistakes).length}</b>개 · 극복한 문제: <b>${S.fixed}</b>개</li>
        </ul>
        ${top.length ? `<p><b>자주 헷갈린 문제</b></p><ul class="pairs">${top.map(([k, v]) => `<li>${k.replace('x', ' × ')} (${v}번)</li>`).join('')}</ul>` : ''}
        <div class="row" style="margin-top:14px">
          ${top.length ? '<button class="btn warm" data-act="startMistakesGo">📒 오답 노트 풀러 가기</button>' : ''}
          <button class="btn ghost" data-act="reset">🧹 기록 지우고 처음부터</button>
        </div>
      </article>`;
  }

  /* ---------- 8) 배지 규칙 ---------- */
  const BADGES = [
    { id: 'first',    icon: '🌱', name: '첫 정답',       desc: '처음으로 문제를 맞혔어요',               test: () => S.totalCorrect >= 1 },
    { id: 'streak5',  icon: '🔥', name: '불꽃 5연속',     desc: '5문제를 연속으로 맞혔어요',              test: () => S.bestStreak >= 5 },
    { id: 'streak10', icon: '⚡', name: '번개 10연속',    desc: '10문제를 연속으로 맞혔어요',             test: () => S.bestStreak >= 10 },
    { id: 'perfect',  icon: '💯', name: '만점 탐험가',    desc: '10문제를 모두 한 번에 맞혔어요',         test: () => S.perfect >= 1 },
    { id: 'learn1',   icon: '📖', name: '꼼꼼한 학습자',  desc: '한 단을 처음부터 끝까지 배웠어요',       test: () => S.learned.length >= 1 },
    { id: 'learnAll', icon: '🧭', name: '모든 섬 방문',   desc: '2단부터 9단까지 모두 배웠어요',          test: () => DANS.every(d => S.learned.includes(d)) },
    { id: 'table',    icon: '🔍', name: '표 탐험가',      desc: '구구단 표의 칸을 20번 눌러 탐험했어요',  test: () => S.tableTaps >= 20 },
    { id: 'fix5',     icon: '💪', name: '오답 극복왕',    desc: '틀렸던 문제를 5번 다시 맞혔어요',        test: () => S.fixed >= 5 },
    { id: 'c50',      icon: '🎖️', name: '정답 50개',      desc: '한 번에 맞힌 문제가 50개가 되었어요',    test: () => S.totalCorrect >= 50 },
    { id: 'c100',     icon: '🏆', name: '정답 100개',     desc: '한 번에 맞힌 문제가 100개가 되었어요',   test: () => S.totalCorrect >= 100 },
    ...DANS.map(d => ({ id: 'm' + d, icon: THEMES[d].icon, name: `${d}단 정복`, desc: `${d}단 도전에서 별 3개를 받았어요`, test: () => (S.stars[d] || 0) >= 3 })),
    { id: 'king',     icon: '👑', name: '구구단 대장',    desc: '모든 섬에서 별 3개를 받았어요',          test: () => DANS.every(d => (S.stars[d] || 0) >= 3) },
  ];

  function checkBadges() {
    const got = BADGES.filter(b => !S.badges.includes(b.id) && b.test());
    if (!got.length) return;
    got.forEach(b => S.badges.push(b.id));
    save(); updateStatus('#badgePill');
    got.forEach((b, i) => setTimeout(() => {
      toast(`${b.icon} 새 배지! <b>${b.name}</b>`, 'toast-badge');
      Sound.badge(); Confetti.burst(60);
    }, 700 + i * 1300));
  }

  /* ---------- 9) 화면 전환과 이벤트 ---------- */
  const RENDER = { map: renderMap, learn: renderLearn, quiz: renderQuiz, table: renderTable, badges: renderBadges };

  function go(view, opts = {}) {
    if (!RENDER[view]) view = 'map';
    current = view;
    clearTimeout(learn.timer);
    $$('.view').forEach(v => { v.hidden = v.id !== 'view-' + view; });
    $$('.tabs [data-go]').forEach(b => {
      const on = b.dataset.go === view;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    RENDER[view](opts);
    try { history.replaceState(null, '', '#' + view); } catch (e) { /* 무시 */ }
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  const actions = {
    learn:      (b, d) => go('learn', { dan: d }),
    quiz:       (b, d) => go('quiz', { dan: d }),
    learnDan:   (b, d) => { learn.dan = d; learn.k = 1; renderLearn(); },
    learnStep:  b => { learn.k = +b.dataset.k; renderLearn(); },
    learnPrev:  () => { if (learn.k > 1) { learn.k--; renderLearn(); } },
    learnNext:  () => { if (learn.k < 9) { learn.k++; renderLearn(); } else go('quiz', { dan: learn.dan }); },
    speakLearn: () => speak(sayMul(learn.dan, learn.k)),
    toggleSel:  (b, d) => { quiz.sel.has(d) ? quiz.sel.delete(d) : quiz.sel.add(d); renderQuizSetup(); },
    selAll:     () => { quiz.sel = new Set(DANS); renderQuizSetup(); },
    selNone:    () => { quiz.sel.clear(); renderQuizSetup(); },
    startQuiz:  () => startQuiz([...quiz.sel].sort((a, b) => a - b)),
    startMistakes: () => startMistakes(),
    startMistakesGo: () => { go('quiz'); startMistakes(); },
    answer:     b => answer(+b.dataset.v, b),
    hint:       () => { const h = $('#hint'); if (h) { h.hidden = false; h.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); } },
    speakQ:     () => { const q = quiz.qs[quiz.i]; if (q) speak(`${sino(q.a)} 곱하기 ${sino(q.b)}${eunNeun(q.b)} 얼마일까요?`); },
    nextQ:      () => nextQ(),
    retry:      () => (quiz.source === 'mistakes' ? startMistakes() : startQuiz(quiz.dans)),
    newQuiz:    () => renderQuizSetup(),
    tmode:      b => { tbl.mode = b.dataset.mode; tbl.sel = null; tbl.row = null; renderTable(); },
    thide:      () => { tbl.hide = !tbl.hide; tbl.revealed.clear(); tbl.sel = null; renderTable(); },
    cell:       b => tableCell(+b.dataset.r, +b.dataset.c),
    rowHead:    b => { tbl.row = +b.dataset.r; tbl.sel = null; renderTable(); },
    reset:      () => {
      if (!confirm('모든 별과 배지를 지우고 처음부터 시작할까요?')) return;
      S = fresh(); streak = 0; save(); updateStatus(); updateSoundBtn();
      quiz.phase = 'setup'; go('map'); toast('새로운 탐험을 시작해요! 🧭');
    },
  };
  const QUIET = new Set(['answer', 'cell']);   // 자체 효과음이 있는 동작

  document.addEventListener('click', e => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { Sound.click(); go(goBtn.dataset.go); return; }
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const fn = actions[b.dataset.act];
    if (!fn) return;
    if (!QUIET.has(b.dataset.act)) Sound.click();
    fn(b, +b.dataset.dan);
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (current === 'quiz' && quiz.phase === 'play') {
      if (/^[1-4]$/.test(e.key)) {
        const b = $$('.choice')[+e.key - 1];
        if (b && !b.disabled) b.click();
      } else if (e.key === 'Enter') {
        const n = $('#nextBtn');
        if (n && !n.hidden) { e.preventDefault(); n.click(); }
      }
    } else if (current === 'learn') {
      if (e.key === 'ArrowRight') { e.preventDefault(); Sound.click(); actions.learnNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); Sound.click(); actions.learnPrev(); }
    }
  });

  $('#soundBtn').addEventListener('click', () => {
    S.sound = !S.sound; save(); updateSoundBtn();
    if (S.sound) Sound.ding(); else if (window.speechSynthesis) speechSynthesis.cancel();
  });

  // 일부 브라우저는 목소리 목록을 늦게 불러오므로 미리 요청
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }

  updateSoundBtn(); updateStatus();
  go((location.hash || '#map').slice(1));
})();
