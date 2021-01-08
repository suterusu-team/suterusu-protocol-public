const SuterERC20 = artifacts.require('SuterERC20');
const TestERC20Token = artifacts.require('TestERC20Token');
const Client = require('../lib/client_sutererc20.js');

contract("SuterERC20", async (accounts) => {
    let alice;
    let bob;

    it("should allow register", async () => {
        let suter = (await SuterERC20.deployed()).contract;
        let erc20Token = (await TestERC20Token.deployed()).contract; 
        alice = new Client(web3, suter, accounts[0], erc20Token);

        // change epoch to base on time
        await alice.setEpochBase(1);

        await alice.init();
        await alice.register();
        assert.exists(
            alice.account.keypair,
            "Registration failed"
        );

        bob = new Client(web3, suter, accounts[1], erc20Token);
        await bob.init();
        await bob.register();
        assert.exists(
            bob.account.keypair,
            "Registration failed"
        );

    });

    it("should allow funding", async () => {
        let erc20Token = (await TestERC20Token.deployed()).contract;
        await new Promise((resolve, reject) => {
            erc20Token.methods.mint(accounts[0], 2000)
                .send({from: accounts[0], gas: 4700000})
                .on("receipt", (receipt) => {
                    erc20Token.methods.balanceOf(accounts[0])
                        .call()
                        .then((result) => {
                            console.log("ERC20 funds minted (balance = " + result + ").");
                            resolve(receipt);
                        });
                })
                .on("error", (error) => {
                    reject(error);
                });
        });

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
        let suter = (await SuterERC20.deployed()).contract;
        let erc20Token = (await TestERC20Token.deployed()).contract;
        bob = new Client(web3, suter, accounts[1], erc20Token);
        await bob.init();
        await bob.register();
        await alice.transferToClient(bob, 30);
        let aliceBalance = await alice.readBalanceFromContract();
        let bobBalance = await bob.readBalanceFromContract();
        assert.equal(
            aliceBalance,
            20,
            "Wrong balance for alice after transfering"
        );
        assert.equal(
            bobBalance,
            30,
            "Wrong balance for bob after transfering"
        );

        // Need to synchronize bob's account because Truffle test didn't handle events.
        await bob.syncAccountState();
        await bob.withdraw(30);
        bobBalance = await bob.readBalanceFromContract();
        assert.equal(
            bobBalance,
            0,
            "Wrong balance for bob after withdrawing"
        );
    });

    it("should allow charge burn fee", async () => {
        let erc20Token = (await TestERC20Token.deployed()).contract;
        let suter = (await SuterERC20.deployed()).contract;
        let suterAgency = new Client(web3, suter, accounts[4], erc20Token);

        // change agency
        await alice.setSuterAgency(suterAgency.home);

        await suterAgency.init();
        await suterAgency.register("suter_agency");
        assert.exists(
            suterAgency.account.keypair,
            "Registration failed"
        );

        await alice.deposit(100);
        let aliceNativeBalance1 = await erc20Token.methods.balanceOf(alice.home).call();
        let aliceSuterBalance1 = await alice.readBalanceFromContract();
        let agencyNativeBalance1 = await erc20Token.methods.balanceOf(suterAgency.home).call();

        console.log("Alice native balance before burn: ", aliceNativeBalance1, " tokens");
        console.log("Alice suter balance before burn: ", aliceSuterBalance1, " tokens");
        console.log("Agency native balance before burn: ", agencyNativeBalance1, " tokens");

        await alice.withdraw(100);
        let aliceNativeBalance2 = await erc20Token.methods.balanceOf(alice.home).call();
        let aliceSuterBalance2 = await alice.readBalanceFromContract();
        let agencyNativeBalance2 = await erc20Token.methods.balanceOf(suterAgency.home).call();

        console.log("Alice native balance after burn: ", aliceNativeBalance2, " tokens");
        console.log("Alice suter balance after burn: ", aliceSuterBalance2, " tokens");
        console.log("Agency native balance after burn: ", agencyNativeBalance2, " tokens");

        console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1), " tokens");
        console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1), " tokens");
        console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1), " tokens");

        assert.equal(
            (aliceNativeBalance2 - aliceNativeBalance1),
            99,
            "Wrong alice native balance change"
        );

        assert.equal(
            (aliceSuterBalance2 - aliceSuterBalance1),
            -100,
            "Wrong alice suter balance change"
        );

        assert.equal(
            (agencyNativeBalance2 - agencyNativeBalance1),
            1,
            "Wrong agency native balance change"
        );

    }); 

    it("should allow charge transfer fee", async () => {
        let erc20Token = (await TestERC20Token.deployed()).contract;
        let suter = (await SuterERC20.deployed()).contract;
        let suterAgency = new Client(web3, suter, accounts[4], erc20Token);
        await suterAgency.init();
        await suterAgency.register("suter_agency");
        assert.exists(
            suterAgency.account.keypair,
            "Registration failed"
        );

        await alice.deposit(100);

        let aliceNativeBalance1 = await erc20Token.methods.balanceOf(alice.home).call();
        let aliceSuterBalance1 = await alice.readBalanceFromContract();
        let bobNativeBalance1 = await erc20Token.methods.balanceOf(bob.home).call();
        let bobSuterBalance1 = await bob.readBalanceFromContract();
        let agencyNativeBalance1 = await erc20Token.methods.balanceOf(suterAgency.home).call();

        console.log("Alice native balance before transfer: ", aliceNativeBalance1, " tokens");
        console.log("Alice suter balance before transfer: ", aliceSuterBalance1, " tokens");
        console.log("Bob native balance before transfer: ", bobNativeBalance1, " tokens");
        console.log("Bob suter balance before transfer: ", bobSuterBalance1, " tokens");
        console.log("Agency native balance before transfer: ", agencyNativeBalance1, " tokens");

        let bobEncoded = bob.account.publicKeyEncoded();
        await alice.transfer(bobEncoded, 100);

        let aliceNativeBalance2 = await erc20Token.methods.balanceOf(alice.home).call();
        let aliceSuterBalance2 = await alice.readBalanceFromContract();
        let bobNativeBalance2 = await erc20Token.methods.balanceOf(bob.home).call();
        let bobSuterBalance2 = await bob.readBalanceFromContract();
        let agencyNativeBalance2 = await erc20Token.methods.balanceOf(suterAgency.home).call();

        console.log("Alice native balance after transfer: ", aliceNativeBalance2, " tokens");
        console.log("Alice suter balance after transfer: ", aliceSuterBalance2, " tokens");
        console.log("Bob native balance before transfer: ", bobNativeBalance2, " tokens");
        console.log("Bob suter balance before transfer: ", bobSuterBalance2, " tokens");
        console.log("Agency native balance after transfer: ", agencyNativeBalance2, " tokens");

        console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1), " tokens");
        console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1), " tokens");
        console.log("Bob native+: ", (bobNativeBalance2 - bobNativeBalance1), " tokens");
        console.log("Bob suter+: ", (bobSuterBalance2 - bobSuterBalance1), " tokens");
        console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1), " tokens");

        assert.equal(
            (aliceSuterBalance2 - aliceSuterBalance1),
            -100,
            "Wrong alice suter balance change"
        );
        assert.equal(
            (bobSuterBalance2 - bobSuterBalance1),
            100,
            "Wrong bob suter balance change"
        );
    }); 

    it("should allow change burn fee", async () => {
        let erc20Token = (await TestERC20Token.deployed()).contract;
        let suter = (await SuterERC20.deployed()).contract;
        let suterAgency = new Client(web3, suter, accounts[4], erc20Token);
        await suterAgency.init();
        await suterAgency.register("suter_agency");
        assert.exists(
            suterAgency.account.keypair,
            "Registration failed"
        );

        await suterAgency.setBurnFeeStrategy(1, 50);

        await alice.deposit(100);
        let aliceNativeBalance1 = await erc20Token.methods.balanceOf(alice.home).call();
        let aliceSuterBalance1 = await alice.readBalanceFromContract();
        let agencyNativeBalance1 = await erc20Token.methods.balanceOf(suterAgency.home).call();

        console.log("Alice native balance before burn: ", aliceNativeBalance1, " tokens");
        console.log("Alice suter balance before burn: ", aliceSuterBalance1, " tokens");
        console.log("Agency native balance before burn: ", agencyNativeBalance1, " tokens");

        await alice.withdraw(100);
        let aliceNativeBalance2 = await erc20Token.methods.balanceOf(alice.home).call();
        let aliceSuterBalance2 = await alice.readBalanceFromContract();
        let agencyNativeBalance2 = await erc20Token.methods.balanceOf(suterAgency.home).call();

        console.log("Alice native balance after burn: ", aliceNativeBalance2, " tokens");
        console.log("Alice suter balance after burn: ", aliceSuterBalance2, " tokens");
        console.log("Agency native balance after burn: ", agencyNativeBalance2, " tokens");

        console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1), " tokens");
        console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1), " tokens");
        console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1), " tokens");

        assert.equal(
            (aliceSuterBalance2 - aliceSuterBalance1),
            -100,
            "Wrong alice suter balance change"
        );

        assert.equal(
            (agencyNativeBalance2 - agencyNativeBalance1),
            2,
            "Wrong agency native balance change"
        );

    }); 


});
