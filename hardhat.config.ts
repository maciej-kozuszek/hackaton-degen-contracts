import '@openzeppelin/hardhat-upgrades'
import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'hardhat-deploy'

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
}

export default config
