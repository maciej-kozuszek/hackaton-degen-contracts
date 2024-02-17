import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Paymaster__factory } from 'src/typechain'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    const paymasterName = 'Paymaster'

    const paymaster = await deploy(paymasterName, {
        from: deployer,
        log: true,
        args: ['0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'],
    })

    const deployerProvider = await ethers.getSigner(deployer)

    const factory = Paymaster__factory.connect(paymaster.address, deployerProvider)

    const currentDeposit = await factory.getDeposit()
    const minAmount = BigNumber.from(10).pow(17).mul(3) // 0.3  Matica
    if (currentDeposit.lt(minAmount)) {
        const amountToDeposit = minAmount.sub(currentDeposit)

        await (await factory.deposit({ value: amountToDeposit })).wait()
    }
}

func.tags = ['paymaster']

export default func
