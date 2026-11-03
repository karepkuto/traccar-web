# 11. Modul Lainnya (bawaan Traccar, dengan penyesuaian Pantauku)

Modul di bawah sebagian besar mengikuti perilaku bawaan Traccar. Yang
dicatat di sini: fungsinya, siapa yang memakai, dan penyesuaian Pantauku.
Semua form memakai konsep seragam (isian wajib *, validasi saat Simpan,
pengaturan lanjutan tersembunyi; lihat [05 §5.6](05-layar-dan-fitur.md)).
Setiap modul punya tombol (i) berisi penjelasan (`moduleInfo.js`).

## Masuk dan akun
| Halaman | File | Catatan |
|---|---|---|
| Login | `src/login/LoginPage.jsx`, `LoginLayout.jsx`, `LogoImage.jsx` | Logo dan label versi Pantauku; bahasa bawaan Indonesia |
| Daftar | `src/login/RegisterPage.jsx` | Hanya bila pendaftaran server aktif. **Disarankan dimatikan** (akun dibuat admin/reseller) |
| Lupa password | `src/login/ResetPasswordPage.jsx` | Butuh email server terkonfigurasi |
| Ganti server | `src/login/ChangeServerPage.jsx` | Untuk aplikasi native; tidak dipakai di web |
| Preferensi | `src/settings/PreferencesPage.jsx` | Tampilan peta, satuan, info di daftar perangkat (nama/kolom kedua) |
| Akun saya | `src/settings/UserPage.jsx` | Lihat [02](02-role-dan-hak-akses.md); email terkunci untuk non-admin (`fixedEmail`) |

## Armada (Pengaturan → Armada)
| Halaman | File | Catatan |
|---|---|---|
| Perangkat | `DevicesPage.jsx`, `DevicePage.jsx`, `DeviceConnectionsPage.jsx` | Lihat [04](04-kepemilikan-dan-akses.md), [05 §5.6](05-layar-dan-fitur.md) (Jam GPS, pemilik) |
| Grup | `GroupsPage.jsx`, `GroupPage.jsx`, `GroupConnectionsPage.jsx` | Satu grup satu pelanggan. Atribut grup berlaku untuk semua perangkat di dalamnya. Kirim perintah ke grup disembunyikan untuk akun `limitCommands` |
| Geofence | `src/other/GeofencesPage.jsx`, `GeofencesList.jsx`, `settings/GeofencePage.jsx` | Digambar di peta. Satu geofence satu pelanggan. Nama geofence dipakai sebagai nama tempat di tab Perjalanan |
| Pengemudi | `DriversPage.jsx`, `DriverPage.jsx` | **Disembunyikan** (butuh pembaca RFID); aktifkan dengan atribut server `ui.enableDrivers=true` |

## Aturan & Otomasi (tidak tampil untuk reseller)
| Halaman | File | Catatan |
|---|---|---|
| Notifikasi | `NotificationsPage.jsx`, `NotificationPage.jsx` | Jenis kejadian + saluran (web, email, SMS, perintah, dll. sesuai server). Wajib: Tipe, Saluran (+ Perintah bila saluran "command") |
| Perintah tersimpan | `CommandsPage.jsx`, `CommandPage.jsx` | Dibuat admin, dibagikan lewat Koneksi. Akun `limitCommands` hanya bisa memakai perintah tersimpan |
| Kirim perintah | `CommandDevicePage.jsx`, `CommandGroupPage.jsx` | Dari kartu perangkat. Reseller: hanya perangkat stok (privasi). Akun bagikan: tidak ada |
| Pemeliharaan | `MaintenancesPage.jsx`, `MaintenancePage.jsx` | Pengingat servis berdasarkan jarak/jam mesin/tanggal |
| Kalender | `CalendarsPage.jsx`, `CalendarPage.jsx` | Jadwal aktif notifikasi/pemeliharaan (iCal sederhana atau berkas) |
| Atribut terhitung | `ComputedAttributesPage.jsx`, `ComputedAttributePage.jsx` | Rumus di server untuk atribut posisi; untuk admin/teknis |
| Penghitung (accumulators) | `AccumulatorsPage.jsx` | Atur ulang odometer/jam mesin perangkat; tercatat di Audit |

## Bisnis & Sistem
| Halaman | File | Catatan |
|---|---|---|
| Langganan | `src/billing/*` | [03](03-langganan.md) |
| Reseller | `ResellersPage.jsx` | Kelola pelanggan, pindah pelanggan, izin impersonate, Perbaiki Akses Perangkat ([04](04-kepemilikan-dan-akses.md), [02 §2.3b](02-role-dan-hak-akses.md)) |
| Pengguna | `UsersPage.jsx` | [05 §5.5](05-layar-dan-fitur.md); tombol Samakan Hak Akses ([02](02-role-dan-hak-akses.md)) |
| Persetujuan | `src/legal/ConsentsPage.jsx` | [06](06-legal.md) |
| Pengumuman | `AnnouncementPage.jsx` | Kirim pesan ke pengguna lewat saluran notifikasi server |
| Server | `ServerPage.jsx` (admin) | Pengaturan global: pendaftaran, hanya-baca global, atribut server ([07](07-deploy-dan-operasional.md)) |

## Peta, laporan, dan lain-lain
| Halaman | File | Catatan |
|---|---|---|
| Detail posisi | `src/other/PositionPage.jsx` | Semua atribut posisi. Reseller: dialihkan untuk perangkat pelanggan |
| Detail kejadian | `src/other/EventPage.jsx` | Dibuka dari notifikasi/laporan kejadian, menampilkan lokasi kejadian |
| Video langsung | `src/other/StreamPage.jsx` | Hanya protokol JT808 (menu Lokasi) |
| Jaringan | `src/other/NetworkPage.jsx` | Info sel/WiFi dari posisi |
| Emulator | `src/other/EmulatorPage.jsx` | Alat uji admin untuk mengirim posisi palsu |
| Laporan | `src/reports/*ReportPage.jsx` | Gabungan, Kejadian, Geofence, Perjalanan, Berhenti, Ringkasan, Grafik, Posisi (hapus posisi khusus admin). Pemilihan perangkat lewat `ReportFilter` (privasi reseller & akun bagikan, [05 §5.4](05-layar-dan-fitur.md)) |
| Laporan terjadwal | `src/reports/ScheduledPage.jsx` | Laporan dikirim berkala lewat email |
| Log | `src/reports/LogsPage.jsx` | Data mentah dari perangkat yang tersambung (diagnosis pemasangan) |
| Statistik | `src/reports/StatisticsPage.jsx` (admin) | Statistik server harian |
| Audit | `src/reports/AuditPage.jsx` (admin) | [05 §5.4](05-layar-dan-fitur.md), [02 §2.3b](02-role-dan-hak-akses.md) |
