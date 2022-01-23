// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./SuterETH.sol";
import "./SuterERC20.sol";

contract SuterNativeFactory {

    string symbol;
    address transfer;
    address burn;

    constructor(string memory _symbol, address _transfer, address _burn) {
        symbol = _symbol;
        transfer = _transfer;
        burn = _burn;
    }

    function nativeSymbol () public view returns (string memory) {
        return symbol;
    }

    function newSuterNative (address admin) public returns (address) {
        SuterETH suterETH = new SuterETH(transfer, burn);
        suterETH.setAdmin(admin);
        return address(suterETH);
    }

}

contract SuterERC20Factory {
    address transfer;
    address burn;

    constructor(address _transfer, address _burn) {
        transfer = _transfer;
        burn = _burn;
    }

    function newSuterERC20 (address admin, address _token) public returns (address) {
        SuterERC20 suterERC20 = new SuterERC20(_token, transfer, burn);
        suterERC20.setAdmin(admin);
        return address(suterERC20);
    }

}
