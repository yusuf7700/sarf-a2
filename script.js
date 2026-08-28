try {
// ===== Sozlamalar (til, shrift, mavzu) =====
  const SETTINGS_KEY = 'sarfA2Settings';
  function loadSettings(){
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if(raw) return Object.assign({lang:'lotin', arScale:1, uzScale:1, theme:'system'}, JSON.parse(raw));
    } catch(e){}
    return {lang:'lotin', arScale:1, uzScale:1, theme:'system'};
  }
  function saveSettings(){
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch(e){}
  }
  const SETTINGS = loadSettings();

  // --- Lotin -> Kirill transliteratsiya (taxminiy, ASCII harflarga tegadi, arab matnga tegmaydi) ---
  function toCyr(str){
    if(!str) return str;
    const isAllUpper = str === str.toUpperCase() && str !== str.toLowerCase();
    let s = str;
    const multi = [
      [/o['ʻʼ‘’`]/gi, 'ў'], [/g['ʻʼ‘’`]/gi, 'ғ'],
      [/sh/gi, 'ш'], [/ch/gi, 'ч'],
      [/yo/gi, 'ё'], [/yu/gi, 'ю'], [/ya/gi, 'я'], [/ng/gi, 'нг'],
    ];
    multi.forEach(([re, out]) => { s = s.replace(re, out); });
    const map = {a:'а',b:'б',d:'д',e:'е',f:'ф',g:'г',h:'ҳ',i:'и',j:'ж',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'қ',r:'р',s:'с',t:'т',u:'у',v:'в',x:'х',y:'й',z:'з',c:'ц',"'":'ъ'};
    s = s.replace(/[a-z']/gi, ch => map[ch.toLowerCase()] || ch);
    if(isAllUpper) s = s.toUpperCase();
    else if(str[0] && str[0] === str[0].toUpperCase() && str[0] !== str[0].toLowerCase()){
      s = s.charAt(0).toUpperCase() + s.slice(1);
    }
    return s;
  }
  function L(str){
    if(str === undefined || str === null) return '';
    return SETTINGS.lang === 'kirill' ? toCyr(String(str)) : String(str);
  }

  function applyTheme(){
    let effective = SETTINGS.theme;
    if(effective === 'system'){
      effective = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effective);
  }
  function applyFontScale(){
    document.documentElement.style.setProperty('--ar-scale', SETTINGS.arScale);
    document.documentElement.style.setProperty('--uz-scale', SETTINGS.uzScale);
  }
  applyTheme();
  applyFontScale();
  if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if(SETTINGS.theme === 'system') applyTheme();
    });
  }

  let rerenderCurrent = () => {};

// ===== Boblar ro'yxati (1-bob tayyor, qolganlari tez orada) =====
  const CHAPTERS = [
    {n:1, arab:"أَفْعَلَ", uz:"Af'ala vazni", data:BOB1, available:true},
    {n:2, arab:"فَعَّلَ", uz:"Fa''ala vazni", data:BOB2, available:true},
    {n:3, arab:"فَاعَلَ", uz:"Faala vazni", data:BOB3, available:true},
    {n:4, arab:"اِفْتَعَلَ", uz:"Iftaala vazni", data:BOB4, available:true},
    {n:5, arab:"اِنْفَعَلَ", uz:"Infaala vazni", data:BOB5, available:true},
    {n:6, arab:"اِفْعَلَّ", uz:"Ifalla vazni", data:BOB6, available:true},
    {n:7, arab:"اِفْعَالَّ", uz:"Ifaalla vazni", data:BOB7, available:true},
    {n:8, arab:"تَفَعَّلَ", uz:"Tafaala vazni", data:BOB8, available:true},
    {n:9, arab:"تَفَاعَلَ", uz:"Tafaaala vazni", data:BOB9, available:true},
    {n:10, arab:"اِسْتَفْعَلَ", uz:"Istaf'ala vazni", data:BOB10, available:true},
    {n:11, arab:"اِفْعَوْعَلَ", uz:"Ifav'ala vazni", data:BOB11, available:true},
    {n:12, arab:"اِفْعَوَّلَ", uz:"Ifavvala vazni", data:BOB12, available:true},
  ];
  
  function renderChapters(){
    const grid = document.getElementById('chaptersGrid');
    grid.innerHTML = CHAPTERS.map(ch => `
      <div class="chapter-card ${ch.available ? 'available' : 'locked'}" ${ch.available ? `onclick="openChapter(${ch.n})"` : ''}>
        <div class="num">Bob ${ch.n}</div>
        <div class="arab">${ch.arab}</div>
        <div class="uzname">${L(ch.uz)}</div>
      </div>
    `).join('');
  }
  
  const VIEWS = ['homeView','chapterView','lugatView','sozlamalarView'];
  function showView(id){
    VIEWS.forEach(v => document.getElementById(v).style.display = (v === id ? 'block' : 'none'));
  }
  document.getElementById('backBtn').addEventListener('click', () => backAction());
  let backAction = goHome;

  let currentChapterData = null;

  function openChapter(n){
    const ch = CHAPTERS.find(c => c.n === n);
    if(!ch || !ch.available) return;
    currentChapterData = ch.data;
    showView('chapterView');
    document.getElementById('backBtn').classList.add('show');
    backAction = goHome;
    rerenderCurrent = () => openChapter(n);
    document.getElementById('topTitle').textContent = `${ch.n}-${L('bob')}: ${L(ch.uz)}`;
    document.getElementById('topSub').textContent = ch.arab;
    renderQoida(ch.data);
    renderJadval(ch.data);
    renderMashq(ch.data);
    switchTab('qoida');
    setActiveNav('navBoblar');
    window.scrollTo(0,0);
  }
  
  function setActiveNav(id){
    ['navBoblar','navLugat','navSozlamalar'].forEach(i => document.getElementById(i).classList.toggle('active', i === id));
  }

  function goHome(){
    showView('homeView');
    document.getElementById('backBtn').classList.remove('show');
    document.getElementById('topTitle').textContent = 'Sarf A2';
    document.getElementById('topSub').textContent = L('Sulosiy mazid — 12 bob');
    rerenderCurrent = renderChapters;
    setActiveNav('navBoblar');
    renderChapters();
    window.scrollTo(0,0);
  }

  // ===== Lug'at =====
  function extractVocab(d){
    const map = new Map(); // ar -> uz (dedupe)
    (d.manolar || []).forEach(m => {
      [...(m.misollar||[]), ...(m.makonGuruh||[]), ...(m.zamonGuruh||[])].forEach(ex => {
        if(ex.ar && ex.uz && !map.has(ex.ar)) map.set(ex.ar, ex.uz);
      });
    });
    ((d.feWaznlariJadvali && d.feWaznlariJadvali.qatorlar) || []).forEach(r => {
      const w = r.mazidMozi || r.mujarrad;
      if(w && r.manoUz && !map.has(w)) map.set(w, r.manoUz);
    });
    return Array.from(map.entries()).map(([ar,uz]) => ({ar,uz}));
  }

  function goLugat(){
    showView('lugatView');
    document.getElementById('backBtn').classList.add('show');
    document.getElementById('topTitle').textContent = L("Lug'at");
    document.getElementById('topSub').textContent = L("Boblar bo'yicha so'zlar");
    backAction = goHome;
    rerenderCurrent = goLugat;
    setActiveNav('navLugat');
    renderLugatBobList();
    window.scrollTo(0,0);
  }

  function renderLugatBobList(){
    const html = CHAPTERS.filter(c => c.available).map(ch => {
      const count = extractVocab(ch.data).length;
      return `<div class="chapter-card available" style="width:100%;margin-bottom:10px;" onclick="openLugatBob(${ch.n})">
        <div class="num">Bob ${ch.n} · ${count} ${L("ta so'z")}</div>
        <div class="arab">${ch.arab}</div>
        <div class="uzname">${L(ch.uz)}</div>
      </div>`;
    }).join('');
    document.getElementById('lugatContent').innerHTML = `<div style="display:flex;flex-direction:column;">${html}</div>`;
  }

  function openLugatBob(n){
    const ch = CHAPTERS.find(c => c.n === n);
    if(!ch) return;
    const words = extractVocab(ch.data);
    document.getElementById('topTitle').textContent = `${L("Lug'at")} — ${ch.n}-${L('bob')}`;
    document.getElementById('topSub').textContent = ch.arab;
    backAction = goLugat;
    rerenderCurrent = () => openLugatBob(n);
    const html = `<div class="card">` + words.map(w =>
      `<div class="example"><span class="ar">${w.ar}</span><span class="uz">${L(w.uz)}</span></div>`
    ).join('') + `</div>`;
    document.getElementById('lugatContent').innerHTML = html;
    window.scrollTo(0,0);
  }
  
  function switchTab(name){
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.panel === name));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
  }
  document.getElementById('tabsBar').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if(t) switchTab(t.dataset.panel);
  });
  
  function renderQoida(d){
    const root = d.mazidHarfi.misol;
    const mujChars = root.mujarrad.split(' ');
    const mazChars = root.mazid.split(' ');
    let diagram = `<div class="root-diagram">
      <div class="stack mujarrad">
        <div class="letters-row" style="display:flex;gap:4px;direction:rtl;">${mujChars.map(c=>`<div class="box">${c}</div>`).join('')}</div>
        <div class="label">${L('MUJARRAD')}</div>
      </div>
      <div class="arrow">←</div>
      <div class="stack mazid">
        <div class="letters-row" style="display:flex;gap:4px;direction:rtl;">${mazChars.map(c=>`<div class="box ${!mujChars.includes(c)?'added':''}">${c}</div>`).join('')}</div>
        <div class="label">${L(d.bobNomi.uz.toUpperCase())}</div>
      </div>
    </div>`;
  
    let html = diagram;
    html += `<div class="card"><h3>${L("Vazn hosil bo'lishi")}</h3>
      <p style="font-size:13px;line-height:1.6;margin:0;">${L(d.mazidHarfi.izoh)}</p>
      <div class="example" style="margin-top:8px;"><span class="ar">${d.mazidHarfi.misol.namuna}</span><span class="uz">${L("Namuna fe'l")}</span></div>
    </div>`;
  
    d.manolar.forEach(m => {
      html += `<div class="card"><h3><span class="num-badge">${m.id}</span>${L(m.sarlavha)}</h3>`;
      if(m.izoh) html += `<div class="note">${L(m.izoh)}</div>`;
      const list = m.misollar || m.makonGuruh || [];
      list.forEach(ex => {
        if(ex.lozim){
          html += `<div class="example"><span class="ar">${ex.lozim.ar} ← ${ex.mutaaddiy.ar}</span><span class="uz">${L(ex.lozim.uz)} → ${L(ex.mutaaddiy.uz)}</span></div>`;
        } else if(ex.ar){
          html += `<div class="example"><span class="ar">${ex.ar}</span><span class="uz">${L(ex.uz || '')}</span></div>`;
        } else if(ex.mazid){
          html += `<div class="example"><span class="ar">${ex.mazid}${ex.mujarrad ? ' ← '+ex.mujarrad : ''}</span><span class="uz">${L(ex.uz || '')}</span></div>`;
        }
      });
      if(m.zamonGuruh){
        html += `<div class="note" style="margin-top:10px;margin-bottom:4px;">${L('Zamon guruhi:')}</div>`;
        m.zamonGuruh.forEach(ex => {
          html += `<div class="example"><span class="ar">${ex.ar}</span><span class="uz">${L(ex.uz)}</span></div>`;
        });
      }
      html += `</div>`;
    });
  
    if(d.aslHolatiJadvali){
      html += `<div class="card"><h3>${L("Asl holat o'zgarishi")}</h3>
        <p style="font-size:13px;line-height:1.6;">${L(d.aslHolatiJadvali.izoh)}</p>
        <div class="note">${L(d.aslHolatiJadvali.qoida)}</div>
      </div>`;
    }
  
    document.getElementById('panel-qoida').innerHTML = html;
  }
  
  function renderJadval(d){
    let html = `<div class="card"><h3>${L(d.feWaznlariJadvali.sarlavha)}</h3>
      <div class="table-scroll"><table class="conj"><thead><tr>
        <th>${L('Nav')}</th><th>${L('Mujarrad')}</th><th>${L('Mazid')}</th><th>Muzore'</th><th>${L('Amr')}</th><th>${L('Masdar')}</th><th>${L("Ma'no")}</th>
      </tr></thead><tbody>`;
    d.feWaznlariJadvali.qatorlar.forEach(r => {
      html += `<tr><td>${L(r.nav)}</td><td class="ar">${r.mujarrad}</td><td class="ar">${r.mazidMozi}</td><td class="ar">${r.muzore}</td><td class="ar">${r.amr}</td><td class="ar">${r.masdar}</td><td style="font-size:10.5px;">${L(r.manoUz)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
  
    html += `<div class="card"><h3>${L(d.nafiyNahiyJadvali.sarlavha)}</h3>
      <div class="table-scroll"><table class="conj"><thead><tr>
        <th>${L('Nav')}</th><th>${L('Nafiy')}</th><th>${L('Nahiy')}</th><th>${L('Jahd')}</th><th>${L("Amr g'oib")}</th>
      </tr></thead><tbody>`;
    d.nafiyNahiyJadvali.qatorlar.forEach(r => {
      html += `<tr><td>${L(r.nav)}</td><td class="ar">${r.nafiy}</td><td class="ar">${r.nahiy}</td><td class="ar">${r.jahd}</td><td class="ar">${r.amrGoib}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    if(d.nafiyNahiyJadvali.izoh) html += `<div class="note">${L(d.nafiyNahiyJadvali.izoh)}</div>`;
    html += `</div>`;
  
    if(d.tuslashNamunalari){
      html += `<div class="card"><h3>${L("14 sig'ada tuslash namunalari")}</h3>`;
      d.tuslashNamunalari.misolFelar.forEach(f => {
        html += `<div class="example"><span class="ar">${f}</span></div>`;
      });
      html += `</div>`;
    }
  
    document.getElementById('panel-jadval').innerHTML = html;
  }
  
  // ===== Test tizimi =====
  let quizState = null; // {questions, current, score, answered}
  let mashqFilter = 'hammasi'; // 'hammasi' | 'bilgan' | 'bilmagan' | 'none'

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  // --- Savol natijalarini saqlash (bilgan/bilmagan/belgilanmagan) ---
  const STATUS_KEY = 'sarfA2QuizStatus';
  function loadQuizStatus(){
    try {
      const raw = localStorage.getItem(STATUS_KEY);
      if(raw) return JSON.parse(raw);
    } catch(e){}
    return {};
  }
  const QUIZ_STATUS = loadQuizStatus();
  function saveQuizStatus(){
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(QUIZ_STATUS)); } catch(e){}
  }
  function getQStatus(id){ return QUIZ_STATUS[id] || 'none'; } // 'bilgan' | 'bilmagan' | 'none'
  function setQStatus(id, val){
    if(!id) return;
    QUIZ_STATUS[id] = val;
    saveQuizStatus();
  }

  const FIELD_LABELS = {
    muzore: "muzore' (hozirgi-kelasi zamon)",
    amr: "amr (buyruq)",
    masdar: "masdar",
    foil: "ismi foil"
  };
  const ALL_FIELDS = ['muzore','amr','masdar','foil'];

  function buildQuizPool(d){
    const pool = [];
    const chNum = (CHAPTERS.find(c => c.data === d) || {}).n || 0;
    const fw = (d.feWaznlariJadvali && d.feWaznlariJadvali.qatorlar) || [];

    // 1) Fe'l shakllarini farqlash savollari
    fw.forEach(row => {
      const citation = row.mazidMozi || row.mujarrad;
      if(!citation) return;
      ALL_FIELDS.forEach(target => {
        const answer = row[target];
        if(!answer || answer === '-') return;
        const distractorFields = ALL_FIELDS.filter(f => f !== target);
        const distractors = distractorFields.map(f => row[f]).filter(v => v && v !== '-');
        if(distractors.length < 3) return;
        pool.push({
          id: `${chNum}|1|${citation}|${target}`,
          q: L(`«${citation}» fe'lining ${FIELD_LABELS[target]} shakli qaysi?`),
          answer,
          options: [answer, ...distractors]
        });
      });
    });

    // 2) Qoida: vazn qanday harf(lar) bilan hosil bo'ladi
    if(d.mazidHarfi && d.mazidHarfi.harf){
      const otherHarflar = [...new Set(
        CHAPTERS.filter(c => c.available && c.data.mazidHarfi && c.data !== d)
          .map(c => c.data.mazidHarfi.harf)
      )];
      if(otherHarflar.length >= 3){
        const wrongs = shuffle(otherHarflar).slice(0,3);
        pool.push({
          id: `${chNum}|2|harf`,
          q: L(`«${d.bobNomi.arab}» vazni qanday harf(lar) orttirilib hosil bo'ladi?`),
          answer: L(d.mazidHarfi.harf),
          options: [d.mazidHarfi.harf, ...wrongs].map(L)
        });
      }
    }

    // 3) Qoida: ibora qaysi ma'no toifasiga oid
    const categories = (d.manolar || []).filter(m => m.sarlavha);
    if(categories.length >= 4){
      const sarlavhalar = categories.map(m => m.sarlavha);
      categories.forEach(m => {
        const ex = (m.misollar || m.makonGuruh || [])[0];
        if(!ex || !ex.ar) return;
        const wrongs = shuffle(sarlavhalar.filter(s => s !== m.sarlavha)).slice(0,3);
        if(wrongs.length < 3) return;
        pool.push({
          id: `${chNum}|3|${m.sarlavha}`,
          q: L(`«${ex.ar}» iborasi qaysi ma'no toifasiga misol bo'ladi?`),
          answer: L(m.sarlavha),
          options: [m.sarlavha, ...wrongs].map(L)
        });
      });
    }

    return pool;
  }

  let quizPoolCache = [];
  let quizFilteredCache = [];

  const FILTER_LABELS = {
    hammasi: "Hammasi",
    bilgan: "Bilganlar",
    bilmagan: "Bilmaganlar",
    none: "Belgilanmaganlar"
  };

  function filterPool(pool, key){
    if(key === 'hammasi') return pool;
    return pool.filter(p => getQStatus(p.id) === key);
  }

  window.selectMashqFilter = function(key){
    mashqFilter = key;
    renderMashqBody();
  };

  function renderMashq(d){
    quizPoolCache = buildQuizPool(d);
    mashqFilter = 'hammasi';
    renderMashqBody();
  }

  function renderMashqBody(){
    const pool = quizPoolCache;
    if(pool.length < 3){
      document.getElementById('panel-mashq').innerHTML = `
        <div class="empty-state" style="padding-top:60px;">
          <div style="font-size:36px;margin-bottom:10px;">🧩</div>
          <div style="font-weight:700;color:var(--forest-deep);margin-bottom:6px;">${L('Bu bob uchun test hali yetarli emas')}</div>
        </div>`;
      return;
    }
    const counts = {
      hammasi: pool.length,
      bilgan: pool.filter(p => getQStatus(p.id) === 'bilgan').length,
      bilmagan: pool.filter(p => getQStatus(p.id) === 'bilmagan').length,
      none: pool.filter(p => getQStatus(p.id) === 'none').length
    };
    const filtered = filterPool(pool, mashqFilter);
    quizFilteredCache = filtered;

    const chips = ['hammasi','bilgan','bilmagan','none'].map(key => {
      const active = key === mashqFilter;
      return `<div onclick="selectMashqFilter('${key}')"
        style="border:1.5px solid ${active ? 'var(--forest)' : 'var(--line)'};background:${active ? 'var(--forest)' : 'transparent'};color:${active ? '#fff' : 'var(--forest-deep)'};border-radius:10px;padding:7px 12px;cursor:pointer;font-size:12px;font-weight:700;white-space:nowrap;">
        ${L(FILTER_LABELS[key])} (${counts[key]})
      </div>`;
    }).join('');

    let presetsHtml;
    if(filtered.length === 0){
      presetsHtml = `<div class="empty-state" style="padding:20px 0 0;">${L("Bu toifada savol yo'q")}</div>`;
    } else {
      const presets = [...new Set([5,10,15,20,filtered.length].filter(n => n>0 && n<=filtered.length))].sort((a,b)=>a-b);
      presetsHtml = `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px;">
        ${presets.map(n => `
          <div onclick="startQuiz(${n})" style="border:1.5px solid var(--line);border-radius:10px;padding:9px 16px;cursor:pointer;font-size:13px;font-weight:700;color:var(--forest-deep);">
            ${n === filtered.length ? `${L('Barchasi')} (${n})` : n}
          </div>`).join('')}
      </div>`;
    }

    document.getElementById('panel-mashq').innerHTML = `
      <div class="card" style="text-align:center;padding:22px 16px;">
        <div style="font-size:34px;margin-bottom:6px;">📝</div>
        <h3 style="margin-bottom:10px;">${L('Test tayyor')}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;">${chips}</div>
        <p style="color:var(--muted);font-size:12.5px;margin:14px 0 0;">${L('Nechtasini yechmoqchisiz?')}</p>
        ${presetsHtml}
      </div>`;
  }

  window.startQuiz = function(n){
    const picked = shuffle(quizFilteredCache).slice(0, n);
    const questions = picked.map(item => ({
      id: item.id,
      q: item.q,
      options: shuffle(item.options),
      answer: item.answer
    }));
    quizState = { questions, current:0, score:0, answered:false };
    renderQuizQuestion();
  };

  function renderQuizQuestion(){
    const s = quizState;
    if(!s) return;
    if(s.current >= s.questions.length){
      document.getElementById('panel-mashq').innerHTML = `
        <div class="card" style="text-align:center;padding:30px 16px;">
          <div style="font-size:36px;margin-bottom:8px;">🎉</div>
          <h3 style="margin-bottom:6px;">${L('Test yakunlandi!')}</h3>
          <p style="font-size:14px;color:var(--muted);margin:0 0 16px;">${L('Natija')}: <b style="color:var(--forest-deep);">${s.score} / ${s.questions.length}</b></p>
          <div class="tab" style="display:inline-block;background:var(--forest);color:#fff;border-radius:8px;padding:9px 22px;cursor:pointer;border:none;font-size:13px;" onclick="restartQuiz()">${L('Qayt
