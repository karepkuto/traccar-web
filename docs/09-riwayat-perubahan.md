# 9. Riwayat Perubahan

Format: `hash` tanggal · ringkasan. Entri terbaru di atas.
Setiap commit yang mengubah perilaku aplikasi **wajib** menambah baris di sini
(hash diisi setelah commit, atau tulis "commit ini" lalu perbarui di commit berikutnya).

| Commit | Tanggal | Perubahan |
|---|---|---|
| (commit ini) | 2026-11-03 | Persetujuan EULA untuk akun Hanya-baca: server hanya menerima `termsAccepted`, rincian disimpan di perangkat; pesan error tidak lagi berupa stack trace Java |
| `65f1beb` | 2026-11-03 | Folder `docs/` dan aturan pembaruan dokumentasi di `CLAUDE.md` |
| `34815ad` | 2026-11-03 | Positions report: only administrators can delete positions |
| `7fa6b6b` | 2026-11-03 | Keep reseller access to their customers' devices in every linking path |
| `30335bb` | 2026-11-03 | Informative users page with role tabs and sortable columns; reseller tweaks |
| `1dfc50b` | 2026-11-03 | Readable audit log for administrators |
| `fb05a94` | 2026-11-03 | Move customers between resellers, audit patterns, activation reminders, EULA update |
| `b124844` | 2026-11-03 | Device list filters by owner, subscription, movement and engine, new sorts |
| `9f7fe59` | 2026-11-03 | Role-based permissions, 3-day installation test and billing review tools |
| `f25264f` | 2026-11-03 | Apply required markers, Save-time validation and advanced toggle to all settings forms |
| `0c17a45` | 2026-11-03 | Simpler user / reseller form with Laravel-style validation |
| `9611300` | 2026-11-03 | Replay: per-trip history tab and typed time range |
| `4de3336` | 2026-11-03 | Forms: always-open titled sections instead of collapsible panels |
| `44bd9d0` | 2026-11-03 | Map screen: card-style device list and clearer device card |
| `1d541fb` | 2026-11-03 | Polish: auth pages, buttons, position details, error messages |
| `b60a1e9` | 2026-11-03 | Add 'Reload app' for the installed app |
| `2a1157c` | 2026-11-03 | Update notice: add close button and clearer actions |
| `c172680` | 2026-11-03 | Light / dark theme toggle, light by default |
| `bc1f5ba` | 2026-11-02 | Review module descriptions for accuracy and coverage |
| `35b1c7a` | 2026-11-02 | Explanations behind (i) buttons on every module |
| `579f840` | 2026-11-02 | Fix lint error in ConnectionsLayout (unused prop) |
| `6a68a36` | 2026-11-02 | Clearer relation (Koneksi) pages for devices, groups and users |
| `179866e` | 2026-11-02 | Phones: expandable table rows instead of sideways scrolling |
| `ba8bfae` | 2026-11-02 | Make tables usable on phones and narrow screens |
| `d30ae59` | 2026-11-02 | Make CRUD screens feel like a familiar admin panel |
| `490d030` | 2026-11-02 | Add Resellers page (admin) under Business |
| `8d2f132` | 2026-11-02 | Enforce one customer per device, group and geofence |
| `4178108` | 2026-11-02 | Hide driver references across the app when Drivers is disabled |
| `5f073f8` | 2026-11-02 | Hide the Drivers feature by default |
| `bf66e6f` | 2026-11-02 | Driver page: label the unique ID as the driver card ID, not IMEI |
| `c1eee2d` | 2026-11-02 | Improve Indonesian wording across the app |
| `ffa9e10` | 2026-11-02 | Group settings menu into collapsible categories |
| `d172d4a` | 2026-11-02 | Billing: reseller accounts, rupiah inputs, auto period dates, payment history |
| `2b673f9` | 2026-11-02 | Default language is Indonesian |
| `b2f8aa9` | 2026-11-02 | Rename app icons so phones fetch the Pantauku icons |
| `45c69c4` | 2026-11-02 | Add Pantauku install banner for Android and iOS |
| `8bf6748` | 2026-11-02 | PWA: Pantauku manifest, orange app icon, automatic updates |
| `21ff94e` | 2026-11-02 | Add legal consent gate with recorded proof and public legal page |
| `2cbb2eb` | 2026-11-02 | Replay speed up to 10x, time range trimming, WIB timezone |
| `ae9e70f` | 2026-11-02 | Complete Indonesian translation and fall back to English |
| `615d09c` | 2026-11-02 | Rebrand to Pantauku: name, logo, icons and page title |
| `3665209` | 2026-11-02 | Apply Pantauku vivid orange theme with rounded card style |
| `ce5c8e2` | 2026-11-02 | Deploy automatically from master via GitHub Actions |
| `4011258` | 2026-11-02 | Show commit hash and commit date (WIB), commit message on hover |
| `7848245` | 2026-11-02 | Show build version and WIB build time on site, add version.json |
| `585b3a7` | 2026-11-02 | Add manual prepaid billing module for devices |
| `aa3987f` | 2026-08-18 | Enhance git hash retrieval and improve build time formatting |
| `6b8b004` | 2026-08-18 | Add Docker dev setup and deploy script |
| `20cc250` | 2026-08-18 | Add git hash and build time to environment variables |

Commit sebelum `20cc250` berasal dari upstream Traccar web.
