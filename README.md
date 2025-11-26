# Trust Build Ledger - Encrypted Construction Expense Ledger

A privacy-preserving construction expense ledger built with FHEVM (Fully Homomorphic Encryption Virtual Machine) that allows recording encrypted daily expenses (material, labor, rental costs) on-chain. Expenses remain private, and only the project manager can decrypt and view the details.

## Features

- **🔒 Encrypted Expense Recording**: Record material, labor, and rental costs with FHE encryption
- **➕ FHE Calculation**: Automatically calculate weekly totals in encrypted state
- **🔐 Private Decryption**: Only project manager can decrypt and view expense details
- **💼 Rainbow Wallet Integration**: Seamless wallet connection using RainbowKit
- **🌐 Multi-Network Support**: Works on local Hardhat network and Sepolia testnet

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm** or **yarn/pnpm**: Package manager
- **Rainbow Wallet**: Browser extension installed

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd ui && npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile contracts**

   ```bash
   npm run compile
   npm run typechain
   ```

4. **Configure environment variables**

   ```bash
   cd ui
   # Copy the example env file
   cp .env.local.example .env.local
   
   # Edit .env.local and add:
   # - VITE_WALLETCONNECT_PROJECT_ID (optional for local dev, required for production)
   #   Get a free Project ID from https://cloud.walletconnect.com/
   #   Add http://localhost:8080 to the allowlist in project settings
   # - VITE_CONTRACT_ADDRESS (after deployment)
   ```

5. **Deploy to local network**

   ```bash
   # Terminal 1: Start a local FHEVM-ready node
   npx hardhat node

   # Terminal 2: Deploy to local network
   npx hardhat deploy --network localhost

   # Copy the deployed contract address and update ui/.env.local
   # VITE_CONTRACT_ADDRESS=0x...
   ```

5. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

6. **Connect wallet and test**

   - Open the app in your browser
   - Connect wallet to localhost network (Chain ID: 31337)
   - Record daily expenses (material, labor, rental costs)
   - View encrypted expenses
   - As project manager, decrypt expenses to verify encryption/decryption

7. **Run tests**

   ```bash
   # Local network tests
   npm run test

   # Sepolia testnet tests (after deployment)
   npm run test:sepolia
   ```

## Project Structure

```
trust-build-ledger/
├── contracts/                           # Smart contract source files
│   └── ConstructionExpenseLedger.sol   # Main expense ledger contract
├── deploy/                              # Deployment scripts
│   └── deploy_ConstructionExpenseLedger.ts
├── test/                                # Test files
│   ├── ConstructionExpenseLedger.ts    # Local network tests
│   └── ConstructionExpenseLedgerSepolia.ts # Sepolia testnet tests
├── ui/                                  # Frontend React application
│   ├── src/
│   │   ├── components/                 # React components
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useExpenseLedger.tsx    # Main contract interaction hook
│   │   │   └── useFhevm.tsx             # FHEVM instance management
│   │   ├── fhevm/                       # FHEVM utilities
│   │   ├── pages/                      # Page components
│   │   │   └── ExpenseLedger.tsx       # Main expense ledger page
│   │   └── providers/                  # React providers
│   │       └── WalletProvider.tsx       # Rainbow wallet provider
│   └── public/                         # Static assets
│       └── logo.svg                    # App logo
├── hardhat.config.ts                   # Hardhat configuration
└── package.json                        # Dependencies and scripts
```

## Smart Contract

### ConstructionExpenseLedger.sol

The main smart contract that handles encrypted expense storage and calculation using FHEVM.

#### Key Functions

- **`recordDailyExpense(uint256 date, externalEuint32 encryptedMaterialCost, externalEuint32 encryptedLaborCost, externalEuint32 encryptedRentalCost, bytes calldata inputProof)`**: 
  - Records encrypted daily expenses (material, labor, rental costs)
  - Accumulates expenses if the same date is recorded multiple times
  - Grants decryption permissions to project manager

- **`getDailyExpense(uint256 date)`**: 
  - Returns encrypted expenses for a specific date
  - Returns three encrypted values: material, labor, rental costs

- **`calculateWeeklyTotal(uint256 weekStartDate)`**: 
  - Calculates encrypted weekly totals for 7 days starting from weekStartDate
  - Performs FHE addition on encrypted values
  - Returns encrypted totals for material, labor, and rental costs

- **`projectManager()`**: 
  - Returns the address of the project manager who can decrypt expenses

## Frontend Usage

### Components

1. **Record Expense Tab**: 
   - Input date and three expense types (material, labor, rental)
   - Encrypts and submits to contract
   - Shows transaction status

2. **View Expenses Tab**: 
   - Displays encrypted expenses for a specific date
   - Decrypt button (only for project manager) to view decrypted values
   - Shows encrypted handles

3. **Weekly Total Tab**: 
   - Calculate encrypted weekly totals
   - Decrypt button (only for project manager) to view decrypted totals

### Workflow

1. **Connect Wallet**: Click Rainbow wallet button in top right
2. **Record Expense**: 
   - Enter date and expense amounts
   - Click "Record Expense"
   - Wait for transaction confirmation
3. **View Expenses**: 
   - Select date and click "Load"
   - View encrypted handles
   - As project manager, click "Decrypt" to view actual values
4. **Calculate Weekly Total**: 
   - Select week start date
   - Click "Calculate"
   - As project manager, decrypt to view totals

## Testing

### Local Network Testing

```bash
# Start local Hardhat node with FHEVM support
npx hardhat node

# In another terminal, run tests
npm run test
```

Tests verify:
- Contract initialization with project manager
- Encrypted expense recording
- Expense accumulation for same date
- Weekly total calculation
- Decryption functionality (as project manager)

### Sepolia Testnet Testing

```bash
# Deploy contract first
npx hardhat deploy --network sepolia

# Then run Sepolia-specific tests
npm run test:sepolia
```

## Technical Details

### FHEVM Integration

- **SDK Loading**: Dynamically loads FHEVM Relayer SDK from CDN
- **Instance Creation**: Creates FHEVM instance based on network (mock for local, relayer for Sepolia)
- **Public Key Storage**: Uses IndexedDB to cache public keys and parameters
- **Decryption Signatures**: Uses EIP712 signatures for decryption requests

### Security Features

1. **Input Proof Verification**: All encrypted inputs include cryptographic proofs verified by the contract
2. **Access Control**: Only project manager can decrypt encrypted values
3. **Privacy Preservation**: Actual expense amounts are never revealed on-chain
4. **EIP712 Signatures**: Decryption requests require cryptographic signatures

### Network Support

- **Localhost (31337)**: For development and testing with mock FHEVM
- **Sepolia Testnet (11155111)**: For public testing with Zama FHE relayer
- **Mainnet**: Ready for production deployment (with proper configuration)

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using [Zama FHEVM](https://docs.zama.ai/fhevm)**
