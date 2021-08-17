const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
var mnemonic = "forest sentence vacant solid craft satoshi cash bridge science uncle weekend sea";
const PrivateKeyProvider = require("truffle-privatekey-provider");
const privateKey = "2f170ae99eab20935231cb707646ca36fb8e270bc206384e2719e3bfd69fa12c";

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
            provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-1-s2.binance.org:8545/`),
            network_id: 97,
            // confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            gas: 20000000,
            // gasPrice: 30000000000  
        },
        bsc_mainnet: {
            // provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
            provider: ()=> new PrivateKeyProvider(privateKeywo , `https://bsc-dataseed1.binance.org`),
            network_id: 56,
            // confirmations: 10,
            timeoutBlocks: 200,
            skipDryRun: true,
            gas: 20000000,
        },
        eth_mainnet: {
          provider: ()=> new PrivateKeyProvider(privateKeywo , `https://mainnet.infura.io/v3/d80602309b7c48e78b80a372a3f6c825`),
          network_id: 1,
          timeoutBlocks: 200,
          skipDryRun: true,
          // https://ethgasstation.info/  稍微调高一点防止price变化后一直打不了包
          gasPrice: 44000000000,
          gas: 20000000,
      },
    },

    compilers: {
        solc: {
          version: "^0.8.0",
          settings: {
            optimizer: {
              enabled: true,
              runs: 1500   // Optimize for how many times you intend to run the code
            },
          }
        }
    },

    plugins: ["truffle-contract-size"]
};
