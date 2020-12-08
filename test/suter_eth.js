const SuterETH = artifacts.require('SuterETH');
const Client = require('../lib/client_sutereth.js');

contract("SuterETH", async (accounts) => {
    let alice;
    let bob;

    it("should allow register", async () => {
        let suter = (await SuterETH.deployed()).contract;
        alice = new Client(web3, suter, accounts[0]);
        await alice.init();
        await alice.register();
        assert.exists(
            alice.account.keypair,
            "Registration failed"
        );
    });

    it("should allow funding", async () => {
        await alice.deposit(100);
    });

    it("should allow reading balance", async () => {
        let balance = await alice.readBalanceFromContract();
        assert.equal(
            balance,
            100,
            "Wrong balance"
        );
        let localTrackedBalance = alice.account.balance();
        assert.equal(
            balance,
            localTrackedBalance,
            "Contract balance does not match locally tracked balance"
        );
    });

    it("should allow withdrawing", async () => {
        await alice.withdraw(50); 
        let balance1 = alice.account.balance();
        let balance2 = await alice.readBalanceFromContract(); 
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

    it("should allow transfer", async () => {
        let suter = (await SuterETH.deployed()).contract;
        bob = new Client(web3, suter, accounts[1]);
        await bob.init();
        await bob.register();
        let bobEncoded = bob.account.publicKeyEncoded();
        await alice.transfer(bobEncoded, 25);
        let aliceBalance = await alice.readBalanceFromContract();
        let bobBalance = await bob.readBalanceFromContract();
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
        await bob.syncAccountState();
        await bob.withdraw(25);
        bobBalance = await bob.readBalanceFromContract();
        assert.equal(
            bobBalance,
            0,
            "Wrong balance for bob after withdrawing"
        );
    });

    it("should allow account recovery", async () => {
        let suter = (await SuterETH.deployed()).contract;
        let eve = new Client(web3, suter, accounts[2]);
        await eve.init();
        await eve.register("test secret");
        assert.exists(
            eve.account.keypair,
            "Registration failed"
        );

        await eve.register("test secret");
        await eve.deposit(10);
        let balance = await eve.readBalanceFromContract();
        assert.equal(
            balance,
            10,
            "Wrong balance"
        );
        let localTrackedBalance = eve.account.balance();
        assert.equal(
            balance,
            localTrackedBalance,
            "Contract balance does not match locally tracked balance"
        );

        await eve.register("test secret");
        await eve.withdraw(5); 
        let balance1 = eve.account.balance();
        let balance2 = await eve.readBalanceFromContract(); 
        assert.equal(
            balance1,
            5,
            "Wrong locally tracked balance after withdrawing"
        );
        assert.equal(
            balance2,
            5,
            "Wrong contract balance after withdrawing"
        );

        await eve.register("test secret");
        await eve.deposit(10);
        await eve.withdraw(5);

        await eve.register("test secret");
        balance = await eve.readBalanceFromContract();
        console.log('balance: ', balance);

        await eve.register("test secret");
        await eve.deposit(10);
        await eve.withdraw(5);

        await eve.register("test secret");
        balance = await eve.readBalanceFromContract();
        console.log('balance: ', balance);

        
    });


});
