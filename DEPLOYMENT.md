# Panduan Deployment (Vercel & MongoDB Atlas)

Dokumen ini berisi panduan teknis langkah demi langkah untuk melakukan *deployment* aplikasi BUMDesMart ke _production_ untuk kebutuhan *Demo/MVP*.

---

## A. Persiapan MongoDB Atlas
Karena Vercel (atau platform *serverless* lainnya) tidak menyediakan *database* bawaan, gunakan MongoDB Atlas.
1. Buat akun dan _Cluster_ gratis di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Di menu **Database Access**, buat pengguna (*User*) baru beserta kata sandinya. Pastikan kata sandi aman.
3. Di menu **Network Access**, tambahkan IP Address `0.0.0.0/0` agar aplikasi dari server cloud manapun bisa terhubung. *Catatan Keamanan: Ini aman selama kredensial pengguna database Anda kuat.*
4. Buka menu **Database**, lalu klik **Connect** -> **Connect your application**.
5. Salin *Connection String*. Formatnya mirip dengan:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/geraibumdes?retryWrites=true&w=majority`
   *(Ubah `<username>` dan `<password>` sesuai yang Anda buat di langkah 2, dan pastikan nama database diatur ke `geraibumdes` sebelum parameter `?retryWrites`).*

---

## B. Persiapan GitHub
1. **Penting:** Pastikan file rahasia tidak ikut di-*commit*. File `.env`, `.env.local`, `.env.production` dan data besar seperti `data/regions.json` sudah dimasukkan ke dalam `.gitignore`.
2. *Commit* dan *Push* semua kode sumber (*source code*) terbaru proyek ini ke repositori GitHub pribadi Anda.

---

## C. Persiapan Vercel
1. Daftar atau Login ke [Vercel](https://vercel.com).
2. Klik tombol **Add New Project**.
3. Pilih (*Import*) repositori GitHub proyek `geraibumdes.com` milik Anda.
4. Di halaman pengaturan _import_, buka bagian **Environment Variables** dan masukkan *key-value* berikut satu per satu:
   - `MONGODB_URI` = *(Masukkan Connection String Atlas Anda dari Langkah A)*
   - `JWT_SECRET` = *(Gunakan string acak minimal 32 karakter, misalnya `super_secret_key_demo_geraibumdes_2026!@#`)*
   - `NEXT_PUBLIC_APP_URL` = `https://<nama-domain-vercel-anda>.vercel.app`
   - `NODE_ENV` = `production`
5. Klik **Deploy** dan tunggu proses kompilasi (*build*) selesai hingga muncul tulisan *Congratulations*.

---

## D. Mengisi Data Demo ke Database Production (Atlas)
Setelah _deploy_ sukses, website Anda sudah aktif, namun databasenya masih kosong. Anda perlu mengisi (*seed*) data akun demo dan data sampel wilayah dari komputer lokal Anda:

1. Di komputer lokal Anda, buka file `.env.local`.
2. **Ubah sementara** nilai `MONGODB_URI` menjadi *Connection String* Atlas Anda (sama persis dengan yang dimasukkan ke Vercel).
3. Jalankan _script_ pengisian akun demo dan pengaturan awal:
   ```bash
   npx tsx scripts/seed.ts
   ```
4. Jalankan _script_ pengisian sampel wilayah (*dropdown* lokasi demo):
   ```bash
   npx tsx scripts/import-regions.ts
   ```
   *(Script ini akan memuat file `data/regions.sample.json` jika `data/regions.json` versi nasional tidak tersedia).*
5. **Setelah selesai**, kembalikan nilai `MONGODB_URI` di file `.env.local` menjadi URL MongoDB lokal Anda (`mongodb://127.0.0.1:27017/geraibumdes`).

---

## E. Checklist Pasca Deploy
Lakukan tes fungsi dasar di domain Vercel Anda:
- [ ] Buka Homepage (`/`).
- [ ] Test Login menggunakan `admin@geraibumdes.com`.
- [ ] Test Register akun BUMDes baru.
- [ ] Cek Direktori Produk dan Direktori Toko.
- [ ] Buka halaman Profil Toko untuk mengecek apakah *Cascading Dropdown* Wilayah beroperasi dengan baik.
- [ ] Lakukan simulasi transaksi *Checkout*.
- [ ] Akses Laporan Penjualan/Pembelian.

---

## F. Risiko & Peringatan Keamanan ⚠️
1. **Jangan *Seed* Sembarangan:** Jangan menjalankan `npx tsx scripts/seed.ts` dua kali berturut-turut di *production* atau saat sistem sedang berjalan, karena script ini bersifat reset (_drop collection_) data awal.
2. **Rahasia *Environment*:** Jangan pernah melakukan *commit* terhadap file `.env.local`.
3. **Database Penuh:** Jika Anda berniat mengimpor data wilayah nasional seluruh Indonesia secara penuh, pastikan layanan Atlas Anda mendukung lebih dari 512MB (*Free Tier*). Untuk keperluan *Demo/MVP*, **sangat disarankan** menggunakan `data/regions.sample.json` saja.
