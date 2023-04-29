import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";

dotenv.config();

const {
  NODE_ENV,
  REPORT_GAS,
  ETHERSCAN_API_KEY,
  COIN_MARKETCAP_API_KEY,
  GOERLI_PRIVATE_KEY,
  ALCHEMY_GOERLI_API_KEY,
  // MAINNET_PRIVATE_KEY,
  // ALCHEMY_MAINNET_API_KEY,
} = process.env;

const isTestEnv = NODE_ENV === 'test';
const gasReport = REPORT_GAS === 'true';

const testConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
  },
};

const gasReporterConfig = {
  enabled: REPORT_GAS === 'true',
  coinmarketcap: COIN_MARKETCAP_API_KEY,
  gasPrice: 20,
};

const etherscanConfig = {
  apiKey: ETHERSCAN_API_KEY,
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  etherscan: ETHERSCAN_API_KEY ? etherscanConfig : {},
  defaultNetwork: 'goerli',
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_API_KEY}`,
      // Only add account if the PK is provided
      ...(GOERLI_PRIVATE_KEY ? { accounts: [GOERLI_PRIVATE_KEY] } : {}),
    },
    // mainnet: {
    //   url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_MAINNET_API_KEY}`,
    // Only add account if the PK is provided
    // ...(MAINNET_PRIVATE_KEY ? { accounts: [MAINNET_PRIVATE_KEY] } : {}),
    // },
    hardhat: {
      chainId: 1337 // We set 1337 to make interacting with MetaMask simpler
    }
  },
  gasReporter: gasReport ? gasReporterConfig : {},
};

export default isTestEnv ? {
  ...config,
  ...testConfig
} : config;
