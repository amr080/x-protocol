import { ethers, upgrades } from 'hardhat';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();

  console.log("=== USDX and wUSDX Deployment ===");
  const USDXFactory = await ethers.getContractFactory("USDX");
  const usdx = await upgrades.deployProxy(USDXFactory, ['X Protocol USD', 'USDX', deployer.address], { initializer: 'initialize', kind: 'uups' });
  await usdx.deployed();

  const WUSDXFactory = await ethers.getContractFactory("wUSDX");
  const wusdx = await upgrades.deployProxy(WUSDXFactory, [usdx.address, deployer.address], { initializer: 'initialize', kind: 'uups' });
  await wusdx.deployed();

  await usdx.grantRole(await usdx.MINTER_ROLE(), deployer.address);
  await usdx.grantRole(await usdx.ORACLE_ROLE(), deployer.address);

  console.log(`USDX deployed at: ${usdx.address}`);
  console.log(`wUSDX deployed at: ${wusdx.address}\n`);

  while (true) {
    console.log("\n=== Demo Menu ===");
    console.log("1. Mint USDX & Demonstrate Peg");
    console.log("2. Apply Yield Distribution (Rebasing)");
    console.log("3. Wrap USDX to wUSDX");
    console.log("4. Update NAV");
    console.log("5. Simulate Market Volatility");
    console.log("6. Check User Balances");
    console.log("7. Exit");

    const choice = await prompt("Choose an option (1-7): ");
    switch (choice) {
      case '1':
        await mintAndPeg(usdx, user1, user2);
        break;
      case '2':
        await applyYieldDistribution(usdx);
        break;
      case '3':
        await wrapToWUSDX(usdx, wusdx, user1);
        break;
      case '4':
        await updateNAV(usdx);
        break;
      case '5':
        await simulateVolatility(usdx);
        break;
      case '6':
        await checkUserBalances(usdx, wusdx, user1, user2);
        break;
      case '7':
        rl.close();
        return;
      default:
        console.log("Invalid option. Please select again.");
    }
  }
}

async function mintAndPeg(usdx: any, user1: any, user2: any) {
  await usdx.mint(user1.address, ethers.utils.parseEther("1000"));
  await usdx.mint(user2.address, ethers.utils.parseEther("500"));
  console.log("Peg maintained: 1 USD per USDX. Minted 1,000 to User1 and 500 to User2.");
  await sleep(2000);
}

async function applyYieldDistribution(usdx: any) {
  await usdx.setRewardMultiplier(ethers.utils.parseEther("1.05"));
  console.log("Yield applied. USDX balances increased by 5%.");
  await sleep(2000);
}

async function wrapToWUSDX(usdx: any, wusdx: any, user: any) {
  await usdx.connect(user).approve(wusdx.address, ethers.utils.parseEther("500"));
  await wusdx.connect(user).deposit(ethers.utils.parseEther("500"), user.address);
  console.log("Wrapped 500 USDX to wUSDX for User.");
  await sleep(2000);
}

async function updateNAV(usdx: any) {
  const currentNAV = await usdx.rewardMultiplier();
  const newNAV = currentNAV.mul(10001).div(10000);
  await usdx.setRewardMultiplier(newNAV);
  console.log(`Updated NAV applied: ${ethers.utils.formatEther(newNAV)}`);
  await sleep(2000);
}

async function simulateVolatility(usdx: any) {
  console.log("Simulating Market Volatility...");
  for (let i = 0; i < 3; i++) {
    const change = 1 + ((Math.random() - 0.5) / 50);
    const currentNAV = await usdx.rewardMultiplier();
    const newNAV = currentNAV.mul(Math.floor(change * 100)).div(100);
    await usdx.setRewardMultiplier(newNAV);
    console.log(`Adjusted NAV: ${ethers.utils.formatEther(newNAV)}`);
    await sleep(1000);
  }
}

async function checkUserBalances(usdx: any, wusdx: any, user1: any, user2: any) {
  console.log("\n=== Checking User Balances ===");
  const user1USDXBalance = await usdx.balanceOf(user1.address);
  const user1wUSDXBalance = await wusdx.balanceOf(user1.address);
  const user2USDXBalance = await usdx.balanceOf(user2.address);
  const user2wUSDXBalance = await wusdx.balanceOf(user2.address);

  console.log(`User1: ${ethers.utils.formatEther(user1USDXBalance)} USDX, ${ethers.utils.formatEther(user1wUSDXBalance)} wUSDX`);
  console.log(`User2: ${ethers.utils.formatEther(user2USDXBalance)} USDX, ${ethers.utils.formatEther(user2wUSDXBalance)} wUSDX`);
  await sleep(2000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
