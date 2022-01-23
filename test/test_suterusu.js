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


    //it("should allow account recovery", async () => {
        //let suter = (await SuterETH.deployed()).contract;
        //let eve = new Client(web3, suter, accounts[2]);
        //await eve.init();
        //await eve.register("test secret");
        //assert.exists(
            //eve.account.keypair,
            //"Registration failed"
        //);

        //await eve.register("test secret");
        //await eve.deposit(10);
        //let balance = await eve.readBalanceFromContract();
        //assert.equal(
            //balance,
            //10,
            //"Wrong balance"
        //);
        //let localTrackedBalance = eve.account.balance();
        //assert.equal(
            //balance,
            //localTrackedBalance,
            //"Contract balance does not match locally tracked balance"
        //);

        //await eve.register("test secret");
        //await eve.withdraw(5); 
        //let balance1 = eve.account.balance();
        //let balance2 = await eve.readBalanceFromContract(); 
        //assert.equal(
            //balance1,
            //5,
            //"Wrong locally tracked balance after withdrawing"
        //);
        //assert.equal(
            //balance2,
            //5,
            //"Wrong contract balance after withdrawing"
        //);

        //await eve.register("test secret");
        //await eve.deposit(10);
        //await eve.withdraw(5);

        //await eve.register("test secret");
        //balance = await eve.readBalanceFromContract();
        //console.log('balance: ', balance);

        //await eve.register("test secret");
        //await eve.deposit(10);
        //await eve.withdraw(5);

        //await eve.register("test secret");
        //balance = await eve.readBalanceFromContract();
        //console.log('balance: ', balance);
    //});

    //it("should allow charge burn fee", async () => {
        //let suter = (await SuterETH.deployed()).contract;
        //let suterAgency = new Client(web3, suter, accounts[4]);

        //// Change agency
        //await alice.setSuterAgency(suterAgency.home);

        //await suterAgency.init();
        //await suterAgency.register("suter_agency");
        //assert.exists(
            //suterAgency.account.keypair,
            //"Registration failed"
        //);

        //await alice.deposit(100);
        //let aliceNativeBalance1 = await web3.eth.getBalance(alice.home);
        //let aliceSuterBalance1 = await alice.readBalanceFromContract();
        //let agencyNativeBalance1 = await web3.eth.getBalance(suterAgency.home);

        //console.log("Alice native balance before burn: ", aliceNativeBalance1 / 1e18, " ETH");
        //console.log("Alice suter balance before burn: ", aliceSuterBalance1 * alice.unit / 1e18, " ETH");
        //console.log("Agency native balance before burn: ", agencyNativeBalance1 / 1e18, " ETH");

        //await alice.withdraw(100);
        //let aliceNativeBalance2 = await web3.eth.getBalance(alice.home);
        //let aliceSuterBalance2 = await alice.readBalanceFromContract();
        //let agencyNativeBalance2 = await web3.eth.getBalance(suterAgency.home);

        //console.log("Alice native balance after burn: ", aliceNativeBalance2 / 1e18, " ETH");
        //console.log("Alice suter balance after burn: ", aliceSuterBalance2 * alice.unit / 1e18, " ETH");
        //console.log("Agency native balance after burn: ", agencyNativeBalance2 / 1e18, " ETH");

        //console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1) / 1e18, " ETH");
        //console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18, " ETH");
        //console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1) / 1e18, " ETH");

        //assert.equal(
            //(aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18,
            //-1,
            //"Wrong alice suter balance change"
        //);

        //assert.equal(
            //(agencyNativeBalance2 - agencyNativeBalance1) / 1e18,
            //0.01,
            //"Wrong agency native balance change"
        //);

    //}); 

    //it("should allow charge transfer fee", async () => {
        //let suter = (await SuterETH.deployed()).contract;
        //let suterAgency = new Client(web3, suter, accounts[4]);
        //await suterAgency.init();
        //await suterAgency.register("suter_agency");
        //assert.exists(
            //suterAgency.account.keypair,
            //"Registration failed"
        //);

        //await alice.deposit(100);

        //let aliceNativeBalance1 = await web3.eth.getBalance(alice.home);
        //let aliceSuterBalance1 = await alice.readBalanceFromContract();
        //let bobNativeBalance1 = await web3.eth.getBalance(bob.home);
        //let bobSuterBalance1 = await bob.readBalanceFromContract();
        //let agencyNativeBalance1 = await web3.eth.getBalance(suterAgency.home);

        //console.log("Alice native balance before transfer: ", aliceNativeBalance1 / 1e18, " ETH");
        //console.log("Alice suter balance before transfer: ", aliceSuterBalance1 * alice.unit / 1e18, " ETH");
        //console.log("Bob native balance before transfer: ", bobNativeBalance1 / 1e18, " ETH");
        //console.log("Bob suter balance before transfer: ", bobSuterBalance1 * bob.unit / 1e18, " ETH");
        //console.log("Agency native balance before transfer: ", agencyNativeBalance1 / 1e18, " ETH");

        //let bobEncoded = bob.account.publicKeyEncoded();
        //await alice.transfer(bobEncoded, 100);

        //let aliceNativeBalance2 = await web3.eth.getBalance(alice.home);
        //let aliceSuterBalance2 = await alice.readBalanceFromContract();
        //let bobNativeBalance2 = await web3.eth.getBalance(bob.home);
        //let bobSuterBalance2 = await bob.readBalanceFromContract();
        //let agencyNativeBalance2 = await web3.eth.getBalance(suterAgency.home);

        //console.log("Alice native balance after transfer: ", aliceNativeBalance2 / 1e18, " ETH");
        //console.log("Alice suter balance after transfer: ", aliceSuterBalance2 * alice.unit / 1e18, " ETH");
        //console.log("Bob native balance before transfer: ", bobNativeBalance2 / 1e18, " ETH");
        //console.log("Bob suter balance before transfer: ", bobSuterBalance2 * bob.unit / 1e18, " ETH");
        //console.log("Agency native balance after transfer: ", agencyNativeBalance2 / 1e18, " ETH");

        //console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1) / 1e18, " ETH");
        //console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18, " ETH");
        //console.log("Bob native+: ", (bobNativeBalance2 - bobNativeBalance1) / 1e18, " ETH");
        //console.log("Bob suter+: ", (bobSuterBalance2 - bobSuterBalance1) * bob.unit / 1e18, " ETH");
        //console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1) / 1e18, " ETH");

        //assert.equal(
            //(aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18,
            //-1,
            //"Wrong alice suter balance change"
        //);
        //assert.equal(
            //(bobSuterBalance2 - bobSuterBalance1) * bob.unit / 1e18,
            //1,
            //"Wrong bob suter balance change"
        //);
    //}); 

    //it("should allow change burn fee", async () => {
        //let suter = (await SuterETH.deployed()).contract;
        //let suterAgency = new Client(web3, suter, accounts[4]);
        //await suterAgency.init();
        //await suterAgency.register("suter_agency");
        //assert.exists(
            //suterAgency.account.keypair,
            //"Registration failed"
        //);

        //await suterAgency.setBurnFeeStrategy(1, 50);

        //await alice.deposit(100);
        //let aliceNativeBalance1 = await web3.eth.getBalance(alice.home);
        //let aliceSuterBalance1 = await alice.readBalanceFromContract();
        //let agencyNativeBalance1 = await web3.eth.getBalance(suterAgency.home);

        //console.log("Alice native balance before burn: ", aliceNativeBalance1 / 1e18, " ETH");
        //console.log("Alice suter balance before burn: ", aliceSuterBalance1 * alice.unit / 1e18, " ETH");
        //console.log("Agency native balance before burn: ", agencyNativeBalance1 / 1e18, " ETH");

        //await alice.withdraw(100);
        //let aliceNativeBalance2 = await web3.eth.getBalance(alice.home);
        //let aliceSuterBalance2 = await alice.readBalanceFromContract();
        //let agencyNativeBalance2 = await web3.eth.getBalance(suterAgency.home);

        //console.log("Alice native balance after burn: ", aliceNativeBalance2 / 1e18, " ETH");
        //console.log("Alice suter balance after burn: ", aliceSuterBalance2 * alice.unit / 1e18, " ETH");
        //console.log("Agency native balance after burn: ", agencyNativeBalance2 / 1e18, " ETH");

        //console.log("Alice native+: ", (aliceNativeBalance2 - aliceNativeBalance1) / 1e18, " ETH");
        //console.log("Alice suter+:", (aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18, " ETH");
        //console.log("Agency native+:", (agencyNativeBalance2 - agencyNativeBalance1) / 1e18, " ETH");

        //assert.equal(
            //(aliceSuterBalance2 - aliceSuterBalance1) * alice.unit / 1e18,
            //-1,
            //"Wrong alice suter balance change"
        //);

        //assert.equal(
            //(agencyNativeBalance2 - agencyNativeBalance1) / 1e18,
            //0.02,
            //"Wrong agency native balance change"
        //);

    //}); 

});
