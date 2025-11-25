# Troubleshooting Guide

## WalletConnect 403 Errors

### What you see:
```
POST https://pulse.walletconnect.org/e?projectId=... 403 (Forbidden)
Origin http://localhost:8080 not found on Allowlist
[Reown Config] Failed to fetch remote project configuration
```

### What it means:
These are **harmless warnings**. RainbowKit automatically falls back to browser extensions (Rainbow/MetaMask), so your app works perfectly.

### Why it happens:
- The default Project ID doesn't have `localhost:8080` in its allowlist
- WalletConnect/Reown requires domain allowlisting for security

### Solutions:

#### Option 1: Ignore it (Recommended for local dev)
✅ **Do nothing** - Your app works fine. These are just console warnings.

#### Option 2: Get your own Project ID (For clean console)

1. **Register at Reown Cloud**
   - Visit https://cloud.reown.com/
   - Sign up for a free account
   - Create a new project

2. **Get your Project ID**
   - Copy the Project ID from your project dashboard

3. **Add localhost to allowlist**
   - In project settings, add: `http://localhost:8080`
   - Save changes

4. **Configure in your app**
   - Edit `ui/.env.local` (create if it doesn't exist)
   - Add: `VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here`
   - Restart dev server: `npm run dev`

5. **Result**
   - Console warnings will disappear
   - App functionality remains the same

## Transaction Errors

### "Internal JSON-RPC error" or "eth_sendTransaction failed"

This error usually occurs when sending transactions. Common causes:

#### Solution 1: Restart Hardhat Node
```bash
# Stop Hardhat node (Ctrl+C)
# Restart it
npx hardhat node
```

#### Solution 2: Check Account Balance
- Hardhat node provides test accounts with 10000 ETH each
- Make sure you're using an account with balance
- First account (deployer) is: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

#### Solution 3: Verify Contract Deployment
```bash
# Check if contract is deployed
npx hardhat deploy --network localhost
```

#### Solution 4: Check Gas Limits
- The app now automatically estimates gas
- If estimation fails, it uses a default of 10M gas
- For FHE operations, gas usage can be high

#### Solution 5: Verify Encrypted Data
- Make sure all three expense values (material, labor, rental) are valid numbers
- Values should be positive integers
- Check browser console for encryption errors

#### Solution 6: Network Connection
- Ensure wallet is connected to localhost network (Chain ID: 31337)
- For MetaMask: Add localhost network manually
- For Rainbow: Should auto-detect

### "Transaction was rejected"
- User cancelled the transaction in wallet
- Simply try again and approve the transaction

### "Gas estimation failed"
- Contract may revert the transaction
- Check that all parameters are valid
- Verify contract is properly deployed
- Try with smaller values first

## Other Common Issues

### "Contract address not configured"
- **Solution**: Create `ui/.env.local` with `VITE_CONTRACT_ADDRESS=0x...`
- Get address from: `npx hardhat deploy --network localhost`

### "Cannot connect to Hardhat node"
- **Solution**: Make sure `npx hardhat node` is running
- Check it's on `http://localhost:8545`

### "Internal JSON-RPC error" in MetaMask
- **Solution**: Add localhost network to MetaMask:
  - Network Name: `Hardhat Local`
  - RPC URL: `http://localhost:8545`
  - Chain ID: `31337`
  - Currency: `ETH`

### FHEVM not initializing
- **Solution**: 
  - Ensure Hardhat node is running with FHEVM support
  - Check console for `[FHEVM] Mock FHEVM instance created successfully`
  - If not, restart Hardhat node

## Quick Status Check

✅ **Everything working if you see:**
- `[FHEVM] Mock FHEVM instance created successfully`
- Wallet connects successfully
- Can record/view expenses

⚠️ **Warnings (safe to ignore):**
- WalletConnect 403 errors
- "Lit is in dev mode"
- Reown config fetch failures

❌ **Real errors (need fixing):**
- "Contract address not configured"
- "Cannot connect to Hardhat node"
- FHEVM initialization failures

