let map, leafletLayers = {}, wfsData = {};
window.allSources = [];
let userLocationMarker = null;

// ── ICONS ──────────────────────────────────────────────────────────
function mkPin(fill, body) {
  const id = 'f' + fill.replace(/[^a-z0-9]/gi, '');
  return `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="${id}" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity=".22"/>
      </filter>
    </defs>
    <path d="M14 1C8.477 1 4 5.477 4 11c0 8.2 10 26 10 26S24 19.2 24 11C24 5.477 19.523 1 14 1z"
      fill="${fill}" stroke="white" stroke-width="1.5" filter="url(#${id})"/>
    ${body}
  </svg>`;
}

const ICONS = {
  tandon: (c) => L.divIcon({
    html: mkPin(c || '#0891b2', `
      <rect x="9" y="7.5" width="10" height="8" rx="1.5" fill="white" opacity=".92"/>
      <path d="M9 11Q14 9 19 11" stroke="${c||'#0891b2'}" stroke-width="1.1" fill="none"/>
      <rect x="12" y="15.5" width="4" height="1.8" fill="white" opacity=".7"/>`),
    className: '', iconSize: [28,38], iconAnchor: [14,37], popupAnchor: [0,-34],
  }),

  hydrantRek: (c, tipe) => L.divIcon({
    html: tipe === 'Outlet'
      ? mkPin(c || '#d97706', `
          <circle cx="14" cy="12" r="5.5" fill="none" stroke="white" stroke-width="2"/>
          <circle cx="14" cy="12" r="2" fill="white"/>
          <text x="14" y="28" text-anchor="middle" font-size="5" fill="white" font-weight="bold" font-family="Arial">OUT</text>`)
      : mkPin(c || '#d97706', `
          <circle cx="14" cy="12" r="5.5" fill="white" opacity=".9"/>
          <line x1="14" y1="7" x2="14" y2="17" stroke="${c||'#d97706'}" stroke-width="2" stroke-linecap="round"/>
          <line x1="9" y1="12" x2="19" y2="12" stroke="${c||'#d97706'}" stroke-width="2" stroke-linecap="round"/>
          <text x="14" y="28" text-anchor="middle" font-size="5" fill="white" font-weight="bold" font-family="Arial">IN</text>`),
    className: '', iconSize: [28,38], iconAnchor: [14,37], popupAnchor: [0,-34],
  }),

  evakuasi: (c, tipe) => L.divIcon({
    html: tipe === 'Lahan Kosong'
      ? `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="20" height="20" rx="3" fill="${c||'#16a34a'}" stroke="white" stroke-width="1.5"/>
          <circle cx="14" cy="9" r="2.5" fill="white"/>
          <path d="M8 19Q14 15 20 19" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="8.5" cy="13" r="2" fill="white" opacity=".7"/>
          <circle cx="19.5" cy="13" r="2" fill="white" opacity=".7"/>
          <line x1="14" y1="24" x2="14" y2="36" stroke="${c||'#16a34a'}" stroke-width="2.5"/>
          <circle cx="14" cy="37" r="1.5" fill="${c||'#16a34a'}"/>
        </svg>`
      : mkPin(c || '#16a34a', `
          <circle cx="14" cy="9" r="2.8" fill="white"/>
          <path d="M8.5 18Q14 14 19.5 18" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="8.5" cy="13" r="2" fill="white" opacity=".7"/>
          <circle cx="19.5" cy="13" r="2" fill="white" opacity=".7"/>`),
    className: '', iconSize: [28,38], iconAnchor: [14,37], popupAnchor: [0,-34],
  }),

  pmk: () => L.divIcon({
    html: `<svg width="46" height="30" viewBox="0 0 46 30" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="fpmk"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".28"/></filter></defs>
      <rect x="1" y="5" width="40" height="17" rx="3" fill="#1e3a5f" filter="url(#fpmk)"/>
      <rect x="1" y="7" width="40" height="8" rx="2" fill="#1e3a5f"/>
      <rect x="3" y="8" width="16" height="6" rx="1" fill="white" opacity=".18"/>
      <rect x="20" y="8" width="8" height="6" rx="1" fill="#3b82f6"/>
      <path d="M41 9L45 13L45 19L41 19Z" fill="#1e3a5f"/>
      <rect x="3" y="14" width="36" height="6" rx="1" fill="#152e4d"/>
      <circle cx="9" cy="24" r="4.2" fill="#1e1e1e"/>
      <circle cx="9" cy="24" r="2" fill="#ccc"/>
      <circle cx="34" cy="24" r="4.2" fill="#1e1e1e"/>
      <circle cx="34" cy="24" r="2" fill="#ccc"/>
      <rect x="1" y="15" width="3" height="4" rx="1" fill="white" opacity=".75"/>
      <rect x="28" y="8.5" width="10" height="5" rx=".8" fill="#2563eb" opacity=".9"/>
    </svg>`,
    className: '', iconSize: [46,30], iconAnchor: [23,26], popupAnchor: [0,-24],
  }),

  fire: () => L.divIcon({
    html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;position:relative">
      <div class="fire-ring fire-ring-1"></div>
      <div class="fire-ring fire-ring-2"></div>
      <svg width="20" height="24" viewBox="0 0 20 24" style="position:relative;z-index:2">
        <path d="M10 1C10 1 16 7 15.5 11.5C15.5 14 14 15.5 12.5 16.5C13 14.5 11 12.5 11 12.5C11 12.5 9.5 15.5 7 17C5 18 3.5 17 3.5 15C3.5 12.5 6 11 6 11C6 11 5 13.5 7 14C7 10.5 10 7 10 1Z" fill="#ef4444"/>
        <path d="M10 8C10 8 13 11.5 13 14.5C13 16.8 11.7 18 10 18.5C8.3 18 7 16.8 7 14.5C7 11.5 10 8 10 8Z" fill="#fbbf24"/>
        <ellipse cx="10" cy="16.5" rx="2" ry="1.6" fill="white" opacity=".5"/>
      </svg>
    </div>`,
    className: '', iconSize: [34,34], iconAnchor: [17,17], popupAnchor: [0,-14],
  }),

  kumpul: () => L.divIcon({
    html: mkPin('#16a34a', `
      <circle cx="14" cy="9" r="2.8" fill="white"/>
      <path d="M8.5 18Q14 14 19.5 18" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="8.5" cy="13" r="2" fill="white" opacity=".7"/>
      <circle cx="19.5" cy="13" r="2" fill="white" opacity=".7"/>`),
    className: '', iconSize: [28,38], iconAnchor: [14,37], popupAnchor: [0,-34],
  }),

  myLocation: () => L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,.3),0 2px 8px rgba(0,0,0,.25)"></div>`,
    className: '', iconSize: [18,18], iconAnchor: [9,9],
  }),
};

