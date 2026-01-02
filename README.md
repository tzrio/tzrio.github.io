# Web Anime (Aniwave)

Web simpel buat lihat daftar anime + halaman detail.

## Fitur
- Beranda: search + filter (Genre/Tipe/Status)
- Tampilan per bab: **Serial** dan **Film**
- Preview list per bab max **3 baris** (mode default), ada tombol **Lihat lainnya** di kanan
- Halaman detail: sinopsis, info, dan tabel unduhan
- UI konsisten: header seragam, font seragam, scrollbar nyatu tema

## Cara Menjalankan

### Direkomendasikan (pakai server lokal)
Karena browser sering membatasi `fetch()` saat dibuka via `file://`, paling aman jalankan pakai server lokal.

**Opsi A (Python)**
```bash
cd "Web Anime"
python -m http.server 5174
```
Lalu buka: `http://localhost:5174/index.html`

**Opsi B (VS Code Live Server)**
- Klik kanan `index.html` → **Open with Live Server**

### Tetap bisa tanpa server
Kalau dibuka langsung (double click `index.html`), web akan coba load data dari [data/anime.json](data/anime.json).
Kalau `fetch()` gagal, otomatis pakai data cadangan [data/anime-data.js](data/anime-data.js).

## Update Terbaru (Jan 2026)
- Per bab (Serial/Film) kartu dibatasi max **3 baris** saat mode default + tombol **Lihat lainnya** di pojok kanan bab.
- Layout filter lebih efisien: **filter di kiri** (digroup), **search di kanan**.
- Scrollbar dibuat lebih elegan dan sesuai tema.
- Header beranda dan page anime disamakan.
- Font diseragamkan via global style (nggak ada lagi override font halaman tertentu).

## Struktur & File Penting
- Beranda: [index.html](index.html)
- Detail: [anime.html](anime.html)
- Data utama: [data/anime.json](data/anime.json)
- Data cadangan (offline): [data/anime-data.js](data/anime-data.js)
- CSS global (header + background + font + scrollbar): [assets/css/global.css](assets/css/global.css)
- CSS beranda: [assets/css/beranda.css](assets/css/beranda.css)
- CSS detail: [assets/css/hiasan.css](assets/css/hiasan.css)

## Upload ke GitHub (GitHub Pages)
1. Push repo ini ke GitHub.
2. Buka **Settings → Pages**.
3. Pilih **Deploy from a branch**.
4. Pilih branch (mis. `main`) dan folder **/** (root).
5. Setelah live, akses halaman utama dari `.../index.html`.

Catatan: karena ini static site, tidak perlu build step.
