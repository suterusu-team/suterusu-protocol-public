const SuterETH = artifacts.require('SuterETH');
const Client = require('../lib/client_sutereth.js');

contract("SuterETH", async (accounts) => {
    let alice;
    let bob;

    it("should allow register", async () => {
        let suter = (await SuterETH.deployed()).contract;
        alice = new Client(web3, suter, accounts[0]);

        // change epoch to base on time
        await alice.setEpochBase(1);

        await alice.init();
        await alice.register();
        assert.exists(
            alice.account.keypair,
            "Registration failed"
        );

        bob = new Client(web3, suter, accounts[1]);
        await bob.init();
        await bob.register();
        assert.exists(
            bob.account.keypair,
            "Registration failed"
        );

    });

    it("should allow reading guess", async () => {
        let guess = await alice.getGuess();
        assert.equal(
            guess,
            0,
            "Wrong guess"
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
        
        console.log("Home balance: ", (await web3.eth.getBalance(accounts[0])));
        console.log("Suter balance: ", (await web3.eth.getBalance(suter.options.address)));
        console.log("Agency balance: ", (await web3.eth.getBalance(await suter.methods.suterAgency().call())));

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

    it("should allow charge burn fee", async () => {
        let suter = (await SuterETH.deployed()).contract;
        let suterAgency = new Client(web3, suter, accounts[4]);

        // Change agency
        await alice.setSuterAgency(suterAgency.home);

        await suterAgency.init();
        await suterAgency.register("suter_agency");
        assert.exists(
            suterAgency.account.keypair,
            "Registration failed"
        );

        await alice.deposit(100);
        let aliceNativeBalance1 = await web3.eth.getBalance(alice.home);
        let aliceSuterBalance1 = await alice.readBalanceFromContract();
        let agencyNativeBalance1 = await web3.eth.getBalance(suterAgency.home);

        console.log("Alice native balance before burn: ", aliceNativeBalance1 / 1e18, " ETH");
        console.log("Alice suter balance before burn: ", aliceSuterBalance1 * alice.unit / 1e18, " ETH");
        console.log("Agency native balance before burn: ", agencyNativeBalance1 / 1e18, " ETH");

        await alice.withdraw(100);
        let aliceNativeBalance2 = await web3.eth.getBalance(alice.home);
        let aliceSuterBalance2 = await alice.readBalanceFromContract();
        let agencyNativeBalance2 = await web3.eth.getBalance(suterAgency.home);

        console.log("Alice native balance after burn: ", aliceNativeBalance2 / 1e18, " ETH");
        console.log("Alice suter balance after burn: ", aliceSuterBalance2 * alice.unit / 1e18, " ETH");
        console.log("Agency native balance after burn: ", agencyNativeBalance2 / 1e18, " ETH");

        console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1) / 1e18, " ETH");
        console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18, " ETH");
        console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1) / 1e18, " ETH");

        assert.equal(
            (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18,
            -1,
            "Wrong alice suter balance change"
        );

        assert.equal(
            (agencyNativeBalance2 - agencyNativeBalance1) / 1e18,
            0.01,
            "Wrong agency native balance change"
        );

    }); 

    it("should allow charge transfer fee", async () => {
        let suter = (await SuterETH.deployed()).contract;
        let suterAgency = new Client(web3, suter, accounts[4]);
        await suterAgency.init();
        await suterAgency.register("suter_agency");
        assert.exists(
            suterAgency.account.keypair,
            "Registration failed"
        );

        await alice.deposit(100);

        let aliceNativeBalance1 = await web3.eth.getBalance(alice.home);
        let aliceSuterBalance1 = await alice.readBalanceFromContract();
        let bobNativeBalance1 = await web3.eth.getBalance(bob.home);
        let bobSuterBalance1 = await bob.readBalanceFromContract();
        let agencyNativeBalance1 = await web3.eth.getBalance(suterAgency.home);

        console.log("Alice native balance before transfer: ", aliceNativeBalance1 / 1e18, " ETH");
        console.log("Alice suter balance before transfer: ", aliceSuterBalance1 * alice.unit / 1e18, " ETH");
        console.log("Bob native balance before transfer: ", bobNativeBalance1 / 1e18, " ETH");
        console.log("Bob suter balance before transfer: ", bobSuterBalance1 * bob.unit / 1e18, " ETH");
        console.log("Agency native balance before transfer: ", agencyNativeBalance1 / 1e18, " ETH");

        let bobEncoded = bob.account.publicKeyEncoded();
        await alice.transfer(bobEncoded, 100);

        let aliceNativeBalance2 = await web3.eth.getBalance(alice.home);
        let aliceSuterBalance2 = await alice.readBalanceFromContract();
        let bobNativeBalance2 = await web3.eth.getBalance(bob.home);
        let bobSuterBalance2 = await bob.readBalanceFromContract();
        let agencyNativeBalance2 = await web3.eth.getBalance(suterAgency.home);

        console.log("Alice native balance after transfer: ", aliceNativeBalance2 / 1e18, " ETH");
        console.log("Alice suter balance after transfer: ", aliceSuterBalance2 * alice.unit / 1e18, " ETH");
        console.log("Bob native balance before transfer: ", bobNativeBalance2 / 1e18, " ETH");
        console.log("Bob suter balance before transfer: ", bobSuterBalance2 * bob.unit / 1e18, " ETH");
        console.log("Agency native balance after transfer: ", agencyNativeBalance2 / 1e18, " ETH");

        console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1) / 1e18, " ETH");
        console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18, " ETH");
        console.log("Bob native+: ", (bobNativeBalance2 - bobNativeBalance1) / 1e18, " ETH");
        console.log("Bob suter+: ", (bobSuterBalance2 - bobSuterBalance1) * bob.unit / 1e18, " ETH");
        console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1) / 1e18, " ETH");

        assert.equal(
            (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18,
            -1,
            "Wrong alice suter balance change"
        );
        assert.equal(
            (bobSuterBalance2 - bobSuterBalance1) * bob.unit / 1e18,
            1,
            "Wrong bob suter balance change"
        );
    }); 

    it("should allow change burn fee", async () => {
        let suter = (await SuterETH.deployed()).contract;
        let suterAgency = new Client(web3, suter, accounts[4]);
        await suterAgency.init();
        await suterAgency.register("suter_agency");
        assert.exists(
            suterAgency.account.keypair,
            "Registration failed"
        );

        await suterAgency.setBurnFeeStrategy(1, 50);

        await alice.deposit(100);
        let aliceNativeBalance1 = await web3.eth.getBalance(alice.home);
        let aliceSuterBalance1 = await alice.readBalanceFromContract();
        let agencyNativeBalance1 = await web3.eth.getBalance(suterAgency.home);

        console.log("Alice native balance before burn: ", aliceNativeBalance1 / 1e18, " ETH");
        console.log("Alice suter balance before burn: ", aliceSuterBalance1 * alice.unit / 1e18, " ETH");
        console.log("Agency native balance before burn: ", agencyNativeBalance1 / 1e18, " ETH");

        await alice.withdraw(100);
        let aliceNativeBalance2 = await web3.eth.getBalance(alice.home);
        let aliceSuterBalance2 = await alice.readBalanceFromContract();
        let agencyNativeBalance2 = await web3.eth.getBalance(suterAgency.home);

        console.log("Alice native balance after burn: ", aliceNativeBalance2 / 1e18, " ETH");
        console.log("Alice suter balance after burn: ", aliceSuterBalance2 * alice.unit / 1e18, " ETH");
        console.log("Agency native balance after burn: ", agencyNativeBalance2 / 1e18, " ETH");

        console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1) / 1e18, " ETH");
        console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18, " ETH");
        console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1) / 1e18, " ETH");

        assert.equal(
            (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18,
            -1,
            "Wrong alice suter balance change"
        );

        assert.equal(
            (agencyNativeBalance2 - agencyNativeBalance1) / 1e18,
            0.02,
            "Wrong agency native balance change"
        );

    }); 

});
