# Deploy ConstructionExpenseLedger with current account as project manager
# Usage: .\deploy-with-current-account.ps1 [-Network localhost] [-ProjectManager 0x...]

param(
    [string]$Network = "localhost",
    [string]$ProjectManager = ""
)

Write-Host "=== Deploy ConstructionExpenseLedger Contract ===" -ForegroundColor Green
Write-Host "Solution 2: Redeploy contract with current account as project manager" -ForegroundColor Cyan
Write-Host ""

# Check if Hardhat node is running (for localhost)
if ($Network -eq "localhost") {
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
        Write-Host "Please start Hardhat node first in a new terminal:" -ForegroundColor Yellow
        Write-Host "  npx hardhat node" -ForegroundColor White
        exit 1
    }
}

# Get project manager address
if ([string]::IsNullOrEmpty($ProjectManager)) {
    Write-Host "Please provide the project manager address (your current connected account)" -ForegroundColor Yellow
    Write-Host "You can copy the account address from your wallet" -ForegroundColor Yellow
    Write-Host ""
    $ProjectManager = Read-Host "Enter project manager address (0x...)"
    
    if ([string]::IsNullOrEmpty($ProjectManager)) {
        Write-Host "ERROR: Project manager address is required" -ForegroundColor Red
        exit 1
    }
}

# Validate address format
if (-not $ProjectManager.StartsWith("0x") -or $ProjectManager.Length -ne 42) {
    Write-Host "ERROR: Invalid address format. Address should be 42 characters starting with 0x" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Network: $Network" -ForegroundColor White
Write-Host "  Project Manager: $ProjectManager" -ForegroundColor White
Write-Host ""

# Set environment variable for deployment script
$env:PROJECT_MANAGER = $ProjectManager

# Deploy using the new deployment script
Write-Host "Deploying contract..." -ForegroundColor Yellow
npx hardhat deploy --network $Network --tags ConstructionExpenseLedgerWithCurrentAccount

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
    Write-Host ""
    
    # Read and display contract address
    $deploymentFile = "deployments\$Network\ConstructionExpenseLedger.json"
    if (Test-Path $deploymentFile) {
        $contractData = Get-Content $deploymentFile | ConvertFrom-Json
        $contractAddress = $contractData.address
        
        Write-Host "Contract Address:" -ForegroundColor Cyan
        Write-Host "  $contractAddress" -ForegroundColor White
        Write-Host ""
        Write-Host "Project Manager Address:" -ForegroundColor Cyan
        Write-Host "  $ProjectManager" -ForegroundColor White
        Write-Host ""
        
        # Check if ui/.env.local exists
        $envLocalPath = "ui\.env.local"
        if (Test-Path $envLocalPath) {
            Write-Host "Updating ui/.env.local file..." -ForegroundColor Yellow
            
            # Read existing content
            $envContent = Get-Content $envLocalPath -Raw
            
            # Update or add VITE_CONTRACT_ADDRESS
            if ($envContent -match "VITE_CONTRACT_ADDRESS=") {
                $envContent = $envContent -replace "VITE_CONTRACT_ADDRESS=.*", "VITE_CONTRACT_ADDRESS=$contractAddress"
            }
            else {
                # Add newline if content doesn't end with one
                $lastChar = $envContent.Substring($envContent.Length - 1)
                if ($lastChar -ne "`n" -and $lastChar -ne "`r") {
                    $envContent += "`n"
                }
                $envContent += "# Contract Address (from deployment)`n"
                $envContent += "VITE_CONTRACT_ADDRESS=$contractAddress`n"
            }
            
            Set-Content -Path $envLocalPath -Value $envContent -Encoding UTF8
            Write-Host "ui/.env.local updated" -ForegroundColor Green
        }
        else {
            Write-Host "Creating ui/.env.local file..." -ForegroundColor Yellow
            $envDir = Split-Path $envLocalPath
            if (-not (Test-Path $envDir)) {
                New-Item -ItemType Directory -Path $envDir -Force | Out-Null
            }
            
            $envContent = "# Contract Address (from deployment)`n"
            $envContent += "VITE_CONTRACT_ADDRESS=$contractAddress`n"
            $envContent += "`n"
            $envContent += "# WalletConnect Project ID (optional for local dev)`n"
            $envContent += "# VITE_WALLETCONNECT_PROJECT_ID=your_project_id`n"
            
            Set-Content -Path $envLocalPath -Value $envContent -Encoding UTF8
            Write-Host "ui/.env.local created" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Make sure your wallet is connected to the same account as project manager" -ForegroundColor White
        Write-Host "   Project Manager Address: $ProjectManager" -ForegroundColor White
        Write-Host "2. Start the frontend application:" -ForegroundColor White
        Write-Host "   cd ui" -ForegroundColor White
        Write-Host "   npm run dev" -ForegroundColor White
        Write-Host "3. Connect wallet in the app and test functionality" -ForegroundColor White
    }
    else {
        Write-Host "WARNING: Cannot read deployment file $deploymentFile" -ForegroundColor Yellow
        Write-Host "Please manually check the contract address in deployment output" -ForegroundColor Yellow
    }
}
else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}
