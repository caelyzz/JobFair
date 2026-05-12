# Skema Database (Supabase / PostgreSQL) - Game-IT & Cookies XI RPL

Dokumen ini berisi rancangan skema database relasional (PostgreSQL) yang akan diimplementasikan pada Supabase. Skema ini telah disesuaikan untuk mendukung fitur hitung kembalian, sistem antrean (waiting list), dan kapasitas 6 PC.

---

## 1. Tabel `products`
Menyimpan katalog item yang dijual (Game, Cookies, dan Paket).

| Kolom | Tipe Data | Keterangan | Atribut / Constraint |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. | `gen_random_uuid()` |
| `name` | `VARCHAR` | Nama produk (Contoh: "Game 15 Menit", "Paket 10k"). | NOT NULL |
| `category` | `VARCHAR` | Kategori: `'game'`, `'cookie'`, atau `'package'`. | NOT NULL |
| `price` | `INT8` | Harga produk. | NOT NULL, `>= 0` |
| `stock` | `INT4` | Stok (Isi `0` untuk game, riil untuk cookies). | NOT NULL, `>= 0` |
| `duration_minutes` | `INT4` | Durasi main (Contoh: `15`, `30`). | Boleh NULL (jika produk murni cookies) |

---

## 2. Tabel `transactions`
Menyimpan header atau struk dari setiap transaksi pembayaran.

| Kolom | Tipe Data | Keterangan | Atribut / Constraint |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. | `gen_random_uuid()` |
| `customer_name` | `VARCHAR` | Nama pelanggan. | NOT NULL |
| `total_amount` | `INT8` | Total uang yang harus dibayar. | NOT NULL, `>= 0` |
| `payment_method` | `VARCHAR` | Metode: `'cash'` atau `'qris'`. | NOT NULL |
| `cash_received` | `INT8` | Uang tunai yang diterima (untuk audit cash). | Boleh NULL |
| `change_amount` | `INT8` | Uang kembalian yang diberikan. | Boleh NULL |
| `payment_status` | `VARCHAR` | Status bayar: `'pending'` atau `'paid'`. | DEFAULT `'paid'` |
| `created_at` | `TIMESTAMPTZ`| Waktu transaksi dibuat. | DEFAULT `now()` |

---

## 3. Tabel `transaction_items`
Menyimpan detail item dari sebuah transaksi (relasi antara tabel transaksi dan produk).

| Kolom | Tipe Data | Keterangan | Atribut / Constraint |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. | `gen_random_uuid()` |
| `transaction_id` | `UUID` | Foreign Key ke `transactions.id`. | ON DELETE CASCADE |
| `product_id` | `UUID` | Foreign Key ke `products.id`. | ON DELETE RESTRICT |
| `quantity` | `INT4` | Jumlah barang/paket yang dibeli. | NOT NULL, `> 0` |
| `subtotal` | `INT8` | Harga total per item (`price * quantity`). | NOT NULL, `>= 0` |

---

## 4. Tabel `pc_sessions`
Menyimpan log, jadwal, dan antrean penggunaan PC.

| Kolom | Tipe Data | Keterangan | Atribut / Constraint |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. | `gen_random_uuid()` |
| `transaction_id` | `UUID` | Foreign Key ke `transactions.id`. | ON DELETE CASCADE |
| `pc_number` | `INT2` | Nomor PC (1 sampai 6). | NOT NULL, `BETWEEN 1 AND 6` |
| `start_time` | `TIMESTAMPTZ`| Jam mulai bermain. | NOT NULL |
| `end_time` | `TIMESTAMPTZ`| Jam selesai bermain. | NOT NULL |
| `status` | `VARCHAR` | Status: `'waiting'`, `'active'`, atau `'finished'`. | DEFAULT `'active'` |

---

## Catatan Implementasi untuk Developer (Supabase)
1. **Authentication Admin:** Gunakan layanan bawaan `auth.users` dari Supabase.
2. **Supabase Realtime:** Wajib aktifkan fitur Realtime pada tabel `pc_sessions` dan `products` (untuk update stok real-time).
3. **RLS (Row Level Security):**
   * **Role Public:** `SELECT` pada `products` dan `pc_sessions`.
   * **Role Admin:** Full access (`ALL`) pada semua tabel.
4. **Trigger Otomatis (Opsional):** Disarankan membuat Database Trigger untuk memotong kolom `stock` di tabel `products` setiap kali ada baris baru masuk ke `transaction_items`.
