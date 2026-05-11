# Dokumentasi Pengembangan: Sistem Website Rental Game & Penjualan Cookies (XI RPL)

Dokumen ini disusun sebagai panduan lengkap bagi developer (manusia maupun AI) untuk membangun sistem website manajemen rental game dan penjualan cookies. Sistem ini dirancang khusus untuk event stand kelas XI RPL.

---

## 1. Pendahuluan
**Nama Proyek:** Game-IT & Cookies Management System
**Tujuan:** Mengelola antrean rental game (3 PC), pencatatan penjualan cookies, serta penyediaan informasi real-time kepada pelanggan melalui landing page.

Website ini berfungsi sebagai:
1.  **Informasi Publik:** Menampilkan harga, menu, dan ketersediaan PC secara live.
2.  **Point of Sales (POS):** Alat kasir untuk menginput transaksi dan menghitung keuangan secara otomatis.
3.  **Booking Manager:** Mengatur jadwal penggunaan PC agar tidak bentrok.

---

## 2. Struktur Pengguna (User Roles)
* **Pelanggan (Public):** Hanya bisa melihat informasi tanpa login.
* **Admin/Kasir (Private):** Memiliki akses penuh ke dashboard manajemen. Halaman login harus tersembunyi (contoh: `/secret-login`).

---

## 3. Fitur Utama & Spesifikasi Halaman

### A. Landing Page (Halaman Utama Pelanggan)
Halaman ini adalah wajah dari stand XI RPL. Harus menarik dan informatif.
* **Hero Section:** Branding stand XI RPL, slogan, dan pengenalan produk.
* **Menu & Pricelist:**
    * **Rental Game:** 15m (3rb), 30m (5rb), 60m (10rb).
    * **Cookies:** Semua varian (8rb).
    * **Paket Bundling:**
        1. Paket 10k (Cookies + Game 15m).
        2. Paket 12k (Cookies + Game 30m).
* **Benefit Section:** Menjelaskan alasan harus membeli di stand ini.
* **Panel Ketersediaan Real-Time (Live):**
    * Status singkat: "PC 1: KOSONG", "PC 2: DIPAKAI (Sisa 05:20)", dst.
    * **Panel Detail Jadwal:** Visualisasi per jam (grid). Menggunakan slot per 15 menit. Contoh: User bisa melihat jam 13.00-13.15 terisi, tapi 13.15-14.00 kosong.

### B. Dashboard Admin (Halaman Kasir)
Halaman utama setelah login. Berisi kontrol penuh operasional stand.
1.  **Header Transaksi:** Dua tombol besar di paling atas: "Input Transaksi Game" dan "Input Transaksi Cookies".
2.  **Ringkasan Keuangan (Card Stats):**
    * Total Pendapatan (Rp).
    * Total Terjual (Item Cookies).
    * Total Sesi Game (Jumlah transaksi game).
3.  **Panel Monitor PC (Utama):**
    * **Jam Digital:** Menampilkan waktu real-time detik demi detik.
    * **Status 3 PC (PC 1, PC 2, PC 3):**
        * Jika Kosong: Menampilkan teks "KOSONG".
        * Jika Terisi: Menampilkan nama customer, hitung mundur (countdown) sisa waktu, dan tombol **"Selesaikan"** (untuk reset status jika pelanggan berhenti lebih awal).
4.  **Panel Detail Jadwal (Booking Log):**
    * Menunjukkan visualisasi waktu yang sudah di-booking hari ini.
    * Logika: Jika booking jam 12.00 durasi 30 menit, maka kotak 12.00-12.30 berwarna merah. Kotak selanjutnya dimulai dari 12.30.
5.  **Manajemen Stok:** Tombol untuk update jumlah stok cookies per varian.

---

## 4. Alur Transaksi (Workflow)

### Transaksi Game / Paket
1.  Kasir klik "Input Transaksi Game".
2.  Input: Nama Customer, Pilih Paket (15/30/60m), Tambahan Cookies (Ya/Tidak), Pilih PC (1/2/3).
3.  Jika memilih "Paket 10k/12k", stok cookies otomatis berkurang.
4.  Pilih Metode Pembayaran:
    * **QRIS:** Munculkan gambar QRIS Statis. Kasir verifikasi uang masuk di HP, lalu klik "Bayar".
    * **Cash:** Input "Uang Diterima". Sistem otomatis menghitung "Kembalian". Klik "Bayar".
5.  Sistem menyimpan ke database, status PC berubah jadi sibuk, countdown dimulai, dan cetak struk digital.

### Transaksi Cookies Saja
1.  Kasir klik "Input Transaksi Cookies".
2.  Pilih varian dan jumlah.
3.  Pilih metode pembayaran (sama seperti alur game).
4.  Sistem memotong stok dan menyimpan data penjualan.

---

## 5. Logika Teknis untuk Developer

### Database Schema (Saran)
* `sessions`: id, pc_id, start_time, end_time, status (active/done).
* `transactions`: id, customer_name, total_price, payment_type, items (json/text).
* `stocks`: id, variant_name, quantity.

### Logika Penjadwalan
* **Base Interval:** 15 menit.
* **Pengecekan Bentrok:** Sistem tidak boleh mengizinkan input transaksi di PC dan jam yang sama.
* **Otomasi Status:** Gunakan fungsi `setInterval` di frontend untuk mengecek apakah waktu saat ini sudah melewati `end_time`. Jika ya, kirim request ke backend untuk mengubah status PC menjadi kosong.

---

## 6. Evaluasi & Detail Khusus
1.  **Struk Digital:** Struk harus memuat Nama Stand (XI RPL), Tanggal, Nama Customer, Detail Item, dan Total.
2.  **Validasi Stok:** Jika stok cookies 0, tombol paket 10k dan 12k di dashboard admin harus dinonaktifkan (disabled).
3.  **Visualisasi Jadwal:** Gunakan warna yang kontras (Hijau = Kosong, Merah = Terisi) pada panel detail jadwal agar kasir/user tidak bingung.
