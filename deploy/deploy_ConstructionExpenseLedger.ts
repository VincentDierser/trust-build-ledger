import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deployer becomes the project manager by default
  const projectManager = deployer;

  const deployedLedger = await deploy("ConstructionExpenseLedger", {
    from: deployer,
    args: [projectManager],
    log: true,
  });

  console.log(`ConstructionExpenseLedger contract: `, deployedLedger.address);
  console.log(`Project Manager: `, projectManager);
};
export default func;
func.id = "deploy_ConstructionExpenseLedger"; // id required to prevent reexecution
func.tags = ["ConstructionExpenseLedger"];

