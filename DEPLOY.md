# Deploy & Setup

Catatan khusus fork ini (tidak ada di README upstream Traccar).

## Alur deploy (otomatis)

1. Push / merge ke branch `master`.
2. GitHub Actions (`.github/workflows/deploy.yml`) menjalankan lint + build,
   lalu meng-commit hasil build ke branch `deploy`.
3. Cron di VPS (`deploy-pull.sh`, tiap 5 menit) menjalankan
   `git pull origin deploy` di folder `web-custom`. Folder itu di-bind mount
   ke container Traccar, jadi **tidak perlu restart**.
4. Cek versi live di `https://<domain>/version.json` (atau label versi di
   halaman login). Browser mungkin perlu hard refresh karena PWA cache.

Total jeda: ±5 menit + durasi build GitHub Actions (±2-3 menit).

Aturan:

- **Jangan push manual ke branch `deploy`** dan jangan force push. Cron
  hanya bisa fast-forward; kalau riwayat ditulis ulang, pull gagal diam-diam
  (cek `/home/ubuntu/apps/traccar/deploy-pull.log` di VPS).
- Kalau build atau lint gagal, tidak ada yang ter-deploy. Lihat tab
  **Actions** di GitHub.
- Deploy ulang tanpa commit baru: tab Actions → Deploy → **Run workflow**.

## Cara lama (tidak dipakai lagi)

`deploy.ps1` (Windows/PowerShell) dulu mem-build lokal lalu push ke branch
`deploy`. Jangan dijalankan bersamaan dengan workflow di atas. Petunjuk
lamanya di bawah ini hanya untuk arsip.


## 1. Clone

```powershell
git clone https://github.com/karepkuto/traccar-web.git
cd traccar-web
npm install
```

## 2. Siapkan konfigurasi deploy

Detail VPS **tidak disimpan di repo**. Setelah clone, buat file konfigurasi lokal:

```powershell
Copy-Item deploy.config.example.ps1 deploy.config.ps1
notepad deploy.config.ps1
```

Isi keempat variabelnya:

| Variabel   | Keterangan                                      |
| ---------- | ----------------------------------------------- |
| `$KeyPath` | Path ke private key `.pem` di komputer ini      |
| `$VpsUser` | User SSH di VPS                                 |
| `$VpsIp`   | IP atau hostname VPS                            |
| `$VpsPath` | Folder aplikasi di VPS                          |
| `$SiteUrl` | URL situs, hanya untuk pesan akhir (opsional)   |

`deploy.config.ps1` sudah masuk `.gitignore`, jadi aman dari `git add -A`.

Private key `.pem` **jangan** ditaruh di dalam folder repo. Simpan di luar,
misalnya `D:\projek\vps\`, lalu tunjuk lewat `$KeyPath`.

## 3. Siapkan folder deploy-repo

`deploy.ps1` mendorong hasil build lewat branch `deploy` di folder terpisah:

```powershell
git clone -b deploy https://github.com/karepkuto/traccar-web.git deploy-repo
```

Folder `deploy-repo/` juga di-gitignore dari repo utama.

## 4. Jalankan

```powershell
# development
npm start

# deploy ke produksi (dari branch master)
.\deploy.ps1
```

`deploy.ps1` akan berhenti dengan pesan jelas kalau `deploy.config.ps1` belum
dibuat atau private key tidak ditemukan.

## Catatan versi

Footer versi di **Settings → Preferences → Info** menampilkan
`versi · git hash · waktu build`. Hash dan waktu diambil saat build
(`vite.config.js`), jadi nilainya ikut berubah setiap `npm run build`
atau restart dev server — bukan saat halaman dibuka.

Versi yang sama juga tampil kecil di **halaman login** dan di **bawah menu
Settings**. Untuk cek tanpa login, buka `https://<domain>/version.json`
(berisi versi, git hash, branch, dan waktu build WIB). File ini tidak
di-cache service worker, jadi selalu mencerminkan build yang sedang live.
