# 🎮 R-CADE XI RPL — Rental Game & Cookies Management System

Sistem manajemen terintegrasi untuk operasional stand **R-CADE (XI RPL)** pada event Job Fair / Pameran Sekolah. Aplikasi web ini menggabungkan landing page publik interaktif untuk pengunjung, sistem Point of Sales (POS) kasir, monitoring status PC rental secara real-time, pengingat suara cerdas (Text-to-Speech), serta client display khusus untuk masing-masing PC.

---

## 📌 Gambaran Umum Proyek

**R-CADE** dirancang untuk mempermudah operasional stand kelas XI RPL yang menawarkan dua layanan utama:
1. **Rental Gaming PC**: Penyewaan PC gaming dengan sistem durasi (15m, 30m, 60m).
2. **Penjualan Cookies**: Penjualan aneka varian cookies lezat dengan opsi bundling hemat (Game + Cookies).

Sistem ini memastikan antrean penggunaan PC tercatat rapi, tidak terjadi jadwal bentrok, stok cookies terpantau otomatis, transaksi tercatat transparan, dan pengunjung dapat memantau ketersediaan PC langsung dari smartphone mereka tanpa harus bertanya ke kasir.

---

## ✨ Fitur-Fitur Utama

### 🌐 1. Landing Page Publik (Customer View)
* **Branding Cyberpunk/Arcade**: Visual modern bertema gaming dengan background mesh gradient animasi dan floating 3D/gaming icons.
* **Katalog & Pricelist**: Informasi harga sewa rental game, harga cookies, dan paket bundling hemat.
* **Live PC Status**: Pemantauan real-time ketersediaan PC (Kosong / Sedang Dipakai beserta sisa hitung mundur durasi).
* **Visualisasi Jadwal Booking**: Tampilan matriks jam interaktif per 15 menit agar calon pelanggan tahu jadwal kosong dan jam sibuk stand.

### 💼 2. Dashboard Admin & Kasir (POS)
* **Akses Terproteksi**: Login rahasia (`/secret-login`) berbasis otentikasi Supabase.
* **Ringkasan Keuangan (Real-Time Stats)**:
  * Total pendapatan (Rp).
  * Total cookies terjual (item).
  * Total sesi game yang berjalan.
* **Input Transaksi Cepat & Fleksibel**:
  * Transaksi Game / Bundling (pilihan customer, durasi, PC target, opsi bundling cookies).
  * Transaksi Cookies Mandiri (pilihan varian dan jumlah).
* **Multi-Metode Pembayaran**:
  * **QRIS**: Tampilan QRIS statis untuk scan pembayaran digital.
  * **Tunai (Cash)**: Kalkulator otomatis uang diterima dan nominal kembalian.
* **Manajemen Stok Real-Time**: Penambahan dan pengurangan stok cookies per varian; paket bundling otomatis nonaktif jika stok habis.
* **Struk Digital & Unduh Laporan Transaksi**: Kemudahan cetak struk transaksi dan ekspor rekapan data.

### 🖥️ 3. Client Display PC Dashboard (`/pc-dashboard`)
* **Tampilan Khusus Monitor Klien**: Ditujukan untuk monitor PC rental yang sedang aktif.
* **Status Layar Penuh**:
  * Saat **Kosong**: Menampilkan instruksi untuk menuju meja kasir.
  * Saat **Digunakan**: Menampilkan nama penyewa, pesan sambutan, dan hitung mundur sisa waktu bermain.
* **Peringatan Suara Otomatis (Web Speech Synthesis)**: Notifikasi audio berbahasa Indonesia pada menit ke-5, menit ke-1, 10 detik terakhir, dan saat waktu sewa habis.
* **Logout Terlindungi PIN**: Mencegah pengguna menyudahi atau keluar dari mode client tanpa izin operator.

---

