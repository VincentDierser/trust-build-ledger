# Quick deploy with your address as project manager
# Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

$ProjectManager = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

Write-Host "=== Deploying ConstructionExpenseLedger ===" -ForegroundColor Green
Write-Host "Project Manager: $ProjectManager" -ForegroundColor Cyan
Write-Host ""

# Check Hardhat node
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
    Write-Host "Please start Hardhat node first:" -ForegroundColor Yellow
    Write-Host "  npx hardhat node" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Deploying contract..." -ForegroundColor Yellow
npx hardhat deploy:ledger --network localhost --manager $ProjectManager

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
    
    # Read contract address
    $deploymentFile = "deployments\localhost\ConstructionExpenseLedger.json"
    if (Test-Path $deploymentFile) {
        $contractData = Get-Content $deploymentFile | ConvertFrom-Json
        $contractAddress = $contractData.address
        
        Write-Host ""
        Write-Host "Contract Address: $contractAddress" -ForegroundColor Cyan
        Write-Host "Project Manager: $ProjectManager" -ForegroundColor Cyan
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
        Write-Host "Next: Refresh browser and reconnect wallet!" -ForegroundColor Cyan
    }
}
else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}


