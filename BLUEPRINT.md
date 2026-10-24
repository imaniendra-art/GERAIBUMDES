# BLUEPRINT: Transformasi "Kelola BUMDes" & BUMDes Lifecycle Management

## 1. Ringkasan & Latar Belakang
Sebelumnya menu di sidebar admin bernama **"Verifikasi BUMDes"**, yang menimbulkan kebingungan karena seolah-olah hanya digunakan untuk meninjau pendaftaran baru. Padahal halaman tersebut adalah pusat pengelolaan seluruh BUMDes (aktif, pending, suspended, ditolak).

Blueprint ini mendokumentasikan refaktor menu menjadi **"Kelola BUMDes"**, penambahan status siklus hidup **`SUSPENDED` (Ditangguhkan)**, aksi **Suspend & Unsuspend**, perbaikan modal **Hapus BUMDes**, integrasi **Reset Password Pengelola**, serta proteksi tampilan dashboard jika akun BUMDes sedang ditangguhkan.

---

## 2. Arsitektur Komponen & Alur Data

### A. Navigasi & Tampilan Admin
1. **Sidebar Navigation (`AdminSidebarNav.tsx`):**
   - Label diubah dari *"Verifikasi BUMDes"* menjadi **"Kelola BUMDes"**.
   - Badge angka tetap menampilkan jumlah BUMDes yang berstatus `PENDING_VERIFICATION`.
2. **Halaman Utama (`/admin/bumdes/page.tsx`):**
   - Header diperbarui menjadi **"Kelola BUMDes"**.
   - Filter Status Tab/Dropdown:
     - `ALL` (Semua Status)
     - `PENDING_VERIFICATION` (Menunggu Verifikasi)
     - `VERIFIED` (Aktif)
     - `SUSPENDED` (Ditangguhkan)
     - `REJECTED` (Ditolak)
   - Kartu Statistik: Total, Menunggu Verifikasi, Aktif, Ditangguhkan, Ditolak.
   - Sorting: BUMDes pending verifikasi di urutan teratas, diikuti aktif, suspended, dan ditolak.

### B. Pusat Aksi BUMDes (`BumdesActionButtons.tsx` & `/admin/bumdes/[id]`)
1. **Suspend (Bekukan Sementara):**
   - Muncul modal alasan penangguhan.
   - Mengubah status `BumdesProfile` menjadi `SUSPENDED`, mencatat `suspensionReason`, tanggal, dan admin yang menangguhkan.
   - Otomatis mengubah `Store` menjadi `INACTIVE` sehingga produk tidak muncul di marketplace publik.
2. **Unsuspend (Aktifkan Kembali):**
   - Mengubah status `BumdesProfile` kembali ke `VERIFIED`.
   - Mengubah status `Store` kembali ke `ACTIVE`.
3. **Reset Password Pengelola (`resetBumdesUserPassword`):**
   - Memungkinkan admin memberikan password baru atau default sementara untuk akun pengelola BUMDes.
4. **Hapus BUMDes (`deleteBumdesProfile`):**
   - Tetap melindungi data jika masih ada produk aktif, mengarahkan admin untuk men-suspend terlebih dahulu jika hanya ingin menonaktifkan sementara.

### C. Proteksi Dashboard BUMDes (`/dashboard/page.tsx`)
- Jika user login sebagai `BUMDES_ADMIN` dan profilnya berstatus `SUSPENDED`, tampilkan layar informasi khusus bahwa akun ditangguhkan beserta alasan penangguhan dan kontak admin, tanpa memberi akses ke menu kelola toko/produk.

---

## 3. Log Keputusan Teknis

