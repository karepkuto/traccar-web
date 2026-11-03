# 5. Layar dan Fitur

## 5.1 Peta (layar utama)
- Daftar perangkat berbentuk kartu: ikon status, nama, status/waktu terakhir,
  hitung mundur langganan, chip kecepatan, mesin (ACC) dan baterai.
- **Chip filter cepat** dengan jumlah:
  - admin/reseller: Online, Offline, Uji pasang, Terkunci, Segera habis;
  - pelanggan dengan **≥ 6 perangkat**: Online, Offline, Bergerak, Mesin ON
    (disembunyikan untuk pelanggan dengan perangkat sedikit).
  - Desktop: chip turun baris. HP: satu baris yang bisa digeser.
- **Baris info** "Menampilkan X dari Y · Urut: … · Reset" setiap filter/urutan aktif.
- **Panel filter (⚙)**: Pemilik (admin: reseller & pelanggan; reseller: pelanggannya),
  Status koneksi, Status langganan, Pergerakan, Mesin (ACC), Grup, Geofence,
  Urutkan, Filter di peta. Di HP tampil sebagai lembar dari bawah dengan
  tombol "Tampilkan N perangkat".
- **Urutan**: Sisa masa aktif (terkunci dulu, lalu tersingkat, tanpa masa
  aktif terakhir), Status koneksi, Update terakhir, Nama, Bergerak dulu (pelanggan).
- Peta otomatis mengikuti filter saat filter Pemilik aktif.
- Filter Pergerakan memakai `attributes.motion`, kalau tidak ada memakai
  kecepatan > 1 knot. Filter Mesin hanya mencakup perangkat yang mengirim `ignition`.
- Filter/urutan disimpan di browser (`deviceFilter`, `filterSort`, `filterMap`).
- Banner pengingat langganan: lihat [03 §3.8](03-langganan.md).

## 5.2 Kartu status perangkat
Tombol berlabel: Putar Ulang, Perintah, Ubah, Hapus (**admin saja**),
**Lokasi** (menu "Buka lokasi di": Google Maps, Apple Maps, Street View,
aplikasi navigasi pilihan pengguna; lalu Buat Geofence dan Video Langsung
khusus protokol JT808), dan **Bagikan** (tidak tampil bila atribut server
`disableShare` aktif atau bagi akun sementara).

## 5.2a Tautan bagikan (share)
- Membuat **akun sementara** di server (`temporary`, `readonly`, tertaut hanya
  ke perangkat itu, `expirationTime` = batas tautan; perintah dan laporan
  dimatikan kecuali diaktifkan di konfigurasi server) dan token bertanda tangan
  yang berlaku sampai batas itu.
- Penerima membuka tautan dan melihat pop-up **"Lokasi yang Dibagikan"** berisi
  4 poin ketentuan ringkas, satu centang, dan tombol *Lihat Lokasi*
  (`src/legal/ShareNotice.jsx`). Persetujuannya disimpan di browser
  (`shareNotice:<userId>`), bukan di server, karena akun sementara bersifat
  hanya-baca. EULA lengkap tidak ditampilkan untuk akun sementara.
- Mencabut akses: hapus akun sementara di Pengguna (aktifkan *Sementara*).
  Satu pengguna hanya bisa punya satu tautan aktif per perangkat; membagikan
  ulang sebelum dihapus menghasilkan konflik.

## 5.3 Putar Ulang (Replay)
- Kecepatan sampai **10x**, rentang waktu bisa dipotong, waktu dalam WIB.
- Tab **Perjalanan**: daftar perjalanan per hari dari `/api/reports/trips`.
  Urutan **terbaru di atas**; nomor perjalanan dan tombol sebelumnya/berikutnya
  tetap kronologis. Waktu yang tampil adalah waktu yang disimpan server: koreksi
  *Jam GPS* (`decoder.timezone`) hanya berlaku untuk data baru.
  Pilih satu perjalanan untuk memutarnya; ada tombol sebelumnya/berikutnya.
  Info apakah perjalanan dideteksi dengan ACC atau tanpa ACC.
- Tab **Waktu**: tanggal/jam bisa diketik langsung.
- Deteksi perjalanan memakai atribut perangkat/server
  `report.trip.minimalParkingDuration` (bawaan 300 s), `minimalTripDuration`
  (300 s), `minimalTripDistance` (500 m), `useIgnition` (false),
  `minimalNoDataDuration` (3600 s). Diatur pemilik di server.

## 5.4 Laporan
- Laporan bawaan Traccar (Gabungan, Kejadian, Geofence, Perjalanan, Berhenti,
  Ringkasan, Grafik, Putar Ulang, Posisi, Log, Terjadwal, Statistik).
