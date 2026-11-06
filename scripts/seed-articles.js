const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const admin = await mongoose.connection.db.collection('users').findOne({ role: 'SUPER_ADMIN' });
  const bumdesUser = await mongoose.connection.db.collection('users').findOne({ role: 'BUMDES_ADMIN' });
  const store = await mongoose.connection.db.collection('stores').findOne();
  const profile = await mongoose.connection.db.collection('bumdesprofiles').findOne();

  const articlesCol = mongoose.connection.db.collection('articles');
  const count = await articlesCol.countDocuments();

  if (count === 0) {
    await articlesCol.insertMany([
      {
        title: 'BUMDes Ceria Sukses Panen Raya 15 Ton Jagung Hibrida dan Buka Peluang Kemitraan B2B',
        slug: 'bumdes-ceria-sukses-panen-raya-15-ton-jagung-hibrida',
        excerpt: 'Melalui pengelolaan lahan produktif desa, BUMDes Ceria berhasil mencatatkan rekor panen jagung hibrida dan siap memasok kebutuhan industri pakan ternak antar-desa.',
        content: `Kegiatan panen raya jagung hibrida yang diselenggarakan oleh BUMDes Ceria bersama gabungan kelompok tani (Gapoktan) desa berlangsung dengan penuh antusiasme.

Dalam musim panen kali ini, total hasil panen mencapai lebih dari 15 ton jagung pipil kering dengan kadar air standar industri.

## Membuka Peluang Pasokan Antar-Desa dan Antar-BUMDes

Direktur BUMDes Ceria menyatakan bahwa sebagian besar hasil panen telah dipesan oleh mitra peternakan unggas di kabupaten tetangga melalui platform GeraiBUMDes.

> Pemanfaatan platform digital GeraiBUMDes sangat memangkas rantai perantara. Kami dapat bertransaksi langsung dengan pembeli partai besar secara transparan dan harga yang menguntungkan petani desa kami.

### Komitmen Kualitas dan Keberlanjutan

Untuk menjaga konsistensi mutu komoditas, BUMDes Ceria menerapkan standar pasca-panen yang ketat:

- Pengeringan menggunakan fasilitas solar dryer desa
- Pemilahan (sorting) otomatis untuk memastikan biji jagung bebas jamur
- Pengemasan karung goni 50kg dengan segel resmi desa

Bagi rekan-rekan BUMDes atau pelaku usaha yang membutuhkan pasokan jagung berkualitas untuk pakan ternak maupun olahan pangan, dapat langsung memesan melalui etalase toko digital BUMDes Ceria di platform ini.`,
        coverImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=80',
        category: 'Kabar Desa',
        authorType: 'BUMDES_ADMIN',
        authorId: bumdesUser ? bumdesUser._id : admin._id,
        bumdesId: profile ? profile._id : undefined,
        storeId: store ? store._id : undefined,
        status: 'PUBLISHED',
        viewsCount: 14,
        publishedAt: new Date(Date.now() - 3600000 * 24),
        createdAt: new Date(Date.now() - 3600000 * 24),
        updatedAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        title: 'GeraiBUMDes Resmi Hadirkan Ruang Publikasi Kabar BUMDes untuk Seluruh Desa Nusantara',
        slug: 'geraibumdes-resmi-hadirkan-ruang-publikasi-kabar-bumdes',
        excerpt: 'Kini setiap pengurus BUMDes dapat mempublikasikan cerita kesuksesan, agenda desa, dan inovasi produknya secara mandiri ke panggung nasional.',
        content: `Sebagai wujud komitmen dalam memperkuat ekosistem ekonomi desa yang transparan dan berdaya saing, GeraiBUMDes resmi meluncurkan fitur Kabar BUMDes.

Fitur ini memberikan ruang bagi pengurus desa di seluruh Indonesia untuk mendokumentasikan kegiatan nyata mereka, memperluas jangkauan pasar, dan membangun reputasi kelembagaan di mata publik maupun mitra bisnis B2B.

## Fitur Unggulan Kabar BUMDes

Melalui menu baru di dashboard, admin BUMDes kini dapat menikmati kemudahan:

1. Editor berita yang mudah digunakan dengan dukungan format tulisan lengkap
2. Kemampuan menyisipkan foto dokumentasi kegiatan di dalam isi berita
3. Fasilitas unggah dokumen lampiran resmi dalam format PDF (SK, brosur, atau laporan)
4. Fitur Pratinjau Tampilan sebelum berita resmi ditayangkan ke publik

> Transparansi dan publikasi yang konsisten adalah kunci utama dalam membangun kepercayaan mitra bisnis nasional terhadap kapasitas BUMDes kita.

Mari manfaatkan ruang ini untuk saling menginspirasi dan memajukan perekonomian desa Indonesia bersama GeraiBUMDes!`,
        coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        category: 'Pengumuman Resmi',
        authorType: 'SUPER_ADMIN',
        authorId: admin._id,
        status: 'PUBLISHED',
        viewsCount: 38,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log('Seeded 2 sample published articles successfully!');
  } else {
    console.log('Articles already exist in DB:', count);
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