| # | Keputusan | Alternatif Dipertimbangkan | Rasional |
|---|-----------|---------------------------|----------|
| 1 | Mengubah nama menu menjadi "Kelola BUMDes" | Memisahkan menu "Verifikasi BUMDes" dan "Daftar BUMDes" | Lebih efisien dalam 1 menu terpadu dengan filter tab status dan badge alert |
| 2 | Menambahkan status `SUSPENDED` & field `suspensionReason` | Langsung menghapus akun | Menghapus akun menghilangkan riwayat audit dan data pesanan. Suspend memungkinkan toko disembunyikan dan diaktifkan kembali sewaktu-waktu |
| 3 | Otomatis nonaktifkan `Store` saat BUMDes di-suspend | Membiarkan toko aktif | Menjamin etalase publik dan produk BUMDes langsung bersih dari hasil pencarian marketplace saat kena suspend |
| 4 | Fitur Reset Password Pengelola di halaman admin | Meminta user klik "Lupa Password" sendiri | Pengurus desa seringkali mengalami kendala teknis email/OTP, sehingga bantuan langsung dari Admin Platform sangat krusial |
| 5 | Mengubah menu "Verifikasi Produk" menjadi "Kelola Produk" | Membiarkan nama "Verifikasi Produk" | Mencerminkan fungsi sebenarnya sebagai katalog menyeluruh semua produk BUMDes, bukan hanya produk pending verifikasi |

---

## 4. Transformasi "Kelola Produk"
- **Sidebar Admin (`AdminSidebarNav.tsx`):**
  - Diubah dari *"Verifikasi Produk"* menjadi **"Kelola Produk"** (dengan badge counter produk baru yang membutuhkan persetujuan).
- **Halaman Utama (`/admin/produk/page.tsx`):**
  - Judul: **"Kelola Produk"**
  - 5 Kartu Statistik interaktif (Total Produk, Perlu Verifikasi, Produk Aktif, Nonaktif, Ditolak).
  - Kolom pencarian nama produk (`?q=...`).
  - Tab filter status cepat lengkap dengan counter produk per status.

---

## 5. Sistem Upload Gambar Lokal & Kompresi Otomatis (Client-Side Resizer & WebP)

### A. Latar Belakang & Kebutuhan Server Lokal
Aplikasi dijalankan pada infrastruktur **server lokal (on-premise)** tanpa ketergantungan pada layanan cloud berbayar (S3/Cloudinary). Pengguna sering mengambil foto produk langsung dari kamera smartphone beresolusi tinggi (4 MB – 12 MB). Jika diunggah secara mentah:
1. Penyimpanan disk server lokal akan cepat penuh.
2. Proses upload memakan bandwidth besar dan lambat di area pedesaan dengan sinyal internet terbatas.
3. Beban CPU server lokal akan berat jika harus meresize foto secara bersamaan (server bottleneck).

### B. Arsitektur Solusi
1. **Client-Side Compression (`imageCompressor.ts`):**
   - Menggunakan HTML5 Canvas API di browser pengunggah sebelum paket data dikirim ke jaringan.
   - Mengubah skala resolusi secara proporsional (maksimal 1200x1200px untuk produk, 600x600px untuk logo, 1600px untuk banner).
   - Mengonversi format ke **WebP modern** dengan kualitas `0.82`.
   - Hasil: Ukuran berkas terpangkas drastis dari **~4-10 MB menjadi ~80-150 KB (penghematan 95-98%)**, dengan kualitas visual tetap tajam.
2. **API Endpoint Penyimpanan Lokal (`/api/upload/route.ts`):**
   - Menerima `FormData` dengan validasi sesi terotentikasi.
   - Memvalidasi MIME type (`image/*`) dan folder tujuan yang diizinkan (`products`, `logos`, `banners`, `payments`).
   - Menyimpan berkas ke direktori fisik lokal: `public/uploads/[folder]/` dengan nama aman dan timestamp unik.
   - Mengembalikan URL publik statis (misal `/uploads/products/products_17928...webp`).
3. **Komponen Reusable `ImageUploader.tsx` (Dual Mode: Single & Multi):**
   - **Mode Single (`multiple={false}`):** Untuk Logo BUMDes (600px) dan Banner Toko (1600px).
   - **Mode Multiple (`multiple={true}`, maks 5 foto):**
     - Memungkinkan memilih banyak foto sekaligus atau menambahkannya bertahap.
     - Setiap foto otomatis di-resize dan dikompresi ke WebP sebelum diunggah ke server lokal.
     - Grid preview responsif dengan penanda khusus **"Foto Utama"** pada foto pertama.
     - Tombol **"Set Utama"** untuk memindahkan foto pilihan menjadi foto utama/sampul produk.
     - Tombol hapus mandiri per foto.
     - Opsi input URL manual sebagai fallback fleksibel.
