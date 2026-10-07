import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_BOT_POLL_ADDRESS;
  console.log(`Checking contract at address: ${contractAddress}`);

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_BOT_POLL_ADDRESS is not set.");
  }

  const provider = ethers.provider;
  const code = await provider.getCode(contractAddress);

  if (!code || code === "0x") {
    console.error("FAIL: No bytecode found at address. Contract is not deployed on this network.");
    process.exit(1);
  }

  console.log(`SUCCESS: Bytecode exists on-chain (${(code.length - 2) / 2} bytes).`);

  const BotPoll = await ethers.getContractAt("BotPoll", contractAddress);
  const pollCount = await BotPoll.getPollCount();
  console.log(`Current on-chain pollCount: ${pollCount.toString()}`);

  const network = await provider.getNetwork();
  console.log(`Verified on network Chain ID: ${network.chainId.toString()}`);
  console.log("Contract is verified alive and responsive on Botchain Testnet!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
