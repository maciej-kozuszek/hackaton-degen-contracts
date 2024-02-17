import { getChainId, call, signData, RSV } from './rpc'
import { hexToUtf8 } from './lib'
import { BigNumber } from 'ethers'

const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

interface MessageTypeProperty {
    name: string
    type: string
}
type SignatureTypes = Record<string, MessageTypeProperty[]>
export interface CreateOrderMessage {
    equityToken: string
    equityTokenOwner: string
    equityTokenAmount: string
    pricePerToken: string
}

export interface ApproveOrderMessage {
    token: string
    tokenOwner: string
    pricePerToken: string
    tokenAmount: string
}

export interface ERC2612PermitMessage {
    owner: string
    spender: string
    value: number | string
    nonce: number | string
    deadline: number | string
}

export interface Domain {
    name: string
    version: string
    chainId: number
    verifyingContract: string
}

export interface SignatureTypedData {
    domain: Domain
    types: SignatureTypes
    primaryType: string
    message: Record<string, unknown>
}

export const signatureTypes: SignatureTypes = {
    EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
    ],
    CreateOrderPermitData: [
        { name: 'equityToken', type: 'address' },
        { name: 'equityTokenOwner', type: 'address' },
        { name: 'equityTokenAmount', type: 'uint256' },
        { name: 'pricePerToken', type: 'uint256' },
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
    ApproveOrderPermitData: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
}

export function getCreateOrderTypedData(order: CreateOrderMessage, permit: ERC2612PermitMessage, domain: Domain): SignatureTypedData {
    return {
        domain: {
            name: 'TestStableCoin',
            version: '1',
            chainId: domain.chainId,
            verifyingContract: domain.verifyingContract,
        },
        types: {
            CreateOrderData: signatureTypes.CreateOrderPermitData,
        },
        primaryType: 'CreateOrderPermitData',
        message: {
            equityToken: order.equityToken,
            equityTokenOwner: order.equityTokenOwner,
            pricePerToken: order.pricePerToken,
            equityTokenAmount: order.equityTokenAmount,
            owner: permit.owner,
            spender: permit.spender,
            value: permit.value,
            nonce: permit.nonce,
            deadline: permit.deadline,
        },
    }
}

export function getApproveOrderTypedData(data: ApproveOrderMessage, permit: ERC2612PermitMessage, domain: Domain): SignatureTypedData {
    return {
        domain: {
            name: 'EquityToken',
            version: '1',
            chainId: domain.chainId,
            verifyingContract: domain.verifyingContract,
        },
        types: {
            CreateOrderData: signatureTypes.ApproveOrderPermitData,
        },
        primaryType: 'ApproveOrderPermitData',
        message: {
            owner: permit.owner,
            spender: permit.spender,
            value: permit.value,
            nonce: permit.nonce,
            deadline: permit.deadline,
        },
    }
}

const NONCES_FN = '0x7ecebe00'
const NAME_FN = '0x06fdde03'

const zeros = (numZeros: number) => ''.padEnd(numZeros, '0')

const getTokenName = async (provider: any, address: string) => hexToUtf8((await call(provider, address, NAME_FN)).substr(130))

const getDomain = async (provider: any, token: string | Domain): Promise<Domain> => {
    if (typeof token !== 'string') {
        return token as Domain
    }

    const tokenAddress = token as string

    const [name, chainId] = await Promise.all([getTokenName(provider, tokenAddress), getChainId(provider)])

    const domain: Domain = { name, version: '1', chainId, verifyingContract: tokenAddress }
    return domain
}

export const signPermitCreateOrder = async (
    provider: any,
    equityToken: string,
    equityTokenOwner: string,
    pricePerToken: BigNumber,
    equityTokenAmount: BigNumber,
    token: string | Domain,
    owner: string,
    spender: string,
    value: string | number = MAX_INT,
    deadline?: number,
    nonce?: number,
): Promise<ERC2612PermitMessage & RSV> => {
    const tokenAddress = (token as Domain).verifyingContract || (token as string)

    const orderMessage: CreateOrderMessage = {
        equityToken: equityToken,
        equityTokenOwner: equityTokenOwner,
        equityTokenAmount: equityTokenAmount.toHexString(),
        pricePerToken: pricePerToken.toHexString(),
    }

    const permitMessage: ERC2612PermitMessage = {
        owner,
        spender,
        value,
        nonce: nonce === undefined ? await call(provider, tokenAddress, `${NONCES_FN}${zeros(24)}${owner.substr(2)}`) : nonce,
        deadline: deadline || MAX_INT,
    }

    const domain = await getDomain(provider, token)
    const typedData = getCreateOrderTypedData(orderMessage, permitMessage, domain)
    const sig = await signData(provider, owner, typedData)

    return { ...sig, ...permitMessage, ...orderMessage }
}

export const signPermitApproveOrder = async (
    provider: any,
    token: string | Domain,
    owner: string,
    spender: string,
    value: string | number = MAX_INT,
    deadline?: number,
    nonce?: number,
): Promise<ERC2612PermitMessage & RSV> => {
    const tokenAddress = (token as Domain).verifyingContract || (token as string)

    const approveMessage: ApproveOrderMessage = {
        token: '0x',
        tokenOwner: '0x',
        tokenAmount: '0',
        pricePerToken: '0',
    }

    const permitMessage: ERC2612PermitMessage = {
        owner,
        spender,
        value,
        nonce: nonce === undefined ? await call(provider, tokenAddress, `${NONCES_FN}${zeros(24)}${owner.substr(2)}`) : nonce,
        deadline: deadline || MAX_INT,
    }

    const domain = await getDomain(provider, token)
    const typedData = getApproveOrderTypedData(approveMessage, permitMessage, domain)
    const sig = await signData(provider, owner, typedData)

    return { ...sig, ...permitMessage, ...approveMessage }
}
