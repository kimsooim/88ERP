# Windows Task Scheduler 자동 설정 스크립트
# 10분 간격으로 통합 메모리 백업 실행

param(
    [switch]$Remove = $false
)

$TaskName = "88OEM-Claude-Memory-Backup"
$ScriptPath = "C:\abot\ann-memory-repo\scripts\scheduler-backup.bat"
$WorkingDir = "C:\abot\ann-memory-repo"

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Host "❌ This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

if ($Remove) {
    # 기존 작업 제거
    Write-Host "🗑️ Removing existing scheduled task..." -ForegroundColor Yellow
    
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "✅ Scheduled task removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Task not found or already removed" -ForegroundColor Yellow
    }
    
    exit 0
}

# 스크립트 파일 존재 확인
if (-not (Test-Path $ScriptPath)) {
    Write-Host "❌ Script file not found: $ScriptPath" -ForegroundColor Red
    Write-Host "Please ensure the backup system is properly installed" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Setting up Claude Memory Backup Scheduler..." -ForegroundColor Cyan
Write-Host "Task Name: $TaskName" -ForegroundColor White
Write-Host "Script Path: $ScriptPath" -ForegroundColor White
Write-Host "Interval: Every 10 minutes" -ForegroundColor White

# 기존 작업 제거 (있는 경우)
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "🗑️ Removed existing task" -ForegroundColor Yellow
} catch {
    # 기존 작업이 없으면 무시
}

# 새 작업 생성
try {
    # 작업 액션 정의
    $Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`"" -WorkingDirectory $WorkingDir
    
    # 트리거 정의 (10분 간격)
    $Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 10) -RepetitionDuration (New-TimeSpan -Days 365)
    
    # 보안 설정
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    
    # 작업 설정
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -DontStopOnIdleEnd
    
    # 작업 등록
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Automated Claude memory backup and Git synchronization every 10 minutes"
    
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Task Details:" -ForegroundColor Cyan
    Write-Host "  • Runs every 10 minutes"
    Write-Host "  • Starts immediately"
    Write-Host "  • Runs even on battery power"
    Write-Host "  • Requires network connection"
    Write-Host "  • Logs saved to: $WorkingDir\logs\"
    Write-Host ""
    Write-Host "🔧 Management Commands:" -ForegroundColor Yellow
    Write-Host "  View task:   Get-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Start task:  Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Stop task:   Stop-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Remove task: .\setup-scheduler.ps1 -Remove"
    Write-Host ""
    Write-Host "📊 Monitor logs at: $WorkingDir\logs\backup.log" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 작업 상태 확인
try {
    $Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    Write-Host "📈 Task Status: $($Task.State)" -ForegroundColor Green
    
    # 첫 실행 시작
    Write-Host "🚀 Starting initial backup..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskName $TaskName
    
    Write-Host "✨ Setup completed! Backup system is now running automatically." -ForegroundColor Green
    
} catch {
    Write-Host "⚠️ Task created but status check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}