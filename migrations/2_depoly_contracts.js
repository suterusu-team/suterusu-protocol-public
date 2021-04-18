var TestERC20Token = artifacts.require("TestERC20Token");
var Utils = artifacts.require("Utils");
var InnerProductVerifier = artifacts.require("InnerProductVerifier");
var BurnVerifier = artifacts.require("BurnVerifier");
var TransferVerifier = artifacts.require("TransferVerifier");
var SuterETH = artifacts.require("SuterETH");
var SuterERC20 = artifacts.require("SuterERC20");
var CheckSuter = artifacts.require("CheckSuter");

module.exports = function(deployer) {

    console.log("Deploying Utils, TestERC20Token, InnerProductVerifier...");
    return Promise.all([
        deployer.deploy(Utils),
        deployer.deploy(TestERC20Token),
        deployer.deploy(InnerProductVerifier)
    ])
    .then(() => {
        console.log("Deploying BurnVerifier...");
        return Promise.all([
            deployer.deploy(BurnVerifier, InnerProductVerifier.address),
        ]);
    })
    .then(() => {
        console.log("Deploying TransferVerifier...");
        return Promise.all([
            deployer.deploy(TransferVerifier, InnerProductVerifier.address)
        ]);
    })
    .then(() => {
        console.log("Deploying SuterETH...");
        return Promise.all([
            // Should use string for large number. This seems to be a bug:
            // https://github.com/ethereum/web3.js/issues/2077
            deployer.deploy(SuterETH, TransferVerifier.address, BurnVerifier.address, "10000000000000000"),
        ]);
    })
    .then(() => {
        console.log("Deploying SuterERC20...");
        return Promise.all([
            // Should use string for large number. This seems to be a bug:
            // https://github.com/ethereum/web3.js/issues/2077
            deployer.deploy(SuterERC20, TestERC20Token.address, TransferVerifier.address, BurnVerifier.address, "10000000000000000000000")
        ]);
    });


    //console.log("Deploying TestERC20Token...");
    //return Promise.all([
        //deployer.deploy(TestERC20Token),
    //]);

    //console.log("Deploying CheckSuter...");
    //return Promise.all([
        //deployer.deploy(CheckSuter),
    //]);
};