// ── INIT MAP ────────────────────────────────────────────────────────
function initMap() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes rpl{0%{transform:scale(.7);opacity:.9}100%{transform:scale(2.5);opacity:0}}
    .fire-ring{position:absolute;inset:0;border-radius:50%;animation:fireRing 1.4s ease-out infinite}
    .fire-ring-1{background:rgba(239,68,68,.2)}
    .fire-ring-2{inset:6px;background:rgba(239,68,68,.3);animation-delay:.5s}
    @keyframes fireRing{0%{transform:scale(.7);opacity:.9}100%{transform:scale(2.4);opacity:0}}
  `;
  document.head.appendChild(s);

  map = L.map('map', {
    center: CONFIG.map.center,
    zoom: CONFIG.map.zoom,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom,
    zoomControl: false,
    attributionControl: false,
  });

  const bm = {
    osm:  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }),
    sat:  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom:19 }),
    hyb:  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom:20 }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom:17 }),
  };
  bm.osm.addTo(map);
  window._bm = bm;
  window._bmCur = 'osm';

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
  L.control.attribution({ position: 'bottomleft', prefix: '' })
    .addAttribution('© <a href="https://openstreetmap.org">OSM</a> | SiGAP PMK Keputih')
    .addTo(map);

  buildBasemapControl();
  buildMyLocationButton();
  buildRoutingModeControl();

  map.on('mousemove', e => {
    const el = document.getElementById('coord-val');
    if (el) el.textContent = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
  });

  map.on('click', () => {
    const p = document.getElementById('bm-panel');
    if (p) p.style.display = 'none';
  });

  loadAllLayers();
}

// ── BASEMAP CONTROL ─────────────────────────────────────────────────
function buildBasemapControl() {
  const Ctrl = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const div = L.DomUtil.create('div', 'bm-control');
      div.innerHTML = `
        <button class="bm-toggle-btn" onclick="toggleBmPanel(event)" title="Ganti tampilan peta">
          <svg viewBox="0 0 20 20" width="16" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="2" width="7" height="7" rx="1.5"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5"/>
          </svg>
        </button>
        <div class="bm-panel" id="bm-panel" style="display:none">
          <div class="bm-panel-title">Tampilan Peta</div>
          <div class="bm-grid">
            <button class="bm-opt bm-active" data-bm="osm" onclick="switchBM('osm',this)">
              <div class="bm-thumb bm-thumb-osm"></div><span>Jalan</span>
            </button>
            <button class="bm-opt" data-bm="sat" onclick="switchBM('sat',this)">
              <div class="bm-thumb bm-thumb-sat"></div><span>Satelit</span>
            </button>
            <button class="bm-opt" data-bm="hyb" onclick="switchBM('hyb',this)">
              <div class="bm-thumb bm-thumb-hyb"></div><span>Hybrid</span>
            </button>
            <button class="bm-opt" data-bm="topo" onclick="switchBM('topo',this)">
              <div class="bm-thumb bm-thumb-topo"></div><span>Topo</span>
            </button>
          </div>
        </div>`;
      L.DomEvent.disableClickPropagation(div);
      return div;
    },
  });
  new Ctrl().addTo(map);
}

function toggleBmPanel(e) {
  e.stopPropagation();
  const p = document.getElementById('bm-panel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function switchBM(id, btn) {
  if (window._bmCur === id) return;
  map.removeLayer(window._bm[window._bmCur]);
  map.addLayer(window._bm[id]);
  window._bmCur = id;
  document.querySelectorAll('.bm-opt').forEach(b => b.classList.remove('bm-active'));
  btn.classList.add('bm-active');
}

// ── MY LOCATION ─────────────────────────────────────────────────────
function buildMyLocationButton() {
  const Ctrl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd() {
      const btn = L.DomUtil.create('button', 'my-loc-btn');
      btn.title = 'Lokasi Saya';
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
      </svg>`;
      btn.onclick = goToMyLocation;
      L.DomEvent.disableClickPropagation(btn);
      return btn;
    },
  });
  new Ctrl().addTo(map);
}

