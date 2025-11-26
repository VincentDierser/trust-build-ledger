# Trust Build Ledger - Encrypted Construction Expense Ledger

A privacy-preserving construction expense ledger built with FHEVM (Fully Homomorphic Encryption Virtual Machine) that allows recording encrypted daily expenses (material, labor, rental costs) on-chain. Expenses remain private, and only the project manager can decrypt and view the details.

## 🚀 Live Demo

**Try the application live:** [https://trust-build-ledger.vercel.app/](https://trust-build-ledger.vercel.app/)

## 📹 Demo Video

**Watch the demo video:** [https://github.com/VincentDierser/trust-build-ledger/blob/main/trust-build-ledger.mp4](https://github.com/VincentDierser/trust-build-ledger/blob/main/trust-build-ledger.mp4)

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

6. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

7. **Connect wallet and test**

   - Open the app in your browser
   - Connect wallet to localhost network (Chain ID: 31337)
   - Record daily expenses (material, labor, rental costs)
   - View encrypted expenses
   - As project manager, decrypt expenses to verify encryption/decryption

8. **Run tests**

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
│   ├── deploy_ConstructionExpenseLedger.ts
│   └── deploy_ConstructionExpenseLedger_with_current_account.ts
├── tasks/                               # Hardhat custom tasks
│   └── deployLedger.ts                 # Deployment task with project manager option
├── test/                                # Test files
│   ├── ConstructionExpenseLedger.ts    # Local network tests
│   └── ConstructionExpenseLedgerSepolia.ts # Sepolia testnet tests
├── ui/                                  # Frontend React application
│   ├── src/
│   │   ├── components/                 # React components
│   │   ├── hooks/                       # Custom React hooks
│   │   │   └── useExpenseLedger.tsx    # Main contract interaction hook
│   │   ├── fhevm/                       # FHEVM utilities
│   │   │   └── useFhevm.tsx             # FHEVM instance management
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

#### Contract Structure

```solidity
contract ConstructionExpenseLedger is SepoliaConfig {
    address public projectManager;  // Only this address can decrypt expenses
    
    struct DailyExpense {
        euint32 materialCost;    // Encrypted material cost
        euint32 laborCost;       // Encrypted labor cost
        euint32 rentalCost;      // Encrypted rental cost
        uint256 timestamp;       // Date of the expense
        bool exists;             // Whether this record exists
    }
    
    mapping(uint256 => DailyExpense) private _dailyExpenses;
    mapping(uint256 => DailyExpense) private _weeklyTotals;
}
```

#### Key Functions

- **`recordDailyExpense(uint256 date, externalEuint32 encryptedMaterialCost, externalEuint32 encryptedLaborCost, externalEuint32 encryptedRentalCost, bytes calldata inputProof)`**: 
  - Records encrypted daily expenses (material, labor, rental costs)
  - Converts external encrypted values to internal format using `FHE.fromExternal()`
  - Accumulates expenses if the same date is recorded multiple times using `FHE.add()`
  - Grants decryption permissions to project manager using `FHE.allow()` and `FHE.allowThis()`

- **`getDailyExpense(uint256 date)`**: 
  - Returns encrypted expenses for a specific date
  - Returns three encrypted values: material, labor, rental costs as `euint32` types

- **`calculateWeeklyTotal(uint256 weekStartDate)`**: 
  - Calculates encrypted weekly totals for 7 days starting from weekStartDate
  - Performs FHE addition on encrypted values using `FHE.add()` in a loop
  - Stores encrypted totals and grants decryption permissions to project manager

- **`getWeeklyTotal(uint256 weekStartDate)`**:
  - Returns encrypted weekly totals for a specific week
  - Returns three encrypted values: material, labor, rental costs

- **`projectManager()`**: 
  - Returns the address of the project manager who can decrypt expenses

## Encryption and Decryption Logic

### Encryption Flow (Frontend)

The encryption process happens in the frontend before submitting data to the contract:

1. **Initialize FHEVM Instance**
   ```typescript
   const fhevmInstance = await createFhevmInstance(provider, chainId);
   ```

2. **Create Encrypted Input**
   ```typescript
   const encryptedInput = fhevmInstance.createEncryptedInput(
     contractAddress,
     userAddress
   );
   ```

3. **Add Values to Encrypt**
   ```typescript
   encryptedInput.add32(materialCost);  // Add material cost
   encryptedInput.add32(laborCost);     // Add labor cost
   encryptedInput.add32(rentalCost);    // Add rental cost
   ```

4. **Encrypt and Get Handles**
   ```typescript
   const encrypted = await encryptedInput.encrypt();
   // Returns: { handles: [materialHandle, laborHandle, rentalHandle], inputProof }
   ```

5. **Submit to Contract**
   ```typescript
   contract.recordDailyExpense(
     date,
     encrypted.handles[0],  // encryptedMaterialCost
     encrypted.handles[1],  // encryptedLaborCost
     encrypted.handles[2],  // encryptedRentalCost
     encrypted.inputProof   // Cryptographic proof
   );
   ```

### Contract Processing

1. **Verify Input Proof**
   - The contract verifies the `inputProof` to ensure the encrypted values are valid
   - Uses `FHE.fromExternal()` to convert external encrypted values to internal `euint32` format

2. **Store or Accumulate**
   - If date is new: Store the encrypted values directly
   - If date exists: Use `FHE.add()` to add new expenses to existing encrypted values
   ```solidity
   _dailyExpenses[date].materialCost = FHE.add(
       _dailyExpenses[date].materialCost,
       materialCost
   );
   ```

3. **Grant Decryption Permissions**
   ```solidity
   FHE.allowThis(_dailyExpenses[date].materialCost);
   FHE.allow(_dailyExpenses[date].materialCost, projectManager);
   ```

### Decryption Flow (Frontend)

Only the project manager can decrypt expenses:

1. **Generate Keypair**
   ```typescript
   const keypair = fhevmInstance.generateKeypair();
   ```

2. **Create EIP712 Signature**
   ```typescript
   const eip712 = fhevmInstance.createEIP712(
     keypair.publicKey,
     [contractAddress],
     startTimestamp,
     durationDays
   );
   
   const signature = await signer.signTypedData(
     eip712.domain,
     { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
     eip712.message
   );
   ```

3. **Request Decryption**
   ```typescript
   const decryptedResult = await fhevmInstance.userDecrypt(
     [{ handle: encryptedHandle, contractAddress }],
     keypair.privateKey,
     keypair.publicKey,
     signature,
     [contractAddress],
     userAddress,
     startTimestamp,
     durationDays
   );
   
   const decryptedValue = Number(decryptedResult[encryptedHandle]);
   ```

### Security Features

1. **Input Proof Verification**: All encrypted inputs include cryptographic proofs verified by the contract using `FHE.fromExternal()`
2. **Access Control**: Only project manager can decrypt encrypted values (enforced by FHEVM permissions)
3. **Privacy Preservation**: Actual expense amounts are never revealed on-chain - only encrypted handles are stored
4. **EIP712 Signatures**: Decryption requests require cryptographic signatures to prevent unauthorized access
5. **Homomorphic Operations**: Calculations (addition) are performed on encrypted data without decryption

## Frontend Usage

### Components

1. **Record Expense Tab**: 
   - Input date and three expense types (material, labor, rental)
   - Encrypts values using FHEVM before submission
   - Shows transaction status

2. **View Expenses Tab**: 
   - Displays encrypted expenses for a specific date
   - Shows encrypted handles (hex strings)
   - Decrypt button (only for project manager) to view decrypted values

3. **Weekly Total Tab**: 
   - Calculate encrypted weekly totals (performed on-chain)
   - Decrypt button (only for project manager) to view decrypted totals

### Workflow

1. **Connect Wallet**: Click Rainbow wallet button in top right
2. **Record Expense**: 
   - Enter date and expense amounts
   - Click "Record Expense"
   - Frontend encrypts values using FHEVM
   - Wait for transaction confirmation
3. **View Expenses**: 
   - Select date and click "Load"
   - View encrypted handles (hex strings)
   - As project manager, click "Decrypt" to view actual values
4. **Calculate Weekly Total**: 
   - Select week start date
   - Click "Calculate" (performs on-chain FHE addition)
   - As project manager, decrypt to view totals

## Deployment

### Quick Deployment Scripts

The project includes PowerShell scripts for easy deployment on Windows:

- **`quick-deploy.ps1`**: Quick deployment with project manager address
  ```powershell
  .\quick-deploy.ps1 0xYourAddress
  ```

- **`deploy-with-current-account.ps1`**: Interactive deployment script
  ```powershell
  .\deploy-with-current-account.ps1
  ```

- **`check-and-redeploy.ps1`**: Check and redeploy with your address
  ```powershell
  .\check-and-redeploy.ps1 0xYourAddress
  ```

### Using Hardhat Task

```bash
# Deploy with specified project manager
npx hardhat deploy:ledger --network localhost --manager 0xYourAddress

# Or use environment variable
export PROJECT_MANAGER=0xYourAddress
npx hardhat deploy:ledger --network localhost
```

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

### Network Support

- **Localhost (31337)**: For development and testing with mock FHEVM
- **Sepolia Testnet (11155111)**: For public testing with Zama FHE relayer
- **Mainnet**: Ready for production deployment (with proper configuration)

### Data Types

- **`euint32`**: Encrypted 32-bit unsigned integer (used for expense amounts)
- **`externalEuint32`**: External encrypted value format (used in function parameters)
- **Handles**: 32-byte hex strings representing encrypted values on-chain

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using [Zama FHEVM](https://docs.zama.ai/fhevm)**
