# 4. Kepemilikan dan Akses

## 4.1 Satu objek, satu pelanggan
Perangkat, grup, dan geofence masing-masing **milik maksimal satu pelanggan**.
Admin dan reseller hanya mengawasi, tidak dihitung sebagai pemilik.
- Dijaga di tampilan saat menautkan (halaman Koneksi): penautan ke pelanggan
  kedua ditolak dengan pesan.
- Traccar sendiri mengizinkan banyak-ke-banyak, jadi pelanggaran lewat API
  terlihat di kolom Pemilik (merah) dan di *Perlu Diperiksa*.
- Satu pelanggan juga hanya dikelola **satu reseller**.

## 4.2 Akses reseller ke perangkat (penting)
Server Traccar memberi reseller akses **hanya ke perangkat yang ditautkan
langsung ke akunnya** (atau lewat grup). Mengelola pelanggan **tidak**
otomatis memberi akses ke perangkat pelanggan. Aturan Pantauku: *reseller
selalu punya akses ke semua perangkat pelanggannya*. Semua jalur penautan
memanggil `src/common/util/resellerAccess.js`:

| Kejadian | Otomatis |
|---|---|
| Perangkat ditautkan ke pelanggan (Koneksi pengguna, form tambah perangkat) | ikut ditautkan ke reseller pelanggan |
| Pelanggan ditambahkan ke reseller | semua perangkat pelanggan ditautkan ke reseller |
| Pelanggan dilepas dari reseller | akses reseller ke perangkat pelanggan itu dicabut (kecuali milik pelanggan lain reseller itu) |
| Pemilik perangkat diganti (Koneksi perangkat → *Pelanggan (pemilik)*) | reseller lama kehilangan akses, reseller baru mendapat akses |
| Pindah pelanggan ke reseller lain / ke admin | akses ikut pindah / dicabut |

Perangkat yang dibuat reseller otomatis tertaut ke reseller (perilaku server).
Untuk data lama atau tautan yang dibuat di luar aplikasi: **Pengaturan →
Reseller → Perbaiki Akses Perangkat**.

## 4.3 Pindah pelanggan (khusus superadmin)
- Satu pelanggan: Pengguna → ikon ⇄ *Pindah reseller*.
- Semua/sebagian pelanggan reseller: Reseller → ikon ⇄ *Pindahkan Pelanggan*,
  dengan opsi ikut memindahkan **perangkat stok** (milik reseller yang belum
  ditautkan ke pelanggan).
- Tujuan: reseller lain (termasuk reseller dummy) atau *Dikelola langsung (Admin)*.
- Yang dipindah: tautan reseller→pelanggan, tautan reseller→perangkat, dan
  `billingBilledTo` (tagihan berikutnya). Riwayat pembayaran tidak diubah.
- Tidak ikut pindah: geofence, notifikasi, dan perintah tersimpan yang dibuat
  reseller lama. Untuk reseller yang membangkang, nonaktifkan juga akunnya.

## 4.4 Halaman Koneksi
- **Koneksi pengguna**: Perangkat, Grup, Geofence, Notifikasi, Perintah
  tersimpan, (reseller) Pelanggan kelolaan, Kalender, dll.
- **Koneksi perangkat**: *Pelanggan (pemilik)* (admin/reseller), Geofence,
  Notifikasi, Perintah, Pemeliharaan, Atribut terhitung, Perangkat berpasangan.
  Tidak ada isian reseller: akses reseller mengikuti pemilik.
