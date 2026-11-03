# 8. Keterbatasan dan Risiko

| Keterbatasan | Dampak | Mitigasi |
|---|---|---|
| Aturan Pantauku hanya di web (🔒 di tabel role) | Reseller/pelanggan teknis bisa memanggil API: memperpanjang masa aktif, menghapus perangkat/pengguna/posisi, mengubah IMEI | Tab *Perlu Diperiksa* + log Audit + kontrak. Pelanggan diberi `deviceReadonly` sehingga tidak bisa mengedit perangkat sama sekali (dijaga server) |
| Server tidak memeriksa siapa yang mengubah `expirationTime` | Non-admin dengan izin edit perangkat bisa memperpanjang sendiri | Pelanggan selalu `deviceReadonly`; reseller diawasi lewat *Perlu Diperiksa* |
| Audit tidak mencatat isi perubahan, tampilan peta, maupun penghapusan posisi | Tidak bisa membuktikan "apa" yang diubah | Bandingkan dengan riwayat pembayaran; posisi hanya bisa dihapus admin di tampilan |
| Hapus perangkat lalu buat ulang = uji pasang baru | Pemakaian gratis berulang | Ditandai di *Aktivitas mencurigakan* |
| Perangkat terkunci yang masih tersambung tetap mengirim sampai koneksi ulang | Data masuk sebentar setelah habis | Perilaku server, diterima |
| Browser admin memuat semua perangkat dan posisi | Berat pada ribuan perangkat | Pantau; solusi perlu dibahas terpisah bila lambat |
| Riwayat pembayaran sekitar 12 entri per perangkat | Arsip lama terpotong | Ekspor rutin |
| Tautan yang dibuat di luar aplikasi tidak mengikuti aturan akses reseller | Reseller tidak melihat perangkat pelanggannya | *Perbaiki Akses Perangkat* |
| Hanya satu admin | Akun bermasalah = bisnis berhenti | 2FA + kode cadangan; pertimbangkan admin cadangan |
| Akun Hanya-baca tidak bisa menyimpan rekaman persetujuan lengkap di server | Bukti persetujuan lemah, diminta ulang di perangkat lain | Hindari Hanya-baca untuk pelanggan biasa; lihat [06](06-legal.md) |
| Tautan bagikan: pemegang token bisa membaca riwayat perangkat lewat API; pencabutan hanya oleh admin | Kebocoran privasi bila tautan tersebar | Bawaan 24 jam, layar riwayat disembunyikan, daftar Tautan Aktif + Cabut; atribut server `disableShare` untuk mematikan fitur |
| Privasi pelanggan terhadap reseller hanya di tampilan | Reseller teknis bisa membaca riwayat pelanggan lewat API; membaca posisi tidak tercatat di audit | Kontrak (larangan + sanksi pindah pelanggan); pembuatan laporan tetap tercatat |
| Server tidak mencatat pelaku impersonate | Lewat API reseller bisa impersonate tanpa izin dan tanpa jejak | Izin per pelanggan + jejak di aplikasi, dipasangkan di Audit ([02 §2.3b](02-role-dan-hak-akses.md)); sisanya kontrak |
| Teks legal masih draf | Risiko hukum | Tinjauan ahli hukum |
