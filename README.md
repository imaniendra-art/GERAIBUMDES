# geraibumdes.com

Pasar Digital Antar-BUMDes yang memfasilitasi pertemuan antara BUMDes penyedia produk dan BUMDes yang membutuhkan pasokan.

## 🛠️ Pengembangan (Development)

1. *Clone* repositori ini
2. Salin file environment:
   ```bash
   cp .env.example .env.local
   ```
3. Sesuaikan isi `.env.local` dengan *connection string* MongoDB lokal/Atlas Anda.
   *(Penting: File `.env.local` tidak boleh di-commit ke Git untuk menjaga kerahasiaan kredensial).*
4. Install dependensi:
   ```bash
   npm install
   ```
5. Isi database dengan data sampel (jika perlu):
   ```bash
   npx tsx scripts/seed.ts
   ```
6. Jalankan server:
   ```bash
   npm run dev
   ```

Aplikasi bisa diakses di `http://localhost:3040`.

---

## 🚀 Panduan Deployment (Vercel & MongoDB Atlas)

Aplikasi geraibumdes.com dirancang agar siap dideploy dengan cepat dan gratis menggunakan ekosistem Next.js.

### 1. Persiapan Database (MongoDB Atlas)
Karena platform cloud seperti Vercel tidak menyediakan database bawaan, gunakan MongoDB Atlas.
1. Buat akun dan _Cluster_ gratis di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Pergi ke **Database Access**, buat pengguna (User) baru beserta kata sandinya.
3. Pergi ke **Network Access**, tambahkan IP Address `0.0.0.0/0` agar Vercel dapat terhubung dari server cloud manapun.
4. Klik **Connect** -> **Connect your application** dan salin *Connection String*-nya. Ubah `<username>` dan `<password>` sesuai kredensial Anda.

