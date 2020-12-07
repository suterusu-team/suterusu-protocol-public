const Client = require("suterusu");
App = {
  web3Provider: null,
  contracts: {},
    suterClient: null,
    alice_address: '0x3286B3746Bf0Aa18B4683447eCf995C3E6EEe5c3',
    alice_secret: '3286B3746Bf0Aa18B4683447eCf995C3E6EEe5c3',
    bob_address: '0xF4656AFEEe3553569c55C40b50AC98946F0401c3',
    bob_secret: 'F4656AFEEe3553569c55C40b50AC98946F0401c3',

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

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#initButton', (event) => {
        App.initSuterEthClient();
    });
    $(document).on('click', '#registerButton', (event) => {
        App.suterEthRegister();
    });
    $(document).on('click', '#depositButton', (event) => {
        App.suterEthDeposit();
    });

    $(document).on('click', '#withdrawButton', (event) => {
        App.suterEthWithdraw();
    });
    $(document).on('click', '#transferButton', (event) => {
        App.suterEthTransfer();
    });
    $(document).on('click', '#balanceButton', (event) => {
        App.suterEthBalance();
    });
    $(document).on('click', '#addressButton', (event) => {
        App.suterEthAddress();
    });
  },

    initSuterEthClient: async function ()  {
        let abi = (await $.getJSON('SuterETH.json')).abi;
        var suterEthContract = new web3.eth.Contract(abi, '0x04ABccaEE88734ea58Abe6a6762253E728C2C6ac');
        suterEthContract.setProvider(App.web3Provider);
        let accounts = await web3.eth.getAccounts();
        console.log('accounts: ', accounts);
        this.suterEthClient = new Client.ClientSuterETH(
            web3,
            suterEthContract,
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
        var address = $('#TransferSuterAddress').val();
        await this.suterEthClient.transfer(address, 5);
    },


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