function goToMyLocation() {
  const btn = document.querySelector('.my-loc-btn');
  if (btn) btn.classList.add('locating');
  if (!navigator.geolocation) { alert('Browser tidak mendukung geolokasi.'); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      if (userLocationMarker) map.removeLayer(userLocationMarker);
      userLocationMarker = L.marker(ll, { icon: ICONS.myLocation() })
        .bindPopup('<b>📍 Lokasi Anda</b>').addTo(map).openPopup();
      map.flyTo(ll, 17, { duration: 1.2 });
      if (btn) btn.classList.remove('locating');
    },
    err => {
      alert('Tidak dapat mengakses lokasi: ' + err.message);
      if (btn) btn.classList.remove('locating');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ── ROUTING MODE CONTROL ─────────────────────────────────────────────
function buildRoutingModeControl() {
  const placeholder = document.getElementById('routing-mode-section');
  if (!placeholder) return;
  placeholder.innerHTML = `
    <div class="sc">
      <div class="sc-hdr">
        <div class="sc-hdr-icon" style="background:#2563eb">
          <svg viewBox="0 0 16 16" width="12" fill="none" stroke="white" stroke-width="1.8">
            <path d="M2 13L6 5L10 9L14 3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        MODE RUTE PMK → TKP
      </div>
      <div class="sc-body">
        <div class="rm-wrap">
          <button class="rm-opt rm-active" id="rm-aksesibel" onclick="setRoutingMode('aksesibel',this)">
            <div class="rm-opt-ico" style="background:#16a34a">🚒</div>
            <div class="rm-opt-txt">
              <div class="rm-opt-title">Jalan Aksesibel PMK</div>
              <div class="rm-opt-sub">Hanya jalan yang bisa dilalui mobil damkar</div>
            </div>
          </button>
          <button class="rm-opt" id="rm-semua" onclick="setRoutingMode('semua',this)">
            <div class="rm-opt-ico" style="background:#6366f1">🛵</div>
            <div class="rm-opt-txt">
              <div class="rm-opt-title">Semua Jaringan Jalan</div>
              <div class="rm-opt-sub">Termasuk gang sempit (motor PMK)</div>
            </div>
          </button>
        </div>
      </div>
    </div>`;
}

// ── LOAD ALL LAYERS (GeoJSON lokal — Vercel) ────────────────────────
async function loadAllLayers() {
  const activeLayers = CONFIG.layers.filter(l => l.enabled !== false);
  for (const cfg of activeLayers) {
    await loadGeoJSON(cfg);
  }
  addPMKMarker();
  setTimeout(() => {
    buildLayerPanel();
    buildLegend();
  }, 80);
}

// ── GEOJSON LOADER (pengganti WFS) ──────────────────────────────────
async function loadGeoJSON(cfg) {
  // Fallback: jika tidak ada file lokal, layer dikosongkan
  const filePath = cfg.file || null;
  if (!filePath) {
    console.warn(`[SiGAP] Layer "${cfg.label}": tidak ada file GeoJSON`);
    wfsData[cfg.id] = { type: 'FeatureCollection', features: [] };
    leafletLayers[cfg.id] = L.layerGroup();
    return;
  }
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const gj = await res.json();
    wfsData[cfg.id] = gj;
    renderWFSLayer(cfg, gj);
    if (cfg.isSource) indexSources(cfg, gj);
    if (cfg.isEvakuasi) indexEvakuasi(gj);
    console.log(`[SiGAP] ${cfg.label}: ${gj.features.length} fitur dimuat`);
  } catch (e) {
    console.warn(`[SiGAP] Layer "${cfg.label}" gagal dimuat:`, e.message);
    wfsData[cfg.id] = { type: 'FeatureCollection', features: [] };
    leafletLayers[cfg.id] = L.layerGroup();
  }
}

function renderWFSLayer(cfg, gj) {
  const grp = L.layerGroup();

  if (cfg.id === 'batas_keputih') {
    L.geoJSON(gj, {
      style: () => ({
        color: '#e8192c',
        fillColor: '#e8192c',
        fillOpacity: 0.06,
        weight: 2.5,
        opacity: 0.7,
        dashArray: '6 4',
      }),
    }).addTo(grp);
    grp.addTo(map);
    leafletLayers[cfg.id] = grp;
    return;
  }

  L.geoJSON(gj, {
    style: () => ({
      color: cfg.style.color,
      fillColor: cfg.style.fillColor || cfg.style.color,
      weight: cfg.style.weight || (cfg.geom === 'line' ? 3 : 1.5),
      opacity: cfg.style.opacity ?? 1,
      fillOpacity: cfg.geom === 'polygon' ? 0.4 : 0,
    }),
    pointToLayer: (f, ll) => createPointMarker(cfg, f, ll),
    onEachFeature: (f, layer) => {
      if (!cfg.q) return;
      layer.on('click', e => {
        L.DomEvent.stopPropagation(e);
        const latlng = f.geometry.type === 'Point'
          ? L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0])
          : (layer.getBounds?.().getCenter() || e.latlng);
        showFeaturePopup(cfg, f, latlng);
      });
    },
  }).addTo(grp);

  if (cfg.vis) grp.addTo(map);
  leafletLayers[cfg.id] = grp;
}

