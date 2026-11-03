# Dokumentasi Pantauku (handoff)

Folder ini menjelaskan **semua aturan dan kondisi** aplikasi web Pantauku
(fork `traccar-web`). Siapa pun yang melanjutkan pekerjaan, manusia atau AI,
cukup membaca folder ini untuk memahami cara kerja aplikasi.

> **Aturan wajib:** setiap perubahan perilaku aplikasi **harus** diikuti
> pembaruan dokumen terkait di folder ini **dalam commit yang sama**, dan
> dicatat di [`09-riwayat-perubahan.md`](09-riwayat-perubahan.md).
> Dokumen yang tidak sesuai kode lebih berbahaya daripada tidak ada dokumen.

## Daftar isi

| File | Isi |
|---|---|
| [01-gambaran-umum.md](01-gambaran-umum.md) | Produk, arsitektur, batasan utama (server Traccar tidak diubah) |
| [02-role-dan-hak-akses.md](02-role-dan-hak-akses.md) | Superadmin, Reseller, Pelanggan: hak, kewajiban, apa yang dijaga server vs tampilan |
| [03-langganan.md](03-langganan.md) | Langganan per perangkat, uji pasang 3 hari, aktivasi 1x24 jam, Perlu Diperiksa, Rekap Reseller |
| [04-kepemilikan-dan-akses.md](04-kepemilikan-dan-akses.md) | Satu perangkat satu pelanggan, akses reseller ke perangkat, pindah pelanggan |
| [05-layar-dan-fitur.md](05-layar-dan-fitur.md) | Peta, filter, replay, laporan, audit, pengguna, form, tema, PWA, bahasa |
| [06-legal.md](06-legal.md) | EULA, kebijakan privasi, persetujuan pengguna |
| [07-deploy-dan-operasional.md](07-deploy-dan-operasional.md) | Alur deploy, VPS, atribut server, tugas operasional yang belum selesai |
| [08-keterbatasan-dan-risiko.md](08-keterbatasan-dan-risiko.md) | Hal yang tidak bisa dijaga aplikasi dan cara memitigasinya |
| [09-riwayat-perubahan.md](09-riwayat-perubahan.md) | Catatan perubahan per commit |
| [10-peta-kode.md](10-peta-kode.md) | File mana mengatur apa |
| [11-modul-lainnya.md](11-modul-lainnya.md) | Modul bawaan Traccar lainnya: fungsi dan penyesuaian Pantauku |

## Istilah

| Istilah | Arti |
|---|---|
| Server / mesin | Traccar server di VPS. **Kodenya tidak boleh diubah.** |
| Web | Repo ini: tampilan yang dipakai pengguna |
| Superadmin | Pemilik bisnis (akun `administrator = true`) |
| Reseller | Akun yang boleh mengelola pengguna lain (`userLimit != 0`), istilah Traccar: manager |
| Pelanggan | Akun biasa (`userLimit = 0`, bukan admin) |
| Tautan | Permission Traccar (`/api/permissions`): pengguna ke perangkat, reseller ke pelanggan, dst. |
| Uji pasang | Masa 3 hari perangkat baru sebelum diaktivasi |