### 2. Deploy ke Vercel
1. Pastikan kode aplikasi Anda sudah di-push ke repositori GitHub.
2. Daftar/Login ke [Vercel](https://vercel.com).
3. Klik **Add New Project**, lalu *import* repositori GitHub `geraibumdes.com` Anda.
4. Di bagian **Environment Variables**, tambahkan:
   - `MONGODB_URI` = *(Connection String Atlas Anda)*
   - `JWT_SECRET` = *(Ketikkan string rahasia yang acak, minimal 32 karakter, misal hasil dari `openssl rand -base64 32`)*
   - `NEXT_PUBLIC_APP_URL` = `https://<nama-domain-vercel-anda>.vercel.app`
   - `NODE_ENV` = `production`
5. Klik **Deploy** dan tunggu proses *build* selesai.

### 3. Mengisi Data (Seeding) di Production
Setelah _deploy_ sukses, database production masih kosong.
1. Di komputer lokal Anda, buka file `.env.local` dan ubah sementara `MONGODB_URI` menjadi *Connection String* Atlas Anda.
2. Jalankan perintah _seed_ akun admin dan data dummy awal:
   ```bash
   npx tsx scripts/seed.ts
   ```
3. Jalankan _script import_ wilayah untuk memasukkan data lokasi:
   ```bash
   npx tsx scripts/import-regions.ts
   ```
   *(Peringatan: Jika Anda tidak punya file `data/regions.json` lengkap, aplikasi otomatis memuat sampel data. Jika Anda sudah menjalankan `npx tsx scripts/download-regions.ts` sebelumnya, seluruh kecamatan di Indonesia akan ter-import).*
4. Kembalikan `MONGODB_URI` di komputer lokal Anda ke database lokal (`mongodb://127.0.0.1...`).

## Menjalankan Seed Database

Proyek ini dilengkapi dengan skrip *seed* untuk mengisi data awal (Kategori, Super Admin, dan BUMDes Dummy seperti Sidrap, Pulau Laut, Gowa, dan Maros).

### Data Wilayah (Master Region)
Untuk mendukung pendaftaran BUMDes dan filter lokasi yang konsisten, aplikasi menggunakan skema wilayah bertingkat (Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan).

**Cara Import Master Wilayah:**
1. Secara bawaan (saat menjalankan `seed.ts`), aplikasi tidak memuat seluruh desa di Indonesia agar proses seeding tetap ringan.
2. Anda harus menyiapkan data wilayah dalam format JSON dan menyimpannya di:
   `data/regions.json`
   *(Catatan: Jika file ini tidak ada, script akan otomatis menggunakan `data/regions.sample.json` yang berisi sampel data beberapa kecamatan di Sulawesi dan Kalimantan).*
3. Jalankan script import dengan perintah:
   ```bash
   npx tsx scripts/import-regions.ts
   ```
4. Script ini aman dijalankan berulang kali (menggunakan metode _upsert_ berdasarkan kode wilayah).

## 🛠️ Pengembangan (Development)

1. *Clone* repositori ini
2. Salin `.env.example` ke `.env.local` dan atur konfigurasi:
   - Pastikan `MONGODB_URI` sudah menunjuk ke *database* MongoDB Atlas atau lokal Anda.
3. Instal semua *dependency*: `npm install`
4. Lakukan pembaruan (Seeding) *database* dasar dengan produk dummy:
   ```bash
   npx tsx scripts/seed.ts
   ```
5. Jalankan *development server*: `npm run dev`

## 🛒 Alur Manajemen Produk (Phase 3)

### 1. Hak Akses
Hanya BUMDes dengan status pendaftaran **VERIFIED** yang diizinkan mengelola produk dan menambah katalog.

### 2. Alur Persetujuan (Approval)
Setiap produk baru yang ditambahkan oleh Pengelola BUMDes akan secara otomatis masuk ke status `WAITING_APPROVAL`. Produk ini belum akan tampil di *marketplace* publik.

### 3. Verifikasi oleh Admin
Masuk menggunakan akun `admin@geraibumdes.com` dan navigasi ke menu **Verifikasi Produk** (`/admin/produk`) untuk menyetujui (`ACTIVE`) atau menolak (`REJECTED`) produk. 

### 4. Harga Grosir
BUMDes dapat mengatur hingga 5 tingkat (*tier*) harga grosir berdasarkan minimal kuantitas pembelian. Fitur ini dirancang khusus untuk memfasilitasi skenario perdagangan antar-BUMDes.

## 📦 Keranjang & Pesanan (Phase 4)

### 1. Keranjang Belanja per Toko
Keranjang belanja dikelompokkan berdasarkan toko penjual menggunakan *Zustand Local Storage*. Checkout wajib dilakukan **per toko** untuk mempermudah perhitungan ongkos kirim.

### 2. Alur Pembelian & Pembayaran B2B Manual
* Pembeli menempatkan pesanan secara spesifik untuk satu BUMDes. Status pesanan: `WAITING_SELLER_CONFIRMATION`.
* Penjual menerima pesanan, mengecek stok barang, dan menentukan harga/metode ongkos kirim. Status pesanan menjadi: `WAITING_PAYMENT`.
* Pembeli menerima instruksi nominal pembayaran (biasanya via WhatsApp atau komunikasi langsung antar-BUMDes) dan **mengunggah URL Bukti Pembayaran** ke sistem.
* Penjual mengonfirmasi bukti transfer dan memproses pesanan hingga dikirim secara manual.

## 👥 Akun Testing (Setelah Menjalankan Seed Script)

| Peran | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@geraibumdes.com` | `admin123` | Mengelola verifikasi BUMDes & Produk |
| **BUMDes Aktif** | `sidrap@bumdes.id` | `bumdes123` | BUMDes Sidrap Maju (Beras, Pertanian) |
| **BUMDes Aktif** | `gowa@bumdes.id` | `bumdes123` | BUMDes Gowa Sejahtera (Sayuran, Olahan) |
| **BUMDes Aktif** | `maros@bumdes.id` | `bumdes123` | BUMDes Maros Mandiri (Jajanan, Madu) |
| **BUMDes Aktif** | `pinrang@bumdes.id` | `bumdes123` | BUMDes Pinrang Berdaya (Beras, Ikan) |
| **BUMDes Aktif** | `parigi@bumdes.id` | `bumdes123` | BUMDes Parigi Makmur (Perkebunan, Kopra) |
| **BUMDes Pembeli** | `pulaulaut@bumdes.id` | `bumdes123` | BUMDes Pulau Laut Sigam (Sembako, Ikan Laut) |

## 🛡️ Skenario Uji Manual & Keamanan (Phase 4.5)

Tahap ini mengunci seluruh celah keamanan Role-Based Access Control (RBAC) pada *server-side* dan memastikan transisi status berjalan sinkron.

### 1. Skenario Akses Halaman (Server Validated)
* BUMDes tidak dapat mengakses halaman `/dashboard/produk` atau `/dashboard/pesanan` kecuali *Store*-nya dalam keadaan `ACTIVE`.
* Pembeli yang iseng menebak URL `/pesanan/ID_ORANG_LAIN` akan dihadang dengan halaman *Not Found* (404) karena verifikasi kepemilikan.

### 2. Validasi Manipulasi Harga (Server Calculated)
* Walau *localStorage* dimanipulasi dengan harga Rp 0, ketika *checkout* API `POST /api/orders` akan mengambil ulang harga asli dari database.
* API juga akan meninjau level Grosir (berdasarkan jumlah produk) dan menentukan Harga Terbaik (*Best Price*) secara *server-side*.

### 3. Peringatan UX Keranjang
* Jika pesanan di keranjang berada di bawah persyaratan *Minimal Order*, sistem akan menampilkan peringatan merah dan tombol `Buat Pesanan` dinonaktifkan sepenuhnya.

## 🎨 Tampilan & Siap Demo (Phase 5)

* **Desain UI/UX Publik**: *Mobile-first*, komponen *reusable* (`ProductCard`, `StoreCard`), dengan *copywriting* dan warna tematik ala desa mandiri (B2B antar-BUMDes).
* **Landing Page**: Menampilkan *flow* studi kasus nyata (Sidrap ke Pulau Laut Sigam) serta menampilkan komoditas BUMDes secara dinamis langsung dari *database*.

## 🚀 Fitur Baru (Phase 6)

*   [x] **Tahap 8**: Direktori Toko BUMDes & Search/Filter Global
*   [x] **Tahap 9**: Admin Master Data (Kategori, Jenis Usaha, Wilayah) Sederhana
*   [x] **Tahap 10**: Laporan Transaksi Sederhana (CSV Export & Rekapitulasi)
*   [x] **Tahap 11**: Finalisasi UX Dashboard/Admin, Konsistensi Tampilan, dan Kesiapan Demo

## Status Terkini
Saat ini berada pada **Tahap 11 (Selesai)**. 
- Aplikasi sekarang memiliki manajemen Master Data terpusat yang dapat dikelola oleh Admin.
- Master data mencakup Kategori Produk, Jenis Usaha, dan Wilayah Sederhana.
- Laporan Transaksi Admin & BUMDes dilengkapi dengan export CSV.
- Seluruh tampilan UI/UX Dashboard (Admin, Penjual, Pembeli) kini konsisten dan disempurnakan dengan badge status seragam, Empty State, serta desain mobile-friendly.
- Siap digunakan untuk sesi demonstrasi BUMDes.
