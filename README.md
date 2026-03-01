# ThermoExplore — Ekspedisi Energi

Game edukasi interaktif 3D untuk siswa SMA Indonesia — Termodinamika.

## 🎮 Tentang Game

**ThermoVerse: Ekspedisi Energi** adalah game edukasi berbasis web yang membantu siswa SMA memahami konsep termodinamika melalui pengalaman bermain yang menarik dan imersif.

Dibuat dengan: HTML5 · CSS3 · Vanilla JavaScript · Three.js · GSAP · Chart.js

## 🗺️ Fitur Utama

- **Peta Petualangan Interaktif** — 3 zona dengan latar ilustrasi bergambar dan penanda zona 3D
- **Kuis Berbatas Waktu** — 10 soal per zona, timer 15 menit, bonus XP kecepatan
- **Pendamping Molekul 3D** — Reaksi visual mengunakan Three.js terhadap jawaban kuis
- **Lab Inovasi** — Turbin 3D yang berputar lebih cepat sesuai upgrade yang dipilih
- **Sistem XP & Lencana** — 5 lencana yang bisa dibuka berdasarkan dimensi berpikir
- **Dasbor Analitik** — Grafik radar & batang, trofi 3D, kategori akhir pemikiran

## 🚀 Cara Menjalankan Lokal

```bash
python -m http.server 8765 --directory thermoverse
```
Lalu buka: http://localhost:8765

## 🌐 Deploy

Di-deploy ke Vercel. `vercel.json` sudah dikonfigurasi untuk melayani folder `thermoverse/` sebagai root.

## 📁 Struktur Folder

```
Thermoexplore/
├── thermoverse/
│   ├── index.html        # Beranda
│   ├── map.html          # Peta Misi Interaktif
│   ├── level1.html       # Zona 1: Hukum Dasar Termodinamika
│   ├── level2.html       # Zona 2: Lab Inovasi
│   ├── level3.html       # Zona 3: Sistem Lanjutan
│   ├── dashboard.html    # Dasbor Analitik
│   ├── css/              # Stylesheet
│   ├── js/               # JavaScript
│   └── assets/           # Gambar (peta petualangan, dll)
└── vercel.json           # Konfigurasi Vercel
```
