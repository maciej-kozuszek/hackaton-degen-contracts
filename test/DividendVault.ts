import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { ContractTransactionReceipt, EventLog, Provider } from 'ethers'
import { DividendVault } from '../typechain-types'

describe('DividendVault', function () {
    async function deployDividendVaultFixture() {
        const [deployer, aliceHolder, bobHolder, cindyHolder, vaultOperator] = await ethers.getSigners()
        const Stablecoin = await ethers.getContractFactory('TestToken')
        const stablecoin = await Stablecoin.deploy()
        const equityToken = await Stablecoin.deploy()

        await equityToken.mintTo(aliceHolder.address, 30)
        await equityToken.mintTo(bobHolder.address, 30)
        await equityToken.mintTo(cindyHolder.address, 40)

        const DividendVault = await ethers.getContractFactory('DividendVault')
        const dividendVault = await DividendVault.deploy(await stablecoin.getAddress())

        return {
            stablecoin,
            dividendVault,
            equityToken,
            deployer,
            aliceHolder,
            bobHolder,
            cindyHolder,
            vaultOperator,
        }
    }

    describe('Deployment', function () {
        it('Create dividend, claim funds by holder and return locked shares (single holders)', async function () {
            const amountToClaim = ethers.toBigInt(1000)

            const { stablecoin, dividendVault, equityToken, vaultOperator, aliceHolder } = await loadFixture(deployDividendVaultFixture)
            const equityTokenSupply = await equityToken.totalSupply()

            await stablecoin.mintTo(vaultOperator.address, amountToClaim)

            const startBlock = await ethers.provider.getBlockNumber()
            const endBlock = startBlock + 10

            // Approve vaultOperator funds to be transfer by DividendVault to itself
            await stablecoin.connect(vaultOperator).approve(await dividendVault.getAddress(), amountToClaim)

            // create new dividend
            const newDividendTx = await dividendVault.connect(vaultOperator).newDividend(startBlock, endBlock, equityToken.getAddress(), amountToClaim)
            const newDividendReceipt = await newDividendTx.wait()

            const newDividendNumber = await getDividendNumber(dividendVault, newDividendReceipt!)

            const aliceEquityTokenBalanceBeforeClaim = await equityToken.balanceOf(aliceHolder.address)

            // Alice needs to approve her equity tokens to be locked in DividendVault till the dividend ends
            await equityToken.connect(aliceHolder).approve(await dividendVault.getAddress(), aliceEquityTokenBalanceBeforeClaim)

            await dividendVault.connect(aliceHolder).claimReward(await equityToken.getAddress(), newDividendNumber)

            expect(await stablecoin.balanceOf(aliceHolder.address)).to.equal((amountToClaim / equityTokenSupply) * aliceEquityTokenBalanceBeforeClaim)
            // Alice equity token shares are locked inside DividendVault
            expect(await equityToken.balanceOf(aliceHolder.address)).to.equal(0)

            // move forward to the dividend end block
            await mineBlocks(endBlock + 1, ethers.provider)

            // now Alice can withdraw her equity tokens
            await dividendVault.connect(aliceHolder).withdrawLockedShares(await equityToken.getAddress(), newDividendNumber)

            expect(await equityToken.balanceOf(aliceHolder.address)).to.equal(aliceEquityTokenBalanceBeforeClaim)
        })
        it('Create dividend, claim funds by holder and return locked shares (many holders)', async function () {
            const amountToClaim = ethers.toBigInt(1000)

            const { stablecoin, dividendVault, equityToken, vaultOperator, aliceHolder, bobHolder, cindyHolder } = await loadFixture(deployDividendVaultFixture)
            const equityTokenSupply = await equityToken.totalSupply()

            await stablecoin.mintTo(vaultOperator.address, amountToClaim)

            const currentBlock = await ethers.provider.getBlockNumber()
            const endBlock = currentBlock + 10

            await stablecoin.connect(vaultOperator).approve(await dividendVault.getAddress(), amountToClaim)

            const newDividendTx = await dividendVault.connect(vaultOperator).newDividend(currentBlock, endBlock, equityToken.getAddress(), amountToClaim)

            const newDividendReceipt = await newDividendTx.wait()

            const newDividendNumber = await getDividendNumber(dividendVault, newDividendReceipt!)

            const aliceEquityTokenBalance = await equityToken.balanceOf(aliceHolder.address)
            const bobEquityTokenBalance = await equityToken.balanceOf(bobHolder.address)
            const cindyEquityTokenBalance = await equityToken.balanceOf(cindyHolder.address)

            await equityToken.connect(aliceHolder).approve(await dividendVault.getAddress(), aliceEquityTokenBalance)

            await equityToken.connect(bobHolder).approve(await dividendVault.getAddress(), bobEquityTokenBalance)

            await equityToken.connect(cindyHolder).approve(await dividendVault.getAddress(), cindyEquityTokenBalance)

            await dividendVault.connect(aliceHolder).claimReward(await equityToken.getAddress(), newDividendNumber)
            await dividendVault.connect(bobHolder).claimReward(await equityToken.getAddress(), newDividendNumber)
            await dividendVault.connect(cindyHolder).claimReward(await equityToken.getAddress(), newDividendNumber)

            expect(await stablecoin.balanceOf(aliceHolder.address)).to.equal((amountToClaim / equityTokenSupply) * aliceEquityTokenBalance)
            expect(await stablecoin.balanceOf(bobHolder.address)).to.equal((amountToClaim / equityTokenSupply) * bobEquityTokenBalance)
            expect(await stablecoin.balanceOf(cindyHolder.address)).to.equal((amountToClaim / equityTokenSupply) * cindyEquityTokenBalance)

            await mineBlocks(endBlock + 1, ethers.provider)

            await dividendVault.connect(aliceHolder).withdrawLockedShares(await equityToken.getAddress(), newDividendNumber)
            await dividendVault.connect(bobHolder).withdrawLockedShares(await equityToken.getAddress(), newDividendNumber)
            await dividendVault.connect(cindyHolder).withdrawLockedShares(await equityToken.getAddress(), newDividendNumber)

            expect(await equityToken.balanceOf(aliceHolder.address)).to.equal(aliceEquityTokenBalance)
            expect(await equityToken.balanceOf(bobHolder.address)).to.equal(bobEquityTokenBalance)
            expect(await equityToken.balanceOf(cindyHolder.address)).to.equal(cindyEquityTokenBalance)
        })
        it('Dividend creator can withdraw remaining funds after dividend ends', async () => {
            const amountToClaim = ethers.toBigInt(1000)

            const { stablecoin, dividendVault, equityToken, vaultOperator, aliceHolder } = await loadFixture(deployDividendVaultFixture)
            const equityTokenSupply = await equityToken.totalSupply()

            await stablecoin.mintTo(vaultOperator.address, amountToClaim)
            await stablecoin.connect(vaultOperator).approve(await dividendVault.getAddress(), amountToClaim)

            const startBlock = await ethers.provider.getBlockNumber()
            const endBlock = startBlock + 10

            const newDividendTx = await dividendVault.connect(vaultOperator).newDividend(startBlock, endBlock, equityToken.getAddress(), amountToClaim)
            const newDividendReceipt = await newDividendTx.wait()

            const newDividendNumber = await getDividendNumber(dividendVault, newDividendReceipt!)

            const aliceEquityTokenBalanceBeforeClaim = await equityToken.balanceOf(aliceHolder.address)

            await equityToken.connect(aliceHolder).approve(await dividendVault.getAddress(), ethers.MaxInt256)
            // only Alice claimed her dividend reward
            await dividendVault.connect(aliceHolder).claimReward(await equityToken.getAddress(), newDividendNumber)

            const aliceDividendReward = (amountToClaim / equityTokenSupply) * aliceEquityTokenBalanceBeforeClaim

            // dividend ends
            await mineBlocks(endBlock + 1, ethers.provider)

            const vaultOperatorStablecoinBalanceBefore = await stablecoin.balanceOf(vaultOperator.address)

            await dividendVault.connect(vaultOperator).withdrawRemainingFunds(await equityToken.getAddress(), newDividendNumber)
            const vaultOperatorStablecoinBalanceAfter = await stablecoin.balanceOf(vaultOperator.address)

            expect(vaultOperatorStablecoinBalanceAfter - vaultOperatorStablecoinBalanceBefore).to.equal(amountToClaim - aliceDividendReward)
        })
    })
})

async function getDividendNumber(dividendVault: DividendVault, receipt: ContractTransactionReceipt) {
    const filter = dividendVault.filters.NewDividend()
    const topics = await filter.getTopicFilter()
    const topic = topics[0] as string

    const eventLog = receipt.logs.filter((log) => log.topics.includes(topic))[0] as EventLog
    return eventLog.args.dividendNumber
}

async function mineBlocks(endBlock: number, provider: Provider) {
    let currentBlockNumber = await ethers.provider.getBlockNumber()
    while (currentBlockNumber < endBlock) {
        await ethers.provider.send('evm_mine', [])
        currentBlockNumber = await ethers.provider.getBlockNumber()
    }
}
