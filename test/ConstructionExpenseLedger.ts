import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ConstructionExpenseLedger, ConstructionExpenseLedger__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ConstructionExpenseLedger")) as ConstructionExpenseLedger__factory;
  const [deployer] = await ethers.getSigners();
  const ledgerContract = (await factory.deploy(deployer.address)) as ConstructionExpenseLedger;
  const ledgerContractAddress = await ledgerContract.getAddress();

  return { ledgerContract, ledgerContractAddress, deployer };
}

describe("ConstructionExpenseLedger", function () {
  let signers: Signers;
  let ledgerContract: ConstructionExpenseLedger;
  let ledgerContractAddress: string;
  let deployer: HardhatEthersSigner;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ ledgerContract, ledgerContractAddress, deployer } = await deployFixture());
  });

  it("should initialize with project manager", async function () {
    const projectManager = await ledgerContract.projectManager();
    expect(projectManager).to.eq(deployer.address);
  });

  it("should record daily expense with encrypted values", async function () {
    const date = Math.floor(Date.now() / 86400000); // Days since epoch
    const materialCost = 1000;
    const laborCost = 2000;
    const rentalCost = 500;

    // Encrypt values
    const encryptedMaterial = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(materialCost)
      .encrypt();

    const encryptedLabor = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(laborCost)
      .encrypt();

    const encryptedRental = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(rentalCost)
      .encrypt();

    // Record expense
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

    // Check if date is initialized
    const hasInit = await ledgerContract.hasDateInitialized(date);
    expect(hasInit).to.be.true;
  });

  it("should accumulate expenses for the same date", async function () {
    const date = Math.floor(Date.now() / 86400000);
    const materialCost1 = 1000;
    const laborCost1 = 2000;
    const rentalCost1 = 500;

    const materialCost2 = 500;
    const laborCost2 = 1000;
    const rentalCost2 = 250;

    // First expense
    const encryptedMaterial1 = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(materialCost1)
      .encrypt();

    const encryptedLabor1 = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(laborCost1)
      .encrypt();

    const encryptedRental1 = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(rentalCost1)
      .encrypt();

    let tx = await ledgerContract
      .connect(signers.alice)
      .recordDailyExpense(
        date,
        encryptedMaterial1.handles[0],
        encryptedLabor1.handles[0],
        encryptedRental1.handles[0],
        encryptedMaterial1.inputProof
      );
    await tx.wait();

    // Second expense for same date
    const encryptedMaterial2 = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(materialCost2)
      .encrypt();

    const encryptedLabor2 = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(laborCost2)
      .encrypt();

    const encryptedRental2 = await fhevm
      .createEncryptedInput(ledgerContractAddress, signers.alice.address)
      .add32(rentalCost2)
      .encrypt();

    tx = await ledgerContract
      .connect(signers.alice)
      .recordDailyExpense(
        date,
        encryptedMaterial2.handles[0],
        encryptedLabor2.handles[0],
        encryptedRental2.handles[0],
        encryptedMaterial2.inputProof
      );
    await tx.wait();

    // Get encrypted totals and decrypt as project manager
    const [encryptedMaterial, encryptedLabor, encryptedRental, exists] = 
      await ledgerContract.getDailyExpense(date);
    
    expect(exists).to.be.true;

    // Decrypt as project manager
    const decryptedMaterial = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedMaterial,
      ledgerContractAddress,
      deployer
    );

    const decryptedLabor = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedLabor,
      ledgerContractAddress,
      deployer
    );

    const decryptedRental = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedRental,
      ledgerContractAddress,
      deployer
    );

    expect(decryptedMaterial).to.eq(materialCost1 + materialCost2);
    expect(decryptedLabor).to.eq(laborCost1 + laborCost2);
    expect(decryptedRental).to.eq(rentalCost1 + rentalCost2);
  });

  it("should calculate weekly total expenses", async function () {
    const weekStartDate = Math.floor(Date.now() / 86400000);
    
    // Record expenses for 3 days in the week
    for (let i = 0; i < 3; i++) {
      const date = weekStartDate + i;
      const materialCost = 1000 * (i + 1);
      const laborCost = 2000 * (i + 1);
      const rentalCost = 500 * (i + 1);

      const encryptedMaterial = await fhevm
        .createEncryptedInput(ledgerContractAddress, signers.alice.address)
        .add32(materialCost)
        .encrypt();

      const encryptedLabor = await fhevm
        .createEncryptedInput(ledgerContractAddress, signers.alice.address)
        .add32(laborCost)
        .encrypt();

      const encryptedRental = await fhevm
        .createEncryptedInput(ledgerContractAddress, signers.alice.address)
        .add32(rentalCost)
        .encrypt();

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
    }

    // Calculate weekly total
    const [weekMaterial, weekLabor, weekRental] = 
      await ledgerContract.calculateWeeklyTotal(weekStartDate);

    // Decrypt weekly totals as project manager
    const decryptedWeekMaterial = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      weekMaterial,
      ledgerContractAddress,
      deployer
    );

    const decryptedWeekLabor = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      weekLabor,
      ledgerContractAddress,
      deployer
    );

    const decryptedWeekRental = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      weekRental,
      ledgerContractAddress,
      deployer
    );

    // Expected totals: 1000+2000+3000 = 6000 for material, etc.
    expect(decryptedWeekMaterial).to.eq(6000); // 1000 + 2000 + 3000
    expect(decryptedWeekLabor).to.eq(12000);    // 2000 + 4000 + 6000
    expect(decryptedWeekRental).to.eq(3000);    // 500 + 1000 + 1500
  });
});

