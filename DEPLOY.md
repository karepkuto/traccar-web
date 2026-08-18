# Deploy & Setup di Komputer Baru

Catatan khusus fork ini (tidak ada di README upstream Traccar).

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