4. **Galeri Produk Publik Interaktif (`ProductImageGallery.tsx`):**
   - Menampilkan foto utama dengan zoom hover dan rasio square rapi.
   - Menampilkan baris thumbnail foto produk yang dapat diklik untuk berganti foto tampilan secara langsung.
   - Dilengkapi indikator indeks foto (contoh: `1 / 4`).
5. **Integrasi Formulir:**
   - Admin Edit Produk (`/admin/produk/edit/[id]`): Multi-Image (maks 5 foto)
   - BUMDes Tambah Produk (`/dashboard/produk/tambah`): Multi-Image (maks 5 foto)
   - BUMDes Edit Produk (`/dashboard/produk/[id]/edit`): Multi-Image (maks 5 foto)
   - BUMDes Profil Toko (`/dashboard/toko/edit`): Single-Image untuk Logo & Banner

---

## 6. Restrukturisasi Navigasi Sidebar Admin & Manajemen Akun Terpadu

### A. Pengelompokan Logis Menu Sidebar (`AdminSidebarNav.tsx`)
Sebelumnya menu di sidebar admin tidak memiliki pengelompokan yang jelas (Manajemen Akun bahkan bercampur di bawah grup Master Data). Kini dikelompokkan menjadi 5 kategori profesional:
1. **Ringkasan (Dashboard Utama):**
   - Ringkasan statistik performa platform (`/admin`).
2. **BUMDes & Produk (Operasional Toko & Desa):**
   - Kelola BUMDes (`/admin/bumdes`) + badge BUMDes pending verifikasi.
   - Kelola Produk (`/admin/produk`) + badge produk pending verifikasi.
3. **Pengelolaan Keuangan & Transaksi:**
   - Pesanan & Transaksi (`/admin/pesanan`).
   - Laporan Transaksi Keuangan (`/admin/laporan/transaksi`).
4. **Pengguna & Akses (Khusus Manajemen Akun):**
   - Manajemen Akun (`/admin/akun`).
   - Log Aktivitas Admin (`/admin/laporan/aktivitas`).
5. **Master Data (Data Induk Sistem):**
   - Kategori Produk (`/admin/master/kategori`).
   - Jenis Usaha (`/admin/master/jenis-usaha`).
   - Wilayah Operasional (`/admin/master/wilayah`).
6. **Pintasan Sistem:**
   - Kembali ke Marketplace (`/`).

### B. Pusat Manajemen Akun & Reset Password (`/admin/akun`)
1. **Statistik Pengguna:**
   - Menampilkan 3 kartu ringkasan: Total Akun, Pengelola BUMDes, dan Tim Admin Platform.
2. **Tab Filter Cepat:**
   - Filter instan: "Semua Akun", "Pengelola BUMDes", dan "Tim Admin".
   - Pencarian real-time berdasarkan Nama, Email, atau Nomor HP.
3. **Pusat Aksi Reset Password (`AccountActions.tsx`):**
   - Modal interaktif dengan 2 opsi:
     - Opsi 1: Reset ke password standar default (`12345678`).
     - Opsi 2: Ketik password kustom baru sesuai permintaan pengelola/admin.
   - Tampilan password hasil reset dengan tombol instan **"Salin Password"** untuk memudahkan admin mengirimkannya ke WhatsApp pemohon.
   - Audit trail pencatatan aktivitas admin ke database (`logAdminActivity`).
4. **Modal Konfirmasi Hapus Akun:**
   - Peringatan jelas bahwa menghapus akun pengelola akan menghapus profil BUMDes dan toko terkait.

### C. Layout Viewport Lock (Sidebar 1 Layar Tanpa Scroll)
- **Sidebar (`h-screen overflow-hidden`):** Menggunakan padding dan tipografi kompak (~450px total tinggi) sehingga seluruh elemen dari header brand hingga tombol "Keluar" muat utuh dalam 1 layar tanpa perlu di-scroll.
- **Area Konten Utama (`flex-1 h-screen overflow-y-auto`):** Menjadi satu-satunya area yang dapat di-scroll saat isi halaman panjang, menjaga kontrol navigasi admin tetap statis dan responsif.
