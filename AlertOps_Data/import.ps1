# =============================================
# AlertOps - Script import data vào MongoDB
# Chạy file này bằng PowerShell (Run as Admin)
# =============================================

Write-Host "=== AlertOps Data Import ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra mongoimport có sẵn không
if (-not (Get-Command mongoimport -ErrorAction SilentlyContinue)) {
    Write-Host "[LỖI] Không tìm thấy mongoimport." -ForegroundColor Red
    Write-Host "Cài MongoDB Community tại: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra MongoDB service đang chạy không
$svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($svc.Status -ne "Running") {
    Write-Host "Đang khởi động MongoDB service..." -ForegroundColor Yellow
    Start-Service -Name MongoDB
    Start-Sleep -Seconds 2
}

$DB = "AlertOpsDB"
$DIR = "$PSScriptRoot\data"

$collections = @(
    @{ file = "projects.json";             name = "Projects" },
    @{ file = "alerts.json";               name = "Alerts" },
    @{ file = "escalationRules.json";      name = "EscalationRules" },
    @{ file = "notificationHistory.json";  name = "NotificationHistory" }
)

foreach ($col in $collections) {
    $path = "$DIR\$($col.file)"
    Write-Host "Importing $($col.name)..." -ForegroundColor Green
    mongoimport --db $DB --collection $col.name --file $path --jsonArray --drop
}

Write-Host ""
Write-Host "=== Import xong! ===" -ForegroundColor Cyan
Write-Host "Mở MongoDB Compass > AlertOpsDB để kiểm tra data." -ForegroundColor Gray
