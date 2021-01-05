// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./Utils.sol";
import "./SuterBase.sol";

contract SuterETH is SuterBase {

    constructor(address payable _suterAgency, Utils.G1Point memory _suterAgencyPublicKey, address _transfer, address _burn, uint256 _epochBase, uint256 _epochLength, uint256 _unit) SuterBase(_suterAgency, _suterAgencyPublicKey, _transfer, _burn, _epochBase, _epochLength, _unit) public {
    }

    function fund(Utils.G1Point memory y, uint256 unitAmount, bytes memory encGuess) public payable {
        uint256 mUnitAmount = toUnitAmount(msg.value);
        require(unitAmount == mUnitAmount, "Specified fund amount is differnet from the paid amount.");

        fundBase(y, unitAmount, encGuess);
    }

    function burn(Utils.G1Point memory y, uint256 unitAmount, Utils.G1Point memory u, bytes memory proof, bytes memory encGuess) public payable {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * BURN_FEE_MULTIPLIER / BURN_FEE_DIVIDEND; 

        burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            suterAgency.transfer(fee);
        }
        msg.sender.transfer(nativeAmount-fee);
    }
}


