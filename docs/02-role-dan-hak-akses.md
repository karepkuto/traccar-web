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
- Akun lama dirapikan dengan tombol **Samakan Hak Akses** di bawah tabel Pengguna.
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
| Impersonate (masuk sebagai) pengguna | ✅ | ✅ (milik), diatur kontrak | ❌ |
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
