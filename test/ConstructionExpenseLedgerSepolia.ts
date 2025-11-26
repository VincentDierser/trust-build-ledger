import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { ConstructionExpenseLedger } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
  deployer: HardhatEthersSigner;
};

describe("ConstructionExpenseLedgerSepolia", function () {
  let signers: Signers;
  let ledgerContract: ConstructionExpenseLedger;
  let ledgerContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const ConstructionExpenseLedgerDeployment = await deployments.get("ConstructionExpenseLedger");
      ledgerContractAddress = ConstructionExpenseLedgerDeployment.address;
      ledgerContract = await ethers.getContractAt("ConstructionExpenseLedger", ConstructionExpenseLedgerDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0], deployer: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should record and decrypt daily expense on Sepolia", async function () {
    steps = 15;

    this.timeout(4 * 40000);

    const date = Math.floor(Date.now() / 86400000);
    const materialCost = 1000;
    const laborCost = 2000;
    const rentalCost = 500;

    progress("Encrypting material cost...");
    const encryptedMaterial = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(materialCost)
      .encrypt();

    progress("Encrypting labor cost...");
    const encryptedLabor = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(laborCost)
      .encrypt();

    progress("Encrypting rental cost...");
    const encryptedRental = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(rentalCost)
      .encrypt();

    progress(`Recording daily expense for date ${date}...`);
    const tx = await ledgerContract
      .connect(signers.alice)
      .recordDailyExpense(
        date,
        encryptedMaterial.handles[0],
        encryptedLabor.handles[0],
        encryptedRental.handles[0],
        encryptedMaterial.inputProof
      );
    await tx.wait();

    progress("Fetching encrypted daily expense...");
    const [encMaterial, encLabor, encRental, exists] = 
      await ledgerContract.getDailyExpense(date);
    
    expect(exists).to.be.true;

    progress("Decrypting material cost...");
    const decryptedMaterial = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encMaterial,
      ledgerContractAddress,
      signers.deployer
    );
    progress(`Decrypted material cost: ${decryptedMaterial}`);

    progress("Decrypting labor cost...");
    const decryptedLabor = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encLabor,
      ledgerContractAddress,
      signers.deployer
    );
    progress(`Decrypted labor cost: ${decryptedLabor}`);

    progress("Decrypting rental cost...");
    const decryptedRental = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encRental,
      ledgerContractAddress,
      signers.deployer
    );
    progress(`Decrypted rental cost: ${decryptedRental}`);

    expect(decryptedMaterial).to.eq(materialCost);
    expect(decryptedLabor).to.eq(laborCost);
    expect(decryptedRental).to.eq(rentalCost);
  });
});