function createPointMarker(cfg, feature, latlng) {
  const p = feature.properties || {};
  if (cfg.id === 'tandon_keputih')
    return L.marker(latlng, { icon: ICONS.tandon(cfg.style.color) });
  if (cfg.id === 'rekomendasi_hydrant')
    return L.marker(latlng, { icon: ICONS.hydrantRek(cfg.style.color, p.tipe || 'Inlet') });
  if (cfg.id === 'titik_evakuasi')
    return L.marker(latlng, { icon: ICONS.evakuasi(cfg.style.color, p.tipe || 'Jalan Raya') });
  return L.circleMarker(latlng, {
    radius: 7, fillColor: cfg.style.color,
    color: '#fff', weight: 2, fillOpacity: 0.9,
  });
}

// ── INDEX SUMBER — FIX: pakai window.allSources + handle MultiPolygon ──
function indexSources(cfg, gj) {
  gj.features.forEach(f => {
    if (!f.geometry) return;
    const gt = f.geometry.type;
    let c = null;

    if (gt === 'Point') {
      c = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
    } else if (gt === 'LineString') {
      const coords = f.geometry.coordinates;
      const m = Math.floor(coords.length / 2);
      c = [coords[m][1], coords[m][0]];
    } else if (gt === 'MultiLineString') {
      const seg = f.geometry.coordinates[0];
      const m = Math.floor(seg.length / 2);
      c = [seg[m][1], seg[m][0]];
    } else if (gt === 'Polygon') {
      const ring = f.geometry.coordinates[0];
      c = [
        ring.reduce((s, p) => s + p[1], 0) / ring.length,
        ring.reduce((s, p) => s + p[0], 0) / ring.length,
      ];
    } else if (gt === 'MultiPolygon') {
      const ring = f.geometry.coordinates[0][0];
      c = [
        ring.reduce((s, p) => s + p[1], 0) / ring.length,
        ring.reduce((s, p) => s + p[0], 0) / ring.length,
      ];
    }

    if (c && !isNaN(c[0]) && !isNaN(c[1])) {
      window.allSources.push({
        latlng: L.latLng(c[0], c[1]),
        label: cfg.label,
        id: cfg.id,
        props: f.properties || {},
      });
    }
  });
  console.log(`[SiGAP] indexSources "${cfg.label}": ${window.allSources.length} total`);
}

function indexEvakuasi(gj) {
  window._evPoints = window._evPoints || [];
  gj.features.forEach(f => {
    if (f.geometry.type !== 'Point') return;
    const c = f.geometry.coordinates;
    window._evPoints.push({ latlng: L.latLng(c[1], c[0]), props: f.properties || {} });
  });
}

// ── POPUP HELPERS ──────────────────────────────────────────────────
function popHeader(color, title, sub) {
  return `<div class="pop-hdr" style="background:${color}">
    <div class="pop-hdr-title">${title}</div>
    ${sub ? `<div class="pop-hdr-sub">${sub}</div>` : ''}
  </div>`;
}

function popRow(label, val, mono) {
  if (val == null || val === '') return '';
  return `<div class="pop-row">
    <span class="pop-k">${label}</span>
    <span class="pop-v${mono ? ' pop-mono' : ''}">${val}</span>
  </div>`;
}

function popBadge(val) {
  if (!val) return '';
  const cls = /baik|aktif|ya/i.test(val) ? 'good'
    : /tidak|mati|berat/i.test(val) ? 'bad' : 'warn';
  return `<span class="pop-badge pop-badge--${cls}">${val}</span>`;
}

function isValidVal(v) {
  if (v == null) return false;
  const s = String(v).trim();
  return s !== '' && s !== '0' && Number(s) !== 0;
}

const SKIP_FIELDS = new Set([
  'geom','the_geom','geometry','fid','gid','ogc_fid','wkb_geometry','objectid'
]);

// ── POPUP BUILDERS ──────────────────────────────────────────────────

