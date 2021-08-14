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

    // BUSD
    let suterBusd = await deployProxy(SuterERC20, ['0x03f85f25e16fF2c6F39A46e096052381D92CeE19', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    await suterBusd.setUnit("1000000000000000000", {from: accounts[0]});
    console.log('suterBusd: ', suterBusd.address);

    // cake
    let suterCake = await deployProxy(SuterERC20, ['0x5B5bC8624F595136CdC4593606883c60A2150aF2', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    await suterCake.setUnit("1000000000000000000", {from: accounts[0]});
    console.log('suterBusd: ', suterCake.address);

    // cake
    let suterBake = await deployProxy(SuterERC20, ['0x5125c6871e5B9c64C88BA9c1CF6027BB43D3e4c1', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    await suterBake.setUnit("1000000000000000000", {from: accounts[0]});
    console.log('suterBake: ', suterBake.address);

    // suter
    let suterSuter = await deployProxy(SuterERC20, ['0x31A12B827b4FD44ea0d81ddaCa57f691EEe40362', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    await suterSuter.setUnit("1000000000000000000", {from: accounts[0]});
    console.log('suterSuter: ', suterSuter.address);

    // xsuter
    let suterxSuter = await deployProxy(SuterERC20, ['0x23538e1B238cb927fdF2d8A5d7597432De98274E', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    await suterxSuter.setUnit("1000000000000000000", {from: accounts[0]});
    console.log('suterxSuter: ', suterxSuter.address);
};
