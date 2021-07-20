// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./Utils.sol";
import "./SuterBase.sol";

contract SuterETH is SuterBase {

    function initializeSuterETH(address _transfer, address _burn) public initializer {
        SuterBase.initializeBase(_transfer, _burn);
    }

    function fund(Utils.G1Point memory y, uint256 unitAmount, bytes memory encGuess) public payable {
        uint256 mUnitAmount = toUnitAmount(msg.value);
        require(unitAmount == mUnitAmount, "Specified fund amount is differnet from the paid amount.");

        fundBase(y, unitAmount, encGuess);
    }

    function burn(Utils.G1Point memory y, uint256 unitAmount, Utils.G1Point memory u, bytes memory proof, bytes memory encGuess) public {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * bank.BURN_FEE_MULTIPLIER / bank.BURN_FEE_DIVIDEND; 

        burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            bank.suterAgency.transfer(fee);
            bank.totalBurnFee = bank.totalBurnFee + fee;
        }
        payable(msg.sender).transfer(nativeAmount-fee);
    }

}


