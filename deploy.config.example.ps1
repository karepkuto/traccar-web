# Salin file ini menjadi deploy.config.ps1, lalu isi sesuai VPS Anda.
# deploy.config.ps1 di-gitignore sehingga detail server tidak ikut ter-push.
$KeyPath = "D:\path\ke\private-key.pem"
$VpsUser = "ubuntu"
$VpsIp   = "203.0.113.10"
$VpsPath = "~/apps/traccar"
$SiteUrl = "https://contoh.domain.anda"
