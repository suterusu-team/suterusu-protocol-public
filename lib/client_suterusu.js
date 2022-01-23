const BN = require('bn.js');
const utils = require('./utils/utils.js');
const bn128 = require('./utils/bn128.js');
const elgamal = require('./utils/elgamal.js');
const aes = require('./utils/aes.js');
const Service = require('./utils/service.js'); 
const ABICoder = require('web3-eth-abi');
const BigNumber = require('bignumber.js');
const { soliditySha3 } = require('web3-utils');
const SuterAccount = require('./suter_account.js'); 
const ClientBase = require('./client_base.js');
const ClientSuterETH = require('./client_sutereth.js');
const ClientSuterERC20 = require('./client_sutererc20.js');

var sleep = (wait) => new Promise((resolve) => {
    setTimeout(resolve, wait);
});


class ClientSuterusu {
    /**
    Constrct a client, with given web3 object, Suter contract, and home account (Ethereum address). 

    @param web3 A web3 object.
    @param suter The Suter contract address.
    @param home The home account (Ethereum address).
    */
    constructor(web3, suterusu, home, suter_eth_abi, suter_erc20_abi) {
        if (web3 === undefined)
            throw "1st arg should be an initialized Web3 object.";
        if (suterusu === undefined)
            throw "2nd arg should be a deployed Suterusu constrct object.";
        if (home === undefined)
            throw "3rd arg should be the address of an Ethereum account.";

        console.log("Suterusu contract: " + suterusu.options.address);
        console.log("Native account: " + home);

        this.web3 = web3;
        this.suterusu = suterusu;
        this.home = home;

        this.suter_eth_abi = suter_eth_abi;
        this.suter_erc20_abi = suter_erc20_abi;

        this.suters = {};
        this.gasLimit = 5470000;
    }

    async nativeSymbol() {
        return await this.suterusu.methods.nativeSymbol().call();
    }

    async hasSuter(symbol) {
        var that = this;
        let suter_address = await that.suterusu.methods.getSuter(symbol).call();
        if (suter_address == 0)
            return false;
        return true;
    }

    async addSuter(symbol, token_contract_address) {
        var that = this;
        let transaction = that.suterusu.methods.addSuter(symbol, token_contract_address)
                .send({from: that.home, gas: that.gasLimit})
                .on('transactionHash', (hash) => {
                    console.log("addSuter submitted (txHash = \"" + hash + "\").");
                })
                .on('receipt', async (receipt) => {
                    console.log("addSuter successful.");
                })
                .on('error', (error) => {
                    console.log("addSuter failed: " + error);
                    throw error;
                });
        return transaction; 
    }

    async initSuterClient(symbol, token_abi) {
        var that = this;
        if (that.suters.hasOwnProperty(symbol))
            return;

        let suter_address = await that.suterusu.methods.getSuter(symbol).call();
        if (suter_address == 0)
            throw new Error("No suter found for token: " + symbol);

        let native_symbol = await that.nativeSymbol();
        if (symbol == native_symbol) {
            let suter = new that.web3.eth.Contract(that.suter_eth_abi, suter_address);
            let client = new ClientSuterETH(that.web3, suter, that.home); 
            await client.init();
            that.suters[symbol] = client;
        }
        else {
            let token_contract_address = await that.suterusu.methods.token(symbol).call(); 
            let token = new that.web3.eth.Contract(token_abi, token_contract_address);
            let suter = new that.web3.eth.Contract(that.suter_erc20_abi, suter_address);
            let client = new ClientSuterERC20(that.web3, suter, that.home, token);
            await client.init();
            that.suters[symbol] = client;
        }
    }

    getSuterClient(symbol) {
        var that = this;
        if (that.suters.hasOwnProperty(symbol))
            return that.suters[symbol];
        throw new Error("No suter client found for token: " + symbol);
    }

    async isKeyHashRegistered (pubKeyHash) {
        //var encoded = ABICoder.encodeParameter("bytes32[2]", pubKey);
        //var hashedKey = soliditySha3(encoded);
        return await this.suterusu.methods.registered(pubKeyHash).call();
    }

    async isKeyRegistered (pubKey) {
        var encoded = ABICoder.encodeParameter("bytes32[2]", pubKey);
        var hashedKey = soliditySha3(encoded);
        return this.isKeyHashRegistered(hashedKey);
    }

