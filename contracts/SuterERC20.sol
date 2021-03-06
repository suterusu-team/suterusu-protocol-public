// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Utils.sol";
import "./SuterBase.sol";


contract SuterERC20 is SuterBase {


    constructor (address _token, address _transfer, address _burn) SuterBase(_transfer, _burn) {
        bank.token = IERC20(_token);
    }

    function setERC20Token(address _token) public onlyAdmin {
        bank.token = IERC20(_token);

        emit SetERC20TokenSuccess(_token);
    }

    function fund(bytes32[2] calldata y, uint256 unitAmount, bytes calldata encGuess) override external payable {
        SuterBase.fundBase(y, unitAmount, encGuess);

        uint256 nativeAmount = toNativeAmount(unitAmount);

        // In order for the following to succeed, `msg.sender` have to first approve `this` to spend the nativeAmount.
        require(bank.token.transferFrom(tx.origin, address(this), nativeAmount), "Native 'transferFrom' failed.");

        emit FundSuccess(y, unitAmount);
    }

    function burn(bytes32[2] memory y, uint256 unitAmount, bytes32[2] memory u, bytes memory proof, bytes memory encGuess) override external {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * bank.BURN_FEE_MULTIPLIER / bank.BURN_FEE_DIVIDEND; 

        SuterBase.burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            require(bank.token.transfer(bank.agency, fee), "Fail to charge fee.");
            bank.totalBurnFee = bank.totalBurnFee + fee;
        }
        require(bank.token.transfer(tx.origin, nativeAmount - fee), "Fail to transfer tokens.");

        emit BurnSuccess(y, unitAmount);
    }

    function burnTo(address sink, bytes32[2] memory y, uint256 unitAmount, bytes32[2] memory u, bytes memory proof, bytes memory encGuess) override external {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * bank.BURN_FEE_MULTIPLIER / bank.BURN_FEE_DIVIDEND; 

        SuterBase.burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            require(bank.token.transfer(bank.agency, fee), "Fail to charge fee.");
            bank.totalBurnFee = bank.totalBurnFee + fee;
        }
        require(bank.token.transfer(sink, nativeAmount - fee), "Fail to transfer tokens.");

        emit BurnSuccess(y, unitAmount);
    }

}


