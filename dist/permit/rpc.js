"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = exports.getChainId = exports.setChainIdOverride = exports.signData = exports.send = void 0;
const randomId = () => Math.floor(Math.random() * 10000000000);
const send = (provider, method, params) => new Promise((resolve, reject) => {
    const payload = {
        id: randomId(),
        method,
        params,
    };
    const callback = (err, result) => {
        if (err) {
            reject(err);
        }
        else if (result.error) {
            console.error(result.error);
            reject(result.error);
        }
        else {
            resolve(result.result);
        }
    };
    const _provider = provider.provider?.provider || provider.provider || provider;
    if (_provider.getUncheckedSigner /* ethers provider */) {
        _provider
            .send(method, params)
            .then((r) => resolve(r))
            .catch((e) => reject(e));
    }
    else if (_provider.sendAsync) {
        _provider.sendAsync(payload, callback);
    }
    else {
        _provider.send(payload, callback).catch((error) => {
            if (error.message === "Hardhat Network doesn't support JSON-RPC params sent as an object") {
                _provider
                    .send(method, params)
                    .then((r) => resolve(r))
                    .catch((e) => reject(e));
            }
            else {
                throw error;
            }
        });
    }
});
exports.send = send;
const splitSignatureToRSV = (signature) => {
    const r = '0x' + signature.substring(2).substring(0, 64);
    const s = '0x' + signature.substring(2).substring(64, 128);
    const v = parseInt(signature.substring(2).substring(128, 130), 16);
    return { r, s, v };
};
const signWithEthers = async (signer, fromAddress, typeData) => {
    const signerAddress = await signer.getAddress();
    if (signerAddress.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error('Signer address does not match requested signing address');
    }
    const { EIP712Domain: _unused, ...types } = typeData.types;
    const rawSignature = await (signer.signTypedData ? signer.signTypedData(typeData.domain, types, typeData.message) : signer._signTypedData(typeData.domain, types, typeData.message));
    return splitSignatureToRSV(rawSignature);
};
const signData = async (provider, fromAddress, typeData) => {
    if (provider._signTypedData || provider.signTypedData) {
        return signWithEthers(provider, fromAddress, typeData);
    }
    const typeDataString = typeof typeData === 'string' ? typeData : JSON.stringify(typeData);
    const result = await (0, exports.send)(provider, 'eth_signTypedData_v4', [fromAddress, typeDataString]).catch((error) => {
        if (error.message === 'Method eth_signTypedData_v4 not supported.') {
            return (0, exports.send)(provider, 'eth_signTypedData', [fromAddress, typeData]);
        }
        else {
            throw error;
        }
    });
    return {
        r: result.slice(0, 66),
        s: '0x' + result.slice(66, 130),
        v: parseInt(result.slice(130, 132), 16),
    };
};
exports.signData = signData;
let chainIdOverride = null;
const setChainIdOverride = (id) => {
    chainIdOverride = id;
};
exports.setChainIdOverride = setChainIdOverride;
const getChainId = async (provider) => chainIdOverride || (0, exports.send)(provider, 'eth_chainId');
exports.getChainId = getChainId;
const call = (provider, to, data) => (0, exports.send)(provider, 'eth_call', [
    {
        to,
        data,
    },
    'latest',
]);
exports.call = call;
//# sourceMappingURL=rpc.js.map