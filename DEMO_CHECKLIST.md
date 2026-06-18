# Checklist Demo (geraibumdes.com)

Skenario demo ini dirancang untuk menunjukkan fungsionalitas inti aplikasi *Marketplace* BUMDes (geraibumdes.com) kepada _stakeholders_ atau investor dalam waktu **10-15 Menit**.

## 1. Persiapan Akun Demo
Pastikan database sudah di-_seed_ (`npx tsx scripts/seed.ts`).
Gunakan kredensial berikut untuk *roleplay* saat demo:

| Peran (Role) | Email | Password | Keterangan |
| --- | --- | --- | --- |
| **Admin Pusat** | `admin@geraibumdes.com` | `12345678` | Menyetujui BUMDes baru, pantau transaksi |
| **BUMDes (Penjual)** | `bumdes@example.com` | `12345678` | BUMDes Maju Bersama (sudah disetujui) |
| **BUMDes (Penjual)** | `sidrap@bumdes.com` | `12345678` | BUMDes Sipatuo Sidrap (dummy) |
| **Pembeli** | `user@example.com` | `12345678` | Akun masyarakat/BUMDes lain pembeli |

---

## 2. Skenario Demo (10 - 15 Menit)

### Babak 1: Eksplorasi Publik (2 Menit)
- [ ] Buka halaman utama (`/`). Tunjukkan bahwa ini adalah platform *B2B/B2C* untuk desa.
- [ ] Klik **Katalog Produk** (`/produk`). Tunjukkan filter kategori dan lokasi wilayah (Cascading Dropdown hasil import wilayah).
- [ ] Klik **Direktori BUMDes** (`/toko`). Perlihatkan daftar BUMDes dari seluruh Indonesia.

### Babak 2: Sudut Pandang Admin Pusat (2 Menit)
- [ ] Login menggunakan `admin@geraibumdes.com`.
- [ ] Buka menu **Verifikasi BUMDes** (`/admin/bumdes`). Tunjukkan bahwa BUMDes yang mendaftar tidak bisa langsung jualan sebelum disetujui.
- [ ] Buka menu **Manajemen Akun** (`/admin/akun`). Tunjukkan kontrol admin untuk _Reset Password_ dan Hapus Akun pengguna.

### Babak 3: Sudut Pandang Penjual / BUMDes (3 Menit)
- [ ] Logout, lalu Login sebagai penjual `bumdes@example.com` (atau buat BUMDes baru jika punya cukup waktu, lalu *approve* pakai akun Admin).
- [ ] Buka menu **Profil Toko** (`/dashboard/toko/edit`). Tunjukkan komponen pilihan wilayah operasional desa (Provinsi -> Kabupaten -> Kecamatan -> Desa).
- [ ] Tunjukkan Rekening Pembayaran yang diatur oleh BUMDes.
- [ ] Pergi ke **Produk Saya** (`/dashboard/produk`), klik *Tambah Produk*, dan buat satu produk baru (misal: "Beras Porang Organik").

### Babak 4: Transaksi & Checkout (Pembeli) (3 Menit)
- [ ] Buka browser dalam mode penyamaran (*Incognito*) / Logout. Login sebagai `user@example.com`.
- [ ] Masuk ke katalog produk, cari produk "Beras Porang Organik" tadi, lalu **Masukkan ke Keranjang**.
- [ ] Buka Keranjang (`/keranjang`) dan lakukan **Checkout**.
- [ ] Isi data alamat pengiriman manual lalu buat pesanan.
- [ ] Di halaman detail pesanan, tunjukkan instruksi pembayaran manual (transfer ke rekening BUMDes Penjual yang tadi diatur).
- [ ] Simulasikan klik **Upload Bukti Pembayaran** (saat ini simulasi bayar).

### Babak 5: Pemrosesan Pesanan (Penjual) (2 Menit)
- [ ] Kembali ke *browser* penjual (`bumdes@example.com`).
- [ ] Tunjukkan ada notifikasi pesanan masuk (ikon Lonceng angka 1 di pojok kanan atas).
- [ ] Klik pesanan yang statusnya `PAID`.
- [ ] Klik tombol **Kirim Pesanan** dan masukkan simulasi Nomor Resi (misal: `RESI-JNE-12345`). Status akan berubah menjadi `SHIPPED`.

### Babak 6: Selesai & Laporan (3 Menit)
- [ ] Kembali ke *browser* pembeli. Klik tombol **Terima Pesanan**. Status berubah menjadi `COMPLETED`.
- [ ] Kembali ke *browser* penjual. Buka **Laporan Penjualan** (`/dashboard/laporan/penjualan`). Tunjukkan laporan yang bisa di-_export_ menjadi CSV.
- [ ] (Opsional) Login kembali sebagai Admin Pusat, dan tunjukkan menu **Laporan Keseluruhan** yang merangkum perputaran uang seluruh BUMDes.

---
**Selesai!** Skenario ini akan secara mulus membuktikan *core value* aplikasi: Transparansi transaksi antar desa, pemberdayaan ekonomi lokal, dan *compliance* master data wilayah Indonesia.
