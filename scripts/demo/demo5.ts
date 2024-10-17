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

async function getCurrentPriceAndSupply(usdx: any) {
  const currentNAV = await usdx.rewardMultiplier();
  const totalSupply = await usdx.totalSupply();
  return {
    price: ethers.utils.formatEther(currentNAV),
    supply: ethers.utils.formatEther(totalSupply)
  };
}

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();

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

  await usdx.grantRole(await usdx.MINTER_ROLE(), deployer.address);
  await usdx.grantRole(await usdx.ORACLE_ROLE(), deployer.address);

  while (true) {
    const { price, supply } = await getCurrentPriceAndSupply(usdx);
    console.log("\n=== USDX Status ===");
    console.log(`wUSDX Price: $${price}`);
    console.log(`USDX Supply: ${supply}`);

    console.log("\n=== Demo Menu ===");
    console.log("1. Simulate FOBXX Investment");
    console.log("2. Apply Yield Increase");
    console.log("3. Check User Balances");
    console.log("4. Update NAV");
    console.log("5. Simulate Market Volatility");
    console.log("6. Exit");

    const choice = await prompt("Enter your choice (1-6): ");

    switch (choice) {
      case '1':
        await simulateFOBXXInvestment(usdx, user1, user2);
        break;
      case '2':
        await applyYieldIncrease(usdx);
        break;
      case '3':
        await checkUserBalances(usdx, wusdx, user1, user2);
        break;
      case '4':
        await updateNAV(usdx);
        break;
      case '5':
        await simulateMarketVolatility(usdx);
        break;
      case '6':
        rl.close();
        return;
      default:
        console.log("Invalid choice. Please try again.");
    }
  }
}

async function simulateFOBXXInvestment(usdx: any, user1: any, user2: any) {
  console.log("\n=== Simulating FOBXX Investment ===");
  await usdx.mint(user1.address, ethers.utils.parseEther("1000000"));
  await usdx.mint(user2.address, ethers.utils.parseEther("500000"));
  console.log("Minted 1,000,000 USDX for User1 and 500,000 USDX for User2");
  await sleep(2000);
}

async function applyYieldIncrease(usdx: any) {
  console.log("\n=== Applying Yield Increase ===");
  await usdx.setRewardMultiplier(ethers.utils.parseEther("1.1"));
  console.log("FOBXX investment yield applied with 10% increase.");
  await sleep(2000);
}

async function checkUserBalances(usdx: any, wusdx: any, user1: any, user2: any) {
  console.log("\n=== Checking User Balances ===");
  const user1Balance = await usdx.balanceOf(user1.address);
  const user2Balance = await usdx.balanceOf(user2.address);
  console.log(`User1 USDX Balance: ${ethers.utils.formatEther(user1Balance)} USDX`);
  console.log(`User2 USDX Balance: ${ethers.utils.formatEther(user2Balance)} USDX`);
  await sleep(2000);
}

async function updateNAV(usdx: any) {
  console.log("\n=== Updating NAV ===");
  const currentNAV = await usdx.rewardMultiplier();
  const updatedNAV = currentNAV.mul(10002).div(10000);
  await usdx.setRewardMultiplier(updatedNAV);
  console.log(`Updated NAV applied: ${ethers.utils.formatEther(updatedNAV)}`);
  await sleep(2000);
}

async function simulateMarketVolatility(usdx: any) {
  console.log("\n=== Simulating Market Volatility ===");
  const initialNAV = await usdx.rewardMultiplier();
  console.log(`Initial NAV: ${ethers.utils.formatEther(initialNAV)}`);

  for (let i = 0; i < 5; i++) {
    try {
      const change = (Math.random() * 0.002 - 0.001);
      const currentNAV = await usdx.rewardMultiplier();
      let updatedNAV = currentNAV.mul(Math.floor(10000 + change * 10000)).div(10000);
      
      if (updatedNAV.lt(ethers.utils.parseEther("1"))) {
        updatedNAV = ethers.utils.parseEther("1");
      }

      const maxNAV = ethers.utils.parseEther("2");
      if (updatedNAV.gt(maxNAV)) {
        updatedNAV = maxNAV;
      }

      await usdx.setRewardMultiplier(updatedNAV);
      console.log(`NAV updated to: ${ethers.utils.formatEther(updatedNAV)}`);
    } catch (error) {
      console.log(`Error updating NAV: ${error.message}`);
    }
    await sleep(1000);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});