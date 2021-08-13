const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const TestERC20Token = artifacts.require("TestERC20Token");
const Utils = artifacts.require("Utils");
const InnerProductVerifier = artifacts.require("InnerProductVerifier");
const BurnVerifier = artifacts.require("BurnVerifier");
const TransferVerifier = artifacts.require("TransferVerifier");
const SuterETH = artifacts.require("SuterETH");
const SuterERC20 = artifacts.require("SuterERC20");
const CheckSuter = artifacts.require("CheckSuter");

module.exports = async function(deployer, network, accounts) {
    let ipVerifier = await deployProxy(InnerProductVerifier, [], {deployer, initializer: false});
    console.log('InnerProductVerifier: ', ipVerifier.address);

    let burnVerifier = await deployProxy(BurnVerifier, [ipVerifier.address], {deployer});
    console.log('BurnVerifier: ', burnVerifier.address);

    let transferVerifier = await deployProxy(TransferVerifier, [ipVerifier.address], {deployer});
    console.log('TransferVerifier: ', transferVerifier.address);

    let suterETH = await deployProxy(SuterETH, [transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterETH'});
    await suterETH.setUnit("10000000000000000", {from: accounts[0]});
    console.log('SuterETH: ', suterETH.address);


    // let erc20Token = await deployProxy(TestERC20Token, [], {deployer});
    // console.log('TestERC20Token: ', erc20Token.address);

    // let suterERC20 = await deployProxy(SuterERC20, [erc20Token.address, transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterERC20.setUnit("10000000000000000000000", {from: accounts[0]});
    // console.log('SuterERC20: ', suterERC20.address);

};
