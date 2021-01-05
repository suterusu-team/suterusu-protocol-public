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
            deployer.deploy(SuterETH, 
                "0xcBef7176B4a37Da6F91B88DBb940a4A1b200C6e4", 
                ['0x26b19ea298a4eb9101cd1e16ff5f1deece5e5d3800b7f0b47a13eec8e840de27', '0x15fc497dffd66a50c9b43b3e1496a51fe30ea4f071357f6179989be25912e522'],
                TransferVerifier.address, BurnVerifier.address, 1, 12, "10000000000000000"),
            deployer.deploy(SuterERC20,
                "0xcBef7176B4a37Da6F91B88DBb940a4A1b200C6e4",
                ['0x26b19ea298a4eb9101cd1e16ff5f1deece5e5d3800b7f0b47a13eec8e840de27', '0x15fc497dffd66a50c9b43b3e1496a51fe30ea4f071357f6179989be25912e522'],
                TestERC20Token.address, TransferVerifier.address, BurnVerifier.address, 1, 12, 1)
        ]);
    });
};
