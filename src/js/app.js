const Client = require("suterusu");
App = {
  web3Provider: null,
  contracts: {
      suterETHContract: null,
      suterERC20Contract: null,
      erc20TokenContract: null

  },
    suterClient: null,
    alice_address: '0x22fE54326C85b427E9AC771e3EBbDc23f41aCf5b',
    alice_secret: '22fE54326C85b427E9AC771e3EBbDc23f41aCf5b',
    bob_address: '0x10Eb73f9c463fF3302760bF0eFD8bBD7Cc751124',
    bob_secret: '10Eb73f9c463fF3302760bF0eFD8bBD7Cc751124',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers
    if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
            // Request account access
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access
            console.error("User denied account access");
        }
        console.log("using modern dapp browser");
    }
    // Legacy dapp browsers
    else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
        console.log("using legacy dapp browser");
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
        //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        App.web3Provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/d80602309b7c48e78b80a372a3f6c825");
        console.log("using ropsten");
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: async function() {
      let suterETHabi = (await $.getJSON('SuterETH.json')).abi;
      App.contracts.suterETHContract = new web3.eth.Contract(suterETHabi, '0x7524703c59d8dac3a5D3eF64D934514705A8D307');
      App.contracts.suterETHContract.setProvider(App.web3Provider);

      let suterERC20abi = (await $.getJSON('SuterERC20.json')).abi;
      App.contracts.suterERC20Contract = new web3.eth.Contract(suterERC20abi, '0x1B284E1A34CA1FA30732D58442d4bb74Dc609E82');
      App.contracts.suterERC20Contract.setProvider(App.web3Provider);

      let erc20abi = (await $.getJSON('TestERC20Token.json')).abi;
      App.contracts.erc20TokenContract = new web3.eth.Contract(erc20abi, '0x840D4c4477959c9976A81a5c2155d0A4CB3fFD9F');
      App.contracts.erc20TokenContract.setProvider(App.web3Provider);

      return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#initETHButton', (event) => {
        App.initSuterEthClient();
    });
    $(document).on('click', '#registerETHButton', (event) => {
        App.suterEthRegister();
    });
    $(document).on('click', '#depositETHButton', (event) => {
        App.suterEthDeposit();
    });

    $(document).on('click', '#withdrawETHButton', (event) => {
        App.suterEthWithdraw();
    });
    $(document).on('click', '#transferETHButton', (event) => {
        App.suterEthTransfer();
    });
    $(document).on('click', '#balanceETHButton', (event) => {
        App.suterEthBalance();
    });
    $(document).on('click', '#addressETHButton', (event) => {
        App.suterEthAddress();
    });



      $(document).on('click', '#mintERC20Button', (event) => {
          App.mintERC20Token();
      });

    $(document).on('click', '#initERC20Button', (event) => {
        App.initSuterERC20Client();
    });
    $(document).on('click', '#registerERC20Button', (event) => {
        App.suterERC20Register();
    });
    $(document).on('click', '#depositERC20Button', (event) => {
        App.suterERC20Deposit();
    });

    $(document).on('click', '#withdrawERC20Button', (event) => {
        App.suterERC20Withdraw();
    });
    $(document).on('click', '#transferERC20Button', (event) => {
        App.suterERC20Transfer();
    });
    $(document).on('click', '#balanceERC20Button', (event) => {
        App.suterERC20Balance();
    });
    $(document).on('click', '#addressERC20Button', (event) => {
        App.suterERC20Address();
    });

  },

    initSuterEthClient: async function ()  {
        let accounts = await web3.eth.getAccounts();
        console.log('accounts: ', accounts);
        this.suterEthClient = new Client.ClientSuterETH(
            web3,
            App.contracts.suterETHContract,
            accounts[0] 
        );
        await this.suterEthClient.init();

        if (accounts[0] == this.alice_address)
            this.secret = this.alice_secret;
        else if (accounts[0] == this.bob_address)
            this.secret = this.bob_secret;
    },

    suterEthRegister: async function () {
        await this.suterEthClient.register(this.secret);
        console.log(
            'keypair: ',
            this.suterEthClient.account.keypair
        );
    },

    suterEthDeposit: async function () {
        await this.suterEthClient.register(this.secret);
        await this.suterEthClient.deposit(10);
    },

    suterEthWithdraw: async function () {
        await this.suterEthClient.register(this.secret);
        await this.suterEthClient.withdraw(5);
    },

    suterEthBalance: async function () {
        console.log('this.secret: ', this.secret);
        await this.suterEthClient.register(this.secret);
        let balance = await this.suterEthClient.readBalanceFromContract();
    },

    suterEthAddress: async function () {
        console.log('suter address: ', this.suterEthClient.account.publicKeyEncoded());
    },

    suterEthTransfer: async function () {
        var address = $('#TransferSuterETHAddress').val();
        await this.suterEthClient.transfer(address, 5);
    },

    


    mintERC20Token: async function () {
        let accounts = await web3.eth.getAccounts(); 
        await new Promise((resolve, reject) => {
            App.contracts.erc20TokenContract.methods.mint(accounts[0], "20000000000000000000000000")
                .send({from: accounts[0], gas: 4700000})
                .on('transactionHash', (hash) => {
                    console.log("Mint submitted (txHash = \"" + hash + "\").");
                })
                .on("receipt", (receipt) => {
                    App.contracts.erc20TokenContract.methods.balanceOf(accounts[0])
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
    },

    initSuterERC20Client: async function ()  {
        let accounts = await web3.eth.getAccounts();
        console.log('accounts: ', accounts);
        this.suterERC20Client = new Client.ClientSuterERC20(
            web3,
            App.contracts.suterERC20Contract,
            accounts[0],
            App.contracts.erc20TokenContract
        );
        await this.suterERC20Client.init();

        if (accounts[0] == this.alice_address)
            this.secret = this.alice_secret;
        else if (accounts[0] == this.bob_address)
            this.secret = this.bob_secret;
    },

    suterERC20Register: async function () {
        await this.suterERC20Client.register(this.secret);
        console.log(
            'keypair: ',
            this.suterERC20Client.account.keypair
        );
    },

    suterERC20Deposit: async function () {
        await this.suterERC20Client.register(this.secret);
        await this.suterERC20Client.deposit(10);
    },

    suterERC20Withdraw: async function () {
        await this.suterERC20Client.register(this.secret);
        await this.suterERC20Client.withdraw(5);
    },

    suterERC20Balance: async function () {
        console.log('this.secret: ', this.secret);
        await this.suterERC20Client.register(this.secret);
        let balance = await this.suterERC20Client.readBalanceFromContract();
    },

    suterERC20Address: async function () {
        console.log('suter address: ', this.suterERC20Client.account.publicKeyEncoded());
    },

    suterERC20Transfer: async function () {
        var address = $('#TransferSuterERC20Address').val();
        await this.suterERC20Client.transfer(address, 5);
    },



};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