function buildPopupTandon(cfg, f) {
  const c = f.geometry.coordinates;
  const p = f.properties || {};
  const lat = c[1].toFixed(6), lng = c[0].toFixed(6);

  // Field yang sudah ditampilkan di grid/chip — jangan duplikat di extraRows
  const handled = new Set([
    ...SKIP_FIELDS,
    'nama','foto_url','foto url','foto',
    'rayon','rw','kelurahan','kecamatan',
    'volume_m3','volume m3','debit','alamat',
    'aktif','tidak_akti','tandon_bai',
    'lintang','bujur','no','tipe','keterangan',
  ]);

  const extraRows = Object.keys(p)
    .filter(k => !handled.has(k.toLowerCase()) && isValidVal(p[k]))
    .map(k => popRow(k.replace(/_/g,' '), p[k]))
    .join('');

  // Status: ambil satu nilai yang paling relevan
  const statusVal = p.tandon_bai || p.kondisi || null;
  const aktifVal  = p.aktif === 'YA' || p.aktif === true  ? 'Aktif'
                  : p.aktif === 'TIDAK' || p.aktif === false ? 'Tidak Aktif'
                  : null;

  return `
    <div class="ppx-wrap">
      <div class="ppx-hdr" style="background:linear-gradient(135deg,#0891b2,#0e7490)">
        <div class="ppx-hdr-icon">🛢️</div>
        <div class="ppx-hdr-text">
          <div class="ppx-title">${p.nama || p.NAMA || 'Tandon Air'}</div>
          <div class="ppx-sub">Tandon Air · Keputih</div>
        </div>
      </div>
      <div class="ppx-body">
        <div class="ppx-row ppx-row--coord">
          <span class="ppx-coord-ico">📍</span>
          <span class="ppx-coord-val">${lat}, ${lng}</span>
        </div>

        ${p.rayon || p.rw || p.kelurahan ? `<div class="ppx-chip-row">
          ${p.rayon     ? `<span class="ppx-chip ppx-chip--blue">Rayon ${p.rayon}</span>` : ''}
          ${p.rw        ? `<span class="ppx-chip ppx-chip--blue">RW ${p.rw}</span>`       : ''}
          ${p.kelurahan ? `<span class="ppx-chip ppx-chip--gray">${p.kelurahan}</span>`   : ''}
          ${p.kecamatan ? `<span class="ppx-chip ppx-chip--gray">${p.kecamatan}</span>`   : ''}
        </div>` : ''}

        <div class="ppx-grid">
          ${isValidVal(p.volume_m3 || p['volume m3']) ? `
            <div class="ppx-grid-item">
              <div class="ppx-grid-label">Volume</div>
              <div class="ppx-grid-val">${p.volume_m3 || p['volume m3']} m³</div>
            </div>` : ''}
          ${isValidVal(p.debit) ? `
            <div class="ppx-grid-item">
              <div class="ppx-grid-label">Debit</div>
              <div class="ppx-grid-val">${p.debit}</div>
            </div>` : ''}
          ${aktifVal ? `
            <div class="ppx-grid-item">
              <div class="ppx-grid-label">Aktif</div>
              <div class="ppx-grid-val">${aktifVal}</div>
            </div>` : ''}
          ${statusVal ? `
            <div class="ppx-grid-item">
              <div class="ppx-grid-label">Kondisi</div>
              <div class="ppx-grid-val">${statusVal}</div>
            </div>` : ''}
          ${p.alamat ? `
            <div class="ppx-grid-item ppx-grid-item--full">
              <div class="ppx-grid-label">Alamat</div>
              <div class="ppx-grid-val">${p.alamat}</div>
            </div>` : ''}
        </div>

        ${extraRows ? `<div class="ppx-extra">${extraRows}</div>` : ''}
      </div>
    </div>`;
}

