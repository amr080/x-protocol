import { ethers, upgrades } from 'hardhat';

async function main() {
  const [deployer, user1] = await ethers.getSigners();

  console.log("=== USDX and wUSDX Deployment ===");
  const USDXFactory = await ethers.getContractFactory("USDX");
  const usdx = await upgrades.deployProxy(USDXFactory, ['X Protocol USD', 'USDX', deployer.address], {
    initializer: 'initialize',
    kind: 'uups',
  });
  await usdx.deployed();

  const WUSDXFactory = await ethers.getContractFactory("wUSDX");
  const wusdx = await upgrades.deployProxy(WUSDXFactory, [usdx.address, deployer.address], {
    initializer: 'initialize',
    kind: 'uups',
  });
  await wusdx.deployed();

  console.log(`USDX deployed at: ${usdx.address}`);
  console.log(`wUSDX deployed at: ${wusdx.address}\n`);

  console.log("=== Grant Roles for Minting and Oracle ===");
  await usdx.grantRole(await usdx.MINTER_ROLE(), deployer.address);
  await usdx.grantRole(await usdx.ORACLE_ROLE(), deployer.address);
  console.log("Roles granted to deployer.\n");

  console.log("=== Simulating FOBXX Investment and Rebase ===");
  await usdx.mint(user1.address, ethers.utils.parseEther("1000000"));
  console.log("Minted 1,000,000 USDX for User1");

  await usdx.setRewardMultiplier(ethers.utils.parseEther("1.1"));
  console.log("FOBXX investment yield applied with 10% increase.\n");

  console.log("=== User1 Balance Check ===");
  const usdxBalance = await usdx.balanceOf(user1.address);
  console.log(`User1 USDX Balance: ${ethers.utils.formatEther(usdxBalance)} USDX`);

  await usdx.connect(user1).approve(wusdx.address, ethers.utils.parseEther("500000"));
  await wusdx.connect(user1).deposit(ethers.utils.parseEther("500000"), user1.address);

  const wusdxBalance = await wusdx.balanceOf(user1.address);
  console.log(`User1 wUSDX Balance: ${ethers.utils.formatEther(wusdxBalance)} wUSDX\n`);

  console.log("=== Simulating NAV Update ===");
  const currentNAV = await usdx.rewardMultiplier();
  const updatedNAV = currentNAV.mul(10002).div(10000); // Simulate a 0.02% NAV increase

  await usdx.setRewardMultiplier(updatedNAV);
  console.log(`Updated NAV applied: ${ethers.utils.formatEther(updatedNAV)}\n`);

  console.log("=== User1 Balance After NAV Update ===");
  const newBalance = await usdx.balanceOf(user1.address);
  console.log(`User1 USDX Balance after NAV update: ${ethers.utils.formatEther(newBalance)} USDX\n`);

  console.log("=== Risk Management and Transparency ===");
  console.log("Risk Management:");
  console.log(" - Paused: No");
  console.log(" - Blocklist: [None]\n");

  console.log("Transparency Events:");
  console.log(" - Mint, Rebase, Wrap, NAV Update");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});