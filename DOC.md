# Suterusu Protocol

Suterusu Protocol is a protocol that allows users to protect payment anonymity and confidentiality on the Ethereum network. It includes a set of backend contracts that maintain funds and actions on funds in encrypted forms, and a series of correspoding frontend user algorithms to interact with the contracts. Suterusu supports both ETH and any ERC20 token. On the high level, Suterusu can be viewed as an agency that workds on encrypted ETH and ERC20 tokens, and whose confidentiality and
anonymity are guaranteed by well-established cryptographic techniques. 

**Suterusu currently supports deployment on three environments: Ethereum mainnet, Huobi ECO Chain (HECO), Binance Smart Chain (BSC).** 



# Installation

## Prerequisites

Install node.js and npm. Here is an example on MacOS with HomeBrew:

```bash
brew install node 
```

## Develop Suterusu in truffle environment

```bash
git clone https://github.com/suterusu-team/suterusu-protocol.git
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

3. Run the test (located at `./test/test_suterusu.js`)
   
   ```bash
   truffle test ./test/test_suterusu.js --compile-all
   ```

## Install Suterusu as a node module

```bash
git clone https://github.com/suterusu-team/suterusu-protocol.git
npm install Suterusu-Protocol
```

Afterwards, it can be used in NodeJS code like this:

```javascript
const {SuterSdk} = require('suterusu');
```

## Install Suterusu as a browser script

```bash
git clone https://github.com/suterusu-team/suterusu-protocol.git
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

| API        | Description                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| privateKey | An Elliptic curve ElGamal private key                                                                            |
| publicKey  | An Elliptic curve ElGamal public key                                                                             |
| available  | The finalized fund amount that can be used on chain                                                              |
| pending    | The pending fund amount that can NOT be used yet on chain. It will be merged into `available` in the next epoch. |
| balance    | The sum of available and pending                                                                                 |



# SuterSdk

### constructor

| Parameters      | Type              | Description                                                                        |
| --------------- | ----------------- | ---------------------------------------------------------------------------------- |
| web3            | Web3              | A Web3 object                                                                      |
| suterusu        | web3.eth.Contract | The `Suterusu` contract                                                            |
| home            | String            | An ethereum address for spending and receiving funds                               |
| suter_eth_abi   | Object            | The json interface of `SuterETH` (the contract for dealing with the native token)  |
| suter_erc20_abi | Object            | The json interface of `SuterERC20` (the contract for dealing with any ERC20 token) |

### addSuter

| Parameters             | Type   | Description                                                    |
| ---------------------- | ------ | -------------------------------------------------------------- |
| symbol                 | String | A unique symbol for the ERC20 token to be added (e.g., "USDT") |
| token_contract_address | String | The contract address of the ERC20 token                        |

### initSuterClient

| Parameters | Type   | Description                                                                                    |
| ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| symbol     | String | A unique symbol for the token                                                                  |
| token_abi  | Object | (*optional*) If symbol is not the native symbol, this is the json interface of the ERC20 token |

### getSymbols

| Return type | Description                             |
| ----------- | --------------------------------------- |
| Array       | A list of symbols supported by Suterusu |

### register

This api registers a user on chain with a private/public key pair derived from a supplied secret. The submitted transaction includes a signature that can be verified by the public key on chain, hence only the owner of the secret can succeed in registering a public key. This also creates a `SuterAccount` internally.

| Parameters       | Type   | Description                                                                                                                              |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| secret           | String | A secret that is used to derive the private/public key pair. It should be always kept safe by the user, and not revealed to anyone else. |
| registerGasLimit | int    | (*optional*) The maximum gas to pay for register. Default to 190000.                                                                     |

### deposit

| Parameters      | Type   | Description                                                                                                                                    |
| --------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| symbol          | String | The unique symbol of the token to select for deposit.                                                                                          |
| value           | int    | The fund amount to deposit to the Suterusu contract. This is meaured in configurable ***unit***, not in the original measurement of the token. |
| fundGasLimit    | int    | (*optional*) The maximum gas to pay for deposit. Default to 500000.                                                                            |
| approveGasLimit | int    | (*optional*) The maximum gas to pay for approve. Default to 60000.                                                                             |

### withdraw

| Parameters   | Type   | Description                                                                                                                                                 |
| ------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| symbol       | String | The unique symbol of the token to select for withdraw.                                                                                                      |
| value        | int    | The amount to withdraw from the Suterusu contract. This is meaured in configurable ***unit***, not in the original measurement of the token.                |
| destination  | int    | (*optional*) The destination where to send the withdrawn fund. Default to null, in which case destination will be set `home` used in constructing SuterSdk. |
| burnGasLimit | int    | (*optional*) The maximum gas to pay for withdraw. Default to 4000000.                                                                                       |

### transfer

| Parameters       | Type   | Description                                                                                                                                                                              |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| symbol           | String | The unique symbol of the token to select for transfer.                                                                                                                                   |
| value            | int    | The amount to transfer from the current SuterAccount to the receiver on the Suterusu contract. This is meaured in configurable ***unit***, not in the original measurement of the token. |
| receiver         | String | The receiver of this transfer. This should be an encoded public key that has been registered by someone.                                                                                 |
| decoys           | List   | (*optional*) A list of encoded public keys to anonymize the transfer. Default to undefined.                                                                                              |
| transferGasLimit | int    | (*optional*) The maximum gas to pay for transfer. Default to undefined.                                                                                                                  |
