const ClientBase = require('./client_base.js');
const aes = require('./utils/aes.js');
const BN = require('bn.js');
const BigNumber = require('bignumber.js');

class ClientSuterETH extends ClientBase {
    
    constructor(web3, suter, home) {
        super(web3, suter, home);
    }

    async buildDepositArguments (value) {
        var that = this;
        var account = that.account;
        that.account.checkDefined();
        that.checkValue();
        var state = await account.update(await that._getEpoch());

        console.log("Initiating deposit: value of " + value + " units (" + value * that.unit + " wei)");

        let encGuess = '0x' + aes.encrypt(new BN(state.available).toString(16), account.aesKey); 

        return {
            "y": account.publicKeySerialized(),
            "unitAmount": value,
            "encGuess": encGuess
        };
    }

    async deposit (value, fundGasLimit = 500000) {
        var that = this;
        var args = await that.buildDepositArguments(value);

        var nativeValue = that.web3.utils.toBN(new BigNumber(value * that.unit)).toString();
        let transaction = that.suter.methods.fund(args.y, args.unitAmount, args.encGuess)
            .send({from: that.home, value: nativeValue, gas: fundGasLimit})
            .on('transactionHash', (hash) => {
                console.log("Deposit submitted (txHash = \"" + hash + "\").");
            })
            .on('receipt', async (receipt) => {
                that.account._state = await that.account.update(await that._getEpoch());
                that.account._state.pending += parseInt(value);
                console.log("Deposit of " + value + " was successful (uses gas: " + receipt["gasUsed"] + ")");  
                console.log("Account state: available = ", that.account.available(), ", pending = ", that.account.pending(), ", lastRollOver = ", that.account.lastRollOver());
            })
            .on('error', (error) => {
                console.log("Deposit failed: " + error);
            });
        return transaction;
    }

}

module.exports = ClientSuterETH;
