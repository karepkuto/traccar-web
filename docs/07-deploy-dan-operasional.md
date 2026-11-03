# 7. Deploy dan Operasional

## Alur deploy (otomatis)
1. Push ke `master`.
2. GitHub Actions `deploy.yml`: `npm ci` → `npm run lint` → `npm run build`
   → commit hasil build ke branch **`deploy`** (pesan: `deploy <waktu WIB> from <hash>: <judul>`).
3. Cron di VPS (`deploy-pull.sh`, tiap 5 menit) menjalankan `git pull origin
   deploy` di folder `web-custom` yang di-bind mount ke container Traccar.
   **Tidak perlu restart.**
4. Cek versi: label versi di menu Pengaturan / halaman login, atau `/version.json`.
   Kalau masih versi lama, tekan ⟳ *Muat Ulang Aplikasi*.

Aturan: jangan push manual atau force push ke `deploy`. Lint gagal = tidak ada
deploy (lint diperiksa dari exit code). Detail lama ada di `DEPLOY.md`.

## Sebelum commit
```
npx prettier --write "src/**/*.{js,jsx}"   # JANGAN jalankan prettier ke src/resources/l10n
npx eslint src                                # harus exit 0
npm run build
```
File terjemahan `src/resources/l10n/*.json` memakai indentasi 4 spasi. Ubah
lewat skrip JSON (`indent=4`), jangan diformat ulang semua bahasa.

## Atribut server yang dipakai
| Atribut | Fungsi |
|---|---|
| `timezone` | Disarankan `Asia/Jakarta` |
| `language` | Disarankan `id` |
| `darkMode` | Sebaiknya dihapus (tema dipilih pengguna) |
| `support` | Tautan bantuan; isi `https://wa.me/62xxxx` agar *Minta aktivasi* membuka WhatsApp |
| `billingWarningDays`, `billingCriticalDays` | Batas peringatan langganan (bawaan 14 dan 3) |
| `ui.enableDrivers` | `true` untuk memunculkan fitur Pengemudi |
| `report.trip.*` | Parameter deteksi perjalanan (lihat [05 §5.3](05-layar-dan-fitur.md)) |
| Pendaftaran (registration) | **Matikan** (pelanggan dibuat oleh reseller/admin) |

## Tugas operasional yang BELUM selesai (per 2026-11-03)
- [ ] Backup database harian ke lokasi terpisah.
- [ ] 2FA untuk akun admin, simpan kode cadangan.
- [ ] Kunci versi image Docker Traccar (jangan `latest`).
- [ ] Matikan pendaftaran publik.
- [ ] Isi atribut `support` dengan tautan WhatsApp.
- [ ] Uji penguncian langganan di perangkat sungguhan.
- [ ] Tekan *Samakan Hak Akses* (Pengguna) dan *Perbaiki Akses Perangkat* (Reseller) sekali.
- [ ] Kebijakan pembersihan tabel audit (mis. simpan 12 bulan).
- [ ] Isi data operator di `legalContent.js` dan tinjauan ahli hukum.
- [ ] Kontrak reseller tertulis.
