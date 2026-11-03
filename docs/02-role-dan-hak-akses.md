# 2. Role dan Hak Akses

## 2.1 Cara role ditentukan
Role **tidak disimpan terpisah**. Role dibaca dari kolom yang dijaga server
(`src/common/util/roles.js`):

| Role | Syarat |
|---|---|
| Superadmin | `administrator = true` |
| Reseller | bukan admin dan `userLimit != 0` |
| Pelanggan | selain itu |

Saat ini hanya ada **satu** superadmin (keputusan pemilik). Role **Staf** belum
dibuat; strukturnya disiapkan agar bisa ditambahkan nanti.

## 2.2 Preset hak akses per role (dikunci di form pengguna)
| Kolom Traccar | Reseller | Pelanggan |
|---|---|---|
| `deviceReadonly` (Perangkat Hanya-baca) | false | **true** |
| `limitCommands` (Batasi Perintah) | **true** | **true** |
| `fixedEmail` (Email Tidak Bisa Diubah) | **true** | **true** |
| `deviceLimit` | diatur admin (-1 = tanpa batas) | **0** |
| `userLimit` | diatur admin (wajib > 0 atau -1) | **0** |

- `readonly` (Hanya-baca) dan `disableReports` tetap opsional per akun.
- Memilih jenis akun di form pengguna otomatis menyetel preset ini, dan
  centangannya dikunci.
- Tombol **Samakan Hak Akses** (bawah tabel Pengguna, admin) melakukan dua hal:
  menyamakan preset role semua akun non-admin, **dan** melengkapi tautan
  reseller ke perangkat pelanggannya (sama dengan *Perbaiki Akses Perangkat*
  di halaman Reseller). Dialognya juga memperingatkan pelanggan yang
  berstatus Hanya-baca (tidak diubah otomatis, karena bisa jadi akun penonton
  yang disengaja). Jalankan setelah impor data atau perubahan di luar aplikasi.
- `deviceLimit` dan `userLimit` hanya bisa diubah admin (aturan server).
  Pelanggan yang dibuat reseller otomatis mendapat batas 0 dari server.

## 2.3 Tabel role dan aksi
Keterangan: ✅ boleh · ❌ ditolak server · 🔒 disembunyikan di tampilan saja
(bisa ditembus lewat API) · (milik) = hanya data yang ia kelola.

| Aksi | Superadmin | Reseller | Pelanggan |
|---|:-:|:-:|:-:|
| Pengaturan server | ✅ | ❌ | ❌ |
| Buat reseller, atur batas pelanggan/perangkat | ✅ | ❌ | ❌ |
| Buat pelanggan | ✅ | ✅ (milik) | ❌ |
| Ubah/nonaktifkan pelanggan, reset password | ✅ | ✅ (milik) | ❌ |
| Hapus pengguna | ✅ | 🔒 | ❌ |
| Impersonate (masuk sebagai) pengguna | ✅ | 🔒 hanya pelanggan yang **diberi izin admin** sampai batas waktu | ❌ |
| Pindah pelanggan antar reseller | ✅ | ❌ (tidak ada tombol) | ❌ |
| Tambah perangkat | ✅ | ✅ (sesuai batas) | ❌ |
| Ubah nama/ikon perangkat | ✅ | ✅ (milik) | ❌ |
| Ubah IMEI, masa aktif, status nonaktif perangkat | ✅ | 🔒 | ❌ |
| Hapus perangkat | ✅ | 🔒 | ❌ |
| Hapus posisi (Laporan → Posisi) | ✅ | 🔒 | 🔒 |
| Aktivasi dan perpanjangan langganan | ✅ | 🔒 (tombol *Minta aktivasi*) | ❌ |
| Lihat status langganan | ✅ | ✅ (milik) | ✅ (hitung mundur di kartu) |
| Peta live, riwayat, laporan | ✅ | 🔒 hanya **perangkat stok**; perangkat pelanggan: status & langganan saja | ✅ (milik) |
| Menu *Aturan & Otomasi* (notifikasi, kalender, dll.) | ✅ | disembunyikan | ✅ |
| Kirim perintah bebas | ✅ | ❌ | ❌ |
| Kirim perintah tersimpan | ✅ | 🔒 hanya perangkat stok | ✅ (yang dibagikan) |
| Log Audit | ✅ | ❌ | ❌ |

