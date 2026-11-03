// Legal documents and consent checklist for Pantauku.
//
// IMPORTANT: this is a working draft, not legal advice. Have it reviewed by
// an Indonesian lawyer (UU 27/2022 PDP, UU ITE) before relying on it.
//
// Changing any text that users agree to? Bump LEGAL_VERSION. Every non-admin
// user is then asked to agree again, and the new version is recorded.

export const LEGAL_VERSION = '2026-11-03';

// Fill these in. Empty values are simply left out of the documents.
export const LEGAL_OPERATOR = {
  brand: 'Pantauku',
  // Legal entity name, e.g. "PT Contoh Teknologi Indonesia" or the owner's name.
  entity: '',
  address: '',
  email: '',
  phone: '',
  // Keep in sync with how long the server actually keeps position history.
  retention:
    'selama akun aktif, dan paling lama 12 (dua belas) bulan setelah langganan berakhir, kecuali hukum mewajibkan lain',
};

const operatorName = () =>
  LEGAL_OPERATOR.entity
    ? `${LEGAL_OPERATOR.brand} (${LEGAL_OPERATOR.entity})`
    : LEGAL_OPERATOR.brand;

const contactLine = () => {
  const parts = [
    LEGAL_OPERATOR.email && `email ${LEGAL_OPERATOR.email}`,
    LEGAL_OPERATOR.phone && `telepon/WhatsApp ${LEGAL_OPERATOR.phone}`,
    LEGAL_OPERATOR.address && `alamat ${LEGAL_OPERATOR.address}`,
  ].filter(Boolean);
  return parts.length
    ? `Hubungi kami melalui ${parts.join(', ')}.`
    : 'Hubungi kami melalui admin atau reseller yang mendaftarkan akun Anda.';
};

