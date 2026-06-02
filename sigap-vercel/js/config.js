// ============================================================
// SiGAP — config.js
// Versi VERCEL: semua data dari file GeoJSON lokal
// Tidak butuh GeoServer / localhost
// ============================================================

const CONFIG = {
  // GeoServer tidak dipakai di versi ini
  geoserver: null,

  map: {
    center: [-7.2920, 112.7970],
    zoom: 15,
    minZoom: 12,
    maxZoom: 19,
  },

  pos_pmk: {
    nama: "Pos PMK Keputih",
    koordinat: [-7.2954, 112.8012],
    alamat: "Jl. Raya Keputih, Sukolilo, Surabaya",
    telp: "(031) 5947555",
  },

  // Semua layer pakai file GeoJSON lokal di folder data/
  layers: [
    {
      id: "batas_keputih",
      file: "data/batas_keputih.geojson",
      label: "Batas Kelurahan",
      geom: "polygon",
      style: { color:"#e8192c", fillColor:"#e8192c", fillOpacity:0.04, weight:2, opacity:0.5, dashArray:"6 4" },
      vis: true, q: false, showInPanel: false,
    },
    {
      id: "sumber_air",
      file: "data/sungai_keputih.geojson",
      label: "Sumber Air",
      geom: "line",
      style: { color:"#2471a3", weight:3, opacity:0.85 },
      vis: true, q: true, isSource: true, showInPanel: true,
    },
    {
      id: "tandon_keputih",
      file: "data/tandon_keputih.geojson",
      label: "Tandon Air",
      geom: "point",
      style: { color:"#0891b2" },
      vis: true, q: true, isSource: true, showInPanel: true,
    },
    {
      id: "jalan_aksesibel",
      file: "data/jalan_aksesibel.geojson",
      label: "Jalan Aksesibel PMK",
      geom: "line",
      style: { color:"#16a34a", weight:2.5, opacity:0.8 },
      vis: true, q: true, showInPanel: true,
    },
    {
      id: "jalan_semua",
      file: "data/jalan_semua.geojson",
      label: "Semua Jalan",
      geom: "line",
      style: { color:"#94a3b8", weight:1.8, opacity:0.6 },
      vis: false, q: false, showInPanel: true,
    },
    {
      id: "rekomendasi_hydrant",
      file: "data/rekomendasi_hydrant.geojson",
      label: "Rekomendasi Hydrant",
      geom: "point",
      style: { color:"#d97706" },
      vis: true, q: true, showInPanel: true,
    },
    {
      id: "titik_evakuasi",
      file: "data/titik_evakuasi.geojson",
      label: "Titik Evakuasi",
      geom: "point",
      style: { color:"#16a34a" },
      vis: true, q: true, isEvakuasi: true, showInPanel: true,
    },
  ],
};
