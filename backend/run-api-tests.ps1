# API Test Runner for Windows PowerShell
# This script starts the server, runs API tests, then stops the server

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  API Test Runner with Auto Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if server is already running on port 5000
$serverRunning = $false
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        $serverRunning = $true
        Write-Host "✓ Server is already running on port 5000" -ForegroundColor Green
    }
} catch {
    $serverRunning = $false
}

$startedServer = $false
$serverProcess = $null

if (-not $serverRunning) {
    Write-Host "→ Starting backend server..." -ForegroundColor Yellow
    
    # Start server in background
    $serverProcess = Start-Process powershell -ArgumentList "npm start" -PassThru -WindowStyle Hidden
    $startedServer = $true
    
    # Wait for server to be ready
    Write-Host "→ Waiting for server to start..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $serverReady = $false
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++
        
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                $serverReady = $true
                break
            }
        } catch {
            # Continue waiting
        }
        
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    
    Write-Host ""
    
    if ($serverReady) {
        Write-Host "✓ Server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Server failed to start within 30 seconds" -ForegroundColor Red
        if ($serverProcess) {
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

Write-Host "`n→ Running API tests..." -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Run API tests
npm run test:api

$testExitCode = $LASTEXITCODE

Write-Host "`n========================================" -ForegroundColor Cyan

if ($testExitCode -eq 0) {
    Write-Host "✓ API tests completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ API tests failed!" -ForegroundColor Red
}

# Stop server if we started it
if ($startedServer -and $serverProcess) {
    Write-Host "→ Stopping server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Server stopped" -ForegroundColor Green
}

Write-Host "========================================`n" -ForegroundColor Cyan

exit $testExitCode
