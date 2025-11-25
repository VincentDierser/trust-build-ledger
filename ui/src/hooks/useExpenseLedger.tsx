import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";

// Contract ABI - Using minimal ABI for efficiency
// Note: externalEuint32 is compiled to bytes32 in the ABI
const ConstructionExpenseLedgerABI = [
  "function recordDailyExpense(uint256 date, bytes32 encryptedMaterialCost, bytes32 encryptedLaborCost, bytes32 encryptedRentalCost, bytes calldata inputProof) external",
  "function getDailyExpense(uint256 date) external view returns (bytes32 materialCost, bytes32 laborCost, bytes32 rentalCost, bool exists)",
  "function calculateWeeklyTotal(uint256 weekStartDate) external returns (bytes32 totalMaterialCost, bytes32 totalLaborCost, bytes32 totalRentalCost)",
  "function hasDateInitialized(uint256 date) external view returns (bool)",
  "function projectManager() external view returns (address)",
  "event ExpenseRecorded(address indexed recorder, uint256 indexed date, uint256 timestamp)",
] as const;

interface UseExpenseLedgerState {
  contractAddress: string | undefined;
  isLoading: boolean;
  message: string | undefined;
  recordExpense: (date: number, materialCost: number, laborCost: number, rentalCost: number) => Promise<void>;
  getDailyExpense: (date: number) => Promise<{ materialCost: string; laborCost: string; rentalCost: string; exists: boolean } | null>;
  calculateWeeklyTotal: (weekStartDate: number) => Promise<{ materialCost: string; laborCost: string; rentalCost: string } | null>;
  decryptExpense: (encryptedValue: string) => Promise<number>;
  isProjectManager: boolean;
}

