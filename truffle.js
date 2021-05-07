const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
var mnemonic = "found fault unlock penalty credit conduct pipe reunion rally coral dolphin ethics";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
    networks: {
        development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*" // Match any network id
    },
    develop: {
        host: "127.0.0.1",
        port: 8545
    },
    heco_testnet: {
        provider: () => new HDWalletProvider(mnemonic, 'https://http-testnet.hecochain.com'),
        network_id: 256
    },
    heco_mainnet: {
        provider: () => new HDWalletProvider(mnemonic, 'https://http-mainnet.hecochain.com'),
        network_id: 128
    },
    bsc_testnet: {
        provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-1-s1.binance.org:8545`),
        network_id: 97,
        confirmations: 10,
        timeoutBlocks: 200,
        skipDryRun: true    
    },
    bsc_mainnet: {
        provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
        network_id: 56,
        confirmations: 10,
        timeoutBlocks: 200,
        skipDryRun: true
    },

    greyh: {
        provider: () => new Web3.providers.HttpProvider('https://smartbch.greyh.at'),
        network_id: "*",
        //confirmations: 10
    },

    smartbch_testnet1: {
        //provider: () => new Web3.providers.HttpProvider('http://135.181.219.10:8545'),
        provider: () => new HDWalletProvider(mnemonic, 'http://135.181.219.10:8545'),
        gasPrice: 0,
        network_id: "10001",
        //confirmations: 10
    }

  },

  compilers: {
      solc: {
          version: "^0.6.0"
      }
  }
};