    async setBurnFeeStrategy (symbol, multiplier, dividend) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.setBurnFeeStrategy(multiplier, dividend); 
    }

    async setTransferFeeStrategy (symbol, multiplier, dividend) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.setTransferFeeStrategy(multiplier, dividend);
    }

    async setEpochBase (symbol, epochBase) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.setEpochBase(epochBase);
    }

    async setEpochLength (symbol, epochLength) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.setEpochLength(epochLength); 
    }

    async setSuterAgency (symbol, suterAgency) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.setSuterAgency(suterAgency); 
    }

    async getGuess (symbol) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.getGuess();
    }

    /**
    Read account balance from Suter contract.
    
    @return A promise that is resolved with the balance.
    */
    async readBalanceFromContract (symbol) {
        var that = this;
        let client = that.getSuterClient(symbol);
        return client.readBalanceFromContract();
    }

    /**
    Synchronize the local account state with that in the Suter contract.
    Use this when we lose track of the local account state.
    
    @return A promise.
    */
    async sync (symbol) {
        var that = this;
        if (that.account  === undefined)
            throw new Error("No account is linked with this instance. Please register or login.");
        let client = that.getSuterClient(symbol); 
        client.account.keypair = that.account.keypair;
        client.account.aesKey = that.account.aesKey;
        return client.syncAccountState();
    }

    /**
    [Transaction]
    Register a public/private key pair, stored in this client's Suter account.
    This key pair is used for private interaction with the Suter contract.
    NOTE: this key pair is NOT an Ethereum address, but instead, it should normally
    be used together with an Ethereum account address for the connection between
    Suter and plain Ethereum token.

    @param secret The private key. If not given, then a new public/private key pair is
        generated, otherwise construct the public/private key pair form the secret.

    @return A promise that is resolved (or rejected) with the execution status of the
        registraction transaction.
    */
    async register (secret, registerGasLimit) {
        var that = this;
        that.account = new SuterAccount(secret);
        let isRegistered = await that.isKeyHashRegistered(that.account.publicKeyHash());
        if (!isRegistered) {
            var [c, s] = utils.sign(that.suterusu.options.address, that.account.keypair);
            if (registerGasLimit === undefined)
                registerGasLimit = 190000;
            let transaction = that.suterusu.methods.register(that.account.publicKeySerialized(), c, s)
                .send({from: that.home, gas: registerGasLimit})
                .on('transactionHash', (hash) => {
                    console.log("Registration submitted (txHash = \"" + hash + "\").");
                })
                .on('receipt', (receipt) => {
                    console.log("Registration successful.");
                })
                .on('error', (error) => {
                    that.account = undefined;
                    console.log("Registration failed: " + error);
                });
            return transaction;
        }
        return 0;
    }

    async login(secret) {
        var that = this;
        that.account = new SuterAccount(secret);
        let isRegistered = await that.isKeyHashRegistered(that.account.publicKeyHash());

        if (!isRegistered) {
            that.account = undefined;
            throw new Error('Login failed: this suter account is not exists');
        }
        return 0;
    }

    /**
    [Transaction]
    Deposit a given amount of tokens in the Suter account.
    This essentially converts plain tokens to Suter tokens that are encrypted in the Suter contract.
    In other words, X tokens are deducted from this client's home account (Ethereum address), and X Suter
    tokens are added to this client's Suter account.

    The amount is represented in terms of a pre-defined unit. For example, if one unit represents 0.01 ETH,
    then an amount of 100 represents 1 ETH.

    @param value The amount to be deposited into the Suter account, in terms of unit.

    @return A promise that is resolved (or rejected) with the execution status of the deposit transaction.
    */
    async deposit (symbol, value, fundGasLimit, approveGasLimit) {
        var that = this;
        if (!(await that.isKeyHashRegistered(that.account.publicKeyHash())))
            throw new Error("Account not registered");
        let client = that.getSuterClient(symbol);
        return client.deposit(value, fundGasLimit, approveGasLimit); 
    }

    /**
    [Transaction]
    Withdraw a given amount of tokens from the Suter account, if there is sufficient balance.
    This essentially converts Suter tokens to plain tokens, with X Suter tokens deducted from
    this client's Suter account and X plain tokens added to this client's home account.

    The amount is represented in terms of a pre-defined unit. For example, if one unit represents 0.01 ETH,
    then an amount of 100 represents 1 ETH.

    @param value The amount to be deposited into the Suter account, in terms of unit.

    @return A promise that is resolved (or rejected) with the execution status of the deposit transaction.
    */
    async withdraw (symbol, destination, value, burnGasLimit) {
        var that = this;
        if (!(await that.isKeyHashRegistered(that.account.publicKeyHash())))
            throw new Error("Account not registered");
        let client = that.getSuterClient(symbol); 
        return client.withdraw(destination, value, burnGasLimit);
    }

    /**
    [Transaction]
    Transfer a given amount of tokens from this Suter account to a given receiver, if there is sufficient balance.
    
    The amount is represented in terms of a pre-defined unit. For example, if one unit represents 0.01 ETH,
    then an amount of 100 represents 1 ETH.

    @param receiver A serialized public key representing a Suter receiver.
    @param value The amount to be transfered, in terms of unit.
    @param decoys An array of suter users (represented by public keys) to anonymize the transfer.
    @param transferGasLimit The max gas allowed to use for the transfer operation.

    @return A promise that is resolved (or rejected) with the execution status of the deposit transaction. 
    */
    async transfer (symbol, receiver, value, decoys, transferGasLimit) {
        if (receiver instanceof ClientBase)
            receiver = receiver.account.publicKeyEncoded();
        if (receiver instanceof ClientSuterusu)
            receiver = receiver.getSuterClient(symbol).account.publicKeyEncoded();
        var that = this;
        console.log("receiver: " , receiver);
        
        if (!(await that.isKeyHashRegistered(that.account.publicKeyHash())))
            throw new Error("Sender not registered");
        if (!(await that.isKeyRegistered(bn128.encodedToSerialized(receiver))))
            throw new Error("Receiver not registered");
        if (decoys != undefined) {
            for (var i = 0; i < decoys.length; i++)
                if (!(await that.isKeyRegistered(bn128.encodedToSerialized(decoys[i]))))
                    throw new Error("Decoy " + i + " not registered");
        }

        let client = that.getSuterClient(symbol);
        return client.transfer(receiver, value, decoys, transferGasLimit);
    }
}

module.exports = ClientSuterusu;
