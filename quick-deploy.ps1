# Quick deploy script - Deploy with your current wallet address as project manager
# Usage: .\quick-deploy.ps1 [your-full-address]

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectManagerAddress
)

Write-Host "=== Quick Deploy ConstructionExpenseLedger ===" -ForegroundColor Green
Write-Host ""

# Validate address
if (-not $ProjectManagerAddress.StartsWith("0x") -or $ProjectManagerAddress.Length -ne 42) {
    Write-Host "ERROR: Invalid address format. Must be 42 characters starting with 0x" -ForegroundColor Red
    Write-Host "Example: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor Yellow
    exit 1
}

# Check if Hardhat node is running
Write-Host "Checking Hardhat node..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST `
        -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' `
        -ContentType "application/json" -ErrorAction Stop -TimeoutSec 2
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Hardhat node is running" -ForegroundColor Green
    }
}
catch {
    Write-Host "ERROR: Hardhat node is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Hardhat node in a new terminal:" -ForegroundColor Yellow
    Write-Host "  npx hardhat node" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Network: localhost" -ForegroundColor White
Write-Host "  Project Manager: $ProjectManagerAddress" -ForegroundColor White
Write-Host ""

# Set environment variable and deploy
$env:PROJECT_MANAGER = $ProjectManagerAddress
Write-Host "Deploying contract..." -ForegroundColor Yellow
npx hardhat deploy:ledger --network localhost --manager $ProjectManagerAddress

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deployment Successful! ===" -ForegroundColor Green
    
    # Try to read contract address from deployment file
    $deploymentFile = "deployments\localhost\ConstructionExpenseLedger.json"
    if (Test-Path $deploymentFile) {
        $contractData = Get-Content $deploymentFile | ConvertFrom-Json
        $contractAddress = $contractData.address
        
        Write-Host ""
        Write-Host "Contract Address: $contractAddress" -ForegroundColor Cyan
        Write-Host "Project Manager: $ProjectManagerAddress" -ForegroundColor Cyan
        Write-Host ""
        
        # Update ui/.env.local
        $envLocalPath = "ui\.env.local"
        $envContent = "# Contract Address`nVITE_CONTRACT_ADDRESS=$contractAddress`n"
        
        if (Test-Path $envLocalPath) {
            $existing = Get-Content $envLocalPath -Raw
            if ($existing -match "VITE_CONTRACT_ADDRESS=") {
                $existing = $existing -replace "VITE_CONTRACT_ADDRESS=.*", "VITE_CONTRACT_ADDRESS=$contractAddress"
                Set-Content -Path $envLocalPath -Value $existing -Encoding UTF8
            }
            else {
                Add-Content -Path $envLocalPath -Value "`n$envContent" -Encoding UTF8
            }
        }
        else {
            $envDir = Split-Path $envLocalPath
            if (-not (Test-Path $envDir)) {
                New-Item -ItemType Directory -Path $envDir -Force | Out-Null
            }
            Set-Content -Path $envLocalPath -Value $envContent -Encoding UTF8
        }
        
        Write-Host "Updated ui/.env.local" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Refresh your browser and reconnect wallet!" -ForegroundColor Cyan
    }
}
else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

