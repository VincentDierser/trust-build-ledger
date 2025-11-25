# Quick Setup Guide

## Step 1: Install Dependencies

```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd ui
npm install
cd ..
```

## Step 2: Start Hardhat Node

Open a terminal and run:

```bash
npx hardhat node
```

Keep this terminal running. The Hardhat node provides a local blockchain for testing.

## Step 3: Deploy Contract

Open a new terminal and run:

```bash
npx hardhat deploy --network localhost
```

You should see output like:
```
ConstructionExpenseLedger contract:  0x5FbDB2315678afecb367f032d93F642f64180aa3
Project Manager:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Copy the contract address** (the first address shown).

## Step 4: Configure Frontend

Create a file `ui/.env.local` with the contract address:

```bash
# Windows PowerShell
cd ui
New-Item -Path .env.local -ItemType File
# Then edit the file and add:
# VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Or manually create `ui/.env.local` with:
```
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Replace `0x5FbDB2315678afecb367f032d93F642f64180aa3` with your actual contract address from Step 3.

## Step 5: Start Frontend

```bash
cd ui
npm run dev
```

The app should now be available at `http://localhost:8080` (or the port shown in the terminal).

## Step 6: Connect Wallet

1. Install [Rainbow Wallet](https://rainbow.me/) browser extension
2. Click "Connect Wallet" in the app
3. Select Rainbow wallet
4. The deployer address (from Hardhat node) will be the Project Manager and can decrypt expenses

## Troubleshooting

### "Contract address not configured" error
- Make sure you created `ui/.env.local` with `VITE_CONTRACT_ADDRESS=...`
- Restart the dev server after creating/updating `.env.local`

### "Cannot connect to Hardhat node" error
- Make sure `npx hardhat node` is running in a separate terminal
- Check that it's running on `http://localhost:8545`

### WalletConnect 403 errors
- These are harmless warnings - the app will still work with Rainbow extension
- To remove them, get a Project ID from https://cloud.reown.com/ and add it to `ui/.env.local`:
  ```
  VITE_WALLETCONNECT_PROJECT_ID=your_project_id
  ```

## Testing

Run the test suite:

```bash
npm run test
```

This will test:
- Contract deployment
- Encrypted expense recording
- Expense accumulation
- Weekly total calculation
- Decryption (as project manager)

