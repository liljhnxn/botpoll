import { ethers, network } from "hardhat";

async function main() {
  console.log(`Starting deployment of BotPoll to network: ${network.name}...`);

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account found. Make sure PRIVATE_KEY is set in your .env file."
    );
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} native tokens`);

  const BotPollFactory = await ethers.getContractFactory("BotPoll");
  const botPoll = await BotPollFactory.deploy();

  await botPoll.waitForDeployment();

  const contractAddress = await botPoll.getAddress();
  const deploymentTx = botPoll.deploymentTransaction();

  console.log("\n================ BotPoll Deployment Successful ================");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Transaction Hash : ${deploymentTx?.hash || "N/A"}`);
  console.log(`Chain ID         : ${network.config.chainId || (await ethers.provider.getNetwork()).chainId}`);
  console.log(`Explorer URL     : https://scan.bohr.life/address/${contractAddress}`);
  console.log("=================================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
