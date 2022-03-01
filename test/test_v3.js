const Suterusu = artifacts.require('Suterusu');
const SuterETH = artifacts.require('SuterETH');
const SuterERC20 = artifacts.require('SuterERC20');
const TestERC20Token = artifacts.require('TestERC20Token');
const Client = require('../lib/suter_sdk.js');

contract("Suterusu", async (accounts) => {
    let aliceAccountIdx = 0;
    let bobAccountIdx = 1;
    let catAccountIdx = 2;
    let alice;
    let bob;
    let nativeSymbol;
    let suterusu_contract;

    it("should mint some test token", async () => {
      let testERC20 = await TestERC20Token.deployed()
      await testERC20.mint(accounts[aliceAccountIdx], '10000000000000000000000', {from: accounts[aliceAccountIdx]})
      await testERC20.mint(accounts[bobAccountIdx], '10000000000000000000000', {from: accounts[aliceAccountIdx]})
    });

    it("should allow add suter for a new token", async () => {
        suterusu_contract = (await Suterusu.deployed()).contract;
        alice = new Client(web3, suterusu_contract, accounts[aliceAccountIdx], SuterETH.abi, SuterERC20.abi);
        
        let testERC20 = await TestERC20Token.deployed()
        await alice.addSuter("TestToken1", testERC20.contract.options.address);
    });

     it("should allow client initialization", async() => {
        nativeSymbol = await alice.nativeSymbol(); 
        await alice.initSuterClient(nativeSymbol);
        await alice.initSuterClient("TestToken1", TestERC20Token.abi);
    });

     it("should allow config epoch", async() => {
        // change epoch to base on time
        await alice.setEpochBase(nativeSymbol, 1);
        await alice.setEpochLength(nativeSymbol, 24);
        await alice.setEpochBase("TestToken1", 1);
        await alice.setEpochLength("TestToken1", 24);
      });

      it("should allow register", async () => {
        await alice.register("alice secret");

        assert.exists(
            alice.account,
            "Registration failed"
        );
      });
      it("should allow login", async () => {
        await alice.login("alice secret");

        assert.exists(
            alice.account,
            "Login failed"
        );
      });

      it("should allow bob", async () => {
        bob = new Client(web3, suterusu_contract, accounts[bobAccountIdx], 
            SuterETH.abi,
            SuterERC20.abi);

        assert(await bob.hasSuter("TestToken1"), "Add suter failed");
        assert(await bob.hasSuter(nativeSymbol), "Missing native suter");
        assert(!(await bob.hasSuter("random token")), "Should not have random suter");

        await bob.initSuterClient(nativeSymbol);
        await bob.initSuterClient("TestToken1", TestERC20Token.abi);
        await bob.register("bob secret");
        await bob.sync(nativeSymbol);
        await bob.sync("TestToken1");
      });

      it("some eth op", async () => {
        await alice.sync(nativeSymbol);
        await alice.deposit(nativeSymbol, 100);
        await alice.withdraw(nativeSymbol, null, 50); 
        await alice.transfer(nativeSymbol, bob, 25);
      })

      it("some testERC20 op", async () => {
        await alice.sync("TestToken1");
        await alice.deposit("TestToken1", 100);
        await alice.withdraw("TestToken1", null, 50); 
        await alice.transfer("TestToken1", bob, 25);
      })
})