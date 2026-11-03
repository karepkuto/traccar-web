# Pantauku web (fork traccar-web)

Baca `docs/README.md` sebelum mengubah apa pun. Folder `docs/` adalah
sumber kebenaran untuk aturan bisnis, role, langganan, akses, dan operasional.

## Aturan kerja
- **Setiap perubahan perilaku aplikasi wajib memperbarui dokumen terkait di
  `docs/` dalam commit yang sama**, dan menambah baris di
  `docs/09-riwayat-perubahan.md`. Kalau menambah file atau modul baru,
  perbarui juga `docs/10-peta-kode.md`.
- Kode server Traccar tidak boleh diubah. Perubahan VPS hanya lewat prompt
  untuk agen VPS yang dijalankan pemilik, tanpa password admin.
- Kerjakan di `master`; deploy otomatis lewat `.github/workflows/deploy.yml`.
- Sebelum commit: `npx prettier --write "src/**/*.{js,jsx}"`, `npx eslint src`
  (harus exit 0), `npm run build`. Jangan format ulang `src/resources/l10n/*.json`
  (indentasi 4 spasi; ubah lewat skrip JSON).
- Teks antarmuka berbahasa Indonesia; tambahkan kunci di `id.json` dan `en.json`.
- Pemilik ingin analisa dulu untuk perubahan besar, dan jawaban yang jujur
  serta ringkas dalam bahasa Indonesia.
