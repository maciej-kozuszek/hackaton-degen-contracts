import '@openzeppelin/hardhat-upgrades'

import dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'
import PolygonTestnetNetwork from './config/polygon-testnet.json'

import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'hardhat-deploy'

dotenv.config()

const config: HardhatUserConfig = {
    solidity: '0.8.18',
    typechain: {
        outDir: './typechain',
        target: 'ethers-v5',
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    networks: {
        [PolygonTestnetNetwork.network]: {
            chainId: Number(PolygonTestnetNetwork.chainId),
            url: PolygonTestnetNetwork.rpcUrl,
            throwOnCallFailures: true,
            accounts: [process.env.DEPLOYER as string],
            saveDeployments: true,
        },
    },
}

export default config
