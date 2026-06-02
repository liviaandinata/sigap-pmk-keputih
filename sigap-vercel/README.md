# 📦 SiGAP — Panduan Deploy ke Vercel

## ⚠️ LANGKAH 0 — Export GeoJSON dari PostGIS (WAJIB dulu)

Sebelum deploy, kamu harus export data dari PostGIS ke file GeoJSON.
Buka **pgAdmin → Query Tool** dan jalankan perintah ini satu per satu,
atau jalankan lewat terminal:

```bash
# Buka Command Prompt / PowerShell, jalankan satu per satu:

ogr2ogr -f GeoJSON data/batas_keputih.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" batas_keputih -t_srs EPSG:4326

ogr2ogr -f GeoJSON data/sungai_keputih.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" sungai_keputih -t_srs EPSG:4326

ogr2ogr -f GeoJSON data/tandon_keputih.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" tandon_keputih -t_srs EPSG:4326

ogr2ogr -f GeoJSON data/jalan_aksesibel.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" jalan_aksesibel -t_srs EPSG:4326

ogr2ogr -f GeoJSON data/jalan_semua.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" jalan_semua -t_srs EPSG:4326

ogr2ogr -f GeoJSON data/rekomendasi_hydrant.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" rekomendasi_hydrant_view -t_srs EPSG:4326

ogr2ogr -f GeoJSON data/titik_evakuasi.geojson PG:"host=localhost dbname=WebGIS_PMK_Keputih user=postgres password=PASSWORDMU" titik_evakuasi_view -t_srs EPSG:4326
```

> Ganti `PASSWORDMU` dengan password PostgreSQL-mu.
> Jalankan dari folder `sigap-vercel/` agar file masuk ke folder `data/`.

Kalau `ogr2ogr` tidak dikenal, install GDAL:
👉 https://gdal.org/download.html

---

## 🚀 LANGKAH 1 — Daftar Akun GitHub

1. Buka **https://github.com**
2. Klik **Sign up** → isi email, password, username
3. Verifikasi email

---

## 📁 LANGKAH 2 — Upload Folder ke GitHub

### Cara A: Lewat Web (Termudah)

1. Login ke GitHub → klik tombol **+** (pojok kanan atas) → **New repository**
2. Isi nama: `sigap-pmk-keputih`
3. Pilih **Public**
4. Klik **Create repository**
5. Di halaman repository yang baru dibuat, klik **uploading an existing file**
6. **Drag and drop** seluruh isi folder `sigap-vercel/` ke area upload
   (semua file dan folder: `index.html`, `landing.html`, `js/`, `css/`, `data/`, `assets/`)
7. Scroll ke bawah → klik **Commit changes**

### Cara B: Lewat GitHub Desktop (Lebih Mudah untuk File Banyak)

1. Download **GitHub Desktop** → https://desktop.github.com
2. Install dan login dengan akun GitHub
3. Klik **File → New Repository**
   - Name: `sigap-pmk-keputih`
   - Local path: pilih folder `sigap-vercel/`
4. Klik **Create Repository**
5. Klik **Publish repository** → pilih **Public** → klik **Publish**

---

## ▲ LANGKAH 3 — Deploy ke Vercel

1. Buka **https://vercel.com**
2. Klik **Sign Up** → pilih **Continue with GitHub**
3. Authorize Vercel untuk akses GitHub
4. Di dashboard Vercel, klik **Add New → Project**
5. Cari repository `sigap-pmk-keputih` → klik **Import**
6. Di halaman konfigurasi:
   - **Framework Preset**: pilih **Other**
   - **Root Directory**: biarkan default (`./`)
   - **Build Command**: kosongkan
   - **Output Directory**: kosongkan
7. Klik **Deploy**
8. Tunggu 1-2 menit → ✅ **Deployment complete!**

Vercel akan memberi URL seperti:
```
https://sigap-pmk-keputih.vercel.app
```

---

## 🌐 LANGKAH 4 — Setting Halaman Awal

Saat ini ada dua halaman:
- `landing.html` → halaman depan (tentang SiGAP, tim, dll)
- `index.html` → halaman peta

Agar yang terbuka pertama adalah `landing.html`, ada dua pilihan:

**Pilihan A** — Rename file:
- Rename `index.html` → `peta.html`
- Rename `landing.html` → `index.html`
- Update link di `index.html` (landing) yang mengarah ke peta: ganti `href="index.html"` → `href="peta.html"`

**Pilihan B** — Sudah benar seperti sekarang:
- Buka `https://sigap-pmk-keputih.vercel.app` → langsung ke peta
- Buka `https://sigap-pmk-keputih.vercel.app/landing.html` → halaman depan

---

## 🔄 LANGKAH 5 — Update Data / File

Kalau ada perubahan file:
1. Edit file di komputer
2. Di GitHub Desktop → klik **Commit to main** → **Push origin**
3. Vercel otomatis redeploy dalam 1-2 menit

---

## 📋 Checklist Sebelum Deploy

- [ ] Semua file GeoJSON sudah diexport dari PostGIS (bukan file kosong)
- [ ] Foto-foto di `assets/photos/` sudah lengkap
- [ ] Data `rekomendasi_hydrant.geojson` punya field `tipe` (Inlet/Outlet) dan `foto_url`
- [ ] Data `titik_evakuasi.geojson` punya field `tipe` (Jalan Raya/Lahan Kosong)
- [ ] `landing.html` sudah diisi nama tim, NIM, dan mata kuliah yang benar
- [ ] Test dulu di komputer lokal dengan Live Server sebelum deploy

---

## ❓ Troubleshooting

**Layer tidak muncul di peta:**
→ Buka F12 → Console. Kalau ada error `HTTP 404`, berarti file GeoJSON belum ada/kosong.
→ Export ulang dari PostGIS dan upload ke GitHub.

**Foto tidak muncul di popup:**
→ Pastikan path `foto_url` di database sama persis dengan nama file di `assets/photos/`
→ Contoh: `foto_url = 'assets/photos/inlet_1.jpg'` → file harus ada di `assets/photos/inlet_1.jpg`

**OSRM routing tidak bekerja:**
→ OSRM butuh koneksi internet. Pastikan tidak diblokir firewall.
→ Coba buka `https://router.project-osrm.org` di browser.

---

## 📞 Kontak

SiGAP — Sistem Informasi Geospasial Akses Pemadam
Kelurahan Keputih · Sukolilo · Surabaya
Teknik Geomatika ITS · 2025/2026
