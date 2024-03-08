import { ethers } from "hardhat";

async function main() {
  const joKenPoContract = await ethers.deployContract("JoKenPo");

  await joKenPoContract.waitForDeployment();

  console.log("JoKenPo deployed to:", await joKenPoContract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
