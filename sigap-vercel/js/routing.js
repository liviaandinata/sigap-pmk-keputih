'use strict';

let routeLines = [], fireLL = null, kumpulLL = null;
let activeRouteKey = null;

// ─────────────────────────────────────────────────────────────
// FIRE PICKING
// ─────────────────────────────────────────────────────────────
function startFire() {
  document.getElementById('fire-input-modal').style.display = 'flex';
}

function closeFireModal() {
  document.getElementById('fire-input-modal').style.display = 'none';
}

function pickFireFromMap() {
  closeFireModal();
  setHint('🔥 Klik lokasi kebakaran di peta');
  map.getContainer().classList.add('picking');
  document.getElementById('btn-fire').classList.add('active');
  map.once('click', e => {
    map.getContainer().classList.remove('picking');
    clearHint();
    document.getElementById('btn-fire').classList.remove('active');
    onFirePicked(e.latlng);
  });
}

function confirmFireCoord() {
  const lat = parseFloat(document.getElementById('fi-lat').value);
  const lng = parseFloat(document.getElementById('fi-lng').value);
  if (isNaN(lat) || isNaN(lng)) { alert('Koordinat tidak valid.'); return; }
  closeFireModal();
  onFirePicked(L.latLng(lat, lng));
}

function onFirePicked(ll) {
  fireLL = ll;
  if (window._fireMk) map.removeLayer(window._fireMk);
  window._fireMk = L.marker(ll, { icon: ICONS.fire() })
    .bindPopup(
      popHeader('#ef4444', '🔥 Titik Kebakaran Aktif', 'Lokasi Darurat')
      + `<div class="pop-body">${popRow('Koordinat', `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`, true)}</div>`,
      { className: 'sp-popup', maxWidth: 220 }
    ).addTo(map).openPopup();
  clearAllRoutes();
  showRouteMenu();
}

// ─────────────────────────────────────────────────────────────
// TITIK KUMPUL MANUAL
// ─────────────────────────────────────────────────────────────
function startKumpul() {
  setHint('🟢 Klik titik kumpul di peta');
  map.getContainer().classList.add('picking');
  document.getElementById('btn-kumpul').classList.add('active');
  map.once('click', e => {
    map.getContainer().classList.remove('picking');
    clearHint();
    document.getElementById('btn-kumpul').classList.remove('active');
    onKumpulPicked(e.latlng);
  });
}

function onKumpulPicked(ll) {
  kumpulLL = ll;
  if (window._kumpulMk) map.removeLayer(window._kumpulMk);
  window._kumpulMk = L.marker(ll, { icon: ICONS.kumpul() })
    .bindPopup(
      popHeader('#16a34a', '🟢 Titik Kumpul Manual', 'Titik Evakuasi')
      + `<div class="pop-body">${popRow('Koordinat', `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`, true)}</div>`,
      { className: 'sp-popup', maxWidth: 200 }
    ).addTo(map).openPopup();
  window._evPoints = window._evPoints || [];
  window._evPoints = window._evPoints.filter(e => e.layerId !== 'manual');
  window._evPoints.push({ latlng: ll, props: { nama: 'Titik Kumpul Manual' }, layerId: 'manual' });
}

