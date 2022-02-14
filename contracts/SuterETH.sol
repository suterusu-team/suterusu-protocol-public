// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./Utils.sol";
import "./SuterBase.sol";

contract SuterETH is SuterBase {

    constructor (address _transfer, address _burn) SuterBase(_transfer, _burn) {
    }

    function fund(bytes32[2] calldata y, uint256 unitAmount, bytes calldata encGuess) override external payable {
        uint256 mUnitAmount = toUnitAmount(msg.value);
        require(unitAmount == mUnitAmount, "Specified fund amount is differnet from the paid amount.");

        SuterBase.fundBase(y, unitAmount, encGuess);

        emit FundSuccess(y, unitAmount);
    }

    function burn(bytes32[2] calldata y, uint256 unitAmount, bytes32[2] calldata u, bytes calldata proof, bytes calldata encGuess) override external {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * bank.BURN_FEE_MULTIPLIER / bank.BURN_FEE_DIVIDEND; 

        SuterBase.burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            bank.agency.transfer(fee);
            bank.totalBurnFee = bank.totalBurnFee + fee;
        }
        payable(tx.origin).transfer(nativeAmount-fee);

        emit BurnSuccess(y, unitAmount);
    }

    function burnTo(address sink, bytes32[2] calldata y, uint256 unitAmount, bytes32[2] calldata u, bytes calldata proof, bytes calldata encGuess) override external {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * bank.BURN_FEE_MULTIPLIER / bank.BURN_FEE_DIVIDEND; 

        SuterBase.burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            bank.agency.transfer(fee);
            bank.totalBurnFee = bank.totalBurnFee + fee;
        }
        payable(sink).transfer(nativeAmount-fee);

        emit BurnSuccess(y, unitAmount);

    }

}


