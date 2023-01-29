import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const { ETHERSCAN_API_KEY, ALCHEMY_GOERLI_API_KEY, GOERLI_PRIVATE_KEY } = process.env;
// const { ETHERSCAN_API_KEY, ALCHEMY_GOERLI_API_KEY, GOERLI_PRIVATE_KEY, ALCHEMY_MAINNET_API_KEY, MAINNET_PRIVATE_KEY } = process.env;

if (!ETHERSCAN_API_KEY || !ALCHEMY_GOERLI_API_KEY || !GOERLI_PRIVATE_KEY) {
  console.error('Env variables are not configured');
  process.exit(1);
}

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
    },
    // mainnet: {
    //   url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_MAINNET_API_KEY}`,
    //   accounts: [MAINNET_PRIVATE_KEY],
    // },
  },
};

export default config;
