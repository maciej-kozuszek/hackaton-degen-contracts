"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signERC2612Permit = exports.signPermit = void 0;
const rpc_1 = require("./rpc");
const lib_1 = require("./lib");
const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];
const createTypedData = (message, domain) => {
    const typedData = {
        types: {
            EIP712Domain,
            Permit: [
                { name: 'holder', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'nonce', type: 'uint256' },
                { name: 'expiry', type: 'uint256' },
                { name: 'allowed', type: 'bool' },
            ],
        },
        primaryType: 'Permit',
        domain,
        message,
    };
    return typedData;
};
const createTypedERC2612Data = (message, domain) => {
    const typedData = {
        types: {
            EIP712Domain,
            Permit: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
            ],
        },
        primaryType: 'Permit',
        domain,
        message,
    };
    return typedData;
};
const NONCES_FN = '0x7ecebe00';
const NAME_FN = '0x06fdde03';
const zeros = (numZeros) => ''.padEnd(numZeros, '0');
const getTokenName = async (provider, address) => (0, lib_1.hexToUtf8)((await (0, rpc_1.call)(provider, address, NAME_FN)).substr(130));
const getDomain = async (provider, token) => {
    if (typeof token !== 'string') {
        return token;
    }
    const tokenAddress = token;
    const [name, chainId] = await Promise.all([getTokenName(provider, tokenAddress), (0, rpc_1.getChainId)(provider)]);
    const domain = { name, version: '1', chainId, verifyingContract: tokenAddress };
    return domain;
};
const signPermit = async (provider, token, holder, spender, expiry, nonce) => {
    const tokenAddress = token.verifyingContract || token;
    const message = {
        holder,
        spender,
        nonce: nonce === undefined ? await (0, rpc_1.call)(provider, tokenAddress, `${NONCES_FN}${zeros(24)}${holder.substr(2)}`) : nonce,
        expiry: expiry || MAX_INT,
        allowed: true,
    };
    const domain = await getDomain(provider, token);
    const typedData = createTypedData(message, domain);
    const sig = await (0, rpc_1.signData)(provider, holder, typedData);
    return { ...sig, ...message };
};
exports.signPermit = signPermit;
const signERC2612Permit = async (provider, token, owner, spender, value = MAX_INT, deadline, nonce) => {
    const tokenAddress = token.verifyingContract || token;
    const message = {
        owner,
        spender,
        value,
        nonce: nonce === undefined ? await (0, rpc_1.call)(provider, tokenAddress, `${NONCES_FN}${zeros(24)}${owner.substr(2)}`) : nonce,
        deadline: deadline || MAX_INT,
    };
    const domain = await getDomain(provider, token);
    const typedData = createTypedERC2612Data(message, domain);
    const sig = await (0, rpc_1.signData)(provider, owner, typedData);
    return { ...sig, ...message };
};
exports.signERC2612Permit = signERC2612Permit;
//# sourceMappingURL=permit.js.map