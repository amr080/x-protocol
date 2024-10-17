import { ethers, upgrades } from 'hardhat';

async function main() {
  const [deployer, user1] = await ethers.getSigners();

  console.log('Deployer:', deployer.address);
  console.log('User1:', user1.address);

  // Deploy USDX contract with UUPS upgradeability
  const USDXFactory = await ethers.getContractFactory("USDX");
  const usdx = await upgrades.deployProxy(USDXFactory, ['X Protocol USD', 'USDX', deployer.address], {
    initializer: 'initialize',
    kind: 'uups',
  });
  await usdx.deployed();
  console.log("USDX deployed at:", usdx.address);

  // Deploy wUSDX contract with UUPS upgradeability
  const WUSDXFactory = await ethers.getContractFactory("wUSDX");
  const wusdx = await upgrades.deployProxy(WUSDXFactory, [usdx.address, deployer.address], {
    initializer: 'initialize',
    kind: 'uups',
  });
  await wusdx.deployed();
  console.log("wUSDX deployed at:", wusdx.address);

  // Grant MINTER and ORACLE roles to the deployer for testing purposes
  const MINTER_ROLE = await usdx.MINTER_ROLE();
  const ORACLE_ROLE = await usdx.ORACLE_ROLE();
  await usdx.grantRole(MINTER_ROLE, deployer.address);
  await usdx.grantRole(ORACLE_ROLE, deployer.address);
  console.log("Granted MINTER and ORACLE roles to deployer.");

  // Mint USDX tokens to User1
  await usdx.mint(user1.address, ethers.utils.parseEther("1000"));
  console.log("Minted 1000 USDX to User1");

  // Perform a rebase on the USDX contract
  await usdx.setRewardMultiplier(ethers.utils.parseEther("1.1"));
  console.log("Performed rebase with a 10% increase");

  // Wrap USDX tokens to wUSDX for User1
  await usdx.connect(user1).approve(wusdx.address, ethers.utils.parseEther("500"));
  await wusdx.connect(user1).deposit(ethers.utils.parseEther("500"), user1.address);
  console.log("User1 wrapped 500 USDX to wUSDX");

  // Display balances for User1
  const usdxBalance = await usdx.balanceOf(user1.address);
  const wusdxBalance = await wusdx.balanceOf(user1.address);
  console.log("User1 USDX balance:", ethers.utils.formatEther(usdxBalance));
  console.log("User1 wUSDX balance:", ethers.utils.formatEther(wusdxBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
