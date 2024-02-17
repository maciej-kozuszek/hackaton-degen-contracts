import dotenv from 'dotenv'

import '@openzeppelin/hardhat-upgrades'
import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'hardhat-abi-exporter'
import 'hardhat-deploy'
import { CHAIN_IDS, CHAIN_NAMES, KNOWN_NETWORK } from './config/constants'

dotenv.config()
const config: HardhatUserConfig = {
    solidity: '0.8.18',
    typechain: {
        outDir: './src/typechain',
        target: 'ethers-v5',
    },
    defaultNetwork: KNOWN_NETWORK.POLYGON_MUMBAI,
    networks: {
        [KNOWN_NETWORK.POLYGON_MUMBAI]: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.POLYGON_MUMBAI_ALCHEMY_API_KEY}`,
            accounts: [`${process.env.DEPLOYER_PRIVATE_KEY}`],
            chainId: CHAIN_IDS[CHAIN_NAMES.POLYGON_MUMBAI],
            throwOnCallFailures: true,
            saveDeployments: true,
        },
    },
    paths: {
        cache: 'cache',
        sources: 'contracts',
        artifacts: 'artifacts',
        tests: 'test',
        deploy: 'deploy',
        deployments: 'deployments',
    },
    etherscan: {
        apiKey: {
            polygonMumbai: process.env.POLYGONSCAN_API_KEY ?? '',
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    abiExporter: {
        path: './src/abi',
        runOnCompile: true,
        clear: true,
        flat: true,
        spacing: 2,
        format: 'json',
    },
}

export default config
