// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Utils.sol";
import "./SuterBase.sol";


contract SuterERC20 is SuterBase {


    function initializeSuterERC20(address _token, address _transfer, address _burn) public initializer {
        SuterBase.initializeBase(_transfer, _burn);
        bank.token = IERC20(_token);
    }

    function setERC20Token(address _token) public onlyOwner {
        bank.token = IERC20(_token);
    }

    function fund(Utils.G1Point memory y, uint256 unitAmount, bytes memory encGuess) public {
        fundBase(y, unitAmount, encGuess);

        uint256 nativeAmount = toNativeAmount(unitAmount);

        // In order for the following to succeed, `msg.sender` have to first approve `this` to spend the nativeAmount.
        require(bank.token.transferFrom(msg.sender, address(this), nativeAmount), "Native 'transferFrom' failed.");
    }

    function burn(Utils.G1Point memory y, uint256 unitAmount, Utils.G1Point memory u, bytes memory proof, bytes memory encGuess) public {
        uint256 nativeAmount = toNativeAmount(unitAmount);
        uint256 fee = nativeAmount * bank.BURN_FEE_MULTIPLIER / bank.BURN_FEE_DIVIDEND; 

        burnBase(y, unitAmount, u, proof, encGuess);

        if (fee > 0) {
            require(bank.token.transfer(bank.suterAgency, fee), "Fail to charge fee.");
            bank.totalBurnFee = bank.totalBurnFee + fee;
        }
        require(bank.token.transfer(msg.sender, nativeAmount - fee), "Fail to transfer tokens.");
    }
}