// Each document: { id, title, sections: [{ heading, paragraphs: [] }] }
export const getDocuments = () => [
  {
    id: 'terms',
    title: 'Syarat dan Ketentuan Penggunaan',
    sections: [
      {
        heading: '1. Para Pihak dan Layanan',
        paragraphs: [
          `Layanan pelacakan GPS ini diselenggarakan oleh ${operatorName()} ("Kami"). "Pengguna" adalah setiap orang yang memiliki akun, termasuk pelanggan langsung, reseller, dan pengguna yang dibuat oleh reseller.`,
          'Layanan mencakup penerimaan, penyimpanan, dan penampilan data lokasi serta data perangkat GPS (kecepatan, status mesin, baterai, kejadian, dan sejenisnya) yang terdaftar pada akun Pengguna.',
        ],
      },
      {
        heading: '2. Penggunaan yang Sah',
        paragraphs: [
          'Pengguna hanya boleh memasang dan mendaftarkan perangkat pada kendaraan atau aset yang dimiliki atau dikuasai secara sah oleh Pengguna, atau atas izin tertulis pemiliknya.',
          'Apabila perangkat dapat menunjukkan lokasi seseorang (misalnya pengemudi, karyawan, atau anggota keluarga), Pengguna wajib memberi tahu orang tersebut dan memperoleh persetujuannya sesuai peraturan perundang-undangan, kecuali dikecualikan oleh hukum.',
          'Pengguna dilarang menggunakan Layanan untuk menguntit, memata-matai, mengancam, memeras, atau tindakan lain yang melanggar hukum atau hak orang lain. Pelanggaran dapat mengakibatkan akun dinonaktifkan tanpa pengembalian biaya, dan Kami dapat menyerahkan data kepada aparat penegak hukum sesuai ketentuan yang berlaku.',
        ],
      },
      {
        heading: '3. Akun, Perintah Perangkat, dan Keamanan',
        paragraphs: [
          'Pengguna bertanggung jawab menjaga kerahasiaan kata sandi dan atas seluruh aktivitas pada akunnya.',
          'Perintah jarak jauh (misalnya blokir mesin) hanya tersedia bagi Pengguna yang memintanya dan hanya boleh dikirim dalam kondisi aman, sebaiknya saat kendaraan berhenti. Pengguna bertanggung jawab penuh atas akibat pengiriman perintah, termasuk risiko mematikan kendaraan yang sedang melaju. Kami dan reseller tidak bertanggung jawab atas kerugian akibat perintah yang dikirim dari akun Pengguna.',
          'Untuk keperluan dukungan teknis, administrator Layanan atau reseller yang mengelola akun Pengguna dapat masuk ke akun Pengguna. Akses tersebut hanya dilakukan untuk membantu Pengguna dan tercatat dalam log sistem.',
        ],
      },
      {
        heading: '4. Langganan dan Penonaktifan',
        paragraphs: [
          'Layanan bersifat prabayar per perangkat. Perangkat baru mendapat masa uji pasang 3 (tiga) hari dan terkunci otomatis apabila belum diaktivasi. Aktivasi diproses paling lambat 1x24 jam setelah pembayaran diterima.',
          'Perangkat yang masa langganannya berakhir akan dikunci secara otomatis, dan data yang dikirim selama terkunci dapat tidak tersimpan.',
          'Biaya yang telah dibayarkan tidak dapat dikembalikan, kecuali ditentukan lain secara tertulis.',
        ],
      },
      {
        heading: '5. Batasan Tanggung Jawab',
        paragraphs: [
          'Akurasi lokasi bergantung pada sinyal GPS, jaringan seluler, dan kondisi perangkat, sehingga data dapat terlambat, tidak akurat, atau tidak tersedia. Layanan tidak dimaksudkan sebagai satu-satunya sarana keselamatan atau pencegahan pencurian.',
          'Sepanjang diizinkan hukum, Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan atau ketidaktersediaan Layanan.',
        ],
      },
      {
        heading: '6. Hukum yang Berlaku',
        paragraphs: [
          'Ketentuan ini tunduk pada hukum Negara Republik Indonesia dan dibuat dalam Bahasa Indonesia.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Kebijakan Privasi dan Persetujuan Data Lokasi',
    sections: [
      {
        heading: '1. Data yang Diproses',
        paragraphs: [
          'Data akun (nama, email, nomor telepon), data perangkat (IMEI/ID, nama, model), data lokasi dan riwayat perjalanan, data telemetri (kecepatan, status mesin, baterai, alarm), serta catatan aktivitas akun.',
        ],
      },
      {
        heading: '2. Tujuan Pemrosesan',
        paragraphs: [
          'Menampilkan lokasi dan riwayat perangkat kepada Pengguna yang berhak, mengirim notifikasi, membuat laporan, mengelola langganan, menjaga keamanan Layanan, dan memenuhi kewajiban hukum. Data tidak dijual kepada pihak ketiga.',
        ],
      },
      {
        heading: '3. Akses dan Pihak Lain',
        paragraphs: [
          'Data perangkat dapat dilihat oleh Pengguna pemilik akun, reseller yang mengelola akun tersebut, dan administrator Layanan untuk keperluan dukungan teknis. Reseller memproses data Pengguna atas nama Kami dan terikat kewajiban kerahasiaan. Data dapat diproses oleh penyedia server dan peta yang Kami gunakan, serta diberikan kepada aparat penegak hukum berdasarkan permintaan yang sah.',
          'Kami mencatat aktivitas akun (antara lain login, perubahan data, dan pengiriman perintah) untuk keamanan dan penyelesaian sengketa.',
        ],
      },
      {
        heading: '4. Penyimpanan',
        paragraphs: [`Data lokasi disimpan ${LEGAL_OPERATOR.retention}.`],
      },
      {
        heading: '5. Hak Pengguna',
        paragraphs: [
          'Sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, Pengguna berhak mengakses, memperbaiki, meminta penghapusan data, serta menarik kembali persetujuan. Penarikan persetujuan dapat membuat Layanan tidak dapat digunakan.',
          contactLine(),
        ],
      },
    ],
  },
  {
    id: 'reseller',
    title: 'Ketentuan Tambahan untuk Reseller',
    managerOnly: true,
    sections: [
      {
        heading: 'Kewajiban Reseller',
        paragraphs: [
          'Reseller wajib memastikan setiap pelanggannya membaca dan menyetujui Syarat dan Ketentuan serta Kebijakan Privasi ini sebelum menggunakan Layanan.',
          'Reseller wajib menjaga kerahasiaan data pelanggan, hanya mengakses data untuk keperluan dukungan pelanggan, dan tidak membagikannya kepada pihak lain.',
          'Reseller tidak boleh membuat janji kepada pelanggan yang melebihi ketentuan Layanan, dan bertanggung jawab atas penagihan kepada pelanggannya sendiri.',
          'Reseller membayar biaya layanan kepada Kami per perangkat. Aktivasi dan perpanjangan perangkat hanya dilakukan oleh Kami setelah pembayaran diterima, paling lambat 1x24 jam.',
          'Reseller dilarang memanipulasi sistem, termasuk mengubah masa aktif, menghapus lalu mendaftarkan ulang perangkat untuk memperoleh masa uji pasang baru, atau mengakses data di luar keperluan dukungan. Seluruh aktivitas tercatat dalam log sistem.',
          'Reseller hanya boleh masuk ke akun pelanggan atas permintaan pelanggan untuk keperluan dukungan.',
          'Apabila kerja sama berakhir atau terjadi pelanggaran, Kami berhak memindahkan pelanggan beserta perangkatnya kepada reseller lain atau mengelolanya secara langsung, dan menonaktifkan akun reseller.',
        ],
      },
    ],
  },
  {
    id: 'opensource',
    title: 'Perangkat Lunak Sumber Terbuka',
    sections: [
      {
        heading: '',
        paragraphs: [
          `${LEGAL_OPERATOR.brand} dibangun menggunakan perangkat lunak sumber terbuka Traccar (https://www.traccar.org), yang dilisensikan di bawah Apache License 2.0. Traccar adalah merek milik pemiliknya dan tidak berafiliasi dengan ${LEGAL_OPERATOR.brand}. Data peta © kontributor OpenStreetMap dan penyedia peta masing-masing.`,
        ],
      },
    ],
  },
];

// Checklist shown on first login (and again whenever LEGAL_VERSION changes).
export const getConsentItems = ({ manager }) =>
  [
    {
      id: 'terms',
      label: 'Saya telah membaca dan menyetujui Syarat dan Ketentuan Penggunaan.',
    },
    {
      id: 'location',
      label:
        'Saya menyetujui pengumpulan, penyimpanan, dan pemrosesan data lokasi dari perangkat yang terdaftar di akun saya, sesuai Kebijakan Privasi.',
    },
    {
      id: 'lawful',
      label:
        'Perangkat dipasang pada kendaraan/aset milik saya atau yang saya kuasai secara sah, dan setiap orang yang lokasinya dapat terlacak sudah diberi tahu dan menyetujui.',
    },
    {
      id: 'nounlawful',
      label:
        'Saya tidak akan menggunakan layanan ini untuk menguntit, memata-matai, atau tindakan lain yang melanggar hukum.',
    },
    {
      id: 'age',
      label: 'Saya berusia minimal 18 tahun atau cakap hukum untuk membuat persetujuan ini.',
    },
    manager && {
      id: 'reseller',
      label:
        'Sebagai reseller, saya menyetujui Ketentuan Tambahan untuk Reseller dan akan memastikan pelanggan saya menyetujui ketentuan ini.',
    },
  ].filter(Boolean);

// User attribute keys where the consent record is stored.
export const CONSENT_ATTRIBUTES = {
  version: 'legalConsentVersion',
  acceptedAt: 'legalConsentAt',
  items: 'legalConsentItems',
  role: 'legalConsentRole',
  userAgent: 'legalConsentUserAgent',
};
