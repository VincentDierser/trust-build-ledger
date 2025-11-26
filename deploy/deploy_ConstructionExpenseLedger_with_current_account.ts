import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get project manager from environment variable or use deployer (current account)
  // This allows the user to specify a different account as project manager
  // Usage: PROJECT_MANAGER=0x... npx hardhat deploy --network <network> --tags ConstructionExpenseLedgerWithCurrentAccount
  const projectManager = process.env.PROJECT_MANAGER || deployer;

  if (!projectManager || projectManager === "") {
    throw new Error("PROJECT_MANAGER environment variable is required or deployer must be set");
  }

  console.log(`Deploying ConstructionExpenseLedger with Project Manager: ${projectManager}`);
  console.log(`Deployer: ${deployer}`);

  const deployedLedger = await deploy("ConstructionExpenseLedger", {
    from: deployer,
    args: [projectManager],
    log: true,
  });

  console.log(`\n=== Deployment Complete ===`);
  console.log(`ConstructionExpenseLedger contract address: ${deployedLedger.address}`);
  console.log(`Project Manager: ${projectManager}`);
  console.log(`Deployer: ${deployer}`);
  console.log(`\nTo use this contract in the UI, update ui/.env.local:`);
  console.log(`VITE_CONTRACT_ADDRESS=${deployedLedger.address}`);
};

export default func;
func.id = "deploy_ConstructionExpenseLedger_with_current_account"; // id required to prevent reexecution
func.tags = ["ConstructionExpenseLedgerWithCurrentAccount"];

