const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
var mnemonic = "forest sentence vacant solid craft satoshi cash bridge science uncle weekend sea";

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
            gasPrice: 30000000000  
        },
        bsc_mainnet: {
            provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
            network_id: 56,
            confirmations: 10,
            timeoutBlocks: 200,
            skipDryRun: true
        },

        greyh: {
            provider: () => new HDWalletProvider(mnemonic, 'http://106.75.244.31:8545'),
            network_id: "*",
            gasPrice: 0,
            confirmations: 6
        }
    },

    compilers: {
        solc: {
            version: "^0.8.0"
        }
    },

    plugins: ["truffle-contract-size"]
};
