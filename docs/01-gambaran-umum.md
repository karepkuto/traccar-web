# 1. Gambaran Umum

## Produk
Pantauku adalah layanan pelacakan GPS (SaaS) untuk kendaraan. Model bisnis:
**langganan prabayar per perangkat**, dijual langsung oleh pemilik
(superadmin) atau melalui **reseller** yang membayar per perangkat.

## Arsitektur
```
Perangkat GPS ──► Traccar server (VPS, Docker, TIDAK DIUBAH)
                        ▲  REST API + WebSocket
                        │
              Web Pantauku (repo ini, React) ── disajikan oleh Traccar
                                                 dari folder web-custom (bind mount)
```
- Semua aturan bisnis Pantauku (role, langganan, kepemilikan) dibangun **di
  web** memakai API resmi Traccar dan atribut (`attributes`) pada objek.
- Konsekuensinya: aturan yang hanya ada di web **bisa ditembus** oleh orang
  yang memanggil API langsung. Lihat [08](08-keterbatasan-dan-risiko.md).
  Pengamannya adalah deteksi (tab *Perlu Diperiksa*, log Audit) dan kontrak.

## Batasan yang disepakati
1. **Kode server Traccar tidak diubah.** Perubahan di VPS hanya lewat prompt
   untuk agen VPS (Hermes) yang dijalankan pemilik, tanpa menyertakan password
   admin.
2. Pengembangan di branch `master`, deploy otomatis (lihat [07](07-deploy-dan-operasional.md)).
3. Bahasa bawaan **Indonesia**, zona waktu bawaan **WIB (Asia/Jakarta)**.
4. Fitur **Pengemudi (Drivers) disembunyikan** untuk semua orang, karena
   perangkat yang dipakai tidak punya pembaca RFID/iButton. Bisa diaktifkan
   dengan atribut server `ui.enableDrivers = true`.

## Teknologi
React 19, MUI v9, Redux Toolkit, Vite, vite-plugin-pwa, MapLibre, dayjs
(plugin utc/timezone), ExcelJS untuk ekspor.
