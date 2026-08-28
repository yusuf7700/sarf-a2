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
  
  const VIEWS = ['homeView','chapterView','lugatView','natijalarView','sozlamalarView'];
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
    ['navBoblar','navLugat','navNatijalar','navSozlamalar'].forEach(i => document.getElementById(i).classList.toggle('active', i === id));
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

  // ===== Natijalar (Firebase) =====
  function goNatijalar(){
    showView('natijalarView');
    document.getElementById('backBtn').classList.add('show');
    document.getElementById('topTitle').textContent = L('Natijalar');
    document.getElementById('topSub').textContent = '';
    backAction = goHome;
    rerenderCurrent = goNatijalar;
    setActiveNav('navNatijalar');
    if(firebaseReady || currentUser){
      renderNatijalar();
    } else {
      document.getElementById('natijalarContent').innerHTML = `
        <div class="empty-state" style="padding-top:60px;">${L('Yuklanmoqda...')}</div>`;
      ensureFirebase().then(() => renderNatijalar());
    }
    window.scrollTo(0,0);
  }

  function renderNatijalar(){
    const box = document.getElementById('natijalarContent');
    if(!box) return;

    if(!currentUser){
      box.innerHTML = `
        <div class="card" style="text-align:center;padding:28px 16px;">
          <div style="font-size:36px;margin-bottom:10px;">📊</div>
          <h3 style="margin-bottom:6px;">${L('Natijalaringizni saqlang')}</h3>
          <p style="color:var(--muted);font-size:13px;margin:0 0 18px;">${L("Kirsangiz, qaysi savollarni bilganingiz boshqa qurilmada ham eslab qolinadi")}</p>
          <div onclick="loginGoogle()" style="background:var(--forest);color:#fff;border-radius:10px;padding:12px;cursor:pointer;font-weight:700;font-size:14px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span>🔵</span>${L('Google bilan kirish')}
          </div>
          <div onclick="loginAnonStart()" style="border:1.5px solid var(--line);color:var(--forest-deep);border-radius:10px;padding:12px;cursor:pointer;font-weight:700;font-size:14px;">
            👤 ${L('Ism bilan (anonim) kirish')}
          </div>
        </div>`;
      return;
    }

    const rows = CHAPTERS.filter(c => c.available).map(ch => {
      const pool = buildQuizPool(ch.data);
      const bilgan = pool.filter(p => getQStatus(p.id) === 'bilgan').length;
      const bilmagan = pool.filter(p => getQStatus(p.id) === 'bilmagan').length;
      const none = pool.length - bilgan - bilmagan;
      const pct = pool.length ? Math.round((bilgan/pool.length)*100) : 0;
      return `<div class="card" style="padding:14px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-weight:700;color:var(--forest-deep);font-size:13.5px;">${ch.n}-${L('bob')}: ${L(ch.uz)}</div>
          <div style="font-size:12px;color:var(--muted);">${pct}%</div>
        </div>
        <div style="height:7px;border-radius:5px;background:var(--paper-2);overflow:hidden;display:flex;">
          <div style="width:${pool.length? bilgan/pool.length*100:0}%;background:#2f8a4e;"></div>
          <div style="width:${pool.length? bilmagan/pool.length*100:0}%;background:#c65959;"></div>
        </div>
        <div style="display:flex;gap:14px;margin-top:8px;font-size:11px;color:var(--muted);">
          <span>🟢 ${L('Bilgan')}: ${bilgan}</span>
          <span>🔴 ${L('Bilmagan')}: ${bilmagan}</span>
          <span>⚪ ${L('Belgilanmagan')}: ${none}</span>
        </div>
      </div>`;
    }).join('');

    box.innerHTML = `
      <div class="card" style="display:flex;align-items:center;gap:12px;padding:14px 16px;margin-bottom:4px;">
        <div style="width:38px;height:38px;border-radius:50%;background:var(--forest);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0;">
          ${(currentUser.displayName || '?').charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:var(--forest-deep);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${currentUser.displayName || L('Foydalanuvchi')}</div>
          <div style="font-size:11.5px;color:var(--muted);">${currentUser.isAnonymous ? L('Anonim hisob') : L('Google hisobi')}</div>
        </div>
        <div onclick="logoutUser()" style="font-size:11.5px;color:#c65959;font-weight:700;cursor:pointer;white-space:nowrap;">${L('Chiqish')}</div>
      </div>
      ${rows}`;
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
  let mashqFilter = new Set(['hammasi']); // Set: 'hammasi' | 'bilgan' | 'bilmagan' | 'none' (bir nechtasi birga bo'lishi mumkin)

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
    pushStatusToCloud();
  }

  // ===== Firebase: kirish va bulutga sinxronlash =====
  let currentUser = null;
  let cloudSyncTimer = null;

  function pushStatusToCloud(){
    if(!currentUser || !db) return;
    // Bir necha javob ketma-ket kelsa, ortiqcha yozuvni oldini olish uchun kechiktirib yuboramiz
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => {
      db.collection('users').doc(currentUser.uid).set({
        displayName: currentUser.displayName || 'Foydalanuvchi',
        quizStatus: JSON.stringify(QUIZ_STATUS),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(e => console.warn('Sinxronlash xatosi:', e));
    }, 600);
  }

  function pullStatusFromCloud(){
    if(!currentUser || !db) return Promise.resolve();
    return db.collection('users').doc(currentUser.uid).get().then(snap => {
      if(!snap.exists) return;
      const remote = snap.data();
      if(remote && remote.quizStatus){
        try {
          const remoteStatus = JSON.parse(remote.quizStatus);
          Object.assign(QUIZ_STATUS, remoteStatus); // masofaviy ma'lumot ustunroq (boshqa qurilmada ishlangan bo'lishi mumkin)
          saveQuizStatus();
        } catch(e){}
      }
    }).catch(e => console.warn('Yuklab olish xatosi:', e));
  }

  window.loginGoogle = function(){
    if(!auth){ alert(L("Internet aloqasi yo'q, keyinroq urinib ko'ring")); return; }
    auth.signInWithPopup(googleProvider).catch(err => {
      alert(L("Kirishda xatolik: ") + err.message);
    });
  };

  window.loginAnonStart = function(){
    document.getElementById('natijalarContent').innerHTML = `
      <div class="card" style="text-align:center;padding:26px 16px;">
        <div style="font-size:32px;margin-bottom:10px;">👤</div>
        <h3 style="margin-bottom:12px;">${L('Ismingizni kiriting')}</h3>
        <input id="anonNameInput" type="text" placeholder="${L('Masalan: Yusuf')}" maxlength="30"
          style="width:100%;box-sizing:border-box;border:1.5px solid var(--line);border-radius:10px;padding:11px 13px;font-size:14px;font-family:'Manrope',sans-serif;text-align:center;margin-bottom:12px;">
        <div onclick="loginAnonConfirm()" style="background:var(--forest);color:#fff;border-radius:10px;padding:11px;cursor:pointer;font-weight:700;font-size:14px;">
          ${L('Kirish')}
        </div>
      </div>`;
    setTimeout(() => { const i