## 🛠️ Teknologi & Stack yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur modern berbasis React SPA:

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Library UI modern untuk performa rendering optimal |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Pengetikan statis untuk keamanan dan keandalan kode |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) | Build tool super cepat dengan Fast HMR |
| **Styling** | Vanilla CSS + CSS Variables | Desain arcade futuristik, neon glow, dan responsive design |
| **Animasi & Transisi** | [Framer Motion](https://www.framer.com/motion/) | Animasi kartu, modal dialog, dan status transisi halus |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Kumpulan icon modern dan konsisten |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) | Manajemen navigasi SPA dan role-based Protected Routes |
| **Backend & Database** | [Supabase](https://supabase.com/) | PostgreSQL database, Authentication, dan Realtime Subscriptions |
| **Fitur Suara** | Web Speech Synthesis API | Notifikasi audio timer berbahasa Indonesia tanpa library eksternal |

---

## 📂 Struktur Direktori Proyek

```text
JobFair/
├── concept/                     # Dokumen konsep, skema DB, dan aset desain
│   ├── Full_Documentation_Rental_XIRPL_v2.md
│   ├── Skema_Database_JobFair_XIRPL.md
│   ├── logo_rcade_rpl.png
│   └── poster_jobfair.jpeg
├── public/                      # Aset publik statis (favicon, logo, QRIS, dsb)
├── src/
│   ├── assets/                  # File aset gambar dan media
│   ├── components/              # Komponen modular UI (Navbar, Hero, Menu, PC Status, dll)
│   ├── lib/
│   │   └── supabase.ts          # Inisialisasi client Supabase
│   ├── pages/                   # Halaman utama aplikasi
│   │   ├── LandingPage.tsx      # Halaman utama untuk pengunjung umum
│   │   ├── LoginPage.tsx        # Halaman autentikasi kasir & PC client
│   │   ├── AdminDashboard.tsx   # Dashboard kasir & kontrol operasional
│   │   └── PcDashboard.tsx      # Dashboard monitor client per PC
│   ├── App.tsx                  # Routing & role-based route guard
│   ├── main.tsx                 # Titik masuk utama aplikasi React
│   └── index.css                # Style global, typography Orbitron & Inter
├── .env.example                 # Template variabel lingkungan
├── package.json                 # Konfigurasi dependensi dan script npm
├── tsconfig.json                # Konfigurasi TypeScript compiler
└── vite.config.ts               # Konfigurasi Vite
```

---

## 🚀 Panduan Memulai (Getting Started)

### Prasyarat
Pastikan komputer Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (versi 18.x atau yang lebih baru direkomendasikan)
* Akun dan Project [Supabase](https://supabase.com/)

### Langkah Instalasi

1. **Clone repositori**:
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd JobFair
   ```

2. **Instal seluruh dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` lalu lengkapi kredensial Supabase project Anda:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Setup Database di Supabase**:
   Jalankan query skema SQL yang berada di panduan [concept/Skema_Database_JobFair_XIRPL.md](concept/Skema_Database_JobFair_XIRPL.md), yang mencakup tabel:
   * `products` (katalog produk game, varian cookies, dan paket bundling)
   * `transactions` (header riwayat transaksi dan pembayaran)
   * `transaction_items` (detail item penjualan)
   * `pc_sessions` (sesi dan jadwal aktif masing-masing PC)
   
   > 💡 **Penting:** Pastikan fitur **Supabase Realtime** diaktifkan pada tabel `pc_sessions` dan `products` agar status update seketika tanpa refresh browser.

5. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:5173`.

---

## 🧭 Panduan Rute & Akses (Navigation)

* **`/` (Landing Page)**: Akses publik untuk pengunjung melihat menu, harga sewa, dan ketersediaan PC live.
* **`/secret-login`**: Halaman login untuk kasir/admin stand serta akun client PC.
* **`/admin`**: Dashboard khusus operator/kasir untuk mengelola transaksi, memantau pendapatan, dan mengatur sesi PC.
* **`/pc-dashboard`**: Tampilan monitor client PC yang login menggunakan akun PC (misal: `pc1@...`, `pc2@...`, dst).

---

## 📜 Script Tersedia

* `npm run dev`: Menjalankan aplikasi dalam mode pengembangan lokal (Vite HMR).
* `npm run build`: Melakukan type check (`tsc`) dan membangun bundle produksi (`dist`).
* `npm run preview`: Melihat pratinjau hasil build secara lokal.
* `npm run lint`: Menjalankan pemeriksaan kode menggunakan ESLint.

---

## 👥 Kontribusi & Kredit

Proyek ini dikembangkan oleh tim **XI Rekayasa Perangkat Lunak (RPL)** untuk menyukseskan kegiatan pameran dan Job Fair sekolah.
