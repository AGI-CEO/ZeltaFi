// @ts-nocheck
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    arcTestnet: {
      url: process.env.ARC_RPC_URL || '',
      chainId: parseInt(process.env.ARC_CHAIN_ID || '0'),
      accounts: process.env.AGENT_PRIVATE_KEY ? [process.env.AGENT_PRIVATE_KEY] : [],
    },
  },
};

export default config;
