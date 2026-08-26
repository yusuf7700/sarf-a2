try {
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
        <div class="uzname">${ch.uz}</div>
      </div>
    `).join('');
  }
  
  function openChapter(n){
    const ch = CHAPTERS.find(c => c.n === n);
    if(!ch || !ch.available) return;
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('chapterView').style.display = 'block';
    document.getElementById('backBtn').classList.add('show');
    document.getElementById('topTitle').textContent = `${ch.n}-bob: ${ch.uz}`;
    document.getElementById('topSub').textContent = ch.arab;
    renderQoida(ch.data);
    renderJadval(ch.data);
    renderMashq(ch.data);
    switchTab('qoida');
    window.scrollTo(0,0);
  }
  
  function goHome(){
    document.getElementById('homeView').style.display = 'block';
    document.getElementById('chapterView').style.display = 'none';
    document.getElementById('backBtn').classList.remove('show');
    document.getElementById('topTitle').textContent = 'Sarf A2';
    document.getElementById('topSub').textContent = 'Сулосий мазид — 12 боб';
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
        <div style="display:flex;gap:4px;">${mujChars.map(c=>`<div class="box">${c}</div>`).join('')}</div>
        <div class="label">MUJARRAD</div>
      </div>
      <div class="arrow">←</div>
      <div class="stack mazid">
        <div style="display:flex;gap:4px;">${mazChars.map(c=>`<div class="box ${!mujChars.includes(c)?'added':''}">${c}</div>`).join('')}</div>
        <div class="label">${d.bobNomi.uz.toUpperCase()}</div>
      </div>
    </div>`;
  
    let html = diagram;
    html += `<div class="card"><h3>Vazn hosil bo'lishi</h3>
      <p style="font-size:13px;line-height:1.6;margin:0;">${d.mazidHarfi.izoh}</p>
      <div class="example" style="margin-top:8px;"><span class="ar">${d.mazidHarfi.misol.namuna}</span><span class="uz">Namuna fe'l</span></div>
    </div>`;
  
    d.manolar.forEach(m => {
      html += `<div class="card"><h3><span class="num-badge">${m.id}</span>${m.sarlavha}</h3>`;
      if(m.izoh) html += `<div class="note">${m.izoh}</div>`;
      const list = m.misollar || m.makonGuruh || [];
      list.forEach(ex => {
        if(ex.lozim){
          html += `<div class="example"><span class="ar">${ex.lozim.ar} ← ${ex.mutaaddiy.ar}</span><span class="uz">${ex.lozim.uz} → ${ex.mutaaddiy.uz}</span></div>`;
        } else if(ex.ar){
          html += `<div class="example"><span class="ar">${ex.ar}</span><span class="uz">${ex.uz || ''}</span></div>`;
        } else if(ex.mazid){
          html += `<div class="example"><span class="ar">${ex.mazid}${ex.mujarrad ? ' ← '+ex.mujarrad : ''}</span><span class="uz">${ex.uz || ''}</span></div>`;
        }
      });
      if(m.zamonGuruh){
        html += `<div class="note" style="margin-top:10px;margin-bottom:4px;">Zamon guruhi:</div>`;
        m.zamonGuruh.forEach(ex => {
          html += `<div class="example"><span class="ar">${ex.ar}</span><span class="uz">${ex.uz}</span></div>`;
        });
      }
      html += `</div>`;
    });
  
    if(d.aslHolatiJadvali){
      html += `<div class="card"><h3>Asl holat o'zgarishi</h3>
        <p style="font-size:13px;line-height:1.6;">${d.aslHolatiJadvali.izoh}</p>
        <div class="note">${d.aslHolatiJadvali.qoida}</div>
      </div>`;
    }
  
    document.getElementById('panel-qoida').innerHTML = html;
  }
  
  function renderJadval(d){
    let html = `<div class="card"><h3>${d.feWaznlariJadvali.sarlavha}</h3>
      <div class="table-scroll"><table class="conj"><thead><tr>
        <th>Nav</th><th>Mujarrad</th><th>Mazid</th><th>Muzore'</th><th>Amr</th><th>Masdar</th><th>Ma'no</th>
      </tr></thead><tbody>`;
    d.feWaznlariJadvali.qatorlar.forEach(r => {
      html += `<tr><td>${r.nav}</td><td class="ar">${r.mujarrad}</td><td class="ar">${r.mazidMozi}</td><td class="ar">${r.muzore}</td><td class="ar">${r.amr}</td><td class="ar">${r.masdar}</td><td style="font-size:10.5px;">${r.manoUz}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
  
    html += `<div class="card"><h3>${d.nafiyNahiyJadvali.sarlavha}</h3>
      <div class="table-scroll"><table class="conj"><thead><tr>
        <th>Nav</th><th>Nafiy</th><th>Nahiy</th><th>Jahd</th><th>Amr g'oib</th>
      </tr></thead><tbody>`;
    d.nafiyNahiyJadvali.qatorlar.forEach(r => {
      html += `<tr><td>${r.nav}</td><td class="ar">${r.nafiy}</td><td class="ar">${r.nahiy}</td><td class="ar">${r.jahd}</td><td class="ar">${r.amrGoib}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    if(d.nafiyNahiyJadvali.izoh) html += `<div class="note">${d.nafiyNahiyJadvali.izoh}</div>`;
    html += `</div>`;
  
    if(d.tuslashNamunalari){
      html += `<div class="card"><h3>14 sig'ada tuslash namunalari</h3>`;
      d.tuslashNamunalari.misolFelar.forEach(f => {
        html += `<div class="example"><span class="ar">${f}</span></div>`;
      });
      html += `</div>`;
    }
  
    document.getElementById('panel-jadval').innerHTML = html;
  }
  
  function renderMashq(d){
    if(!d.mashqlar || !d.mashqlar.length){
      document.getElementById('panel-mashq').innerHTML = `<div class="empty-state">Bu bobda alohida mashq berilmagan</div>`;
      return;
    }
    let html = '';
    d.mashqlar.forEach(ex => {
      html += `<div class="card"><h3>${ex.sarlavha}</h3>`;
      if(Array.isArray(ex.felar)){
        ex.felar.forEach(f => {
          const text = typeof f === 'string' ? f : (f.mozi || JSON.stringify(f));
          const meta = typeof f === 'object' && f.nav ? f.nav : '';
          html += `<div class="exercise-item">${text}${meta ? `<div class="exercise-meta">${meta}</div>` : ''}</div>`;
        });
      } else if(typeof ex.felar === 'object'){
        Object.entries(ex.felar).forEach(([nav, f]) => {
          html += `<div class="exercise-item">${f}<div class="exercise-meta">${nav}</div></div>`;
        });
      }
      html += `</div>`;
    });
    document.getElementById('panel-mashq').innerHTML = html;
  }
  
  try {
    renderChapters();
  } catch(err) {
    document.getElementById('chaptersGrid').innerHTML =
      `<div style="grid-column:1/-1;background:#fff3f3;border:1px solid #e0a0a0;border-radius:10px;padding:14px;color:#7a1f1f;font-size:12.5px;white-space:pre-wrap;">
        <b>Xato yuz berdi:</b>\n${err.message}\n\nStack: ${err.stack || ''}
      </div>`;
  }
  
} catch(err) {
  document.addEventListener('DOMContentLoaded', () => {});
  const grid = document.getElementById('chaptersGrid');
  if (grid) {
    grid.innerHTML = `<div style="grid-column:1/-1;background:#fff3f3;border:1px solid #e0a0a0;border-radius:10px;padding:14px;color:#7a1f1f;font-size:12.5px;white-space:pre-wrap;"><b>Xato yuz berdi:</b>\n${err.message}\n\nStack: ${err.stack || ''}</div>`;
  } else {
    alert('Xato: ' + err.message);
  }
      }
