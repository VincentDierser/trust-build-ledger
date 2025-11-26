import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy:ledger", "Deploy ConstructionExpenseLedger with specified project manager")
  .addOptionalParam("manager", "Project manager address (defaults to deployer)", undefined, undefined)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // Use provided manager address, or environment variable, or deployer
    const projectManager = taskArgs.manager || process.env.PROJECT_MANAGER || deployer;

    if (!projectManager || projectManager === "") {
      throw new Error("Project manager address is required. Use --manager <address> or set PROJECT_MANAGER environment variable");
    }

    // Validate address format
    if (!hre.ethers.isAddress(projectManager)) {
      throw new Error(`Invalid address format: ${projectManager}`);
    }

    console.log(`\n=== Deploying ConstructionExpenseLedger ===`);
    console.log(`Deployer: ${deployer}`);
    console.log(`Project Manager: ${projectManager}`);

    const deployedLedger = await deploy("ConstructionExpenseLedger", {
      from: deployer,
      args: [projectManager],
      log: true,
    });

    console.log(`\n=== Deployment Complete ===`);
    console.log(`Contract Address: ${deployedLedger.address}`);
    console.log(`Project Manager: ${projectManager}`);
    console.log(`Deployer: ${deployer}`);
    console.log(`\n📝 Next Steps:`);
    console.log(`1. Update ui/.env.local with:`);
    console.log(`   VITE_CONTRACT_ADDRESS=${deployedLedger.address}`);
    console.log(`2. Make sure your wallet is connected to the same account as the project manager`);
    console.log(`   Project Manager Address: ${projectManager}`);
  });

