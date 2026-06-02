let inputMarkers=[], inputLL=null, inputActive=false;

function toggleInputForm() {
  const el = document.getElementById('input-form-wrap');
  el.style.display = el.style.display==='none' ? 'block' : 'none';
}

function startInputPick() {
  if (inputActive) return;
  inputActive = true;
  map.getContainer().classList.add('picking');
  setHint('📍 Klik lokasi di peta');
  map.once('click', e => {
    map.getContainer().classList.remove('picking');
    clearHint();
    inputActive = false;
    inputLL = e.latlng;
    const btn = document.getElementById('if-pick-btn');
    btn.classList.add('picked');
    document.getElementById('if-loc-txt').textContent =
      `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    if(window._prevMk) map.removeLayer(window._prevMk);
    window._prevMk = L.circleMarker(e.latlng, {
      radius:9, fillColor:'#e8192c', color:'#fff', weight:2.5, fillOpacity:.85
    }).addTo(map).bindPopup('📍 Posisi baru').openPopup();
  });
}

function cancelInput() {
  document.getElementById('input-form-wrap').style.display='none';
  document.getElementById('if-pick-btn').classList.remove('picked');
  document.getElementById('if-loc-txt').textContent='Pilih Lokasi di Peta';
  if(window._prevMk){map.removeLayer(window._prevMk);window._prevMk=null;}
  inputLL=null;
}

async function submitData() {
  if (!inputLL) { alert('Pilih lokasi di peta terlebih dahulu.'); return; }
  const jenis = document.getElementById('f-jenis').value;
  const nama  = document.getElementById('f-nama').value || jenis;
  const kond  = document.getElementById('f-kondisi').value;
  const cat   = document.getElementById('f-cat').value;

  const cmap = {tandon:'#117a8b',hydrant:'#e8192c',sumur:'#1a5276',lainnya:'#7f8c8d'};
  const tmap = {tandon:'tandon',hydrant:'hydrant',sumur:'sumur',lainnya:'tandon'};
  if(window._prevMk) map.removeLayer(window._prevMk);

  const mk = L.marker(inputLL, {icon:mkIcon(tmap[jenis],cmap[jenis])})
    .bindPopup(`<div><div class="pop-header" style="background:${cmap[jenis]}">
        <div><div class="pop-title" style="color:white">${nama}</div>
        <div class="pop-subtitle">${jenis.toUpperCase()}</div></div>
      </div>
      <div class="pop-body">
        <div class="pop-row"><span class="pop-key">Kondisi</span>
          <span class="pop-val"><span class="pop-status pop-status--${/baik/i.test(kond)?'baik':'rusak'}">${kond}</span></span></div>
        ${cat?`<div class="pop-row"><span class="pop-key">Catatan</span><span class="pop-val">${cat}</span></div>`:''}
        <div class="pop-row"><span class="pop-key">Status</span><span class="pop-val" style="font-size:10px;color:#aaa">Input PMK</span></div>
      </div></div>`, {className:'sp-popup',maxWidth:220})
    .addTo(map).openPopup();

  inputMarkers.push({mk,jenis,nama,kond,cat,lat:inputLL.lat,lng:inputLL.lng});
  const el = document.getElementById('sv-input');
  if(el){ el.textContent=inputMarkers.length; el.classList.add('on'); }

  if(['tandon','hydrant','sumur'].includes(jenis))
    allSources.push({latlng:inputLL, label:nama, props:{kondisi:kond}, layerId:'input'});

  const saved = await saveWFST(jenis,nama,kond,cat,inputLL);
  if(!saved) console.warn('[SiGAP] WFS-T gagal, data hanya tersimpan lokal.');

  cancelInput();
  renderInputMini();
}

async function saveWFST(jenis,nama,kondisi,catatan,ll) {
  const layerTarget = {
    tandon:'tandon_keputih', hydrant:'hydrant_aktif',
    sumur:'sumur_aktif', lainnya:'tandon_keputih',
  }[jenis];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"
  xmlns:gml="http://www.opengis.net/gml"
  xmlns:pmk="${CONFIG.geoserver.workspace}"
  service="WFS" version="1.0.0">
  <wfs:Insert>
    <${layerTarget}>
      <pmk:geom><gml:Point srsName="EPSG:4326">
        <gml:coordinates>${ll.lng},${ll.lat}</gml:coordinates>
      </gml:Point></pmk:geom>
      <pmk:nama>${nama}</pmk:nama>
      <pmk:kondisi>${kondisi}</pmk:kondisi>
      <pmk:catatan>${catatan}</pmk:catatan>
      <pmk:input_by>PMK Lapangan</pmk:input_by>
      <pmk:input_at>${new Date().toISOString()}</pmk:input_at>
    </${layerTarget}>
  </wfs:Insert>
</wfs:Transaction>`;
  try {
    const r = await fetch(`${CONFIG.geoserver.url}/wfs`, {
      method:'POST', headers:{'Content-Type':'text/xml'}, body:xml,
    });
    const t = await r.text();
    return t.includes('totalInserted>1');
  } catch { return false; }
}

function renderInputMini() {
  const el = document.getElementById('input-mini-list');
  if(!el) return;
  const ico = {tandon:'🛢️',hydrant:'🔴',sumur:'💧',lainnya:'📍'};
  el.innerHTML = inputMarkers.map((m,i)=>`
    <div class="imli">
      <span class="imli-ico">${ico[m.jenis]||'📍'}</span>
      <div class="imli-info">
        <div class="imli-name">${m.nama}</div>
        <div class="imli-sub">${m.kond}</div>
      </div>
      <button class="imli-del" onclick="removeInput(${i})" title="Hapus">✕</button>
    </div>`).join('') || '';
}

function removeInput(i) {
  map.removeLayer(inputMarkers[i].mk);
  inputMarkers.splice(i,1);
  const el=document.getElementById('sv-input');
  if(el) el.textContent=inputMarkers.length;
  renderInputMini();
}