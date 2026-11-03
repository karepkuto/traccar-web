# 3. Langganan (Billing)

## 3.1 Model
- Prabayar **per perangkat**, satuan bulan atau tahun, bisa beberapa periode.
- Pembayaran dicatat **manual oleh superadmin** (Pengaturan → Bisnis → Langganan).
- Penguncian memakai kolom bawaan Traccar `device.expirationTime`. Setelah
  lewat, server **menolak koneksi baru** dari perangkat sehingga data baru tidak
  tersimpan. Perangkat yang masih tersambung bisa tetap mengirim sampai
  koneksinya putus dan tersambung ulang (perilaku server, `checkDisabled()`
  hanya saat sesi baru).

## 3.2 Data yang disimpan di atribut perangkat
| Atribut | Isi |
|---|---|
| `billingTrialStart` | Waktu mulai uji pasang (dihapus saat aktivasi) |
| `billingPlan` | Satuan terakhir (`month`/`year`) |
| `billingPrice` | Harga per periode (dasar perkiraan tagihan reseller) |
| `billingBilledTo` | `direct` atau `reseller:<userId>` |
| `billingLastPaidAt/Amount/Periods/Unit/Reference/By` | Pembayaran terakhir |
| `billingHistory` | JSON riwayat, sekitar 12 pembayaran terakhir (batas panjang kolom) |

Ekspor riwayat secara rutin untuk arsip lengkap.

## 3.3 Status
| Status | Kondisi |
|---|---|
| Uji pasang | ada `billingTrialStart` dan belum kedaluwarsa |
| Aktif | sisa > batas peringatan |
| Segera habis | sisa ≤ `billingWarningDays` (bawaan 14 hari) |
| Kritis | sisa ≤ `billingCriticalDays` (bawaan 3 hari) |
| Terkunci | `expirationTime` sudah lewat. Uji pasang yang lewat tampil "Belum diaktivasi (terkunci)" |
| Belum diatur | tidak ada `expirationTime`: **aktif selamanya**, harus diperiksa |

Batas peringatan bisa diubah lewat atribut server `billingWarningDays` dan
`billingCriticalDays`. Hitung mundur untuk uji pasang dan kritis tampil dalam
**hari dan jam**.

## 3.4 Alur perangkat baru
1. Siapa pun yang menambah perangkat (reseller atau admin): perangkat otomatis
   mendapat `expirationTime = sekarang + 3 hari` dan `billingTrialStart`.
2. Reseller menekan **Minta aktivasi** di Langganan. Pesan disalin, dan kalau
   atribut server `support` berupa `https://wa.me/...`, WhatsApp terbuka
   dengan pesan terisi.
3. Admin mencatat pembayaran pertama (ikon 💳, judul "Aktivasi"). Tanggal
   mulai = hari ini, `billingTrialStart` dihapus.
4. Janji layanan: aktivasi **≤ 1x24 jam** setelah bayar. Uji pasang lebih dari
   24 jam muncul di banner admin dan di *Perlu Diperiksa*.

## 3.5 Perpanjangan
Dialog mencatat jumlah periode, satuan, tanggal mulai (bawaan melanjutkan
masa aktif yang tersisa), harga, jumlah dibayar (wajib), referensi, dan
"Ditagihkan ke" (langsung/reseller). Masa aktif berakhir pukul 23:59:59 WIB
di tanggal selesai.

## 3.6 Tab di halaman Langganan
| Tab | Siapa | Isi |
|---|---|---|
| Perangkat | admin, reseller | Status, pemilik, tombol catat bayar (admin) / minta aktivasi (reseller) |
| Riwayat Pembayaran | admin, reseller | Gabungan riwayat semua perangkat, ekspor Excel |
| Perlu Diperiksa | admin | Lihat 3.7 |
| Rekap Reseller | admin | Per reseller: jumlah perangkat, uji pasang, habis ≤ 30 hari/terkunci, perkiraan tagihan (dari `billingPrice`), ekspor |

## 3.7 Perlu Diperiksa (kontrol deteksi)
Masalah per perangkat (`findBillingIssues` di `billingLogic.js`):
- tidak punya masa aktif;
- uji pasang lebih dari 3 hari (+1 jam toleransi);
- uji pasang lebih dari 24 jam belum diaktivasi;
- masa aktif lebih panjang dari pembayaran terakhir (toleransi 1 hari);
- punya masa aktif tanpa catatan pembayaran;
- terhubung ke lebih dari satu pelanggan.

Kolom *Terakhir diubah non-admin* dan bagian **Aktivitas mencurigakan (30 hari)**
diambil dari log audit server (`/api/audit`):
- perangkat dihapus oleh non-admin;
- perangkat dibuat lagi ≤ 7 hari setelah pelaku yang sama menghapus perangkat
  (indikasi memancing uji pasang baru);
- pengguna dihapus oleh non-admin;
- ≥ 5 gagal login dari satu IP dalam sehari.

## 3.8 Banner pengingat di layar peta
- Admin: "N perangkat menunggu aktivasi · M lewat 24 jam".
- Reseller: "N perangkat perlu aktivasi/perpanjangan · M terkunci".
- Tombol **Lihat** menerapkan filter yang sesuai. Ditutup = tersembunyi selama
  sesi sampai jumlahnya berubah (sessionStorage `attentionBannerDismissed`).
