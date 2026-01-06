\
    # Create .env.local from the example template (safe on Windows)
    # Run: powershell -ExecutionPolicy Bypass -File .\create-env.ps1
    $here = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $here

    if (!(Test-Path ".env.local.example")) {
      Write-Host "Missing .env.local.example" -ForegroundColor Red
      exit 1
    }

    Copy-Item ".env.local.example" ".env.local" -Force
    Write-Host "Created .env.local. Now edit it and paste your real API key." -ForegroundColor Green
