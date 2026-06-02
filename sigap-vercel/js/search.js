'use strict';
let _sTimer=null, _sRes=[], _sIdx=-1;

function onSearchInput(q) {
  document.getElementById('hs-clear').style.display = q?'flex':'none';
  if (q.length<2){ hideDd(); return; }
  clearTimeout(_sTimer);
  _sTimer = setTimeout(()=>runSearch(q), 320);
}

async function runSearch(q) {
  const dd = document.getElementById('search-dd');
  dd.innerHTML = '<div class="sd-loading">⏳ Mencari…</div>';
  dd.style.display = 'block';
  _sRes = []; _sIdx = -1;

  try {
    const p = new URLSearchParams({
      q: q+' Surabaya', format:'json', addressdetails:1,
      limit:8, countrycodes:'id',
      viewbox:'112.65,-7.35,112.85,-7.20', bounded:0,
    });
    const data = await (await fetch(
      `https://nominatim.openstreetmap.org/search?${p}`,
      {headers:{'Accept-Language':'id','User-Agent':'SiGAP/1.0'}}
    )).json();
    _sRes = data;
    if (!data.length){ dd.innerHTML='<div class="sd-none">Tidak ditemukan</div>'; return; }

    const jalan=[], tempat=[], area=[];
    data.forEach(d=>{
      const t=d.type;
      if (['road','street','residential','tertiary','path','footway','primary','secondary','motorway'].includes(t)) jalan.push(d);
      else if (['house','amenity','building','shop','office'].includes(t)||d.address?.house_number) tempat.push(d);
      else area.push(d);
    });

    let html='';
    if (jalan.length)  html+=`<div class="sd-sec">Jalan</div>`  +jalan.map(d=>sdRow(d,'🛣️','jalan')).join('');
    if (tempat.length) html+=`<div class="sd-sec">Tempat</div>` +tempat.map(d=>sdRow(d,'📍','tempat')).join('');
    if (area.length)   html+=`<div class="sd-sec">Wilayah</div>`+area.map(d=>sdRow(d,'🏘️','area')).join('');
    dd.innerHTML = html;
  } catch { dd.innerHTML='<div class="sd-none">Gagal terhubung</div>'; }
}

function sdRow(d, ico, type) {
  const a=d.address||{};
  const main = d.name || a.road || d.display_name.split(',')[0];
  const hn   = a.house_number?`No. ${a.house_number}, `:'';
  const sub  = (hn+(a.road||'')+(a.suburb?', '+a.suburb:'')).trim();
  const badge= {jalan:'🛣️ Jalan',tempat:'📍 Tempat',area:'🏘️ Wilayah'}[type];
  return `<div class="sd-item" onclick="goTo(${d.lat},${d.lon},'${main.replace(/'/g,'')}')">
    <span class="sd-ico">${ico}</span>
    <div class="sd-text">
      <div class="sd-main">${main}</div>
      ${sub&&sub!==main?`<div class="sd-sub">${sub}</div>`:''}
    </div>
    <span class="sd-badge">${badge}</span>
  </div>`;
}

function onSearchKey(e) {
  const items = document.querySelectorAll('.sd-item');
  if (e.key==='ArrowDown'){ _sIdx=Math.min(_sIdx+1,items.length-1); highlightSd(items); e.preventDefault(); }
  else if(e.key==='ArrowUp'){ _sIdx=Math.max(_sIdx-1,0); highlightSd(items); e.preventDefault(); }
  else if(e.key==='Enter'){ if(_sIdx>=0)items[_sIdx]?.click(); else if(_sRes[0]){const d=_sRes[0];goTo(d.lat,d.lon,d.display_name.split(',')[0]);} e.preventDefault(); }
  else if(e.key==='Escape') clearSearch();
}

function highlightSd(items){ items.forEach((el,i)=>el.classList.toggle('sd-active',i===_sIdx)); }

function goTo(lat,lon,name) {
  map.flyTo([lat,lon],17,{duration:1.2});
  document.getElementById('search-q').value=name;
  hideDd();
  L.popup({className:'sp-popup',maxWidth:220})
    .setLatLng([lat,lon])
    .setContent(`<div>${popHeader('#1e3a5f','📍 '+name,'Hasil Pencarian')}</div>`)
    .openOn(map);
}

function clearSearch() {
  document.getElementById('search-q').value='';
  document.getElementById('hs-clear').style.display='none';
  hideDd(); _sRes=[]; _sIdx=-1;
}

function hideDd() { document.getElementById('search-dd').style.display='none'; }
document.addEventListener('click', e=>{ if(!e.target.closest('.hdr-search-wrap')) hideDd(); });