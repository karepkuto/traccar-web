# 6. Legal

File: `src/legal/legalContent.js` (draf, **wajib ditinjau ahli hukum**:
UU 27/2022 PDP, UU ITE).

## Versi dan persetujuan
- `LEGAL_VERSION` saat ini: **2026-11-03**.
- Mengubah teks apa pun yang disetujui pengguna → **naikkan `LEGAL_VERSION`**.
  Semua pengguna non-admin diminta menyetujui ulang saat login berikutnya.
- Persetujuan disimpan di atribut pengguna: `legalConsentVersion`,
  `legalConsentAt`, `legalConsentItems`, `legalConsentRole`,
  `legalConsentUserAgent`.
- **Akun Hanya-baca** (`readonly` di akun atau server): server hanya
  mengizinkan akun itu mengubah atribut `termsAccepted`. Saat setuju, aplikasi
  mencoba menyimpan rekaman lengkap; kalau ditolak ("Write access denied"),
  aplikasi menyimpan `termsAccepted = true` di server dan rincian (versi, waktu,
  butir) di browser (`localStorage` kunci `legalConsent:<userId>`). Statusnya
  tampil sebagai "Setuju (hanya-baca)". Bukti ini lebih lemah (tanpa versi di
  server, dan diminta ulang di perangkat lain), jadi sebaiknya akun pelanggan
  biasa tidak diberi Hanya-baca.
- Admin melihat rekap di Pengaturan → Bisnis → **Persetujuan**, dan status per
  akun di kolom *Persetujuan* halaman Pengguna.
- Halaman publik dokumen legal tersedia (LegalPage).

## Isi yang sudah diatur
- Syarat & Ketentuan: penggunaan sah, persetujuan orang yang terlacak;
  **perintah matikan mesin hanya atas permintaan dan menjadi risiko
  pengguna**; admin/reseller boleh impersonate untuk dukungan dan aksesnya
  tercatat; prabayar per perangkat, **uji pasang 3 hari**, **aktivasi ≤ 1x24
  jam** setelah bayar; batasan tanggung jawab; hukum Indonesia.
- Kebijakan Privasi: data yang diproses, tujuan, akses (reseller memproses atas
  nama Pantauku), pencatatan aktivitas, masa simpan (selama akun aktif + maks
  12 bulan), hak pengguna menurut UU PDP.
- Ketentuan Reseller: bayar per perangkat, aktivasi hanya oleh Pantauku,
  larangan manipulasi (ubah masa aktif, hapus–buat ulang perangkat), impersonate
  hanya atas permintaan, hak Pantauku memindahkan pelanggan saat kerja sama
  berakhir.

## Yang belum diisi
`LEGAL_OPERATOR.entity`, `address`, `email`, `phone` masih kosong. Isi sebelum
ada pelanggan berbayar.