// ─────────────────────────────────────────────────────────────
// MENU RUTE
// ─────────────────────────────────────────────────────────────
function showRouteMenu() {
  const scRute = document.getElementById('sc-rute');
  const cards  = document.getElementById('rute-cards');
  scRute.style.display = 'block';

  cards.innerHTML = `
    <div class="rute-menu">
      <div class="rute-menu-title">Pilih rute yang ingin ditampilkan:</div>

      <div class="rute-menu-group">
        <div class="rute-menu-group-label">🚒 PMK → Titik Kebakaran</div>
        <button class="rute-menu-btn" onclick="showRoute('pmk_mobil')">
          <span class="rmb-icon" style="background:#16a34a">🚒</span>
          <div class="rmb-txt">
            <div class="rmb-title">Jalur Aksesibel Mobil Damkar</div>
            <div class="rmb-sub">Hanya jalan lebar ≥ 3.5m</div>
          </div>
          <span class="rmb-arrow">›</span>
        </button>
        <button class="rute-menu-btn" onclick="showRoute('pmk_semua')">
          <span class="rmb-icon" style="background:#6366f1">🛵</span>
          <div class="rmb-txt">
            <div class="rmb-title">Semua Jaringan Jalan</div>
            <div class="rmb-sub">Termasuk gang sempit (motor PMK)</div>
          </div>
          <span class="rmb-arrow">›</span>
        </button>
      </div>

      <div class="rute-menu-group">
        <div class="rute-menu-group-label">💧 TKP → Sumber Air</div>
        <button class="rute-menu-btn" onclick="showRoute('sumber_air')">
          <span class="rmb-icon" style="background:#0891b2">💧</span>
          <div class="rmb-txt">
            <div class="rmb-title">Sumber Air Terdekat</div>
            <div class="rmb-sub">Sungai / danau / tandon air</div>
          </div>
          <span class="rmb-arrow">›</span>
        </button>
      </div>

      <div class="rute-menu-group">
        <div class="rute-menu-group-label">🟢 TKP → Evakuasi</div>
        <button class="rute-menu-btn" onclick="showRoute('evakuasi')">
          <span class="rmb-icon" style="background:#16a34a">🟢</span>
          <div class="rmb-txt">
            <div class="rmb-title">Titik Evakuasi Terdekat</div>
            <div class="rmb-sub">Titik kumpul warga terdekat</div>
          </div>
          <span class="rmb-arrow">›</span>
        </button>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
// SHOW ROUTE — 1 rute sesuai pilihan
// ─────────────────────────────────────────────────────────────
async function showRoute(key) {
  if (!fireLL) return;
  clearAllRoutes();
  activeRouteKey = key;

  const cards   = document.getElementById('rute-cards');
  const backBtn = `<button class="rute-back-btn" onclick="clearAllRoutes();showRouteMenu()">
    ‹ Pilih Rute Lain
  </button>`;

  cards.innerHTML = backBtn + `<div class="rc-loading"><div class="rc-loading-spinner"></div>Menghitung rute…</div>`;

  // ── PMK → TKP ──────────────────────────────────────────────
  if (key === 'pmk_mobil' || key === 'pmk_semua') {
    const color = key === 'pmk_mobil' ? '#16a34a' : '#6366f1';
    const icon  = key === 'pmk_mobil' ? '🚒' : '🛵';
    const label = key === 'pmk_mobil' ? 'Jalur Aksesibel Mobil Damkar' : 'Semua Jaringan Jalan';

    if (!window._pmkLL) {
      cards.innerHTML = backBtn + '<div class="rc-warn">⚠️ Koordinat Pos PMK belum diset di config.js</div>';
      return;
    }
    const r = await routeOSRM(window._pmkLL, fireLL);
    if (r) {
      drawPolyline(r.pts, color, false);
      fitRouteBounds();
      cards.innerHTML = backBtn + buildCard('pmk', color, icon,
        'PMK → Titik Kebakaran', r.km, r.mn, label, r.steps);
    } else {
      cards.innerHTML = backBtn + '<div class="rc-warn">⚠️ Rute tidak dapat dihitung. Cek koneksi internet.</div>';
    }

  // ── TKP → Sumber Air (sungai/danau/tandon) ─────────────────
  } else if (key === 'sumber_air') {
    const near = findNearest(fireLL, ['sumber_air', 'tandon_keputih']);
    if (!near) {
      cards.innerHTML = backBtn + '<div class="rc-warn">⚠️ Tidak ada data sumber air di GeoServer.</div>';
      return;
    }
    const r = await routeOSRM(fireLL, near.latlng);
    if (r) {
      drawPolyline(r.pts, '#0891b2', false);
      addDestMarker(near.latlng, '#0891b2', '💧');
      fitRouteBounds();
      const jenisLabel = near.id === 'tandon_keputih' ? 'Tandon Air'
        : near.id === 'sumber_air' ? 'Sumber Air (Sungai/Danau)'
        : near.label;
      cards.innerHTML = backBtn + buildCard('sumber_air', '#0891b2', '💧',
        'TKP → Sumber Air Terdekat', r.km, r.mn,
        `${jenisLabel}${near.props?.nama ? ' — ' + near.props.nama : ''} · ±${(near.dist/1000).toFixed(2)} km`,
        r.steps);
    } else {
      cards.innerHTML = backBtn + '<div class="rc-warn">⚠️ Rute tidak dapat dihitung.</div>';
    }

  // ── TKP → Evakuasi ─────────────────────────────────────────
  } else if (key === 'evakuasi') {
    const evPts = window._evPoints || [];
    if (!evPts.length) {
      cards.innerHTML = backBtn + `<div class="rc-info">💡 Belum ada data titik evakuasi.
        <button class="rc-btn-sm" onclick="startKumpul()">Pilih Manual di Peta</button>
      </div>`;
      return;
    }
    let bestEv = null, bestDist = Infinity;
    evPts.forEach(ev => {
      const d = fireLL.distanceTo(ev.latlng);
      if (d < bestDist) { bestDist = d; bestEv = ev; }
    });
    const r = await routeOSRM(fireLL, bestEv.latlng);
    if (r) {
      drawPolyline(r.pts, '#16a34a', true);
      addDestMarker(bestEv.latlng, '#16a34a', '🟢');
      fitRouteBounds();
      cards.innerHTML = backBtn + buildCard('evakuasi', '#16a34a', '🟢',
        'TKP → Titik Evakuasi Terdekat', r.km, r.mn,
        `${bestEv.props?.nama || 'Titik Evakuasi'} · ±${(bestDist/1000).toFixed(2)} km`,
        r.steps);
    } else {
      cards.innerHTML = backBtn + '<div class="rc-warn">⚠️ Rute tidak dapat dihitung.</div>';
    }
  }
}

// ─────────────────────────────────────────────────────────────
// OSRM ROUTING
// ─────────────────────────────────────────────────────────────
async function routeOSRM(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/`
      + `${from.lng},${from.lat};${to.lng},${to.lat}`
      + `?overview=full&geometries=geojson&steps=true`;
    const d = await (await fetch(url)).json();
    if (d.code !== 'Ok') throw new Error('no route');
    const rt = d.routes[0];
    return {
      pts:   rt.geometry.coordinates.map(c => [c[1], c[0]]),
      km:    (rt.distance / 1000).toFixed(2),
      mn:    Math.round(rt.duration / 60),
      steps: extractSteps(rt),
    };
  } catch { return null; }
}