## 2.3a Privasi pelanggan terhadap reseller
Keputusan pemilik (UU PDP, minimisasi data): reseller **tidak** melihat
lokasi, riwayat perjalanan, laporan, maupun mengirim perintah ke perangkat
milik pelanggannya (`src/common/util/privacy.js`).

| | Perangkat stok (belum ada pelanggan) | Perangkat pelanggan |
|---|---|---|
| Daftar perangkat | ✅ lengkap | ✅ nama, status online, update terakhir, langganan; tertulis "Milik pelanggan · lokasi & riwayat disembunyikan" |
| Peta, kartu status, Lokasi, Bagikan | ✅ | ❌ (kartu hanya tombol Ubah + penjelasan) |
| Putar ulang, laporan | ✅ | ❌ (tidak ada di pilihan perangkat; "Semua" berarti semua perangkat stok; filter grup disembunyikan) |
| Perintah, detail posisi | ✅ | ❌ (alamat langsung dialihkan ke peta) |
| Langganan & minta aktivasi | ✅ | ✅ |

- Dijaga **di tampilan saja**. Server tetap memberi reseller akses penuh ke
  perangkat yang ditautkan kepadanya (dibutuhkan untuk tampilan langganan),
  dan posisi live tetap terkirim ke browser reseller. Penegakan = kontrak +
  audit.
- Selama daftar perangkat pelanggan belum termuat, semua perangkat dianggap
  privat (tidak ada data yang bocor sesaat). Daftar dimuat ulang tiap 60 detik
  atau setelah penautan berubah.
- Dukungan lanjutan: impersonate atas permintaan pelanggan.

## 2.3b Izin impersonate untuk reseller
- Admin: Pengaturan → Reseller → ikon 🔑 **Izin Impersonate** → pilih
  pelanggan, batas waktu (2 jam / 24 jam / 3 hari / bebas), alasan opsional.
  Izin aktif bisa dicabut. Disimpan di atribut reseller `impersonateGrants`
  (JSON; yang kedaluwarsa dibuang saat disimpan).
- Reseller: di Pengguna, tombol *Impersonate* hanya muncul untuk pelanggan
  dengan izin aktif. Pelanggan lain memiliki tombol **Minta izin
  impersonate**, yang menyalin pesan dan membuka WhatsApp bila atribut server
  `support` berupa tautan wa.me. Izin baru terbaca setelah reseller memuat
  ulang aplikasi.
- Jejak: sebelum reseller impersonate, aplikasi menulis atribut
  `lastImpersonation` di akun pelanggan. Server mencatat perubahan itu atas
  nama reseller, lalu "login" pelanggan. Audit memasangkan keduanya (≤ 2 menit,
  IP sama, satu jejak untuk satu login) menjadi
  **"<reseller> impersonate pengguna <pelanggan>"**.
- Batasan: server tetap mengizinkan reseller impersonate pelanggannya lewat
  API tanpa izin dan tanpa jejak (hanya "login <pelanggan>" + IP). Itu
  pelanggaran kontrak. Impersonate oleh admin tidak meninggalkan jejak
  pelaku (tercatat sebagai login pelanggan).

## 2.4 Hak dan kewajiban (disepakati, sebagian masuk EULA)
- **Superadmin**: wajib mengaktivasi paling lambat **1x24 jam** setelah
  pembayaran diterima; menjaga server dan backup; berhak memindahkan
  pelanggan dari reseller yang melanggar ke reseller lain/dummy/langsung.
- **Reseller**: membayar per perangkat; dukungan lini pertama; hanya
  impersonate pelanggan atas permintaan pelanggan; dilarang memanipulasi
  sistem; menonaktifkan **akun** pelanggannya yang menunggak adalah alat
  penagihan reseller (terpisah dari masa aktif perangkat).
- **Pelanggan**: membayar, memakai layanan secara sah, menjaga akun.
- Kontrak reseller tertulis disiapkan pemilik (di luar aplikasi).
