// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./Utils.sol";
import "./TransferVerifier.sol";
import "./BurnVerifier.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library Suter {

struct SuterBank {

    address payable suterAgency; 
    IERC20 token;
    TransferVerifier transferverifier;
    BurnVerifier burnverifier;

    /*
        main account mapping
    */
    mapping(bytes32 => Utils.G1Point[2]) acc; 
    /*
        storage for pending transfers
    */
    mapping(bytes32 => Utils.G1Point[2]) pending; 
    /*
        symmetric ciphertext to speed up client decryption
    */
    mapping(bytes32 => bytes) guess;
    mapping(bytes32 => uint256) lastRollOver;
    /*
       Would be more natural to use a mapping, but they can't be deleted / reset
    */
    bytes32[] nonceSet; 

    /*
       Default: 0
    */
    uint256 lastGlobalUpdate; 

    /* 
       The # of tokens that constitute one unit.
       Balances, funds, burns, and transfers are all interpreted in terms of unit, rather than token. 
    */
    uint256 unit; 

    /*
       Max units that can be handled by suter.
       (No sload for constants...!)
    */
    uint256 MAX;

    /*
       Default: 24
    */
    uint256 epochLength; 
    /*
        0 for block, 1 for second (usually just for test)
        Default: 0
    */
    uint256 epochBase; 

    /* Default burn fee: 1/100 of burn amount */
    uint256 BURN_FEE_MULTIPLIER;
    uint256 BURN_FEE_DIVIDEND;
    /* Default transfer fee: 1/5 of gas */
    uint256 TRANSFER_FEE_MULTIPLIER;
    uint256 TRANSFER_FEE_DIVIDEND;

    /* Default: 0 */
    uint256 totalBalance;
    uint256 totalUsers;
    uint256 totalBurnFee;
    uint256 totalTransferFee;
    uint256 totalDeposits;
    uint256 totalFundCount;

}

}
