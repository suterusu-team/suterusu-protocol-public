const Suterusu = artifacts.require('Suterusu');
const SuterETH = artifacts.require('SuterETH');
const SuterERC20 = artifacts.require('SuterERC20');
const TestERC20Token = artifacts.require('TestERC20Token');
const Client = require('../lib/client_suterusu.js');

contract("Suterusu", async (accounts) => {
    let aliceAccountIdx = 0;
    let bobAccountIdx = 1;
    let catAccountIdx = 2;
    let alice;
    let bob;
    let nativeSymbol;
    let suterusu_contract;


    it("should allow add suter for a new token", async () => {
        suterusu_contract = (await Suterusu.deployed()).contract;
        alice = new Client(web3, suterusu_contract, accounts[aliceAccountIdx], SuterETH.abi, SuterERC20.abi);

        await alice.addSuter("TestToken", (await TestERC20Token.deployed()).contract.options.address);

        nativeSymbol = await alice.nativeSymbol(); 

        assert(await alice.hasSuter("TestToken"), "Add suter failed");
        assert(await alice.hasSuter(nativeSymbol), "Missing native suter");
        assert(!(await alice.hasSuter("random token")), "Should not have random suter");
    });

    it("should allow get symbols", async() => {
        let symbols = await alice.getSymbols();
        console.log("symbols: ", symbols);
        assert(symbols.indexOf('TestToken') > -1, "Get symbols failed");
        assert(symbols.indexOf(nativeSymbol) > -1, "Get symbols failed");
        assert(!(symbols.indexOf("random token") > -1), "Get symbols failed");
    });

    it("should allow client initialization", async() => {
        await alice.initSuterClient(nativeSymbol);
        await alice.initSuterClient("TestToken", TestERC20Token.abi);
    });

    it("should allow config epoch", async() => {
        // change epoch to base on time
        await alice.setEpochBase(nativeSymbol, 1);
        await alice.setEpochLength(nativeSymbol, 24);
        await alice.setEpochBase("TestToken", 1);
        await alice.setEpochLength("TestToken", 24);
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

    it("should allow sync account state", async () => {
        await alice.sync(nativeSymbol);
    });

    it("should allow reading guess", async () => {
        let guess = await alice.getGuess(nativeSymbol);
        assert.equal(
            guess,
            0,
            "Wrong guess"
        );
    });

    it("should allow funding", async () => {
        await alice.deposit(nativeSymbol, 100);
    });

    it("should allow reading balance", async () => {
        let balance = await alice.readBalanceFromContract(nativeSymbol);
        assert.equal(
            balance,
            100,
            "Wrong balance"
        );
        let localTrackedBalance = alice.getSuterClient(nativeSymbol).account.balance();
        assert.equal(
            balance,
            localTrackedBalance,
            "Contract balance does not match locally tracked balance"
        );
    });

    it("should allow withdrawing", async () => {
        await alice.withdraw(nativeSymbol, null, 50); 
        let balance1 = alice.getSuterClient(nativeSymbol).account.balance();
        let balance2 = await alice.readBalanceFromContract(nativeSymbol); 
        assert.equal(
            balance1,
            50,
            "Wrong locally tracked balance after withdrawing"
        );
        assert.equal(
            balance2,
            50,
            "Wrong contract balance after withdrawing"
        );
    });

    it("should allow bob", async () => {
        bob = new Client(web3, suterusu_contract, accounts[bobAccountIdx], 
            SuterETH.abi,
            SuterERC20.abi);

        assert(await bob.hasSuter("TestToken"), "Add suter failed");
        assert(await bob.hasSuter(nativeSymbol), "Missing native suter");
        assert(!(await bob.hasSuter("random token")), "Should not have random suter");

        await bob.initSuterClient(nativeSymbol);
        await bob.register("bob secret");
        await bob.sync(nativeSymbol);
    });

    it("should allow transfer", async () => {
        await alice.transfer(nativeSymbol, bob, 25);
        
        let aliceBalance = await alice.readBalanceFromContract(nativeSymbol);
        let bobBalance = await bob.readBalanceFromContract(nativeSymbol);
        assert.equal(
            aliceBalance,
            25,
            "Wrong balance for alice after transfering"
        );
        assert.equal(
            bobBalance,
            25,
            "Wrong balance for bob after transfering"
        );

        // Need to synchronize bob's account because Truffle test didn't handle events.
        await bob.sync(nativeSymbol);
        await bob.withdraw(nativeSymbol, null, 25);
        bobBalance = await bob.readBalanceFromContract(nativeSymbol);
        assert.equal(
            bobBalance,
            0,
            "Wrong balance for bob after withdrawing"
        );
    });

    it("should allow change epoch", async() => {
        await alice.setEpochLength(nativeSymbol, 48);

        await alice.withdraw(nativeSymbol, null, 5); 
        let balance1 = alice.getSuterClient(nativeSymbol).account.balance();
        let balance2 = await alice.readBalanceFromContract(nativeSymbol); 
        assert.equal(
            balance1,
            20,
            "Wrong locally tracked balance after withdrawing"
        );
        assert.equal(
            balance2,
            20,
            "Wrong contract balance after withdrawing"
        );

    });

    it("should allow withdraw to a specified address", async () => {
        await alice.withdraw(nativeSymbol, accounts[catAccountIdx], 10); 
        let balance1 = alice.getSuterClient(nativeSymbol).account.balance();
        let balance2 = await alice.readBalanceFromContract(nativeSymbol); 
        assert.equal(
            balance1,
            10,
            "Wrong locally tracked balance after withdrawing"
        );
        assert.equal(
            balance2,
            10,
            "Wrong contract balance after withdrawing"
        );
    });


});
