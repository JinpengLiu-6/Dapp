import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

loadEnv();

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || '';
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || '';

export default defineConfig({
  solidity: '0.8.24',
  networks: {
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
});
