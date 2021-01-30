var TestERC20Token = artifacts.require("TestERC20Token");
var Utils = artifacts.require("Utils");
var InnerProductVerifier = artifacts.require("InnerProductVerifier");
var BurnVerifier = artifacts.require("BurnVerifier");
var TransferVerifier = artifacts.require("TransferVerifier");
var SuterETH = artifacts.require("SuterETH");
var SuterERC20 = artifacts.require("SuterERC20");

module.exports = function(deployer) {

    //console.log("Deploying Utils, TestERC20Token, InnerProductVerifier...");
    //return Promise.all([
        //deployer.deploy(Utils),
        //deployer.deploy(TestERC20Token),
        //deployer.deploy(InnerProductVerifier)
    //])
    //.then(() => {
        //console.log("Deploying BurnVerifier, TransferVerifier...");
        //return Promise.all([
            //deployer.deploy(BurnVerifier, InnerProductVerifier.address),
            //deployer.deploy(TransferVerifier, InnerProductVerifier.address)
        //]);
    //})
    //.then(() => {
        //console.log("Deploying SuterETH, SuterERC20...");
        //return Promise.all([
            //// Should use string for large number. This seems to be a bug:
            //// https://github.com/ethereum/web3.js/issues/2077
            //deployer.deploy(SuterETH, TransferVerifier.address, BurnVerifier.address, "10000000000000000"),
            //deployer.deploy(SuterERC20, TestERC20Token.address, TransferVerifier.address, BurnVerifier.address, "10000000000000000000000")
        //]);
    //});

    console.log("Deploying TransferVerifier...");
    return Promise.all([
        deployer.deploy(TransferVerifier, "0x0018cc3C2f191E16DB54EaBDa22fFAa603ea39F2"),
    ])
    .then(() => {
        console.log("Deploying SuterERC20...");
        return Promise.all([
            deployer.deploy(SuterERC20, '0x840D4c4477959c9976A81a5c2155d0A4CB3fFD9F', TransferVerifier.address, '0x083542Ce3C1C2ED250fFA2C7DAD5194c27179258', "10000000000000000000000"),
        ]);
    });


    //console.log("Deploying TestERC20Token...");
    //return Promise.all([
        //deployer.deploy(TestERC20Token),
    //]);
};