export function useExpenseLedger(contractAddress: string | undefined): UseExpenseLedgerState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.JsonRpcProvider | undefined>(undefined);
  const [isProjectManager, setIsProjectManager] = useState(false);

  // Get EIP1193 provider
  const eip1193Provider = useCallback(() => {
    if (chainId === 31337) {
      return "http://localhost:8545";
    }
    if (walletClient?.transport) {
      const transport = walletClient.transport as any;
      if (transport.value && typeof transport.value.request === "function") {
        return transport.value;
      }
      if (typeof transport.request === "function") {
        return transport;
      }
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [chainId, walletClient]);

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!contractAddress,
  });

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (!walletClient || !chainId) {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
      return;
    }

    const setupEthers = async () => {
      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        setEthersProvider(provider as any);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Error setting up ethers:", error);
        setEthersSigner(undefined);
        setEthersProvider(undefined);
      }
    };

    setupEthers();
  }, [walletClient, chainId]);

  // Check if user is project manager
  useEffect(() => {
    const checkProjectManager = async () => {
      if (!contractAddress || !ethersProvider || !address) {
        setIsProjectManager(false);
        return;
      }

      try {
        const contract = new ethers.Contract(contractAddress, ConstructionExpenseLedgerABI, ethersProvider);
        const manager = await contract.projectManager();
        setIsProjectManager(manager.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error("Error checking project manager:", error);
        setIsProjectManager(false);
      }
    };

    checkProjectManager();
  }, [contractAddress, ethersProvider, address]);

  const recordExpense = useCallback(
    async (date: number, materialCost: number, laborCost: number, rentalCost: number) => {
      if (!contractAddress) {
        throw new Error("Contract address not configured");
      }

      if (!ethersSigner || !fhevmInstance || !address || !ethersProvider) {
        throw new Error("Wallet not connected or FHEVM not initialized");
      }

      try {
        setIsLoading(true);
        setMessage("Encrypting expenses...");

        // Encrypt all three values
        const encryptedMaterial = await fhevmInstance
          .createEncryptedInput(contractAddress as `0x${string}`, address as `0x${string}`)
          .add32(materialCost)
          .encrypt();

        const encryptedLabor = await fhevmInstance
          .createEncryptedInput(contractAddress as `0x${string}`, address as `0x${string}`)
          .add32(laborCost)
          .encrypt();

        const encryptedRental = await fhevmInstance
          .createEncryptedInput(contractAddress as `0x${string}`, address as `0x${string}`)
          .add32(rentalCost)
          .encrypt();

        setMessage("Submitting to blockchain...");

        const contract = new ethers.Contract(contractAddress, ConstructionExpenseLedgerABI, ethersSigner);

        // Estimate gas first
        let gasEstimate;
        try {
          gasEstimate = await contract.recordDailyExpense.estimateGas(
            date,
            encryptedMaterial.handles[0],
            encryptedLabor.handles[0],
            encryptedRental.handles[0],
            encryptedMaterial.inputProof
          );
          console.log("[useExpenseLedger] Gas estimate:", gasEstimate.toString());
        } catch (estimateError: any) {
          console.error("[useExpenseLedger] Gas estimation failed:", estimateError);
          // Use a higher default if estimation fails
          gasEstimate = BigInt(10000000);
        }

        // Add 20% buffer to gas estimate
        const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

        const tx = await contract.recordDailyExpense(
          date,
          encryptedMaterial.handles[0],
          encryptedLabor.handles[0],
          encryptedRental.handles[0],
          encryptedMaterial.inputProof,
          { gasLimit: gasLimit.toString() }
        );

        setMessage("Waiting for transaction confirmation...");
        await tx.wait();
        setMessage("Expense recorded successfully!");
      } catch (error: any) {
        console.error("[useExpenseLedger] Error recording expense:", error);
        
        // Provide more helpful error messages
        let errorMessage = error.reason || error.message || String(error);
        
        if (error.code === -32603 || error.message?.includes("Internal JSON-RPC error")) {
          errorMessage = "Transaction failed. Possible causes:\n" +
            "1. Hardhat node may need restart\n" +
            "2. Account may not have enough ETH\n" +
            "3. Gas limit may be too low\n\n" +
            "Try: Restart Hardhat node and try again";
        } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
          errorMessage = "Gas estimation failed. The transaction may revert. Check:\n" +
            "1. All encrypted values are valid\n" +
            "2. Contract is properly deployed\n" +
            "3. Account has sufficient balance";
        } else if (error.code === "ACTION_REJECTED") {
          errorMessage = "Transaction was rejected by user";
        }
        
        setMessage(`Error: ${errorMessage}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, ethersSigner, fhevmInstance, address, ethersProvider]
  );

  const getDailyExpense = useCallback(
    async (date: number) => {
      if (!contractAddress || !ethersProvider) {
        return null;
      }

      try {
        const contract = new ethers.Contract(contractAddress, ConstructionExpenseLedgerABI, ethersProvider);
        const [materialCost, laborCost, rentalCost, exists] = await contract.getDailyExpense(date);
        
        return {
          materialCost: ethers.hexlify(materialCost),
          laborCost: ethers.hexlify(laborCost),
          rentalCost: ethers.hexlify(rentalCost),
          exists,
        };
      } catch (error) {
        console.error("Error getting daily expense:", error);
        return null;
      }
    },
    [contractAddress, ethersProvider]
  );

  const calculateWeeklyTotal = useCallback(
    async (weekStartDate: number) => {
      if (!contractAddress || !ethersProvider) {
        return null;
      }

      try {
        const contract = new ethers.Contract(contractAddress, ConstructionExpenseLedgerABI, ethersProvider);
        const [totalMaterial, totalLabor, totalRental] = await contract.calculateWeeklyTotal(weekStartDate);
        
        return {
          materialCost: ethers.hexlify(totalMaterial),
          laborCost: ethers.hexlify(totalLabor),
          rentalCost: ethers.hexlify(totalRental),
        };
      } catch (error) {
        console.error("Error calculating weekly total:", error);
        return null;
      }
    },
    [contractAddress, ethersProvider]
  );

  const decryptExpense = useCallback(
    async (encryptedValue: string) => {
      if (!contractAddress || !ethersProvider || !fhevmInstance || !ethersSigner || !address) {
        throw new Error("Missing requirements for decryption");
      }

      try {
        setMessage("Decrypting expense...");

        const handle = encryptedValue.toLowerCase();
        if (!handle || handle === "0x" || handle.length !== 66) {
          throw new Error("Invalid encrypted value format");
        }

        // Generate keypair for EIP712 signature
        const keypair = (fhevmInstance as any).generateKeypair();

        // Create EIP712 signature
        const contractAddresses = [contractAddress as `0x${string}`];
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";

        const eip712 = (fhevmInstance as any).createEIP712(
          keypair.publicKey,
          contractAddresses,
          startTimestamp,
          durationDays
        );

        // Sign the EIP712 message
        const signature = await ethersSigner.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );

        // For local network, remove "0x" prefix from signature
        const signatureForDecrypt = chainId === 31337 
          ? signature.replace("0x", "") 
          : signature;

        // Decrypt
        const decryptedResult = await (fhevmInstance as any).userDecrypt(
          [{ handle, contractAddress: contractAddress as `0x${string}` }],
          keypair.privateKey,
          keypair.publicKey,
          signatureForDecrypt,
          contractAddresses,
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        const decrypted = Number(decryptedResult[handle] || 0);
        setMessage("Decryption successful");
        return decrypted;
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        setMessage(`Decryption error: ${errorMessage}`);
        throw error;
      }
    },
    [contractAddress, ethersProvider, fhevmInstance, ethersSigner, address, chainId]
  );

  return {
    contractAddress,
    isLoading,
    message,
    recordExpense,
    getDailyExpense,
    calculateWeeklyTotal,
    decryptExpense,
    isProjectManager,
  };
}

