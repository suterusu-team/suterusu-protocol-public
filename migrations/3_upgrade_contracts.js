const {upgradeProxy} = require('@openzeppelin/truffle-upgrades');
const TestERC20Token = artifacts.require("TestERC20Token");
const Utils = artifacts.require("Utils");
const InnerProductVerifier = artifacts.require("InnerProductVerifier");
const BurnVerifier = artifacts.require("BurnVerifier");
const TransferVerifier = artifacts.require("TransferVerifier");
const SuterETH = artifacts.require("SuterETH");
const SuterERC20 = artifacts.require("SuterERC20");
const CheckSuter = artifacts.require("CheckSuter");

module.exports = async function(deployer, network, accounts) {
    // let ipVerifierExisting = await InnerProductVerifier.deployed();
    // let ipVerifier = await upgradeProxy(ipVerifierExisting.address, InnerProductVerifier, {deployer});
    // console.log('InnerProductVerifier: ', ipVerifier.address);

    // let burnVerifierExisting = await BurnVerifier.deployed();
    // let burnVerifier = await upgradeProxy(burnVerifierExisting.address, BurnVerifier, {deployer});
    // console.log('BurnVerifier: ', burnVerifier.address);

    // let transferVerifierExisting = await TransferVerifier.deployed();
    // let transferVerifier = await upgradeProxy(transferVerifierExisting.address, TransferVerifier, {deployer});
    // console.log('TransferVerifier: ', transferVerifier.address);

    // let suterETHExisting = await SuterETH.deployed();
    // let suterETH = await upgradeProxy(suterETHExisting.address, SuterETH, {deployer});
    // console.log('SuterETH: ', suterETH.address);

    // let suterERC20Existing = await SuterERC20.deployed();
    // let suterERC20 = await upgradeProxy(suterERC20Existing.address, SuterERC20, {deployer});
    // console.log('SuterERC20: ', suterERC20.address);
};
