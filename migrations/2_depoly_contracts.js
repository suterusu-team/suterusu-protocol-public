var TestERC20Token = artifacts.require("TestERC20Token");
var Utils = artifacts.require("Utils");
var InnerProductVerifier = artifacts.require("InnerProductVerifier");
var BurnVerifier = artifacts.require("BurnVerifier");
var TransferVerifier = artifacts.require("TransferVerifier");
var SuterETH = artifacts.require("SuterETH");
var SuterERC20 = artifacts.require("SuterERC20");

module.exports = function(deployer) {

    console.log("Deploying Utils, TestERC20Token, InnerProductVerifier...");
    return Promise.all([
        deployer.deploy(Utils),
        deployer.deploy(TestERC20Token),
        deployer.deploy(InnerProductVerifier)
    ])
    .then(() => {
        console.log("Deploying BurnVerifier, TransferVerifier...");
        return Promise.all([
            deployer.deploy(BurnVerifier, InnerProductVerifier.address),
            deployer.deploy(TransferVerifier, InnerProductVerifier.address)
        ]);
    })
    .then(() => {
        console.log("Deploying SuterETH, SuterERC20...");
        return Promise.all([
            // Should use string for large number. This seems to be a bug:
            // https://github.com/ethereum/web3.js/issues/2077
            deployer.deploy(SuterETH, "0xcBef7176B4a37Da6F91B88DBb940a4A1b200C6e4", TransferVerifier.address, BurnVerifier.address, 1, 12, "10000000000000000"),
            deployer.deploy(SuterERC20, "0xcBef7176B4a37Da6F91B88DBb940a4A1b200C6e4", TestERC20Token.address, TransferVerifier.address, BurnVerifier.address, 1, 12, 1)
        ]);
    });
};
