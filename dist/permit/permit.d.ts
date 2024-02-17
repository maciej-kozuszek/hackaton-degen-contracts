import { RSV } from './rpc';
interface PermitMessage {
    holder: string;
    spender: string;
    nonce: number;
    expiry: number | string;
    allowed?: boolean;
}
interface ERC2612PermitMessage {
    owner: string;
    spender: string;
    value: number | string;
    nonce: number | string;
    deadline: number | string;
}
interface Domain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}
export declare const signPermit: (provider: any, token: string | Domain, holder: string, spender: string, expiry?: number, nonce?: number) => Promise<PermitMessage & RSV>;
export declare const signERC2612Permit: (provider: any, token: string | Domain, owner: string, spender: string, value?: string | number, deadline?: number, nonce?: number) => Promise<ERC2612PermitMessage & RSV>;
export {};
