// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./Utils.sol";
import "./SuterBase.sol";


contract SuterERC20 is SuterBase {

    ERC20 token;

    constructor(address payable _suterAgency, address _token, address _transfer, address _burn, uint256 _epochBase, uint256 _epochLength, uint256 _unit) SuterBase(_suterAgency, _transfer, _burn, _epochBase, _epochLength, _unit) public {
        token = ERC20(_token);
    }

    function fund(Utils.G1Point memory y, uint256 unitAmount, bytes memory encGuess) public {
        fundBase(y, unitAmount, encGuess);

        uint256 nativeAmount = toNativeAmount(unitAmount);

        // In order for the following to succeed, `msg.sender` have to first approve `this` to spend the nativeAmount.
        require(token.transferFrom(msg.sender, address(this), nativeAmount), "Native 'transferFrom' failed.");
    }

    function burn(Utils.G1Point memory y, uint256 unitAmount, Utils.G1Point memory u, bytes memory proof, bytes memory encGuess) public payable {
        burnBase(y, unitAmount, u, proof, encGuess);

        uint256 nativeAmount = toNativeAmount(unitAmount);
        require(token.transfer(msg.sender, nativeAmount), "Native 'transfer' failed.");
    }
}


