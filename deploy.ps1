# ============================================
# Script Deploy Traccar-Web ke Prod (via Git, hemat bandwidth)
# Build via Docker -> copy ke folder deploy-repo -> git push -> VPS git pull
# Jalankan dari folder traccar-web (branch master aktif)
#
# Detail server dibaca dari deploy.config.ps1 (tidak masuk repo).
# Lihat DEPLOY.md untuk langkah setup di komputer baru.
# ============================================

$ConfigPath = Join-Path $PSScriptRoot 'deploy.config.ps1'

if (-not (Test-Path $ConfigPath)) {
    Write-Host "deploy.config.ps1 tidak ditemukan." -ForegroundColor Red
    Write-Host "Salin deploy.config.example.ps1 menjadi deploy.config.ps1, lalu isi detail VPS Anda." -ForegroundColor Yellow
    exit 1
}

. $ConfigPath

foreach ($name in 'KeyPath', 'VpsUser', 'VpsIp', 'VpsPath') {
    if (-not (Get-Variable -Name $name -ValueOnly -ErrorAction SilentlyContinue)) {
        Write-Host "Variabel `$$name belum diisi di deploy.config.ps1." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $KeyPath)) {
    Write-Host "Private key tidak ditemukan di: $KeyPath" -ForegroundColor Red
    exit 1
}

Write-Host "==> 1/4 Building production bundle (via Docker)..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml run --rm traccar-web-dev npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build gagal, deploy dibatalkan." -ForegroundColor Red
    exit 1
}

Write-Host "==> 2/4 Menyalin hasil build ke deploy-repo..." -ForegroundColor Cyan
robocopy build deploy-repo /MIR /XD .git /NFL /NDL /NJH /NJS

Push-Location deploy-repo
git add -A
git commit -m "deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')" --quiet
if ($LASTEXITCODE -eq 0) {
    git push origin deploy --quiet
    Write-Host "==> Perubahan berhasil di-push." -ForegroundColor Cyan
} else {
    Write-Host "==> Tidak ada perubahan file, lewati push." -ForegroundColor Yellow
}
Pop-Location

Write-Host "==> 3/4 VPS: pull branch 'deploy'..." -ForegroundColor Cyan
ssh -i $KeyPath "$VpsUser@$VpsIp" "cd $VpsPath/web-custom && git pull origin deploy --quiet"

Write-Host "==> 4/4 Restart Traccar di VPS..." -ForegroundColor Cyan
ssh -i $KeyPath "$VpsUser@$VpsIp" "cd $VpsPath && docker compose restart traccar"

Write-Host ""
if ($SiteUrl) {
    Write-Host "Selesai. Cek $SiteUrl (hard refresh: Ctrl+Shift+R)" -ForegroundColor Green
} else {
    Write-Host "Selesai. (hard refresh: Ctrl+Shift+R)" -ForegroundColor Green
}
