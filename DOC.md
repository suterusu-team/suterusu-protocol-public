# Suterusu Protocol

Suterusu Protocol is a protocol that allows users to protect payment anonymity and confidentiality on the Ethereum network. It includes a set of backend contracts that maintain funds and actions on funds in encrypted forms, and a series of correspoding frontend user algorithms to interact with the contracts. Suterusu supports both ETH and any ERC20 token. On the high level, Suterusu can be viewed as an agency that workds on encrypted ETH and ERC20 tokens, and whose confidentiality and
anonymity are guaranteed by well-established cryptographic techniques. 

**Suterusu currently supports deployment on three environments: Ethereum mainnet, Huobi ECO Chain (HECO), Binance Smart Chain (BSC).** 

We briefly introduce the main functionalities below (using ERC20 as an example).

## Register

#### [Frontend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/src/client_base.js#L282)

User inputs his or her private `secret` and the algorithm will generate a Suterusu public/private key pair. The Suterusu public key will be sent in a transaction to register an account in the contract.

#### [Backend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/contracts/SuterBase.sol#L62)

Register the Suterusu public key, and initialize the corresponding account status. 

## Fund

#### [Frontend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/src/client_sutererc20.js#L16)

Create a transaction to convert a specified amount of the user's ERC20 tokens to an equivalent amount of encrypted Suterusu ERC20 tokens.

#### [Backend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/contracts/SuterERC20.sol#L18)

1. Add the specified amount to the account's encrypted balance.
2. Transfer the specified amount of ERC20 tokens from the message sender to the contract. 

## Transfer

#### [Frontend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/src/client_base.js#L420)

Create a transaction to transfer a specified amount of the user's ERC20 tokens from the current user to a receiver. Note that the transaction will include necessary cryptographic zero-knowledge proof to guarantee that this is a ***valid*** transfer operation.

#### [Backend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/contracts/SuterBase.sol#L170)

1. Verify that this operation is valid: the sender has sufficient balance, and the same amount is deducted from the sender's account and added to the receiver's account.
2. Transfer a specified encrypted amount of balance from a sender to a receiver

## Burn

#### [Frontend](https://github.com/zjk89757-suter/hi/blob/3ddb1e84740716ed88af368a847782b9162fd6b1/src/client_base.js#L344)

Create a transaction to convert a specified amount of the user's encrypted Suterusu ERC20 tokens back to an equivalent amount of plain ERC20 tokens. Note that the transaction will include necessary cryptographic zero-knowledge proof to guarantee that this is a **valid** burn operation. 

#### [Backend](https://github.com/zjk89757-suter/hi/blob/af7e5bf6d7f76760047b1aeec279047e91e31a68/contracts/SuterERC20.sol#L27)

1. Verify that this operation is valid: the account has sufficient balance.
2. Deduct the specified amount of tokens from the account's encrypted balance;
3. Transfer the specified amount of ERC20 tokens from the contract to the message sender. 

# Installation

## Prerequisites

Install node.js and npm. Here is an example on MacOS with HomeBrew:

```bash
brew install node 
```

## Develop Suterusu in truffle environment

```bash
git clone https://github.com/zjk89757-suter/Suterusu-Protocol.git
cd Suterusu-Protocol
npm install -g truffle
npm install
```

Before truffle development, we also need to install [Ganache](https://www.trufflesuite.com/ganache) for launching a test blockchain.

### Compile and Test

A complete reference for truffle commands can be found in [Truffle Commands - Truffle Suite](https://trufflesuite.com/docs/truffle/reference/truffle-commands.html). Here are some common usage:

1. Compile the contract
   
   ```bash
   truffle compile --all
   ```

2. Deploy the contract to the test blockchain of Ganache
   
   ```bash
   truffle migrate --reset --compile-all
   ```

3. Run the test (located at `./test/suter_eth.js`)
   
   ```bash
   truffle test ./test/test_suterusu.js --compile-all
   ```

## Install Suterusu as a node module

```bash
git clone https://github.com/zjk89757-suter/Suterusu-Protocol.git
npm install Suterusu-Protocol
```

Afterwards, it can be used in NodeJS code like this:

```javascript
const {SuterSdk} = require('suterusu');
```

## Install Suterusu as a browser script

```bash
git clone https://github.com/zjk89757-suter/Suterusu-Protocol.git
cd Suterusu-Protocol
npm install browserify
cd lib
browserify -r ./suterusu.js:suterusu > dist/suterusu.js
```

The generated file `dist/suterusu.js` can then be installed in your web server and loaded in HTML like this:

```html
<script src="suterusu.js"></script>
<script>
  var SuterSdk = require('suterusu').SuterSdk;
</script>

```



# Create a SuterSdk instance

## NodeJS

```javascript
const {SuterSdk} = require('suterusu');
const Web3 = require('web3');

var provider = new Web3.providers.HttpProvider('http://localhost:7545');
var web3 = new Web3(provider);
var suterusu_abi = JSON.parse(fs.readFileSync("./build/contracts/Suterusu.json")).abi;
var suter_native_abi = JSON.parse(fs.readFileSync("./build/contracts/SuterETH.json")).abi;
var suter_erc20_abi = JSON.parse(fs.readFileSync("./build/contracts/SuterERC20.json")).abi;
var account = await web3.eth.getAccounts()[0];
var suterusu_contract = new we3.eth.Contract(suterusu_abi, "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe");

var sdk = new SuterSdk(web3, account, suterusu_contract, suter_native_abi, suter_erc20_abi);
```

## Web

```javascript
const {SuterSdk} = require('suterusu');
const Web3 = require('web3');

var web3 = new Web3(window.ethereum);
var suterusu_abi = $.getJSON("Suterusu.json").abi;
var suter_native_abi = $.getJSON("./build/contracts/SuterETH.json").abi;
var suter_erc20_abi = $.getJSON("SuterERC20.json").abi;
var account = await web3.eth.getAccounts()[0];
var suterusu_contract = new we3.eth.Contract(suterusu_abi, "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe");

var sdk = new SuterSdk(web3, account, suterusu_contract, suter_native_abi, suter_erc20_abi);
```



# SuterAccount

This is a structure to maintain suter account's information locally in plaintext. It is ***likely*** to be consistent with the encrypted account information on chain, but this is not always a guarantee due to asynchrony between off-chain and on-chain progress.



Normally, users do NOT need to use this class directly, but should create an account throught SuterSdk (introduced later in this doc). Nevertheless, we list the internal structure below:

| API        |                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| privateKey | An Elliptic curve ElGamal private key                                                                            |
| publicKey  | An Elliptic curve ElGamal public key                                                                             |
| available  | The finalized fund amount that can be used on chain                                                              |
| pending    | The pending fund amount that can NOT be used yet on chain. It will be merged into `available` in the next epoch. |
| balance    | The sum of available and pending                                                                                 |




