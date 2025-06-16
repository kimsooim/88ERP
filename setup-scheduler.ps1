# 88OEM Auto Memory Update Task Scheduler Setup Script
# Run as Administrator

# Check Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "Administrator privileges required. Please run PowerShell as Administrator." -ForegroundColor Red
    Read-Host "Press any key to continue..."
    exit
}

Write-Host "Setting up 88OEM Auto Memory Update Task Scheduler..." -ForegroundColor Green

# Task configuration
$TaskName = "88OEM-Memory-Update"
$TaskDescription = "88OEM Project Auto Memory Update System"
$ScriptPath = "C:\Projects\88oem\run-memory-update.bat"
$LogPath = "C:\Projects\88oem\scheduler.log"

# Remove existing task if exists
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Existing task removed" -ForegroundColor Yellow
} catch {
    Write-Host "No existing task found" -ForegroundColor Gray
}

# Trigger setup (Daily at 9 AM, repeat every 4 hours)
$Trigger1 = New-ScheduledTaskTrigger -Daily -At "09:00AM"
$Trigger1.Repetition = New-ScheduledTaskTrigger -Once -At "09:00AM" -RepetitionInterval (New-TimeSpan -Hours 4) -RepetitionDuration (New-TimeSpan -Days 1)

# Trigger at system startup
$Trigger2 = New-ScheduledTaskTrigger -AtStartup

# Action setup
$Action = New-ScheduledTaskAction -Execute $ScriptPath

# Task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false

# Run as current user
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

# Register scheduled task
try {
    Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Trigger @($Trigger1, $Trigger2) -Action $Action -Settings $Settings -Principal $Principal
    
    Write-Host "Task Scheduler setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Information:" -ForegroundColor Cyan
    Write-Host "- Task Name: $TaskName" -ForegroundColor White
    Write-Host "- Schedule: Daily at 9 AM, repeat every 4 hours" -ForegroundColor White
    Write-Host "- Also runs at system startup" -ForegroundColor White
    Write-Host "- Script Path: $ScriptPath" -ForegroundColor White
    Write-Host ""
    
    # Test run immediately
    Write-Host "Running test execution..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $TaskName
    Start-Sleep -Seconds 3
    
    # Check task status
    $Task = Get-ScheduledTask -TaskName $TaskName
    Write-Host "Task Status: $($Task.State)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "88OEM Auto Memory Update System is now active!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To check in Task Scheduler:" -ForegroundColor Cyan
    Write-Host "1. Win + R -> taskschd.msc" -ForegroundColor White
    Write-Host "2. Find '$TaskName' in Task Scheduler Library" -ForegroundColor White
    
} catch {
    Write-Host "Task Scheduler setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check administrator privileges or set up manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Log file location: $LogPath" -ForegroundColor Gray
Write-Host "Press any key to continue..."
Read-Host