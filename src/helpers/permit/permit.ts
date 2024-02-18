import { BigNumber, ethers } from 'ethers'
import { RSV, call } from './rpc'

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

const zeros = (numZeros: number) => ''.padEnd(numZeros, '0')

export const signPermitCreateOrder = async ({
    provider,
    equityToken,
    equityTokenOwner,
    pricePerToken,
    equityTokenAmount,
    tokenAddress,
    tokenName,
    chainId,
    owner,
    spender,
    value = MAX_INT,
    deadline,
    nonce,
}: {
    provider: any
    equityToken: string
    equityTokenOwner: string
    pricePerToken: BigNumber
    equityTokenAmount: BigNumber
    tokenAddress: string
    tokenName: string
    chainId: number

    owner: string
    spender: string
    value: string | number
    deadline?: number
    nonce?: number
}): Promise<ERC2612PermitMessage & RSV> => {
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

    const _domain: Domain = {
        name: tokenName,
        version: '1',
        chainId: chainId,
        verifyingContract: tokenAddress,
    }
    const { domain, message, types } = getCreateOrderTypedData(orderMessage, permitMessage, _domain)
    const sig = await provider._signTypedData(domain, types, message)

    const signattt = ethers.utils.splitSignature(sig)

    return {
        r: signattt.r,
        s: signattt.s,
        v: signattt.v,
        ...permitMessage,
        ...orderMessage,
    }
}

export const signPermitApproveOrder = async (
    provider: any,
    tokenAddress: string,
    tokenName: string,
    chainId: number,
    verifyingContract: string,
    owner: string,
    spender: string,
    value: string | number = MAX_INT,
    deadline?: number,
    nonce?: number,
): Promise<ERC2612PermitMessage & RSV> => {
    const approveMessage: ApproveOrderMessage = {
        token: tokenAddress,
        tokenOwner: owner,
        tokenAmount: value.toString(),
        pricePerToken: '0',
    }

    const permitMessage: ERC2612PermitMessage = {
        owner,
        spender,
        value,
        nonce: nonce === undefined ? await call(provider, tokenAddress, `${NONCES_FN}${zeros(24)}${owner.substr(2)}`) : nonce,
        deadline: deadline || MAX_INT,
    }

    const _domain: Domain = {
        name: tokenName,
        version: '1',
        chainId: chainId,
        verifyingContract: verifyingContract,
    }
    const { domain, message, types } = getApproveOrderTypedData(approveMessage, permitMessage, _domain)
    const sig = await provider._signTypedData(domain, types, message)

    const signattt = ethers.utils.splitSignature(sig)

    return {
        r: signattt.r,
        s: signattt.s,
        v: signattt.v,
        ...permitMessage,
        ...approveMessage,
    }
}
