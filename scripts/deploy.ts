import { ethers } from 'hardhat';

async function main() {
  const socialAppFactory = await ethers.getContractFactory('SocialApp');
  const socialApp = await socialAppFactory.deploy();

  await socialApp.waitForDeployment();

  console.log('SocialApp deployed to:', await socialApp.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
