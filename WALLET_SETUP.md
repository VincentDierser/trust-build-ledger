# Wallet Setup Guide

## Option 1: Use Rainbow Wallet (Recommended)

Rainbow Wallet is the easiest option for local development:

1. **Install Rainbow Wallet Extension**
   - Visit https://rainbow.me/
   - Install the browser extension
   - Create or import a wallet

2. **Connect to Localhost Network**
   - Click "Connect Wallet" in the app
   - Select Rainbow wallet
   - RainbowKit will automatically detect and switch to localhost network

3. **Get Test ETH**
   - Hardhat node provides test accounts with ETH
   - The first account (deployer) is the Project Manager
   - You can import Hardhat accounts to Rainbow if needed

## Option 2: Use MetaMask

If you prefer MetaMask, you need to configure the localhost network:

### Step 1: Add Localhost Network to MetaMask

1. Open MetaMask
2. Click the network dropdown (top left)
3. Click "Add Network" → "Add a network manually"
4. Enter the following details:

   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: (leave empty)

5. Click "Save"

### Step 2: Import Hardhat Account (Optional)

To use the deployer account (Project Manager):

1. In MetaMask, click the account icon (top right)
2. Click "Import Account"
3. Copy the private key from Hardhat node output (first account)
4. Paste and import

**Note**: Hardhat node shows private keys in the console when started:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 3: Connect MetaMask

1. Click "Connect Wallet" in the app
2. Select MetaMask
3. Make sure you're on the "Hardhat Local" network
4. Approve the connection

## Troubleshooting

### "Internal JSON-RPC error" in MetaMask

This usually means:
- Hardhat node is not running → Start it with `npx hardhat node`
- Wrong network selected → Switch to "Hardhat Local" network
- RPC URL incorrect → Verify it's `http://localhost:8545`

### "Origin not found on Allowlist" (403 error)

This is a WalletConnect warning and can be ignored. The app will still work with browser extensions (Rainbow/MetaMask).

To remove the warning:
1. Get a Project ID from https://cloud.reown.com/
2. Add `http://localhost:8080` to the allowlist
3. Add to `ui/.env.local`: `VITE_WALLETCONNECT_PROJECT_ID=your_project_id`

### FHEVM Initialization

If you see `[FHEVM] Mock FHEVM instance created successfully`, that's good! FHEVM is working correctly.

## Quick Test

After connecting your wallet:

1. ✅ Check that wallet address is displayed
2. ✅ If using deployer account, you should see "You are the Project Manager"
3. ✅ Try recording an expense
4. ✅ Try viewing and decrypting expenses (if Project Manager)