- **Posisi**: tombol hapus posisi hanya untuk admin. Server mengizinkan semua
  non-readonly menghapus posisi perangkatnya, dan **tidak mencatatnya di audit**.
- **Audit** (admin): kalimat yang mudah dibaca, misalnya "Reseller Solo mengubah
  perangkat Avanza Budi", dengan jenis akun pelaku, jam WIB per hari, dan IP.
  Saringan: cari, pelaku, jenis aktivitas, hanya sensitif. Penanda merah:
  hapus, gagal login. Oranye: perintah, tautkan/lepas, ubah server, reset
  penghitung, token API, edit perangkat oleh non-admin. Ekspor Excel. Server
  tidak mencatat isi perubahan maupun siapa yang melihat peta.

## 5.5 Pengguna
- Tab per jenis akun dengan jumlah (admin).
- Kolom: Nama (inisial berwarna, email, telepon), Jenis Akun, Keterangan
  (reseller pelanggan, atau kuota "n/maks pelanggan"), Status (Aktif, Segera
  habis ≤ 7 hari, Kedaluwarsa, Nonaktif), Akun berlaku s.d., Persetujuan EULA
  (Disetujui/Versi lama/Belum), Perangkat.
- Klik judul kolom untuk mengurutkan (naik/turun). Tab dan urutan disimpan
  (`usersTab`, `usersSort`). 100 baris per tampilan.
- Aksi: Impersonate, Koneksi, Pindah reseller (admin, pelanggan), Ubah,
  Hapus (admin).

## 5.6 Form (konsep seragam)
- Tanda * untuk isian wajib. Tombol Simpan selalu bisa diklik. Kalau ada yang
  salah: peringatan merah di atas, isian bergaris merah dengan pesan, dan
  halaman menggulir ke atas (gaya Laravel).
- Bagian jarang dipakai di balik "Tampilkan pengaturan lanjutan".
- Judul "Tambah Data" / "Ubah Data", pesan flash setelah simpan, dialog
  konfirmasi hapus.
- Form perangkat: isian *Pelanggan (pemilik)* saat menambah (admin/reseller).
- Form perangkat, bagian **Jam GPS**: radio zona waktu jam di dalam alat, yang
  disimpan sebagai atribut perangkat `decoder.timezone`. Pilihannya UTC
  (bawaan, atribut dihapus), WIB `Asia/Jakarta`, WITA `Asia/Makassar`, WIT
  `Asia/Jayapura`; nilai lain tampil sebagai "Lainnya". Kalau posisi terakhir
  menunjukkan `fixTime` 7/8/9 jam (±20 menit) di depan `serverTime` dan atribut
  belum diisi, muncul saran dengan tombol **Pakai**.
  - Server memakai atribut ini saat mendekode data dari protokol yang
    mendukungnya, misalnya GT06 (dibaca saat alat login, jadi berlaku setelah
    **alat tersambung ulang**) dan JT808 (bawaannya GMT+8 kalau atribut kosong).
  - Data lama tidak berubah. Tidak semua protokol memakai atribut ini.
  IMEI, masa aktif, dan nonaktif hanya bisa diubah admin.

## 5.7 Menu Pengaturan
Kategori yang bisa dibuka-tutup: Akun Saya, Armada, Aturan & Otomasi
(disembunyikan untuk reseller), Bisnis (Langganan, Reseller [admin],
Pengguna, Persetujuan, Pengumuman), Sistem (Server, admin), Bantuan.
Setiap modul punya tombol (i) berisi penjelasan singkat (`moduleInfo.js`).

## 5.8 Tampilan umum
- Tema oranye "menyala", terang secara bawaan; tombol terang/gelap disimpan di
  browser (`themeMode`). Atribut server `darkMode` hanya dipakai kalau pengguna
  belum memilih.
- Bahasa bawaan **Indonesia** (`DEFAULT_LANGUAGE = 'id'`); pilihan pengguna
  atau atribut `language` didahulukan. Satuan kecepatan bawaan km/j.
- Zona waktu bawaan **Asia/Jakarta**; atribut `timezone` pengguna/server didahulukan.
- Tabel di HP menjadi baris yang bisa dibuka-tutup (`MobileTableEnhancer`).
- PWA: nama dan ikon Pantauku, pembaruan otomatis, banner pasang aplikasi
  (Android/iOS), pemberitahuan versi baru yang bisa ditutup, tombol
  **Muat Ulang Aplikasi** (⟳) di label versi.
- Label versi (hash commit dan tanggal WIB, pesan commit saat hover) di menu
  Pengaturan dan halaman login. `version.json` tersedia di root situs.
