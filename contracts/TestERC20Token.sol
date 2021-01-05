// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/presets/ERC20PresetMinterPauser.sol
// ERC20PresetMinterPauser is mintable with public function 'mint'. 
import "openzeppelin-solidity/contracts/presets/ERC20PresetMinterPauser.sol";

contract TestERC20Token is ERC20PresetMinterPauser {

    constructor() ERC20PresetMinterPauser("TestERC20Token", "TET") public {
        _setupDecimals(2);
    }

}
