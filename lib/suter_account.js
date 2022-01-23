const utils = require('./utils/utils.js');
const aes = require('./utils/aes.js');
const ABICoder = require('web3-eth-abi');
const { soliditySha3 } = require('web3-utils');
const bn128 = require('./utils/bn128.js');

class SuterAccount {
    constructor(secret) {
        if (secret === undefined) {
            this.keypair = utils.createAccount();
            this.aesKey = aes.generateKey();
        } else {
            this.keypair = utils.keyPairFromSecret(secret);
            this.aesKey = aes.generateKey(secret);
        }

        this._state = {
            available: 0,
            pending: 0,
            nonceUsed: 0,
            lastRollOver: 0
        };

        this.update = async (epoch) => {
            var updated = {};
            updated.available = this._state.available;
            updated.pending = this._state.pending;
            updated.nonceUsed = this._state.nonceUsed;
            updated.lastRollOver = epoch;
            if (this._state.lastRollOver < updated.lastRollOver) {
                updated.available += updated.pending;
                updated.pending = 0;
                updated.nonceUsed = false;
            }
            return updated;
        };

        this.available = () => {
            return this._state.available;
        };

        this.setAvailable = (value) => {
            this._state.available = value;
        };

        this.pending = () => {
            return this._state.pending;
        };

        this.setPending = (value) => {
            this._state.pending = value;
        };

        this.lastRollOver = () => {
            return this._state.lastRollOver;
        };

        this.balance = () => {
            return this._state.available + this._state.pending;
        };

        this.publicKey = () => {
            return this.keypair['y'];
        };

        this.privateKey = () => {
            return this.keypair['x'];
        };

        this.publicKeySerialized = () => {
            return bn128.serialize(this.keypair['y']);
        };

        this.privateKeySerialized = () => {
            return bn128.bytes(this.keypair['x']);
        };

        this.publicKeyEncoded = () => {
            return bn128.serializedToEncoded(this.publicKeySerialized());
        };

        this.publicKeyHash = () => {
            var encoded = ABICoder.encodeParameter("bytes32[2]", this.publicKeySerialized());
            return soliditySha3(encoded); 
        };

    }
}

module.exports = SuterAccount;
