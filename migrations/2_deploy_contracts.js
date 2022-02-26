const {deployProxy} = require('@openzeppelin/truffle-upgrades');
 const TestERC20Token = artifacts.require("TestERC20Token");
const InnerProductVerifier = artifacts.require("InnerProductVerifier");
const BurnVerifier = artifacts.require("BurnVerifier");
const TransferVerifier = artifacts.require("TransferVerifier");
const SuterETH = artifacts.require("SuterETH");
const SuterERC20 = artifacts.require("SuterERC20");
const SuterNativeFactory = artifacts.require("SuterNativeFactory");
const SuterERC20Factory = artifacts.require("SuterERC20Factory");
const Suterusu = artifacts.require("Suterusu");

module.exports = async function(deployer, network, accounts) {
    let ipVerifier = await deployer.deploy(InnerProductVerifier);
    console.log('InnerProductVerifier: ', InnerProductVerifier.address);

    let burnVerifier = await deployer.deploy(BurnVerifier, InnerProductVerifier.address);
    console.log('BurnVerifier: ', BurnVerifier.address);

    let transferVerifier = await deployer.deploy(TransferVerifier, InnerProductVerifier.address);
    console.log('TransferVerifier: ', TransferVerifier.address);

    let nativeFactory = await deployer.deploy(SuterNativeFactory, "ETH", TransferVerifier.address, BurnVerifier.address);
    console.log('SuterNativeFactory: ', SuterNativeFactory.address);

    let erc20Factory = await deployer.deploy(SuterERC20Factory, TransferVerifier.address, BurnVerifier.address);
    console.log('SuterERC20Factory: ', SuterERC20Factory.address);

    let suterusu = await deployer.deploy(Suterusu, SuterNativeFactory.address, SuterERC20Factory.address);
    console.log('Suterusu: ', Suterusu.address);
    // Change the unit with this if necessary. The default is: 10000000000000000 (10**16). 
    // suterusu.setUnit("ETH", "10000000000000000");

     let erc20Token = await deployer.deploy(TestERC20Token);
     console.log('TestERC20Token: ', TestERC20Token.address);

    //let suterETH = await deployProxy(SuterETH, [transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterETH'});
    //await suterETH.setUnit("10000000000000000", {from: accounts[0]});
    //console.log('SuterETH: ', suterETH.address);

      // USDT
    // let suterUSDT = await deployProxy(SuterERC20, ['0xdAC17F958D2ee523a2206206994597C13D831ec7', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterUSDT.setUnit("1000000", {from: accounts[0]});
    // console.log('suterUSDT: ', suterUSDT.address);

    // // DAI
    // let suterDAI = await deployProxy(SuterERC20, ['0x6B175474E89094C44Da98b954EedeAC495271d0F', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterDAI.setUnit("1000000000000000000", {from: accounts[0]});
    // console.log('suterDAI: ', suterDAI.address);




    // // BUSD
    // let suterBusd = await deployProxy(SuterERC20, ['0x03f85f25e16fF2c6F39A46e096052381D92CeE19', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterBusd.setUnit("1000000000000000000", {from: accounts[0]});
    // console.log('suterBusd: ', suterBusd.address);

    // // cake
    // let suterCake = await deployProxy(SuterERC20, ['0x5B5bC8624F595136CdC4593606883c60A2150aF2', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterCake.setUnit("1000000000000000000", {from: accounts[0]});
    // console.log('suterCake: ', suterCake.address);

    // // bake
    // let suterBake = await deployProxy(SuterERC20, ['0x5125c6871e5B9c64C88BA9c1CF6027BB43D3e4c1', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterBake.setUnit("1000000000000000000", {from: accounts[0]});
    // console.log('suterBake: ', suterBake.address);

    // // suter
    // let suterSuter = await deployProxy(SuterERC20, ['0x31A12B827b4FD44ea0d81ddaCa57f691EEe40362', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterSuter.setUnit("1000000000000000000", {from: accounts[0]});
    // console.log('suterSuter: ', suterSuter.address);

    // // xsuter
    // let suterxSuter = await deployProxy(SuterERC20, ['0x23538e1B238cb927fdF2d8A5d7597432De98274E', transferVerifier.address, burnVerifier.address], {deployer, initializer: 'initializeSuterERC20'});
    // await suterxSuter.setUnit("1000000000000000", {from: accounts[0]});
    // console.log('suterxSuter: ', suterxSuter.address);
};