function extractSteps(rt) {
  const steps = [];
  rt.legs.forEach(leg => leg.steps.forEach(s => {
    if (!s.maneuver) return;
    steps.push({
      instruction: buildInstruction(s.maneuver, s.name),
      distance:    s.distance,
      maneuver:    s.maneuver.type,
    });
  }));
  return steps;
}

function buildInstruction(maneuver, name) {
  const t = maneuver?.type || '', m = maneuver?.modifier || '', n = name || 'jalan ini';
  const icoMap  = { depart:'🚦', arrive:'🏁', roundabout:'🔄', 'exit roundabout':'↗', 'new name':'↑' };
  const turnMap = { left:'↰', right:'↱', straight:'↑', 'slight left':'↖', 'slight right':'↗', 'sharp left':'↺', 'sharp right':'↻' };
  const ico  = t === 'turn' ? (turnMap[m] || '→') : (icoMap[t] || '→');
  const verb = t === 'depart' ? 'Mulai dari'
    : t === 'arrive'   ? 'Tiba di'
    : t === 'turn'     ? (m.includes('left') ? 'Belok kiri ke' : m.includes('right') ? 'Belok kanan ke' : 'Lurus ke')
    : t === 'roundabout' ? 'Masuk bundaran,'
    : 'Lanjut ke';
  return `${ico} ${verb} <b>${n}</b>`;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function drawPolyline(pts, color, dashed) {
  const ln = L.polyline(pts, {
    color, weight: 5.5, opacity: 0.9,
    dashArray: dashed ? '12 7' : null,
    lineCap: 'round', lineJoin: 'round',
  }).addTo(map);
  routeLines.push(ln);
  return ln;
}

function addDestMarker(latlng, color, emoji) {
  const html = `<div style="background:${color};border:2.5px solid white;border-radius:50%;
    width:30px;height:30px;display:flex;align-items:center;justify-content:center;
    font-size:15px;box-shadow:0 2px 10px rgba(0,0,0,.4)">${emoji}</div>`;
  const mk = L.marker(latlng, {
    icon: L.divIcon({ html, className:'', iconSize:[30,30], iconAnchor:[15,15] }),
    zIndexOffset: 500,
  }).addTo(map);
  routeLines.push(mk);
}

function fitRouteBounds() {
  const pts = routeLines.flatMap(l => {
    try {
      const lls = l.getLatLngs ? l.getLatLngs() : [l.getLatLng()];
      return Array.isArray(lls[0]) ? lls.flat() : lls;
    } catch { return []; }
  }).filter(Boolean);
  if (pts.length > 1) {
    const b = L.latLngBounds(pts);
    if (b.isValid()) map.fitBounds(b.pad(0.15));
  }
}

function findNearest(ll, ids) {
  const candidates = allSources.filter(s => ids.includes(s.id));
  if (!candidates.length) return null;
  let best = null, bd = Infinity;
  candidates.forEach(s => {
    const d = ll.distanceTo(s.latlng);
    if (d < bd) { bd = d; best = s; }
  });
  return best ? { ...best, dist: bd } : null;
}

// ─────────────────────────────────────────────────────────────
// BUILD CARD
// ─────────────────────────────────────────────────────────────
function buildCard(key, color, icon, title, km, mn, desc, steps) {
  const stepsJson = JSON.stringify(steps || [])
    .replace(/"/g,"'").replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<div class="rc" id="rc-${key}">
    <div class="rc-accent" style="background:${color}"></div>
    <div class="rc-head">
      <span class="rc-icon">${icon}</span>
      <div class="rc-info-block">
        <div class="rc-title">${title}</div>
        <div class="rc-desc">${desc}</div>
      </div>
    </div>
    <div class="rc-meta">
      <span class="rc-stat">📏 ${km} km</span>
      <span class="rc-stat">⏱ ${mn} menit</span>
    </div>
    ${steps && steps.length ? `
    <button class="rc-dir-btn" style="color:${color};border-color:${color}33"
      data-steps="${stepsJson}"
      onclick="openDirPanel('${title.replace(/'/g,"\\'").replace(/"/g,'&quot;')}',this)">
      ↗ Petunjuk Arah (${steps.length} langkah)
    </button>` : ''}
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// DIRECTION PANEL
// ─────────────────────────────────────────────────────────────
function openDirPanel(title, btn) {
  let steps = [];
  try {
    steps = JSON.parse(btn.getAttribute('data-steps')
      .replace(/'/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
  } catch(e) { console.warn('[SiGAP] parse steps:', e); }

  document.getElementById('dir-title').textContent = title;
  const wrap = document.getElementById('dir-steps');
  wrap.innerHTML = steps.length
    ? steps.map((s, i) => `
      <div class="dir-step" onclick="this.classList.toggle('active')">
        <div class="dir-step-num">${i + 1}</div>
        <div class="dir-step-body">
          <div class="dir-step-inst">${s.instruction}</div>
          <div class="dir-step-dist">${s.distance < 1000
            ? Math.round(s.distance) + ' m'
            : (s.distance/1000).toFixed(1) + ' km'}</div>
        </div>
      </div>`).join('')
    : '<div style="padding:16px;text-align:center;color:#aaa;font-size:13px">Tidak ada detail petunjuk.</div>';

  document.getElementById('dir-panel').style.display = 'flex';
}

function closeDir() {
  document.getElementById('dir-panel').style.display = 'none';
}

// ─────────────────────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────────────────────
function clearAllRoutes() {
  routeLines.forEach(l => { try { map.removeLayer(l); } catch {} });
  routeLines = [];
}

function resetAll() {
  clearAllRoutes();
  activeRouteKey = null;
  ['_fireMk','_kumpulMk'].forEach(k => {
    if (window[k]) { map.removeLayer(window[k]); window[k] = null; }
  });
  fireLL = null; kumpulLL = null;
  document.getElementById('sc-rute').style.display = 'none';
  document.getElementById('dir-panel').style.display = 'none';
  document.getElementById('rute-cards').innerHTML = '';
  document.getElementById('btn-fire')?.classList.remove('active');
  document.getElementById('btn-kumpul')?.classList.remove('active');
}

function setHint(t)  { const el = document.getElementById('map-hint'); if (el) { el.textContent = t; el.style.display = 'block'; } }
function clearHint() { const el = document.getElementById('map-hint'); if (el) el.style.display = 'none'; }