function buildPopupSumberAir(cfg, f) {
  const p = f.properties || {};

  // Koordinat dari geometri
  let coordStr = '—';
  try {
    const gt = f.geometry.type, c = f.geometry.coordinates;
    if (gt === 'Point') coordStr = `${c[1].toFixed(6)}, ${c[0].toFixed(6)}`;
    else if (gt === 'LineString') {
      const m = Math.floor(c.length/2);
      coordStr = `${c[m][1].toFixed(6)}, ${c[m][0].toFixed(6)}`;
    } else if (gt === 'Polygon' || gt === 'MultiPolygon') {
      const ring = gt === 'Polygon' ? c[0] : c[0][0];
      const lat = ring.reduce((s,x)=>s+x[1],0)/ring.length;
      const lng = ring.reduce((s,x)=>s+x[0],0)/ring.length;
      coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  } catch {}

  // Tampilkan semua field yang valid, skip field teknis
  const skip = new Set([...SKIP_FIELDS, 'nama']);
  const allRows = Object.keys(p)
    .filter(k => !skip.has(k.toLowerCase()) && isValidVal(p[k]))
    .map(k => {
      const label = k.replace(/_/g,' ');
      return popRow(label, p[k]);
    }).join('');

  const jenis = p.remark || p.jenis || p.REMARK || p.tip_sungai || '';

  return `
    <div class="ppx-wrap">
      <div class="ppx-hdr" style="background:linear-gradient(135deg,#2471a3,#1a5276)">
        <div class="ppx-hdr-icon">💧</div>
        <div class="ppx-hdr-text">
          <div class="ppx-title">${p.nama || p.NAMA || 'Sumber Air'}</div>
          <div class="ppx-sub">Sungai / Sumber Air · Keputih</div>
        </div>
      </div>
      <div class="ppx-body">
        <div class="ppx-row ppx-row--coord">
          <span class="ppx-coord-ico">📍</span>
          <span class="ppx-coord-val">${coordStr}</span>
        </div>
        ${jenis ? `<div class="ppx-chip-row">
          <span class="ppx-chip ppx-chip--blue">${jenis}</span>
        </div>` : ''}
        ${allRows
          ? `<div class="ppx-extra">${allRows}</div>`
          : '<div class="ppx-empty">Tidak ada atribut tambahan</div>'}
      </div>
    </div>`;
}

function buildPopupHydrant(cfg, f) {
  const p = f.properties || {};
  const c = f.geometry.coordinates;
  const tipe    = p.tipe || 'Inlet';
  const isInlet = tipe !== 'Outlet';
  const fotoUrl = p.foto_url || p['foto url'] || p.foto || '';
  const accentColor = isInlet
    ? 'linear-gradient(135deg,#d97706,#b45309)'
    : 'linear-gradient(135deg,#92400e,#d97706)';

  // Field tambahan selain yang sudah ditangani
  const handled = new Set([...SKIP_FIELDS, 'tipe','nama','foto_url','foto url','foto','keterangan','id']);
  const extraRows = Object.keys(p)
    .filter(k => !handled.has(k.toLowerCase()) && isValidVal(p[k]))
    .map(k => popRow(k.replace(/_/g,' '), p[k]))
    .join('');

  return `
    <div class="ppx-wrap">
      <div class="ppx-hdr" style="background:${accentColor}">
        <div class="ppx-hdr-icon">${isInlet ? '🔵' : '🟠'}</div>
        <div class="ppx-hdr-text">
          <div class="ppx-title">${p.nama || (isInlet ? 'Inlet Hydrant' : 'Outlet Hydrant')}</div>
          <div class="ppx-sub">Rekomendasi Penempatan Hydrant Baru</div>
        </div>
      </div>
      ${fotoUrl ? `
      <div class="ppx-foto-wrap">
        <img src="${fotoUrl}" alt="Foto" class="ppx-foto"
          onclick="openFotoModal('${fotoUrl}','${p.nama||tipe}')"
          onerror="this.closest('.ppx-foto-wrap').style.display='none'"/>
        <div class="ppx-foto-caption">Klik foto untuk memperbesar</div>
      </div>` : ''}
      <div class="ppx-body">
        <div class="ppx-row ppx-row--coord">
          <span class="ppx-coord-ico">📍</span>
          <span class="ppx-coord-val">${c[1].toFixed(6)}, ${c[0].toFixed(6)}</span>
        </div>
        <div class="ppx-chip-row">
          <span class="ppx-chip ${isInlet ? 'ppx-chip--blue' : 'ppx-chip--amber'}">${tipe}</span>
        </div>
        <div class="ppx-info-banner">
          <span class="ppx-info-ico">${isInlet ? '⬇️' : '⬆️'}</span>
          <span>${isInlet ? 'Titik masuk air ke sistem hydrant' : 'Titik keluar air dari hydrant'}</span>
        </div>
        ${extraRows ? `<div class="ppx-extra">${extraRows}</div>` : ''}
      </div>
    </div>`;
}

function buildPopupEvakuasi(cfg, f) {
  const p = f.properties || {};
  const c = f.geometry.coordinates;
  const tipe    = p.tipe || 'Jalan Raya';
  const isJalan = tipe === 'Jalan Raya';

  // Tampilkan semua field valid kecuali yang sudah ditangani
  const handled = new Set([...SKIP_FIELDS, 'tipe', 'keterangan', 'nama']);
  const extraRows = Object.keys(p)
    .filter(k => !handled.has(k.toLowerCase()) && isValidVal(p[k]))
    .map(k => popRow(k.replace(/_/g,' '), p[k]))
    .join('');

  return `
    <div class="ppx-wrap">
      <div class="ppx-hdr" style="background:linear-gradient(135deg,#16a34a,#15803d)">
        <div class="ppx-hdr-icon">${isJalan ? '🛣️' : '🌿'}</div>
        <div class="ppx-hdr-text">
          <div class="ppx-title">${p.nama || 'Titik Evakuasi'}</div>
          <div class="ppx-sub">Titik Kumpul Evakuasi · ${tipe}</div>
        </div>
      </div>
      <div class="ppx-body">
        <div class="ppx-row ppx-row--coord">
          <span class="ppx-coord-ico">📍</span>
          <span class="ppx-coord-val">${c[1].toFixed(6)}, ${c[0].toFixed(6)}</span>
        </div>
        <div class="ppx-chip-row">
          <span class="ppx-chip ppx-chip--green">${tipe}</span>
        </div>
        <div class="ppx-info-banner">
          <span class="ppx-info-ico">👥</span>
          <span>${isJalan ? 'Akses kendaraan evakuasi & warga' : 'Titik tunggu sementara warga'}</span>
        </div>
        ${extraRows ? `<div class="ppx-extra">${extraRows}</div>` : ''}
      </div>
    </div>`;
}

function buildPopupJalan(cfg, f) {
  const p = f.properties || {};

  // Tampilkan semua field valid kecuali field geometri
  const skip = new Set([...SKIP_FIELDS, 'nama', 'nama_jalan']);
  const nama = p.nama_jalan || p.nama || p.NAME || 'Jalan Aksesibel PMK';

  const allRows = Object.keys(p)
    .filter(k => !skip.has(k.toLowerCase()) && isValidVal(p[k]))
    .map(k => {
      const label = k.replace(/_/g,' ');
      // Highlight field lebar
      if (k.toLowerCase().includes('lebar')) {
        return `<div class="ppx-grid-item">
          <div class="ppx-grid-label">Lebar Jalan</div>
          <div class="ppx-grid-val">${p[k]} m</div>
        </div>`;
      }
      return popRow(label, p[k]);
    });

  // Pisahkan grid items dan popRow items
  const gridItems = allRows.filter(r => r.includes('ppx-grid-item')).join('');
  const rowItems  = allRows.filter(r => !r.includes('ppx-grid-item')).join('');

  return `
    <div class="ppx-wrap">
      <div class="ppx-hdr" style="background:linear-gradient(135deg,#16a34a,#15803d)">
        <div class="ppx-hdr-icon">🛣️</div>
        <div class="ppx-hdr-text">
          <div class="ppx-title">${nama}</div>
          <div class="ppx-sub">Jalan Aksesibel Mobil PMK</div>
        </div>
      </div>
      <div class="ppx-body">
        ${gridItems ? `<div class="ppx-grid">${gridItems}</div>` : ''}
        ${rowItems  ? `<div class="ppx-extra">${rowItems}</div>` : ''}
        ${!gridItems && !rowItems
          ? '<div class="ppx-empty">Tidak ada atribut tambahan</div>' : ''}
      </div>
    </div>`;
}

function buildPopupGeneric(cfg, f) {
  const props = f.properties || {};
  const rows = Object.keys(props)
    .filter(k => !SKIP_FIELDS.has(k.toLowerCase()) && isValidVal(props[k]))
    .map(k => popRow(k.replace(/_/g,' '), props[k])).join('');
  return `
    <div class="ppx-wrap">
      <div class="ppx-hdr" style="background:${cfg.style.color}">
        <div class="ppx-hdr-icon">📍</div>
        <div class="ppx-hdr-text">
          <div class="ppx-title">${cfg.label}</div>
        </div>
      </div>
      <div class="ppx-body">
        ${rows || '<div class="ppx-empty">—</div>'}
      </div>
    </div>`;
}

// ── DISPATCH POPUP ─────────────────────────────────────────────────
function showFeaturePopup(cfg, f, latlng) {
  let html = '';
  switch (cfg.id) {
    case 'tandon_keputih':      html = buildPopupTandon(cfg, f);     break;
    case 'sumber_air':          html = buildPopupSumberAir(cfg, f);  break;
    case 'rekomendasi_hydrant': html = buildPopupHydrant(cfg, f);    break;
    case 'titik_evakuasi':      html = buildPopupEvakuasi(cfg, f);   break;
    case 'jalan_aksesibel':     html = buildPopupJalan(cfg, f);      break;
    default:                    html = buildPopupGeneric(cfg, f);    break;
  }
  L.popup({ className: 'sp-popup ppx-popup', maxWidth: 290, minWidth: 220 })
    .setLatLng(latlng).setContent(html).openOn(map);
}

// ── PMK MARKER ──────────────────────────────────────────────────────
function addPMKMarker() {
  const p = CONFIG.pos_pmk;
  const popup = popHeader('#1e3a5f', '🚒 ' + p.nama, 'Pos Pemadam Kebakaran')
    + `<div class="pop-body">
        ${popRow('Alamat', p.alamat)}
        ${popRow('Telepon', p.telp)}
        ${popRow('Koordinat', `${p.koordinat[0].toFixed(5)}, ${p.koordinat[1].toFixed(5)}`, true)}
        <div class="pop-row"><span class="pop-k">Status</span>
          <span class="pop-v"><span class="pop-badge pop-badge--good">Aktif 24 Jam</span></span>
        </div>
      </div>`;
  L.marker(p.koordinat, { icon: ICONS.pmk() })
    .bindPopup(popup, { className: 'sp-popup', maxWidth: 260 })
    .addTo(map);
  window._pmkLL = L.latLng(p.koordinat);
}

// ── LAYER PANEL ─────────────────────────────────────────────────────
function buildLayerPanel() {
  const groups = {
    'Sumber Air': CONFIG.layers.filter(l => l.isSource && l.showInPanel !== false),
    'Titik Penting': CONFIG.layers.filter(l =>
      ['rekomendasi_hydrant','titik_evakuasi'].includes(l.id) && l.showInPanel !== false),
    'Jaringan Jalan': CONFIG.layers.filter(l =>
      ['jalan_aksesibel','jalan_semua'].includes(l.id) && l.showInPanel !== false),
  };
  let html = '';
  Object.entries(groups).forEach(([gname, layers]) => {
    if (!layers.length) return;
    html += `<div class="lp-group"><div class="lp-group-title">${gname}</div>`;
    layers.forEach(l => {
      const off = l.enabled === false;
      const dotStyle = l.geom === 'line'
        ? `background:${l.style.color};width:18px;height:4px;border-radius:2px;display:inline-block`
        : `background:${l.style.color};border-radius:50%;width:10px;height:10px;display:inline-block`;
      html += `<label class="lp-item${off?' lp-item--off':''}">
        <input type="checkbox" ${l.vis&&!off?'checked':''} ${off?'disabled':''}
          onchange="toggleLayer('${l.id}',this)">
        <span class="lp-dot" style="${dotStyle}"></span>
        <span class="lp-name">${l.label}</span>
        ${off?'<span class="lp-badge">Segera</span>':''}
      </label>`;
    });
    html += `</div>`;
  });
  const el = document.getElementById('layer-panel-body');
  if (el) el.innerHTML = html || '<div style="color:#aaa;font-size:12px;padding:8px">Tidak ada layer.</div>';
}

function toggleLayer(id, cb) {
  const l = leafletLayers[id];
  if (!l) return;
  cb.checked ? map.addLayer(l) : map.removeLayer(l);
}

// ── LEGENDA ──────────────────────────────────────────────────────────
function buildLegend() {
  const items = [
    { color:'#2471a3', type:'line',     label:'Sumber Air' },
    { color:'#0891b2', type:'dot',      label:'Tandon Air' },
    { color:'#d97706', type:'dot-in',   label:'Inlet Hydrant (Masuk)' },
    { color:'#d97706', type:'dot-out',  label:'Outlet Hydrant (Keluar)' },
    { color:'#16a34a', type:'dot',      label:'Titik Evakuasi (Jalan Raya)' },
    { color:'#16a34a', type:'dot-sq',   label:'Titik Evakuasi (Lahan Kosong)' },
    { color:'#1e3a5f', type:'truck',    label:'Pos PMK' },
    { color:'#ef4444', type:'dot',      label:'Titik Kebakaran' },
    { separator: true },
    { color:'#e8192c', type:'line',     label:'Rute PMK → TKP' },
    { color:'#2471a3', type:'line',     label:'TKP → Sumber Air' },
    { color:'#16a34a', type:'line-dash',label:'TKP → Titik Evakuasi' },
  ];
  const el = document.getElementById('legend-body');
  if (!el) return;
  el.innerHTML = items.map(item => {
    if (item.separator) return '<div class="leg-sep"></div>';
    let sym = '';
    if (item.type==='line') sym=`<span class="leg-line" style="background:${item.color}"></span>`;
    else if (item.type==='line-dash') sym=`<span class="leg-line leg-dash" style="border-top-color:${item.color}"></span>`;
    else if (item.type==='dot') sym=`<span class="leg-dot" style="background:${item.color}"></span>`;
    else if (item.type==='dot-sq') sym=`<span class="leg-dot" style="background:${item.color};border-radius:3px"></span>`;
    else if (item.type==='dot-in') sym=`<span class="leg-dot" style="background:${item.color};border:2.5px solid white;outline:1.5px solid ${item.color}"><span style="font-size:7px;color:white;font-weight:800;line-height:1;display:flex;align-items:center;justify-content:center;height:100%">+</span></span>`;
    else if (item.type==='dot-out') sym=`<span class="leg-dot" style="background:transparent;border:2.5px solid ${item.color};box-shadow:none"></span>`;
    else if (item.type==='truck') sym=`<span class="leg-dot" style="background:${item.color};border-radius:2px"></span>`;
    return `<div class="leg-item">${sym}<span class="leg-label">${item.label}</span></div>`;
  }).join('');
}

// ── UTILS ────────────────────────────────────────────────────────────
function updateStat(id, n) {
  console.log(`[SiGAP] Layer "${id}": ${n} fitur dimuat`);
}

function zoomToKeputih() {
  map.flyTo(CONFIG.map.center, CONFIG.map.zoom, { duration: 1.2 });
}

function openFotoModal(url, judul) {
  let modal = document.getElementById('foto-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'foto-modal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:12px;cursor:pointer;`;
    modal.onclick = () => modal.style.display = 'none';
    modal.innerHTML = `
      <div style="color:white;font-size:14px;font-weight:600;max-width:90%;text-align:center"
        id="foto-modal-judul"></div>
      <img id="foto-modal-img" style="max-width:90vw;max-height:80vh;border-radius:8px;
        box-shadow:0 8px 40px rgba(54, 12, 12, 0.6);object-fit:contain"/>
      <div style="color:rgba(255,255,255,0.5);font-size:12px">Klik mana saja untuk menutup</div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('foto-modal-judul').textContent = judul;
  document.getElementById('foto-modal-img').src = url;
  modal.style.display = 'flex';
}