const ClientBase = require('./client_base.js');
const aes = require('./utils/aes.js');
const BN = require('bn.js');
const BigNumber = require('bignumber.js');

class ClientSuterETH extends ClientBase {
    
    constructor(web3, suter, home) {
        super(web3, suter, home);
    }

    async deposit (value, fundGasLimit) {
        var that = this;
        that.checkRegistered();
        that.checkValue();
        var account = that.account;
        console.log("Initiating deposit: value of " + value + " units (" + value * that.unit + " wei)");

        let encGuess = '0x' + aes.encrypt(new BN(account.available()).toString(16), account.aesKey);

        var nativeValue = that.web3.utils.toBN(new BigNumber(value * that.unit)).toString();
        if (fundGasLimit === undefined)
            fundGasLimit = 400000;
        let transaction = that.suter.methods.fund(account.publicKeySerialized(), value, encGuess)
            .send({from: that.home, value: nativeValue, gas: fundGasLimit})
            .on('transactionHash', (hash) => {
                console.log("Deposit submitted (txHash = \"" + hash + "\").");
            })
            .on('receipt', async (receipt) => {
                account._state = await account.update();
                account._state.pending += parseInt(value);
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
