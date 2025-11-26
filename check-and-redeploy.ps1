# Check current project manager and redeploy with your address
# Usage: .\check-and-redeploy.ps1 [your-wallet-address]

param(
    [string]$YourAddress = ""
)

Write-Host "=== Check and Redeploy ConstructionExpenseLedger ===" -ForegroundColor Green
Write-Host ""

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
    exit 1
}

# Get your wallet address
if ([string]::IsNullOrEmpty($YourAddress)) {
    Write-Host ""
    Write-Host "Please provide your wallet address (the one shown in the app: 0x7099...79C8)" -ForegroundColor Yellow
    Write-Host "Common Hardhat test addresses:" -ForegroundColor Cyan
    Write-Host "  Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor Gray
    Write-Host "  Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor Gray
    Write-Host "  Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" -ForegroundColor Gray
    Write-Host ""
    $YourAddress = Read-Host "Enter your wallet address (0x...)"
    
    if ([string]::IsNullOrEmpty($YourAddress)) {
        Write-Host "ERROR: Address is required" -ForegroundColor Red
        exit 1
    }
}

# Validate address
if (-not $YourAddress.StartsWith("0x") -or $YourAddress.Length -ne 42) {
    Write-Host "ERROR: Invalid address format. Must be 42 characters starting with 0x" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Deployment Configuration ===" -ForegroundColor Cyan
Write-Host "  Network: localhost" -ForegroundColor White
Write-Host "  Project Manager (Your Address): $YourAddress" -ForegroundColor White
Write-Host ""

# Deploy using Hardhat task
Write-Host "Deploying contract with your address as project manager..." -ForegroundColor Yellow
npx hardhat deploy:ledger --network localhost --manager $YourAddress

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deployment Successful! ===" -ForegroundColor Green
    
    # Read contract address from deployment
    $deploymentFile = "deployments\localhost\ConstructionExpenseLedger.json"
    if (Test-Path $deploymentFile) {
        $contractData = Get-Content $deploymentFile | ConvertFrom-Json
        $contractAddress = $contractData.address
        
        Write-Host ""
        Write-Host "New Contract Address: $contractAddress" -ForegroundColor Cyan
        Write-Host "Project Manager: $YourAddress" -ForegroundColor Cyan
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
        
        Write-Host "Updated ui/.env.local with new contract address" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== Next Steps ===" -ForegroundColor Cyan
        Write-Host "1. Refresh your browser page" -ForegroundColor White
        Write-Host "2. Reconnect your wallet" -ForegroundColor White
        Write-Host "3. You should now see: 'User is project manager'" -ForegroundColor White
        Write-Host ""
        Write-Host "Your wallet address: $YourAddress" -ForegroundColor Yellow
        Write-Host "New contract address: $contractAddress" -ForegroundColor Yellow
    }
}
else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

